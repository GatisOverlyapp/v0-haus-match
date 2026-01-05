"use client"

import Link from "next/link"
import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Ruler, Bed, Bath, Check, Mail, ChevronLeft, ChevronRight } from "lucide-react"
import type { HouseModel } from "@/app/manufacturers/data"
import type { Manufacturer } from "@/app/manufacturers/data"

interface ModelDetailClientPageProps {
  model: HouseModel
  manufacturer: Manufacturer | null
}

export default function ModelDetailClientPage({ model, manufacturer }: ModelDetailClientPageProps) {
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  const manufacturerSlug = manufacturer?.slug || ""
  const manufacturerName = manufacturer?.name || "Unknown Manufacturer"

  const images = model.images && model.images.length > 0 ? model.images : ["/placeholder.svg"]

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation openSubscribeModal={() => setSubscribeModalOpen(true)} />

      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <Link href="/manufacturers">
            <Button variant="ghost" className="mb-6 text-white hover:bg-teal-700/50 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Manufacturers
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{model.name}</h1>
              {manufacturer && (
                <Link
                  href={`/manufacturers/${manufacturerSlug}`}
                  className="text-teal-100 hover:text-white transition-colors text-lg"
                >
                  by {manufacturerName}
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                <img
                  src={images[activeImageIndex]}
                  alt={`${model.name} - Image ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2 shadow-lg transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 rounded-full p-2 shadow-lg transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {activeImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Grid */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative h-20 rounded-md overflow-hidden border-2 transition-all ${
                        activeImageIndex === index
                          ? "border-teal-600 ring-2 ring-teal-200"
                          : "border-gray-200 hover:border-teal-400"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${model.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="space-y-6">
              {/* Category and Style Tags */}
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-teal-600 text-white px-3 py-1">{model.category}</Badge>
                  {model.style_tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-teal-300 text-teal-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Specs */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Ruler className="h-5 w-5 text-teal-600" />
                    <span className="text-gray-700">
                      <strong>Size:</strong> {model.size_sqm} m²
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Bed className="h-5 w-5 text-teal-600" />
                    <span className="text-gray-700">
                      <strong>Bedrooms:</strong> {model.bedrooms}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Bath className="h-5 w-5 text-teal-600" />
                    <span className="text-gray-700">
                      <strong>Bathrooms:</strong> {model.bathrooms}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <span className="text-gray-700">
                      <strong>Price Range:</strong>{" "}
                      <span className="text-teal-600 font-semibold text-lg">{model.price_range}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Button */}
              {manufacturer && (
                <Link href={`/manufacturers/${manufacturerSlug}`} className="block">
                  <Button size="lg" className="w-full bg-teal-600 hover:bg-teal-700 text-lg py-6">
                    <Mail className="w-5 h-5 mr-2" />
                    Contact Manufacturer
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Features */}
          {model.features && model.features.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {model.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Model</h2>
            <p className="text-gray-700 text-lg leading-relaxed">{model.description}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
