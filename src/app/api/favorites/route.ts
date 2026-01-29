export const runtime = 'nodejs'

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { websiteId } = await req.json()
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        websiteId,
      },
    })
    return NextResponse.json(favorite)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { websiteId } = await req.json()
    await prisma.favorite.deleteMany({
      where: {
        userId: session.user.id,
        websiteId,
      },
    })
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}
