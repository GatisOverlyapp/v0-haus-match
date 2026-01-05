"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface ManufacturerFormData {
  name: string
  slug: string
  location: string
  lat: number
  lng: number
  description: string
  logo?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  published: boolean
}

export async function createManufacturer(data: ManufacturerFormData) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return { error: "Unauthorized" }
  }

  try {
    // Validate required fields
    if (!data.name || !data.slug || !data.location || data.lat === undefined || data.lng === undefined) {
      return { error: "Name, slug, location, latitude, and longitude are required" }
    }

    // Check if slug already exists
    const existing = await prisma.manufacturer.findUnique({
      where: { slug: data.slug },
    })

    if (existing) {
      return { error: "A manufacturer with this slug already exists" }
    }

    const manufacturer = await prisma.manufacturer.create({
      data: {
        name: data.name,
        slug: data.slug,
        location: data.location,
        lat: data.lat,
        lng: data.lng,
        description: data.description,
        logo: data.logo || null,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        published: data.published,
      },
    })

    revalidatePath("/admin/manufacturers")
    revalidatePath("/manufacturers")
    revalidatePath("/map")

    return { success: true, manufacturer }
  } catch (error: any) {
    console.error("Error creating manufacturer:", error)
    if (error.code === "P2002") {
      return { error: "A manufacturer with this slug already exists" }
    }
    return { error: "Failed to create manufacturer" }
  }
}

export async function updateManufacturer(id: string, data: ManufacturerFormData) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return { error: "Unauthorized" }
  }

  try {
    // Validate required fields
    if (!data.name || !data.slug || !data.location || data.lat === undefined || data.lng === undefined) {
      return { error: "Name, slug, location, latitude, and longitude are required" }
    }

    // Check if slug already exists for another manufacturer
    const existing = await prisma.manufacturer.findFirst({
      where: {
        slug: data.slug,
        NOT: { id },
      },
    })

    if (existing) {
      return { error: "A manufacturer with this slug already exists" }
    }

    const manufacturer = await prisma.manufacturer.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        location: data.location,
        lat: data.lat,
        lng: data.lng,
        description: data.description,
        logo: data.logo || null,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        published: data.published,
      },
    })

    revalidatePath("/admin/manufacturers")
    revalidatePath(`/admin/manufacturers/${id}`)
    revalidatePath("/manufacturers")
    revalidatePath(`/manufacturers/${manufacturer.slug}`)
    revalidatePath("/map")

    return { success: true, manufacturer }
  } catch (error: any) {
    console.error("Error updating manufacturer:", error)
    if (error.code === "P2025") {
      return { error: "Manufacturer not found" }
    }
    if (error.code === "P2002") {
      return { error: "A manufacturer with this slug already exists" }
    }
    return { error: "Failed to update manufacturer" }
  }
}

export async function deleteManufacturer(id: string) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.manufacturer.delete({
      where: { id },
    })

    revalidatePath("/admin/manufacturers")
    revalidatePath("/manufacturers")
    revalidatePath("/map")

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting manufacturer:", error)
    if (error.code === "P2025") {
      return { error: "Manufacturer not found" }
    }
    if (error.code === "P2003") {
      return { error: "Cannot delete manufacturer with associated models. Please delete models first." }
    }
    return { error: "Failed to delete manufacturer" }
  }
}
