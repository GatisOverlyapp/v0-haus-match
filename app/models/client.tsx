"use client"

import { useState, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { ModelCard } from "@/components/model-card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Filter, X } from "lucide-react"
import type { HouseModel } from "@/app/manufacturers/data"

type SortOption = "price-low" | "price-high" | "size-low" | "size-high" | "newest"

interface ModelsClientProps {
  models: HouseModel[]
  categories: string[]
}

// Extract numeric price from price range string (e.g., "€45,000 - €55,000" -> 45000)
const extractPrice = (priceRange: string): number => {
  const match = priceRange.match(/€?([\d,]+)/)
  if (match) {
    return parseInt(match[1].replace(/,/g, ""), 10)
  }
  return 0
}

// Get unique price ranges
const getPriceRanges = (models: HouseModel[]) => {
  const ranges = new Set(models.map((m) => m.price_range))
  return Array.from(ranges).sort((a, b) => extractPrice(a) - extractPrice(b))
}

export function ModelsClient({ models, categories }: ModelsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Get filter values from URL
  const category = searchParams.get("category") || "all-categories"
  const priceRange = searchParams.get("price") || "all-prices"
  const bedrooms = searchParams.get("bedrooms") || "any-bedrooms"
  const sizeMin = searchParams.get("sizeMin") || ""
  const sizeMax = searchParams.get("sizeMax") || ""
  const sort = (searchParams.get("sort") || "newest") as SortOption

  // Update URL with new filter
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    // Handle special "all" values
    if (value === "all-categories" || value === "all-prices" || value === "any-bedrooms") {
      params.delete(key)
    } else if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/models?${params.toString()}`)
  }

  // Filter and sort models
  const filteredAndSortedModels = useMemo(() => {
    let filtered = [...models]

    // Filter by category
    if (category && category !== "all-categories") {
      filtered = filtered.filter((m) => m.category === category)
    }

    // Filter by price range
    if (priceRange && priceRange !== "all-prices") {
      filtered = filtered.filter((m) => m.price_range === priceRange)
    }

    // Filter by bedrooms
    if (bedrooms && bedrooms !== "any-bedrooms") {
      if (bedrooms === "4+") {
        filtered = filtered.filter((m) => m.bedrooms >= 4)
      } else {
        const bedCount = parseInt(bedrooms, 10)
        filtered = filtered.filter((m) => m.bedrooms === bedCount)
      }
    }

    // Filter by size range
    if (sizeMin) {
      const min = parseInt(sizeMin, 10)
      filtered = filtered.filter((m) => m.size_sqm >= min)
    }
    if (sizeMax) {
      const max = parseInt(sizeMax, 10)
      filtered = filtered.filter((m) => m.size_sqm <= max)
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sort) {
        case "price-low":
          return extractPrice(a.price_range) - extractPrice(b.price_range)
        case "price-high":
          return extractPrice(b.price_range) - extractPrice(a.price_range)
        case "size-low":
          return a.size_sqm - b.size_sqm
        case "size-high":
          return b.size_sqm - a.size_sqm
        case "newest":
        default:
          // Sort by creation date (newest first) - using ID as fallback
          return b.id.localeCompare(a.id)
      }
    })

    return sorted
  }, [models, category, priceRange, bedrooms, sizeMin, sizeMax, sort])

  const priceRanges = getPriceRanges(models)

  // Get size range options
  const allSizes = models.map((m) => m.size_sqm)
  const minSize = Math.min(...allSizes)
  const maxSize = Math.max(...allSizes)
  
  // Generate size range options
  const sizeRanges = [
    { label: "Any Size", min: "", max: "" },
    { label: "0-40 m²", min: "0", max: "40" },
    { label: "40-60 m²", min: "40", max: "60" },
    { label: "60-80 m²", min: "60", max: "80" },
    { label: "80-100 m²", min: "80", max: "100" },
    { label: "100+ m²", min: "100", max: "" },
  ]
  
  // Find current size range based on active filters
  const getCurrentSizeRange = () => {
    if (!sizeMin && !sizeMax) return "Any Size"
    const matchingRange = sizeRanges.find(
      (range) => range.min === sizeMin && range.max === sizeMax
    )
    return matchingRange?.label || "Any Size"
  }
  
  const currentSizeRange = getCurrentSizeRange()
  
  const handleSizeRangeChange = (value: string) => {
    if (value === "Any Size") {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("sizeMin")
      params.delete("sizeMax")
      router.push(`/models?${params.toString()}`)
    } else {
      const range = sizeRanges.find((r) => r.label === value)
      if (range) {
        const params = new URLSearchParams(searchParams.toString())
        if (range.min) {
          params.set("sizeMin", range.min)
        } else {
          params.delete("sizeMin")
        }
        if (range.max) {
          params.set("sizeMax", range.max)
        } else {
          params.delete("sizeMax")
        }
        router.push(`/models?${params.toString()}`)
      }
    }
  }

  const clearFilters = () => {
    router.push("/models")
  }

  const hasActiveFilters = category !== "all-categories" || priceRange !== "all-prices" || bedrooms !== "any-bedrooms" || sizeMin || sizeMax

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation openSubscribeModal={() => setSubscribeModalOpen(true)} />

      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse Models</h1>
          <p className="text-lg text-teal-100 max-w-2xl">
            Explore our collection of prefab home models. Filter by category, price, size, and more to find your perfect home.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-teal-600 hover:text-teal-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <Label htmlFor="category" className="mb-2 block text-sm font-medium text-gray-700">
                    Category
                  </Label>
                  <Select value={category} onValueChange={(value) => updateFilter("category", value)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-categories">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <Label htmlFor="price" className="mb-2 block text-sm font-medium text-gray-700">
                    Price Range
                  </Label>
                  <Select value={priceRange} onValueChange={(value) => updateFilter("price", value)}>
                    <SelectTrigger id="price">
                      <SelectValue placeholder="All Prices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-prices">All Prices</SelectItem>
                      {priceRanges.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bedrooms Filter */}
                <div>
                  <Label htmlFor="bedrooms" className="mb-2 block text-sm font-medium text-gray-700">
                    Bedrooms
                  </Label>
                  <Select value={bedrooms} onValueChange={(value) => updateFilter("bedrooms", value)}>
                    <SelectTrigger id="bedrooms">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any-bedrooms">Any</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4+">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Size Range Filter */}
                <div>
                  <Label htmlFor="sizeRange" className="mb-2 block text-sm font-medium text-gray-700">
                    Size Range
                  </Label>
                  <Select value={currentSizeRange} onValueChange={handleSizeRangeChange}>
                    <SelectTrigger id="sizeRange">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sizeRanges.map((range) => (
                        <SelectItem key={range.label} value={range.label}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </aside>

          {/* Models Grid */}
          <div className="flex-1">
            {/* Sort and Results Count */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="text-gray-600">
                <span className="font-semibold">{filteredAndSortedModels.length}</span> model
                {filteredAndSortedModels.length !== 1 ? "s" : ""} found
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="sort" className="text-sm text-gray-700">
                  Sort by:
                </Label>
                <Select value={sort} onValueChange={(value) => updateFilter("sort", value)}>
                  <SelectTrigger id="sort" className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="size-low">Size: Small to Large</SelectItem>
                    <SelectItem value="size-high">Size: Large to Small</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Models Grid */}
            {filteredAndSortedModels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedModels.map((model) => (
                  <ModelCard key={model.id} model={model} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500 text-lg mb-4">No models match your filters.</p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="text-teal-600 hover:text-teal-700">
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
