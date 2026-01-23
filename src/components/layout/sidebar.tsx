import { prisma } from "@/lib/prisma"
import Link from "next/link"
import * as Icons from "lucide-react"
import { LucideIcon } from "lucide-react"

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

  return (
    <div className="pb-12 w-64 border-r min-h-screen hidden md:block">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Categories
          </h2>
          <div className="space-y-1">
            <Link
               href="/"
               className="flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
               <Icons.LayoutGrid className="mr-2 h-4 w-4" />
               All
            </Link>
            {categories.map((category) => {
              const Icon = getIcon(category.icon)
              return (
                <Link
                  key={category.id}
                  href={`/?category=${category.slug}`}
                  className="flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {category.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
