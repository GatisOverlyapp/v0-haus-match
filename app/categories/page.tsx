"use client"

import Link from "next/link"
import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { categories, getModelsByCategory } from "./data"

export default function CategoriesPage() {
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation openSubscribeModal={() => setSubscribeModalOpen(true)} />

      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Categories</h1>
          <p className="text-lg text-teal-100 max-w-2xl">
            Explore different types of prefab homes. Each category offers unique designs, features, and benefits to match your lifestyle.
          </p>
        </div>
      </header>

      {/* Categories Grid */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const modelCount = getModelsByCategory(category.slug).length

            return (
              <Link key={category.slug} href={`/categories/${category.slug}`}>
                <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col group">
                  {/* Hero Image */}
                  <div className="relative overflow-hidden bg-gray-200 aspect-video">
                    <img
                      src={category.heroImage || "/placeholder.svg"}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-teal-600 transition-colors">
                      {category.name}
                    </h2>

                    {/* Description (truncated to 2 lines) */}
                    <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-2">
                      {category.description}
                    </p>

                    {/* Model Count */}
                    <div className="pt-4 border-t border-gray-200">
                      <span className="text-teal-600 font-semibold text-sm">
                        {modelCount} {modelCount === 1 ? "model" : "models"}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
