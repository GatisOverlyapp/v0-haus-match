import { NextResponse } from "next/server"
import { getManufacturersWithCoords } from "@/lib/db/manufacturers"

export async function GET() {
  try {
    const manufacturers = await getManufacturersWithCoords()
    return NextResponse.json(manufacturers)
  } catch (error) {
    console.error("Error fetching manufacturers:", error)
    return NextResponse.json(
      { error: "Failed to fetch manufacturers" },
      { status: 500 }
    )
  }
}
