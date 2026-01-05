import type { Metadata } from "next"
import { houseModels } from "@/app/manufacturers/data"
import ModelDetailClientPage from "./client"

interface ModelPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ModelPageProps): Promise<Metadata> {
  const { slug } = await params
  const model = houseModels.find((m) => m.slug === slug)

  if (!model) {
    return {
      title: "Model Not Found",
    }
  }

  const imageUrl = model.images && model.images.length > 0 ? model.images[0] : "/placeholder.svg"

  return {
    title: `${model.name} | HausMatch`,
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
  return houseModels.map((model) => ({
    slug: model.slug,
  }))
}

export const revalidate = 3600

export const dynamicParams = true

export default async function ModelPage({ params }: ModelPageProps) {
  const { slug } = await params
  return <ModelDetailClientPage slug={slug} />
}
