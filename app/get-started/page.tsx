"use client"

import { Navigation } from "@/components/navigation"
import { QualificationSurvey } from "@/components/qualification-survey"
import { useState } from "react"

export default function GetStartedPage() {
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation openSubscribeModal={() => setSubscribeModalOpen(true)} />

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get Started</h1>
            <p className="text-lg text-teal-100 leading-relaxed">
              Tell us about your project and we'll help you find the perfect prefab home
            </p>
          </div>
        </div>
      </header>

      {/* Survey Section */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <QualificationSurvey className="w-full" />
      </main>
    </div>
  )
}
