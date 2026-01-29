'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { Website } from "@prisma/client"
import { useTranslations } from "next-intl"

interface WebsiteCardProps {
  website: Website
  isFavorited?: boolean
}

export function WebsiteCard({ website, isFavorited: initialFavorited = false }: WebsiteCardProps) {
  const { data: session } = useSession()
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations("Common")

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      toast.error(t("loginToFavorite"))
      return
    }

    setIsLoading(true)
    // Optimistic update
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
      // Revert on error
      setIsFavorited(!isFavorited)
      toast.error(t("genericError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow group relative">
      <CardHeader className="flex-row gap-4 items-start space-y-0 pb-2">
        <div className="w-10 h-10 rounded-lg bg-muted p-1 shrink-0 overflow-hidden">
          {website.favicon ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={website.favicon} 
              alt={website.title}
              className="w-full h-full object-contain"
              onError={(e) => {
                // If favicon fails to load, show first letter as fallback
                e.currentTarget.style.display = 'none'
                const parent = e.currentTarget.parentElement
                if (parent) {
                  const fallback = document.createElement('div')
                  fallback.className = 'w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm'
                  fallback.textContent = website.title[0]
                  parent.appendChild(fallback)
                }
              }}
            />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {website.title[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base font-semibold truncate" title={website.title}>
            {website.title}
          </CardTitle>
          <CardDescription className="text-xs truncate">
            {new URL(website.url).hostname}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {website.description || "暂无描述"}
        </p>
      </CardContent>
      {/* Overlay link for the whole card */}
      <a 
        href={website.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="absolute inset-0"
        aria-label={`Visit ${website.title}`}
      />
      <CardFooter className="pt-0 flex justify-end gap-2 relative z-10">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 hover:bg-background/80"
          onClick={toggleFavorite}
          disabled={isLoading}
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} 
          />
        </Button>
      </CardFooter>
    </Card>
  )
}
