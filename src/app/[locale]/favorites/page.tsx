export const runtime = 'nodejs'

import { auth } from "@/lib/auth"
import { prisma, executeWithRetry } from "@/lib/prisma"
import { WebsiteCard } from "@/components/website-card"
import { redirect } from "next/navigation"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Heart } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Favorites')
  return {
    title: `${t('title')} - NavHub`,
  }
}

export default async function FavoritesPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/favorites')
  }

  const t = await getTranslations('Favorites')

  type FavoriteWithWebsite = Awaited<ReturnType<typeof prisma.favorite.findMany<{
    where: { userId: string }
    include: {
      website: {
        include: { category: true }
      }
    }
  }>>>[number]

  let favorites: FavoriteWithWebsite[] = []
  let error: string | null = null

  try {
    favorites = await executeWithRetry(async () => {
      return await prisma.favorite.findMany({
        where: { userId: session.user.id },
        include: {
          website: {
            include: {
              category: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    })
  } catch (e) {
    console.error('Failed to load favorites:', e)
    error = '加载收藏失败，请稍后重试'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700/30">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
              <Heart className="h-5 w-5 text-rose-500 dark:text-rose-400" />
            </div>
            {t('title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            共 {favorites.length} 个收藏
          </p>
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
      {!error && favorites.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
            <Heart className="h-8 w-8 text-rose-500 dark:text-rose-400" />
          </div>
          <p className="text-lg text-slate-500 dark:text-slate-400 mb-2">{t('empty')}</p>
          <p className="text-sm text-slate-400 dark:text-slate-600">浏览网站时点击心形图标添加收藏</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
          {favorites.map((fav, index) => (
            <WebsiteCard 
              key={fav.website.id} 
              website={fav.website} 
              isFavorited={true}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  )
}
