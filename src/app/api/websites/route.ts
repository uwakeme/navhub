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
    const domain = new URL(url).hostname
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`

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
    console.error(error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
