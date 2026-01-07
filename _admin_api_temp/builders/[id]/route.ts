import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, website, description, location, mainImage } = body

    const builder = await prisma.houseBuilder.update({
      where: { id: params.id },
      data: {
        name,
        website: website || null,
        description: description || null,
        location: location || null,
        mainImage: mainImage || null,
      },
    })

    return NextResponse.json(builder)
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Builder not found" }, { status: 404 })
    }
    return NextResponse.json(
      { error: "Failed to update builder" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await prisma.houseBuilder.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Builder not found" }, { status: 404 })
    }
    return NextResponse.json(
      { error: "Failed to delete builder" },
      { status: 500 }
    )
  }
}










