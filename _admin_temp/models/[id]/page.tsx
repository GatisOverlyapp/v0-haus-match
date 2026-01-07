import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ModelForm from "./form"

interface ModelPageProps {
  params: Promise<{ id: string }>
}

export default async function ModelEditPage({ params }: ModelPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const { id } = await params
  const isNew = id === "new"

  let model = null
  let manufacturers = []
  let categories: string[] = []

  if (!isNew) {
    model = await prisma.model.findUnique({
      where: { id },
    })

    if (!model) {
      notFound()
    }
  }

  // Fetch manufacturers and categories for dropdowns
  ;[manufacturers, categories] = await Promise.all([
    prisma.manufacturer.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
    prisma.model.findMany({
      select: {
        category: true,
      },
      distinct: ["category"],
      orderBy: {
        category: "asc",
      },
    }).then((results) => results.map((r) => r.category)),
  ])

  // If no categories exist yet, use default list
  if (categories.length === 0) {
    categories = ["Tiny House", "Modular", "A-Frame", "Cabin", "Container Home"]
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {isNew ? "Create New Model" : "Edit Model"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {isNew
            ? "Add a new prefab home model to the platform"
            : `Edit ${model?.name || "model"} information`}
        </p>
      </div>

      <ModelForm model={model} manufacturers={manufacturers} categories={categories} />
    </div>
  )
}
