import type { Metadata } from "next"
import { getModelBySlug, getModels } from "@/lib/db/models"
import { getManufacturerById } from "@/lib/db/manufacturers"
import ModelDetailClientPage from "./client"
import { notFound } from "next/navigation"

interface ModelPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ModelPageProps): Promise<Metadata> {
  const { slug } = await params
  let model

  try {
    model = await getModelBySlug(slug)
  } catch (error) {
    console.error("Error loading model for metadata:", error)
  }

  if (!model) {
    return {
      title: "Model Not Found",
    }
  }

  const imageUrl = model.images && model.images.length > 0 ? model.images[0] : "/placeholder.svg"

  return {
    title: `${model.name} | Prefab Catalog`,
    description: model.description,
    keywords: `${model.category}, ${model.style_tags.join(", ")}, prefab, modular homes`,
    openGraph: {
      title: model.name,
      description: model.description,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: model.name,
        },
      ],
    },
  }
}

export async function generateStaticParams() {
  try {
    const models = await getModels()
    return models.map((model) => ({
      slug: model.slug,
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

export const revalidate = 3600

export const dynamicParams = true

export default async function ModelPage({ params }: ModelPageProps) {
  const { slug } = await params
  let model
  let manufacturer

  try {
    model = await getModelBySlug(slug)
    if (!model) {
      notFound()
    }

    manufacturer = await getManufacturerById(model.manufacturerId)
  } catch (error) {
    console.error("Error loading model:", error)
    notFound()
  }

  return <ModelDetailClientPage model={model} manufacturer={manufacturer} />
}
