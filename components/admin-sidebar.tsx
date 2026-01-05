"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Factory,
  Home,
  FileText, 
  LogOut,
  Boxes
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UserRole } from "@/lib/generated/prisma/client"

interface AdminSidebarProps {
  user: {
    id: string
    email: string
    name?: string | null
    role: UserRole
  }
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
      adminOnly: true,
    },
    {
      title: "Manufacturers",
      href: "/admin/manufacturers",
      icon: Factory,
    },
    {
      title: "Models",
      href: "/admin/models",
      icon: Boxes,
    },
    {
      title: "House Builders",
      href: "/admin/builders",
      icon: Building2,
    },
    {
      title: "Blog Posts",
      href: "/admin/blog",
      icon: FileText,
    },
  ]

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || user.role === "ADMINISTRATOR"
  )

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <Link href="/admin" className="flex items-center gap-2">
          <Home className="h-6 w-6" />
          <span className="font-bold text-xl">HausMatch CMS</span>
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="mb-4 px-4">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {user.name || user.email}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {user.role === "ADMINISTRATOR" ? "Administrator" : "Content Manager"}
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}










