import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getFaviconFromUrl } from "@/lib/favicon"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, url, description, categoryId } = body

    if (!title || !url || !categoryId) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Auto-fetch favicon from multiple services
    let favicon: string | null = null
    try {
      favicon = await getFaviconFromUrl(url)
      
      // 如果所有服务都失败，使用默认图标（首字母）
      if (!favicon) {
        console.warn(`Failed to fetch favicon for ${url}, will use default`)
        favicon = null // Will trigger default icon in frontend
      }
    } catch (error) {
      console.error('Error fetching favicon:', error)
      // Continue without favicon - it's not critical
      favicon = null
    }

    const website = await prisma.website.create({
      data: {
        title,
        url,
        description,
        categoryId,
        favicon,
        submittedById: session.user.id,
        status: 'PENDING', // Submissions require approval
      },
    })

    return NextResponse.json(website)
  } catch (error) {
    console.error("Website submission error:", error)
    
    // Check for specific database errors
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
