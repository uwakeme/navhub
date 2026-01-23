import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await auth()
  
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { status, featured } = await req.json()
    const website = await prisma.website.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(featured !== undefined && { featured }),
      },
    })
    return NextResponse.json(website)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await auth()
  
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    await prisma.website.delete({
      where: { id: params.id },
    })
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}
