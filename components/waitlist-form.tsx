"use client"

import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

interface WaitlistFormProps {
  className?: string
  onSuccess?: () => void
  onClose?: () => void
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function WaitlistForm({ className, onSuccess, onClose }: WaitlistFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{
    type: "success" | "error" | null
    message: string
  } | null>(null)
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
  }>({})

  // Validate email format
  const validateEmail = (email: string): boolean => {
    return emailRegex.test(email)
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string } = {}

    if (!name.trim()) {
      newErrors.name = "Name is required"
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(email.trim())) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Clear previous status
    setStatus(null)

    // Validate form
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("form_type", "waitlist")
      formData.append("name", name.trim())
      formData.append("email", email.trim())

      const response = await fetch("https://formspree.io/f/mbdlnkey", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      })

      if (response.ok) {
        setStatus({
          type: "success",
          message: "Thank you for joining the waitlist! We'll notify you when we launch.",
        })
        // Clear form
        setName("")
        setEmail("")
        setErrors({})
        // Call success callback if provided
        onSuccess?.()
        // Close modal after 2 seconds if onClose is provided
        if (onClose) {
          setTimeout(() => {
            onClose()
          }, 2000)
        }
      } else {
        const data = await response.json()
        setStatus({
          type: "error",
          message: data.error || "Something went wrong. Please try again.",
        })
      }
    } catch (error) {
      console.error("Form submission error:", error)
      setStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle input changes and clear errors
  const handleNameChange = (value: string) => {
    setName(value)
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }))
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }))
    }
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="waitlist-name" className="text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="waitlist-name"
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enter your name"
            disabled={isSubmitting}
            className={errors.name ? "border-red-500 focus:border-red-500" : ""}
            required
          />
          {errors.name && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="waitlist-email" className="text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="waitlist-email"
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="Enter your email"
            disabled={isSubmitting}
            className={errors.email ? "border-red-500 focus:border-red-500" : ""}
            required
          />
          {errors.email && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Status Message */}
        {status && (
          <div
            className={`p-4 rounded-lg flex items-start gap-3 ${
              status.type === "success"
                ? "bg-teal-50 text-teal-800 border border-teal-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Join Waitlist"
          )}
        </Button>
      </form>
    </div>
  )
}
