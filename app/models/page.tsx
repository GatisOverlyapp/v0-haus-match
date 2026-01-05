import { getModels, getCategories } from "@/lib/db/models"
import { ModelsClient } from "./client"
import { notFound } from "next/navigation"

export default async function ModelsPage() {
  let models
  let categories

  try {
    [models, categories] = await Promise.all([
      getModels(),
      getCategories(),
    ])
  } catch (error) {
    console.error("Error loading models:", error)
    notFound()
  }

  return <ModelsClient models={models} categories={categories} />
}
