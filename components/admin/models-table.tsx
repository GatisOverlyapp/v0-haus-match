"use client"

import { useState, useMemo } from "react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Plus, Trash2, Edit, Search, ImageIcon } from "lucide-react"
import Link from "next/link"

interface Model {
  id: string
  name: string
  slug: string
  manufacturerId: string
  size_sqm: number
  bedrooms: number
  bathrooms: number
  price_range: string
  category: string
  style_tags: string // JSON string
  features: string // JSON string
  images: string // JSON string
  description: string
  published: boolean
  createdAt: Date
  updatedAt: Date
  manufacturer: {
    id: string
    name: string
    slug: string
  }
}

interface ModelsTableProps {
  models: Model[]
  manufacturers: Array<{ id: string; name: string }>
  categories: string[]
}

export default function ModelsTable({
  models: initialModels,
  manufacturers,
  categories,
}: ModelsTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [manufacturerFilter, setManufacturerFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [models, setModels] = useState(initialModels)

  // Filter models
  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        if (
          !model.name.toLowerCase().includes(query) &&
          !model.slug.toLowerCase().includes(query) &&
          !model.manufacturer.name.toLowerCase().includes(query)
        ) {
          return false
        }
      }

      // Manufacturer filter
      if (manufacturerFilter !== "all" && model.manufacturerId !== manufacturerFilter) {
        return false
      }

      // Category filter
      if (categoryFilter !== "all" && model.category !== categoryFilter) {
        return false
      }

      return true
    })
  }, [models, searchQuery, manufacturerFilter, categoryFilter])

  const handleDelete = async (modelId: string) => {
    try {
      const response = await fetch(`/api/admin/models/${modelId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Model deleted successfully")
        setModels(models.filter((m) => m.id !== modelId))
        router.refresh()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to delete model")
      }
    } catch (error) {
      toast.error("Failed to delete model")
    }
  }

  // Parse images JSON to get first image
  const getFirstImage = (imagesJson: string): string | null => {
    try {
      const images = JSON.parse(imagesJson || "[]")
      return images.length > 0 ? images[0] : null
    } catch {
      return null
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Link href="/admin/models/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Model
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <div className="w-48">
          <Label htmlFor="manufacturer-filter" className="text-sm text-gray-600 mb-1 block">
            Filter by Manufacturer
          </Label>
          <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
            <SelectTrigger id="manufacturer-filter">
              <SelectValue placeholder="All Manufacturers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Manufacturers</SelectItem>
              {manufacturers.map((manufacturer) => (
                <SelectItem key={manufacturer.id} value={manufacturer.id}>
                  {manufacturer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <Label htmlFor="category-filter" className="text-sm text-gray-600 mb-1 block">
            Filter by Category
          </Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger id="category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredModels.length > 0 ? (
              filteredModels.map((model) => {
                const firstImage = getFirstImage(model.images)
                return (
                  <TableRow key={model.id}>
                    <TableCell>
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                        {firstImage ? (
                          <img
                            src={firstImage}
                            alt={model.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                              e.currentTarget.nextElementSibling?.classList.remove("hidden")
                            }}
                          />
                        ) : null}
                        <ImageIcon className={`h-6 w-6 text-gray-400 ${firstImage ? "hidden" : ""}`} />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/manufacturers/${model.manufacturer.id}`}
                        className="text-teal-600 hover:text-teal-700 hover:underline"
                      >
                        {model.manufacturer.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{model.category}</Badge>
                    </TableCell>
                    <TableCell>{model.size_sqm} m²</TableCell>
                    <TableCell className="text-sm">{model.price_range}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          model.published
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        }
                      >
                        {model.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/models/${model.id}`}>
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
                                This will permanently delete "{model.name}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(model.id)}
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
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  {searchQuery || manufacturerFilter !== "all" || categoryFilter !== "all"
                    ? "No models found matching your filters."
                    : "No models yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
