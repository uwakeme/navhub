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
    <div className="pb-12 w-64 border-r border-slate-200 dark:border-slate-700/50 h-[calc(100vh-4rem)] hidden md:block overflow-y-auto bg-slate-50/80 dark:bg-[#0f172a]/50">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-3 px-4 text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            {t('categories')}
          </h2>
          <div className="space-y-0.5">
            <Link
               href="/"
                className={cn(
                  "flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 group",
                  !currentCategory
                    ? "bg-slate-100 dark:bg-slate-500/20 text-slate-900 dark:text-slate-100"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500/10 hover:text-slate-600 dark:hover:text-slate-300"
                )}
             >
                 <div className={cn(
                   "mr-3 p-1.5 rounded-md transition-colors",
                   !currentCategory
                     ? "bg-slate-200 dark:bg-slate-500/30"
                     : "bg-slate-100 dark:bg-slate-500/10 group-hover:bg-slate-200 dark:group-hover:bg-slate-500/20"
                 )}>
                   <Icons.LayoutGrid className={cn(
                     "h-4 w-4",
                     !currentCategory
                       ? "text-slate-700 dark:text-slate-200"
                       : "text-slate-500 dark:text-slate-400"
                   )} />
                </div>
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
                    "flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-slate-100 dark:bg-slate-500/20 text-slate-900 dark:text-slate-100"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500/10 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                >
                  <div className={cn(
                    "mr-3 p-1.5 rounded-md transition-colors",
                    isActive
                      ? "bg-slate-200 dark:bg-slate-500/30"
                      : "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-500/20"
                  )}>
                    <Icon className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-slate-700 dark:text-slate-200"
                        : "text-slate-500 dark:text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-400"
                    )} />
                  </div>
                  {categoryName}
                </Link>
              )
            })}
          </div>
        </div>
        
        {/* Quick Links Section */}
        <div className="px-3 py-2">
          <h2 className="mb-3 px-4 text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            {t('quickLinks') || '快速链接'}
          </h2>
          <div className="space-y-0.5">
            <Link
               href="/submit"
               className="flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-300 transition-all duration-200 group"
            >
               <div className="mr-3 p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-500/10 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/20 transition-colors">
                 <Icons.Plus className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
               </div>
               {t('submit') || '提交网站'}
            </Link>
            <Link
               href="/favorites"
               className="flex items-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300 transition-all duration-200 group"
            >
               <div className="mr-3 p-1.5 rounded-md bg-rose-100 dark:bg-rose-500/10 group-hover:bg-rose-200 dark:group-hover:bg-rose-500/20 transition-colors">
                 <Icons.Heart className="h-4 w-4 text-rose-500 dark:text-rose-400" />
               </div>
               {t('favorites') || '我的收藏'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}