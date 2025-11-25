"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Eye,
  Home,
  Check,
  Search,
  Zap,
  Smartphone,
  Building2,
  Users,
  Mountain,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  MapPin,
  Ruler,
  Menu,
  X,
  ArrowLeft,
  Info,
  Calendar,
  Layers,
  Hammer,
  Factory,
  Plus,
  Loader2,
  ImageIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { subscribeToEarlyAccess } from "./actions"
import { getWebARModelForHouse } from "@/lib/webar-models" // Import the new function

// Parse free-text query into structured search intent
const parseSearchQuery = (query: string) => {
  const lowerQuery = query.toLowerCase()

  // Parse style
  const styles = []
  if (lowerQuery.includes("nordic") || lowerQuery.includes("scandinavian")) {
    styles.push("Scandinavian", "Minimalist")
  }
  if (lowerQuery.includes("minimalist") || lowerQuery.includes("minimal")) {
    styles.push("Minimalist")
  }
  if (lowerQuery.includes("modern")) {
    styles.push("Modern")
  }
  if (lowerQuery.includes("barn") || lowerQuery.includes("barnhouse")) {
    styles.push("Rustic")
  }
  if (lowerQuery.includes("eco") || lowerQuery.includes("passive") || lowerQuery.includes("sustainable")) {
    styles.push("Off-grid simple")
  }
  if (lowerQuery.includes("industrial")) {
    styles.push("Industrial")
  }
  if (lowerQuery.includes("cabin")) {
    styles.push("Cabin-core", "Rustic")
  }
  if (lowerQuery.includes("black")) {
    styles.push("Modern", "Minimalist")
  }

  // Parse type
  let type = ""
  if (lowerQuery.includes("tiny house") || lowerQuery.includes("tiny home")) {
    type = "Tiny House"
  } else if (lowerQuery.includes("a-frame")) {
    type = "A-Frame"
  } else if (lowerQuery.includes("container")) {
    type = "Container Home"
  } else if (lowerQuery.includes("cabin")) {
    type = "Cabin"
  } else if (lowerQuery.includes("modular")) {
    type = "Modular House"
  } else if (lowerQuery.includes("prefab")) {
    type = "Prefab Home"
  } else if (lowerQuery.includes("float") || lowerQuery.includes("houseboat")) {
    type = "Floathouse"
  }

  // Parse location
  let location = ""
  const euCountries = ["sweden", "germany", "latvia", "denmark", "poland", "estonia", "lithuania"]
  for (const country of euCountries) {
    if (lowerQuery.includes(country)) {
      location = country.charAt(0).toUpperCase() + country.slice(1)
      break
    }
  }

  // Parse price range
  let priceRange = ""
  const priceMatch = lowerQuery.match(/(\d+)k?[-–](\d+)k?|under (\d+)k?|below (\d+)k?|(\d+)k? budget/)
  if (priceMatch) {
    if (priceMatch[1] && priceMatch[2]) {
      priceRange = `$${priceMatch[1]}k–$${priceMatch[2]}k`
    } else if (priceMatch[3] || priceMatch[4]) {
      const limit = priceMatch[3] || priceMatch[4]
      priceRange = `$10k–$${limit}k`
    } else if (priceMatch[5]) {
      priceRange = `$10k–$${priceMatch[5]}k`
    }
  }

  // Parse size
  let size = ""
  const sizeMatch = lowerQuery.match(/(\d+)\s*m²?|(\d+)\s*square/)
  if (sizeMatch) {
    const sqm = sizeMatch[1] || sizeMatch[2]
    if (Number.parseInt(sqm) < 30) {
      size = "0–20 m²"
    } else if (Number.parseInt(sqm) < 50) {
      size = "20–40 m²"
    } else if (Number.parseInt(sqm) < 70) {
      size = "40–60 m²"
    } else if (Number.parseInt(sqm) < 90) {
      size = "60–80 m²"
    } else if (Number.parseInt(sqm) < 120) {
      size = "80–120 m²"
    } else {
      size = "120+ m²"
    }
  }

  return {
    styles: [...new Set(styles)], // Remove duplicates
    type,
    location,
    priceRange,
    size,
    originalQuery: query,
  }
}

// Generate synthetic listings based on parsed query
const generateSyntheticListings = (parsedQuery: any, count = 6) => {
  const { styles, type, location, originalQuery } = parsedQuery
  const manufacturers = [
    "Nordic Prefab",
    "EcoHaus",
    "Scandinavian Homes",
    "Baltic Builders",
    "Modern Living Co.",
    "Sustainable Structures",
    "Alpine Prefab",
    "Green Building Solutions",
  ]

  // Pinterest demo images - expanded collection
  const pinterestImages = [
    "https://i.pinimg.com/736x/c5/e4/55/c5e4552dd82a23fc40e19c28292b41d3.jpg",
    "https://i.pinimg.com/1200x/3b/13/20/3b13204e4f7e4b6ccdc81668a14dcee2.jpg",
    "https://i.pinimg.com/736x/1c/90/0f/1c900fde427244db7fe3632e709b0aeb.jpg",
    "https://i.pinimg.com/1200x/60/6e/82/606e82826f3b2d29542b7bc6d8808124.jpg",
    "https://i.pinimg.com/1200x/74/f0/eb/74f0ebdf27048502ff1481ac55fb5b11.jpg",
    "https://i.pinimg.com/1200x/0a/7a/b3/0a7ab3959ca4eafc0bb5b3894e436a62.jpg",
    "https://i.pinimg.com/1200x/11/d2/10/11d210e05a5b32398d2ccbe532abef4a.jpg",
    "https://i.pinimg.com/736x/74/7a/f0/747af0643f80bc35f7cb45d52dcfb575.jpg",
    "https://i.pinimg.com/736x/c5/a9/39/c5a9397941a16c90c830e8a57350ceca.jpg",
    "https://i.pinimg.com/736x/e6/e3/46/e6e3468c1f64983f502d9f448de2d8bc.jpg",
    "https://i.pinimg.com/736x/b1/bc/61/b1bc61af6e5e04b6698440e8a69fc964.jpg",
    "https://i.pinimg.com/1200x/43/25/34/432534d284c5c02f45a13049f17c11e5.jpg",
    "https://i.pinimg.com/1200x/79/94/df/7994df513ac293554df1356be1bfa8ee.jpg",
    "https://i.pinimg.com/1200x/ab/81/2a/ab812a9afae4bd42678eea3d82546951.jpg",
    "https://i.pinimg.com/1200x/83/d7/bc/83d7bcd3f75cc1a24f690bef9cdb642e.jpg",
    "https://i.pinimg.com/1200x/e7/b9/51/e7b9514255e66799c7860c073a78dcf8.jpg",
    "https://i.pinimg.com/1200x/a1/cd/b1/a1cdb152fbeabc4c202e74d541140256.jpg",
    "https://i.pinimg.com/1200x/63/4c/56/634c56c149a614f4261ea3e9f39ea652.jpg",
    "https://i.pinimg.com/1200x/ec/8f/de/ec8fdee37f6dbfa0c7591a12e07f7088.jpg",
    "https://i.pinimg.com/1200x/fa/fc/65/fafc65673bd6ce8e1c54d8a4fa04f4ab.jpg",
    "https://i.pinimg.com/736x/52/f1/aa/52f1aa3ec27be7dff1e5c2d2fc028436.jpg",
  ]

  // Generate unique name prefixes based on search query context
  const getUniqueNamePrefix = (
    index: number,
    styles: string[],
    type: string,
    location: string,
    originalQuery: string,
  ) => {
    const queryWords = originalQuery.toLowerCase().split(" ")

    // Context-based prefixes
    const contextPrefixes = []

    if (queryWords.includes("cozy") || queryWords.includes("warm")) {
      contextPrefixes.push("Cozy", "Warm", "Intimate")
    }
    if (queryWords.includes("luxury") || queryWords.includes("premium")) {
      contextPrefixes.push("Luxury", "Premium", "Executive")
    }
    if (queryWords.includes("small") || queryWords.includes("compact")) {
      contextPrefixes.push("Compact", "Efficient", "Smart")
    }
    if (queryWords.includes("family") || queryWords.includes("spacious")) {
      contextPrefixes.push("Family", "Spacious", "Grand")
    }
    if (queryWords.includes("eco") || queryWords.includes("sustainable")) {
      contextPrefixes.push("Eco", "Green", "Sustainable")
    }
    if (queryWords.includes("modern") || queryWords.includes("contemporary")) {
      contextPrefixes.push("Contemporary", "Sleek", "Urban")
    }
    if (queryWords.includes("rustic") || queryWords.includes("traditional")) {
      contextPrefixes.push("Heritage", "Artisan", "Classic")
    }

    // Location-based prefixes
    if (location) {
      if (location === "Sweden") contextPrefixes.push("Swedish", "Nordic", "Scandinavian")
      if (location === "Germany") contextPrefixes.push("German", "Alpine", "European")
      if (location === "Latvia") contextPrefixes.push("Baltic", "Northern", "Coastal")
    }

    // Style-based prefixes
    const stylePrefixes = {
      Nordic: ["Arctic", "Fjord", "Pine", "Birch"],
      Scandinavian: ["Hygge", "Lagom", "Nordic", "Minimalist"],
      Modern: ["Contemporary", "Geometric", "Linear", "Sleek"],
      Minimalist: ["Pure", "Essential", "Clean", "Refined"],
      Industrial: ["Steel", "Loft", "Urban", "Metro"],
      Rustic: ["Timber", "Woodland", "Heritage", "Country"],
    }

    if (styles.length > 0) {
      const primaryStyle = styles[0]
      if (stylePrefixes[primaryStyle]) {
        contextPrefixes.push(...stylePrefixes[primaryStyle])
      }
    }

    // Unique descriptors for each listing
    const uniqueDescriptors = [
      "Signature",
      "Premier",
      "Elite",
      "Select",
      "Artisan",
      "Bespoke",
      "Designer",
      "Architect",
      "Master",
      "Custom",
      "Boutique",
      "Exclusive",
    ]

    // Combine context prefixes with unique descriptors
    const allPrefixes = [...contextPrefixes, ...uniqueDescriptors]

    // Ensure we have enough unique combinations
    if (allPrefixes.length === 0) {
      allPrefixes.push("Modern", "Contemporary", "Stylish", "Beautiful", "Elegant", "Sophisticated")
    }

    return allPrefixes[index % allPrefixes.length] || "Modern"
  }

  const listings = []

  for (let i = 0; i < count; i++) {
    // Generate size
    const sizes = [18, 25, 30, 35, 45, 55, 65, 70, 85, 95, 110]
    const size = sizes[Math.floor(Math.random() * sizes.length)]

    // Generate price based on size and type
    let basePrice = 35000 + size * 1200
    if (type === "A-Frame") basePrice += 15000
    if (type === "Modular House") basePrice += 25000
    if (type === "Floathouse") basePrice += 35000

    const price = Math.round(basePrice + (Math.random() * 40000 - 20000))

    // Generate unique name based on search context
    const namePrefix = getUniqueNamePrefix(i, styles, type, location, originalQuery)
    const houseType = type || "Prefab Home"
    const name = `${namePrefix} ${houseType}`

    // Generate description based on query
    let description = `A beautiful ${namePrefix.toLowerCase()} style ${houseType.toLowerCase()}`
    if (originalQuery.includes("eco") || originalQuery.includes("sustainable")) {
      description += " with sustainable materials and energy-efficient design"
    }
    if (originalQuery.includes("delivery") || originalQuery.includes("fast")) {
      description += " available for quick delivery"
    }
    if (location) {
      description += ` available in ${location}`
    }
    description += "."

    // Select 3 images from Pinterest demo images, cycling through them
    const imageSet = []
    for (let j = 0; j < 3; j++) {
      const imageIndex = (i * 3 + j) % pinterestImages.length
      imageSet.push(pinterestImages[imageIndex])
    }

    listings.push({
      id: 1000 + i,
      name,
      type: houseType,
      size,
      price,
      image: imageSet[0], // Use first image as main image
      description,
      floors: size > 60 ? 2 : 1,
      bedrooms: size < 30 ? 1 : size < 70 ? 2 : 3,
      bathrooms: size < 50 ? 1 : 2,
      materials: ["Wood", "Glass", "Steel"],
      manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
      yearBuilt: 2023,
      energyRating: "A",
      styles: styles.length > 0 ? styles : ["Modern"],
      images: imageSet, // All 3 images for gallery
      features: ["Energy Efficient", "Modern Design", "Quick Assembly"],
    })
  }

  return listings
}

// Function to generate Pinterest images for houses
const generateHouseImages = (house) => {
  const { id } = house

  // Use Pinterest images cycling through the collection
  const pinterestImages = [
    "https://i.pinimg.com/736x/c5/e4/55/c5e4552dd82a23fc40e19c28292b41d3.jpg",
    "https://i.pinimg.com/1200x/3b/13/20/3b13204e4f7e4b6ccdc81668a14dcee2.jpg",
    "https://i.pinimg.com/736x/1c/90/0f/1c900fde427244db7fe3632e709b0aeb.jpg",
    "https://i.pinimg.com/1200x/60/6e/82/606e82826f3b2d29542b7bc6d8808124.jpg",
    "https://i.pinimg.com/1200x/74/f0/eb/74f0ebdf27048502ff1481ac55fb5b11.jpg",
    "https://i.pinimg.com/1200x/0a/7a/b3/0a7ab3959ca4eafc0bb5b3894e436a62.jpg",
    "https://i.pinimg.com/1200x/11/d2/10/11d210e05a5b32398d2ccbe532abef4a.jpg",
    "https://i.pinimg.com/736x/74/7a/f0/747af0643f80bc35f7cb45d52dcfb575.jpg",
    "https://i.pinimg.com/736x/c5/a9/39/c5a9397941a16c90c830e8a57350ceca.jpg",
    "https://i.pinimg.com/736x/e6/e3/46/e6e3468c1f64983f502d9f448de2d8bc.jpg",
    "https://i.pinimg.com/736x/b1/bc/61/b1bc61af6e5e04b6698440e8a69fc964.jpg",
    "https://i.pinimg.com/1200x/43/25/34/432534d284c5c02f45a13049f17c11e5.jpg",
    "https://i.pinimg.com/1200x/79/94/df/7994df513ac293554df1356be1bfa8ee.jpg",
    "https://i.pinimg.com/1200x/ab/81/2a/ab812a9afae4bd42678eea3d82546951.jpg",
    "https://i.pinimg.com/1200x/83/d7/bc/83d7bcd3f75cc1a24f690bef9cdb642e.jpg",
    "https://i.pinimg.com/1200x/e7/b9/51/e7b9514255e66799c7860c073a78dcf8.jpg",
    "https://i.pinimg.com/1200x/a1/cd/b1/a1cdb152fbeabc4c202e74d541140256.jpg",
    "https://i.pinimg.com/1200x/63/4c/56/634c56c149a614f4261ea3e9f39ea652.jpg",
    "https://i.pinimg.com/1200x/ec/8f/de/ec8fdee37f6dbfa0c7591a12e07f7088.jpg",
    "https://i.pinimg.com/1200x/fa/fc/65/fafc65673bd6ce8e1c54d8a4fa04f4ab.jpg",
    "https://i.pinimg.com/736x/52/f1/aa/52f1aa3ec27be7dff1e5c2d2fc028436.jpg",
  ]

  // Use Pinterest images cycling through the collection
  const imageSet = []
  for (let j = 0; j < 3; j++) {
    const imageIndex = ((id || 0) * 3 + j) % pinterestImages.length
    imageSet.push(pinterestImages[imageIndex])
  }

  return {
    images: imageSet,
    image: imageSet[0], // Use first image as main thumbnail
  }
}

const sampleHouses = [
  {
    id: 1,
    name: "Modern Tiny House",
    type: "Tiny House",
    size: 18,
    price: 35000,
    image: "/placeholder.svg?height=200&width=300",
    description:
      "A compact and efficient tiny house with modern design elements. Perfect for minimalist living or as a guest house.",
    floors: 1,
    bedrooms: 1,
    bathrooms: 1,
    materials: ["Wood", "Glass", "Steel"],
    manufacturer: "TinyLiving Co.",
    yearBuilt: 2023,
    energyRating: "A",
    styles: ["Minimalist", "Modern", "Industrial"],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    features: ["Solar Ready", "Smart Home Integration", "Rainwater Collection"],
  },
  {
    id: 2,
    name: "Lakeside A-Frame",
    type: "A-Frame",
    size: 45,
    price: 75000,
    image: "/placeholder.svg?height=200&width=300",
    description:
      "A classic A-Frame design with large windows to maximize natural light and views. Ideal for scenic locations.",
    floors: 2,
    bedrooms: 2,
    bathrooms: 1,
    materials: ["Cedar", "Glass", "Stone"],
    manufacturer: "Alpine Prefab",
    yearBuilt: 2022,
    energyRating: "B",
    styles: ["Rustic", "Cabin-core", "Scandinavian"],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    features: ["Loft Space", "Fireplace", "Deck"],
  },
  {
    id: 3,
    name: "Eco Container Home",
    type: "Container Home",
    size: 30,
    price: 42000,
    image: "/placeholder.svg?height=200&width=300",
    description:
      "Sustainable living in a repurposed shipping container. Modern amenities with an eco-friendly footprint.",
    floors: 1,
    bedrooms: 1,
    bathrooms: 1,
    materials: ["Steel", "Reclaimed Wood", "Eco-Insulation"],
    manufacturer: "GreenBox Homes",
    yearBuilt: 2023,
    energyRating: "A+",
    styles: ["Industrial", "Minimalist", "Off-grid simple"],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    features: ["Off-Grid Capable", "Composting Toilet", "Greywater System"],
  },
  {
    id: 4,
    name: "Luxury Modular House",
    type: "Modular House",
    size: 110,
    price: 130000,
    image: "/placeholder.svg?height=200&width=300",
    description: "A spacious modular home with premium finishes and flexible layout options. Quick assembly on site.",
    floors: 1,
    bedrooms: 3,
    bathrooms: 2,
    materials: ["Engineered Wood", "Concrete", "Metal Roofing"],
    manufacturer: "ModernMod Homes",
    yearBuilt: 2023,
    energyRating: "A",
    styles: ["Modern", "Minimalist", "Scandinavian"],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    features: ["Open Floor Plan", "Home Office", "Energy Efficient Appliances"],
  },
  {
    id: 5,
    name: "Nordic Cabin",
    type: "Cabin",
    size: 35,
    price: 48000,
    image: "/placeholder.svg?height=200&width=300",
    description: "A cozy Nordic-inspired cabin with clean lines and natural materials. Perfect for weekend getaways.",
    floors: 1,
    bedrooms: 1,
    bathrooms: 1,
    materials: ["Pine", "Glass", "Natural Insulation"],
    manufacturer: "Nordic Prefab",
    yearBuilt: 2023,
    energyRating: "A",
    styles: ["Nordic", "Scandinavian", "Minimalist"],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    features: ["Wood Stove", "Natural Lighting", "Sustainable Materials"],
  },
  {
    id: 6,
    name: "Japandi Studio",
    type: "Tiny House",
    size: 25,
    price: 39000,
    image: "/placeholder.svg?height=200&width=300",
    description: "A harmonious blend of Japanese and Scandinavian design principles. Minimalist and functional.",
    floors: 1,
    bedrooms: 1,
    bathrooms: 1,
    materials: ["Bamboo", "Cedar", "Rice Paper Accents"],
    manufacturer: "Fusion Homes",
    yearBuilt: 2023,
    energyRating: "A",
    styles: ["Japandi", "Minimalist", "Zen-inspired"],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    features: ["Sliding Partitions", "Tatami Area", "Meditation Space"],
  },
  {
    id: 7,
    name: "Coastal Retreat",
    type: "Modular House",
    size: 65,
    price: 85000,
    image: "/placeholder.svg?height=200&width=300",
    description: "A bright and airy modular home inspired by coastal living. Perfect for waterfront properties.",
    floors: 1,
    bedrooms: 2,
    bathrooms: 1,
    materials: ["Weather-Resistant Siding", "Composite Decking", "Marine-Grade Hardware"],
    manufacturer: "Coastal Prefab",
    yearBuilt: 2022,
    energyRating: "B+",
    styles: ["Coastal", "Modern", "Scandinavian"],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    features: ["Wraparound Deck", "Salt-Resistant Finishes", "Panoramic Windows"],
  },
  {
    id: 8,
    name: "Boho Tiny Home",
    type: "Tiny House",
    size: 22,
    price: 37000,
    image: "/placeholder.svg?height=200&width=300",
    description: "A free-spirited tiny home with eclectic design elements and a warm, inviting atmosphere.",
    floors: 1,
    bedrooms: 1,
    bathrooms: 1,
    materials: ["Reclaimed Wood", "Natural Fibers", "Handcrafted Accents"],
    manufacturer: "Bohemian Builds",
    yearBuilt: 2023,
    energyRating: "B",
    styles: ["Boho", "Eclectic", "Rustic"],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    features: ["Hanging Plants", "Artisanal Fixtures", "Multipurpose Furniture"],
  },
  {
    id: 9,
    name: "Minimalist Container",
    type: "Container Home",
    size: 28,
    price: 38000,
    image: "/placeholder.svg?height=200&width=300",
    description: "A sleek, minimalist container home with clean lines and efficient use of space.",
    floors: 1,
    bedrooms: 1,
    bathrooms: 1,
    materials: ["Steel", "Glass", "Bamboo Flooring"],
    manufacturer: "ModBox Homes",
    yearBuilt: 2023,
    energyRating: "A",
    styles: ["Minimalist", "Modern", "Industrial"],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    features: ["Foldable Furniture", "Smart Storage", "Energy Efficient Design"],
  },
  {
    id: 10,
    name: "Nordic A-Frame",
    type: "A-Frame",
    size: 50,
    price: 68000,
    image: "/placeholder.svg?height=200&width=300",
    description: "A Scandinavian-inspired A-Frame with clean lines and natural materials.",
    floors: 2,
    bedrooms: 2,
    bathrooms: 1,
    materials: ["Pine", "Glass", "Natural Stone"],
    manufacturer: "Nordic Prefab",
    yearBuilt: 2023,
    energyRating: "A",
    styles: ["Nordic", "Scandinavian", "Minimalist"],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    features: ["Sauna", "Wood Stove", "Loft Bedroom"],
  },
  {
    id: 11,
    name: "Rustic Cabin",
    type: "Cabin",
    size: 40,
    price: 55000,
    image: "/placeholder.svg?height=200&width=300",
    description: "A traditional cabin with rustic charm and modern amenities. Perfect for mountain settings.",
    floors: 1,
    bedrooms: 1,
    bathrooms: 1,
    materials: ["Log", "Stone", "Metal Roofing"],
    manufacturer: "Mountain Homes",
    yearBuilt: 2022,
    energyRating: "B",
    styles: ["Rustic", "Cabin-core", "Traditional"],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    features: ["Fireplace", "Covered Porch", "Exposed Beams"],
  },
  {
    id: 12,
    name: "Modern Floathouse",
    type: "Floathouse",
    size: 55,
    price: 95000,
    image: "/placeholder.svg?height=200&width=300",
    description: "A contemporary floating home designed for waterfront living with panoramic views.",
    floors: 1,
    bedrooms: 2,
    bathrooms: 1,
    materials: ["Marine-Grade Aluminum", "Composite Decking", "Tempered Glass"],
    manufacturer: "AquaLiving",
    yearBuilt: 2023,
    energyRating: "A",
    styles: ["Modern", "Minimalist", "Coastal"],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    features: ["Floating Foundation", "Wraparound Deck", "Water Filtration System"],
  },
  {
    id: 13,
    name: "Off-Grid Tiny House",
    type: "Tiny House",
    size: 20,
    price: 42000,
    image: "/placeholder.svg?height=200&width=300",
    description: "A self-sufficient tiny house designed for off-grid living with sustainable features.",
    floors: 1,
    bedrooms: 1,
    bathrooms: 1,
    materials: ["Reclaimed Wood", "Metal", "Hemp Insulation"],
    manufacturer: "EcoTiny",
    yearBuilt: 2023,
    energyRating: "A+",
    styles: ["Off-grid simple", "Rustic", "Minimalist"],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    features: ["Solar Panels", "Rainwater Collection", "Composting Toilet"],
  },
  {
    id: 14,
    name: "Prefab Family Home",
    type: "Prefab Home",
    size: 85,
    price: 120000,
    image: "/placeholder.svg?height=200&width=300",
    description: "A spacious prefabricated family home with modern amenities and flexible living spaces.",
    floors: 1,
    bedrooms: 3,
    bathrooms: 2,
    materials: ["Engineered Wood", "Steel Frame", "Fiber Cement Siding"],
    manufacturer: "PrefabLiving",
    yearBuilt: 2023,
    energyRating: "A",
    styles: ["Modern", "Scandinavian", "Minimalist"],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    features: ["Open Floor Plan", "Energy Efficient Windows", "Smart Home Integration"],
  },
  {
    id: 15,
    name: "Japandi Modular Home",
    type: "Modular House",
    size: 70,
    price: 95000,
    image: "/placeholder.svg?height=200&width=300",
    description: "A modular home blending Japanese and Scandinavian design principles for a serene living space.",
    floors: 1,
    bedrooms: 2,
    bathrooms: 1,
    materials: ["Cedar", "Bamboo", "Natural Stone"],
    manufacturer: "Fusion Homes",
    yearBuilt: 2023,
    energyRating: "A",
    styles: ["Japandi", "Zen-inspired", "Minimalist"],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    features: ["Meditation Space", "Indoor Garden", "Natural Lighting"],
  },
  {
    id: 16,
    name: "Industrial Container Loft",
    type: "Container Home",
    size: 60,
    price: 78000,
    image: "/placeholder.svg?height=200&width=300",
    description: "A two-story container home with industrial aesthetics and a spacious loft area.",
    floors: 2,
    bedrooms: 2,
    bathrooms: 1,
    materials: ["Shipping Containers", "Steel", "Concrete"],
    manufacturer: "Urban Container Co.",
    yearBuilt: 2022,
    energyRating: "B+",
    styles: ["Industrial", "Modern", "Urban"],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    features: ["Rooftop Deck", "Exposed Ductwork", "Floor-to-Ceiling Windows"],
  },
  {
    id: 17,
    name: "Boho A-Frame",
    type: "A-Frame",
    size: 55,
    price: 82000,
    image: "/placeholder.svg?height=200&width=300",
    description: "An A-Frame cabin with bohemian touches and eclectic design elements.",
    floors: 2,
    bedrooms: 2,
    bathrooms: 1,
    materials: ["Wood", "Glass", "Natural Textiles"],
    manufacturer: "Boho Builds",
    yearBuilt: 2023,
    energyRating: "B",
    styles: ["Boho", "Eclectic", "Rustic"],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    features: ["Hammock Loft", "Indoor Plants", "Handcrafted Details"],
  },
  {
    id: 18,
    name: "Coastal Tiny House",
    type: "Tiny House",
    size: 24,
    price: 45000,
    image: "/placeholder.svg?height=200&width=300",
    description: "A bright and airy tiny house inspired by coastal living with nautical touches.",
    floors: 1,
    bedrooms: 1,
    bathrooms: 1,
    materials: ["Cedar Shingles", "Composite Decking", "Marine-Grade Hardware"],
    manufacturer: "Coastal Tiny Homes",
    yearBuilt: 2023,
    energyRating: "A",
    styles: ["Coastal", "Beach", "Nautical"],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    features: ["Fold-Down Deck", "Porthole Windows", "Weather-Resistant Finishes"],
  },
  {
    id: 19,
    name: "Futuristic Pod Home",
    type: "Modular House",
    size: 40,
    price: 65000,
    image: "/placeholder.svg?height=200&width=300",
    description: "A cutting-edge modular pod with futuristic design and smart technology integration.",
    floors: 1,
    bedrooms: 1,
    bathrooms: 1,
    materials: ["Composite Materials", "Smart Glass", "Aluminum"],
    manufacturer: "FuturePod",
    yearBuilt: 2023,
    energyRating: "A+",
    styles: ["Futuristic", "Modern", "Minimalist"],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    features: ["Voice-Controlled Systems", "Self-Tinting Windows", "Integrated Tech"],
  },
  {
    id: 20,
    name: "Classical Tiny Cottage",
    type: "Tiny House",
    size: 30,
    price: 52000,
    image: "/placeholder.svg?height=200&width=300",
    description: "A charming tiny cottage with classical architectural details and traditional craftsmanship.",
    floors: 1,
    bedrooms: 1,
    bathrooms: 1,
    materials: ["Brick", "Wood", "Copper Accents"],
    manufacturer: "Heritage Tiny Homes",
    yearBuilt: 2022,
    energyRating: "B",
    styles: ["Classical", "Traditional", "Cottage"],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    features: ["Bay Window", "Ornate Details", "Built-In Furniture"],
  },
]

// Update sample houses with Pinterest demo images
const enhancedSampleHouses = sampleHouses.map((house, index) => {
  const pinterestImages = [
    "https://i.pinimg.com/736x/c5/e4/55/c5e4552dd82a23fc40e19c28292b41d3.jpg",
    "https://i.pinimg.com/1200x/3b/13/20/3b13204e4f7e4b6ccdc81668a14dcee2.jpg",
    "https://i.pinimg.com/736x/1c/90/0f/1c900fde427244db7fe3632e709b0aeb.jpg",
    "https://i.pinimg.com/1200x/60/6e/82/606e82826f3b2d29542b7bc6d8808124.jpg",
    "https://i.pinimg.com/1200x/74/f0/eb/74f0ebdf27048502ff1481ac55fb5b11.jpg",
    "https://i.pinimg.com/1200x/0a/7a/b3/0a7ab3959ca4eafc0bb5b3894e436a62.jpg",
    "https://i.pinimg.com/1200x/11/d2/10/11d210e05a5b32398d2ccbe532abef4a.jpg",
    "https://i.pinimg.com/736x/74/7a/f0/747af0643f80bc35f7cb45d52dcfb575.jpg",
    "https://i.pinimg.com/736x/c5/a9/39/c5a9397941a16c90c830e8a57350ceca.jpg",
    "https://i.pinimg.com/736x/e6/e3/46/e6e3468c1f64983f502d9f448de2d8bc.jpg",
    "https://i.pinimg.com/736x/b1/bc/61/b1bc61af6e5e04b6698440e8a69fc964.jpg",
    "https://i.pinimg.com/1200x/43/25/34/432534d284c5c02f45a13049f17c11e5.jpg",
    "https://i.pinimg.com/1200x/79/94/df/7994df513ac293554df1356be1bfa8ee.jpg",
    "https://i.pinimg.com/1200x/ab/81/2a/ab812a9afae4bd42678eea3d82546951.jpg",
    "https://i.pinimg.com/1200x/83/d7/bc/83d7bcd3f75cc1a24f690bef9cdb642e.jpg",
    "https://i.pinimg.com/1200x/e7/b9/51/e7b9514255e66799c7860c073a78dcf8.jpg",
    "https://i.pinimg.com/1200x/a1/cd/b1/a1cdb152fbeabc4c202e74d541140256.jpg",
    "https://i.pinimg.com/1200x/63/4c/56/634c56c149a614f4261ea3e9f39ea652.jpg",
    "https://i.pinimg.com/1200x/ec/8f/de/ec8fdee37f6dbfa0c7591a12e07f7088.jpg",
    "https://i.pinimg.com/1200x/fa/fc/65/fafc65673bd6ce8e1c54d8a4fa04f4ab.jpg",
    "https://i.pinimg.com/736x/52/f1/aa/52f1aa3ec27be7dff1e5c2d2fc028436.jpg",
  ]
  const imageSet = []
  for (let j = 0; j < 3; j++) {
    const imageIndex = (index * 3 + j) % pinterestImages.length
    imageSet.push(pinterestImages[imageIndex])
  }

  return {
    ...house,
    image: imageSet[0],
    images: imageSet,
  }
})

// Generate random houses based on criteria
const generateRandomHouses = (
  count: number,
  homeType: string,
  selectedStyles: string[],
  sizeRange: string,
  budgetRange: string,
  existingIds: number[] = [],
) => {
  const houses = []
  const houseTypes = homeType
    ? [homeType]
    : [
        "Tiny House",
        "A-Frame",
        "Container Home",
        "Modular House",
        "Cabin",
        "Prefab Home",
        "House on Wheels",
        "Floathouse",
      ]
  const manufacturers = [
    "TinyLiving Co.",
    "Alpine Prefab",
    "GreenBox Homes",
    "ModernMod Homes",
    "Nordic Prefab",
    "Fusion Homes",
    "Coastal Prefab",
    "Bohemian Builds",
    "EcoHaus",
    "Prefab Pioneers",
    "ModBox Homes",
    "Mountain Homes",
    "AquaLiving",
    "EcoTiny",
    "PrefabLiving",
    "Urban Container Co.",
    "Boho Builds",
    "Coastal Tiny Homes",
    "FuturePod",
    "Heritage Tiny Homes",
  ]
  const materials = [
    "Wood",
    "Glass",
    "Steel",
    "Concrete",
    "Bamboo",
    "Cedar",
    "Pine",
    "Reclaimed Wood",
    "Eco-Insulation",
    "Composite Materials",
    "Natural Stone",
    "Metal Roofing",
    "Shipping Containers",
    "Brick",
    "Aluminum",
    "Hemp Insulation",
    "Natural Fibers",
    "Marine-Grade Hardware",
  ]
  const features = [
    "Solar Ready",
    "Smart Home Integration",
    "Rainwater Collection",
    "Off-Grid Capable",
    "Energy Efficient Appliances",
    "Composting Toilet",
    "Wood Stove",
    "Natural Lighting",
    "Sustainable Materials",
    "Multipurpose Furniture",
    "Loft Space",
    "Fireplace",
    "Deck",
    "Home Office",
    "Panoramic Windows",
    "Rooftop Deck",
    "Sauna",
    "Indoor Garden",
    "Foldable Furniture",
    "Smart Storage",
    "Sliding Partitions",
    "Meditation Space",
    "Wraparound Deck",
    "Floor-to-Ceiling Windows",
    "Voice-Controlled Systems",
    "Built-In Furniture",
  ]

  // Enhanced name prefixes based on styles and context
  const getNamePrefix = (styles: string[], type: string, size: number) => {
    const primaryStyle = styles[0] || "Modern"

    // Style-specific prefixes
    const stylePrefixes = {
      Nordic: ["Nordic", "Scandinavian", "Arctic", "Fjord", "Pine"],
      Japandi: ["Zen", "Harmony", "Serenity", "Bamboo", "Tranquil"],
      Minimalist: ["Pure", "Essential", "Clean", "Simple", "Refined"],
      Modern: ["Contemporary", "Sleek", "Urban", "Geometric", "Linear"],
      Industrial: ["Steel", "Urban", "Loft", "Factory", "Metro"],
      Rustic: ["Heritage", "Timber", "Woodland", "Country", "Artisan"],
      Scandinavian: ["Nordic", "Hygge", "Birch", "Lagom", "Cozy"],
      Classical: ["Heritage", "Traditional", "Elegant", "Timeless", "Noble"],
      Boho: ["Bohemian", "Free-Spirit", "Artistic", "Eclectic", "Wanderer"],
      "Cabin-core": ["Wilderness", "Forest", "Mountain", "Lodge", "Retreat"],
      Coastal: ["Seaside", "Ocean", "Driftwood", "Marina", "Breeze"],
      "Off-grid simple": ["Pioneer", "Sustainable", "Eco", "Self-Sufficient", "Green"],
      "Zen-inspired": ["Peaceful", "Mindful", "Serene", "Balanced", "Calm"],
      Eclectic: ["Unique", "Creative", "Artistic", "Vibrant", "Mixed"],
      Futuristic: ["Future", "Tech", "Smart", "Advanced", "Next-Gen"],
    }

    // Size-based modifiers
    const sizeModifiers = {
      small: size < 30 ? ["Compact", "Micro", "Tiny", "Cozy", "Intimate"] : [],
      medium: size >= 30 && size < 70 ? ["Studio", "Efficient", "Smart", "Optimal"] : [],
      large: size >= 70 ? ["Spacious", "Grand", "Family", "Executive", "Luxury"] : [],
    }

    // Type-specific modifiers
    const typeModifiers = {
      "A-Frame": ["Peak", "Triangle", "Alpine", "Summit"],
      "Container Home": ["Box", "Steel", "Industrial", "Modular"],
      Floathouse: ["Floating", "Aquatic", "Marina", "Waterfront"],
      "Tiny House": ["Mini", "Compact", "Small", "Pocket"],
      "House on Wheels": ["Mobile", "Nomad", "Traveler", "Roaming"],
    }

    // Combine prefixes
    let possiblePrefixes = stylePrefixes[primaryStyle] || ["Modern"]

    // Add size modifiers
    if (size < 30) possiblePrefixes = [...possiblePrefixes, ...sizeModifiers.small]
    else if (size >= 30 && size < 70) possiblePrefixes = [...possiblePrefixes, ...sizeModifiers.medium]
    else possiblePrefixes = [...possiblePrefixes, ...sizeModifiers.large]

    // Add type-specific modifiers
    if (typeModifiers[type]) {
      possiblePrefixes = [...possiblePrefixes, ...typeModifiers[type]]
    }

    // Return random prefix
    return possiblePrefixes[Math.floor(Math.random() * possiblePrefixes.length)]
  }

  // Enhanced description generator
  const generateDescription = (styles: string[], type: string, size: number, features: string[]) => {
    const primaryStyle = styles[0] || "modern"
    const secondaryStyle = styles[1] || ""

    const styleDescriptions = {
      Nordic: "clean lines and natural materials",
      Japandi: "harmonious blend of Japanese and Scandinavian aesthetics",
      Minimalist: "clean, uncluttered design with focus on functionality",
      Modern: "contemporary design with sleek finishes",
      Industrial: "raw materials and urban-inspired elements",
      Rustic: "warm, natural materials and traditional craftsmanship",
      Scandinavian: "bright, airy spaces with natural wood accents",
      Classical: "timeless architectural details and elegant proportions",
      Boho: "eclectic mix of textures, colors, and artistic elements",
      "Cabin-core": "cozy, woodland-inspired design with natural materials",
      Coastal: "light, breezy design inspired by seaside living",
      "Off-grid simple": "sustainable materials and energy-efficient systems",
      "Zen-inspired": "peaceful, meditative spaces with natural elements",
      Eclectic: "unique blend of styles and creative design elements",
      Futuristic: "cutting-edge design with smart technology integration",
    }

    const sizeDescriptions = {
      small: "efficiently designed space that maximizes every square meter",
      medium: "well-proportioned living areas with thoughtful layout",
      large: "spacious interior with generous room sizes and open floor plan",
    }

    const typeDescriptions = {
      "Tiny House": "compact living solution",
      "A-Frame": "iconic triangular design with soaring ceilings",
      "Container Home": "innovative repurposed shipping container design",
      "Modular House": "flexible modular construction for quick assembly",
      Cabin: "cozy retreat perfect for natural settings",
      "Prefab Home": "precision-built prefabricated construction",
      "House on Wheels": "mobile living solution for the adventurous",
      Floathouse: "unique floating home for waterfront living",
    }

    let description = `A beautiful ${primaryStyle.toLowerCase()} style ${type.toLowerCase()} featuring ${styleDescriptions[primaryStyle] || "modern design elements"}`

    if (secondaryStyle) {
      description += ` with ${secondaryStyle.toLowerCase()} influences`
    }

    description += `. This ${typeDescriptions[type] || "home"} offers ${
      size < 30 ? sizeDescriptions.small : size < 70 ? sizeDescriptions.medium : sizeDescriptions.large
    }`

    // Add feature highlights
    if (features.length > 0) {
      const highlightFeatures = features.slice(0, 2)
      description += ` and includes ${highlightFeatures.join(" and ").toLowerCase()}`
    }

    description += "."

    return description
  }

  // Parse size range
  let minSize = 10
  let maxSize = 200
  if (sizeRange) {
    const match = sizeRange.match(/(\d+)–(\d+)/)
    if (match) {
      minSize = Number.parseInt(match[1])
      maxSize = Number.parseInt(match[2])
    } else if (sizeRange.includes("+")) {
      minSize = Number.parseInt(sizeRange.replace(/\D/g, ""))
      maxSize = 300
    }
  }

  // Parse budget range
  let minBudget = 10000
  let maxBudget = 200000
  if (budgetRange) {
    const match = budgetRange.match(/\$(\d+)k–\$(\d+)k/)
    if (match) {
      minBudget = Number.parseInt(match[1]) * 1000
      maxBudget = Number.parseInt(match[2]) * 1000
    } else if (budgetRange.includes("+")) {
      minBudget = Number.parseInt(budgetRange.replace(/\D/g, "")) * 1000
      maxBudget = 300000
    }
  }

  // Generate random houses
  for (let i = 0; i < count; i++) {
    const id = Math.max(...enhancedSampleHouses.map((h) => h.id), ...existingIds) + i + 1
    const type = houseTypes[Math.floor(Math.random() * houseTypes.length)]

    // Generate size based on type and range
    let size
    if (type === "Tiny House") {
      // Tiny houses are typically smaller
      size = Math.floor(Math.random() * Math.min(40, maxSize - minSize)) + Math.max(minSize, 10)
    } else if (type === "Container Home") {
      // Container homes have standard sizes
      size = [20, 30, 40, 60][Math.floor(Math.random() * 4)]
      if (size < minSize || size > maxSize) {
        size = Math.floor(Math.random() * (maxSize - minSize)) + minSize
      }
    } else {
      size = Math.floor(Math.random() * (maxSize - minSize)) + minSize
    }

    // Generate price based on size and type
    let basePrice
    if (type === "Tiny House") {
      basePrice = 30000 + size * 800
    } else if (type === "A-Frame") {
      basePrice = 40000 + size * 900
    } else if (type === "Container Home") {
      basePrice = 35000 + size * 750
    } else if (type === "Modular House") {
      basePrice = 50000 + size * 1000
    } else {
      basePrice = 45000 + size * 850
    }

    // Add some randomness to price
    const priceVariation = basePrice * (Math.random() * 0.3 - 0.15) // ±15%
    let price = Math.round(basePrice + priceVariation)

    // Ensure price is within budget range
    price = Math.max(minBudget, Math.min(maxBudget, price))

    // Ensure at least one selected style is included if styles are provided
    const houseStyles = selectedStyles.length > 0 ? [...selectedStyles] : []

    // Add complementary styles if needed
    const styleOptions = [
      "Nordic",
      "Japandi",
      "Minimalist",
      "Modern",
      "Industrial",
      "Rustic",
      "Scandinavian",
      "Classical",
      "Boho",
      "Cabin-core",
      "Coastal",
      "Off-grid simple",
      "Zen-inspired",
      "Eclectic",
      "Futuristic",
    ]

    while (houseStyles.length < 3) {
      const randomStyle = styleOptions[Math.floor(Math.random() * styleOptions.length)]
      if (!houseStyles.includes(randomStyle)) {
        houseStyles.push(randomStyle)
      }
    }

    // Generate random materials (2-3)
    const houseMaterials = []
    const materialCount = Math.floor(Math.random() * 2) + 2
    for (let j = 0; j < materialCount; j++) {
      const material = materials[Math.floor(Math.random() * materials.length)]
      if (!houseMaterials.includes(material)) {
        houseMaterials.push(material)
      }
    }

    // Generate random features (2-4)
    const houseFeatures = []
    const featureCount = Math.floor(Math.random() * 3) + 2
    for (let j = 0; j < featureCount; j++) {
      const feature = features[Math.floor(Math.random() * features.length)]
      if (!houseFeatures.includes(feature)) {
        houseFeatures.push(feature)
      }
    }

    // Generate contextual name based on styles, type, and size
    const namePrefix = getNamePrefix(houseStyles, type, size)

    const newHouse = {
      id,
      name: `${namePrefix} ${type}`,
      type,
      size,
      price,
      image: "",
      description: generateDescription(houseStyles, type, size, houseFeatures),
      floors: type === "A-Frame" ? 2 : Math.floor(Math.random() * 2) + 1,
      bedrooms: size < 30 ? 1 : size < 70 ? Math.floor(Math.random() * 2) + 1 : Math.floor(Math.random() * 3) + 1,
      bathrooms: size < 50 ? 1 : Math.floor(Math.random() * 2) + 1,
      materials: houseMaterials,
      manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
      yearBuilt: Math.floor(Math.random() * 3) + 2021,
      energyRating: ["A+", "A", "B+", "B"][Math.floor(Math.random() * 4)],
      styles: houseStyles,
      images: [],
      features: houseFeatures,
    }

    // Generate Pinterest images for the house
    const pinterestImages = [
      "https://i.pinimg.com/736x/c5/e4/55/c5e4552dd82a23fc40e19c28292b41d3.jpg",
      "https://i.pinimg.com/1200x/3b/13/20/3b13204e4f7e4b6ccdc81668a14dcee2.jpg",
      "https://i.pinimg.com/736x/1c/90/0f/1c900fde427244db7fe3632e709b0aeb.jpg",
      "https://i.pinimg.com/1200x/60/6e/82/606e82826f3b2d29542b7bc6d8808124.jpg",
      "https://i.pinimg.com/1200x/74/f0/eb/74f0ebdf27048502ff1481ac55fb5b11.jpg",
      "https://i.pinimg.com/1200x/0a/7a/b3/0a7ab3959ca4eafc0bb5b3894e436a62.jpg",
      "https://i.pinimg.com/1200x/11/d2/10/11d210e05a5b32398d2ccbe532abef4a.jpg",
      "https://i.pinimg.com/736x/74/7a/f0/747af0643f80bc35f7cb45d52dcfb575.jpg",
      "https://i.pinimg.com/736x/c5/a9/39/c5a9397941a16c90c830e8a57350ceca.jpg",
      "https://i.pinimg.com/736x/e6/e3/46/e6e3468c1f64983f502d9f448de2d8bc.jpg",
      "https://i.pinimg.com/736x/b1/bc/61/b1bc61af6e5e04b6698440e8a69fc964.jpg",
      "https://i.pinimg.com/1200x/43/25/34/432534d284c5c02f45a13049f17c11e5.jpg",
      "https://i.pinimg.com/1200x/79/94/df/7994df513ac293554df1356be1bfa8ee.jpg",
      "https://i.pinimg.com/1200x/ab/81/2a/ab812a9afae4bd42678eea3d82546951.jpg",
      "https://i.pinimg.com/1200x/83/d7/bc/83d7bcd3f75cc1a24f690bef9cdb642e.jpg",
      "https://i.pinimg.com/1200x/e7/b9/51/e7b9514255e66799c7860c073a78dcf8.jpg",
      "https://i.pinimg.com/1200x/a1/cd/b1/a1cdb152fbeabc4c202e74d541140256.jpg",
      "https://i.pinimg.com/1200x/63/4c/56/634c56c149a614f4261ea3e9f39ea652.jpg",
      "https://i.pinimg.com/1200x/ec/8f/de/ec8fdee37f6dbfa0c7591a12e07f7088.jpg",
      "https://i.pinimg.com/1200x/fa/fc/65/fafc65673bd6ce8e1c54d8a4fa04f4ab.jpg",
      "https://i.pinimg.com/736x/52/f1/aa/52f1aa3ec27be7dff1e5c2d2fc028436.jpg",
    ]

    // Generate Pinterest images for the house
    const imageSet = []
    for (let j = 0; j < 3; j++) {
      const imageIndex = (id * 3 + j) % pinterestImages.length
      imageSet.push(pinterestImages[imageIndex])
    }

    newHouse.image = imageSet[0]
    newHouse.images = imageSet

    houses.push(newHouse)
  }

  return houses
}

// Home type options
const homeTypes = [
  "Tiny House",
  "A-Frame",
  "House on Wheels",
  "Floathouse",
  "Modular House",
  "Container Home",
  "Sauna Cabin",
  "Off-Grid Retreat",
  "Treehouse",
  "Cabin",
  "Prefab Home",
]

// Size ranges
const sizeRanges = ["0–20 m²", "20–40 m²", "40–60 m²", "60–80 m²", "80–120 m²", "120+ m²"]

// Interior style options
const styleOptions = [
  "Nordic",
  "Japandi",
  "Minimalist",
  "Modern",
  "Industrial",
  "Rustic",
  "Scandinavian",
  "Classical",
  "Boho",
  "Cabin-core",
  "Coastal",
  "Off-grid simple",
  "Zen-inspired",
  "Eclectic",
  "Futuristic",
]

// Budget ranges
const budgetRanges = ["$10k–$20k", "$20k–$40k", "$40k–$60k", "$60k–$100k", "$100k–$150k", "$150k+"]

// Distance options
const distanceOptions = ["50 km", "100 km", "200 km", "Entire country"]

// Helper function to get min and max values from range strings
const getRangeValues = (range: string, type: "size" | "budget") => {
  if (!range) return { min: 0, max: Number.POSITIVE_INFINITY }

  if (type === "size") {
    const match = range.match(/(\d+)–(\d+)/)
    if (match) {
      return { min: Number.parseInt(match[1]), max: Number.parseInt(match[2]) }
    } else if (range.includes("+")) {
      return { min: Number.parseInt(range.replace(/\D/g, "")), max: 300 }
    }
  } else if (type === "budget") {
    const match = range.match(/\$(\d+)k–\$(\d+)k/)
    if (match) {
      return { min: Number.parseInt(match[1]) * 1000, max: Number.parseInt(match[2]) * 1000 }
    } else if (range.includes("+")) {
      return { min: Number.parseInt(range.replace(/\D/g, "")) * 1000, max: 300000 }
    }
  }

  return { min: 0, max: Number.POSITIVE_INFINITY }
}

// Placeholder for WebAR models - replace with actual logic or data source
const WEBAR_MODELS = [
  { id: "demo-section", url: "https://create.overlyapp.com/webar/bb8b28bcff8abb7a398cba29d7bcdb0725d0b05e" },
  // Add other models for specific houses, e.g.:
  // { id: 1, url: "path/to/model1.glb" },
  // { id: 2, url: "path/to/model2.glb" },
]

export default function LandingPage() {
  // Changed from Home to LandingPage
  // State for the questionnaire
  const [currentStep, setCurrentStep] = useState(1)
  const [homeType, setHomeType] = useState("")
  const [homeSize, setHomeSize] = useState("")
  const [interiorStyles, setInteriorStyles] = useState<string[]>([])
  const [budget, setBudget] = useState("")
  const [distance, setDistance] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [customType, setCustomType] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [filteredHomeTypes, setFilteredHomeTypes] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [stepsCompleted, setStepsCompleted] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  })

  // State for Pinterest URL analysis
  const [isPinterestUrl, setIsPinterestUrl] = useState(false)
  const [isAnalyzingPinterest, setIsAnalyzingPinterest] = useState(false)
  const [pinterestAnalysisProgress, setPinterestAnalysisProgress] = useState(0)
  const [pinterestUrl, setPinterestUrl] = useState("")

  // Text query analysis state (mirror of Pinterest flow)
  const [isAnalyzingText, setIsAnalyzingText] = useState(false)
  const [textAnalysisProgress, setTextAnalysisProgress] = useState(0)

  // State for sticky navigation
  const [isSticky, setIsSticky] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // State for house detail view
  const [showHouseDetail, setShowHouseDetail] = useState(false)
  const [selectedHouse, setSelectedHouse] = useState<(typeof enhancedSampleHouses)[0] | null>(null)
  const [showARPreview, setShowARPreview] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // State for filtered and similar houses
  const [filteredHouses, setFilteredHouses] = useState<typeof enhancedSampleHouses>([])
  const [similarHouses, setSimilarHouses] = useState<typeof enhancedSampleHouses>([])
  const [visibleSimilarHouses, setVisibleSimilarHouses] = useState<typeof enhancedSampleHouses>([])
  const [hasMoreHouses, setHasMoreHouses] = useState(false)

  // Add these state variables
  const [initialResultsLoaded, setInitialResultsLoaded] = useState(false)
  const [visibleFilteredHouses, setVisibleFilteredHouses] = useState<typeof enhancedSampleHouses>([])
  const [hasMoreFilteredHouses, setHasMoreFilteredHouses] = useState(false)

  // State for subscription form
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [showThankYouModal, setShowThankYouModal] = useState(false)
  const [subscriptionMessage, setSubscriptionMessage] = useState("")
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)

  // Add these new state variables for the builder contact form
  const [showBuilderForm, setShowBuilderForm] = useState(false)
  const [builderName, setBuilderName] = useState("")
  const [builderWebsite, setBuilderWebsite] = useState("")
  const [builderEmail, setBuilderEmail] = useState("")
  const [builderMessage, setBuilderMessage] = useState("")
  const [isBuilderSubmitting, setIsBuilderSubmitting] = useState(false)
  const [showBuilderThankYou, setShowBuilderThankYou] = useState(false)

  // Input ref for focus management
  const inputRef = useRef<HTMLInputElement>(null)

  // Add these state variables after the existing state declarations
  const [freeTextQuery, setFreeTextQuery] = useState("")
  const [parsedSearchQuery, setParsedSearchQuery] = useState<any>(null)
  const [syntheticListings, setSyntheticListings] = useState<typeof enhancedSampleHouses>([])
  const [showSyntheticResults, setShowSyntheticResults] = useState(false)

  // Pinterest results state
  const [pinterestResults, setPinterestResults] = useState<typeof enhancedSampleHouses>([])
  const [showPinterestResults, setShowPinterestResults] = useState(false)
  const [pinterestRefinementStep, setPinterestRefinementStep] = useState(1) // 1: size, 2: budget, 3: location
  const [showRefinementSurvey, setShowRefinementSurvey] = useState(false)

  // Add these state variables after the existing state declarations
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState("")
  const [selectedImageAlt, setSelectedImageAlt] = useState("")

  // Update progress based on completed steps
  useEffect(() => {
    const completedCount = Object.values(stepsCompleted).filter(Boolean).length
    setProgress((completedCount / 5) * 100)
  }, [stepsCompleted])

  // Handle scroll for sticky navigation
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsSticky(true)
      } else {
        setIsSticky(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Filter home types based on input
  useEffect(() => {
    if (customType) {
      // Check if it's a Pinterest URL
      const isPinterest = customType.includes("pinterest.com") || customType.includes("pin.it")
      setIsPinterestUrl(isPinterest)

      if (!isPinterest) {
        const filtered = homeTypes.filter((type) => type.toLowerCase().includes(customType.toLowerCase()))
        setFilteredHomeTypes(filtered)
      } else {
        setFilteredHomeTypes([])
        setPinterestUrl(customType)
      }
    } else {
      setIsPinterestUrl(false)
      setFilteredHomeTypes([])
    }
  }, [customType])

  // Filter houses based on selected criteria
  useEffect(() => {
    if (showResults) {
      // Get range values
      const sizeRange = getRangeValues(homeSize, "size")
      const budgetRangeValue = getRangeValues(budget, "budget")

      // Filter houses based on criteria
      const filtered = enhancedSampleHouses.filter((house) => {
        // Check if house type matches (strict matching)
        const typeMatch = !homeType || house.type === homeType || (homeType === "Custom" && customType === house.type)

        // Check if size is within range
        const sizeMatch = !homeSize || (house.size >= sizeRange.min && house.size <= sizeRange.max)

        // Check if price is within range
        const priceMatch = !budget || (house.price >= budgetRangeValue.min && house.price <= budgetRangeValue.max)

        // Check if at least one style matches (if styles are selected)
        const styleMatch = interiorStyles.length === 0 || interiorStyles.some((style) => house.styles.includes(style))

        return typeMatch && sizeMatch && priceMatch && styleMatch
      })

      // If we don't have enough filtered houses, generate more
      let allHouses = [...filtered]

      if (filtered.length < 6) {
        // Generate additional houses that match criteria
        const additionalHouses = generateRandomHouses(
          12 - filtered.length,
          homeType === "Custom" ? customType : homeType,
          interiorStyles,
          homeSize,
          budget,
          filtered.map((h) => h.id),
        )
        allHouses = [...filtered, ...additionalHouses]
      }

      setFilteredHouses(allHouses)

      // Set initial visible houses (first 6)
      if (!initialResultsLoaded) {
        setVisibleFilteredHouses(allHouses.slice(0, 6))
        setHasMoreFilteredHouses(allHouses.length > 6)
        setInitialResultsLoaded(true)
      } else {
        setVisibleFilteredHouses(allHouses.slice(0, 6))
        setHasMoreFilteredHouses(allHouses.length > 6)
      }
    }
  }, [showResults, homeType, homeSize, budget, interiorStyles, customType, initialResultsLoaded])

  // Generate similar houses when a house is selected
  useEffect(() => {
    if (selectedHouse) {
      // Get existing house IDs to avoid duplicates
      const existingIds = enhancedSampleHouses.map((house) => house.id)

      // Generate 12 similar houses based on the selected house's styles, size, and price
      const generated = generateRandomHouses(
        12,
        selectedHouse.type, // Match the same house type
        selectedHouse.styles, // Match the same styles
        homeSize,
        budget,
        existingIds,
      )

      setSimilarHouses(generated)
      setVisibleSimilarHouses(generated.slice(0, 6))
      setHasMoreHouses(generated.length > 6)
    }
  }, [selectedHouse, homeSize, budget])

  // Handle Pinterest URL analysis
  const analyzePinterestProfile = () => {
    if (!isPinterestUrl) return

    setIsAnalyzingPinterest(true)
    setPinterestAnalysisProgress(0)

    // Simulate analysis progress
    const interval = setInterval(() => {
      setPinterestAnalysisProgress((prev) => {
        const newProgress = prev + Math.random() * 15
        if (newProgress >= 100) {
          clearInterval(interval)

          // After analysis is complete, set some random styles based on "analysis"
          setTimeout(() => {
            // Set random styles based on "analysis"
            const randomStyles = []
            while (randomStyles.length < 2) {
              const style = styleOptions[Math.floor(Math.random() * styleOptions.length)]
              if (!randomStyles.includes(style)) {
                randomStyles.push(style)
              }
            }

            setInteriorStyles(randomStyles)
            setStepsCompleted({ ...stepsCompleted, 1: true, 3: true })
            setHomeType("Tiny House") // Default to Tiny House for Pinterest analysis

            // Generate initial Pinterest results (broader search, 12 results)
            const initialResults = generateRandomHouses(
              12,
              "Tiny House", // Default type from analysis
              randomStyles,
              "", // No size filter initially
              "", // No budget filter initially
              [],
            )
            setPinterestResults(initialResults)
            setShowPinterestResults(true)
            setIsAnalyzingPinterest(false)

            // Don't move to next step, stay on current view to show results
          }, 500)

          return 100
        }
        return newProgress
      })
    }, 200)
  }

  // Handle next step
  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowResults(true)
    }
  }

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle home type selection
  const handleHomeTypeSelect = (type: string) => {
    setHomeType(type)
    setCustomType("")
    setStepsCompleted({ ...stepsCompleted, 1: true })
  }

  // Handle interior style selection
  const handleStyleToggle = (style: string) => {
    setInteriorStyles((prev) => {
      // If style is already selected, remove it
      if (prev.includes(style)) {
        const newStyles = prev.filter((s) => s !== style)

        // Update step completion status
        setStepsCompleted({
          ...stepsCompleted,
          3: newStyles.length > 0,
        })

        return newStyles
      }
      // If not selected and we have less than 3 styles, add it
      else if (prev.length < 3) {
        const newStyles = [...prev, style]

        // Update step completion status
        setStepsCompleted({
          ...stepsCompleted,
          3: newStyles.length > 0,
        })

        return newStyles
      }

      // If we already have 3 styles, don't add more
      return prev
    })
  }

  // Format price to currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Scroll to section
  const scrollToSection = (id: string) => {
    if (showHouseDetail) {
      // If in product view, first go back to results
      backToResults()
      // Then use setTimeout to ensure the main page is loaded before scrolling
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  // Handle "See more" button click
  const handleSeeMore = (house: (typeof enhancedSampleHouses)[0]) => {
    setSelectedHouse(house)

    // Generate similar houses based on the selected house
    const existingIds = enhancedSampleHouses.map((house) => house.id)
    const generated = generateRandomHouses(
      12,
      house.type, // Match the same house type
      house.styles, // Match the same styles
      homeSize,
      budget,
      existingIds,
    )

    setSimilarHouses(generated)
    setVisibleSimilarHouses(generated.slice(0, 6))
    setHasMoreHouses(generated.length > 6)

    setShowHouseDetail(true)
    window.scrollTo(0, 0)
  }

  // Handle "View in AR" button click
  const handleViewAR = () => {
    setShowARPreview(true)
  }

  // Close AR preview modal
  const closeARPreview = () => {
    setShowARPreview(false)
  }

  // Back to results
  const backToResults = () => {
    setShowHouseDetail(false)
    setSelectedHouse(null)
    setVisibleSimilarHouses([])
    setSimilarHouses([])
    window.scrollTo(0, 0)
  }

  // Load more similar houses
  const loadMoreHouses = () => {
    const currentCount = visibleSimilarHouses.length
    const nextBatch = similarHouses.slice(currentCount, currentCount + 6)
    setVisibleSimilarHouses([...visibleSimilarHouses, ...nextBatch])
    setHasMoreHouses(currentCount + 6 < similarHouses.length)
  }

  // Load more filtered houses
  const loadMoreFilteredHouses = () => {
    const currentCount = visibleFilteredHouses.length
    const nextBatch = filteredHouses.slice(currentCount, currentCount + 6)
    setVisibleFilteredHouses([...visibleFilteredHouses, ...nextBatch])
    setHasMoreFilteredHouses(currentCount + 6 < filteredHouses.length)
  }

  // Handle subscription form submission
  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", formName)
      formData.append("email", formEmail)

      const result = await subscribeToEarlyAccess(formData)

      if (result.success) {
        setSubscriptionMessage(result.message)
        setIsSubscribed(true)
        setShowSubscribeModal(false)
        setShowThankYouModal(true)
        // Clear form
        setFormName("")
        setFormEmail("")
      } else {
        setSubscriptionMessage(result.message)
        setShowThankYouModal(true)
      }
    } catch (error) {
      setSubscriptionMessage("An error occurred. Please try again later.")
      setShowThankYouModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFreeTextSearch = (query: string) => {
    const q = (query || "").trim()
    if (!q) return

    // Start text-analysis animation (2.5–3.0s, same feel as Pinterest)
    setIsAnalyzingText(true)
    setTextAnalysisProgress(0)

    const t0 = Date.now()
    const steps = [
      "Understanding your request…",
      "Extracting style & type…",
      "Applying budget, size and location…",
      "Ranking matches from local builders…",
      "Preparing results…",
    ]

    const timer = setInterval(() => {
      setTextAnalysisProgress((p) => {
        // Ease to 96% max during animation; final 100% when done
        const elapsed = Date.now() - t0
        const target = Math.min(96, Math.floor((elapsed / 2600) * 100))
        return p < target ? p + 2 : p
      })
    }, 180)

    // Do the actual parsing & listing generation while the bar animates
    const parsed = parseSearchQuery(q)
    setParsedSearchQuery(parsed)

    if (parsed.type) setHomeType(parsed.type)
    if (parsed.styles.length > 0) setInteriorStyles(parsed.styles.slice(0, 3))
    if (parsed.size) setHomeSize(parsed.size)
    if (parsed.priceRange) setBudget(parsed.priceRange)

    const synthetic = generateSyntheticListings(parsed, 6)
    setSyntheticListings(synthetic)

    // Mark step 1 complete so the CTA isn't disabled anymore
    setStepsCompleted((prev) => ({ ...prev, 1: true }))

    // Finish animation and reveal results
    setTimeout(() => {
      clearInterval(timer)
      setTextAnalysisProgress(100)
      setIsAnalyzingText(false)

      setShowSyntheticResults(true)
      setShowResults(false)
      setShowHouseDetail(false)

      // Smooth scroll to results with proper timing
      setTimeout(() => {
        const resultsElement = document.getElementById("results")
        if (resultsElement) {
          resultsElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          })
        } else {
          // Fallback: scroll to a reasonable position
          window.scrollTo({
            top: window.innerHeight * 0.8,
            behavior: "smooth",
          })
        }
      }, 200)
    }, 2600)
  }

  // Add this function to handle the builder form submission
  const handleBuilderSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isBuilderSubmitting) return

    setIsBuilderSubmitting(true)

    try {
      // In a real app, you would send this data to your backend
      console.log("Builder submission:", {
        name: builderName,
        website: builderWebsite,
        email: builderEmail,
        message: builderMessage,
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Show thank you message
      setShowBuilderThankYou(true)
      setShowBuilderForm(false)

      // Clear form
      setBuilderName("")
      setBuilderWebsite("")
      setBuilderEmail("")
      setBuilderMessage("")
    } catch (error) {
      console.error("Builder form submission error:", error)
    } finally {
      setIsBuilderSubmitting(false)
    }
  }

  // Add this function to open the builder form
  const openBuilderForm = () => {
    setShowBuilderForm(true)
  }

  // Add this function to close the builder form
  const closeBuilderForm = () => {
    setShowBuilderForm(false)
  }

  // Add this function to close the builder thank you modal
  const closeBuilderThankYou = () => {
    setShowBuilderThankYou(false)
  }

  // Close thank you modal
  const closeThankYouModal = () => {
    setShowThankYouModal(false)
  }

  // Handle explore button click
  const handleExplore = () => {
    window.scrollTo(0, 0)
    document.getElementById("find-home")?.scrollIntoView({ behavior: "smooth" })
  }

  // Open subscription modal
  const openSubscribeModal = () => {
    setShowSubscribeModal(true)
  }

  // Close subscription modal
  const closeSubscribeModal = () => {
    setShowSubscribeModal(false)
  }

  // Handle Pinterest refinement survey
  const startPinterestRefinement = () => {
    setShowRefinementSurvey(true)
    setPinterestRefinementStep(1)
  }

  const handlePinterestRefinementNext = () => {
    if (pinterestRefinementStep < 3) {
      setPinterestRefinementStep(pinterestRefinementStep + 1)
    } else {
      // Apply filters and show refined results
      applyPinterestFilters()
    }
  }

  const handlePinterestRefinementPrev = () => {
    if (pinterestRefinementStep > 1) {
      setPinterestRefinementStep(pinterestRefinementStep - 1)
    }
  }

  const applyPinterestFilters = () => {
    // Filter the Pinterest results based on selected criteria
    const sizeRange = getRangeValues(homeSize, "size")
    const budgetRangeValue = getRangeValues(budget, "budget")

    const filtered = pinterestResults.filter((house) => {
      // Check if size is within range
      const sizeMatch = !homeSize || (house.size >= sizeRange.min && house.size <= sizeRange.max)

      // Check if price is within range
      const priceMatch = !budget || (house.price >= budgetRangeValue.min && house.price <= budgetRangeValue.max)

      return sizeMatch && priceMatch
    })

    // If we don't have enough filtered houses, generate more with the filters
    let refinedResults = [...filtered]
    if (filtered.length < 6) {
      const additionalHouses = generateRandomHouses(
        8 - filtered.length,
        homeType,
        interiorStyles,
        homeSize,
        budget,
        filtered.map((h) => h.id),
      )
      refinedResults = [...filtered, ...additionalHouses]
    }

    // Update the Pinterest results and close refinement survey
    setPinterestResults(refinedResults.slice(0, 6)) // Show top 6 refined results
    setShowRefinementSurvey(false)
    setShowPinterestResults(true)

    // Mark remaining steps as complete
    setStepsCompleted({
      1: true,
      2: !!homeSize,
      3: true,
      4: !!budget,
      5: !!distance,
    })
  }

  const closePinterestResults = () => {
    setShowPinterestResults(false)
    setPinterestResults([])
    setShowRefinementSurvey(false)
    setPinterestRefinementStep(1)
    // Reset to normal questionnaire flow
    setCurrentStep(2)
  }

  // Add these functions after the existing functions
  const openImageModal = (imageSrc: string, alt: string) => {
    setSelectedImage(imageSrc)
    setSelectedImageAlt(alt)
    setShowImageModal(true)
  }

  const closeImageModal = () => {
    setShowImageModal(false)
    setSelectedImage("")
    setSelectedImageAlt("")
  }

  const demoWebARModel = getWebARModelForHouse("demo-section")

  const arPreviewWebARModel = selectedHouse ? getWebARModelForHouse(selectedHouse.id) : WEBAR_MODELS[0].url // Use the URL property

  return (
    <div className="w-full bg-white">
      {/* Sticky Navigation */}
      <header
        className={`w-full z-50 transition-all duration-300 ${
          isSticky ? "fixed top-0 bg-white shadow-md" : "relative bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => {
              window.location.href = window.location.pathname
            }}
            className="flex items-center gap-2 font-semibold text-lg"
          >
            <Home className="h-6 w-6 text-teal-600" />
            <span>HausMatch</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("find-home")}
              className="text-gray-700 hover:text-teal-600 transition-colors"
            >
              Find a House
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-gray-700 hover:text-teal-600 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("for-builders")}
              className="text-gray-700 hover:text-teal-600 transition-colors"
            >
              For Builders
            </button>
            <a href="/blog" className="text-gray-700 hover:text-teal-600 transition-colors">
              Blog
            </a>
            <button
              onClick={() => scrollToSection("about")}
              className="text-gray-700 hover:text-teal-600 transition-colors"
            >
              About
            </button>
          </nav>

          <div className="hidden md:block">
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={openSubscribeModal}>
              Join Early Access
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-md">
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection("find-home")}
                className="text-gray-700 hover:text-teal-600 transition-colors py-2"
              >
                Find a House
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-gray-700 hover:text-teal-600 transition-colors py-2"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("for-builders")}
                className="text-gray-700 hover:text-teal-600 transition-colors py-2"
              >
                For Builders
              </button>
              <a href="/blog" className="text-gray-700 hover:text-teal-600 transition-colors py-2">
                Blog
              </a>
              <button
                onClick={() => scrollToSection("about")}
                className="text-gray-700 hover:text-teal-600 transition-colors py-2"
              >
                About
              </button>
              <Button className="bg-teal-600 hover:bg-teal-700 w-full" onClick={openSubscribeModal}>
                Join Early Access
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {showHouseDetail ? (
          // House Detail View
          <section className="w-full py-12 bg-white">
            <div className="container px-4 md:px-6">
              <div className="mb-6">
                <Button variant="outline" onClick={backToResults} className="flex items-center gap-2 bg-transparent">
                  <ArrowLeft className="h-4 w-4" /> Back to results
                </Button>
              </div>

              {selectedHouse && (
                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                      <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden border">
                        <img
                          src={selectedHouse.images[activeImageIndex] || "/placeholder.svg"}
                          alt={`${selectedHouse.name} - Image ${activeImageIndex + 1}`}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() =>
                            openImageModal(
                              selectedHouse.images[activeImageIndex],
                              `${selectedHouse.name} - Image ${activeImageIndex + 1}`,
                            )
                          }
                        />
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {selectedHouse.images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveImageIndex(idx)}
                            className={`relative h-20 w-20 rounded-md overflow-hidden border-2 flex-shrink-0 ${
                              activeImageIndex === idx ? "border-teal-600" : "border-transparent"
                            }`}
                          >
                            <img
                              src={img || "/placeholder.svg"}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* House Details */}
                    <div className="space-y-6">
                      <div>
                        <h1 className="text-3xl font-bold">{selectedHouse.name}</h1>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-teal-100 text-teal-800">{selectedHouse.type}</Badge>
                          <span className="text-2xl font-semibold text-teal-600">
                            {formatPrice(selectedHouse.price)}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700">{selectedHouse.description}</p>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Ruler className="h-5 w-5 text-teal-600" />
                          <span>
                            <strong>Size:</strong> {selectedHouse.size} m²
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Layers className="h-5 w-5 text-teal-600" />
                          <span>
                            <strong>Floors:</strong> {selectedHouse.floors}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Home className="h-5 w-5 text-teal-600" />
                          <span>
                            <strong>Bedrooms:</strong> {selectedHouse.bedrooms}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Info className="h-5 w-5 text-teal-600" />
                          <span>
                            <strong>Bathrooms:</strong> {selectedHouse.bathrooms}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Hammer className="h-5 w-5 text-teal-600" />
                          <span>
                            <strong>Materials:</strong> {selectedHouse.materials.join(", ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Factory className="h-5 w-5 text-teal-600" />
                          <span>
                            <strong>Manufacturer:</strong> {selectedHouse.manufacturer}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-teal-600" />
                          <span>
                            <strong>Year:</strong> {selectedHouse.yearBuilt}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-teal-600" />
                          <span>
                            <strong>Energy Rating:</strong> {selectedHouse.energyRating}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Styles</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedHouse.styles.map((style, idx) => (
                            <Badge key={idx} variant="outline" className="bg-teal-50 text-teal-800">
                              {style}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-2">Features</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedHouse.features.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="bg-gray-50">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button onClick={handleViewAR} className="w-full bg-teal-600 hover:bg-teal-700">
                          View in AR
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Similar Houses */}
                  <div className="mt-16">
                    <h2 className="text-2xl font-bold mb-6">Similar Houses You Might Like</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {visibleSimilarHouses.map((house) => (
                        <Card key={house.id} className="overflow-hidden border-0 shadow-md">
                          <div className="relative h-48 w-full">
                            <img
                              src={house.image || "/placeholder.svg"}
                              alt={house.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-lg font-semibold">{house.name}</h4>
                              <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">{house.type}</Badge>
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
                            <Button
                              className="w-full bg-teal-600 hover:bg-teal-700"
                              onClick={() => handleSeeMore(house)}
                            >
                              See more
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {hasMoreHouses && (
                      <div className="flex justify-center mt-8">
                        <Button
                          variant="outline"
                          onClick={loadMoreHouses}
                          className="flex items-center gap-2 bg-transparent"
                        >
                          Load more <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            {/* Questionnaire Section (Moved to top) */}
            <section id="find-home" className="w-full py-12 md:py-24 bg-white">
              <div className="container px-4 md:px-6 relative z-10">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                    Your AI Assistant for Finding the Perfect Prefab Home
                  </h2>
                  <p className="mt-3 text-gray-500 max-w-[700px] mx-auto">
                    We connect you with the right house and the people who build it.
                  </p>
                </div>

                <div className="max-w-3xl mx-auto">
                  {/* Progress bar */}
                  {!showRefinementSurvey && (
                    <div className="mb-8">
                      <div className="flex justify-between text-sm text-gray-500 mb-2">
                        <span>Step {currentStep} of 5</span>
                        {!showResults && <span>{Math.round(progress)}% Complete</span>}
                      </div>
                      <Progress value={showResults ? 100 : progress} className="h-2" />
                    </div>
                  )}

                  {/* Questionnaire */}
                  {!showResults ? (
                    <div className="bg-white rounded-lg shadow-md p-8">
                      {/* Step 1: Home Type */}
                      {currentStep === 1 && !showPinterestResults && (
                        <div className="space-y-6">
                          <h3 className="text-xl font-semibold">What type of home are you looking for?</h3>

                          <div className="relative">
                            <Input
                              ref={inputRef}
                              type="text"
                              placeholder="Type or describe what you're looking for (e.g., 'nordic A-frame cabin in Sweden')..."
                              value={customType}
                              onChange={(e) => {
                                setCustomType(e.target.value)
                                setHomeType("")
                                setIsTyping(true)
                              }}
                              className="h-12 text-lg"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  if (isPinterestUrl) {
                                    analyzePinterestProfile()
                                  } else if (customType.trim()) {
                                    // Handle AI search
                                    handleFreeTextSearch(customType)
                                  } else if (filteredHomeTypes.length > 0) {
                                    handleHomeTypeSelect(filteredHomeTypes[0])
                                  }
                                }
                              }}
                            />
                          </div>

                          {/* Pinterest URL Analysis UI */}
                          {isPinterestUrl && !isAnalyzingPinterest && (
                            <div className="mt-4 p-4 bg-teal-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <ImageIcon className="h-5 w-5 text-teal-600" />
                                <p className="text-teal-800 font-medium">Pinterest profile detected!</p>
                              </div>
                              <p className="text-gray-600 mb-4">
                                We can analyze your Pinterest boards to suggest homes that match your style preferences.
                              </p>
                              <Button
                                onClick={analyzePinterestProfile}
                                className="w-full bg-teal-600 hover:bg-teal-700"
                              >
                                Analyze My Pinterest Profile
                              </Button>
                            </div>
                          )}

                          {/* Pinterest Analysis Progress */}
                          {isAnalyzingPinterest && (
                            <div className="mt-4 p-4 bg-teal-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Loader2 className="h-5 w-5 text-teal-600 animate-spin" />
                                <p className="text-teal-800 font-medium">Analyzing your Pinterest profile...</p>
                              </div>
                              <div className="space-y-2">
                                <Progress value={pinterestAnalysisProgress} className="h-2" />
                                <div className="text-xs text-gray-500 flex justify-between">
                                  <span>Scanning boards</span>
                                  <span>{Math.round(pinterestAnalysisProgress)}%</span>
                                </div>
                              </div>
                              <div className="mt-3 text-sm text-gray-600">
                                <p>Identifying your style preferences and home type interests...</p>
                              </div>
                            </div>
                          )}

                          {/* Text Analysis Progress */}
                          {isAnalyzingText && (
                            <div className="mt-4 p-4 bg-teal-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Loader2 className="h-5 w-5 text-teal-600 animate-spin" />
                                <p className="text-teal-800 font-medium">Understanding your request…</p>
                              </div>
                              <div className="space-y-2">
                                <Progress value={textAnalysisProgress} className="h-2" />
                                <div className="text-xs text-gray-500 flex justify-between">
                                  <span>Extracting style & type</span>
                                  <span>{Math.round(textAnalysisProgress)}%</span>
                                </div>
                              </div>
                              <div className="mt-3 text-sm text-gray-600">
                                <p>Applying budget, size, and location…</p>
                              </div>
                            </div>
                          )}

                          {/* Show filtered suggestions when typing */}
                          {customType && filteredHomeTypes.length > 0 && !isPinterestUrl && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {filteredHomeTypes.map((type) => (
                                <Badge
                                  key={type}
                                  variant="outline"
                                  className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                                  onClick={() => handleHomeTypeSelect(type)}
                                >
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {!isPinterestUrl && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {homeTypes.map((type) => (
                                <Badge
                                  key={type}
                                  variant={homeType === type ? "default" : "outline"}
                                  className={`px-4 py-2 text-sm cursor-pointer ${
                                    homeType === type ? "bg-teal-600" : "hover:bg-gray-100"
                                  }`}
                                  onClick={() => handleHomeTypeSelect(type)}
                                >
                                  {type}
                                </Badge>
                              ))}
                              <Badge
                                variant={homeType === "Custom" && customType !== "" ? "default" : "outline"}
                                className={`px-4 py-2 text-sm cursor-pointer ${
                                  homeType === "Custom" && customType !== "" ? "bg-teal-600" : "hover:bg-gray-100"
                                }`}
                                onClick={() => {
                                  if (customType) {
                                    setHomeType("Custom")
                                    setStepsCompleted({ ...stepsCompleted, 1: true })
                                  } else {
                                    setIsTyping(true)
                                    setTimeout(() => {
                                      inputRef.current?.focus()
                                    }, 0)
                                  }
                                }}
                              >
                                Custom
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Pinterest Results Display */}
                      {showPinterestResults && !showRefinementSurvey && (
                        <div className="space-y-6">
                          <div className="text-center">
                            <h3 className="text-xl font-semibold mb-2">
                              Based on your Pinterest style, here's what we found!
                            </h3>
                            <p className="text-gray-600">
                              We found {pinterestResults.length} homes that match your aesthetic preferences.
                            </p>

                            {/* Show detected styles */}
                            <div className="flex flex-wrap gap-2 justify-center mt-4">
                              <span className="text-sm text-gray-500">Detected styles:</span>
                              {interiorStyles.map((style) => (
                                <Badge key={style} className="bg-teal-100 text-teal-800">
                                  {style}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Pinterest Results Grid */}
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto">
                            {pinterestResults.slice(0, 6).map((house) => (
                              <Card
                                key={house.id}
                                className="overflow-hidden border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleSeeMore(house)}
                              >
                                <div className="relative h-32 w-full">
                                  <img
                                    src={house.image || "/placeholder.svg"}
                                    alt={house.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="p-3">
                                  <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-sm font-semibold truncate">{house.name}</h4>
                                    <Badge className="bg-teal-100 text-teal-800 text-xs">{house.type}</Badge>
                                  </div>
                                  <div className="flex items-center gap-3 text-gray-600 text-xs">
                                    <div className="flex items-center">
                                      <Ruler className="h-3 w-3 mr-1" />
                                      <span>{house.size} m²</span>
                                    </div>
                                    <div className="flex items-center">
                                      <DollarSign className="h-3 w-3 mr-1" />
                                      <span>{formatPrice(house.price)}</span>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>

                          <div className="text-center space-y-4">
                            <p className="text-gray-600">
                              Want to narrow down these results? Let's add a few more details to find your perfect
                              match.
                            </p>
                            <div className="flex gap-3 justify-center">
                              <Button variant="outline" onClick={closePinterestResults} className="bg-transparent">
                                Start Over
                              </Button>
                              <Button onClick={startPinterestRefinement} className="bg-teal-600 hover:bg-teal-700">
                                Refine Results
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Pinterest Refinement Survey */}
                      {showRefinementSurvey && (
                        <div className="space-y-6">
                          <div className="text-center mb-6">
                            <h3 className="text-xl font-semibold">Let's refine your results</h3>
                            <p className="text-gray-600">Step {pinterestRefinementStep} of 3</p>
                            <Progress value={(pinterestRefinementStep / 3) * 100} className="h-2 mt-2" />
                          </div>

                          {/* Refinement Step 1: Size */}
                          {pinterestRefinementStep === 1 && (
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium">What size are you looking for?</h4>
                              <div className="relative">
                                <Input
                                  type="text"
                                  placeholder="Enter size in square meters..."
                                  value={homeSize}
                                  onChange={(e) => {
                                    setHomeSize(e.target.value)
                                    setStepsCompleted({ ...stepsCompleted, 2: !!e.target.value })
                                  }}
                                  className="h-12 text-lg"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                  <span className="text-gray-500">m²</span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {sizeRanges.map((range) => (
                                  <Badge
                                    key={range}
                                    variant={homeSize === range ? "default" : "outline"}
                                    className={`px-4 py-2 text-sm cursor-pointer ${
                                      homeSize === range ? "bg-teal-600" : "hover:bg-gray-100"
                                    }`}
                                    onClick={() => {
                                      setHomeSize(range)
                                      setStepsCompleted({ ...stepsCompleted, 2: true })
                                    }}
                                  >
                                    {range}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Refinement Step 2: Budget */}
                          {pinterestRefinementStep === 2 && (
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium">What is your budget?</h4>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                  <DollarSign className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                  type="text"
                                  placeholder="Enter your budget..."
                                  value={budget}
                                  onChange={(e) => {
                                    setBudget(e.target.value)
                                    setStepsCompleted({ ...stepsCompleted, 4: !!e.target.value })
                                  }}
                                  className="h-12 text-lg pl-10"
                                />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {budgetRanges.map((range) => (
                                  <Badge
                                    key={range}
                                    variant={budget === range ? "default" : "outline"}
                                    className={`px-4 py-2 text-sm cursor-pointer ${
                                      budget === range ? "bg-teal-600" : "hover:bg-gray-100"
                                    }`}
                                    onClick={() => {
                                      setBudget(range)
                                      setStepsCompleted({ ...stepsCompleted, 4: true })
                                    }}
                                  >
                                    {range}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Refinement Step 3: Location */}
                          {pinterestRefinementStep === 3 && (
                            <div className="space-y-4">
                              <h4 className="text-lg font-medium">
                                How far from your location should it be available?
                              </h4>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                  <MapPin className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                  type="text"
                                  placeholder="Enter distance..."
                                  value={distance}
                                  onChange={(e) => {
                                    setDistance(e.target.value)
                                    setStepsCompleted({ ...stepsCompleted, 5: !!e.target.value })
                                  }}
                                  className="h-12 text-lg pl-10"
                                />
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {distanceOptions.map((option) => (
                                  <Badge
                                    key={option}
                                    variant={distance === option ? "default" : "outline"}
                                    className={`px-4 py-2 text-sm cursor-pointer ${
                                      distance === option ? "bg-teal-600" : "hover:bg-gray-100"
                                    }`}
                                    onClick={() => {
                                      setDistance(option)
                                      setStepsCompleted({ ...stepsCompleted, 5: true })
                                    }}
                                  >
                                    {option}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Refinement Navigation */}
                          <div className="flex justify-between mt-8">
                            <Button
                              variant="outline"
                              onClick={
                                pinterestRefinementStep === 1
                                  ? () => setShowRefinementSurvey(false)
                                  : handlePinterestRefinementPrev
                              }
                              className="flex items-center bg-transparent"
                            >
                              <ChevronLeft className="mr-1 h-4 w-4" />
                              {pinterestRefinementStep === 1 ? "Back to Results" : "Back"}
                            </Button>
                            <Button
                              onClick={handlePinterestRefinementNext}
                              className="bg-teal-600 hover:bg-teal-700 flex items-center"
                            >
                              {pinterestRefinementStep === 3 ? "Apply Filters" : "Next"}
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Home Size */}
                      {currentStep === 2 && (
                        <div className="space-y-6">
                          <h3 className="text-xl font-semibold">What size are you looking for?</h3>
                          <div className="relative">
                            <Input
                              type="text"
                              placeholder="Enter size in square meters..."
                              value={homeSize}
                              onChange={(e) => {
                                setHomeSize(e.target.value)
                                setStepsCompleted({ ...stepsCompleted, 2: !!e.target.value })
                              }}
                              className="h-12 text-lg"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <span className="text-gray-500">m²</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {sizeRanges.map((range) => (
                              <Badge
                                key={range}
                                variant={homeSize === range ? "default" : "outline"}
                                className={`px-4 py-2 text-sm cursor-pointer ${
                                  homeSize === range ? "bg-teal-600" : "hover:bg-gray-100"
                                }`}
                                onClick={() => {
                                  setHomeSize(range)
                                  setStepsCompleted({ ...stepsCompleted, 2: true })
                                }}
                              >
                                {range}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 3: Interior Style */}
                      {currentStep === 3 && (
                        <div className="space-y-6">
                          <h3 className="text-xl font-semibold">What interior style do you prefer?</h3>
                          <p className="text-gray-600">Select up to 3 styles that appeal to you</p>
                          <div className="flex flex-wrap gap-2">
                            {styleOptions.map((style) => (
                              <Badge
                                key={style}
                                variant={interiorStyles.includes(style) ? "default" : "outline"}
                                className={`px-4 py-2 text-sm cursor-pointer ${
                                  interiorStyles.includes(style) ? "bg-teal-600" : "hover:bg-gray-100"
                                }`}
                                onClick={() => handleStyleToggle(style)}
                              >
                                {style}
                              </Badge>
                            ))}
                          </div>
                          {interiorStyles.length > 0 && (
                            <div className="text-sm text-gray-600">
                              Selected: {interiorStyles.join(", ")} ({interiorStyles.length}/3)
                            </div>
                          )}
                        </div>
                      )}

                      {/* Step 4: Budget */}
                      {currentStep === 4 && (
                        <div className="space-y-6">
                          <h3 className="text-xl font-semibold">What is your budget?</h3>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <DollarSign className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                              type="text"
                              placeholder="Enter your budget..."
                              value={budget}
                              onChange={(e) => {
                                setBudget(e.target.value)
                                setStepsCompleted({ ...stepsCompleted, 4: !!e.target.value })
                              }}
                              className="h-12 text-lg pl-10"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {budgetRanges.map((range) => (
                              <Badge
                                key={range}
                                variant={budget === range ? "default" : "outline"}
                                className={`px-4 py-2 text-sm cursor-pointer ${
                                  budget === range ? "bg-teal-600" : "hover:bg-gray-100"
                                }`}
                                onClick={() => {
                                  setBudget(range)
                                  setStepsCompleted({ ...stepsCompleted, 4: true })
                                }}
                              >
                                {range}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Step 5: Distance */}
                      {currentStep === 5 && (
                        <div className="space-y-6">
                          <h3 className="text-xl font-semibold">How far from your location should it be available?</h3>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <MapPin className="h-5 w-5 text-gray-400" />
                            </div>
                            <Input
                              type="text"
                              placeholder="Enter distance..."
                              value={distance}
                              onChange={(e) => {
                                setDistance(e.target.value)
                                setStepsCompleted({ ...stepsCompleted, 5: !!e.target.value })
                              }}
                              className="h-12 text-lg pl-10"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {distanceOptions.map((option) => (
                              <Badge
                                key={option}
                                variant={distance === option ? "default" : "outline"}
                                className={`px-4 py-2 text-sm cursor-pointer ${
                                  distance === option ? "bg-teal-600" : "hover:bg-gray-100"
                                }`}
                                onClick={() => {
                                  setDistance(option)
                                  setStepsCompleted({ ...stepsCompleted, 5: true })
                                }}
                              >
                                {option}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Navigation buttons */}
                      {!showPinterestResults && !showRefinementSurvey && (
                        <div className="flex justify-between mt-10">
                          {/* Only show Back button if not on first step */}
                          {currentStep > 1 && (
                            <Button
                              variant="outline"
                              onClick={handlePrevStep}
                              className="flex items-center bg-transparent"
                            >
                              <ChevronLeft className="mr-1 h-4 w-4" /> Back
                            </Button>
                          )}
                          {currentStep === 1 && <div></div>}
                          <Button
                            onClick={() => {
                              // If on step 1 and there's custom text but no home type selected, run text search
                              if (currentStep === 1 && customType.trim() && !homeType && !isPinterestUrl) {
                                handleFreeTextSearch(customType)
                              } else {
                                handleNextStep()
                              }
                            }}
                            className="bg-teal-600 hover:bg-teal-700 flex items-center"
                            disabled={
                              (!stepsCompleted[currentStep] && !(currentStep === 1 && customType.trim())) ||
                              isAnalyzingPinterest ||
                              isAnalyzingText
                            }
                          >
                            {currentStep === 1 && customType.trim() && !homeType && !isPinterestUrl
                              ? "Search"
                              : currentStep === 5
                                ? "Show Results"
                                : "Next"}
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Results section
                    <div className="space-y-8">
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold">Homes matching your criteria</h3>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowResults(false)
                              setCurrentStep(1)
                              setStepsCompleted({
                                1: !!homeType,
                                2: !!homeSize,
                                3: interiorStyles.length > 0,
                                4: !!budget,
                                5: !!distance,
                              })
                              setInitialResultsLoaded(false)
                            }}
                            className="text-sm"
                          >
                            Modify Search
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {homeType && (
                            <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800">
                              {homeType === "Custom" ? customType : homeType}
                            </Badge>
                          )}
                          {homeSize && (
                            <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800">
                              {homeSize}
                            </Badge>
                          )}
                          {interiorStyles.length > 0 && (
                            <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800">
                              {interiorStyles.length === 1
                                ? interiorStyles[0]
                                : `${interiorStyles.length} styles selected`}
                            </Badge>
                          )}
                          {budget && (
                            <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800">
                              {budget}
                            </Badge>
                          )}
                          {distance && (
                            <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800">
                              {distance}
                            </Badge>
                          )}
                        </div>

                        {filteredHouses.length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-gray-500">
                              No homes match your criteria. Try adjusting your preferences.
                            </p>
                          </div>
                        )}
                      </div>

                      {filteredHouses.length > 0 && (
                        <div className="space-y-8">
                          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                            {visibleFilteredHouses.map((house) => (
                              <Card key={house.id} className="overflow-hidden border-0 shadow-md">
                                <div className="relative h-48 w-full">
                                  <img
                                    src={house.image || "/placeholder.svg"}
                                    alt={house.name}
                                    className="h-full w-full object-cover cursor-pointer"
                                    onClick={() => openImageModal(house.image, house.name)}
                                  />
                                </div>
                                <div className="p-5">
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-lg font-semibold">{house.name}</h4>
                                    <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">{house.type}</Badge>
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
                                  <Button
                                    className="w-full bg-teal-600 hover:bg-teal-700"
                                    onClick={() => handleSeeMore(house)}
                                  >
                                    See more
                                  </Button>
                                </div>
                              </Card>
                            ))}
                          </div>

                          {hasMoreFilteredHouses && (
                            <div className="flex justify-center mt-8">
                              <Button
                                variant="outline"
                                onClick={loadMoreFilteredHouses}
                                className="flex items-center gap-2 bg-transparent"
                              >
                                Load more <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 1. Hero Section */}
            <section className="w-full py-12 md:py-24 lg:py-32 bg-white relative">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-15"
                style={{ backgroundImage: 'url("/images/header-1.jpg")' }}
              ></div>
              <div className="container px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center space-y-6 text-center">
                  <div className="space-y-3 max-w-4xl">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                      Forget endless searching.
                    </h1>
                    <p className="mx-auto max-w-[800px] text-gray-600 md:text-xl mt-4">
                      We'll help you find the prefab home you didn't know existed and connect you with the right builder
                      for a better deal.
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button className="bg-teal-600 hover:bg-teal-700 px-8 py-6 text-lg" onClick={openSubscribeModal}>
                      Join Early Access
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. How It Works (3-Step Block) */}
            <section id="how-it-works" className="w-full py-16 md:py-24 bg-gray-50">
              <div className="container px-4 md:px-6">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">How It Works</h2>
                  <p className="mt-3 text-gray-500 max-w-[700px] mx-auto">
                    Three simple steps to find and visualize your perfect prefab home
                  </p>
                </div>

                <div className="grid gap-10 md:grid-cols-3 max-w-5xl mx-auto">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                      <Search className="h-8 w-8 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold">Describe Your Dream Home</h3>
                    <p className="text-gray-500">Tell us your style, budget, and location.</p>
                  </div>

                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                      <Zap className="h-8 w-8 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold">Get Instant Matches</h3>
                    <p className="text-gray-500">Our AI suggests homes that fit you perfectly.</p>
                  </div>

                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                      <Smartphone className="h-8 w-8 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold">See It In Real Space</h3>
                    <p className="text-gray-500">Visualize your future home on your own land using your phone.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. For Builders – Dedicated Section */}
            <section id="for-builders" className="w-full py-16 md:py-24 bg-gray-50">
              <div className="container px-4 md:px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                  <div className="space-y-6">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Built for Builders Too</h2>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      Reach highly engaged buyers looking for homes like yours. Upload your models, let customers
                      preview them in AR, and receive direct leads all without app development or extra tech.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Check className="h-6 w-6 text-teal-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Showcase your prefab and modular homes to interested buyers
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-6 w-6 text-teal-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Let customers visualize your designs in real-world settings
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-6 w-6 text-teal-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Connect with pre-qualified leads who love your designs</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="h-6 w-6 text-teal-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">No need for expensive app development or 3D expertise</span>
                      </li>
                    </ul>
                    <div className="pt-4">
                      <Button className="bg-teal-600 hover:bg-teal-700 px-6" onClick={openBuilderForm}>
                        List Your Homes
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="relative w-full max-w-md aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-md flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-6 p-8">
                        <div className="bg-white p-5 rounded shadow-sm flex flex-col items-center">
                          <Building2 className="h-10 w-10 text-teal-600 mb-3" />
                          <p className="text-sm font-medium">Upload Models</p>
                        </div>
                        <div className="bg-white p-5 rounded shadow-sm flex flex-col items-center">
                          <Eye className="h-10 w-10 text-teal-600 mb-3" />
                          <p className="text-sm font-medium">AR Preview</p>
                        </div>
                        <div className="bg-white p-5 rounded shadow-sm flex flex-col items-center">
                          <Users className="h-10 w-10 text-teal-600 mb-3" />
                          <p className="text-sm font-medium">Connect Buyers</p>
                        </div>
                        <div className="bg-white p-5 rounded shadow-sm flex flex-col items-center">
                          <Mountain className="h-10 w-10 text-teal-600 mb-3" />
                          <p className="text-sm font-medium">Grow Sales</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Visual Demo Section */}
            <section id="demo" className="w-full py-16 md:py-24 bg-white">
              <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">See How It Works in Action</h2>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                    Experience how easy it is to visualize your future home on your property
                  </p>
                </div>
                <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-lg border bg-white shadow-md">
                  <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px]">
                    <iframe
                      src={`${demoWebARModel}?embed=true`}
                      className="absolute top-0 left-0 w-full h-full border-0"
                      title="3D Home Visualization Demo"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </div>
            </section>

            {/* New Social Proof / Trust Section */}
            <section className="w-full py-16 md:py-24 bg-gray-50 relative">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-15"
                style={{ backgroundImage: 'url("/images/house-3.png")' }}
              ></div>
              <div className="container px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                    Trusted by Builders and Innovators
                  </h2>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                    Join the growing community of prefab builders and homeowners using HausMatch
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-8 mb-12">
                  {/* Placeholder logos */}
                  <div className="w-32 h-16 bg-white rounded-md shadow-sm flex items-center justify-center">
                    <div className="text-gray-400 font-semibold">LOGO 1</div>
                  </div>
                  <div className="w-32 h-16 bg-white rounded-md shadow-sm flex items-center justify-center">
                    <div className="text-gray-400 font-semibold">LOGO 2</div>
                  </div>
                  <div className="w-32 h-16 bg-white rounded-md shadow-sm flex items-center justify-center">
                    <div className="text-gray-400 font-semibold">LOGO 3</div>
                  </div>
                  <div className="w-32 h-16 bg-white rounded-md shadow-sm flex items-center justify-center">
                    <div className="text-gray-400 font-semibold">LOGO 4</div>
                  </div>
                  <div className="w-32 h-16 bg-white rounded-md shadow-sm flex items-center justify-center">
                    <div className="text-gray-400 font-semibold">LOGO 5</div>
                  </div>
                </div>

                <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
                  <blockquote className="text-xl text-gray-600 italic text-center">
                    "This tool helps our clients visualize and decide faster—it's a game changer."
                  </blockquote>
                  <div className="mt-4 text-center">
                    <p className="font-semibold">— Prefab Builder, Latvia</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 6. FAQ Section (Collapsible) */}
            <section id="about" className="w-full py-16 md:py-24 bg-white">
              <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">About HausMatch</h2>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                    Everything you need to know about HausMatch
                  </p>
                </div>

                <div className="max-w-3xl mx-auto">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="md:w-1/3 flex flex-col items-center">
                      <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
                        <img
                          src="/images/gatis-profile.png"
                          alt="Gatis Zvejnieks"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <a
                        href="https://www.linkedin.com/in/gatis-zvejnieks-79797917/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-teal-600 hover:text-teal-800 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-linkedin"
                        >
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0" />
                          <rect width="4" height="12" x="2" y="9" />
                          <circle cx="4" cy="4" r="2" />
                        </svg>
                        Gatis Zvejnieks
                      </a>
                      <p className="text-gray-500 mt-2">Co-founder &amp; CEO</p>
                    </div>
                    <div className="md:w-2/3">
                      <p className="text-gray-700 leading-relaxed">
                        HausMatch was founded to solve a personal frustration: the difficulty of finding and visualizing
                        prefab homes. As someone who has built multiple homes, I know firsthand how challenging it can
                        be to navigate the fragmented prefab market.
                      </p>
                      <p className="text-gray-700 leading-relaxed mt-4">
                        Our mission is to empower individuals to discover and design their dream homes with ease. By
                        leveraging AI and augmented reality, we're making the process more transparent, accessible, and
                        enjoyable for everyone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Builder Form Modal */}
      {showBuilderForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">List Your Homes</h2>
              <button onClick={closeBuilderForm} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleBuilderSubmit} className="space-y-4">
              <div>
                <Label htmlFor="builderName">Your Name</Label>
                <Input
                  type="text"
                  id="builderName"
                  value={builderName}
                  onChange={(e) => setBuilderName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="builderWebsite">Website</Label>
                <Input
                  type="url"
                  id="builderWebsite"
                  value={builderWebsite}
                  onChange={(e) => setBuilderWebsite(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="builderEmail">Email</Label>
                <Input
                  type="email"
                  id="builderEmail"
                  value={builderEmail}
                  onChange={(e) => setBuilderEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="builderMessage">Message</Label>
                <textarea
                  id="builderMessage"
                  value={builderMessage}
                  onChange={(e) => setBuilderMessage(e.target.value)}
                  className="w-full border rounded-md py-2 px-3 focus:outline-none focus:border-teal-500"
                  rows={4}
                ></textarea>
              </div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isBuilderSubmitting}>
                {isBuilderSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Builder Thank You Modal */}
      {showBuilderThankYou && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Thank You!</h2>
              <button onClick={closeBuilderThankYou} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-700">
              Thank you for your interest in listing your homes with us. We'll be in touch soon!
            </p>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Join Early Access</h2>
              <button onClick={closeSubscribeModal} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <Label htmlFor="formName">Your Name</Label>
                <Input
                  type="text"
                  id="formName"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="formEmail">Email</Label>
                <Input
                  type="email"
                  id="formEmail"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Join Early Access"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Thank You Modal */}
      {showThankYouModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Thank You!</h2>
              <button onClick={closeThankYouModal} className="text-gray-500 hover:text-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-700">{subscriptionMessage || "Thank you for subscribing!"}</p>
          </div>
        </div>
      )}

      {/* AR Preview Modal */}
      {showARPreview && selectedHouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full h-[90vh] p-6 relative">
            <button
              onClick={closeARPreview}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 z-10"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4">AR Preview - {selectedHouse.name}</h2>
            <p className="text-gray-700 mb-4">
              Point your phone's camera at a flat surface and tap to place the house model in your space.
            </p>
            <div className="w-full h-[calc(100%-120px)] overflow-hidden rounded-lg border bg-white shadow-md">
              <div className="relative w-full h-full">
                <iframe
                  src={`${arPreviewWebARModel}?embed=true`}
                  className="absolute top-0 left-0 w-full h-full border-0"
                  title={`AR Preview - ${selectedHouse.name}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; camera"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={closeImageModal}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              aria-label="Close"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={selectedImage || "/placeholder.svg"}
              alt={selectedImageAlt}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <footer className="w-full py-6 bg-gray-100 border-t">
        <div className="container px-4 md:px-6 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} HausMatch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
