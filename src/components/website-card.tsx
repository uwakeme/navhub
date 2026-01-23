'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Heart } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { Website } from "@/generated/client"
import Image from "next/image"

interface WebsiteCardProps {
  website: Website
  isFavorited?: boolean
}

export function WebsiteCard({ website, isFavorited: initialFavorited = false }: WebsiteCardProps) {
  const { data: session } = useSession()
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [isLoading, setIsLoading] = useState(false)

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      toast.error("Please login to favorite websites")
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
    } catch (error) {
      // Revert on error
      setIsFavorited(!isFavorited)
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow group">
      <CardHeader className="flex-row gap-4 items-start space-y-0 pb-2">
        <div className="w-10 h-10 rounded-lg bg-muted p-1 shrink-0 overflow-hidden">
          {website.favicon ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={website.favicon} 
              alt={website.title}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = `https://www.google.com/s2/favicons?domain=${new URL(website.url).hostname}&sz=64`
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
          {website.description}
        </p>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start text-muted-foreground group-hover:text-primary transition-colors"
          asChild
        >
          <a href={website.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Visit
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
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
