"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface ModelFormData {
  name: string
  slug: string
  manufacturerId: string
  size_sqm: number
  bedrooms: number
  bathrooms: number
  price_range: string
  category: string
  style_tags: string[] // Will be converted to JSON string
  features: string[] // Will be converted to JSON string
  images: string[] // Will be converted to JSON string
  description: string
  published: boolean
}

export async function createModel(data: ModelFormData) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return { error: "Unauthorized" }
  }

  try {
    // Validate required fields
    if (
      !data.name ||
      !data.slug ||
      !data.manufacturerId ||
      !data.category ||
      !data.description
    ) {
      return { error: "Name, slug, manufacturer, category, and description are required" }
    }

    if (data.size_sqm <= 0 || data.bedrooms < 0 || data.bathrooms < 0) {
      return { error: "Size, bedrooms, and bathrooms must be valid positive numbers" }
    }

    // Check if slug already exists
    const existing = await prisma.model.findUnique({
      where: { slug: data.slug },
    })

    if (existing) {
      return { error: "A model with this slug already exists" }
    }

    // Verify manufacturer exists
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: data.manufacturerId },
    })

    if (!manufacturer) {
      return { error: "Manufacturer not found" }
    }

    const model = await prisma.model.create({
      data: {
        name: data.name,
        slug: data.slug,
        manufacturerId: data.manufacturerId,
        size_sqm: data.size_sqm,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        price_range: data.price_range,
        category: data.category,
        style_tags: JSON.stringify(data.style_tags || []),
        features: JSON.stringify(data.features || []),
        images: JSON.stringify(data.images || []),
        description: data.description,
        published: data.published,
      },
    })

    revalidatePath("/admin/models")
    revalidatePath("/models")
    revalidatePath(`/manufacturers/${manufacturer.slug}`)
    revalidatePath(`/models/${model.slug}`)

    return { success: true, model }
  } catch (error: any) {
    console.error("Error creating model:", error)
    if (error.code === "P2002") {
      return { error: "A model with this slug already exists" }
    }
    return { error: "Failed to create model" }
  }
}

export async function updateModel(id: string, data: ModelFormData) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return { error: "Unauthorized" }
  }

  try {
    // Validate required fields
    if (
      !data.name ||
      !data.slug ||
      !data.manufacturerId ||
      !data.category ||
      !data.description
    ) {
      return { error: "Name, slug, manufacturer, category, and description are required" }
    }

    if (data.size_sqm <= 0 || data.bedrooms < 0 || data.bathrooms < 0) {
      return { error: "Size, bedrooms, and bathrooms must be valid positive numbers" }
    }

    // Check if slug already exists for another model
    const existing = await prisma.model.findFirst({
      where: {
        slug: data.slug,
        NOT: { id },
      },
    })

    if (existing) {
      return { error: "A model with this slug already exists" }
    }

    // Verify manufacturer exists
    const manufacturer = await prisma.manufacturer.findUnique({
      where: { id: data.manufacturerId },
    })

    if (!manufacturer) {
      return { error: "Manufacturer not found" }
    }

    const model = await prisma.model.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        manufacturerId: data.manufacturerId,
        size_sqm: data.size_sqm,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        price_range: data.price_range,
        category: data.category,
        style_tags: JSON.stringify(data.style_tags || []),
        features: JSON.stringify(data.features || []),
        images: JSON.stringify(data.images || []),
        description: data.description,
        published: data.published,
      },
    })

    revalidatePath("/admin/models")
    revalidatePath(`/admin/models/${id}`)
    revalidatePath("/models")
    revalidatePath(`/models/${model.slug}`)
    revalidatePath(`/manufacturers/${manufacturer.slug}`)

    return { success: true, model }
  } catch (error: any) {
    console.error("Error updating model:", error)
    if (error.code === "P2025") {
      return { error: "Model not found" }
    }
    if (error.code === "P2002") {
      return { error: "A model with this slug already exists" }
    }
    return { error: "Failed to update model" }
  }
}

export async function deleteModel(id: string) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return { error: "Unauthorized" }
  }

  try {
    const model = await prisma.model.findUnique({
      where: { id },
      include: { manufacturer: true },
    })

    if (!model) {
      return { error: "Model not found" }
    }

    await prisma.model.delete({
      where: { id },
    })

    revalidatePath("/admin/models")
    revalidatePath("/models")
    revalidatePath(`/manufacturers/${model.manufacturer.slug}`)

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting model:", error)
    if (error.code === "P2025") {
      return { error: "Model not found" }
    }
    if (error.code === "P2003") {
      return { error: "Cannot delete model with associated contacts. Please delete contacts first." }
    }
    return { error: "Failed to delete model" }
  }
}
