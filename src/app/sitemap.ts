import type { MetadataRoute } from "next";
import { client } from "@/lib/content/sanity";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

const BLOG_POSTS_QUERY = `
  *[_type == "post" && defined(slug.current)]{
    "slug": slug.current,
    _updatedAt
  }
`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await client.fetch(BLOG_POSTS_QUERY);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/login`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms-of-service`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/cookie-policy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const blogPages: MetadataRoute.Sitemap = posts.map(
    (post: { slug: string; _updatedAt: string }) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post._updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    })
  );

  return [...staticPages, ...blogPages];
}