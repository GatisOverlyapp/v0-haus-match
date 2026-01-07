// Temporarily using mock data instead of Prisma
import { manufacturers as mockManufacturers } from "@/app/manufacturers/data"
import type { Manufacturer } from "@/app/manufacturers/data"

export async function getManufacturers(): Promise<Manufacturer[]> {
  // Use mock data
  return mockManufacturers
}

export async function getManufacturerBySlug(slug: string): Promise<Manufacturer | null> {
  // Use mock data
  return mockManufacturers.find(m => m.slug === slug) || null
}

export async function getManufacturerById(id: string): Promise<Manufacturer | null> {
  // Use mock data
  return mockManufacturers.find(m => m.id === id) || null
}

// Get manufacturer with coordinates for map
const locationCoords: Record<string, { lat: number; lng: number }> = {
  "Riga, Latvia": { lat: 56.9496, lng: 24.1052 },
  "Liepāja, Latvia": { lat: 56.5047, lng: 21.0108 },
  "Jūrmala, Latvia": { lat: 56.9682, lng: 23.7703 },
  "Valmiera, Latvia": { lat: 57.5411, lng: 25.4275 },
  "Cēsis, Latvia": { lat: 57.3125, lng: 25.2744 },
  "Daugavpils, Latvia": { lat: 55.8756, lng: 26.5364 },
}

export async function getManufacturersWithCoords() {
  // Use mock data with coordinates
  return mockManufacturers.map(m => {
    const coords = locationCoords[m.location] || { lat: 56.9496, lng: 24.1052 }
    return {
      ...m,
      lat: coords.lat,
      lng: coords.lng,
    }
  })
}

