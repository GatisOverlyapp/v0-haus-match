"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface SurveyFormData {
  landStatus: string
  financingStatus: string
  timeline: string
  name: string
  email: string
  phone?: string
  budgetRange?: string
  country?: string
  houseType?: string
}

export interface SurveyResponse {
  success: boolean
  message: string
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Validate email format
function isValidEmail(email: string): boolean {
  return emailRegex.test(email)
}

// Validate input
function validateInput(data: SurveyFormData): { valid: boolean; message?: string } {
  // Step 1: Land Status
  if (!data.landStatus || data.landStatus.trim().length === 0) {
    return { valid: false, message: "Please select your land status" }
  }

  // Step 2: Financing
  if (!data.financingStatus || data.financingStatus.trim().length === 0) {
    return { valid: false, message: "Please select your financing status" }
  }

  // Step 3: Timeline
  if (!data.timeline || data.timeline.trim().length === 0) {
    return { valid: false, message: "Please select your timeline" }
  }

  // Step 4: Contact Info
  if (!data.name || data.name.trim().length === 0) {
    return { valid: false, message: "Name is required" }
  }

  if (data.name.trim().length < 2) {
    return { valid: false, message: "Name must be at least 2 characters" }
  }

  if (!data.email || data.email.trim().length === 0) {
    return { valid: false, message: "Email is required" }
  }

  if (!isValidEmail(data.email.trim())) {
    return { valid: false, message: "Please enter a valid email address" }
  }

  return { valid: true }
}

export async function submitSurvey(data: SurveyFormData): Promise<SurveyResponse> {
  try {
    // Validate input
    const validation = validateInput(data)
    if (!validation.valid) {
      return {
        success: false,
        message: validation.message || "Invalid input",
      }
    }

    const name = data.name.trim()
    const email = data.email.trim().toLowerCase()

    // Create lead entry
    await prisma.lead.create({
      data: {
        landStatus: data.landStatus,
        financingStatus: data.financingStatus,
        timeline: data.timeline,
        name,
        email,
        phone: data.phone?.trim() || null,
        budgetRange: data.budgetRange || null,
        country: data.country || null,
        houseType: data.houseType || null,
      },
    })

    // Revalidate any pages that might show lead data
    revalidatePath("/")

    return {
      success: true,
      message: "Thank you for completing the survey! We'll be in touch soon.",
    }
  } catch (error) {
    console.error("Survey submission error:", error)

    return {
      success: false,
      message: "An error occurred. Please try again later.",
    }
  }
}
