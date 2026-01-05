import type { Metadata } from "next"
import { getCategoryBySlug, getCategoriesData, getModelsByCategorySlug } from "@/lib/db/categories"
import CategoryDetailClientPage from "./client"
import { notFound } from "next/navigation"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  let category

  try {
    category = await getCategoryBySlug(slug)
  } catch (error) {
    console.error("Error loading category for metadata:", error)
  }

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
  try {
    const categories = await getCategoriesData()
    return categories.map((category) => ({
      slug: category.slug,
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

export const revalidate = 3600

export const dynamicParams = true

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  let category
  let models

  try {
    category = await getCategoryBySlug(slug)
    if (!category) {
      notFound()
    }

    models = await getModelsByCategorySlug(slug)
  } catch (error) {
    console.error("Error loading category:", error)
    notFound()
  }

  return <CategoryDetailClientPage category={category} models={models} />
}
