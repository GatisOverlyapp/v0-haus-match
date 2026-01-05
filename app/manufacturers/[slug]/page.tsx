import { use } from "react"
import { notFound } from "next/navigation"
import { getManufacturerBySlug, getManufacturersWithCoords } from "@/lib/db/manufacturers"
import { getModelsByManufacturer } from "@/lib/db/models"
import { ManufacturerClient } from "./client"

interface ManufacturerPageProps {
  params: Promise<{ slug: string }>
}

export default async function ManufacturerPage({ params }: ManufacturerPageProps) {
  const { slug } = await params

  let manufacturer
  let models
  let manufacturerWithCoords

  try {
    manufacturer = await getManufacturerBySlug(slug)
    if (!manufacturer) {
      notFound()
    }

    // Get manufacturer with coordinates for map
    const manufacturersWithCoords = await getManufacturersWithCoords()
    manufacturerWithCoords = manufacturersWithCoords.find((m) => m.slug === slug)

    if (!manufacturerWithCoords) {
      notFound()
    }

    // Get models for this manufacturer
    models = await getModelsByManufacturer(manufacturer.id)
  } catch (error) {
    console.error("Error loading manufacturer:", error)
    notFound()
  }

  return <ManufacturerClient manufacturer={manufacturerWithCoords} models={models} />
}
