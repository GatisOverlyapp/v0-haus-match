"use client"

import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react"
import { blogPosts } from "../data"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { notFound } from "next/navigation"
import { useState } from "react"

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export default function BlogPostClientPage({ params }: BlogPostPageProps) {
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false)
  const post = blogPosts.find((p) => p.slug === params.slug)

  if (!post) {
    notFound()
  }

  // Get related posts (same category, excluding current)
  const relatedPosts = blogPosts.filter((p) => p.category === post.category && p.id !== post.id).slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50">
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
            {post.content.split("\n\n").map((paragraph, index) => {
              if (paragraph.trim().startsWith("**")) {
                // Handle bold text
                return (
                  <p key={index} className="mb-4">
                    {paragraph.split("\n").map((line, lineIndex) => {
                      const parts = line.split("**")
                      return (
                        <span key={lineIndex}>
                          {parts.map((part, partIndex) =>
                            partIndex % 2 === 1 ? <strong key={partIndex}>{part}</strong> : part,
                          )}
                          {lineIndex < paragraph.split("\n").length - 1 && <br />}
                        </span>
                      )
                    })}
                  </p>
                )
              } else if (paragraph.trim().startsWith("-")) {
                // Handle bullet points
                return (
                  <ul key={index} className="list-disc list-inside mb-4 space-y-2">
                    {paragraph
                      .split("\n")
                      .map((line, lineIndex) => line.trim() && <li key={lineIndex}>{line.replace(/^-\s*/, "")}</li>)}
                  </ul>
                )
              }
              return (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              )
            })}
          </div>

          {/* Share Section */}
          <div className="py-8 border-y border-gray-200 mb-12">
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">Share this article:</span>
              <Button
                variant="outline"
                size="sm"
                className="text-teal-600 border-teal-600 hover:bg-teal-50 bg-transparent"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-8 text-gray-900">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
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
    </div>
  )
}
