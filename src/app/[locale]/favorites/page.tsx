import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { WebsiteCard } from "@/components/website-card"
import { redirect } from "next/navigation"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Favorites')
  return {
    title: `${t('title')} - NavHub`,
  }
}

export default async function FavoritesPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/favorites')
  }

  const t = await getTranslations('Favorites')

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      website: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      
      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground mb-4">{t('empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((fav) => (
            <WebsiteCard 
              key={fav.website.id} 
              website={fav.website} 
              isFavorited={true}
            />
          ))}
        </div>
      )}
    </div>
  )
}
