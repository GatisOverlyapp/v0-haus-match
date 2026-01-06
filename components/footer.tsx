"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Footer() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  const scrollToSection = (sectionId: string) => {
    if (typeof window === "undefined") return

    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    } else {
      // If section not found on current page, navigate to home
      window.location.href = `/#${sectionId}`
    }
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Explore Section */}
          <div>
            <h3 className="text-white font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/manufacturers" className="hover:text-teal-400 transition-colors">
                  Browse Manufacturers
                </Link>
              </li>
              <li>
                <Link href="/models" className="hover:text-teal-400 transition-colors">
                  Browse Models
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-teal-400 transition-colors">
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-teal-400 transition-colors">
                  View Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories Section */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/categories/tiny-house" className="hover:text-teal-400 transition-colors">
                  Tiny House
                </Link>
              </li>
              <li>
                <Link href="/categories/modular" className="hover:text-teal-400 transition-colors">
                  Modular
                </Link>
              </li>
              <li>
                <Link href="/categories/a-frame" className="hover:text-teal-400 transition-colors">
                  A-Frame
                </Link>
              </li>
              <li>
                <Link href="/categories/cabin" className="hover:text-teal-400 transition-colors">
                  Cabin
                </Link>
              </li>
              <li>
                <Link href="/categories/container-home" className="hover:text-teal-400 transition-colors">
                  Container Home
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  About
                </button>
              </li>
              <li>
                <Link href="/blog" className="hover:text-teal-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("for-builders")}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  For Builders
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">© 2026 Prefab Catalog. All rights reserved.</p>
            <div className="flex gap-4 text-sm">
              <Link href="/privacy" className="hover:text-teal-400 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/terms" className="hover:text-teal-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

