"use client"

import { useState, useRef } from "react"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Eye } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const performLogin = async () => {
    // Get values from state first, but fallback to reading from DOM if state is empty
    let emailValue = email.trim()
    let passwordValue = password
    
    // If state is empty, try to read from form inputs directly
    if (!emailValue || !passwordValue) {
      const form = formRef.current
      if (form) {
        const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]')
        const passwordInput = form.querySelector<HTMLInputElement>('input[name="password"]')
        
        if (emailInput && !emailValue) {
          emailValue = emailInput.value.trim()
          setEmail(emailInput.value) // Update state for consistency
        }
        if (passwordInput && !passwordValue) {
          passwordValue = passwordInput.value
          setPassword(passwordInput.value) // Update state for consistency
        }
      }
    }
    
    console.log("Attempting login with:", { email: emailValue, hasPassword: !!passwordValue })
    
    if (!emailValue || !passwordValue) {
      console.log("Validation failed - missing email or password")
      toast.error("Please enter both email and password")
      return
    }

    console.log("Starting login process...")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email: emailValue,
        password: passwordValue,
        redirect: false,
      })

      console.log("SignIn result:", result)

      if (result?.error) {
        console.log("Login error:", result.error)
        toast.error("Invalid email or password")
        setLoading(false)
        return
      }

      // Login successful - redirect to admin page
      // Use window.location for a full page reload to ensure session cookie is picked up
      toast.success("Login successful!")
      
      // Small delay to ensure the session cookie is set before redirect
      await new Promise(resolve => setTimeout(resolve, 200))
      window.location.href = "/admin"
    } catch (error) {
      console.error("Login exception:", error)
      toast.error("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("Form onSubmit triggered")
    await performLogin()
  }

  const handleButtonClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    console.log("Button onClick triggered")
    await performLogin()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the CMS</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@hausmatch.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="button" 
              className="w-full" 
              disabled={loading}
              onClick={handleButtonClick}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 pt-4 border-t">
            <Link 
              href="/CMS_PREVIEW.html" 
              target="_blank"
              className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>Preview CMS Interface</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



