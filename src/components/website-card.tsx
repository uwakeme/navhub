'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ExternalLink } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Category } from "@prisma/client"

interface WebsiteWithCategory {
  id: string
  title: string
  url: string
  description: string | null
  favicon: string | null
  category: Category | null
}

interface WebsiteCardProps {
  website: WebsiteWithCategory
  isFavorited?: boolean
  index?: number
}

export function WebsiteCard({ website, isFavorited: initialFavorited = false, index = 0 }: WebsiteCardProps) {
  const { data: session } = useSession()
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [isLoading, setIsLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const t = useTranslations("Common")
  const tCategories = useTranslations("Categories")

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      toast.error(t("loginToFavorite"))
      return
    }

    setIsLoading(true)
    setIsFavorited(!isFavorited)

    try {
      const res = await fetch('/api/favorites', {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteId: website.id }),
      })

      if (!res.ok) {
        throw new Error('Failed to update favorite')
      }
    } catch {
      setIsFavorited(!isFavorited)
      toast.error(t("genericError"))
    } finally {
      setIsLoading(false)
    }
  }

  // Use CSS classes with dark: prefix instead of JS conditionals to avoid hydration mismatch
  return (
    <div 
      className="animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Card
        className="group relative flex flex-col h-full border transition-all duration-300 overflow-hidden
          bg-white border-slate-200 hover:border-slate-400
          dark:bg-[#1e293b] dark:border-slate-700/50 dark:hover:border-slate-500"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top solid line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] bg-slate-500 transform origin-left transition-transform duration-300"
          style={{ transform: isHovered ? 'scaleX(1)' : 'scaleX(0)' }}
        />

        <CardHeader className="flex-row gap-4 items-start space-y-0 pb-3 relative z-10 pointer-events-none">
          <div
            className="w-12 h-12 rounded-xl p-0.5 shrink-0 overflow-hidden border transition-transform duration-200 group-hover:scale-105
              bg-white border-slate-200 shadow-sm
              dark:bg-white dark:border-slate-600"
          >
            <div className="w-full h-full rounded-[10px] overflow-hidden bg-white">
              {website.favicon ? (
                <img
                  src={website.favicon}
                  alt={website.title}
                  className="w-full h-full object-contain p-1"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const parent = e.currentTarget.parentElement
                    if (parent) {
                      const fallback = document.createElement('div')
                      fallback.className = 'w-full h-full flex items-center justify-center font-bold text-lg text-slate-600'
                      fallback.textContent = website.title[0]?.toUpperCase() || '?'
                      parent.appendChild(fallback)
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-lg text-slate-600">
                  {website.title[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold truncate transition-colors group-hover:text-slate-600 text-slate-900 dark:text-slate-100" title={website.title}>
              {website.title}
            </CardTitle>
            <CardDescription className="text-xs truncate font-mono mt-0.5 text-slate-400 dark:text-slate-500">
              {new URL(website.url).hostname.replace(/^www\./, '')}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 relative z-10 pointer-events-none">
          <p className="text-sm line-clamp-2 leading-relaxed text-slate-600 dark:text-slate-400">
            {website.description || "暂无描述"}
          </p>
          {website.category && (
            <Badge
              variant="secondary"
              className="mt-3 text-xs bg-slate-100 text-slate-600 border-slate-200
                dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600"
            >
              {(() => {
                const translated = tCategories(website.category!.slug)
                return translated === website.category!.slug ? website.category!.name : translated
              })()}
            </Badge>
          )}
        </CardContent>
        
        <CardFooter className="pt-0 flex justify-between items-center relative z-10 pointer-events-none">
          <div
            className={`flex items-center gap-1 text-xs transition-all duration-200 text-slate-400 dark:text-slate-500 pointer-events-none ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
            }`}
          >
            <ExternalLink className="h-3 w-3" />
            <span>访问</span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 transition-colors rounded-full pointer-events-auto
              hover:bg-slate-100 hover:text-slate-600
              dark:hover:bg-slate-500/10 dark:hover:text-slate-400"
            onClick={toggleFavorite}
            disabled={isLoading}
          >
            <Heart 
              className={`h-4 w-4 transition-all duration-300 ${
                isFavorited 
                  ? "fill-rose-500 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" 
                  : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
              }`} 
            />
          </Button>
        </CardFooter>
        
        {/* Full card link - covers everything */}
        <a 
          href={website.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="absolute inset-0 z-0 pointer-events-auto cursor-pointer"
          aria-label={`Visit ${website.title}`}
        />
      </Card>
    </div>
  )
}
