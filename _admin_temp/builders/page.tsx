import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import BuildersTable from "@/components/admin/builders-table"

export default async function BuildersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const builders = await prisma.houseBuilder.findMany({
    include: {
      houses: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">House Builders</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage prefab house builder profiles
        </p>
      </div>

      <BuildersTable builders={builders} />
    </div>
  )
}










