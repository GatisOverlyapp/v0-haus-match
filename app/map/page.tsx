"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { GoogleMap } from "@/components/google-map"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, MapPin, ChevronUp, ChevronDown, X } from "lucide-react"
import { manufacturers } from "@/app/manufacturers/data"
import Link from "next/link"

export default function MapPage() {
  const searchParams = useSearchParams()
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedManufacturerId, setSelectedManufacturerId] = useState<string | null>(null)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const manufacturerRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Check for manufacturer query parameter on mount
  useEffect(() => {
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
  }, [searchParams])

  // Filter manufacturers based on search query
  const filteredManufacturers = useMemo(() => {
    if (!searchQuery.trim()) {
      return manufacturers
    }

    const query = searchQuery.toLowerCase().trim()
    return manufacturers.filter(
      (manufacturer) =>
        manufacturer.name.toLowerCase().includes(query) ||
        manufacturer.location.toLowerCase().includes(query)
    )
  }, [searchQuery])

  // Handle manufacturer click from list
  const handleManufacturerClick = (manufacturerId: string) => {
    setSelectedManufacturerId(manufacturerId)
    setMobileDrawerOpen(false) // Close drawer on mobile after selection
    
    // Scroll to manufacturer in sidebar (desktop)
    const element = manufacturerRefs.current[manufacturerId]
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  // Handle marker click (will be passed to GoogleMap)
  const handleMarkerClick = (manufacturerId: string) => {
    setSelectedManufacturerId(manufacturerId)
    setMobileDrawerOpen(true) // Open drawer on mobile to show selected manufacturer
    
    // Scroll to manufacturer in sidebar (desktop)
    setTimeout(() => {
      const element = manufacturerRefs.current[manufacturerId]
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <Navigation openSubscribeModal={() => setSubscribeModalOpen(true)} />

      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-6 md:py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold">Find Manufacturers Near You</h1>
          <p className="text-teal-100 mt-2">Explore prefab home manufacturers across Latvia</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row relative" style={{ height: "calc(100vh - 64px - 80px)" }}>
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-[320px] bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 sticky top-0 bg-white border-b border-gray-200 z-10">
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
            <p className="text-sm text-gray-600 mt-2">
              {filteredManufacturers.length} manufacturer{filteredManufacturers.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="p-4 space-y-3">
            {filteredManufacturers.length > 0 ? (
              filteredManufacturers.map((manufacturer) => (
                <Card
                  key={manufacturer.id}
                  ref={(el) => (manufacturerRefs.current[manufacturer.id] = el)}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedManufacturerId === manufacturer.id
                      ? "border-teal-600 border-2 bg-teal-50"
                      : "border-gray-200"
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
                      <h3 className="font-semibold text-gray-900 truncate">{manufacturer.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {manufacturer.location}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
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
                          <Button size="sm" variant="ghost" className="w-full text-xs">
                            Profile
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
          <GoogleMap
            manufacturers={manufacturers}
            filteredManufacturers={searchQuery ? filteredManufacturers : undefined}
            height="100%"
            selectedManufacturerId={selectedManufacturerId || undefined}
            zoom={selectedManufacturerId ? 12 : undefined}
            onMarkerClick={handleMarkerClick}
            onResetFilters={() => setSearchQuery("")}
          />
        </div>

        {/* Mobile Drawer */}
        <div
          className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg transition-transform duration-300 z-20 ${
            mobileDrawerOpen ? "translate-y-0" : "translate-y-[calc(100%-60px)]"
          }`}
          style={{ maxHeight: "70vh" }}
        >
          {/* Drawer Header - Collapsed State */}
          {!mobileDrawerOpen && (
            <div
              className="p-4 border-b border-gray-200 bg-white cursor-pointer"
              onClick={() => setMobileDrawerOpen(true)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-teal-600" />
                  <span className="font-medium text-gray-900">
                    {filteredManufacturers.length} Manufacturer{filteredManufacturers.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <ChevronUp className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          )}

          {/* Drawer Header - Expanded State */}
          {mobileDrawerOpen && (
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex-1">
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

          {/* Drawer Content */}
          {mobileDrawerOpen && (
            <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 73px)" }}>
              <div className="p-4 space-y-3">
                {filteredManufacturers.length > 0 ? (
                  filteredManufacturers.map((manufacturer) => (
                    <Card
                      key={manufacturer.id}
                      ref={(el) => (manufacturerRefs.current[manufacturer.id] = el)}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedManufacturerId === manufacturer.id
                          ? "border-teal-600 border-2 bg-teal-50"
                          : "border-gray-200"
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
                          <h3 className="font-semibold text-gray-900 truncate">{manufacturer.name}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {manufacturer.location}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs"
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
                              <Button size="sm" variant="ghost" className="w-full text-xs">
                                Profile
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

        {/* Mobile Floating Button */}
        {!mobileDrawerOpen && (
          <Button
            className="md:hidden fixed bottom-4 right-4 z-30 bg-teal-600 hover:bg-teal-700 rounded-full w-14 h-14 shadow-lg"
            onClick={() => setMobileDrawerOpen(true)}
          >
            <MapPin className="h-6 w-6" />
          </Button>
        )}
      </main>
    </div>
  )
}
