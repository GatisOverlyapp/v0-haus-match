"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  X,
  Map,
  Grid3x3,
  Loader2,
} from "lucide-react"
import { GoogleMap } from "@/components/google-map"
import { ModelCard } from "@/components/model-card"
import type { HouseModel } from "@/app/manufacturers/data"
import type { Manufacturer } from "@/app/manufacturers/data"

interface HomeSearchProps {
  models: (HouseModel & { manufacturer?: { id: string; name: string; slug: string } })[]
  manufacturers: (Manufacturer & { lat?: number; lng?: number })[]
}

const CATEGORIES = ["Tiny House", "Modular", "A-Frame", "Cabin", "Container Home"]
const PRICE_RANGES = ["<€50k", "€50-80k", "€80-120k", "€120k+"]
const SIZE_RANGES = ["<40m²", "40-60m²", "60-80m²", "80-100m²", "100m²+"]

// Parse free-text query into structured search intent
const parseSearchQuery = (query: string) => {
  const lowerQuery = query.toLowerCase()

  // Parse category/type
  let category = ""
  if (lowerQuery.includes("tiny house") || lowerQuery.includes("tiny home")) {
    category = "Tiny House"
  } else if (lowerQuery.includes("a-frame")) {
    category = "A-Frame"
  } else if (lowerQuery.includes("container")) {
    category = "Container Home"
  } else if (lowerQuery.includes("cabin")) {
    category = "Cabin"
  } else if (lowerQuery.includes("modular")) {
    category = "Modular"
  }

  // Parse price range
  let priceMin: number | null = null
  let priceMax: number | null = null
  const priceMatch = lowerQuery.match(/(\d+)k?[-–](\d+)k?|under (\d+)k?|below (\d+)k?|(\d+)k? budget|up to (\d+)k?/)
  if (priceMatch) {
    if (priceMatch[1] && priceMatch[2]) {
      const min = parseInt(priceMatch[1], 10)
      const max = parseInt(priceMatch[2], 10)
      if (!isNaN(min) && !isNaN(max)) {
        priceMin = min * 1000
        priceMax = max * 1000
      }
    } else if (priceMatch[3] || priceMatch[4] || priceMatch[6]) {
      const limitStr = priceMatch[3] || priceMatch[4] || priceMatch[6]
      if (limitStr) {
        const limit = parseInt(limitStr, 10)
        if (!isNaN(limit)) {
          priceMin = 0
          priceMax = limit * 1000
        }
      }
    } else if (priceMatch[5]) {
      const budget = parseInt(priceMatch[5], 10)
      if (!isNaN(budget)) {
        priceMin = 0
        priceMax = budget * 1000
      }
    }
  }

  // Parse size range
  let sizeMin: number | null = null
  let sizeMax: number | null = null
  const sizeMatch = lowerQuery.match(/(\d+)\s*m²?|(\d+)\s*square/)
  if (sizeMatch) {
    const sqmStr = sizeMatch[1] || sizeMatch[2]
    if (sqmStr) {
      const sqm = parseInt(sqmStr, 10)
      if (!isNaN(sqm)) {
        if (sqm < 40) {
          sizeMin = 0
          sizeMax = 40
        } else if (sqm < 60) {
          sizeMin = 40
          sizeMax = 60
        } else if (sqm < 80) {
          sizeMin = 60
          sizeMax = 80
        } else if (sqm < 100) {
          sizeMin = 80
          sizeMax = 100
        } else {
          sizeMin = 100
          sizeMax = Infinity
        }
      }
    }
  }

  return { category, priceMin, priceMax, sizeMin, sizeMax }
}

// Helper to parse price range
const parsePriceRange = (range: string): { min: number; max: number } => {
  if (range === "<€50k") return { min: 0, max: 50000 }
  if (range === "€50-80k") return { min: 50000, max: 80000 }
  if (range === "€80-120k") return { min: 80000, max: 120000 }
  if (range === "€120k+") return { min: 120000, max: Infinity }
  return { min: 0, max: Infinity }
}

// Helper to parse size range
const parseSizeRange = (range: string): { min: number; max: number } => {
  if (range === "<40m²") return { min: 0, max: 40 }
  if (range === "40-60m²") return { min: 40, max: 60 }
  if (range === "60-80m²") return { min: 60, max: 80 }
  if (range === "80-100m²") return { min: 80, max: 100 }
  if (range === "100m²+") return { min: 100, max: Infinity }
  return { min: 0, max: Infinity }
}

// Helper to extract price from price_range string
const extractPrice = (priceRange: string): number => {
  const match = priceRange.match(/€?([\d,]+)/)
  if (match) {
    return parseInt(match[1].replace(/,/g, ""))
  }
  return 0
}

export function HomeSearch({ models, manufacturers }: HomeSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isFiltering, setIsFiltering] = useState(false)
  const [showMapMobile, setShowMapMobile] = useState(false)

  // Get state from URL params
  const searchQuery = searchParams.get("q") || ""
  const categoryParam = searchParams.get("category") || ""
  const priceMinParamStr = searchParams.get("price_min")
  const priceMaxParamStr = searchParams.get("price_max")
  const sizeMinParamStr = searchParams.get("size_min")
  const sizeMaxParamStr = searchParams.get("size_max")
  const priceMinParam = priceMinParamStr ? parseInt(priceMinParamStr, 10) : null
  const priceMaxParam = priceMaxParamStr ? parseInt(priceMaxParamStr, 10) : null
  const sizeMinParam = sizeMinParamStr ? parseInt(sizeMinParamStr, 10) : null
  const sizeMaxParam = sizeMaxParamStr ? parseInt(sizeMaxParamStr, 10) : null
  const manufacturerParam = searchParams.get("manufacturer") || ""
  const sortParam = (searchParams.get("sort") || "price") as "price" | "size" | "newest"
  
  // Validate parsed params
  const validPriceMin = priceMinParam !== null && !isNaN(priceMinParam) ? priceMinParam : null
  const validPriceMax = priceMaxParam !== null && !isNaN(priceMaxParam) ? priceMaxParam : null
  const validSizeMin = sizeMinParam !== null && !isNaN(sizeMinParam) ? sizeMinParam : null
  const validSizeMax = sizeMaxParam !== null && !isNaN(sizeMaxParam) ? sizeMaxParam : null

  // Parse search query for filters
  const parsedQuery = useMemo(() => {
    if (!searchQuery.trim()) return { category: "", priceMin: null, priceMax: null, sizeMin: null, sizeMax: null }
    return parseSearchQuery(searchQuery)
  }, [searchQuery])

  // Combine URL params with parsed query (parsed query takes precedence for category/price/size)
  const activeCategory = parsedQuery.category || categoryParam || ""
  const activePriceMin = parsedQuery.priceMin ?? validPriceMin
  const activePriceMax = parsedQuery.priceMax ?? validPriceMax
  const activeSizeMin = parsedQuery.sizeMin ?? validSizeMin
  const activeSizeMax = parsedQuery.sizeMax ?? validSizeMax
  const activeManufacturer = manufacturerParam
  const activeSort = sortParam

  // Convert to UI filter states
  const selectedCategories = activeCategory ? [activeCategory] : []
  const selectedPriceRange = useMemo(() => {
    if (activePriceMin !== null && activePriceMax !== null) {
      if (activePriceMax <= 50000) return "<€50k"
      if (activePriceMin >= 50000 && activePriceMax <= 80000) return "€50-80k"
      if (activePriceMin >= 80000 && activePriceMax <= 120000) return "€80-120k"
      if (activePriceMin >= 120000) return "€120k+"
    }
    return null
  }, [activePriceMin, activePriceMax])

  const selectedSizeRange = useMemo(() => {
    if (activeSizeMin !== null && activeSizeMax !== null) {
      if (activeSizeMax <= 40) return "<40m²"
      if (activeSizeMin >= 40 && activeSizeMax <= 60) return "40-60m²"
      if (activeSizeMin >= 60 && activeSizeMax <= 80) return "60-80m²"
      if (activeSizeMin >= 80 && activeSizeMax <= 100) return "80-100m²"
      if (activeSizeMin >= 100) return "100m²+"
    }
    return null
  }, [activeSizeMin, activeSizeMax])

  // Update URL params
  const updateURL = (updates: Record<string, string | null>) => {
    try {
      setIsFiltering(true)
      const params = new URLSearchParams(searchParams.toString())
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      const newUrl = params.toString() ? `/?${params.toString()}` : "/"
      router.push(newUrl, { scroll: false })
      
      // Reset filtering state after a short delay
      setTimeout(() => setIsFiltering(false), 300)
    } catch (error) {
      console.error("Error updating URL:", error)
      setIsFiltering(false)
    }
  }

  // Filter models based on all criteria
  const filteredModels = useMemo(() => {
    let filtered = models

    // Text search (if not already parsed into filters)
    if (searchQuery.trim() && !parsedQuery.category && !parsedQuery.priceMin) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (model) =>
          (model.name && model.name.toLowerCase().includes(query)) ||
          (model.description && model.description.toLowerCase().includes(query)) ||
          (model.category && model.category.toLowerCase().includes(query)) ||
          (Array.isArray(model.style_tags) && model.style_tags.some((tag) => tag && tag.toLowerCase().includes(query)))
      )
    }

    // Category filter
    if (activeCategory) {
      filtered = filtered.filter((model) => model.category === activeCategory)
    }

    // Price filter
    if (activePriceMin !== null || activePriceMax !== null) {
      filtered = filtered.filter((model) => {
        if (!model.price_range) return false
        const price = extractPrice(model.price_range)
        const min = activePriceMin ?? 0
        const max = activePriceMax ?? Infinity
        return price >= min && price <= max
      })
    }

    // Size filter
    if (activeSizeMin !== null || activeSizeMax !== null) {
      filtered = filtered.filter((model) => {
        if (model.size_sqm === undefined || model.size_sqm === null) return false
        const min = activeSizeMin ?? 0
        const max = activeSizeMax ?? Infinity
        return model.size_sqm >= min && model.size_sqm <= max
      })
    }

    // Manufacturer filter (from map)
    if (activeManufacturer) {
      filtered = filtered.filter((model) => model.manufacturerId === activeManufacturer)
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (activeSort === "price") {
        return extractPrice(a.price_range || "") - extractPrice(b.price_range || "")
      }
      if (activeSort === "size") {
        return (b.size_sqm || 0) - (a.size_sqm || 0)
      }
      return (a.name || "").localeCompare(b.name || "")
    })

    return filtered
  }, [searchQuery, activeCategory, activePriceMin, activePriceMax, activeSizeMin, activeSizeMax, activeManufacturer, activeSort, parsedQuery, models])

  // Get unique manufacturers from filtered models
  const filteredManufacturers = useMemo(() => {
    const manufacturerIds = new Set(filteredModels.map((m) => m.manufacturerId))
    return manufacturers.filter((m) => manufacturerIds.has(m.id))
  }, [filteredModels, manufacturers])

  // Get selected manufacturer name
  const selectedManufacturer = useMemo(() => {
    if (!activeManufacturer) return null
    return manufacturers.find((m) => m.id === activeManufacturer)
  }, [activeManufacturer, manufacturers])

  // Get active filters for display
  const activeFilters = useMemo(() => {
    const filters: Array<{ key: string; label: string; value: string }> = []
    
    if (activeCategory) {
      filters.push({ key: "category", label: "Category", value: activeCategory })
    }
    if (selectedPriceRange) {
      filters.push({ key: "price", label: "Price", value: selectedPriceRange })
    }
    if (selectedSizeRange) {
      filters.push({ key: "size", label: "Size", value: selectedSizeRange })
    }
    if (searchQuery.trim() && !parsedQuery.category && !parsedQuery.priceMin) {
      filters.push({ key: "q", label: "Search", value: searchQuery })
    }

    return filters
  }, [activeCategory, selectedPriceRange, selectedSizeRange, searchQuery, parsedQuery])

  // Toggle category filter
  const toggleCategory = (category: string) => {
    const newCategory = selectedCategories.includes(category) ? "" : category
    updateURL({ category: newCategory || null })
  }

  // Toggle price range
  const togglePriceRange = (range: string) => {
    if (selectedPriceRange === range) {
      updateURL({ price_min: null, price_max: null })
    } else {
      const { min, max } = parsePriceRange(range)
      updateURL({ 
        price_min: min === 0 ? null : min.toString(),
        price_max: max === Infinity ? null : max.toString()
      })
    }
  }

  // Toggle size range
  const toggleSizeRange = (range: string) => {
    if (selectedSizeRange === range) {
      updateURL({ size_min: null, size_max: null })
    } else {
      const { min, max } = parseSizeRange(range)
      updateURL({ 
        size_min: min === 0 ? null : min.toString(),
        size_max: max === Infinity ? null : max.toString()
      })
    }
  }

  // Handle search query change
  const handleSearchChange = (value: string) => {
    updateURL({ q: value || null })
  }

  // Handle map marker click
  const handleMarkerClick = (manufacturerId: string) => {
    updateURL({ manufacturer: manufacturerId })
  }

  // Reset manufacturer filter
  const handleClearManufacturer = () => {
    updateURL({ manufacturer: null })
  }

  // Clear all filters
  const handleClearAll = () => {
    router.push("/")
  }

  // Remove specific filter
  const handleRemoveFilter = (key: string) => {
    if (key === "category") {
      updateURL({ category: null })
    } else if (key === "price") {
      updateURL({ price_min: null, price_max: null })
    } else if (key === "size") {
      updateURL({ size_min: null, size_max: null })
    } else if (key === "q") {
      updateURL({ q: null })
    }
  }

  return (
    <section id="find-home" className="w-full py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="What type of home are you looking for?"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-12 h-14 text-lg"
            />
            {isFiltering && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-5 w-5 text-teal-600 animate-spin" />
              </div>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            e.g., 'nordic tiny house under €50k' or paste Pinterest link
          </p>
        </div>

        {/* Active Filters Pills */}
        {(activeFilters.length > 0 || activeManufacturer) && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {activeFilters.map((filter) => (
              <Badge
                key={filter.key}
                variant="default"
                className="bg-teal-100 text-teal-800 hover:bg-teal-200 px-3 py-1"
              >
                {filter.label}: {filter.value}
                <button
                  onClick={() => handleRemoveFilter(filter.key)}
                  className="ml-2 hover:text-teal-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {activeManufacturer && selectedManufacturer && (
              <Badge
                variant="default"
                className="bg-orange-100 text-orange-800 hover:bg-orange-200 px-3 py-1"
              >
                Manufacturer: {selectedManufacturer.name}
                <button
                  onClick={handleClearManufacturer}
                  className="ml-2 hover:text-orange-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-teal-600 hover:text-teal-700"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Manufacturer Filter Banner */}
        {activeManufacturer && selectedManufacturer && (
          <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold text-orange-900">
                Viewing {selectedManufacturer.name} homes
              </p>
              <p className="text-sm text-orange-700">
                {filteredModels.length} {filteredModels.length === 1 ? "home" : "homes"} found
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearManufacturer}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              Clear
            </Button>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-6 space-y-4">
          {/* Categories */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className={`px-4 py-2 cursor-pointer ${
                    selectedCategories.includes(category)
                      ? "bg-teal-600 hover:bg-teal-700"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                  {selectedCategories.includes(category) && (
                    <X className="h-3 w-3 ml-2" onClick={(e) => {
                      e.stopPropagation()
                      toggleCategory(category)
                    }} />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((range) => (
                <Badge
                  key={range}
                  variant={selectedPriceRange === range ? "default" : "outline"}
                  className={`px-4 py-2 cursor-pointer ${
                    selectedPriceRange === range
                      ? "bg-teal-600 hover:bg-teal-700"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => togglePriceRange(range)}
                >
                  {range}
                  {selectedPriceRange === range && (
                    <X className="h-3 w-3 ml-2" onClick={(e) => {
                      e.stopPropagation()
                      togglePriceRange(range)
                    }} />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Size Range */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Size</label>
            <div className="flex flex-wrap gap-2">
              {SIZE_RANGES.map((range) => (
                <Badge
                  key={range}
                  variant={selectedSizeRange === range ? "default" : "outline"}
                  className={`px-4 py-2 cursor-pointer ${
                    selectedSizeRange === range
                      ? "bg-teal-600 hover:bg-teal-700"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => toggleSizeRange(range)}
                >
                  {range}
                  {selectedSizeRange === range && (
                    <X className="h-3 w-3 ml-2" onClick={(e) => {
                      e.stopPropagation()
                      toggleSizeRange(range)
                    }} />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {isFiltering ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                Filtering...
              </span>
            ) : (
              <>
                <span className="font-semibold">{filteredModels.length}</span>{" "}
                {filteredModels.length === 1 ? "home" : "homes"} found from{" "}
                <span className="font-semibold">{filteredManufacturers.length}</span>{" "}
                {filteredManufacturers.length === 1 ? "manufacturer" : "manufacturers"}
              </>
            )}
          </p>
          <div className="flex items-center gap-2">
            <Select value={activeSort} onValueChange={(v: "price" | "size" | "newest") => updateURL({ sort: v })}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="size">Size</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Split Screen Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Side - Results Grid (60% on desktop) */}
          <div className="flex-1 lg:w-[60%]">
            {isFiltering ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
                <p className="text-gray-500">Filtering results...</p>
              </div>
            ) : filteredModels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModels.map((model) => (
                  <div key={model.id} className="relative">
                    <ModelCard model={model} />
                    {activeManufacturer === model.manufacturerId && (
                      <div className="absolute top-3 left-3 z-20">
                        <Badge className="bg-orange-500 text-white shadow-md">Selected</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-2">No homes match your filters.</p>
                <p className="text-gray-400 text-sm mb-4">Try adjusting your criteria.</p>
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>

          {/* Right Side - Map (40% on desktop, hidden on mobile) */}
          <div className="hidden lg:block lg:w-[40%] sticky top-4 h-[calc(100vh-200px)]">
            <div className="relative h-full rounded-lg overflow-hidden border border-gray-200">
              {activeManufacturer && (
                <div className="absolute top-4 left-4 z-10">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClearManufacturer}
                    className="bg-white hover:bg-gray-50 shadow-md"
                  >
                    Show All
                  </Button>
                </div>
              )}
              <GoogleMap
                manufacturers={filteredManufacturers}
                height="100%"
                selectedManufacturerId={activeManufacturer || undefined}
                onMarkerClick={handleMarkerClick}
                onResetFilters={handleClearManufacturer}
              />
            </div>
          </div>
        </div>

        {/* Mobile Map View */}
        {showMapMobile && (
          <div className="lg:hidden fixed inset-0 z-50 bg-white">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center justify-between bg-white">
                <h2 className="font-semibold text-lg">Map View</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMapMobile(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 relative">
                <GoogleMap
                  manufacturers={filteredManufacturers}
                  height="100%"
                  selectedManufacturerId={activeManufacturer || undefined}
                  onMarkerClick={(manufacturerId) => {
                    handleMarkerClick(manufacturerId)
                    setShowMapMobile(false)
                  }}
                  onResetFilters={handleClearManufacturer}
                />
              </div>
              <div className="p-4 border-t bg-white">
                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={() => setShowMapMobile(false)}
                >
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  Back to Grid
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Floating Map Button */}
        <div className="lg:hidden fixed bottom-6 right-6 z-40">
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg bg-teal-600 hover:bg-teal-700"
            onClick={() => setShowMapMobile(true)}
          >
            <Map className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </section>
  )
}
