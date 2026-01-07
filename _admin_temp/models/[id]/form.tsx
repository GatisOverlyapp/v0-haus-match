"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ArrowLeft, Loader2, Upload, X } from "lucide-react"
import Link from "next/link"
import {
  createModel,
  updateModel,
  type ModelFormData,
} from "../actions"

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
}

interface ModelFormProps {
  model: Model | null
  manufacturers: Array<{ id: string; name: string }>
  categories: string[]
}

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// Parse JSON string to array, with fallback
const parseJsonArray = (jsonString: string | null): string[] => {
  if (!jsonString) return []
  try {
    const parsed = JSON.parse(jsonString)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function ModelForm({ model, manufacturers, categories }: ModelFormProps) {
  const router = useRouter()
  const isNew = !model
  const [isLoading, setIsLoading] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  // Parse arrays from JSON strings
  const styleTagsArray = model ? parseJsonArray(model.style_tags) : []
  const featuresArray = model ? parseJsonArray(model.features) : []
  const imagesArray = model ? parseJsonArray(model.images) : []

  const [formData, setFormData] = useState<ModelFormData>({
    name: model?.name || "",
    slug: model?.slug || "",
    manufacturerId: model?.manufacturerId || "",
    size_sqm: model?.size_sqm || 0,
    bedrooms: model?.bedrooms || 0,
    bathrooms: model?.bathrooms || 0,
    price_range: model?.price_range || "",
    category: model?.category || "",
    style_tags: styleTagsArray,
    features: featuresArray,
    images: imagesArray,
    description: model?.description || "",
    published: model?.published || false,
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
      if (
        !formData.name ||
        !formData.slug ||
        !formData.manufacturerId ||
        !formData.category ||
        !formData.description
      ) {
        toast.error("Please fill in all required fields")
        setIsLoading(false)
        return
      }

      if (formData.size_sqm <= 0 || formData.bedrooms < 0 || formData.bathrooms < 0) {
        toast.error("Size, bedrooms, and bathrooms must be valid numbers")
        setIsLoading(false)
        return
      }

      let result
      if (isNew) {
        result = await createModel(formData)
      } else {
        result = await updateModel(model.id, formData)
      }

      if (result.error) {
        toast.error(result.error)
        setIsLoading(false)
      } else {
        toast.success(
          isNew ? "Model created successfully" : "Model updated successfully"
        )
        router.push("/admin/models")
        router.refresh()
      }
    } catch (error) {
      console.error("Error saving model:", error)
      toast.error("Failed to save model")
      setIsLoading(false)
    }
  }

  // Convert features array to newline-separated string for textarea
  const featuresText = formData.features.join("\n")
  const imagesText = formData.images.join("\n")
  const styleTagsText = formData.style_tags.join(", ")

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Link href="/admin/models">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Models
            </Button>
          </Link>
          <CardTitle>{isNew ? "Create Model" : "Edit Model"}</CardTitle>
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
                  slug: isNew && !slugManuallyEdited ? generateSlug(newName) : prev.slug,
                }))
              }}
              required
              placeholder="Nordic Compact"
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
              placeholder="nordic-compact"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL-friendly identifier (e.g., nordic-compact)
            </p>
          </div>

          {/* Manufacturer and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="manufacturer">
                Manufacturer <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.manufacturerId}
                onValueChange={(value) =>
                  setFormData({ ...formData, manufacturerId: value })
                }
                required
              >
                <SelectTrigger id="manufacturer">
                  <SelectValue placeholder="Select manufacturer" />
                </SelectTrigger>
                <SelectContent>
                  {manufacturers.map((manufacturer) => (
                    <SelectItem key={manufacturer.id} value={manufacturer.id}>
                      {manufacturer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Size, Bedrooms, Bathrooms */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="size_sqm">
                Size (m²) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="size_sqm"
                type="number"
                min="1"
                value={formData.size_sqm}
                onChange={(e) =>
                  setFormData({ ...formData, size_sqm: parseInt(e.target.value) || 0 })
                }
                required
                placeholder="45"
              />
            </div>
            <div>
              <Label htmlFor="bedrooms">
                Bedrooms <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                value={formData.bedrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })
                }
                required
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="bathrooms">
                Bathrooms <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bathrooms: parseFloat(e.target.value) || 0 })
                }
                required
                placeholder="1"
              />
            </div>
          </div>

          {/* Price Range */}
          <div>
            <Label htmlFor="price_range">
              Price Range <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price_range"
              value={formData.price_range}
              onChange={(e) =>
                setFormData({ ...formData, price_range: e.target.value })
              }
              required
              placeholder="€45,000 - €55,000"
            />
          </div>

          {/* Style Tags */}
          <div>
            <Label htmlFor="style_tags">Style Tags</Label>
            <Input
              id="style_tags"
              value={styleTagsText}
              onChange={(e) => {
                const tags = e.target.value
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter((tag) => tag.length > 0)
                setFormData({ ...formData, style_tags: tags })
              }}
              placeholder="Modern, Minimalist, Scandinavian (comma-separated)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple tags with commas
            </p>
          </div>

          {/* Features */}
          <div>
            <Label htmlFor="features">Features</Label>
            <Textarea
              id="features"
              value={featuresText}
              onChange={(e) => {
                const features = e.target.value
                  .split("\n")
                  .map((feature) => feature.trim())
                  .filter((feature) => feature.length > 0)
                setFormData({ ...formData, features })
              }}
              rows={6}
              placeholder="Energy-efficient insulation&#10;Triple-glazed windows&#10;Solar-ready&#10;Loft sleeping area"
            />
            <p className="text-xs text-gray-500 mt-1">
              One feature per line
            </p>
          </div>

          {/* Images */}
          <div>
            <Label htmlFor="images">Image URLs</Label>
            <Textarea
              id="images"
              value={imagesText}
              onChange={(e) => {
                const images = e.target.value
                  .split("\n")
                  .map((image) => image.trim())
                  .filter((image) => image.length > 0)
                setFormData({ ...formData, images })
              }}
              rows={4}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              One image URL per line
            </p>
            {formData.images.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {formData.images.slice(0, 3).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Preview ${index + 1}`}
                    className="w-20 h-20 object-cover rounded border"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                ))}
                {formData.images.length > 3 && (
                  <div className="w-20 h-20 rounded border flex items-center justify-center text-xs text-gray-500">
                    +{formData.images.length - 3} more
                  </div>
                )}
              </div>
            )}
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
              rows={6}
              placeholder="A compact Scandinavian-inspired tiny home perfect for minimalists..."
            />
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
              Published models are visible on the public site
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <Link href="/admin/models">
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isNew ? "Create Model" : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
