// Temporarily using mock data instead of Prisma
import { houseModels as mockModels, manufacturers as mockManufacturers } from "@/app/manufacturers/data"
import type { HouseModel } from "@/app/manufacturers/data"

export async function getModels(): Promise<(HouseModel & { manufacturer?: { id: string; name: string; slug: string } })[]> {
  // Use mock data with manufacturer info
  return mockModels.map(model => {
    const manufacturer = mockManufacturers.find(m => m.id === model.manufacturerId)
    return {
      ...model,
      manufacturer: manufacturer ? {
        id: manufacturer.id,
        name: manufacturer.name,
        slug: manufacturer.slug,
      } : undefined,
    }
  })
}

export async function getModelBySlug(slug: string): Promise<(HouseModel & { manufacturer?: { id: string; name: string; slug: string } }) | null> {
  // Use mock data
  const model = mockModels.find(m => m.slug === slug)
  if (!model) return null
  
  const manufacturer = mockManufacturers.find(m => m.id === model.manufacturerId)
  return {
    ...model,
    manufacturer: manufacturer ? {
      id: manufacturer.id,
      name: manufacturer.name,
      slug: manufacturer.slug,
    } : undefined,
  }
}

export async function getModelsByManufacturer(manufacturerId: string): Promise<HouseModel[]> {
  // Use mock data
  return mockModels.filter(m => m.manufacturerId === manufacturerId)
}

export async function getModelsByCategory(category: string): Promise<(HouseModel & { manufacturer?: { id: string; name: string; slug: string } })[]> {
  // Use mock data
  const models = mockModels.filter(m => m.category === category)
  return models.map(model => {
    const manufacturer = mockManufacturers.find(m => m.id === model.manufacturerId)
    return {
      ...model,
      manufacturer: manufacturer ? {
        id: manufacturer.id,
        name: manufacturer.name,
        slug: manufacturer.slug,
      } : undefined,
    }
  })
}

// Get unique categories from models
export async function getCategories(): Promise<string[]> {
  // Use mock data
  const uniqueCategories = Array.from(new Set(mockModels.map(m => m.category)))
  return uniqueCategories.sort()
}

