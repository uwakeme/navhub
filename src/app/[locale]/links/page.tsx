export const runtime = 'nodejs'

import { prisma, executeWithRetry } from "@/lib/prisma"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { FriendLinkCard, type FriendLink } from "@/components/friend-link-card"
import * as Icons from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('FriendLinks')
  return {
    title: `${t('title')} - NavHub`,
    description: t('description'),
  }
}

export default async function FriendLinksPage() {
  const t = await getTranslations('FriendLinks')

  let links: FriendLink[] = []
  let error: string | null = null

  try {
    links = await executeWithRetry(async () => {
      return await prisma.friendLink.findMany({
        where: { isActive: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      })
    })
  } catch (e) {
    console.error('Failed to load friend links:', e)
    error = '加载友链失败，请稍后重试'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between pb-4 border-b-2 border-border">
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
            <span className="text-accent">{'//'}</span> friends.roll
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight font-mono flex items-center gap-3">
            <span className="inline-flex w-9 h-9 border-2 border-foreground bg-foreground text-background items-center justify-center">
              <Icons.Link2 className="h-4 w-4 text-accent" />
            </span>
            {t('title')}
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            <span className="text-accent">→</span> {t('found', { count: links.length })}
          </p>
        </div>
      </div>

      {/* Intro / How to apply */}
      <div className="border-2 border-border bg-foreground text-background p-5 font-mono text-xs leading-relaxed">
        <div className="flex items-start gap-3">
          <span className="text-accent text-base shrink-0">{'$'}</span>
          <div className="space-y-2">
            <p className="uppercase tracking-widest text-accent">{'// '}{t('aboutTitle')}</p>
            <p className="opacity-90">{t('aboutBody')}</p>
          </div>
        </div>
      </div>

      {/* Error */}
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

      {/* Empty state */}
      {!error && links.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-border">
          <div className="w-16 h-16 mx-auto mb-4 border-2 border-foreground bg-foreground text-background flex items-center justify-center">
            <Icons.Link2 className="h-7 w-7 text-accent" />
          </div>
          <p className="text-lg font-bold uppercase tracking-widest font-mono">{t('empty')}</p>
          <p className="text-sm text-muted-foreground mt-2 font-mono">{'// '}{t('emptyHint')}</p>
        </div>
      )}

      {/* Grid */}
      {!error && links.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {links.map((link, index) => (
            <FriendLinkCard key={link.id} link={link} index={index} />
          ))}
        </div>
      )}

      {/* Footer */}
      {!error && links.length > 0 && (
        <div className="pt-6 border-t border-border text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="text-accent">{'//'}</span> {t('footerNote')}
          </p>
        </div>
      )}
    </div>
  )
}