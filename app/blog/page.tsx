import type { Metadata } from "next"
import BlogClientPage from "./client-page"

export const metadata: Metadata = {
  title: "Blog | HausMatch - Prefab & Modular Home Insights",
  description:
    "Expert insights on prefab homes, modular construction, sustainable design, and the future of housing. Read our latest articles and trends.",
  keywords: "prefab homes, modular construction, sustainable housing, building trends",
  openGraph: {
    title: "HausMatch Blog - Prefab & Modular Home Insights",
    description: "Expert insights on prefab homes and modular construction.",
    type: "website",
  },
}

export default function BlogPage() {
  return <BlogClientPage />
}
