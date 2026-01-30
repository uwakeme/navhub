export const runtime = 'nodejs'

import { auth } from "@/lib/auth"
import { prisma, executeWithRetry } from "@/lib/prisma"
import { WebsiteCard } from "@/components/website-card"
import { Metadata } from "next"
import { Prisma } from "@prisma/client"
import { getTranslations } from "next-intl/server"

export const metadata: Metadata = {
  title: "NavHub - Discover Best Developer Tools",
}

interface PageProps {
  searchParams: Promise<{
    q?: string
    category?: string
  }>
  params: Promise<{
    locale: string
  }>
}

export default async function Home(props: PageProps) {
  const searchParams = await props.searchParams
  const params = await props.params
  const session = await auth()
  const q = searchParams.q
  const categorySlug = searchParams.category
  
  const t = await getTranslations({locale: params.locale, namespace: 'Home'})

  const where: Prisma.WebsiteWhereInput = {
    status: 'APPROVED',
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (categorySlug) {
    where.category = {
      slug: categorySlug
    }
  }

  type WebsiteWithCategory = Awaited<ReturnType<typeof prisma.website.findMany<{
    where: Prisma.WebsiteWhereInput
    orderBy: Prisma.WebsiteOrderByWithRelationInput[]
    include: { category: true }
    take: number
  }>>>[number]

  let websites: WebsiteWithCategory[] = []
  let error: string | null = null
  
  try {
    websites = await executeWithRetry(async () => {
      return await prisma.website.findMany({
        where,
        orderBy: [
          { featured: 'desc' },
          { clicks: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          category: true,
        },
        take: 100,
      })
    })
  } catch (e) {
    console.error('Failed to load websites:', e)
    error = '数据库连接失败，请稍后重试'
  }

  // Fetch user favorites
  const favoriteIds = new Set<string>()
  if (session?.user?.id) {
    try {
      const favorites = await executeWithRetry(async () => {
        return await prisma.favorite.findMany({
          where: { userId: session.user.id },
          select: { websiteId: true }
        })
      })
      favorites.forEach(f => favoriteIds.add(f.websiteId))
    } catch (e) {
      console.error('Failed to load favorites:', e)
    }
  }

  // Get current category info for title
  let currentCategory = null
  if (categorySlug) {
    try {
      currentCategory = await executeWithRetry(async () => {
        return await prisma.category.findUnique({
          where: { slug: categorySlug }
        })
      })
    } catch (e) {
      console.error('Failed to load category:', e)
    }
  }
  
  // Get category translation
  const tCategories = await getTranslations("Categories")
  const categoryDisplayName = currentCategory 
    ? (tCategories(currentCategory.slug) === currentCategory.slug 
        ? currentCategory.name 
        : tCategories(currentCategory.slug))
    : null

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700/30">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {categoryDisplayName ? (
              <span className="flex items-center gap-2">
                <span className="text-slate-400">/</span>
                {categoryDisplayName}
              </span>
            ) : q ? (
              t('searchResult', {query: q})
            ) : (
              <span className="gradient-text">{t('discover')}</span>
            )}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            {t('found', {count: websites.length})}
          </p>
        </div>
        
        {/* Stats or actions could go here */}
        <div className="hidden sm:flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>在线资源</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-300 rounded-md text-sm transition-colors"
          >
            刷新页面
          </button>
        </div>
      )}

      {/* Content */}
      {!error && websites.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-500/20 flex items-center justify-center">
            <span className="text-3xl">🔍</span>
          </div>
          <p className="text-lg text-slate-500 dark:text-slate-400">{t('notFound')}</p>
          <p className="text-sm text-slate-400 dark:text-slate-600 mt-2">尝试其他关键词或分类</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
          {websites.map((website, index) => (
            <WebsiteCard 
              key={website.id} 
              website={website} 
              isFavorited={favoriteIds.has(website.id)}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  )
}
