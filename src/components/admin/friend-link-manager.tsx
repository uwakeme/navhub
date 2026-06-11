'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Pencil, Trash, Plus, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

interface FriendLink {
  id: string
  name: string
  url: string
  description: string | null
  favicon: string | null
  ownerName: string | null
  ownerUrl: string | null
  order: number
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

interface FriendLinkManagerProps {
  initialLinks: FriendLink[]
}

export function FriendLinkManager({ initialLinks }: FriendLinkManagerProps) {
  const [links, setLinks] = useState<FriendLink[]>(initialLinks)
  const [isLoading, setIsLoading] = useState(false)
  const [editing, setEditing] = useState<FriendLink | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const t = useTranslations('Admin')
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    favicon: '',
    ownerName: '',
    ownerUrl: '',
    order: 0,
    isActive: true,
  })

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      description: '',
      favicon: '',
      ownerName: '',
      ownerUrl: '',
      order: 0,
      isActive: true,
    })
    setEditing(null)
  }

  const handleEdit = (link: FriendLink) => {
    setEditing(link)
    setFormData({
      name: link.name,
      url: link.url,
      description: link.description || '',
      favicon: link.favicon || '',
      ownerName: link.ownerName || '',
      ownerUrl: link.ownerUrl || '',
      order: link.order,
      isActive: link.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (editing) {
        const res = await fetch(`/api/admin/friendlinks/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (!res.ok) {
          throw new Error(await res.text())
        }
        toast.success(t('toast.friendLinkUpdated'))
      } else {
        const res = await fetch('/api/admin/friendlinks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (!res.ok) {
          throw new Error(await res.text())
        }
        toast.success(t('toast.friendLinkCreated'))
      }

      setIsDialogOpen(false)
      resetForm()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (link: FriendLink) => {
    if (!confirm(`Are you sure you want to delete "${link.name}"?`)) return

    try {
      const res = await fetch(`/api/admin/friendlinks/${link.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        throw new Error(await res.text())
      }
      toast.success(t('toast.friendLinkDeleted'))
      setLinks(prev => prev.filter(l => l.id !== link.id))
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.error'))
    }
  }

  const handleToggleActive = async (link: FriendLink) => {
    try {
      const res = await fetch(`/api/admin/friendlinks/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !link.isActive }),
      })
      if (!res.ok) throw new Error(await res.text())
      setLinks(prev => prev.map(l => l.id === link.id ? { ...l, isActive: !l.isActive } : l))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.error'))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleCreate}
              className="bg-foreground text-background border-2 border-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent font-mono uppercase tracking-widest text-xs"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('actions.createFriendLink')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-mono">
                <span className="text-accent">▸</span>{' '}
                {editing ? t('actions.edit') : t('actions.create')}{' '}
                {t('friendLinkForm.title')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fl-name" className="font-mono text-xs uppercase tracking-widest">
                  {t('friendLinkForm.name')}
                </Label>
                <Input
                  id="fl-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('friendLinkForm.namePlaceholder')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fl-url" className="font-mono text-xs uppercase tracking-widest">
                  {t('friendLinkForm.url')}
                </Label>
                <Input
                  id="fl-url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder={t('friendLinkForm.urlPlaceholder')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fl-desc" className="font-mono text-xs uppercase tracking-widest">
                  {t('friendLinkForm.description')}
                </Label>
                <Input
                  id="fl-desc"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('friendLinkForm.descriptionPlaceholder')}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="fl-owner" className="font-mono text-xs uppercase tracking-widest">
                    {t('friendLinkForm.ownerName')}
                  </Label>
                  <Input
                    id="fl-owner"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder={t('friendLinkForm.ownerNamePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fl-ownerUrl" className="font-mono text-xs uppercase tracking-widest">
                    {t('friendLinkForm.ownerUrl')}
                  </Label>
                  <Input
                    id="fl-ownerUrl"
                    value={formData.ownerUrl}
                    onChange={(e) => setFormData({ ...formData, ownerUrl: e.target.value })}
                    placeholder={t('friendLinkForm.ownerUrlPlaceholder')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fl-favicon" className="font-mono text-xs uppercase tracking-widest">
                  {t('friendLinkForm.favicon')}
                </Label>
                <Input
                  id="fl-favicon"
                  value={formData.favicon}
                  onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                  placeholder={t('friendLinkForm.faviconPlaceholder')}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="fl-order" className="font-mono text-xs uppercase tracking-widest">
                    {t('table.order')}
                  </Label>
                  <Input
                    id="fl-order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs uppercase tracking-widest">
                    {t('friendLinkForm.status')}
                  </Label>
                  <div className="flex items-center gap-2 h-10 px-3 border-2 border-border">
                    <Checkbox
                      id="fl-active"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked === true })}
                    />
                    <label htmlFor="fl-active" className="font-mono text-xs uppercase tracking-widest cursor-pointer">
                      {formData.isActive ? t('friendLinkForm.active') : t('friendLinkForm.inactive')}
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="font-mono uppercase tracking-widest text-xs"
                >
                  {t('categoryForm.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-foreground text-background border-2 border-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent font-mono uppercase tracking-widest text-xs"
                >
                  {t('categoryForm.save')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border-2 border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-border hover:bg-transparent">
              <TableHead className="font-mono uppercase tracking-widest text-xs">{t('table.order')}</TableHead>
              <TableHead className="font-mono uppercase tracking-widest text-xs">{t('friendLinkForm.name')}</TableHead>
              <TableHead className="font-mono uppercase tracking-widest text-xs">{t('friendLinkForm.url')}</TableHead>
              <TableHead className="font-mono uppercase tracking-widest text-xs">{t('friendLinkForm.ownerName')}</TableHead>
              <TableHead className="font-mono uppercase tracking-widest text-xs">{t('friendLinkForm.status')}</TableHead>
              <TableHead className="text-right font-mono uppercase tracking-widest text-xs">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => (
              <TableRow key={link.id} className="border-b border-border hover:bg-muted">
                <TableCell className="font-mono">{link.order}</TableCell>
                <TableCell className="font-bold font-mono">{link.name}</TableCell>
                <TableCell className="max-w-[220px] truncate font-mono text-xs text-muted-foreground" title={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent inline-flex items-center gap-1"
                  >
                    {link.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {link.ownerName ? (
                    link.ownerUrl ? (
                      <a href={link.ownerUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                        @{link.ownerName}
                      </a>
                    ) : (
                      `@${link.ownerName}`
                    )
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={link.isActive}
                      onCheckedChange={() => handleToggleActive(link)}
                    />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {link.isActive ? t('friendLinkForm.active') : t('friendLinkForm.inactive')}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-none"
                      onClick={() => handleEdit(link)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-none"
                      onClick={() => handleDelete(link)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {links.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground font-mono">
                  <span className="text-accent">{'//'}</span> {t('table.emptyFriendLinks')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}