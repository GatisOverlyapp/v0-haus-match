"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, CheckCircle, Loader2, AlertCircle } from "lucide-react"

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    setError(null)
    setIsSubmitting(true)
    
    const formData = new FormData(form)
    formData.append("form_type", "contact_page")
    
    try {
      const response = await fetch("https://formspree.io/f/mbdlnkey", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      })

      if (response.ok) {
        setSubmitted(true)
        form.reset()
      } else {
        const data = await response.json()
        setError(data.error || "Something went wrong. Please try again.")
      }
    } catch (err) {
      console.error("Error submitting form:", err)
      setError("An unexpected error occurred. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation openSubscribeModal={undefined} />
      
      <main className="flex-1">
        {/* Header */}
        <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg text-teal-100 max-w-2xl">
              Have questions? We'd love to hear from you.
            </p>
          </div>
        </header>

        {/* Contact Form */}
        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl mx-auto">
            {submitted ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <CheckCircle className="h-16 w-16 text-teal-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
                <p className="text-gray-600 mb-6">
                  Thank you for contacting us. We'll get back to you as soon as possible.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <Mail className="h-6 w-6 text-teal-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Send us a message</h2>
                </div>
                
                <form onSubmit={handleSubmit} action="https://formspree.io/f/mbdlnkey" method="POST" className="space-y-6">
                  {/* Hidden form type field */}
                  <input type="hidden" name="form_type" value="contact_page" />
                  
                  {error && (
                    <div className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-lg flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <Label htmlFor="name" className="text-gray-700 font-medium">
                        Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        required
                        disabled={isSubmitting}
                        className="mt-2 border-gray-300 focus:border-teal-600 focus:ring-teal-600"
                        placeholder="Your name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="email" className="text-gray-700 font-medium">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        required
                        disabled={isSubmitting}
                        className="mt-2 border-gray-300 focus:border-teal-600 focus:ring-teal-600"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <Label htmlFor="subject" className="text-gray-700 font-medium">
                      Subject
                    </Label>
                    <Input
                      type="text"
                      id="subject"
                      name="subject"
                      disabled={isSubmitting}
                      className="mt-2 border-gray-300 focus:border-teal-600 focus:ring-teal-600"
                      placeholder="What's this about?"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message" className="text-gray-700 font-medium">
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      disabled={isSubmitting}
                      rows={5}
                      minLength={10}
                      maxLength={2000}
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 resize-none disabled:opacity-50"
                      placeholder="Tell us more about your question..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
