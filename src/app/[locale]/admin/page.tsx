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
import { Metadata } from "next"
import { Prisma } from "@/generated/client"
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.title')}</TableHead>
            <TableHead>{t('table.url')}</TableHead>
            <TableHead>{t('table.category')}</TableHead>
            <TableHead>{t('table.submittedBy')}</TableHead>
            <TableHead>{t('table.status')}</TableHead>
            <TableHead className="text-right">{t('table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {websites.map((website) => (
            <TableRow key={website.id}>
              <TableCell className="font-medium">{website.title}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={website.url}>
                {website.url}
              </TableCell>
              <TableCell>{getCategoryName(website.category)}</TableCell>
              <TableCell>{website.submittedBy?.name || t('table.unknown')}</TableCell>
              <TableCell>
                <Badge variant={
                  website.status === 'APPROVED' ? 'default' : 
                  website.status === 'PENDING' ? 'secondary' : 'destructive'
                }>
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
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                {t('table.empty')}
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

  const [pendingWebsites, allWebsites, categories] = await Promise.all([
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
    })
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">{t('tabs.pendingCount', { count: pendingWebsites.length })}</TabsTrigger>
          <TabsTrigger value="all">{t('tabs.all')}</TabsTrigger>
          <TabsTrigger value="categories">{t('tabs.categories')}</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4">
          <WebsiteTable websites={pendingWebsites} />
        </TabsContent>
        <TabsContent value="all" className="space-y-4">
          <WebsiteTable websites={allWebsites} />
        </TabsContent>
        <TabsContent value="categories" className="space-y-4">
          <CategoryManager initialCategories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
