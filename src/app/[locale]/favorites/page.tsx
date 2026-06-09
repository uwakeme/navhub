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
      <div className="flex items-end justify-between pb-4 border-b-2 border-border">
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
            <span className="text-accent">{'//'}</span> user.favorites
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight font-mono flex items-center gap-3">
            <span className="inline-flex w-9 h-9 border-2 border-foreground bg-foreground text-background items-center justify-center">
              <Heart className="h-4 w-4 fill-accent text-accent" />
            </span>
            {t('title')}
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            <span className="text-accent">→</span> 共 {favorites.length} 个收藏
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="border-2 border-destructive bg-destructive/10 p-4 text-center font-mono">
          <p className="text-destructive">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 border-2 border-destructive bg-background text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors text-xs uppercase tracking-widest"
          >
            [ reload ]
          </button>
        </div>
      )}

      {/* Content */}
      {!error && favorites.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border">
          <div className="w-16 h-16 mx-auto mb-4 border-2 border-foreground bg-foreground text-background flex items-center justify-center">
            <Heart className="h-7 w-7 fill-accent text-accent" />
          </div>
          <p className="text-lg font-bold uppercase tracking-widest font-mono">{t('empty')}</p>
          <p className="text-sm text-muted-foreground mt-2 font-mono">{'// 点击心形图标添加收藏'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
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
