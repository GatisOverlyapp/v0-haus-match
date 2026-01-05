import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ModelsTable from "@/components/admin/models-table"

export default async function ModelsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const [models, manufacturers, categories] = await Promise.all([
    prisma.model.findMany({
      include: {
        manufacturer: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Models</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage prefab home models and their specifications
        </p>
      </div>

      <ModelsTable models={models} manufacturers={manufacturers} categories={categories} />
    </div>
  )
}
