'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Upload, FileUp, CheckCircle2, AlertCircle, Trash2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  parseBookmarksHTML,
  cleanTitle,
  normalizeUrl,
  type ParsedBookmark,
} from '@/lib/bookmarks'

interface Category {
  id: string
  name: string
  slug: string
}

interface AdminBulkImportProps {
  categories: Category[]
}

type ImportStatus = 'idle' | 'parsing' | 'checking' | 'ready' | 'submitting' | 'done'

interface PreviewRow {
  /** 唯一 key,用 url 的归一化 */
  key: string
  url: string
  title: string
  description: string
  categoryId: string
  featured: boolean
  /** 解析得到的文件夹路径(仅展示用) */
  folders: string[]
  /** 是否被选中要导入 */
  selected: boolean
  /** 是否已存在于数据库 */
  isExisting: boolean
  /** 数据库里已存在的记录(用于展示对比) */
  existing?: { id: string; title: string; status: string; categoryId: string }
}

interface ImportResult {
  created: number
  updated: number
  skipped: number
  total: number
}

export function AdminBulkImport({ categories }: AdminBulkImportProps) {
  const t = useTranslations('Admin.bulkImport')
  const tCommon = useTranslations('Admin')
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<ImportStatus>('idle')
  const [fileName, setFileName] = useState<string | null>(null)
  const [rows, setRows] = useState<PreviewRow[]>([])
  const [result, setResult] = useState<ImportResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const stats = useMemo(() => {
    const total = rows.length
    const selected = rows.filter((r) => r.selected).length
    const existing = rows.filter((r) => r.isExisting).length
    const newOnes = selected - rows.filter((r) => r.selected && r.isExisting).length
    return { total, selected, existing, newOnes }
  }, [rows])

  function reset() {
    setStatus('idle')
    setFileName(null)
    setRows([])
    setResult(null)
    setErrorMsg(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function closeAndReset() {
    setOpen(false)
    // 延迟清,避免动画期间内容闪
    setTimeout(reset, 200)
  }

  /**
   * 用户选完文件后的处理:解析 → 去重检查 → 进入 ready 状态
   */
  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.html') && !file.name.toLowerCase().endsWith('.htm')) {
      setErrorMsg(t('errors.notHtml'))
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(t('errors.tooBig'))
      return
    }
    setErrorMsg(null)
    setFileName(file.name)
    setStatus('parsing')
    setRows([])

    try {
      const html = await file.text()
      const { bookmarks, total, skipped } = parseBookmarksHTML(html)
      if (bookmarks.length === 0) {
        setErrorMsg(
          t('errors.noBookmarks', { total, skipped })
        )
        setStatus('idle')
        return
      }

      // 按归一化 url 去重(同一个书签文件里可能有重复)
      const dedupMap = new Map<string, ParsedBookmark>()
      for (const b of bookmarks) {
        const k = normalizeUrl(b.url)
        if (!dedupMap.has(k)) dedupMap.set(k, b)
      }
      const uniqueBookmarks = Array.from(dedupMap.values())

      const initialRows: PreviewRow[] = uniqueBookmarks.map((b) => ({
        key: normalizeUrl(b.url),
        url: b.url,
        title: cleanTitle(b.title),
        description: '',
        // 分类留空,强制管理员选
        categoryId: '',
        featured: false,
        folders: b.folders,
        selected: true,
        isExisting: false,
      }))

      setRows(initialRows)
      setStatus('checking')

      // 查重
      try {
        const res = await fetch('/api/admin/websites/bulk-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls: uniqueBookmarks.map((b) => b.url) }),
        })
        if (!res.ok) throw new Error(await res.text())
        const data: { existing: Array<{ id: string; url: string; title: string; status: string; categoryId: string }> } =
          await res.json()
        const existMap = new Map(data.existing.map((e) => [e.url, e]))
        setRows((prev) =>
          prev.map((r) => {
            const ex = existMap.get(r.url)
            if (ex) {
              return {
                ...r,
                isExisting: true,
                existing: ex,
                // 默认分类沿用原来的,管理员仍可改
                categoryId: r.categoryId || ex.categoryId,
              }
            }
            return r
          })
        )
      } catch (err) {
        console.error('bulk-check failed', err)
        // 查重失败不阻塞流程,继续
        toast.warning(t('toast.checkFailed'))
      }

      setStatus('ready')
      toast.success(
        t('toast.parsed', { count: uniqueBookmarks.length, skipped: bookmarks.length - uniqueBookmarks.length })
      )
    } catch (err) {
      console.error('parse failed', err)
      setErrorMsg(err instanceof Error ? err.message : tCommon('toast.error'))
      setStatus('idle')
    }
  }

  function updateRow(key: string, patch: Partial<PreviewRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key))
  }

  function toggleAll(checked: boolean) {
    setRows((prev) => prev.map((r) => ({ ...r, selected: checked })))
  }

  function setBulkCategory(categoryId: string) {
    if (!categoryId) return
    setRows((prev) =>
      prev.map((r) => (r.selected ? { ...r, categoryId } : r))
    )
  }

  function removeInvalidRows() {
    // 移除没选分类的(必填)
    setRows((prev) => prev.filter((r) => !r.selected || (r.selected && r.categoryId)))
  }

  async function handleSubmit() {
    const selected = rows.filter((r) => r.selected)
    if (selected.length === 0) {
      toast.error(t('toast.noneSelected'))
      return
    }
    const missing = selected.filter((r) => !r.categoryId)
    if (missing.length > 0) {
      toast.error(t('toast.missingCategory', { count: missing.length }))
      return
    }

    setStatus('submitting')
    try {
      const res = await fetch('/api/admin/websites/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: selected.map((r) => ({
            url: r.url,
            title: r.title,
            description: r.description || undefined,
            categoryId: r.categoryId,
            featured: r.featured,
          })),
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data: ImportResult = await res.json()
      setResult(data)
      setStatus('done')
      startTransition(() => router.refresh())
      toast.success(
        t('toast.importDone', { created: data.created, updated: data.updated })
      )
    } catch (err) {
      console.error(err)
      setStatus('ready')
      toast.error(err instanceof Error ? err.message : tCommon('toast.error'))
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) {
          setTimeout(reset, 200)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-2 border-foreground font-mono uppercase tracking-widest text-xs"
        >
          <Upload className="mr-2 h-4 w-4" />
          {t('trigger')}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background border-2 border-foreground max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-3 border-b border-border">
          <DialogTitle className="font-mono">
            <span className="text-accent">▸</span> {t('title')}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 pt-4 space-y-4">
          {/* File picker */}
          {status === 'idle' && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-border rounded-none p-10 text-center space-y-3 cursor-pointer hover:border-accent transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const file = e.dataTransfer.files?.[0]
                  if (file) handleFile(file)
                }}
              >
                <FileUp className="mx-auto h-10 w-10 text-muted-foreground" />
                <div className="font-mono text-sm">
                  {t('dropzone')}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {t('dropzoneHint')}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,.htm,text/html"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFile(file)
                  }}
                />
              </div>
              {errorMsg && (
                <div className="flex items-center gap-2 text-destructive font-mono text-xs">
                  <AlertCircle className="h-4 w-4" /> {errorMsg}
                </div>
              )}
            </div>
          )}

          {/* Parsing / checking spinner */}
          {(status === 'parsing' || status === 'checking') && (
            <div className="space-y-2 py-8 text-center font-mono text-sm">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              <div>{status === 'parsing' ? t('parsing') : t('checking')}</div>
              {fileName && (
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {fileName}
                </div>
              )}
            </div>
          )}

          {/* Ready: preview table */}
          {status === 'ready' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <Badge variant="secondary">
                  {t('stats.total', { count: stats.total })}
                </Badge>
                <Badge variant="default">
                  {t('stats.selected', { count: stats.selected })}
                </Badge>
                <Badge variant="outline">
                  {t('stats.existing', { count: stats.existing })}
                </Badge>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                  <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {t('bulkCategory')}
                  </Label>
                  <Select onValueChange={setBulkCategory}>
                    <SelectTrigger className="h-7 w-[140px] font-mono text-xs">
                      <SelectValue placeholder={t('bulkCategoryPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-2 border-border rounded-none overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-border hover:bg-transparent">
                      <TableHead className="w-[40px] font-mono text-[10px] uppercase tracking-widest">
                        <Checkbox
                          checked={rows.length > 0 && rows.every((r) => r.selected)}
                          onCheckedChange={(c) => toggleAll(c === true)}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead className="font-mono text-[10px] uppercase tracking-widest min-w-[180px]">
                        {t('col.title')}
                      </TableHead>
                      <TableHead className="font-mono text-[10px] uppercase tracking-widest min-w-[200px]">
                        {t('col.url')}
                      </TableHead>
                      <TableHead className="font-mono text-[10px] uppercase tracking-widest min-w-[140px]">
                        {t('col.category')}
                      </TableHead>
                      <TableHead className="font-mono text-[10px] uppercase tracking-widest w-[60px]">
                        ★
                      </TableHead>
                      <TableHead className="w-[40px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow
                        key={r.key}
                        className={
                          r.isExisting
                            ? 'border-b border-border bg-muted/30'
                            : 'border-b border-border'
                        }
                      >
                        <TableCell>
                          <Checkbox
                            checked={r.selected}
                            onCheckedChange={(c) => updateRow(r.key, { selected: c === true })}
                          />
                        </TableCell>
                        <TableCell className="space-y-1 py-2">
                          <Input
                            value={r.title}
                            onChange={(e) => updateRow(r.key, { title: e.target.value })}
                            className="h-7 font-mono text-xs"
                            disabled={!r.selected}
                          />
                          {r.folders.length > 0 && (
                            <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">
                              📁 {r.folders.join(' / ')}
                            </div>
                          )}
                          {r.isExisting && r.existing && (
                            <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-mono">
                              <AlertCircle className="h-3 w-3" />
                              {t('existingHint', { current: r.existing.title })}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-2">
                          <div
                            className="font-mono text-[10px] text-muted-foreground truncate max-w-[260px]"
                            title={r.url}
                          >
                            {r.url}
                          </div>
                          <Textarea
                            value={r.description}
                            onChange={(e) => updateRow(r.key, { description: e.target.value })}
                            placeholder={t('descPlaceholder')}
                            className="mt-1 h-7 min-h-7 font-mono text-[10px] resize-none"
                            rows={1}
                            disabled={!r.selected}
                          />
                        </TableCell>
                        <TableCell className="py-2">
                          <Select
                            value={r.categoryId}
                            onValueChange={(v) => updateRow(r.key, { categoryId: v })}
                            disabled={!r.selected}
                          >
                            <SelectTrigger className="h-7 font-mono text-xs">
                              <SelectValue placeholder={t('selectCategory')} />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          <Checkbox
                            checked={r.featured}
                            onCheckedChange={(c) => updateRow(r.key, { featured: c === true })}
                            disabled={!r.selected}
                          />
                        </TableCell>
                        <TableCell className="py-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRow(r.key)}
                            className="h-7 w-7"
                            aria-label="Remove"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground font-mono text-xs">
                          {t('empty')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Submitting */}
          {status === 'submitting' && (
            <div className="space-y-2 py-12 text-center font-mono text-sm">
              <RefreshCw className="mx-auto h-6 w-6 animate-spin" />
              <div>{t('submitting')}</div>
            </div>
          )}

          {/* Done */}
          {status === 'done' && result && (
            <div className="space-y-3 py-8 text-center font-mono text-sm">
              <CheckCircle2 className="mx-auto h-10 w-10 text-green-600 dark:text-green-400" />
              <div className="text-base font-bold">{t('doneTitle')}</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>{t('doneCreated', { count: result.created })}</div>
                <div>{t('doneUpdated', { count: result.updated })}</div>
                {result.skipped > 0 && <div>{t('doneSkipped', { count: result.skipped })}</div>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex justify-end gap-2 bg-muted/20">
          {status === 'ready' && (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={removeInvalidRows}
                className="font-mono text-xs"
                title={t('cleanupHint')}
              >
                {t('cleanup')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={reset}
                className="font-mono uppercase tracking-widest text-xs"
              >
                {t('reupload')}
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={stats.selected === 0}
                className="bg-foreground text-background border-2 border-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent font-mono uppercase tracking-widest text-xs"
              >
                {t('confirmImport', { count: stats.selected })}
              </Button>
            </>
          )}
          {status === 'done' && (
            <Button
              type="button"
              onClick={closeAndReset}
              className="font-mono uppercase tracking-widest text-xs"
            >
              {t('close')}
            </Button>
          )}
          {status === 'idle' && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="font-mono uppercase tracking-widest text-xs"
            >
              {tCommon('categoryForm.cancel')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
