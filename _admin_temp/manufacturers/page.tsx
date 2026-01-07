import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ManufacturersTable from "@/components/admin/manufacturers-table"

export default async function ManufacturersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const manufacturers = await prisma.manufacturer.findMany({
    include: {
      _count: {
        select: {
          models: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Manufacturers</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage prefab home manufacturers and their information
        </p>
      </div>

      <ManufacturersTable manufacturers={manufacturers} />
    </div>
  )
}
