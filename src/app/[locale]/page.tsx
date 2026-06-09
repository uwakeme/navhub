export const runtime = 'nodejs'

import { auth } from "@/lib/auth"
import { prisma, executeWithRetry } from "@/lib/prisma"
import { Metadata } from "next"
import { Prisma } from "@prisma/client"
import { getTranslations } from "next-intl/server"
import { InfiniteWebsiteList } from "@/components/infinite-website-list"

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

const INITIAL_LIMIT = 24

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
  let totalCount = 0
  let error: string | null = null

  try {
    const [websitesData, countData] = await Promise.all([
      executeWithRetry(async () => {
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
          take: INITIAL_LIMIT,
        })
      }),
      executeWithRetry(async () => {
        return await prisma.website.count({ where })
      })
    ])
    websites = websitesData
    totalCount = countData
  } catch (e) {
    console.error('Failed to load websites:', e)
    error = '数据库连接失败，请稍后重试'
  }

  // Fetch user favorites
  const favoriteIds: string[] = []
  if (session?.user?.id) {
    try {
      const favorites = await executeWithRetry(async () => {
        return await prisma.favorite.findMany({
          where: { userId: session.user.id },
          select: { websiteId: true }
        })
      })
      favorites.forEach(f => favoriteIds.push(f.websiteId))
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
      <div className="flex items-end justify-between pb-4 border-b-2 border-border">
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
            <span className="text-accent">{'//'}</span> {categorySlug ? 'filter' : 'browse'}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight font-mono">
            {categoryDisplayName ? (
              <span className="flex items-center gap-2">
                <span className="text-accent">▸</span>
                {categoryDisplayName}
              </span>
            ) : q ? (
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground">grep:</span>
                <span className="text-accent">{`"${q}"`}</span>
              </span>
            ) : (
              <span className="gradient-text">{t('discover')}</span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            <span className="text-accent">{'→'}</span> {t('found', {count: totalCount})}
          </p>
        </div>

        {/* Stats or actions could go here */}
        <div className="hidden sm:flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-accent animate-pulse" />
            <span>online</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="border-2 border-destructive bg-destructive/10 p-4 text-center font-mono">
          <p className="text-destructive">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 border-2 border-destructive bg-background text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors text-xs uppercase tracking-widest font-mono"
          >
            [ reload ]
          </button>
        </div>
      )}

      {/* Content with Infinite Scroll */}
      {!error && (
        <InfiniteWebsiteList
          initialWebsites={websites}
          initialFavoriteIds={favoriteIds}
          searchQuery={q}
          categorySlug={categorySlug}
          locale={params.locale}
        />
      )}
    </div>
  )
}
