"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, Menu, X, ChevronDown, ChevronRight } from "lucide-react"
import Link from "next/link"
import { categories } from "@/app/categories/data"

interface NavigationProps {
  openSubscribeModal?: () => void
  isSticky?: boolean
}

export function Navigation({ openSubscribeModal, isSticky = false }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    if (typeof window === "undefined") return

    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setMobileMenuOpen(false)
    } else {
      // If section not found on current page, navigate to home
      window.location.href = `/#${sectionId}`
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
            onClick={() => scrollToSection("find-home")}
            className="text-gray-700 hover:text-teal-600 transition-colors"
          >
            Find a House
          </button>
          <Link href="/manufacturers" className="text-gray-700 hover:text-teal-600 transition-colors">
            Manufacturers
          </Link>
          <Link href="/models" className="text-gray-700 hover:text-teal-600 transition-colors">
            Models
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-gray-700 hover:text-teal-600 transition-colors flex items-center gap-1 outline-none">
              Categories
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {categories.map((category) => (
                <DropdownMenuItem key={category.slug} asChild>
                  <Link href={`/categories/${category.slug}`} className="cursor-pointer">
                    {category.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
              onClick={() => scrollToSection("find-home")}
              className="text-gray-700 hover:text-teal-600 transition-colors py-2 text-left"
            >
              Find a House
            </button>
            <Link href="/manufacturers" className="text-gray-700 hover:text-teal-600 transition-colors py-2 text-left">
              Manufacturers
            </Link>
            <Link href="/models" className="text-gray-700 hover:text-teal-600 transition-colors py-2 text-left">
              Models
            </Link>
            {/* Categories Expandable Menu */}
            <div>
              <button
                onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                className="text-gray-700 hover:text-teal-600 transition-colors py-2 text-left flex items-center justify-between w-full"
              >
                <span>Categories</span>
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${mobileCategoriesOpen ? "rotate-90" : ""}`}
                />
              </button>
              {mobileCategoriesOpen && (
                <div className="pl-4 mt-2 space-y-2">
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/categories/${category.slug}`}
                      className="text-gray-600 hover:text-teal-600 transition-colors py-1.5 text-left block text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
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
