"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Ruler, Bed, Bath, Heart, ChevronLeft, ChevronRight, Mail } from "lucide-react"
import { ContactForm } from "@/components/contact-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { HouseModel } from "@/app/manufacturers/data"
import { manufacturers } from "@/app/manufacturers/data"

// Props for the ModelCard component
export interface ModelCardProps {
  model: HouseModel & { manufacturer?: { id: string; name: string; slug: string } }
  className?: string
}

export function ModelCard({ model, className }: ModelCardProps) {
  const router = useRouter()
  
  // Find manufacturer by ID if not provided
  const manufacturer = model.manufacturer || manufacturers.find((m) => m.id === model.manufacturerId)
  const manufacturerSlug = manufacturer?.slug || ""
  const manufacturerName = manufacturer?.name || "Unknown Manufacturer"
  const manufacturerId = manufacturer?.id || model.manufacturerId

  // Get images or placeholder
  const images = model.images && model.images.length > 0 ? model.images : ["/placeholder.svg"]
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)

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

  const handleManufacturerClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (manufacturerSlug) {
      router.push(`/manufacturers/${manufacturerSlug}`)
    }
  }

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setContactModalOpen(true)
  }

  return (
    <>
    <Link href={`/models/${model.slug}`} className="block">
      <Card
        className={`overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group ${className || ""} hover:scale-[1.02]`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container - 4:3 Aspect Ratio */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={images[currentImageIndex]}
            alt={model.name || "Model image"}
            className={`w-full h-full object-cover transition-transform duration-500 rounded-t-lg ${
              isHovered ? "scale-105" : "scale-100"
            }`}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg"
            }}
          />

          {/* Category Badge - Top Left (Small, Subtle) */}
          {model.category && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-white/95 backdrop-blur-sm text-gray-800 hover:bg-white font-medium text-xs px-2 py-0.5 shadow-sm border border-gray-200/50">
                {model.category}
              </Badge>
            </div>
          )}

          {/* Heart Icon - Top Right (Ghost Style) */}
          <button
            onClick={handleHeartClick}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm hover:shadow-md"
            aria-label="Save model"
          >
            <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 transition-colors" />
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
                <ChevronLeft className="h-4 w-4 text-gray-700" />
              </button>

              {/* Next Button */}
              <button
                onClick={handleNextImage}
                className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-sm ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4 text-gray-700" />
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
        <div className="p-4 flex flex-col gap-3">
          {/* Model Name - Large, Bold */}
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {model.name}
          </h3>

          {/* Manufacturer Name - Smaller, Gray, Clickable */}
          {manufacturer && (
            <button
              onClick={handleManufacturerClick}
              className="text-sm text-gray-600 hover:text-teal-600 transition-colors line-clamp-1 text-left"
            >
              {manufacturerName}
            </button>
          )}

          {/* Specs Row - Icons + Numbers */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5" />
              <span>{model.size_sqm || "N/A"} m²</span>
            </div>
            <span className="text-gray-400">·</span>
            <div className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              <span>{model.bedrooms || 0} bed{model.bedrooms !== 1 ? "s" : ""}</span>
            </div>
            <span className="text-gray-400">·</span>
            <div className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              <span>{model.bathrooms || 0} bath{model.bathrooms !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Price - Bold, Teal Color, Prominent */}
          <div className="text-lg font-bold text-teal-600 mt-1">
            {model.price_range ? formatPrice(model.price_range) : "Price on request"}
          </div>

          {/* Contact Manufacturer Button */}
          {manufacturer && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <Button
                onClick={handleContactClick}
                variant="outline"
                className="w-full text-sm border-teal-600 text-teal-600 hover:bg-teal-50"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Manufacturer
              </Button>
            </div>
          )}
        </div>
      </Card>
    </Link>

    {/* Contact Modal */}
    <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contact {manufacturerName}</DialogTitle>
          <DialogDescription>
            Send a message to {manufacturerName} about {model.name}.
          </DialogDescription>
        </DialogHeader>
        <ContactForm
          manufacturerId={manufacturerId}
          manufacturerName={manufacturerName}
          modelId={model.id}
          modelName={model.name}
          onSuccess={() => {
            setContactModalOpen(false)
          }}
          onClose={() => setContactModalOpen(false)}
        />
      </DialogContent>
    </Dialog>
    </>
  )
}
