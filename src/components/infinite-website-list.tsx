'use client'

import { useEffect, useState, useCallback, useRef } from "react"
import { WebsiteCard } from "./website-card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

interface Website {
  id: string
  title: string
  url: string
  description: string | null
  favicon: string | null
  featured: boolean
  clicks: number
  createdAt: Date
  category: {
    id: string
    name: string
    slug: string
    description: string | null
    icon: string | null
    order: number
    createdAt: Date
    updatedAt: Date
  } | null
}

interface WebsiteListResponse {
  items: Website[]
  nextCursor: string | null
  hasMore: boolean
  favoriteIds: string[]
}

interface InfiniteWebsiteListProps {
  initialWebsites: Website[]
  initialFavoriteIds: string[]
  searchQuery?: string
  categorySlug?: string
  locale: string
}

export function InfiniteWebsiteList({
  initialWebsites,
  initialFavoriteIds,
  searchQuery,
  categorySlug,
  locale,
}: InfiniteWebsiteListProps) {
  const [websites, setWebsites] = useState<Website[]>(initialWebsites)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set(initialFavoriteIds))
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const t = useTranslations("Home")

  // Fetch more websites
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (cursor) params.set('cursor', cursor)
      if (searchQuery) params.set('q', searchQuery)
      if (categorySlug) params.set('category', categorySlug)

      const response = await fetch(`/api/websites/list?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to load more websites')
      }

      const data: WebsiteListResponse = await response.json()

      setWebsites(prev => [...prev, ...data.items])
      setCursor(data.nextCursor)
      setHasMore(data.hasMore)

      // Merge new favorite IDs
      setFavoriteIds(prev => {
        const newSet = new Set(prev)
        data.favoriteIds.forEach(id => newSet.add(id))
        return newSet
      })
    } catch (err) {
      console.error('Error loading more websites:', err)
      setError(t('loadMoreError') || '加载失败，请重试')
      toast.error(t('loadMoreError') || '加载失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }, [cursor, hasMore, isLoading, searchQuery, categorySlug, t])

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold: 0, rootMargin: '400px' }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [loadMore, hasMore, isLoading])

  // Reset when search or category changes
  useEffect(() => {
    setWebsites(initialWebsites)
    setFavoriteIds(new Set(initialFavoriteIds))
    setCursor(null)
    setHasMore(initialWebsites.length >= 24)
    setError(null)
  }, [searchQuery, categorySlug, initialWebsites, initialFavoriteIds])

  if (websites.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-border">
        <div className="w-16 h-16 mx-auto mb-4 border-2 border-foreground bg-foreground text-background flex items-center justify-center text-2xl font-bold">
          ?
        </div>
        <p className="text-lg font-bold uppercase tracking-widest font-mono">{t('notFound')}</p>
        <p className="text-sm text-muted-foreground mt-2 font-mono">{'// try a different keyword or category'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
        {websites.map((website, index) => (
          <WebsiteCard
            key={website.id}
            website={website}
            isFavorited={favoriteIds.has(website.id)}
            index={index}
          />
        ))}
      </div>

      {/* Loading indicator and intersection observer target */}
      <div
        ref={loadMoreRef}
        className="flex justify-center items-center py-8"
      >
        {isLoading && (
          <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground uppercase tracking-widest">
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
            <span>{t('loading') || 'loading...'}</span>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-destructive font-mono">{`// ${error}`}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMore}
              className="gap-2 font-mono uppercase tracking-widest"
            >
              <RefreshCw className="h-4 w-4" />
              {t('retry') || 'retry'}
            </Button>
          </div>
        )}

        {!hasMore && !isLoading && websites.length > 0 && (
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <span className="text-accent">{'//'}</span>
            {t('noMore') || 'end of feed'}
          </div>
        )}
      </div>
    </div>
  )
}
