export const runtime = 'nodejs'

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { WebsiteActions } from "@/components/admin/website-actions"
import { CategoryManager } from "@/components/admin/category-manager"
import { FriendLinkManager } from "@/components/admin/friend-link-manager"
import { AdminWebsiteCreator } from "@/components/admin/website-creator"
import { AdminBulkImport } from "@/components/admin/bulk-import"
import { Metadata } from "next"
import { Prisma } from "@prisma/client"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Admin')
  return {
    title: `${t('title')} - NavHub`,
  }
}

type AdminWebsite = Prisma.WebsiteGetPayload<{
  include: { category: true, submittedBy: true }
}>

async function WebsiteTable({ websites }: { websites: AdminWebsite[] }) {
  const t = await getTranslations('Admin')
  const tCategories = await getTranslations('Categories')

  // Helper to get category name with translation
  function getCategoryName(category: { slug: string; name: string }): string {
    const translated = tCategories(category.slug)
    return translated === category.slug ? category.name : translated
  }

  return (
    <div className="border-2 border-border rounded-none overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-border hover:bg-transparent">
              <TableHead className="font-mono uppercase tracking-widest text-xs">{t('table.title')}</TableHead>
              <TableHead className="font-mono uppercase tracking-widest text-xs">{t('table.url')}</TableHead>
              <TableHead className="font-mono uppercase tracking-widest text-xs">{t('table.category')}</TableHead>
              <TableHead className="font-mono uppercase tracking-widest text-xs">{t('table.submittedBy')}</TableHead>
              <TableHead className="font-mono uppercase tracking-widest text-xs">{t('table.status')}</TableHead>
              <TableHead className="text-right font-mono uppercase tracking-widest text-xs">{t('table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {websites.map((website) => (
              <TableRow key={website.id} className="border-b border-border hover:bg-muted">
                <TableCell className="font-bold font-mono">{website.title}</TableCell>
                <TableCell className="max-w-[200px] truncate font-mono text-xs text-muted-foreground" title={website.url}>
                  {website.url}
                </TableCell>
                <TableCell>{getCategoryName(website.category)}</TableCell>
                <TableCell className="font-mono text-xs">{website.submittedBy?.name || t('table.unknown')}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      website.status === 'APPROVED' ? 'default' :
                      website.status === 'PENDING' ? 'secondary' : 'destructive'
                    }
                    className="font-mono"
                  >
                    {t(`status.${website.status}`)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <WebsiteActions websiteId={website.id} status={website.status} />
                </TableCell>
              </TableRow>
            ))}
            {websites.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground font-mono">
                  <span className="text-accent">{'//'}</span> {t('table.empty')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
  )
}

export default async function AdminPage() {
  const session = await auth()

  if (session?.user?.role !== 'ADMIN') {
    redirect('/')
  }

  const t = await getTranslations('Admin')

  const [pendingWebsites, allWebsites, categories, friendLinks] = await Promise.all([
    prisma.website.findMany({
      where: { status: 'PENDING' },
      include: { category: true, submittedBy: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.website.findMany({
      include: { category: true, submittedBy: true },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit for now
    }),
    prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { websites: true }
        }
      }
    }),
    prisma.friendLink.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between pb-4 border-b-2 border-border">
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
            <span className="text-accent">{'//'}</span> admin.console
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight font-mono">
            <span className="text-muted-foreground">$</span> {t('title')}
          </h1>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            {t('tabs.pendingCount', { count: pendingWebsites.length })}
          </TabsTrigger>
          <TabsTrigger value="all">{t('tabs.all')}</TabsTrigger>
          <TabsTrigger value="categories">{t('tabs.categories')}</TabsTrigger>
          <TabsTrigger value="friendLinks">{t('tabs.friendLinks')}</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4">
          <WebsiteTable websites={pendingWebsites} />
        </TabsContent>
        <TabsContent value="all" className="space-y-4">
          <div className="flex justify-end gap-2">
            <AdminBulkImport
              categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
            />
            <AdminWebsiteCreator
              categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
            />
          </div>
          <WebsiteTable websites={allWebsites} />
        </TabsContent>
        <TabsContent value="categories" className="space-y-4">
          <CategoryManager initialCategories={categories} />
        </TabsContent>
        <TabsContent value="friendLinks" className="space-y-4">
          <FriendLinkManager initialLinks={friendLinks} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
