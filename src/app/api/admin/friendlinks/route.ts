export const runtime = 'nodejs'

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET - Admin: list ALL friend links (active + inactive)
export async function GET() {
  const session = await auth()

  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const friendLinks = await prisma.friendLink.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(friendLinks)
  } catch (error) {
    console.error("Error fetching friend links:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// POST - Admin: create new friend link
export async function POST(req: Request) {
  const session = await auth()

  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, url, description, favicon, ownerName, ownerUrl, order, isActive } = body

    if (!name || !url) {
      return new NextResponse("Name and URL are required", { status: 400 })
    }

    // Normalize URL (must start with http(s)://)
    let normalizedUrl = String(url).trim()
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`
    }

    // Check duplicate URL
    const existing = await prisma.friendLink.findUnique({
      where: { url: normalizedUrl }
    })
    if (existing) {
      return new NextResponse("Friend link URL already exists", { status: 409 })
    }

    const friendLink = await prisma.friendLink.create({
      data: {
        name,
        url: normalizedUrl,
        description: description || null,
        favicon: favicon || null,
        ownerName: ownerName || null,
        ownerUrl: ownerUrl || null,
        order: typeof order === 'number' ? order : 0,
        isActive: isActive !== false, // default true
      }
    })

    return NextResponse.json(friendLink)
  } catch (error) {
    console.error("Error creating friend link:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}