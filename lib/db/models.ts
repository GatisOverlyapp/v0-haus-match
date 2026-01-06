import { prisma } from "@/lib/prisma"
import type { HouseModel } from "@/app/manufacturers/data"

// Transform Prisma model to app format
function transformModel(model: any): HouseModel & { manufacturer?: { id: string; name: string; slug: string } } {
  return {
    id: model.id,
    name: model.name,
    slug: model.slug,
    manufacturerId: model.manufacturerId,
    size_sqm: model.size_sqm,
    bedrooms: model.bedrooms,
    bathrooms: model.bathrooms,
    price_range: model.price_range,
    category: model.category,
    style_tags: JSON.parse(model.style_tags || "[]") as string[],
    features: JSON.parse(model.features || "[]") as string[],
    images: JSON.parse(model.images || "[]") as string[],
    description: model.description,
    manufacturer: model.manufacturer ? {
      id: model.manufacturer.id,
      name: model.manufacturer.name,
      slug: model.manufacturer.slug,
    } : undefined,
  }
}

export async function getModels(): Promise<HouseModel[]> {
  try {
    const models = await prisma.model.findMany({
      where: {
        published: true,
      },
      include: {
        manufacturer: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return models.map(transformModel)
  } catch (error) {
    console.error("Error fetching models:", error)
    throw new Error("Failed to fetch models")
  }
}

export async function getModelBySlug(slug: string): Promise<HouseModel | null> {
  try {
    const model = await prisma.model.findFirst({
      where: {
        slug,
        published: true,
      },
      include: {
        manufacturer: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    if (!model) {
      return null
    }

    return transformModel(model)
  } catch (error) {
    console.error("Error fetching model by slug:", error)
    throw new Error("Failed to fetch model")
  }
}

export async function getModelsByManufacturer(manufacturerId: string): Promise<HouseModel[]> {
  try {
    const models = await prisma.model.findMany({
      where: {
        manufacturerId,
        published: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    return models.map(transformModel)
  } catch (error) {
    console.error("Error fetching models by manufacturer:", error)
    throw new Error("Failed to fetch models")
  }
}

export async function getModelsByCategory(category: string): Promise<HouseModel[]> {
  try {
    const models = await prisma.model.findMany({
      where: {
        category,
        published: true,
      },
      include: {
        manufacturer: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return models.map(transformModel)
  } catch (error) {
    console.error("Error fetching models by category:", error)
    throw new Error("Failed to fetch models")
  }
}

// Get unique categories from models
export async function getCategories(): Promise<string[]> {
  try {
    const categories = await prisma.model.findMany({
      where: {
        published: true,
      },
      select: {
        category: true,
      },
      distinct: ["category"],
      orderBy: {
        category: "asc",
      },
    })

    return categories.map((c) => c.category)
  } catch (error) {
    console.error("Error fetching categories:", error)
    throw new Error("Failed to fetch categories")
  }
}

