import { getModels, getCategories } from "./models"
import type { CategoryData } from "@/app/categories/data"
import type { HouseModel } from "@/app/manufacturers/data"

// Helper function to convert category name to slug
const categoryToSlug = (category: string): string => {
  return category.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

// Category descriptions (SEO-friendly)
const categoryDescriptions: Record<string, string> = {
  "Tiny House":
    "Discover compact, efficient tiny homes perfect for minimalist living. These innovative small spaces maximize functionality while minimizing environmental impact. Ideal for first-time homeowners, downsizers, or those seeking a simpler lifestyle.",
  Modular:
    "Explore flexible modular homes that can be customized and expanded to fit your needs. Built in controlled factory environments for quality and speed, modular homes offer modern design with efficient construction. Perfect for families looking for customizable, sustainable housing solutions.",
  "A-Frame":
    "Experience the iconic A-frame design that combines rustic charm with modern amenities. These triangular structures are perfect for vacation homes, mountain retreats, or unique primary residences. A-frames offer high ceilings, efficient use of space, and stunning architectural appeal.",
  Cabin:
    "Find traditional and modern cabin homes that blend natural materials with contemporary comfort. Perfect for countryside living, these homes use locally sourced timber and heritage craftsmanship. Ideal for those seeking a connection to nature without sacrificing modern conveniences.",
  "Container Home":
    "Explore innovative container homes that transform shipping containers into modern living spaces. These sustainable, portable homes offer unique industrial aesthetics with contemporary design. Perfect for alternative living, urban spaces, or eco-conscious homeowners seeking creative solutions.",
}

// Get a representative hero image for a category (first image from first model in category)
const getCategoryHeroImage = (models: HouseModel[], category: string): string => {
  const categoryModel = models.find((m) => m.category === category)
  if (categoryModel && categoryModel.images && categoryModel.images.length > 0) {
    return categoryModel.images[0]
  }
  return "/placeholder.svg"
}

export async function getCategoriesData(): Promise<CategoryData[]> {
  try {
    const categories = await getCategories()
    const models = await getModels()

    return categories.map((category) => ({
      slug: categoryToSlug(category),
      name: category,
      description: categoryDescriptions[category] || `${category} prefab homes offering modern design and efficient construction.`,
      heroImage: getCategoryHeroImage(models, category),
    }))
  } catch (error) {
    console.error("Error fetching categories:", error)
    throw new Error("Failed to fetch categories")
  }
}

export async function getCategoryBySlug(slug: string): Promise<CategoryData | null> {
  try {
    const categories = await getCategoriesData()
    return categories.find((c) => c.slug === slug) || null
  } catch (error) {
    console.error("Error fetching category by slug:", error)
    return null
  }
}

export async function getModelsByCategorySlug(categorySlug: string): Promise<HouseModel[]> {
  try {
    const categories = await getCategoriesData()
    const category = categories.find((c) => c.slug === categorySlug)
    if (!category) {
      return []
    }

    const models = await getModelsByCategory(category.name)
    return models
  } catch (error) {
    console.error("Error fetching models by category:", error)
    throw new Error("Failed to fetch models")
  }
}

import { getModelsByCategory } from "./models"
