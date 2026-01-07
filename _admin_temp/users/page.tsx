import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import UsersTable from "@/components/admin/users-table"

export default async function UsersPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMINISTRATOR") {
    redirect("/admin")
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage user accounts and privileges
          </p>
        </div>
      </div>

      <UsersTable users={users} currentUserId={session.user.id} />
    </div>
  )
}










