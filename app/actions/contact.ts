"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface ContactFormData {
  manufacturerId: string
  modelId?: string
  name: string
  email: string
  phone?: string
  message: string
}

export interface ContactResponse {
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
function validateInput(data: ContactFormData): { valid: boolean; message?: string } {
  if (!data.manufacturerId || data.manufacturerId.trim().length === 0) {
    return { valid: false, message: "Manufacturer ID is required" }
  }

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

  if (!data.message || data.message.trim().length === 0) {
    return { valid: false, message: "Message is required" }
  }

  if (data.message.trim().length < 50) {
    return { valid: false, message: "Message must be at least 50 characters" }
  }

  return { valid: true }
}

export async function submitContact(data: ContactFormData): Promise<ContactResponse> {
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
    const message = data.message.trim()

    // Create contact entry
    await prisma.contact.create({
      data: {
        manufacturerId: data.manufacturerId,
        modelId: data.modelId?.trim() || null,
        name,
        email,
        phone: data.phone?.trim() || null,
        message,
      },
    })

    // Revalidate any pages that might show contact data
    revalidatePath("/")

    return {
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
    }
  } catch (error) {
    console.error("Contact submission error:", error)

    return {
      success: false,
      message: "An error occurred. Please try again later.",
    }
  }
}
