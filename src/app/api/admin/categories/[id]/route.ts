import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// PATCH - Update category
export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const params = await props.params
  
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, slug, description, icon, order } = body

    // If slug is being changed, check it doesn't conflict
    if (slug) {
      const existing = await prisma.category.findFirst({
        where: {
          slug,
          id: { not: params.id }
        }
      })
      if (existing) {
        return new NextResponse("Category slug already exists", { status: 409 })
      }
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        description,
        icon,
        order
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error updating category:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// DELETE - Delete category
export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const params = await props.params
  
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // Check if category has websites
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: { _count: { select: { websites: true } } }
    })

    if (category?._count.websites && category._count.websites > 0) {
      return new NextResponse(
        `Cannot delete category with ${category._count.websites} websites. Please move or delete them first.`,
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting category:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
