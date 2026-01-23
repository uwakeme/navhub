import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SubmitForm } from "@/components/submit-form"
import { redirect } from "next/navigation"

export default async function SubmitPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/submit')
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  return <SubmitForm categories={categories} />
}
