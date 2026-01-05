import { houseModels } from "@/app/manufacturers/data"

export interface CategoryData {
  slug: string
  name: string
  description: string
  heroImage: string
}

// Helper function to convert category name to slug
const categoryToSlug = (category: string): string => {
  return category.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

// Get unique categories from houseModels
const getUniqueCategories = (): string[] => {
  const categories = new Set(houseModels.map((m) => m.category))
  return Array.from(categories).sort()
}

// Get a representative hero image for a category (first image from first model in category)
const getCategoryHeroImage = (category: string): string => {
  const categoryModel = houseModels.find((m) => m.category === category)
  if (categoryModel && categoryModel.images && categoryModel.images.length > 0) {
    return categoryModel.images[0]
  }
  return "/placeholder.svg"
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

// Generate category data from houseModels
export const categories: CategoryData[] = getUniqueCategories().map((category) => ({
  slug: categoryToSlug(category),
  name: category,
  description: categoryDescriptions[category] || `${category} prefab homes offering modern design and efficient construction.`,
  heroImage: getCategoryHeroImage(category),
}))

// Helper function to get category by slug
export const getCategoryBySlug = (slug: string): CategoryData | undefined => {
  return categories.find((c) => c.slug === slug)
}

// Helper function to get models by category
export const getModelsByCategory = (categorySlug: string) => {
  const category = getCategoryBySlug(categorySlug)
  if (!category) return []
  return houseModels.filter((m) => m.category === category.name)
}
