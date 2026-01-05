"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { GoogleMap } from "@/components/google-map"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, ChevronUp, ChevronDown, X, List, Navigation2, RotateCcw, Locate } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Manufacturer } from "@/app/manufacturers/data"

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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>("all-categories")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [mapZoom, setMapZoom] = useState<number | null>(null)
  const [manufacturers, setManufacturers] = useState<any[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [models, setModels] = useState<any[]>([])
  const manufacturerRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Fetch manufacturers, categories, and models on mount
  useEffect(() => {
    async function fetchData() {
      try {
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
      }
    }
    fetchData()
  }, [])

  // Check for manufacturer query parameter on mount
  useEffect(() => {
    if (manufacturers.length === 0) return
    const manufacturerSlug = searchParams.get("manufacturer")
    if (manufacturerSlug) {
      const manufacturer = manufacturers.find((m) => m.slug === manufacturerSlug)
      if (manufacturer) {
        setSelectedManufacturerId(manufacturer.id)
        setMobileDrawerOpen(true) // Open drawer on mobile to show selected manufacturer
        
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

  // Filter manufacturers based on search query and category
  const filteredManufacturers = useMemo(() => {
    let filtered = manufacturers

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
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
  }, [searchQuery, categoryFilter, userLocation, manufacturers, models])

  // Handle manufacturer click from list - update URL
  const handleManufacturerClick = (manufacturerId: string) => {
    if (manufacturers.length === 0) return
    const manufacturer = manufacturers.find((m) => m.id === manufacturerId)
    if (manufacturer) {
      setSelectedManufacturerId(manufacturerId)
      setMobileDrawerOpen(false) // Close drawer on mobile after selection
      
      // Update URL without page reload
      const params = new URLSearchParams(searchParams.toString())
      params.set("manufacturer", manufacturer.slug)
      router.push(`/map?${params.toString()}`, { scroll: false })
      
      // Scroll to manufacturer in sidebar (desktop)
      setTimeout(() => {
        const element = manufacturerRefs.current[manufacturerId]
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 100)
    }
  }

  // Handle marker click - update URL
  const handleMarkerClick = (manufacturerId: string) => {
    if (manufacturers.length === 0) return
    const manufacturer = manufacturers.find((m) => m.id === manufacturerId)
    if (manufacturer) {
      setSelectedManufacturerId(manufacturerId)
      setMobileDrawerOpen(true) // Open drawer on mobile to show selected manufacturer
      
      // Update URL without page reload
      const params = new URLSearchParams(searchParams.toString())
      params.set("manufacturer", manufacturer.slug)
      router.push(`/map?${params.toString()}`, { scroll: false })
      
      // Scroll to manufacturer in sidebar (desktop)
      setTimeout(() => {
        const element = manufacturerRefs.current[manufacturerId]
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }, 100)
    }
  }

  // Reset view to show all Latvia
  const handleResetView = () => {
    setSelectedManufacturerId(null)
    setMapCenter({ lat: 56.8796, lng: 24.6032 })
    setMapZoom(7)
    
    // Clear manufacturer from URL
    const params = new URLSearchParams(searchParams.toString())
    params.delete("manufacturer")
    router.push(`/map?${params.toString()}`, { scroll: false })
  }

  // Center map on user location
  const handleMyLocation = () => {
    if (userLocation) {
      setMapCenter(userLocation)
      setMapZoom(10)
      setSelectedManufacturerId(null)
      
      // Clear manufacturer from URL
      const params = new URLSearchParams(searchParams.toString())
      params.delete("manufacturer")
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
            
            // Clear manufacturer from URL
            const params = new URLSearchParams(searchParams.toString())
            params.delete("manufacturer")
            router.push(`/map?${params.toString()}`, { scroll: false })
          },
          (error) => {
            alert("Unable to get your location. Please enable location services.")
          }
        )
      }
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
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
        <aside className="hidden md:block w-[320px] bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 sticky top-0 bg-white border-b border-gray-200 z-10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Find Manufacturers</h2>
              <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">
                {filteredManufacturers.length}
              </Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search manufacturers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Filter by Home Type</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full">
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
            </div>
          </div>

          {/* Scrollable Manufacturer List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredManufacturers && filteredManufacturers.length > 0 ? (
              filteredManufacturers.map((manufacturer) => (
                <Card
                  key={manufacturer.id}
                  ref={(el) => (manufacturerRefs.current[manufacturer.id] = el)}
                  className={`p-4 transition-all duration-200 hover:shadow-lg ${
                    selectedManufacturerId === manufacturer.id
                      ? "border-teal-600 border-2 bg-teal-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                      {manufacturer.logo ? (
                        <img
                          src={manufacturer.logo}
                          alt={manufacturer.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <MapPin className="h-6 w-6 text-teal-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 truncate">{manufacturer.name}</h3>
                        {"distance" in manufacturer && manufacturer.distance < 50 && (
                          <Badge className="bg-orange-100 text-orange-800 text-xs">Near Me</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-teal-600" />
                        {manufacturer.location}
                      </p>
                      {"distance" in manufacturer && manufacturer.distance !== Infinity && (
                        <p className="text-xs text-gray-500 mt-1">
                          {manufacturer.distance.toFixed(1)} km away
                        </p>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs border-teal-600 text-teal-600 hover:bg-teal-50"
                          onClick={() => handleManufacturerClick(manufacturer.id)}
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          View on Map
                        </Button>
                        <Link
                          href={`/manufacturers/${manufacturer.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1"
                        >
                          <Button size="sm" variant="ghost" className="w-full text-xs hover:bg-gray-100">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No manufacturers found</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-2"
                >
                  Clear search
                </Button>
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
              title="Reset view to show all Latvia"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleMyLocation}
              className="bg-white hover:bg-gray-50 shadow-md border-gray-300"
              title="Center on your location"
            >
              <Locate className="h-4 w-4 mr-1" />
              My Location
            </Button>
          </div>
          <GoogleMap
            manufacturers={manufacturers}
            filteredManufacturers={
              searchQuery || categoryFilter !== "all-categories" ? filteredManufacturers : undefined
            }
            height="100%"
            selectedManufacturerId={selectedManufacturerId || undefined}
            zoom={mapZoom || (selectedManufacturerId ? 12 : undefined)}
            center={mapCenter}
            onMarkerClick={handleMarkerClick}
            onResetFilters={() => {
              setSearchQuery("")
              setCategoryFilter("all-categories")
            }}
          />
        </div>

        {/* Mobile Drawer */}
        <div
          className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-teal-200 shadow-2xl transition-transform duration-300 ease-out z-20 ${
            mobileDrawerOpen ? "translate-y-0" : "translate-y-[calc(100%-56px)]"
          }`}
          style={{ maxHeight: "75vh" }}
        >
          {/* Drawer Header - Collapsed State */}
          {!mobileDrawerOpen && (
            <div
              className="p-4 bg-gradient-to-r from-teal-50 to-white cursor-pointer border-b border-gray-200"
              onClick={() => setMobileDrawerOpen(true)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-teal-600" />
                  <span className="font-semibold text-gray-900">
                    {filteredManufacturers.length} Manufacturer{filteredManufacturers.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <ChevronUp className="h-5 w-5 text-teal-600" />
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search manufacturers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">Filter by Home Type</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full">
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
                </div>
              </div>
              
              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredManufacturers && filteredManufacturers.length > 0 ? (
                  filteredManufacturers.map((manufacturer) => (
                    <Card
                      key={manufacturer.id}
                      ref={(el) => (manufacturerRefs.current[manufacturer.id] = el)}
                      className={`p-4 transition-all duration-200 hover:shadow-lg ${
                        selectedManufacturerId === manufacturer.id
                          ? "border-teal-600 border-2 bg-teal-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                          {manufacturer.logo ? (
                            <img
                              src={manufacturer.logo}
                              alt={manufacturer.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <MapPin className="h-6 w-6 text-teal-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 truncate">{manufacturer.name}</h3>
                            {"distance" in manufacturer && manufacturer.distance < 50 && (
                              <Badge className="bg-orange-100 text-orange-800 text-xs">Near Me</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                            <MapPin className="h-3.5 w-3.5 text-teal-600" />
                            {manufacturer.location}
                          </p>
                          {"distance" in manufacturer && manufacturer.distance !== Infinity && (
                            <p className="text-xs text-gray-500 mt-1">
                              {manufacturer.distance.toFixed(1)} km away
                            </p>
                          )}
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs border-teal-600 text-teal-600 hover:bg-teal-50"
                              onClick={() => handleManufacturerClick(manufacturer.id)}
                            >
                              <MapPin className="h-3 w-3 mr-1" />
                              View on Map
                            </Button>
                            <Link
                              href={`/manufacturers/${manufacturer.slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1"
                            >
                              <Button size="sm" variant="ghost" className="w-full text-xs hover:bg-gray-100">
                                View Profile
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No manufacturers found</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
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
          >
            <List className="h-5 w-5 mr-2" />
            <span className="font-medium">List</span>
            <Badge className="ml-2 bg-white text-teal-600">{filteredManufacturers.length}</Badge>
          </Button>
        )}
      </main>
    </div>
  )
}
