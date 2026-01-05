import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Find Manufacturers | Interactive Map",
  description: "Explore prefab home manufacturers across Latvia on our interactive map",
}

export default function MapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
