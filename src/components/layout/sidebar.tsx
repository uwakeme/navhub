import { prisma } from "@/lib/prisma"
import { Link } from "@/i18n/routing"
import * as Icons from "lucide-react"
import { LucideIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"

// Helper to get icon by name safely
function getIcon(name: string | null) {
  if (!name) return Icons.Hash
  // @ts-expect-error - dynamic icon access
  return Icons[name] as LucideIcon || Icons.Hash
}

export async function Sidebar() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
  })
  const t = await getTranslations("Sidebar")
  const tCategories = await getTranslations("Categories")

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
    <div className="pb-12 w-64 border-r h-[calc(100vh-4rem)] hidden md:block overflow-y-auto">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {t('categories')}
          </h2>
          <div className="space-y-1">
            <Link
               href="/"
               className="flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
               <Icons.LayoutGrid className="mr-2 h-4 w-4" />
               {t('all')}
            </Link>
            {categories.map((category) => {
              const Icon = getIcon(category.icon)
              const categoryName = getCategoryName(category.slug, category.name)
              return (
                <Link
                  key={category.id}
                  href={`/?category=${category.slug}`}
                  className="flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {categoryName}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
