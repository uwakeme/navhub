import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { WebsiteCard } from "@/components/website-card"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "NavHub - Discover Best Developer Tools",
}

interface PageProps {
  searchParams: Promise<{
    q?: string
    category?: string
  }>
}

export default async function Home(props: PageProps) {
  const searchParams = await props.searchParams
  const session = await auth()
  const q = searchParams.q
  const categorySlug = searchParams.category

  const where: any = {
    status: 'APPROVED',
  }

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
    ]
  }

  if (categorySlug) {
    where.category = {
      slug: categorySlug
    }
  }

  const websites = await prisma.website.findMany({
    where,
    orderBy: [
      { featured: 'desc' },
      { clicks: 'desc' },
      { createdAt: 'desc' },
    ],
    include: {
      category: true,
    }
  })

  // Fetch user favorites
  const favoriteIds = new Set<string>()
  if (session?.user?.id) {
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      select: { websiteId: true }
    })
    favorites.forEach(f => favoriteIds.add(f.websiteId))
  }

  // Get current category info for title
  let currentCategory = null
  if (categorySlug) {
    currentCategory = await prisma.category.findUnique({
      where: { slug: categorySlug }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {currentCategory ? currentCategory.name : (q ? `Search results for "${q}"` : "Discover")}
        </h1>
        <p className="text-muted-foreground">
          {websites.length} {websites.length === 1 ? 'website' : 'websites'} found
        </p>
      </div>

      {websites.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">No websites found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {websites.map((website) => (
            <WebsiteCard 
              key={website.id} 
              website={website} 
              isFavorited={favoriteIds.has(website.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
