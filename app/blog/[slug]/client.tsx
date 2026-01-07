"use client"

import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Share2, Facebook, Twitter, Linkedin, Copy, Check, ArrowUp } from "lucide-react"
import { blogPosts } from "../data"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useState, useEffect } from "react"
import Script from "next/script"

interface BlogPostClientPageProps {
  slug: string
}

export default function BlogPostClientPage({ slug }: BlogPostClientPageProps) {
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const post = blogPosts.find((p) => p.slug === slug)

  // Handle scroll position for Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle smooth scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link href="/blog" className="text-teal-600 hover:text-teal-700">
            ← Back to Blog
          </Link>
        </div>
      </div>
    )
  }

  // Get related posts (same category, excluding current)
  const relatedPosts = blogPosts.filter((p) => p.category === post.category && p.id !== post.id).slice(0, 3)
  
  // If no same category posts, get any other posts
  const fallbackRelatedPosts = relatedPosts.length === 0 
    ? blogPosts.filter((p) => p.id !== post.id).slice(0, 3)
    : relatedPosts

  const currentUrl = typeof window !== "undefined" ? window.location.href : ""
  const shareTitle = encodeURIComponent(post.title)
  const shareDescription = encodeURIComponent(post.excerpt)

  const handleShare = (platform: string) => {
    const url = currentUrl || `https://prefabcatalog.com/blog/${post.slug}`
    
    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(url)}`, "_blank")
        break
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
        break
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank")
        break
      case "copy":
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        break
    }
  }

  // Render content with proper markdown parsing
  const renderContent = (content: string) => {
    const lines = content.split("\n")
    const elements: JSX.Element[] = []
    let currentParagraph: string[] = []
    let inTable = false
    let tableRows: string[][] = []
    let tableHeaders: string[] = []

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const text = currentParagraph.join(" ")
        if (text.trim()) {
          // Check for bold text
          const parts = text.split(/(\*\*[^*]+\*\*)/g)
          elements.push(
            <p key={elements.length} className="mb-6 text-gray-700 leading-relaxed">
              {parts.map((part, i) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
                }
                return <span key={i}>{part}</span>
              })}
            </p>
          )
        }
        currentParagraph = []
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Handle headings
      if (line.startsWith("# ")) {
        flushParagraph()
        elements.push(
          <h1 key={elements.length} className="text-4xl font-bold text-gray-900 mt-12 mb-6">
            {line.slice(2)}
          </h1>
        )
        continue
      }
      if (line.startsWith("## ")) {
        flushParagraph()
        elements.push(
          <h2 key={elements.length} className="text-3xl font-bold text-gray-900 mt-10 mb-4">
            {line.slice(3)}
          </h2>
        )
        continue
      }
      if (line.startsWith("### ")) {
        flushParagraph()
        elements.push(
          <h3 key={elements.length} className="text-2xl font-semibold text-gray-900 mt-8 mb-3">
            {line.slice(4)}
          </h3>
        )
        continue
      }

      // Handle tables
      if (line.startsWith("|")) {
        if (!inTable) {
          inTable = true
          tableRows = []
        }
        const cells = line
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => cell)
        
        // Check if it's a header separator
        if (cells.every((cell) => cell.match(/^[-:]+$/))) {
          continue
        }
        
        if (tableRows.length === 0) {
          tableHeaders = cells
        } else {
          tableRows.push(cells)
        }
        continue
      } else {
        // Close table if we were in one
        if (inTable && tableHeaders.length > 0) {
          flushParagraph()
          elements.push(
            <div key={elements.length} className="my-8 overflow-x-auto">
              <table className="min-w-full border border-gray-300 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    {tableHeaders.map((header, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300"
                      >
                        {header.replace(/\*\*/g, "")}
                      </th>
                    ))}
                  </tr>
                </thead>
                {tableRows.length > 0 && (
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableRows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-gray-50">
                        {row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200"
                          >
                            {cell.replace(/\*\*/g, "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
          )
          inTable = false
          tableRows = []
          tableHeaders = []
        }
      }

      // Handle horizontal rules
      if (line.startsWith("---")) {
        flushParagraph()
        elements.push(<hr key={elements.length} className="my-8 border-gray-300" />)
        continue
      }

      // Handle lists
      if (line.startsWith("- ") || line.startsWith("✅ ")) {
        flushParagraph()
        const listItems: string[] = []
        let j = i
        while (j < lines.length && (lines[j].trim().startsWith("- ") || lines[j].trim().startsWith("✅ "))) {
          listItems.push(lines[j].trim().replace(/^[-✅]\s*/, ""))
          j++
        }
        i = j - 1
        elements.push(
          <ul key={elements.length} className="list-disc list-inside mb-6 space-y-2 text-gray-700">
            {listItems.map((item, idx) => {
              const parts = item.split(/(\*\*[^*]+\*\*)/g)
              return (
                <li key={idx} className="ml-4">
                  {parts.map((part, pIdx) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      return <strong key={pIdx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>
                    }
                    return <span key={pIdx}>{part}</span>
                  })}
                </li>
              )
            })}
          </ul>
        )
        continue
      }

      // Handle FAQ sections
      if (line.startsWith("**") && line.includes("?") && line.endsWith("**")) {
        flushParagraph()
        const question = line.slice(2, -2)
        // Get the answer (next line)
        const answer = i + 1 < lines.length ? lines[i + 1].trim() : ""
        i++ // Skip answer line
        elements.push(
          <div key={elements.length} className="my-6 p-4 bg-gray-50 rounded-lg border-l-4 border-teal-600">
            <h4 className="font-semibold text-gray-900 mb-2">{question}</h4>
            {answer && <p className="text-gray-700">{answer}</p>}
          </div>
        )
        continue
      }

      // Handle CTA links like "[Browse Tiny House Manufacturers →]"
      if (line.match(/^\[Browse.*→\]$/)) {
        flushParagraph()
        const ctaText = line.match(/\[(.*?)\s*→\]/)?.[1] || "Browse Manufacturers"
        const href = ctaText.toLowerCase().includes("tiny house") ? "/?category=tiny-houses" 
          : ctaText.toLowerCase().includes("california") ? "/manufacturers?country=US"
          : ctaText.toLowerCase().includes("manufacturers") ? "/manufacturers"
          : "/"
        elements.push(
          <div key={elements.length} className="my-8 p-6 bg-teal-50 rounded-lg border border-teal-200">
            <Link href={href}>
              <Button size="lg" className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white">
                {ctaText} →
              </Button>
            </Link>
          </div>
        )
        continue
      }

      // Regular paragraph text
      if (line) {
        currentParagraph.push(line)
      } else {
        flushParagraph()
      }
    }
    flushParagraph()

    // Close any open table at the end
    if (inTable && tableHeaders.length > 0) {
      elements.push(
        <div key={elements.length} className="my-8 overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                {tableHeaders.map((header, idx) => (
                  <th
                    key={idx}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300"
                  >
                    {header.replace(/\*\*/g, "")}
                  </th>
                ))}
              </tr>
            </thead>
            {tableRows.length > 0 && (
              <tbody className="bg-white divide-y divide-gray-200">
                {tableRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-gray-50">
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-4 py-3 text-sm text-gray-700 border-b border-gray-200"
                      >
                        {cell.replace(/\*\*/g, "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      )
    }

    return elements
  }

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.image,
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.date).toISOString(),
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Prefab Catalog",
      logo: {
        "@type": "ImageObject",
        url: "https://prefabcatalog.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://prefabcatalog.com/blog/${post.slug}`,
    },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Navigation Component */}
      <Navigation openSubscribeModal={() => setSubscribeModalOpen(true)} />

      {/* Hero Image */}
      <div className="relative w-full h-96 bg-gray-200 overflow-hidden">
        <img src={post.image || "/placeholder.svg"} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
      </div>

      {/* Article Container */}
      <article className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <Link href="/blog">
            <Button variant="ghost" className="mb-8 text-teal-600 hover:text-teal-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-medium">{post.category}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{post.title}</h1>

            <div className="flex flex-col md:flex-row md:items-center gap-4 py-4 border-y border-gray-200">
              <div className="text-gray-600">
                <p className="font-medium">By {post.author}</p>
              </div>

              <div className="flex flex-wrap gap-4 md:ml-auto text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {post.readTime} min read
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-12 text-gray-700 leading-relaxed">
            {renderContent(post.content)}
          </div>

          {/* Share Section */}
          <div className="py-8 border-y border-gray-200 mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <span className="text-gray-700 font-medium">Share this article:</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare("twitter")}
                  className="text-blue-400 border-blue-400 hover:bg-blue-50"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare("facebook")}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare("linkedin")}
                  className="text-blue-700 border-blue-700 hover:bg-blue-50"
                >
                  <Linkedin className="w-4 h-4 mr-2" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare("copy")}
                  className="text-gray-600 border-gray-300 hover:bg-gray-50"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-lg p-8 md:p-12 mb-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Build Your ADU or JADU?</h2>
            <p className="text-lg text-teal-100 mb-6">
              Explore our catalog of prefab ADU manufacturers and find the perfect solution for your property.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/">
                <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
                  Browse Manufacturers
                </Button>
              </Link>
              <Link href="/map">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Map
                </Button>
              </Link>
            </div>
          </div>

          {/* Related Posts */}
          {fallbackRelatedPosts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-8 text-gray-900">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {fallbackRelatedPosts.map((relatedPost) => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                    <div className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                      <div className="relative overflow-hidden bg-gray-200 aspect-video">
                        <img
                          src={relatedPost.image || "/placeholder.svg"}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors mb-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-gray-600">{relatedPost.excerpt}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
      <Footer />

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 w-12 h-12 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg flex items-center justify-center transition-all duration-300 z-50 ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  )
}
