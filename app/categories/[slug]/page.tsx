import type { Metadata } from "next"
import { categories } from "../data"
import CategoryDetailClientPage from "./client"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = categories.find((c) => c.slug === slug)

  if (!category) {
    return {
      title: "Category Not Found",
    }
  }

  return {
    title: `${category.name} | HausMatch Categories`,
    description: category.description,
    keywords: `${category.name}, prefab homes, modular homes, ${category.name.toLowerCase()}`,
    openGraph: {
      title: category.name,
      description: category.description,
      type: "website",
      images: [
        {
          url: category.heroImage,
          width: 1200,
          height: 630,
          alt: category.name,
        },
      ],
    },
  }
}

export async function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }))
}

export const revalidate = 3600

export const dynamicParams = true

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  return <CategoryDetailClientPage slug={slug} />
}
