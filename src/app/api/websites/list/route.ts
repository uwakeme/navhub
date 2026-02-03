export const runtime = 'nodejs'

import { auth } from "@/lib/auth"
import { prisma, executeWithRetry } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

const PAGE_SIZE = 24

interface WebsiteWithCategory {
  id: string
  title: string
  url: string
  description: string | null
  favicon: string | null
  featured: boolean
  clicks: number
  createdAt: Date
  category: {
    id: string
    name: string
    slug: string
  } | null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  
  const cursor = searchParams.get('cursor')
  const q = searchParams.get('q')
  const categorySlug = searchParams.get('category')
  
  const where: Prisma.WebsiteWhereInput = {
    status: 'APPROVED',
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (categorySlug) {
    where.category = {
      slug: categorySlug
    }
  }

  try {
    const websites = await executeWithRetry(async () => {
      return await prisma.website.findMany({
        where,
        orderBy: [
          { featured: 'desc' },
          { clicks: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          category: true,
        },
        take: PAGE_SIZE + 1, // Take one extra to check if there's more
        ...(cursor ? {
          skip: 1,
          cursor: { id: cursor },
        } : {}),
      })
    })

    // Check if there are more items
    const hasMore = websites.length > PAGE_SIZE
    const items = hasMore ? websites.slice(0, PAGE_SIZE) : websites
    
    // Get the next cursor
    const nextCursor = hasMore ? items[items.length - 1].id : null

    // Get user's favorites if logged in
    const session = await auth()
    let favoriteIds: string[] = []
    
    if (session?.user?.id) {
      try {
        const favorites = await executeWithRetry(async () => {
          return await prisma.favorite.findMany({
            where: { userId: session.user.id },
            select: { websiteId: true }
          })
        })
        favoriteIds = favorites.map(f => f.websiteId)
      } catch (error) {
        console.error('Failed to load favorites:', error)
      }
    }

    return NextResponse.json({
      items,
      nextCursor,
      hasMore,
      favoriteIds,
    })
  } catch (error) {
    console.error('Failed to load websites:', error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
