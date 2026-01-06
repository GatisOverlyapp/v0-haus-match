import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Manufacturers Map | Prefab Catalog",
  description: "Explore prefab home manufacturers across Latvia on our interactive map. Find builders near you.",
}

export default function MapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

