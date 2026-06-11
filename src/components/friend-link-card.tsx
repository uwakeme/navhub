'use client'

import * as Icons from "lucide-react"
import { cn } from "@/lib/utils"

export interface FriendLink {
  id: string
  name: string
  url: string
  description: string | null
  favicon: string | null
  ownerName: string | null
  ownerUrl: string | null
  order: number
  isActive: boolean
  createdAt: Date | string
  updatedAt: Date | string
}

interface FriendLinkCardProps {
  link: FriendLink
  index?: number
}

function getDomain(url: string): string {
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function FriendLinkCard({ link, index }: FriendLinkCardProps) {
  const domain = getDomain(link.url)
  // Fallback favicon via Google's service (handles missing favicons gracefully)
  const faviconUrl = link.favicon || `https://www.google.com/s2/favicons?sz=64&domain=${domain}`

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative flex flex-col bg-background border-2 border-border",
        "p-5 transition-all duration-150 ease-out min-h-[180px]",
        "hover:border-accent hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_var(--accent)]",
        "focus-visible:outline-none focus-visible:border-accent focus-visible:shadow-[4px_4px_0_0_var(--accent)]"
      )}
      style={index !== undefined ? { animationDelay: `${index * 30}ms` } : undefined}
    >
      {/* Header: favicon + name */}
      <div className="flex items-start gap-3 mb-3">
        <div className="shrink-0 w-10 h-10 border-2 border-foreground bg-foreground flex items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={faviconUrl}
            alt={link.name}
            className="w-6 h-6 object-contain bg-background"
            onError={(e) => {
              const target = e.currentTarget
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) parent.innerHTML = `<span class="text-background font-mono font-bold text-sm">${link.name.charAt(0).toUpperCase()}</span>`
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-mono font-bold text-base text-foreground truncate group-hover:text-accent transition-colors">
            {link.name}
          </h3>
          <p className="font-mono text-[10px] text-muted-foreground truncate mt-0.5 uppercase tracking-widest">
            <span className="text-accent">▸</span> {domain}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="font-mono text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
        {link.description || <span className="opacity-50">{'// no description'}</span>}
      </p>

      {/* Footer: owner + visit */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground truncate">
          {link.ownerName ? (
            link.ownerUrl ? (
              <span className="hover:text-accent">
                <span className="text-accent">@</span> {link.ownerName}
              </span>
            ) : (
              <span><span className="text-accent">@</span> {link.ownerName}</span>
            )
          ) : (
            <span className="opacity-50">{'// anonymous'}</span>
          )}
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-foreground group-hover:text-accent transition-colors">
          <Icons.ExternalLink className="h-3 w-3" />
          <span>visit</span>
        </div>
      </div>
    </a>
  )
}