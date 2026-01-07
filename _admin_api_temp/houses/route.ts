import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const houses = await prisma.house.findMany({
    include: {
      builder: true,
      images: true,
      subcategories: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return NextResponse.json(houses)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      builderId,
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
      images,
      subcategories,
    } = body

    if (!builderId || !name) {
      return NextResponse.json(
        { error: "Builder ID and name are required" },
        { status: 400 }
      )
    }

    const house = await prisma.house.create({
      data: {
        builderId,
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
        images: images
          ? {
              create: images.map((img: any, index: number) => ({
                url: img.url,
                alt: img.alt || null,
                order: index,
              })),
            }
          : undefined,
        subcategories: subcategories
          ? {
              create: subcategories.map((sub: any) => ({
                name: sub.name,
                description: sub.description || null,
                image: sub.image || null,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        subcategories: true,
      },
    })

    return NextResponse.json(house, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to create house" },
      { status: 500 }
    )
  }
}










