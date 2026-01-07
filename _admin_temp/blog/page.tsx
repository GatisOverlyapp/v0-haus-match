import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import BlogTable from "@/components/admin/blog-table"

export default async function BlogPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const posts = await prisma.blogPost.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage blog articles
        </p>
      </div>

      <BlogTable posts={posts} />
    </div>
  )
}










