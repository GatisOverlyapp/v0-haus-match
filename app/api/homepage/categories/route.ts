import { NextResponse } from "next/server"
import { houseModels } from "@/app/manufacturers/data"

export async function GET() {
  try {
    // Get unique categories from mock data
    const uniqueCategories = Array.from(new Set(houseModels.map(m => m.category)))
    const categories = uniqueCategories.map(category => ({
      name: category,
      slug: category.toLowerCase().replace(/\s+/g, '-'),
    }))
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}
