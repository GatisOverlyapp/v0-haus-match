import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const builders = await prisma.houseBuilder.findMany({
    include: {
      houses: {
        include: {
          images: true,
          subcategories: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return NextResponse.json(builders)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, website, description, location, mainImage } = body

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    const builder = await prisma.houseBuilder.create({
      data: {
        name,
        website: website || null,
        description: description || null,
        location: location || null,
        mainImage: mainImage || null,
      },
    })

    return NextResponse.json(builder, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create builder" },
      { status: 500 }
    )
  }
}










