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
  MapPin,
  LayoutGrid,
  Layout,
} from "lucide-react"
import dynamic from "next/dynamic"
import { ModelCard } from "@/components/model-card"
import type { HouseModel } from "@/app/manufacturers/data"
import type { Manufacturer } from "@/app/manufacturers/data"
import { detectUserCountry, getCountryInfo, getAllCountries, type CountryInfo } from "@/lib/location"
import Link from "next/link"

// Browse by Category Component
function BrowseByCategorySection({ models, onCategoryClick }: { models: HouseModel[], onCategoryClick: (category: string) => void }) {
  // Calculate counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    models.forEach((model) => {
      if (model.category) {
        counts[model.category] = (counts[model.category] || 0) + 1
      }
    })
    return counts
  }, [models])

  // Get top 5 categories
  const topCategories = useMemo(() => {
    const sorted = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
    
    return sorted.map(([category]) => category)
  }, [categoryCounts])

  // Category images mapping (using Unsplash placeholders)
  const categoryImages: Record<string, string> = {
    "Tiny House": "https://images.unsplash.com/photo-1580582932707-520aee102907?w=400&h=300&fit=crop",
    "Modular": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
    "ADU": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
    "Cabin": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
    "Container Home": "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=400&h=300&fit=crop",
    "A-Frame": "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=300&fit=crop",
  }

  if (topCategories.length === 0) return null

  return (
    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
      <div className="flex gap-4 md:grid md:grid-cols-5 md:gap-6">
        {topCategories.map((category) => {
          const count = categoryCounts[category] || 0
          const imageUrl = categoryImages[category] || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop"
          
          return (
            <button
              key={category}
              onClick={() => onCategoryClick(category.toLowerCase().replace(/\s+/g, "-"))}
              className="group flex-shrink-0 w-64 md:w-auto relative h-48 md:h-56 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all"
            >
              <div className="absolute inset-0">
                <img
                  src={imageUrl}
                  alt={category}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-bold text-lg mb-1">{category}</h3>
                <p className="text-sm opacity-90">{count} home{count !== 1 ? "s" : ""}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronDown } from "lucide-react"

// Lazy load GoogleMap component
const GoogleMap = dynamic(() => import("@/components/google-map").then(mod => ({ default: mod.GoogleMap })), {
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
    </div>
  ),
  ssr: false,
})

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

type ViewMode = "grid" | "split"

export function HomeSearch({ models, manufacturers }: HomeSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isFiltering, setIsFiltering] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [showMapMobile, setShowMapMobile] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo | null>(null)
  const [isDetectingCountry, setIsDetectingCountry] = useState(true)
  const [visibleCount, setVisibleCount] = useState(10)

  // Load view preference from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem("homeSearchViewMode") as ViewMode | null
      if (savedView === "grid" || savedView === "split") {
        setViewMode(savedView)
      }
    }
  }, [])

  // Detect country on mount
  useEffect(() => {
    const detectCountry = async () => {
      if (typeof window === "undefined") return
      
      // Check if user has manually selected a country
      const savedCountry = localStorage.getItem("selectedCountry")
      if (savedCountry) {
        const countryInfo = getCountryInfo(savedCountry)
        setSelectedCountry(countryInfo)
        setIsDetectingCountry(false)
        return
      }

      // Auto-detect country
      try {
        setIsDetectingCountry(true)
        const countryInfo = await detectUserCountry()
        console.log("🌍 Detected country:", countryInfo.name)
        setSelectedCountry(countryInfo)
      } catch (error) {
        console.error("Error detecting country:", error)
        // Default to Latvia but don't filter strictly
        setSelectedCountry(getCountryInfo("Latvia"))
      } finally {
        setIsDetectingCountry(false)
      }
    }

    detectCountry()
  }, [])

  // Save country preference when changed
  const handleCountryChange = (countryName: string) => {
    const countryInfo = getCountryInfo(countryName)
    setSelectedCountry(countryInfo)
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedCountry", countryName)
    }
  }

  // Save view preference to localStorage
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    if (typeof window !== "undefined") {
      localStorage.setItem("homeSearchViewMode", mode)
    }
  }

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
  const sortParam = (searchParams.get("sort") || "price") as "price" | "size" | "newest" | "price-desc"
  
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

    // Country filter - only apply if country is detected and not currently detecting
    if (selectedCountry && !isDetectingCountry) {
      const countryManufacturers = manufacturers
        .filter((m) => {
          // Handle missing country field (backwards compatibility)
          if (!m.country) return true // Show manufacturers without country field
          return m.country === selectedCountry.name
        })
        .map((m) => m.id)
      
      // If we have matching manufacturers, filter by them
      if (countryManufacturers.length > 0) {
        filtered = filtered.filter((model) => 
          countryManufacturers.includes(model.manufacturerId)
        )
      }
      // If no manufacturers match, show all (fallback)
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (activeSort === "price") {
        return extractPrice(a.price_range || "") - extractPrice(b.price_range || "")
      }
      if (activeSort === "price-desc") {
        return extractPrice(b.price_range || "") - extractPrice(a.price_range || "")
      }
      if (activeSort === "size") {
        return (b.size_sqm || 0) - (a.size_sqm || 0)
      }
      return (a.name || "").localeCompare(b.name || "")
    })

    // Debug logging
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 Filtered models:", 
        `Total: ${models.length}, Filtered: ${filtered.length}, Country: ${selectedCountry?.name || "none"}, Detecting: ${isDetectingCountry}, Manufacturers: ${manufacturers.length}`
      )
    }

    return filtered
  }, [searchQuery, activeCategory, activePriceMin, activePriceMax, activeSizeMin, activeSizeMax, activeManufacturer, activeSort, parsedQuery, models, selectedCountry, manufacturers, isDetectingCountry])

  // Get visible models (pagination)
  const visibleModels = useMemo(() => {
    return filteredModels.slice(0, visibleCount)
  }, [filteredModels, visibleCount])

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(10)
  }, [searchQuery, activeCategory, activePriceMin, activePriceMax, activeSizeMin, activeSizeMax, activeManufacturer, selectedCountry])

  // Get unique manufacturers from filtered models (also filter by country)
  const filteredManufacturers = useMemo(() => {
    const manufacturerIds = new Set(filteredModels.map((m) => m.manufacturerId))
    let filtered = manufacturers.filter((m) => manufacturerIds.has(m.id))
    
    // Debug logging
    if (process.env.NODE_ENV === "development") {
      console.log("🏭 Filtered manufacturers:", 
        `Total: ${manufacturers.length}, From Models: ${filtered.length}, Country: ${selectedCountry?.name || "none"}, Detecting: ${isDetectingCountry}`
      )
    }
    
    // Also filter by country if selected and not detecting
    if (selectedCountry && !isDetectingCountry) {
      const countryFiltered = filtered.filter((m) => {
        // Handle missing country field (backwards compatibility)
        if (!m.country) return true
        return m.country === selectedCountry.name
      })
      
      // Only apply country filter if we have matches, otherwise show all
      if (countryFiltered.length > 0) {
        filtered = countryFiltered
      }
    }
    
    return filtered
  }, [filteredModels, manufacturers, selectedCountry, isDetectingCountry])

  // Check if we're showing all manufacturers due to no country match
  const showingAllDueToNoMatch = useMemo(() => {
    if (!selectedCountry || isDetectingCountry) return false
    const countryManufacturers = manufacturers.filter((m) => {
      if (!m.country) return false
      return m.country === selectedCountry.name
    })
    return countryManufacturers.length === 0 && filteredManufacturers.length > 0
  }, [selectedCountry, isDetectingCountry, manufacturers, filteredManufacturers])

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

  // Detect mobile/desktop
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <section id="find-home" className="w-full bg-gray-50">
      {/* Search & Filters Section */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Country Selector & Search Bar */}
          <div className="max-w-3xl mx-auto mb-8">
            {/* Country Selector */}
            <div className="flex items-center justify-center gap-3 mb-6">
              {isDetectingCountry ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                  <span>Detecting your location...</span>
                </div>
              ) : selectedCountry ? (
                <>
                  <span className="text-sm text-gray-600">Builders in</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-9 px-3 border-teal-300 hover:border-teal-500 hover:bg-teal-50"
                      >
                        <span className="mr-2 text-lg">{selectedCountry.flag}</span>
                        <span className="font-medium">{selectedCountry.name}</span>
                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-0" align="center">
                      <div className="max-h-64 overflow-y-auto">
                        {getAllCountries().map((country) => (
                          <button
                            key={country.code}
                            onClick={() => handleCountryChange(country.name)}
                            className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                              selectedCountry.name === country.name ? "bg-teal-50" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{country.flag}</span>
                              <span>{country.name}</span>
                            </div>
                            {selectedCountry.name === country.name && (
                              <Check className="h-4 w-4 text-teal-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </>
              ) : null}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by style, price, or describe what you want..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-12 pr-12 h-14 text-base border-gray-300 focus:border-teal-500 focus:ring-teal-500"
              />
              {isFiltering && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-5 w-5 text-teal-600 animate-spin" />
                </div>
              )}
            </div>
            <p className="mt-3 text-sm text-gray-500 text-center">
              e.g., 'nordic tiny house under €50k' or paste Pinterest link
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="max-w-5xl mx-auto space-y-5">
            {/* Categories */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategories.includes(category)
                        ? "bg-teal-600 text-white hover:bg-teal-700"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-teal-500 hover:text-teal-600"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map((range) => (
                  <button
                    key={range}
                    onClick={() => togglePriceRange(range)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedPriceRange === range
                        ? "bg-teal-600 text-white hover:bg-teal-700"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-teal-500 hover:text-teal-600"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Range */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Size</label>
              <div className="flex flex-wrap gap-2">
                {SIZE_RANGES.map((range) => (
                  <button
                    key={range}
                    onClick={() => toggleSizeRange(range)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedSizeRange === range
                        ? "bg-teal-600 text-white hover:bg-teal-700"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-teal-500 hover:text-teal-600"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filters Pills */}
          {(activeFilters.length > 0 || activeManufacturer) && (
            <div className="max-w-5xl mx-auto mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter.key}
                    className="bg-teal-600 text-white hover:bg-teal-700 px-3 py-1.5 text-sm rounded-full flex items-center gap-1.5"
                  >
                    {filter.value}
                    <button
                      onClick={() => handleRemoveFilter(filter.key)}
                      className="ml-1 hover:bg-teal-800 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${filter.label} filter`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {activeManufacturer && selectedManufacturer && (
                  <Badge className="bg-teal-600 text-white hover:bg-teal-700 px-3 py-1.5 text-sm rounded-full flex items-center gap-1.5">
                    {selectedManufacturer.name}
                    <button
                      onClick={handleClearManufacturer}
                      className="ml-1 hover:bg-teal-800 rounded-full p-0.5 transition-colors"
                      aria-label="Remove manufacturer filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-gray-600 hover:text-gray-900 ml-2"
                >
                  Clear all
                </Button>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-gray-200">
            <div>
              {isFiltering ? (
                <span className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
                  Filtering...
                </span>
              ) : (
                <>
                  <p className="text-lg text-gray-900">
                    <span className="font-bold text-teal-600">{filteredModels.length}</span>{" "}
                    {filteredModels.length === 1 ? "home" : "homes"} found from{" "}
                    <span className="font-bold text-teal-600">{filteredManufacturers.length}</span>{" "}
                    {filteredManufacturers.length === 1 ? "manufacturer" : "manufacturers"}
                  </p>
                  {showingAllDueToNoMatch && selectedCountry && (
                    <p className="text-sm text-gray-500 mt-2">
                      Showing all builders (we're expanding to {selectedCountry.name} soon!)
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Browse by Category Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Style</h2>
        <BrowseByCategorySection models={models} onCategoryClick={(category) => updateURL({ category })} />
      </div>

      {/* Browse by Category Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Style</h2>
        <BrowseByCategorySection 
          models={models} 
          onCategoryClick={(category) => updateURL({ category })} 
        />
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* View Mode Toggle & Sort - Top Right */}
        <div className="flex items-center justify-end gap-3 mb-6">
          {/* Desktop: View Mode Toggle Buttons */}
          {!isMobile && (
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
              <button
                onClick={() => handleViewModeChange("grid")}
                className={`px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all ${
                  viewMode === "grid"
                    ? "bg-teal-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <div className="w-px h-6 bg-gray-300" />
              <button
                onClick={() => handleViewModeChange("split")}
                className={`px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all ${
                  viewMode === "split"
                    ? "bg-teal-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                aria-label="Split view"
              >
                <Layout className="h-4 w-4" />
                <span className="hidden sm:inline">Split</span>
              </button>
            </div>
          )}
          
          {/* Sort Dropdown */}
          <Select value={activeSort} onValueChange={(v: "price" | "size" | "newest" | "price-desc") => {
            updateURL({ sort: v })
          }}>
            <SelectTrigger className="w-48 border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="size">Size</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Split View Layout */}
        {!isMobile && viewMode === "split" ? (
          <div className="flex gap-6 h-[calc(100vh-300px)]">
            {/* Left: Scrollable Results Grid (50%) */}
            <div className="w-1/2 overflow-y-auto pr-4">
              {isFiltering ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
                  <p className="text-gray-500">Filtering results...</p>
                </div>
              ) : filteredModels.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-4 lg:gap-6">
                    {visibleModels.map((model) => (
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
                  {filteredModels.length > visibleCount && (
                    <div className="flex justify-center mt-8">
                      <Button
                        onClick={() => setVisibleCount(prev => prev + 10)}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2"
                      >
                        Show More ({filteredModels.length - visibleCount} remaining)
                      </Button>
                    </div>
                  )}
                </>
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

            {/* Right: Fixed Map (50%) */}
            <div className="w-1/2 sticky top-0 h-full">
              <div className="relative h-full rounded-lg overflow-hidden border border-gray-200 shadow-lg bg-white">
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
        ) : (
          /* Desktop/Tablet: Grid View (Full Width) */
          <div>
            {isFiltering ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
                <p className="text-gray-500">Filtering results...</p>
              </div>
            ) : filteredModels.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {visibleModels.map((model) => (
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
                {filteredModels.length > visibleCount && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={() => setVisibleCount(prev => prev + 10)}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2"
                    >
                      Show More ({filteredModels.length - visibleCount} remaining)
                    </Button>
                  </div>
                )}
              </>
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
        )}
      </div>

      {/* Mobile: Floating Map Button */}
      {isMobile && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-xl bg-teal-600 hover:bg-teal-700"
            onClick={() => setShowMapMobile(true)}
          >
            <Map className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Mobile: Full-Screen Map Overlay */}
      {showMapMobile && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center justify-between bg-white shadow-sm">
              <h2 className="font-semibold text-lg text-gray-900">Map View</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMapMobile(false)}
                className="text-gray-600"
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
            <div className="p-4 border-t bg-white shadow-sm">
              <Button
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                onClick={() => setShowMapMobile(false)}
              >
                <Grid3x3 className="h-4 w-4 mr-2" />
                Back to Results
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
