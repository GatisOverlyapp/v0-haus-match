"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Navigation } from "@/components/navigation"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, ChevronUp, ChevronDown, X, List, Navigation2, RotateCcw, Locate, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Manufacturer } from "@/app/manufacturers/data"
import { useDebounce } from "@/hooks/use-debounce"

// Lazy load react-window to avoid SSR issues
const FixedSizeList = dynamic(() => import("react-window").then(mod => mod.FixedSizeList), {
  ssr: false,
})

// Lazy load GoogleMap component
const GoogleMap = dynamic(() => import("@/components/google-map").then(mod => ({ default: mod.GoogleMap })), {
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
    </div>
  ),
  ssr: false,
})

// Extended manufacturer type with distance and coordinates
type ManufacturerWithDistance = Manufacturer & {
  distance?: number
  coords?: { lat: number; lng: number } | null
}

// Helper function to get coordinates for Latvian cities
const getCoordinatesForLocation = (location: string): { lat: number; lng: number } | null => {
  const locationMap: Record<string, { lat: number; lng: number }> = {
    "Riga, Latvia": { lat: 56.9496, lng: 24.1052 },
    "Liepāja, Latvia": { lat: 56.5047, lng: 21.0108 },
    "Jūrmala, Latvia": { lat: 56.9682, lng: 23.7703 },
    "Valmiera, Latvia": { lat: 57.5411, lng: 25.4275 },
    "Cēsis, Latvia": { lat: 57.3125, lng: 25.2744 },
    "Daugavpils, Latvia": { lat: 55.8756, lng: 26.5364 },
  }
  return locationMap[location] || null
}

// Haversine formula to calculate distance between two coordinates (in km)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function MapPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedManufacturerId, setSelectedManufacturerId] = useState<string | null>(null)
  const [hoveredManufacturerId, setHoveredManufacturerId] = useState<string | null>(null)
  const [keyboardSelectedIndex, setKeyboardSelectedIndex] = useState<number>(-1)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>("all-categories")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [mapZoom, setMapZoom] = useState<number | null>(null)
  const [manufacturers, setManufacturers] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [models, setModels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarHeight, setSidebarHeight] = useState(600)
  const manufacturerRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const sidebarRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const announcementRef = useRef<HTMLDivElement>(null)

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Fetch manufacturers, categories, and models on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)
        const [manufacturersResponse, categoriesResponse, modelsResponse] = await Promise.all([
          fetch("/api/homepage/manufacturers"),
          fetch("/api/homepage/categories"),
          fetch("/api/homepage/models"),
        ])

        if (!manufacturersResponse.ok || !categoriesResponse.ok || !modelsResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const [manufacturersData, categoriesData, modelsData] = await Promise.all([
          manufacturersResponse.json(),
          categoriesResponse.json(),
          modelsResponse.json(),
        ])

        // Validate and set manufacturers
        if (Array.isArray(manufacturersData)) {
          setManufacturers(
            manufacturersData.map((m: any) => ({
              id: m.id,
              name: m.name,
              slug: m.slug,
              location: m.location,
              description: m.description,
              logo: m.logo || undefined,
              lat: m.lat,
              lng: m.lng,
            }))
          )
        }

        // Extract category names from categoriesData
        if (Array.isArray(categoriesData)) {
          const categoryNames = categoriesData.map((c: any) => c.name)
          setCategories(categoryNames)
        }

        // Validate and set models
        if (Array.isArray(modelsData)) {
          setModels(modelsData)
        }
      } catch (error) {
        console.error("Error fetching map data:", error)
        setError("Failed to load manufacturers. Please try refreshing the page.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Check for manufacturer query parameter on mount (using 'selected' param)
  useEffect(() => {
    if (manufacturers.length === 0) return
    const manufacturerSlug = searchParams.get("selected")
    if (manufacturerSlug) {
      const manufacturer = manufacturers.find((m) => m.slug === manufacturerSlug)
      if (manufacturer) {
        setSelectedManufacturerId(manufacturer.id)
        setMobileDrawerOpen(true)
        
        // Center map on manufacturer
        if (manufacturer.lat && manufacturer.lng) {
          setMapCenter({ lat: manufacturer.lat, lng: manufacturer.lng })
          setMapZoom(12)
        }
        
        // Scroll to manufacturer in sidebar after a short delay
        setTimeout(() => {
          const element = manufacturerRefs.current[manufacturer.id]
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        }, 500)
      }
    }
  }, [searchParams, manufacturers])

  // Filter manufacturers based on debounced search query and category
  const filteredManufacturers = useMemo(() => {
    let filtered = manufacturers

    // Filter by debounced search query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (manufacturer) =>
          manufacturer.name.toLowerCase().includes(query) ||
          manufacturer.location.toLowerCase().includes(query)
      )
    }

    // Filter by category
    if (categoryFilter !== "all-categories") {
      const manufacturerIdsWithCategory = new Set(
        models
          .filter((model) => model.category === categoryFilter)
          .map((model) => model.manufacturerId)
      )
      filtered = filtered.filter((manufacturer) =>
        manufacturerIdsWithCategory.has(manufacturer.id)
      )
    }

    // Add distance and sort if user location is available
    if (userLocation) {
      const manufacturersWithDistance: ManufacturerWithDistance[] = filtered.map((manufacturer) => {
        // Manufacturers already have lat/lng from database
        if (manufacturer.lat && manufacturer.lng) {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            manufacturer.lat,
            manufacturer.lng
          )
          return { ...manufacturer, distance, coords: { lat: manufacturer.lat, lng: manufacturer.lng } }
        }
        return { ...manufacturer, distance: Infinity, coords: null }
      })

      // Sort by distance
      manufacturersWithDistance.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
      return manufacturersWithDistance
    }

    return filtered
  }, [debouncedSearchQuery, categoryFilter, userLocation, manufacturers, models])

  // Update keyboard selected index when filtered manufacturers change
  useEffect(() => {
    if (keyboardSelectedIndex >= filteredManufacturers.length) {
      setKeyboardSelectedIndex(-1)
    }
  }, [filteredManufacturers.length, keyboardSelectedIndex])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard events if user is typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setKeyboardSelectedIndex((prev) => {
          const next = prev < filteredManufacturers.length - 1 ? prev + 1 : prev
          if (next >= 0 && next < filteredManufacturers.length) {
            const manufacturer = filteredManufacturers[next]
            const element = manufacturerRefs.current[manufacturer.id]
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "nearest" })
            }
          }
          return next
        })
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setKeyboardSelectedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : 0
          if (next >= 0 && next < filteredManufacturers.length) {
            const manufacturer = filteredManufacturers[next]
            const element = manufacturerRefs.current[manufacturer.id]
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "nearest" })
            }
          }
          return next
        })
      } else if (e.key === "Enter" && keyboardSelectedIndex >= 0 && keyboardSelectedIndex < filteredManufacturers.length) {
        e.preventDefault()
        const manufacturer = filteredManufacturers[keyboardSelectedIndex]
        if (manufacturer) {
          handleManufacturerClick(manufacturer.id)
        }
      } else if (e.key === "Escape") {
        e.preventDefault()
        setSelectedManufacturerId(null)
        setKeyboardSelectedIndex(-1)
        const params = new URLSearchParams(searchParams.toString())
        params.delete("selected")
        router.push(`/map?${params.toString()}`, { scroll: false })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [filteredManufacturers, keyboardSelectedIndex, searchParams, router])

  // Announce selection to screen readers
  useEffect(() => {
    if (selectedManufacturerId && announcementRef.current) {
      const manufacturer = manufacturers.find((m) => m.id === selectedManufacturerId)
      if (manufacturer) {
        announcementRef.current.textContent = `Selected manufacturer: ${manufacturer.name}`
      }
    }
  }, [selectedManufacturerId, manufacturers])

  // Focus management for mobile drawer
  useEffect(() => {
    if (mobileDrawerOpen && drawerRef.current) {
      const firstInput = drawerRef.current.querySelector("input")
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100)
      }
    }
  }, [mobileDrawerOpen])

  // Handle manufacturer card click - center map and highlight
  const handleManufacturerClick = useCallback((manufacturerId: string, e?: React.MouseEvent) => {
    // Stop propagation if clicking on View Profile button
    if (e) {
      e.stopPropagation()
    }
    
    if (manufacturers.length === 0) return
    const manufacturer = manufacturers.find((m) => m.id === manufacturerId)
    if (manufacturer && manufacturer.lat && manufacturer.lng) {
      setSelectedManufacturerId(manufacturerId)
      setKeyboardSelectedIndex(filteredManufacturers.findIndex((m) => m.id === manufacturerId))
      setMobileDrawerOpen(false) // Close drawer on mobile after selection
      
      // Center map on manufacturer
      setMapCenter({ lat: manufacturer.lat, lng: manufacturer.lng })
      setMapZoom(12)
      
      // Update URL with 'selected' param
      const params = new URLSearchParams(searchParams.toString())
      params.set("selected", manufacturer.slug)
      router.push(`/map?${params.toString()}`, { scroll: false })
      
      // Scroll to manufacturer in sidebar (desktop)
      setTimeout(() => {
        const element = manufacturerRefs.current[manufacturerId]
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 100)
    }
  }, [manufacturers, filteredManufacturers, searchParams, router])

  // Handle marker click - update URL and highlight card
  const handleMarkerClick = useCallback((manufacturerId: string) => {
    if (manufacturers.length === 0) return
    const manufacturer = manufacturers.find((m) => m.id === manufacturerId)
    if (manufacturer) {
      setSelectedManufacturerId(manufacturerId)
      setKeyboardSelectedIndex(filteredManufacturers.findIndex((m) => m.id === manufacturerId))
      setMobileDrawerOpen(true) // Open drawer on mobile to show selected manufacturer
      
      // Center map on manufacturer
      if (manufacturer.lat && manufacturer.lng) {
        setMapCenter({ lat: manufacturer.lat, lng: manufacturer.lng })
        setMapZoom(12)
      }
      
      // Update URL with 'selected' param
      const params = new URLSearchParams(searchParams.toString())
      params.set("selected", manufacturer.slug)
      router.push(`/map?${params.toString()}`, { scroll: false })
      
      // Scroll to manufacturer in sidebar (desktop)
      setTimeout(() => {
        const element = manufacturerRefs.current[manufacturerId]
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 100)
    }
  }, [manufacturers, filteredManufacturers, searchParams, router])

  // Handle marker hover
  const handleMarkerHover = useCallback((manufacturerId: string | null) => {
    setHoveredManufacturerId(manufacturerId)
  }, [])

  // Reset view to show all Latvia
  const handleResetView = () => {
    setSelectedManufacturerId(null)
    setKeyboardSelectedIndex(-1)
    setMapCenter({ lat: 56.8796, lng: 24.6032 })
    setMapZoom(7)
    
    // Clear manufacturer from URL
    const params = new URLSearchParams(searchParams.toString())
    params.delete("selected")
    router.push(`/map?${params.toString()}`, { scroll: false })
  }

  // Center map on user location
  const handleMyLocation = () => {
    if (userLocation) {
      setMapCenter(userLocation)
      setMapZoom(10)
      setSelectedManufacturerId(null)
      setKeyboardSelectedIndex(-1)
      
      // Clear manufacturer from URL
      const params = new URLSearchParams(searchParams.toString())
      params.delete("selected")
      router.push(`/map?${params.toString()}`, { scroll: false })
    } else {
      // Request location if not available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            setUserLocation(location)
            setMapCenter(location)
            setMapZoom(10)
            setSelectedManufacturerId(null)
            setKeyboardSelectedIndex(-1)
            
            // Clear manufacturer from URL
            const params = new URLSearchParams(searchParams.toString())
            params.delete("selected")
            router.push(`/map?${params.toString()}`, { scroll: false })
          },
          (error) => {
            alert("Unable to get your location. Please enable location services.")
          }
        )
      }
    }
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("")
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }

  // Render manufacturer card
  const renderManufacturerCard = useCallback((manufacturer: any, isMobile: boolean = false, index?: number) => {
    const isSelected = selectedManufacturerId === manufacturer.id
    const isKeyboardSelected = keyboardSelectedIndex === index
    const isHovered = hoveredManufacturerId === manufacturer.id
    
    return (
      <Card
        key={manufacturer.id}
        ref={(el) => (manufacturerRefs.current[manufacturer.id] = el)}
        className={`p-4 transition-all duration-200 cursor-pointer ${
          isSelected
            ? "border-teal-600 border-2 bg-teal-50 shadow-md"
            : isKeyboardSelected
            ? "border-teal-400 border-2 bg-teal-50/50 shadow-md ring-2 ring-teal-200"
            : isHovered
            ? "border-teal-300 border-2 bg-teal-50/30 shadow-lg"
            : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
        }`}
        onClick={() => handleManufacturerClick(manufacturer.id)}
        onMouseEnter={() => setHoveredManufacturerId(manufacturer.id)}
        onMouseLeave={() => setHoveredManufacturerId(null)}
        tabIndex={0}
        role="button"
        aria-label={`${manufacturer.name}, ${manufacturer.location}. ${isSelected ? "Selected" : "Click to view on map"}`}
        aria-pressed={isSelected}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
            {manufacturer.logo ? (
              <img
                src={manufacturer.logo}
                alt={`${manufacturer.name} logo`}
                className="w-full h-full object-contain"
              />
            ) : (
              <MapPin className="h-6 w-6 text-teal-600" aria-hidden="true" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 truncate text-sm">{manufacturer.name}</h3>
              {"distance" in manufacturer && manufacturer.distance !== undefined && manufacturer.distance < 50 && (
                <Badge className="bg-orange-100 text-orange-800 text-xs flex-shrink-0">Near Me</Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1 truncate">
              <MapPin className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{manufacturer.location}</span>
            </p>
            {"distance" in manufacturer && manufacturer.distance !== undefined && manufacturer.distance !== Infinity && (
              <p className="text-xs text-gray-500 mt-1">
                {manufacturer.distance.toFixed(1)} km away
              </p>
            )}
            {manufacturer.description && (
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{manufacturer.description}</p>
            )}
            <div className="mt-3">
              <Link
                href={`/manufacturers/${manufacturer.slug}`}
                onClick={(e) => handleManufacturerClick(manufacturer.id, e)}
                className="inline-block"
                aria-label={`View profile for ${manufacturer.name}`}
              >
                <Button 
                  size="sm" 
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs"
                >
                  View Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    )
  }, [selectedManufacturerId, keyboardSelectedIndex, hoveredManufacturerId, handleManufacturerClick])

  // Virtualized list item renderer
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const manufacturer = filteredManufacturers[index]
    if (!manufacturer) return null
    
    return (
      <div style={style} className="px-4 pb-3">
        {renderManufacturerCard(manufacturer, false, index)}
      </div>
    )
  }, [filteredManufacturers, renderManufacturerCard])

  // Calculate sidebar height for virtualization (must be before conditional returns)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateHeight = () => {
        setSidebarHeight(window.innerHeight - 200)
      }
      updateHeight()
      window.addEventListener("resize", updateHeight)
      return () => window.removeEventListener("resize", updateHeight)
    }
  }, [])

  const shouldVirtualize = filteredManufacturers.length > 50

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col items-center justify-center" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-4" aria-hidden="true" />
        <p className="text-gray-600">Loading manufacturers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col items-center justify-center p-4" role="alert" aria-live="polite">
        <div className="text-center max-w-md">
          <p className="text-red-600 font-medium mb-2">Error loading map</p>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} aria-label="Retry loading map">Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Screen reader announcements */}
      <div ref={announcementRef} className="sr-only" aria-live="polite" aria-atomic="true"></div>

      {/* Navigation */}
      <Navigation openSubscribeModal={() => setSubscribeModalOpen(true)} />

      {/* Header - Desktop Only */}
      <header className="hidden md:block bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 flex-shrink-0">
        <div className="container mx-auto px-4">
          <h1 className="text-xl font-bold">Manufacturers Map</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row relative min-h-0">
        {/* Desktop Sidebar */}
        <aside 
          ref={sidebarRef}
          className="hidden md:block w-[320px] bg-white border-r border-gray-200 overflow-y-auto flex flex-col"
          aria-label="Manufacturers list"
        >
          {/* Sidebar Header */}
          <div className="p-4 sticky top-0 bg-white border-b border-gray-200 z-10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Find Manufacturers</h2>
              <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100" aria-label={`${filteredManufacturers.length} manufacturers found`}>
                {filteredManufacturers.length}
              </Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search manufacturers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-8"
                aria-label="Search manufacturers"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div>
              <label htmlFor="category-filter" className="text-xs font-medium text-gray-700 mb-1.5 block">Filter by Home Type</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter" className="w-full" aria-label="Filter by home type">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  {categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))
                  ) : null}
                </SelectContent>
              </Select>
              {categoryFilter !== "all-categories" && (
                <div className="mt-2">
                  <Badge className="bg-teal-100 text-teal-800 text-xs">
                    {categoryFilter}
                    <button
                      onClick={() => setCategoryFilter("all-categories")}
                      className="ml-1 hover:text-teal-900"
                      aria-label={`Clear ${categoryFilter} filter`}
                    >
                      <X className="h-3 w-3 inline" />
                    </button>
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Manufacturer List */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredManufacturers && filteredManufacturers.length > 0 ? (
              shouldVirtualize && typeof window !== "undefined" ? (
                <FixedSizeList
                  height={sidebarHeight}
                  itemCount={filteredManufacturers.length}
                  itemSize={180}
                  width="100%"
                >
                  {Row}
                </FixedSizeList>
              ) : (
                <div className="space-y-3">
                  {filteredManufacturers.map((manufacturer, index) => renderManufacturerCard(manufacturer, false, index))}
                </div>
              )
            ) : (
              <div className="text-center py-12 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" aria-hidden="true" />
                <p className="font-medium mb-2">No manufacturers found</p>
                <p className="text-sm mb-4">Try adjusting your search or filters</p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSearch}
                    className="text-xs"
                    aria-label="Clear search"
                  >
                    Clear search
                  </Button>
                  {categoryFilter !== "all-categories" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCategoryFilter("all-categories")}
                      className="text-xs"
                      aria-label="Clear category filter"
                    >
                      Clear filter
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Map Container */}
        <div className="flex-1 relative min-h-0">
          {/* Map Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetView}
              className="bg-white hover:bg-gray-50 shadow-md border-gray-300"
              aria-label="Reset view to show all Latvia"
            >
              <RotateCcw className="h-4 w-4 mr-1" aria-hidden="true" />
              Reset View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleMyLocation}
              className="bg-white hover:bg-gray-50 shadow-md border-gray-300"
              aria-label="Center on your location"
            >
              <Locate className="h-4 w-4 mr-1" aria-hidden="true" />
              My Location
            </Button>
          </div>
          <GoogleMap
            manufacturers={manufacturers}
            filteredManufacturers={
              debouncedSearchQuery || categoryFilter !== "all-categories" ? filteredManufacturers : undefined
            }
            height="100%"
            selectedManufacturerId={selectedManufacturerId || undefined}
            hoveredManufacturerId={hoveredManufacturerId || undefined}
            zoom={mapZoom || (selectedManufacturerId ? 12 : undefined)}
            center={mapCenter}
            onMarkerClick={handleMarkerClick}
            onMarkerHover={handleMarkerHover}
            onResetFilters={() => {
              setSearchQuery("")
              setCategoryFilter("all-categories")
            }}
          />
        </div>

        {/* Mobile Drawer */}
        <div
          ref={drawerRef}
          className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-teal-200 shadow-2xl transition-transform duration-300 ease-out z-20 ${
            mobileDrawerOpen ? "translate-y-0" : "translate-y-[calc(100%-56px)]"
          }`}
          style={{ maxHeight: "75vh" }}
          role="dialog"
          aria-label="Manufacturers list"
          aria-modal="true"
        >
          {/* Drawer Header - Collapsed State */}
          {!mobileDrawerOpen && (
            <div
              className="p-4 bg-gradient-to-r from-teal-50 to-white cursor-pointer border-b border-gray-200"
              onClick={() => setMobileDrawerOpen(true)}
              role="button"
              tabIndex={0}
              aria-label="Open manufacturers list"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setMobileDrawerOpen(true)
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-teal-600" aria-hidden="true" />
                  <span className="font-semibold text-gray-900">
                    {filteredManufacturers.length} Manufacturer{filteredManufacturers.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <ChevronUp className="h-5 w-5 text-teal-600" aria-hidden="true" />
              </div>
            </div>
          )}

          {/* Drawer Header - Expanded State */}
          {mobileDrawerOpen && (
            <div className="p-4 border-b-2 border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-2 flex-1">
                <h2 className="text-lg font-bold text-gray-900">Find Manufacturers</h2>
                <Badge className="bg-teal-100 text-teal-800">{filteredManufacturers.length}</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileDrawerOpen(false)}
                className="ml-2"
                aria-label="Close manufacturers list"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Drawer Content - Search and List */}
          {mobileDrawerOpen && (
            <div className="flex flex-col" style={{ maxHeight: "calc(75vh - 73px)" }}>
              {/* Search Bar and Filters */}
              <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
                  <Input
                    type="text"
                    placeholder="Search manufacturers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-8 bg-white"
                    aria-label="Search manufacturers"
                  />
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div>
                  <label htmlFor="mobile-category-filter" className="text-xs font-medium text-gray-700 mb-1.5 block">Filter by Home Type</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger id="mobile-category-filter" className="w-full" aria-label="Filter by home type">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-categories">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {categoryFilter !== "all-categories" && (
                    <div className="mt-2">
                      <Badge className="bg-teal-100 text-teal-800 text-xs">
                        {categoryFilter}
                        <button
                          onClick={() => setCategoryFilter("all-categories")}
                          className="ml-1 hover:text-teal-900"
                          aria-label={`Clear ${categoryFilter} filter`}
                        >
                          <X className="h-3 w-3 inline" />
                        </button>
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredManufacturers && filteredManufacturers.length > 0 ? (
                  filteredManufacturers.map((manufacturer, index) => renderManufacturerCard(manufacturer, true, index))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" aria-hidden="true" />
                    <p className="font-medium mb-2">No manufacturers found</p>
                    <p className="text-sm mb-4">Try adjusting your search or filters</p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearSearch}
                        className="text-xs"
                        aria-label="Clear search"
                      >
                        Clear search
                      </Button>
                      {categoryFilter !== "all-categories" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCategoryFilter("all-categories")}
                          className="text-xs"
                          aria-label="Clear category filter"
                        >
                          Clear filter
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Floating List Button */}
        {!mobileDrawerOpen && (
          <Button
            className="md:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 bg-teal-600 hover:bg-teal-700 shadow-xl px-6 py-3 rounded-full"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label={`Open manufacturers list, ${filteredManufacturers.length} manufacturers`}
          >
            <List className="h-5 w-5 mr-2" aria-hidden="true" />
            <span className="font-medium">List</span>
            <Badge className="ml-2 bg-white text-teal-600">{filteredManufacturers.length}</Badge>
          </Button>
        )}
      </main>
    </div>
  )
}
