"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Ruler, Bed, Bath } from "lucide-react"
import type { HouseModel } from "@/app/manufacturers/data"
import { manufacturers } from "@/app/manufacturers/data"

// Props for the ModelCard component
export interface ModelCardProps {
  model: HouseModel
  className?: string
}

export function ModelCard({ model, className }: ModelCardProps) {
  // Find manufacturer by ID
  const manufacturer = manufacturers.find((m) => m.id === model.manufacturerId)
  const manufacturerSlug = manufacturer?.slug || ""
  const manufacturerName = manufacturer?.name || "Unknown Manufacturer"

  // Get first image or placeholder
  const imageUrl = model.images && model.images.length > 0 ? model.images[0] : "/placeholder.svg"

  return (
    <Card className={`overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer ${className || ""}`}>
      <Link href={`/models/${model.slug}`} className="block">
        {/* Model Image */}
        <div className="relative h-48 w-full">
          <img
            src={imageUrl}
            alt={model.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Model Name and Category Badge */}
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-lg font-semibold text-gray-900">{model.name}</h4>
            <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100 flex-shrink-0 ml-2">
              {model.category}
            </Badge>
          </div>

          {/* Size, Bedrooms, Bathrooms */}
          <div className="flex items-center gap-4 text-gray-600 mb-3 flex-wrap">
            <div className="flex items-center">
              <Ruler className="h-4 w-4 mr-1 text-teal-600" />
              <span className="text-sm">{model.size_sqm} m²</span>
            </div>
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1 text-teal-600" />
              <span className="text-sm">{model.bedrooms}</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1 text-teal-600" />
              <span className="text-sm">{model.bathrooms}</span>
            </div>
          </div>

          {/* Price Range */}
          <div className="text-gray-900 font-semibold mb-2">
            <span className="text-base">{model.price_range}</span>
          </div>
        </div>
      </Link>

      {/* Manufacturer Name with Link - Outside the main Link to avoid nesting */}
      {manufacturer && (
        <div className="px-5 pb-5">
          <Link
            href={`/manufacturers/${manufacturerSlug}`}
            className="text-sm text-teal-600 hover:text-teal-700 transition-colors"
          >
            {manufacturerName}
          </Link>
        </div>
      )}
    </Card>
  )
}
