import { NextResponse } from "next/server"
import { manufacturers } from "@/app/manufacturers/data"

// Mock coordinates for Latvia cities
const locationCoords: Record<string, { lat: number; lng: number }> = {
  "Riga, Latvia": { lat: 56.9496, lng: 24.1052 },
  "Liepāja, Latvia": { lat: 56.5047, lng: 21.0108 },
  "Jūrmala, Latvia": { lat: 56.9682, lng: 23.7703 },
  "Valmiera, Latvia": { lat: 57.5411, lng: 25.4275 },
  "Cēsis, Latvia": { lat: 57.3125, lng: 25.2744 },
  "Daugavpils, Latvia": { lat: 55.8756, lng: 26.5364 },
}

export async function GET() {
  try {
    // Use mock data with coordinates
    const manufacturersWithCoords = manufacturers.map(m => {
      const coords = locationCoords[m.location] || { lat: 56.9496, lng: 24.1052 }
      return {
        ...m,
        lat: coords.lat,
        lng: coords.lng,
      }
    })
    return NextResponse.json(manufacturersWithCoords)
  } catch (error) {
    console.error("Error fetching manufacturers:", error)
    return NextResponse.json(
      { error: "Failed to fetch manufacturers" },
      { status: 500 }
    )
  }
}
