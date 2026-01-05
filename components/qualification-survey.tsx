"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft } from "lucide-react"
import { submitSurvey, type SurveyFormData } from "@/app/actions/survey"
import { Progress } from "@/components/ui/progress"

interface QualificationSurveyProps {
  className?: string
  onComplete?: () => void
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const TOTAL_STEPS = 4

export function QualificationSurvey({ className, onComplete }: QualificationSurveyProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{
    type: "success" | "error" | null
    message: string
  } | null>(null)

  // Form data state
  const [formData, setFormData] = useState<SurveyFormData>({
    landStatus: "",
    financingStatus: "",
    timeline: "",
    name: "",
    email: "",
    phone: "",
    budgetRange: "",
    country: "",
    houseType: "",
  })

  // Step validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Calculate progress percentage
  const progress = (currentStep / TOTAL_STEPS) * 100

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.landStatus) {
        newErrors.landStatus = "Please select your land status"
      }
    } else if (step === 2) {
      if (!formData.financingStatus) {
        newErrors.financingStatus = "Please select your financing status"
      }
    } else if (step === 3) {
      if (!formData.timeline) {
        newErrors.timeline = "Please select your timeline"
      }
    } else if (step === 4) {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required"
      } else if (formData.name.trim().length < 2) {
        newErrors.name = "Name must be at least 2 characters"
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required"
      } else if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1)
        setStatus(null)
      }
    }
  }

  // Handle previous step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setStatus(null)
      setErrors({})
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep(4)) {
      return
    }

    setIsSubmitting(true)
    setStatus(null)

    try {
      const result = await submitSurvey(formData)

      if (result.success) {
        setStatus({
          type: "success",
          message: result.message,
        })
        onComplete?.()
      } else {
        setStatus({
          type: "error",
          message: result.message,
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

  // Update form data
  const updateFormData = (field: keyof SurveyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">What's your land status?</h3>
              <p className="text-gray-600 text-sm mb-4">Help us understand your current situation</p>
            </div>
            <RadioGroup
              value={formData.landStatus}
              onValueChange={(value) => updateFormData("landStatus", value)}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="own-land" id="own-land" />
                  <Label htmlFor="own-land" className="cursor-pointer font-normal">
                    Own land
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="searching-for-land" id="searching-for-land" />
                  <Label htmlFor="searching-for-land" className="cursor-pointer font-normal">
                    Searching for land
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="have-option" id="have-option" />
                  <Label htmlFor="have-option" className="cursor-pointer font-normal">
                    Have option on land
                  </Label>
                </div>
              </div>
            </RadioGroup>
            {errors.landStatus && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.landStatus}
              </p>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">What's your financing situation?</h3>
              <p className="text-gray-600 text-sm mb-4">This helps us recommend the right options</p>
            </div>
            <RadioGroup
              value={formData.financingStatus}
              onValueChange={(value) => updateFormData("financingStatus", value)}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="savings-ready" id="savings-ready" />
                  <Label htmlFor="savings-ready" className="cursor-pointer font-normal">
                    Savings ready
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="loan-approved" id="loan-approved" />
                  <Label htmlFor="loan-approved" className="cursor-pointer font-normal">
                    Loan approved
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="planning-to-apply" id="planning-to-apply" />
                  <Label htmlFor="planning-to-apply" className="cursor-pointer font-normal">
                    Planning to apply
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="just-exploring" id="just-exploring" />
                  <Label htmlFor="just-exploring" className="cursor-pointer font-normal">
                    Just exploring
                  </Label>
                </div>
              </div>
            </RadioGroup>
            {errors.financingStatus && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.financingStatus}
              </p>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">What's your timeline?</h3>
              <p className="text-gray-600 text-sm mb-4">When are you planning to build?</p>
            </div>
            <RadioGroup
              value={formData.timeline}
              onValueChange={(value) => updateFormData("timeline", value)}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0-6-months" id="0-6-months" />
                  <Label htmlFor="0-6-months" className="cursor-pointer font-normal">
                    0-6 months
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="6-12-months" id="6-12-months" />
                  <Label htmlFor="6-12-months" className="cursor-pointer font-normal">
                    6-12 months
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1-2-years" id="1-2-years" />
                  <Label htmlFor="1-2-years" className="cursor-pointer font-normal">
                    1-2 years
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2-plus-years" id="2-plus-years" />
                  <Label htmlFor="2-plus-years" className="cursor-pointer font-normal">
                    2+ years
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="just-exploring" id="just-exploring-timeline" />
                  <Label htmlFor="just-exploring-timeline" className="cursor-pointer font-normal">
                    Just exploring
                  </Label>
                </div>
              </div>
            </RadioGroup>
            {errors.timeline && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.timeline}
              </p>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Contact Information</h3>
              <p className="text-gray-600 text-sm mb-4">Tell us how to reach you</p>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="survey-name" className="text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="survey-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="Enter your name"
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

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="survey-email" className="text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="survey-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="Enter your email"
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

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="survey-phone" className="text-sm font-medium text-gray-700">
                  Phone
                </Label>
                <Input
                  id="survey-phone"
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  placeholder="Enter your phone number (optional)"
                />
              </div>

              {/* Budget Range */}
              <div className="space-y-2">
                <Label htmlFor="survey-budget" className="text-sm font-medium text-gray-700">
                  Budget Range
                </Label>
                <Select
                  value={formData.budgetRange || ""}
                  onValueChange={(value) => updateFormData("budgetRange", value)}
                >
                  <SelectTrigger id="survey-budget">
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not specified</SelectItem>
                    <SelectItem value="under-50k">Under €50,000</SelectItem>
                    <SelectItem value="50k-100k">€50,000 - €100,000</SelectItem>
                    <SelectItem value="100k-200k">€100,000 - €200,000</SelectItem>
                    <SelectItem value="200k-300k">€200,000 - €300,000</SelectItem>
                    <SelectItem value="300k-500k">€300,000 - €500,000</SelectItem>
                    <SelectItem value="over-500k">Over €500,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preferred Country */}
              <div className="space-y-2">
                <Label htmlFor="survey-country" className="text-sm font-medium text-gray-700">
                  Preferred Country
                </Label>
                <Select
                  value={formData.country || ""}
                  onValueChange={(value) => updateFormData("country", value)}
                >
                  <SelectTrigger id="survey-country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not specified</SelectItem>
                    <SelectItem value="latvia">Latvia</SelectItem>
                    <SelectItem value="estonia">Estonia</SelectItem>
                    <SelectItem value="lithuania">Lithuania</SelectItem>
                    <SelectItem value="sweden">Sweden</SelectItem>
                    <SelectItem value="denmark">Denmark</SelectItem>
                    <SelectItem value="finland">Finland</SelectItem>
                    <SelectItem value="norway">Norway</SelectItem>
                    <SelectItem value="germany">Germany</SelectItem>
                    <SelectItem value="poland">Poland</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* House Type Preference */}
              <div className="space-y-2">
                <Label htmlFor="survey-house-type" className="text-sm font-medium text-gray-700">
                  House Type Preference
                </Label>
                <Select
                  value={formData.houseType || ""}
                  onValueChange={(value) => updateFormData("houseType", value)}
                >
                  <SelectTrigger id="survey-house-type">
                    <SelectValue placeholder="Select house type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not specified</SelectItem>
                    <SelectItem value="tiny-house">Tiny House</SelectItem>
                    <SelectItem value="modular">Modular</SelectItem>
                    <SelectItem value="a-frame">A-Frame</SelectItem>
                    <SelectItem value="cabin">Cabin</SelectItem>
                    <SelectItem value="container-home">Container Home</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Success screen
  if (status?.type === "success") {
    return (
      <div className={`${className} max-w-2xl mx-auto`}>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-teal-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">{status.message}</p>
          <Button
            onClick={() => {
              setCurrentStep(1)
              setFormData({
                landStatus: "",
                financingStatus: "",
                timeline: "",
                name: "",
                email: "",
                phone: "",
                budgetRange: "",
                country: "",
                houseType: "",
              })
              setStatus(null)
              setErrors({})
            }}
            className="bg-teal-600 hover:bg-teal-700"
          >
            Start New Survey
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <form onSubmit={currentStep === 4 ? handleSubmit : (e) => e.preventDefault()}>
          <div className="min-h-[400px]">{renderStepContent()}</div>

          {/* Status Message */}
          {status && status.type !== "success" && (
            <div
              className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
                status.type === "error"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : ""
              }`}
            >
              {status.type === "error" && <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
              <p className="text-sm font-medium">{status.message}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            {currentStep < TOTAL_STEPS ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
