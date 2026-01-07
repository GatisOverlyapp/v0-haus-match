import type { Metadata } from "next"
import Link from "next/link"
import { blogPosts } from "../data"
import BlogPostClientPage from "./client"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  // Enhanced SEO metadata - use metaDescription and keywords if available
  const description = post.metaDescription || post.excerpt
  const keywords = post.keywords || `${post.category}, prefab, modular homes${post.tags ? `, ${post.tags.join(", ")}` : ""}`

  const publishedDate = new Date(post.date).toISOString()
  const modifiedDate = new Date(post.date).toISOString()

  return {
    title: `${post.title} | Prefab Catalog Blog`,
    description: description,
    keywords: keywords,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: description,
      type: "article",
      publishedTime: publishedDate,
      modifiedTime: modifiedDate,
      authors: [post.author],
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      siteName: "Prefab Catalog",
      url: `https://prefabcatalog.com/blog/${post.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: description,
      images: [post.image],
    },
    alternates: {
      canonical: `https://prefabcatalog.com/blog/${post.slug}`,
    },
  }
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }))
}

export const revalidate = 3600

export const dynamicParams = true

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)
  
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
  
  return <BlogPostClientPage slug={slug} />
}
