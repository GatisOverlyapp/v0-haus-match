"use client"

import { useState, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { notFound } from "next/navigation"
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
import { Filter, X, ArrowLeft, MapPin } from "lucide-react"
import { getCategoryBySlug, getModelsByCategory } from "../data"
import { houseModels } from "@/app/manufacturers/data"

type SortOption = "price-low" | "price-high" | "size-low" | "size-high" | "newest"

// Extract numeric price from price range string (e.g., "€45,000 - €55,000" -> 45000)
const extractPrice = (priceRange: string): number => {
  const match = priceRange.match(/€?([\d,]+)/)
  if (match) {
    return parseInt(match[1].replace(/,/g, ""), 10)
  }
  return 0
}

interface CategoryDetailClientPageProps {
  slug: string
}

export default function CategoryDetailClientPage({ slug }: CategoryDetailClientPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const category = getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  // Get all models for this category
  const categoryModels = getModelsByCategory(slug)

  // Get filter values from URL
  const priceRange = searchParams.get("price") || "all-prices"
  const bedrooms = searchParams.get("bedrooms") || "any-bedrooms"
  const sizeMin = searchParams.get("sizeMin") || ""
  const sizeMax = searchParams.get("sizeMax") || ""
  const sort = (searchParams.get("sort") || "newest") as SortOption

  // Update URL with new filter
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    // Handle special "all" values
    if (value === "all-prices" || value === "any-bedrooms") {
      params.delete(key)
    } else if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/categories/${slug}?${params.toString()}`)
  }

  // Get unique price ranges for this category
  const getPriceRanges = () => {
    const ranges = new Set(categoryModels.map((m) => m.price_range))
    return Array.from(ranges).sort((a, b) => extractPrice(a) - extractPrice(b))
  }

  const priceRanges = getPriceRanges()

  // Get size range options
  const allSizes = categoryModels.map((m) => m.size_sqm)
  const minSize = allSizes.length > 0 ? Math.min(...allSizes) : 0
  const maxSize = allSizes.length > 0 ? Math.max(...allSizes) : 100

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
      router.push(`/categories/${slug}?${params.toString()}`)
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
        router.push(`/categories/${slug}?${params.toString()}`)
      }
    }
  }

  // Filter and sort models
  const filteredAndSortedModels = useMemo(() => {
    let filtered = [...categoryModels]

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
          // Sort by ID (assuming higher ID = newer)
          return parseInt(b.id.replace("m", ""), 10) - parseInt(a.id.replace("m", ""), 10)
      }
    })

    return sorted
  }, [categoryModels, priceRange, bedrooms, sizeMin, sizeMax, sort])

  const clearFilters = () => {
    router.push(`/categories/${slug}`)
  }

  const hasActiveFilters = priceRange || bedrooms || sizeMin || sizeMax

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation openSubscribeModal={() => setSubscribeModalOpen(true)} />

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Link href="/categories">
            <Button variant="ghost" className="mb-6 text-white hover:bg-teal-700/50 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </Button>
          </Link>

          <div className="max-w-4xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
                <p className="text-lg text-teal-100 leading-relaxed">{category.description}</p>
              </div>
              <Link href="/map">
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <MapPin className="w-4 h-4 mr-2" />
                  View Manufacturers on Map
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {mobileFiltersOpen ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>

            {/* Filter Panel */}
            <div
              className={`bg-white rounded-lg shadow-md p-6 space-y-6 ${
                mobileFiltersOpen ? "block" : "hidden lg:block"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-teal-600 hover:text-teal-700">
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
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
