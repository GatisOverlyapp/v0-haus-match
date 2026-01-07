"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Upload, X } from "lucide-react"
import Link from "next/link"
import {
  createManufacturer,
  updateManufacturer,
  type ManufacturerFormData,
} from "../actions"

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
}

interface ManufacturerFormProps {
  manufacturer: Manufacturer | null
}

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export default function ManufacturerForm({ manufacturer }: ManufacturerFormProps) {
  const router = useRouter()
  const isNew = !manufacturer
  const [isLoading, setIsLoading] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [formData, setFormData] = useState<ManufacturerFormData>({
    name: manufacturer?.name || "",
    slug: manufacturer?.slug || "",
    location: manufacturer?.location || "",
    lat: manufacturer?.lat || 56.8796,
    lng: manufacturer?.lng || 24.6032,
    description: manufacturer?.description || "",
    logo: manufacturer?.logo || null,
    phone: manufacturer?.phone || null,
    email: manufacturer?.email || null,
    website: manufacturer?.website || null,
    published: manufacturer?.published || false,
  })

  // Auto-generate slug from name when creating new (only if not manually edited)
  useEffect(() => {
    if (isNew && formData.name && !slugManuallyEdited) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(formData.name),
      }))
    }
  }, [formData.name, isNew, slugManuallyEdited])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.slug || !formData.location) {
        toast.error("Please fill in all required fields")
        setIsLoading(false)
        return
      }

      if (isNaN(formData.lat) || isNaN(formData.lng)) {
        toast.error("Latitude and longitude must be valid numbers")
        setIsLoading(false)
        return
      }

      let result
      if (isNew) {
        result = await createManufacturer(formData)
      } else {
        result = await updateManufacturer(manufacturer.id, formData)
      }

      if (result.error) {
        toast.error(result.error)
        setIsLoading(false)
      } else {
        toast.success(
          isNew
            ? "Manufacturer created successfully"
            : "Manufacturer updated successfully"
        )
        router.push("/admin/manufacturers")
        router.refresh()
      }
    } catch (error) {
      console.error("Error saving manufacturer:", error)
      toast.error("Failed to save manufacturer")
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Link href="/admin/manufacturers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Manufacturers
            </Button>
          </Link>
          <CardTitle>{isNew ? "Create Manufacturer" : "Edit Manufacturer"}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                const newName = e.target.value
                setFormData((prev) => ({
                  ...prev,
                  name: newName,
                  // Auto-generate slug only if it hasn't been manually edited
                  slug: isNew && !slugManuallyEdited ? generateSlug(newName) : prev.slug,
                }))
              }}
              required
              placeholder="Nordic Prefab Latvia"
            />
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug">
              Slug <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => {
                setSlugManuallyEdited(true)
                setFormData({ ...formData, slug: e.target.value })
              }}
              required
              placeholder="nordic-prefab-latvia"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL-friendly identifier (e.g., nordic-prefab-latvia)
            </p>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">
              Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required
              placeholder="Riga, Latvia"
            />
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lat">
                Latitude <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lat"
                type="number"
                step="any"
                value={formData.lat}
                onChange={(e) =>
                  setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })
                }
                required
                placeholder="56.9496"
              />
            </div>
            <div>
              <Label htmlFor="lng">
                Longitude <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lng"
                type="number"
                step="any"
                value={formData.lng}
                onChange={(e) =>
                  setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })
                }
                required
                placeholder="24.1052"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              rows={5}
              placeholder="Leading manufacturer of Scandinavian-inspired prefab homes..."
            />
          </div>

          {/* Logo Upload */}
          <div>
            <Label htmlFor="logo">Logo</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Input
                  id="logo"
                  type="url"
                  value={formData.logo || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, logo: e.target.value || null })
                  }
                  placeholder="https://example.com/logo.png or upload file"
                  className="flex-1"
                />
                <div className="relative">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return

                      setLogoUploading(true)
                      try {
                        const uploadFormData = new FormData()
                        uploadFormData.append("file", file)
                        uploadFormData.append("type", "manufacturer")

                        const response = await fetch("/api/upload", {
                          method: "POST",
                          body: uploadFormData,
                        })

                        if (!response.ok) {
                          const error = await response.json()
                          throw new Error(error.error || "Upload failed")
                        }

                        const data = await response.json()
                        setFormData({ ...formData, logo: data.url })
                        toast.success("Logo uploaded successfully")
                      } catch (error: any) {
                        toast.error(error.message || "Failed to upload logo")
                      } finally {
                        setLogoUploading(false)
                        // Reset input
                        e.target.value = ""
                      }
                    }}
                    disabled={logoUploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("logo-upload")?.click()}
                    disabled={logoUploading}
                  >
                    {logoUploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {logoUploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
                {formData.logo && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, logo: null })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {formData.logo && (
                <div className="mt-2">
                  <img
                    src={formData.logo}
                    alt="Logo preview"
                    className="w-24 h-24 object-contain border rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Upload an image file or paste a URL. Max size: 5MB
            </p>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value || null })
                }
                placeholder="+371 12345678"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value || null })
                }
                placeholder="info@example.com"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website || ""}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value || null })
                }
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Published */}
          <div className="flex items-center gap-2">
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, published: checked })
              }
            />
            <Label htmlFor="published">Published</Label>
            <p className="text-xs text-gray-500 ml-2">
              Published manufacturers are visible on the public site
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <Link href="/admin/manufacturers">
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isNew ? "Create Manufacturer" : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
