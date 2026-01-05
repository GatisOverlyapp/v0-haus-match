"use client"

import { useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { MapPin, Building2, ArrowLeft, Mail } from "lucide-react"
import { ModelCard } from "@/components/model-card"
import { ContactForm } from "@/components/contact-form"
import { GoogleMap } from "@/components/google-map"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { Manufacturer } from "@/app/manufacturers/data"
import type { HouseModel } from "@/app/manufacturers/data"

interface ManufacturerClientProps {
  manufacturer: Manufacturer & { lat: number; lng: number }
  models: HouseModel[]
}

export function ManufacturerClient({ manufacturer, models }: ManufacturerClientProps) {
  const [contactModalOpen, setContactModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation openSubscribeModal={() => {}} />

      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Link href="/manufacturers">
            <Button variant="ghost" className="mb-6 text-white hover:bg-teal-700/50 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Manufacturers
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Logo */}
            <div className="w-32 h-32 rounded-lg bg-white p-4 flex items-center justify-center shadow-lg">
              <img
                src={manufacturer.logo || "/placeholder-logo.svg"}
                alt={`${manufacturer.name} logo`}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{manufacturer.name}</h1>
              <div className="flex items-center gap-2 text-teal-100">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{manufacturer.location}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Description */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex items-start gap-3 mb-6">
              <Building2 className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
              <h2 className="text-2xl font-bold text-gray-900">About {manufacturer.name}</h2>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">{manufacturer.description}</p>
          </div>

          {/* Location Section */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex items-start gap-3 mb-6">
              <MapPin className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
              <h2 className="text-2xl font-bold text-gray-900">Location</h2>
            </div>
            
            <div className="space-y-4">
              {/* Map */}
              <div className="w-full">
                <GoogleMap
                  manufacturers={[manufacturer as any]}
                  height="350px"
                  selectedManufacturerId={manufacturer.id}
                  zoom={10}
                />
              </div>

              {/* Location Address */}
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <p className="text-lg">{manufacturer.location}</p>
              </div>

              {/* View on Map Button */}
              <div className="pt-2">
                <Link href={`/map?manufacturer=${manufacturer.slug}`}>
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    <MapPin className="w-4 h-4 mr-2" />
                    View on Map
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Models Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Models</h2>
            {models.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {models.map((model) => (
                  <ModelCard key={model.id} model={model} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500 text-lg">No models available yet</p>
              </div>
            )}
          </div>

          {/* Contact Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-lg px-8 py-6"
              onClick={() => setContactModalOpen(true)}
            >
              <Mail className="w-5 h-5 mr-2" />
              Contact Manufacturer
            </Button>
          </div>
        </div>
      </main>

      {/* Contact Form Modal */}
      <Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact {manufacturer.name}</DialogTitle>
            <DialogDescription>
              Send a message to {manufacturer.name} about their prefab homes and services.
            </DialogDescription>
          </DialogHeader>
          <ContactForm
            manufacturerId={manufacturer.id}
            onSuccess={() => {
              setContactModalOpen(false)
            }}
            onClose={() => setContactModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
