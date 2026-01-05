import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Building2 } from "lucide-react"
import { getManufacturers } from "@/lib/db/manufacturers"
import { notFound } from "next/navigation"

export default async function ManufacturersPage() {
  let manufacturers
  try {
    manufacturers = await getManufacturers()
  } catch (error) {
    console.error("Error loading manufacturers:", error)
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation openSubscribeModal={undefined} />

      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Manufacturers</h1>
          <p className="text-lg text-teal-100 max-w-2xl">
            Discover trusted Latvian prefab home manufacturers. Connect with builders who can bring your dream home to life.
          </p>
        </div>
      </header>

      {/* Manufacturers Grid */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {manufacturers.map((manufacturer) => (
            <Card key={manufacturer.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
              {/* Logo Section */}
              <div className="bg-white p-6 flex items-center justify-center border-b border-gray-200">
                <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={manufacturer.logo || "/placeholder-logo.svg"}
                    alt={`${manufacturer.name} logo`}
                    className="w-full h-full object-contain p-3"
                  />
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                {/* Name */}
                <div className="flex items-start gap-2 mb-3">
                  <Building2 className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                  <h2 className="text-xl font-bold text-gray-900">{manufacturer.name}</h2>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="h-4 w-4 text-teal-600" />
                  <span className="text-sm">{manufacturer.location}</span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{manufacturer.description}</p>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link href={`/manufacturers/${manufacturer.slug}`} className="flex-1">
                    <Button className="w-full bg-teal-600 hover:bg-teal-700">
                      View Profile
                    </Button>
                  </Link>
                  <Link href={`/map?manufacturer=${manufacturer.slug}`}>
                    <Button variant="outline" size="icon" className="border-teal-600 text-teal-600 hover:bg-teal-50" title="View on Map">
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
