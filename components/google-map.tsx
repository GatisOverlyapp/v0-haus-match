"use client"

import { useState, useMemo, useEffect } from "react"
import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps"
import Link from "next/link"
import { Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Manufacturer } from "@/app/manufacturers/data"

interface GoogleMapProps {
  manufacturers: Manufacturer[]
  filteredManufacturers?: Manufacturer[]
  height?: string
  selectedManufacturerId?: string
  hoveredManufacturerId?: string
  onMarkerClick?: (manufacturerId: string) => void
  onMarkerHover?: (manufacturerId: string | null) => void
  onResetFilters?: () => void
  zoom?: number
  center?: { lat: number; lng: number } | null
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

// Default center: Latvia
const DEFAULT_CENTER = { lat: 56.8796, lng: 24.6032 }
const DEFAULT_ZOOM = 7

export function GoogleMap({ 
  manufacturers, 
  filteredManufacturers, 
  height = "500px", 
  selectedManufacturerId, 
  hoveredManufacturerId,
  onMarkerClick, 
  onMarkerHover,
  onResetFilters, 
  zoom, 
  center 
}: GoogleMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<string | null>(selectedManufacturerId || null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // Determine which manufacturers to display
  const manufacturersToDisplay = filteredManufacturers || manufacturers

  // Check if filters are active
  const hasActiveFilters = filteredManufacturers !== undefined && filteredManufacturers.length !== manufacturers.length

  // Process manufacturers with coordinates
  const manufacturersWithCoords = useMemo(() => {
    return manufacturersToDisplay
      .map((manufacturer) => {
        const coords = getCoordinatesForLocation(manufacturer.location)
        return coords ? { ...manufacturer, ...coords } : null
      })
      .filter((m): m is Manufacturer & { lat: number; lng: number } => m !== null)
  }, [manufacturersToDisplay])

  // Find selected manufacturer coordinates (must be defined before calculatedCenter)
  const selectedManufacturer = useMemo(() => {
    if (!selectedManufacturerId) return null
    return manufacturersWithCoords.find((m) => m.id === selectedManufacturerId)
  }, [selectedManufacturerId, manufacturersWithCoords])

  // Calculate map bounds to fit all visible markers (only if center prop is not provided)
  const calculatedCenter = useMemo(() => {
    if (center) {
      return center
    }

    // If a manufacturer is selected, center on it
    if (selectedManufacturer) {
      return { lat: selectedManufacturer.lat, lng: selectedManufacturer.lng }
    }

    if (manufacturersWithCoords.length === 0) {
      return DEFAULT_CENTER
    }

    if (manufacturersWithCoords.length === 1) {
      return { lat: manufacturersWithCoords[0].lat, lng: manufacturersWithCoords[0].lng }
    }

    // Calculate center point of all markers
    const avgLat = manufacturersWithCoords.reduce((sum, m) => sum + m.lat, 0) / manufacturersWithCoords.length
    const avgLng = manufacturersWithCoords.reduce((sum, m) => sum + m.lng, 0) / manufacturersWithCoords.length

    return { lat: avgLat, lng: avgLng }
  }, [manufacturersWithCoords, center, selectedManufacturer])

  // Calculate appropriate zoom level based on marker spread
  const calculatedZoom = useMemo(() => {
    if (manufacturersWithCoords.length === 0) {
      return DEFAULT_ZOOM
    }

    if (manufacturersWithCoords.length === 1) {
      return zoom || 12
    }

    // Calculate bounding box
    const lats = manufacturersWithCoords.map((m) => m.lat)
    const lngs = manufacturersWithCoords.map((m) => m.lng)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    const latDiff = maxLat - minLat
    const lngDiff = maxLng - minLng
    const maxDiff = Math.max(latDiff, lngDiff)

    // Estimate zoom based on spread (rough calculation)
    if (maxDiff > 2) return 6
    if (maxDiff > 1) return 7
    if (maxDiff > 0.5) return 8
    if (maxDiff > 0.2) return 9
    if (maxDiff > 0.1) return 10
    return 11
  }, [manufacturersWithCoords, zoom])

  // Update selected marker when prop changes
  useEffect(() => {
    if (selectedManufacturerId) {
      setSelectedMarker(selectedManufacturerId)
    }
  }, [selectedManufacturerId])

  if (!apiKey) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}
        role="alert"
        aria-live="polite"
      >
        <div className="text-center p-8">
          <p className="text-red-600 font-medium">Google Maps API key is missing</p>
          <p className="text-gray-600 text-sm mt-2">
            Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}
        role="alert"
        aria-live="polite"
      >
        <div className="text-center p-8">
          <p className="text-red-600 font-medium">Error loading map</p>
          <p className="text-gray-600 text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-md relative" style={{ height }}>
      {/* Reset Filters Button */}
      {hasActiveFilters && onResetFilters && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            size="sm"
            variant="outline"
            onClick={onResetFilters}
            className="bg-white hover:bg-gray-50 shadow-md border-gray-300"
            aria-label="Show all manufacturers"
          >
            Show All Manufacturers
          </Button>
        </div>
      )}

      <APIProvider
        apiKey={apiKey}
        onLoad={() => setIsLoading(false)}
        onError={(err) => setError(err.message || "Failed to load Google Maps")}
      >
        <Map
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          center={calculatedCenter}
          zoom={selectedManufacturer ? (zoom || 12) : (zoom || calculatedZoom)}
          mapId="haus-match-map"
          className="w-full h-full"
          gestureHandling="greedy"
          disableDefaultUI={false}
          zoomControl={true}
          mapTypeControl={true}
          fullscreenControl={true}
          streetViewControl={false}
          aria-label="Manufacturers map"
        >
          {manufacturersWithCoords.map((manufacturer) => {
            const isSelected = selectedMarker === manufacturer.id
            const isHovered = hoveredManufacturerId === manufacturer.id
            
            return (
              <AdvancedMarker
                key={manufacturer.id}
                position={{ lat: manufacturer.lat, lng: manufacturer.lng }}
                onClick={() => {
                  setSelectedMarker(manufacturer.id)
                  onMarkerClick?.(manufacturer.id)
                }}
                onMouseEnter={() => onMarkerHover?.(manufacturer.id)}
                onMouseLeave={() => onMarkerHover?.(null)}
              >
                {/* Custom teal marker icon with pulse animation on hover */}
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-lg transition-all ${
                    isSelected
                      ? "bg-teal-600 border-teal-700 scale-110"
                      : isHovered
                      ? "bg-teal-500 border-teal-600 scale-105 animate-pulse"
                      : "bg-teal-500 border-teal-600 hover:scale-105"
                  }`}
                  aria-label={`${manufacturer.name} marker`}
                >
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              </AdvancedMarker>
            )
          })}

          {/* Info Window */}
          {selectedMarker && (
            (() => {
              const manufacturer = manufacturersWithCoords.find((m) => m.id === selectedMarker)
              if (!manufacturer) return null

              return (
                <InfoWindow
                  position={{ lat: manufacturer.lat, lng: manufacturer.lng }}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold text-gray-900 mb-1">{manufacturer.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{manufacturer.location}</p>
                    <Link
                      href={`/manufacturers/${manufacturer.slug}`}
                      className="inline-block px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded transition-colors"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`View profile for ${manufacturer.name}`}
                    >
                      View Profile
                    </Link>
                  </div>
                </InfoWindow>
              )
            })()
          )}
        </Map>
      </APIProvider>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10" role="status" aria-live="polite">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-2" aria-hidden="true"></div>
            <p className="text-gray-600 text-sm">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  )
}
