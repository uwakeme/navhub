import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SubmitForm } from "@/components/submit-form"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

export default async function SubmitPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/submit')
  }

  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' }
  })
  
  // Get translations for categories
  const tCategories = await getTranslations("Categories")
  
  // Map categories with translated names
  const categoriesWithTranslatedNames = categories.map(cat => ({
    ...cat,
    name: tCategories(cat.slug) === cat.slug ? cat.name : tCategories(cat.slug)
  }))

  return <SubmitForm categories={categoriesWithTranslatedNames} />
}
