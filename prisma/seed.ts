import { PrismaClient } from "../lib/generated/prisma/client"
import { manufacturers, houseModels } from "../app/manufacturers/data"
import "dotenv/config"

const prisma = new PrismaClient()

// Helper function to get coordinates for Latvian cities
const getCoordinatesForLocation = (location: string): { lat: number; lng: number } => {
  const locationMap: Record<string, { lat: number; lng: number }> = {
    "Riga, Latvia": { lat: 56.9496, lng: 24.1052 },
    "Liepāja, Latvia": { lat: 56.5047, lng: 21.0108 },
    "Jūrmala, Latvia": { lat: 56.9682, lng: 23.7703 },
    "Valmiera, Latvia": { lat: 57.5411, lng: 25.4275 },
    "Cēsis, Latvia": { lat: 57.3125, lng: 25.2744 },
    "Daugavpils, Latvia": { lat: 55.8756, lng: 26.5364 },
  }

  const coords = locationMap[location]
  if (!coords) {
    throw new Error(`Unknown location: ${location}`)
  }
  return coords
}

async function main() {
  console.log("🌱 Starting seed...")

  // Clear existing data
  console.log("🗑️  Clearing existing Manufacturer and Model data...")
  await prisma.model.deleteMany()
  await prisma.manufacturer.deleteMany()
  console.log("✅ Cleared existing data")

  // Create a map of old manufacturer IDs to new Prisma IDs
  const manufacturerIdMap = new Map<string, string>()

  // Insert manufacturers
  console.log(`📦 Inserting ${manufacturers.length} manufacturers...`)
  for (const manufacturer of manufacturers) {
    const coords = getCoordinatesForLocation(manufacturer.location)
    const created = await prisma.manufacturer.create({
      data: {
        name: manufacturer.name,
        slug: manufacturer.slug,
        location: manufacturer.location,
        country: manufacturer.country || "Latvia",
        lat: coords.lat,
        lng: coords.lng,
        description: manufacturer.description,
        logo: manufacturer.logo || null,
        published: true,
      },
    })
    manufacturerIdMap.set(manufacturer.id, created.id)
    console.log(`  ✓ Created manufacturer: ${manufacturer.name}`)
  }
  console.log("✅ All manufacturers inserted")

  // Insert models
  console.log(`🏠 Inserting ${houseModels.length} models...`)
  for (const model of houseModels) {
    const newManufacturerId = manufacturerIdMap.get(model.manufacturerId)
    if (!newManufacturerId) {
      console.error(`  ✗ Skipping model ${model.name}: manufacturer ID ${model.manufacturerId} not found`)
      continue
    }

    await prisma.model.create({
      data: {
        name: model.name,
        slug: model.slug,
        manufacturerId: newManufacturerId,
        size_sqm: model.size_sqm,
        bedrooms: model.bedrooms,
        bathrooms: model.bathrooms,
        price_range: model.price_range,
        category: model.category,
        style_tags: JSON.stringify(model.style_tags),
        features: JSON.stringify(model.features),
        images: JSON.stringify(model.images),
        description: model.description,
        published: true,
      },
    })
    console.log(`  ✓ Created model: ${model.name}`)
  }
  console.log("✅ All models inserted")

  console.log("🎉 Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

