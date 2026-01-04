"use client"

import { use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { MapPin, Building2, ArrowLeft, Mail } from "lucide-react"
import { manufacturers } from "../data"

interface ManufacturerPageProps {
  params: Promise<{ slug: string }>
}

export default function ManufacturerPage({ params }: ManufacturerPageProps) {
  const { slug } = use(params)
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false)

  const manufacturer = manufacturers.find((m) => m.slug === slug)

  if (!manufacturer) {
    notFound()
  }

  const handleContact = () => {
    // TODO: Implement contact functionality
    console.log("Contact manufacturer:", manufacturer.name)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation openSubscribeModal={() => setSubscribeModalOpen(true)} />

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
        <div className="max-w-4xl mx-auto">
          {/* Description */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex items-start gap-3 mb-6">
              <Building2 className="w-6 h-6 text-teal-600 mt-1 flex-shrink-0" />
              <h2 className="text-2xl font-bold text-gray-900">About {manufacturer.name}</h2>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">{manufacturer.description}</p>
          </div>

          {/* Contact Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-lg px-8 py-6"
              onClick={handleContact}
            >
              <Mail className="w-5 h-5 mr-2" />
              Contact Manufacturer
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
