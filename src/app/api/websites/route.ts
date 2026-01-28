import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

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

    // Auto-fetch favicon (simple version)
    let favicon: string
    try {
      const domain = new URL(url).hostname
      favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    } catch (error) {
      console.error('Invalid URL:', url)
      return new NextResponse("Invalid URL format", { status: 400 })
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
