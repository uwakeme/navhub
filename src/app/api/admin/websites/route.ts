export const runtime = 'nodejs'

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getFaviconFromUrl } from "@/lib/favicon"

// POST - Admin: create a website that is APPROVED immediately (bypass pending)
export async function POST(req: Request) {
  const session = await auth()

  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, url, description, categoryId, featured } = body

    if (!title || !url || !categoryId) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Auto-fetch favicon (best-effort)
    let favicon: string | null = null
    try {
      favicon = await getFaviconFromUrl(url)
    } catch (error) {
      console.error('Error fetching favicon:', error)
      favicon = null
    }

    const website = await prisma.website.create({
      data: {
        title,
        url,
        description: description || null,
        categoryId,
        favicon,
        submittedById: session.user.id,
        status: 'APPROVED', // admin-created sites are published immediately
        featured: !!featured,
      },
    })

    return NextResponse.json(website)
  } catch (error) {
    console.error("Admin website create error:", error)
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return new NextResponse("Website URL already exists", { status: 409 })
      }
      if (error.message.includes('Foreign key constraint')) {
        return new NextResponse("Invalid category", { status: 400 })
      }
    }
    return new NextResponse("Internal Error", { status: 500 })
  }
}