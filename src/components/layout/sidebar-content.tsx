'use client'

import { Link } from "@/i18n/routing"
import * as Icons from "lucide-react"
import { LucideIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Category, getIcon } from "@/lib/categories"

interface SidebarContentProps {
  categories: Category[]
  currentCategory?: string
}

export function SidebarContent({ categories, currentCategory }: SidebarContentProps) {
  const t = useTranslations("Sidebar")
  const tCategories = useTranslations("Categories")

  // Helper to safely get category translation
  function getCategoryName(slug: string, defaultName: string): string {
    try {
      const translated = tCategories(slug)
      // If translation returns the slug itself, it means no translation found
      return translated === slug ? defaultName : translated
    } catch {
      return defaultName
    }
  }

  return (
    <div className="pb-12 w-64 border-r border-border h-[calc(100vh-4rem)] hidden md:block overflow-y-auto bg-background">
      <div className="space-y-6 py-4">
        {/* Categories Section */}
        <div className="px-3 py-2">
          <h2 className="mb-3 px-4 text-xs font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
            <span className="text-accent">{'//'}</span>
            {t('categories')}
          </h2>
          <div className="space-y-px">
            <Link
              href="/"
              className={cn(
                "flex items-center px-4 py-2.5 text-sm font-medium transition-colors border-l-2 group",
                !currentCategory
                  ? "bg-foreground text-background border-l-accent"
                  : "text-foreground hover:bg-muted border-l-transparent hover:border-l-accent hover:text-accent"
              )}
            >
              <span className="mr-3 font-mono text-xs opacity-70">
                {currentCategory ? "  " : "▸"}
              </span>
              <Icons.LayoutGrid className="mr-2 h-4 w-4" />
              {t('all')}
            </Link>
            {categories.map((category) => {
              const Icon = getIcon(category.icon)
              const categoryName = getCategoryName(category.slug, category.name)
              const isActive = currentCategory === category.slug
              return (
                <Link
                  key={category.id}
                  href={`/?category=${category.slug}`}
                  className={cn(
                    "flex items-center px-4 py-2.5 text-sm font-medium transition-colors border-l-2 group",
                    isActive
                      ? "bg-foreground text-background border-l-accent"
                      : "text-foreground hover:bg-muted border-l-transparent hover:border-l-accent hover:text-accent"
                  )}
                >
                  <span className="mr-3 font-mono text-xs opacity-70">
                    {isActive ? "▸" : "  "}
                  </span>
                  <Icon className="mr-2 h-4 w-4" />
                  <span className="truncate">{categoryName}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="px-3 py-2">
          <h2 className="mb-3 px-4 text-xs font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-2">
            <span className="text-accent">{'//'}</span>
            {t('quickLinks') || '快速链接'}
          </h2>
          <div className="space-y-px">
            <Link
              href="/submit"
              className="flex items-center px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted hover:text-accent transition-colors border-l-2 border-l-transparent hover:border-l-accent group"
            >
              <span className="mr-3 font-mono text-xs opacity-70">+</span>
              <Icons.Plus className="mr-2 h-4 w-4" />
              {t('submit') || '提交网站'}
            </Link>
            <Link
              href="/favorites"
              className="flex items-center px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted hover:text-accent transition-colors border-l-2 border-l-transparent hover:border-l-accent group"
            >
              <span className="mr-3 font-mono text-xs opacity-70">*</span>
              <Icons.Heart className="mr-2 h-4 w-4" />
              {t('favorites') || '我的收藏'}
            </Link>
            <Link
              href="/links"
              className="flex items-center px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted hover:text-accent transition-colors border-l-2 border-l-transparent hover:border-l-accent group"
            >
              <span className="mr-3 font-mono text-xs opacity-70">{`>>`}</span>
              <Icons.Link2 className="mr-2 h-4 w-4" />
              {t('friendLinks') || '友情链接'}
            </Link>
          </div>
        </div>

        {/* Footer status */}
        <div className="px-7 pt-4">
          <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
            {'v1.0.0 / build_mono'}
          </div>
        </div>
      </div>
    </div>
  )
}
