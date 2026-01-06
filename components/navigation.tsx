"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Home, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavigationProps {
  openSubscribeModal?: () => void
  isSticky?: boolean
}

export function Navigation({ openSubscribeModal, isSticky = false }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  const handleFindHouseClick = () => {
    if (isHomePage) {
      const element = document.getElementById("find-home")
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
        setMobileMenuOpen(false)
      }
    } else {
      window.location.href = "/"
    }
  }

  return (
    <header
      className={`w-full z-50 transition-all duration-300 ${
        isSticky ? "fixed top-0 bg-white shadow-md" : "relative bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg hover:text-teal-600 transition-colors">
          <Home className="h-6 w-6 text-teal-600" />
          <span>HausMatch</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <button
            onClick={handleFindHouseClick}
            className="text-gray-700 hover:text-teal-600 transition-colors"
          >
            Find a House
          </button>
          <Link href="/map" className="text-gray-700 hover:text-teal-600 transition-colors">
            Map
          </Link>
          <Link href="/blog" className="text-gray-700 hover:text-teal-600 transition-colors">
            Blog
          </Link>
        </nav>

        <div className="hidden md:block">
          <Button
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => {
              openSubscribeModal?.()
              setMobileMenuOpen(false)
            }}
          >
            Join Early Access
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <button
              onClick={handleFindHouseClick}
              className="text-gray-700 hover:text-teal-600 transition-colors py-2 text-left"
            >
              Find a House
            </button>
            <Link href="/map" className="text-gray-700 hover:text-teal-600 transition-colors py-2 text-left">
              Map
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-teal-600 transition-colors py-2 text-left">
              Blog
            </Link>
            <Button
              className="bg-teal-600 hover:bg-teal-700 w-full"
              onClick={() => {
                openSubscribeModal?.()
                setMobileMenuOpen(false)
              }}
            >
              Join Early Access
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
