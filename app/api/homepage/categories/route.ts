import { NextResponse } from "next/server"
import { getCategoriesData } from "@/lib/db/categories"

export async function GET() {
  try {
    const categories = await getCategoriesData()
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}
