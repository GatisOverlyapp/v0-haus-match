"use client"

import { useState, FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, AlertCircle, X } from "lucide-react"

interface ContactFormProps {
  manufacturerId: string
  manufacturerName: string
  modelId?: string
  modelName?: string
  className?: string
  onSuccess?: () => void
  onClose?: () => void
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const MIN_MESSAGE_LENGTH = 50
const MAX_MESSAGE_LENGTH = 1000

export function ContactForm({
  manufacturerId,
  manufacturerName,
  modelId,
  modelName,
  className,
  onSuccess,
  onClose,
}: ContactFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{
    type: "success" | "error" | null
    message: string
  } | null>(null)
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    message?: string
  }>({})

  // Calculate message character count
  const messageLength = message.trim().length
  const messageRemaining = MIN_MESSAGE_LENGTH - messageLength
  const messageOver = messageLength - MAX_MESSAGE_LENGTH
  const isMessageValid = messageLength >= MIN_MESSAGE_LENGTH && messageLength <= MAX_MESSAGE_LENGTH

  // Validate email format
  const validateEmail = (email: string): boolean => {
    return emailRegex.test(email)
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string; message?: string } = {}

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

    if (!message.trim()) {
      newErrors.message = "Message is required"
    } else if (message.trim().length < MIN_MESSAGE_LENGTH) {
      newErrors.message = `Message must be at least ${MIN_MESSAGE_LENGTH} characters`
    } else if (message.trim().length > MAX_MESSAGE_LENGTH) {
      newErrors.message = `Message must be no more than ${MAX_MESSAGE_LENGTH} characters`
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
      formData.append("form_type", "manufacturer_contact")
      formData.append("manufacturer", manufacturerName)
      if (manufacturerId) formData.append("manufacturer_id", manufacturerId)
      if (modelId) formData.append("model_id", modelId)
      if (modelName) formData.append("model_name", modelName)
      formData.append("name", name.trim())
      formData.append("email", email.trim())
      if (phone.trim()) formData.append("phone", phone.trim())
      formData.append("message", message.trim())

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
          message: "Thank you for your message! We'll get back to you soon.",
        })
        // Clear form
        setName("")
        setEmail("")
        setPhone("")
        setMessage("")
        setErrors({})
        // Call success callback if provided
        onSuccess?.()
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

  const handleMessageChange = (value: string) => {
    setMessage(value)
    if (errors.message) {
      setErrors((prev) => ({ ...prev, message: undefined }))
    }
  }

  // Reset form
  const handleReset = () => {
    setName("")
    setEmail("")
    setPhone("")
    setMessage("")
    setErrors({})
    setStatus(null)
  }

  return (
    <div className={className}>
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        {/* Header with close button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Contact Manufacturer</h2>
            {modelName && (
              <p className="text-sm text-gray-600 mt-1">Regarding: {modelName}</p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close form"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} action="https://formspree.io/f/mbdlnkey" method="POST" className="space-y-5">
          {/* Hidden fields */}
          <input type="hidden" name="form_type" value="manufacturer_contact" />
          <input type="hidden" name="manufacturer" value={manufacturerName} />
          {manufacturerId && <input type="hidden" name="manufacturer_id" value={manufacturerId} />}
          {modelId && <input type="hidden" name="model_id" value={modelId} />}
          {modelName && <input type="hidden" name="model_name" value={modelName} />}
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="contact-name" className="text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contact-name"
              name="name"
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
            <Label htmlFor="contact-email" className="text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contact-email"
              name="email"
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

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="contact-phone" className="text-sm font-medium text-gray-700">
              Phone
            </Label>
            <Input
              id="contact-phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number (optional)"
              disabled={isSubmitting}
            />
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="contact-message" className="text-sm font-medium text-gray-700">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="contact-message"
              name="message"
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              placeholder="Tell us about your project, questions, or requirements (50-1000 characters)"
              disabled={isSubmitting}
              rows={6}
              minLength={MIN_MESSAGE_LENGTH}
              maxLength={MAX_MESSAGE_LENGTH}
              className={`resize-none ${errors.message ? "border-red-500 focus:border-red-500" : ""}`}
              required
            />
            <div className="flex items-center justify-between">
              {errors.message ? (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.message}
                </p>
              ) : (
                <div></div>
              )}
              <p
                className={`text-sm ${
                  isMessageValid
                    ? "text-gray-500"
                    : messageLength > MAX_MESSAGE_LENGTH
                      ? "text-red-600"
                      : messageLength > 0
                        ? "text-amber-600"
                        : "text-gray-400"
                }`}
              >
                {messageLength < MIN_MESSAGE_LENGTH
                  ? `${messageRemaining} characters remaining`
                  : messageLength > MAX_MESSAGE_LENGTH
                    ? `${messageOver} characters over limit`
                    : `${messageLength}/${MAX_MESSAGE_LENGTH} characters`}
              </p>
            </div>
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
              <p className="text-sm font-medium flex-1">{status.message}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {status?.type === "success" ? (
              <>
                {onClose && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Close
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Send Another Message
                </Button>
              </>
            ) : (
              <>
                {onClose && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting || !isMessageValid}
                  className={`flex-1 bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                    onClose ? "" : "w-full"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
