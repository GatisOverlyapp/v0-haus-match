export interface Manufacturer {
  id: string
  name: string
  slug: string
  location: string
  description: string
  logo?: string
}

// Mock data: 6 Latvian prefab home manufacturers
export const manufacturers: Manufacturer[] = [
  {
    id: "1",
    name: "Nordic Prefab Latvia",
    slug: "nordic-prefab-latvia",
    location: "Riga, Latvia",
    description: "Leading manufacturer of Scandinavian-inspired prefab homes with sustainable materials and energy-efficient designs.",
    logo: "/placeholder-logo.svg",
  },
  {
    id: "2",
    name: "Baltic Modular Homes",
    slug: "baltic-modular-homes",
    location: "Liepāja, Latvia",
    description: "Specializing in modern modular homes and tiny houses, combining Baltic design aesthetics with contemporary living.",
    logo: "/placeholder-logo.svg",
  },
  {
    id: "3",
    name: "EcoHaus Latvia",
    slug: "ecohaus-latvia",
    location: "Jūrmala, Latvia",
    description: "Eco-friendly prefab homes focusing on passive house standards and renewable energy integration.",
    logo: "/placeholder-logo.svg",
  },
  {
    id: "4",
    name: "Latvian Timber Homes",
    slug: "latvian-timber-homes",
    location: "Valmiera, Latvia",
    description: "Traditional and modern timber-frame prefab homes using locally sourced Latvian wood.",
    logo: "/placeholder-logo.svg",
  },
  {
    id: "5",
    name: "Scandinavian Prefab Co.",
    slug: "scandinavian-prefab-co",
    location: "Cēsis, Latvia",
    description: "Premium prefab homes inspired by Scandinavian design, offering customizable floor plans and finishes.",
    logo: "/placeholder-logo.svg",
  },
  {
    id: "6",
    name: "GreenBox Homes Latvia",
    slug: "greenbox-homes-latvia",
    location: "Daugavpils, Latvia",
    description: "Innovative container-based and modular prefab homes with modern amenities and sustainable construction.",
    logo: "/placeholder-logo.svg",
  },
]
