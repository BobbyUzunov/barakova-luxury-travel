import type { MetadataRoute } from "next";
import {
  seoBlogPosts,
  seoCruises,
  seoDestinations,
} from "../constants/seo-content";

const siteUrl = "https://barakovaluxurytravel.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...seoDestinations.map(({ slug }) => ({
      url: `${siteUrl}/destinations/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...seoCruises.map(({ slug }) => ({
      url: `${siteUrl}/cruises/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    ...seoBlogPosts.map(({ slug }) => ({
      url: `${siteUrl}/blog/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
