"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Ruler, DollarSign } from "lucide-react"

// House interface matching the structure used in page.tsx
export interface House {
  id: number | string
  name: string
  type: string
  size: string
  price: number
  image?: string | null
  images?: string[]
  description?: string
  floors?: number
  bedrooms?: number
  bathrooms?: number
  materials?: string[]
  manufacturer?: string
  yearBuilt?: number
  energyRating?: string
  styles?: string[]
  features?: string[]
}

// Props for the HouseCard component
export interface HouseCardProps {
  house: House
  onImageClick?: (image: string, name: string) => void
  onSeeMore?: (house: House) => void
  formatPrice?: (price: number) => string
  className?: string
}

// Default price formatter
const defaultFormatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function HouseCard({
  house,
  onImageClick,
  onSeeMore,
  formatPrice = defaultFormatPrice,
  className,
}: HouseCardProps) {
  const handleImageClick = () => {
    if (onImageClick && house.image) {
      onImageClick(house.image, house.name)
    }
  }

  const handleSeeMoreClick = () => {
    if (onSeeMore) {
      onSeeMore(house)
    }
  }

  return (
    <Card className={`overflow-hidden border-0 shadow-md ${className || ""}`}>
      <div className="relative h-48 w-full">
        <img
          src={house.image || "/placeholder.svg"}
          alt={house.name}
          className={`h-full w-full object-cover ${onImageClick ? "cursor-pointer" : ""}`}
          onClick={handleImageClick}
        />
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-semibold">{house.name}</h4>
          <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">
            {house.type}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-gray-600 mb-4">
          <div className="flex items-center">
            <Ruler className="h-4 w-4 mr-1" />
            <span>{house.size} m²</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            <span>{formatPrice(house.price)}</span>
          </div>
        </div>
        {onSeeMore && (
          <Button
            className="w-full bg-teal-600 hover:bg-teal-700"
            onClick={handleSeeMoreClick}
          >
            See more
          </Button>
        )}
      </div>
    </Card>
  )
}
