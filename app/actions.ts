"use server"

// This is a simple in-memory storage for emails
// In a real application, you would use a database like MongoDB, PostgreSQL, etc.
const subscribedEmails: { name: string; email: string; date: Date }[] = []

export async function subscribeToEarlyAccess(formData: FormData) {
  try {
    // Get form data
    const name = formData.get("name") as string
    const email = formData.get("email") as string

    // Basic validation
    if (!name || !email) {
      return { success: false, message: "Name and email are required" }
    }

    if (!email.includes("@") || !email.includes(".")) {
      return { success: false, message: "Please enter a valid email address" }
    }

    // Check if email already exists
    const emailExists = subscribedEmails.some((entry) => entry.email === email)
    if (emailExists) {
      return { success: true, message: "You are already subscribed!" }
    }

    // Store the email
    subscribedEmails.push({
      name,
      email,
      date: new Date(),
    })

    // For debugging - in a real app this would be logged to a secure location
    console.log("Current subscribed emails:", subscribedEmails)

    return {
      success: true,
      message: "Thank you for subscribing! We will notify you when we launch.",
    }
  } catch (error) {
    console.error("Subscription error:", error)
    return {
      success: false,
      message: "An error occurred. Please try again later.",
    }
  }
}

// Function to export emails (would be used in an admin panel)
export async function exportSubscribedEmails() {
  // This would typically be protected by authentication
  return subscribedEmails
}
