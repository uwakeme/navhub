export const runtime = 'nodejs'

import { auth } from "@/lib/auth"
import { prisma, executeWithRetry } from "@/lib/prisma"
import { SubmitForm } from "@/components/submit-form"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

export default async function SubmitPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/submit')
  }

  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = []
  let error: string | null = null

  try {
    categories = await executeWithRetry(async () => {
      return await prisma.category.findMany({
        orderBy: { order: 'asc' }
      })
    })
  } catch (e) {
    console.error('Failed to load categories:', e)
    error = '加载分类失败，请稍后重试'
  }
  
  // Get translations for categories
  const tCategories = await getTranslations("Categories")
  
  // Map categories with translated names
  const categoriesWithTranslatedNames = categories.map(cat => ({
    ...cat,
    name: tCategories(cat.slug) === cat.slug ? cat.name : tCategories(cat.slug)
  }))

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-md text-sm transition-colors"
          >
            刷新页面
          </button>
        </div>
      </div>
    )
  }

  return <SubmitForm categories={categoriesWithTranslatedNames} />
}
