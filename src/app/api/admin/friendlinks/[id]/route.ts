export const runtime = 'nodejs'

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// PATCH - Admin: update friend link
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
    const { name, url, description, favicon, ownerName, ownerUrl, order, isActive } = body

    // If URL is being changed, normalize and check conflict
    let normalizedUrl: string | undefined
    if (url) {
      normalizedUrl = String(url).trim()
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = `https://${normalizedUrl}`
      }
      const conflict = await prisma.friendLink.findFirst({
        where: { url: normalizedUrl, id: { not: params.id } }
      })
      if (conflict) {
        return new NextResponse("Friend link URL already exists", { status: 409 })
      }
    }

    const friendLink = await prisma.friendLink.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(normalizedUrl !== undefined && { url: normalizedUrl }),
        ...(description !== undefined && { description: description || null }),
        ...(favicon !== undefined && { favicon: favicon || null }),
        ...(ownerName !== undefined && { ownerName: ownerName || null }),
        ...(ownerUrl !== undefined && { ownerUrl: ownerUrl || null }),
        ...(typeof order === 'number' && { order }),
        ...(typeof isActive === 'boolean' && { isActive }),
      },
    })

    return NextResponse.json(friendLink)
  } catch (error) {
    console.error("Error updating friend link:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// DELETE - Admin: delete friend link
export async function DELETE(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const params = await props.params

  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    await prisma.friendLink.delete({
      where: { id: params.id }
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting friend link:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}