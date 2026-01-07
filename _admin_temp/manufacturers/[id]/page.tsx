import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ManufacturerForm from "./form"

interface ManufacturerPageProps {
  params: Promise<{ id: string }>
}

export default async function ManufacturerEditPage({ params }: ManufacturerPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const { id } = await params
  const isNew = id === "new"

  let manufacturer = null
  if (!isNew) {
    manufacturer = await prisma.manufacturer.findUnique({
      where: { id },
    })

    if (!manufacturer) {
      notFound()
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {isNew ? "Create New Manufacturer" : "Edit Manufacturer"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {isNew
            ? "Add a new prefab home manufacturer to the platform"
            : `Edit ${manufacturer?.name || "manufacturer"} information`}
        </p>
      </div>

      <ManufacturerForm manufacturer={manufacturer} />
    </div>
  )
}
