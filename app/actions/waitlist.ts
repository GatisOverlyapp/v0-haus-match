"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface WaitlistFormData {
  name: string
  email: string
}

export interface WaitlistResponse {
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
function validateInput(data: WaitlistFormData): { valid: boolean; message?: string } {
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

export async function submitToWaitlist(data: WaitlistFormData): Promise<WaitlistResponse> {
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

    // Check if email already exists
    const existing = await prisma.waitlist.findUnique({
      where: { email },
    })

    if (existing) {
      return {
        success: true,
        message: "You're already on the waitlist! We'll notify you when we launch.",
      }
    }

    // Create waitlist entry
    await prisma.waitlist.create({
      data: {
        name,
        email,
      },
    })

    // Revalidate any pages that might show waitlist data
    revalidatePath("/")

    return {
      success: true,
      message: "Thank you for joining the waitlist! We'll notify you when we launch.",
    }
  } catch (error) {
    console.error("Waitlist submission error:", error)

    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return {
        success: true,
        message: "You're already on the waitlist! We'll notify you when we launch.",
      }
    }

    return {
      success: false,
      message: "An error occurred. Please try again later.",
    }
  }
}
