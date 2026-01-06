"use client"

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ruler, Bed, Bath, Heart, ChevronLeft, ChevronRight } from "lucide-react"
import type { HouseModel } from "@/app/manufacturers/data"
import { manufacturers } from "@/app/manufacturers/data"

// Props for the ModelCard component
export interface ModelCardProps {
  model: HouseModel & { manufacturer?: { id: string; name: string; slug: string } }
  className?: string
}

export function ModelCard({ model, className }: ModelCardProps) {
  // Find manufacturer by ID if not provided
  const manufacturer = model.manufacturer || manufacturers.find((m) => m.id === model.manufacturerId)
  const manufacturerSlug = manufacturer?.slug || ""
  const manufacturerName = manufacturer?.name || "Unknown Manufacturer"

  // Get images or placeholder
  const images = model.images && model.images.length > 0 ? model.images : ["/placeholder.svg"]
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Extract price from price range (e.g., "€45,000 - €55,000" -> "From €45,000")
  const formatPrice = (priceRange: string): string => {
    const match = priceRange.match(/€?([\d,]+)/)
    if (match) {
      const firstPrice = match[1].replace(/,/g, "")
      return `From €${parseInt(firstPrice).toLocaleString()}`
    }
    return priceRange
  }

  const handlePreviousImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Future: Implement save functionality
  }

  return (
    <Card
      className={`overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group ${className || ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/models/${model.slug}`} className="block">
        {/* Image Container - 4:3 Aspect Ratio */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={images[currentImageIndex]}
            alt={model.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? "scale-105" : "scale-100"
            }`}
          />

          {/* Category Badge - Top Left */}
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white/90 font-medium shadow-sm">
              {model.category}
            </Badge>
          </div>

          {/* Heart Icon - Top Right (Future Save Feature) */}
          <button
            onClick={handleHeartClick}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
            aria-label="Save model"
          >
            <Heart className="h-5 w-5 text-gray-600 hover:text-red-500 transition-colors" />
          </button>

          {/* Image Carousel Controls - Show on hover if multiple images */}
          {images.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={handlePreviousImage}
                className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-sm ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>

              {/* Next Button */}
              <button
                onClick={handleNextImage}
                className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-sm ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>

              {/* Carousel Dots - Bottom Center */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setCurrentImageIndex(index)
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentImageIndex
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/60 hover:bg-white/80"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content Below Image */}
        <div className="p-4">
          {/* Model Name */}
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {model.name}
          </h3>

          {/* Manufacturer Name - Clickable */}
          {manufacturer && (
            <Link
              href={`/manufacturers/${manufacturerSlug}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-gray-600 hover:text-teal-600 transition-colors mb-2 inline-block"
            >
              {manufacturerName}
            </Link>
          )}

          {/* Specs Line - Compact with icons */}
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
            <div className="flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5" />
              <span>{model.size_sqm} m²</span>
            </div>
            <span className="text-gray-400">·</span>
            <div className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              <span>{model.bedrooms} bed{model.bedrooms !== 1 ? "s" : ""}</span>
            </div>
            <span className="text-gray-400">·</span>
            <div className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              <span>{model.bathrooms} bath{model.bathrooms !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Price Range - Bold, Teal Color */}
          <div className="text-base font-semibold text-teal-600 mt-2">
            {formatPrice(model.price_range)}
          </div>
        </div>
      </Link>
    </Card>
  )
}
