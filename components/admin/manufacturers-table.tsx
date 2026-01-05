"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Trash2, Edit, Search, MapPin } from "lucide-react"
import Link from "next/link"

interface Manufacturer {
  id: string
  name: string
  slug: string
  location: string
  lat: number
  lng: number
  description: string
  logo: string | null
  phone: string | null
  email: string | null
  website: string | null
  published: boolean
  createdAt: Date
  updatedAt: Date
  _count?: {
    models: number
  }
}

interface ManufacturersTableProps {
  manufacturers: (Manufacturer & {
    _count: {
      models: number
    }
  })[]
}

export default function ManufacturersTable({ manufacturers: initialManufacturers }: ManufacturersTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [manufacturers, setManufacturers] = useState(initialManufacturers)

  // Filter manufacturers based on search
  const filteredManufacturers = manufacturers.filter((manufacturer) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      manufacturer.name.toLowerCase().includes(query) ||
      manufacturer.location.toLowerCase().includes(query) ||
      manufacturer.slug.toLowerCase().includes(query)
    )
  })

  const handleDelete = async (manufacturerId: string) => {
    try {
      const response = await fetch(`/api/admin/manufacturers/${manufacturerId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Manufacturer deleted successfully")
        setManufacturers(manufacturers.filter((m) => m.id !== manufacturerId))
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to delete manufacturer")
      }
    } catch (error) {
      toast.error("Failed to delete manufacturer")
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search manufacturers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Link href="/admin/manufacturers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Manufacturer
          </Button>
        </Link>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Models</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredManufacturers.length > 0 ? (
              filteredManufacturers.map((manufacturer) => (
                <TableRow key={manufacturer.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                      {manufacturer.logo ? (
                        <img
                          src={manufacturer.logo}
                          alt={manufacturer.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <MapPin className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{manufacturer.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-3 w-3" />
                      {manufacturer.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{manufacturer._count.models} models</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        manufacturer.published
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }
                    >
                      {manufacturer.published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/manufacturers/${manufacturer.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{manufacturer.name}" and all associated models.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(manufacturer.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  {searchQuery ? "No manufacturers found matching your search." : "No manufacturers yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
