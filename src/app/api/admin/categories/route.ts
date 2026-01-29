export const runtime = 'nodejs'

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET - List all categories
export async function GET() {
  const session = await auth()
  
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { websites: true }
        }
      }
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// POST - Create new category
export async function POST(req: Request) {
  const session = await auth()
  
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, slug, description, icon, order } = body

    // Validate required fields
    if (!name || !slug) {
      return new NextResponse("Name and slug are required", { status: 400 })
    }

    // Check if slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug }
    })

    if (existing) {
      return new NextResponse("Category slug already exists", { status: 409 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        order: order || 0
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error creating category:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
