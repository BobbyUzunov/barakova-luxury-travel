import type { MetadataRoute } from "next";
import { locales } from "../constants/i18n";
import { localePath } from "../constants/i18n";
import {
  blogSlugs,
  cruiseSlugs,
  destinationSlugs,
} from "../constants/seo-content";
import { siteUrl } from "../constants/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push({
      url: `${siteUrl}${localePath(locale)}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    });

    entries.push({
      url: `${siteUrl}${localePath(locale, "/privacy")}`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    });

    for (const slug of destinationSlugs) {
      entries.push({
        url: `${siteUrl}${localePath(locale, `/destinations/${slug}`)}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }

    for (const slug of cruiseSlugs) {
      entries.push({
        url: `${siteUrl}${localePath(locale, `/cruises/${slug}`)}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.75,
      });
    }

    for (const slug of blogSlugs) {
      entries.push({
        url: `${siteUrl}${localePath(locale, `/blog/${slug}`)}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
