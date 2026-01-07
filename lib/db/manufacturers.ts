import { prisma } from "@/lib/prisma"
import type { Manufacturer } from "@/app/manufacturers/data"

// Transform Prisma manufacturer to app format
function transformManufacturer(manufacturer: any): Manufacturer {
  return {
    id: manufacturer.id,
    name: manufacturer.name,
    slug: manufacturer.slug,
    location: manufacturer.location,
    country: manufacturer.country || "Latvia", // Fallback to Latvia if not set
    description: manufacturer.description,
    logo: manufacturer.logo || undefined,
  }
}

export async function getManufacturers(): Promise<Manufacturer[]> {
  try {
    const manufacturers = await prisma.manufacturer.findMany({
      where: {
        published: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return manufacturers.map(transformManufacturer)
  } catch (error) {
    console.error("Error fetching manufacturers:", error)
    throw new Error("Failed to fetch manufacturers")
  }
}

export async function getManufacturerBySlug(slug: string): Promise<Manufacturer | null> {
  try {
    const manufacturer = await prisma.manufacturer.findFirst({
      where: {
        slug,
        published: true,
      },
    })

    if (!manufacturer) {
      return null
    }

    return transformManufacturer(manufacturer)
  } catch (error) {
    console.error("Error fetching manufacturer by slug:", error)
    throw new Error("Failed to fetch manufacturer")
  }
}

export async function getManufacturerById(id: string): Promise<Manufacturer | null> {
  try {
    const manufacturer = await prisma.manufacturer.findUnique({
      where: {
        id,
      },
    })

    if (!manufacturer || !manufacturer.published) {
      return null
    }

    return transformManufacturer(manufacturer)
  } catch (error) {
    console.error("Error fetching manufacturer by id:", error)
    throw new Error("Failed to fetch manufacturer")
  }
}

// Get manufacturer with coordinates for map
export async function getManufacturersWithCoords() {
  try {
    const manufacturers = await prisma.manufacturer.findMany({
      where: {
        published: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
        country: true,
        lat: true,
        lng: true,
        description: true,
        logo: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return manufacturers
  } catch (error) {
    console.error("Error fetching manufacturers with coords:", error)
    throw new Error("Failed to fetch manufacturers")
  }
}

