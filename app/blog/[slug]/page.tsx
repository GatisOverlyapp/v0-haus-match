import type { Metadata } from "next"
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

  // Enhanced SEO metadata
  const keywords = post.slug === "adu-vs-jadu-comparison-guide"
    ? "ADU vs JADU, accessory dwelling unit, junior accessory dwelling unit, California ADU laws 2025, ADU requirements, JADU requirements, ADU cost, backyard cottage, granny flat"
    : `${post.category}, prefab, modular homes`

  return {
    title: `${post.title} | Prefab Catalog Blog`,
    description: post.excerpt,
    keywords: keywords,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.date,
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
      description: post.excerpt,
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
  return <BlogPostClientPage slug={slug} />
}
