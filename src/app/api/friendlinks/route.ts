export const runtime = 'nodejs'

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET - Public: list active friend links (for the /links page)
export async function GET() {
  try {
    const friendLinks = await prisma.friendLink.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(friendLinks)
  } catch (error) {
    console.error("Error fetching friend links:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}