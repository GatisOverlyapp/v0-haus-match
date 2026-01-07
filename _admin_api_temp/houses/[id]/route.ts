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
    const {
      name,
      description,
      size,
      price,
      materials,
      stories,
      bedrooms,
      bathrooms,
      squareFootage,
      arEnabled,
      arModelUrl,
      mainImage,
    } = body

    const house = await prisma.house.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null,
        size: size || null,
        price: price || null,
        materials: materials || null,
        stories: stories || null,
        bedrooms: bedrooms || null,
        bathrooms: bathrooms || null,
        squareFootage: squareFootage || null,
        arEnabled: arEnabled || false,
        arModelUrl: arModelUrl || null,
        mainImage: mainImage || null,
      },
    })

    return NextResponse.json(house)
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "House not found" }, { status: 404 })
    }
    return NextResponse.json(
      { error: "Failed to update house" },
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
    await prisma.house.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "House not found" }, { status: 404 })
    }
    return NextResponse.json(
      { error: "Failed to delete house" },
      { status: 500 }
    )
  }
}










