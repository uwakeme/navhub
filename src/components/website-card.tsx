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
import { cn } from "@/lib/utils"

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

  return (
    <Card
      className={cn(
        "group relative flex flex-col h-full rounded-none border-2 border-border bg-background",
        "hover:border-accent hover:bg-muted transition-colors duration-150",
        "shadow-none"
      )}
    >
      {/* Top accent line — appears on hover */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />

      <CardHeader className="flex-row gap-4 items-start space-y-0 pb-3 relative z-10 pointer-events-none px-5 pt-5">
        <div
          className="w-12 h-12 p-0.5 shrink-0 overflow-hidden border-2 border-foreground bg-foreground transition-transform duration-150 group-hover:scale-105"
        >
          <div className="w-full h-full overflow-hidden bg-background flex items-center justify-center">
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
                    fallback.className = 'w-full h-full flex items-center justify-center font-bold text-lg text-foreground font-mono'
                    fallback.textContent = website.title[0]?.toUpperCase() || '?'
                    parent.appendChild(fallback)
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-lg text-foreground font-mono">
                {website.title[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle
            className="text-base font-bold truncate text-foreground group-hover:text-accent transition-colors"
            title={website.title}
          >
            {website.title}
          </CardTitle>
          <CardDescription className="text-xs truncate font-mono mt-1 text-muted-foreground flex items-center gap-1">
            <span className="text-accent">▸</span>
            {new URL(website.url).hostname.replace(/^www\./, '')}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1 relative z-10 pointer-events-none px-5">
        <p className="text-sm line-clamp-2 leading-relaxed text-muted-foreground font-mono">
          {website.description || "// no description"}
        </p>
        {website.category && (
          <Badge
            variant="secondary"
            className="mt-3 text-[10px] border-accent text-accent bg-background hover:bg-accent hover:text-accent-foreground font-mono tracking-widest"
          >
            {(() => {
              const translated = tCategories(website.category!.slug)
              return translated === website.category!.slug
                ? website.category!.name
                : translated
            })()}
          </Badge>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex justify-between items-center relative z-10 px-5 pb-5">
        <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground group-hover:text-accent transition-colors">
          <ExternalLink className="h-3 w-3" />
          <span>VISIT</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8 border border-border hover:border-accent hover:bg-accent hover:text-accent-foreground rounded-none pointer-events-auto"
          onClick={toggleFavorite}
          disabled={isLoading}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-all duration-150",
              isFavorited
                ? "fill-accent text-accent"
                : "text-muted-foreground group-hover:text-foreground"
            )}
          />
        </Button>
      </CardFooter>

      {/* Full card link */}
      <a
        href={website.url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-0 pointer-events-auto cursor-pointer"
        aria-label={`Visit ${website.title}`}
      />
    </Card>
  )
}
