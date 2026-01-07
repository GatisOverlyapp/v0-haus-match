import { NextResponse } from "next/server"
import { houseModels, manufacturers } from "@/app/manufacturers/data"

export async function GET() {
  try {
    // Use mock data with manufacturer info
    const modelsWithManufacturer = houseModels.map(model => {
      const manufacturer = manufacturers.find(m => m.id === model.manufacturerId)
      return {
        ...model,
        manufacturer: manufacturer ? {
          id: manufacturer.id,
          name: manufacturer.name,
          slug: manufacturer.slug,
        } : undefined,
      }
    })
    return NextResponse.json(modelsWithManufacturer)
  } catch (error) {
    console.error("Error fetching models:", error)
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    )
  }
}
