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
      <div className="text-center py-20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-500/20 flex items-center justify-center">
          <span className="text-3xl">🔍</span>
        </div>
        <p className="text-lg text-slate-500 dark:text-slate-400">{t('notFound')}</p>
        <p className="text-sm text-slate-400 dark:text-slate-600 mt-2">尝试其他关键词或分类</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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

      {/* Loading indicator and intersection observer target */}
      <div
        ref={loadMoreRef}
        className="flex justify-center items-center py-8"
      >
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">{t('loading') || '加载中...'}</span>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-red-500">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadMore}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t('retry') || '重试'}
            </Button>
          </div>
        )}

        {!hasMore && !isLoading && websites.length > 0 && (
          <p className="text-sm text-slate-400">
            {t('noMore') || '没有更多内容了'}
          </p>
        )}
      </div>
    </div>
  )
}
