'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

interface Category {
  id: string
  name: string
  slug: string
}

interface AdminWebsiteCreatorProps {
  categories: Category[]
}

export function AdminWebsiteCreator({ categories }: AdminWebsiteCreatorProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    categoryId: '',
    featured: false,
  })
  const t = useTranslations('Admin')
  const tSubmit = useTranslations('Submit.form')
  const router = useRouter()

  const reset = () => {
    setFormData({ title: '', url: '', description: '', categoryId: '', featured: false })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.categoryId) {
      toast.error(tSubmit('categoryPlaceholder') + ' (required)')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        throw new Error(await res.text())
      }
      toast.success(t('toast.websiteCreated'))
      setOpen(false)
      reset()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('toast.error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
      <DialogTrigger asChild>
        <Button className="bg-foreground text-background border-2 border-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent font-mono uppercase tracking-widest text-xs">
          <Plus className="mr-2 h-4 w-4" />
          {t('actions.createWebsite')}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background border-2 border-foreground">
        <DialogHeader>
          <DialogTitle className="font-mono">
            <span className="text-accent">▸</span> {t('actions.createWebsite')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aw-title" className="font-mono text-xs uppercase tracking-widest">
              {tSubmit('title')}
            </Label>
            <Input
              id="aw-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={tSubmit('titlePlaceholder')}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aw-url" className="font-mono text-xs uppercase tracking-widest">
              {tSubmit('url')}
            </Label>
            <Input
              id="aw-url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder={tSubmit('urlPlaceholder')}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aw-cat" className="font-mono text-xs uppercase tracking-widest">
              {tSubmit('category')}
            </Label>
            <Select
              value={formData.categoryId}
              onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
            >
              <SelectTrigger className="bg-background border-input w-full">
                <SelectValue placeholder={tSubmit('categoryPlaceholder')} />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="aw-desc" className="font-mono text-xs uppercase tracking-widest">
              {tSubmit('description')}
            </Label>
            <Textarea
              id="aw-desc"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={tSubmit('descriptionPlaceholder')}
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="aw-featured"
              checked={formData.featured}
              onCheckedChange={(c) => setFormData({ ...formData, featured: c === true })}
            />
            <Label htmlFor="aw-featured" className="font-mono text-xs uppercase tracking-widest cursor-pointer">
              featured (置顶 / 推荐)
            </Label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="font-mono uppercase tracking-widest text-xs"
            >
              {t('categoryForm.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-foreground text-background border-2 border-foreground hover:bg-accent hover:text-accent-foreground hover:border-accent font-mono uppercase tracking-widest text-xs"
            >
              {isLoading ? '...' : t('categoryForm.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}