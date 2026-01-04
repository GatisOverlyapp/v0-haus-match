"use client"

import { useState } from "react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Plus, Trash2, Edit, ExternalLink } from "lucide-react"
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
import Link from "next/link"

interface Builder {
  id: string
  name: string
  website: string | null
  description: string | null
  location: string | null
  mainImage: string | null
  createdAt: Date
  houses: any[]
}

interface BuildersTableProps {
  builders: Builder[]
}

export default function BuildersTable({ builders }: BuildersTableProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingBuilder, setEditingBuilder] = useState<Builder | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    description: "",
    location: "",
    mainImage: "",
  })

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/admin/builders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("Builder created successfully")
        setIsCreateOpen(false)
        setFormData({ name: "", website: "", description: "", location: "", mainImage: "" })
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to create builder")
      }
    } catch (error) {
      toast.error("Failed to create builder")
    }
  }

  const handleUpdate = async () => {
    if (!editingBuilder) return

    try {
      const response = await fetch(`/api/admin/builders/${editingBuilder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success("Builder updated successfully")
        setEditingBuilder(null)
        setFormData({ name: "", website: "", description: "", location: "", mainImage: "" })
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update builder")
      }
    } catch (error) {
      toast.error("Failed to update builder")
    }
  }

  const handleDelete = async (builderId: string) => {
    try {
      const response = await fetch(`/api/admin/builders/${builderId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Builder deleted successfully")
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to delete builder")
      }
    } catch (error) {
      toast.error("Failed to delete builder")
    }
  }

  const openEditDialog = (builder: Builder) => {
    setEditingBuilder(builder)
    setFormData({
      name: builder.name,
      website: builder.website || "",
      description: builder.description || "",
      location: builder.location || "",
      mainImage: builder.mainImage || "",
    })
  }

  return (
    <div>
      <div className="mb-4">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Builder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Builder</DialogTitle>
              <DialogDescription>
                Add a new house builder profile
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="mainImage">Main Image URL</Label>
                <Input
                  id="mainImage"
                  type="url"
                  value={formData.mainImage}
                  onChange={(e) =>
                    setFormData({ ...formData, mainImage: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Houses</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {builders.map((builder) => (
              <TableRow key={builder.id}>
                <TableCell className="font-medium">{builder.name}</TableCell>
                <TableCell>
                  {builder.website ? (
                    <a
                      href={builder.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      {builder.website}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>{builder.location || "-"}</TableCell>
                <TableCell>
                  <Link
                    href={`/admin/builders/${builder.id}/houses`}
                    className="text-blue-600 hover:underline"
                  >
                    {builder.houses.length} houses
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(builder)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
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
                            This will permanently delete this builder and all associated houses.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(builder.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingBuilder} onOpenChange={(open) => !open && setEditingBuilder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Builder</DialogTitle>
            <DialogDescription>
              Update builder information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-website">Website URL</Label>
              <Input
                id="edit-website"
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-mainImage">Main Image URL</Label>
              <Input
                id="edit-mainImage"
                type="url"
                value={formData.mainImage}
                onChange={(e) =>
                  setFormData({ ...formData, mainImage: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBuilder(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}










