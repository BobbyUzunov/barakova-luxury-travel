import { contentBg } from "./content-bg";
import { contentEn } from "./content-en";
import type { BlogPost, Destination, Locale } from "./content";

export const destinationSlugs = [
  "maldives",
  "seychelles",
  "japan",
  "mauritius",
  "zanzibar",
  "sicily",
  "dubai",
  "china",
  "dominican-republic",
  "singapore",
  "usa",
  "mexico",
] as const;

export const cruiseSlugs = [
  "mediterranean",
  "greek-islands",
  "caribbean",
  "norwegian-fjords",
  "arabian-gulf",
  "japan-asia",
] as const;

export const blogSlugs = [
  "how-to-choose-a-luxury-hotel",
  "maldives-beyond-the-photos",
  "why-a-personal-itinerary-matters",
] as const;

type SluggedDestination = Destination & { slug: string };
type SluggedBlogPost = BlogPost & { slug: string };

const contentByLocale = {
  bg: contentBg,
  en: contentEn,
} as const;

function addSlugs<T extends Destination>(
  entries: T[],
  slugs: readonly string[],
): SluggedDestination[] {
  return entries.map((entry, index) => ({
    ...entry,
    slug: slugs[index],
  }));
}

export function getSeoDestinations(locale: Locale) {
  return addSlugs(contentByLocale[locale].destinations, destinationSlugs);
}

export function getSeoCruises(locale: Locale) {
  return addSlugs(contentByLocale[locale].cruises, cruiseSlugs);
}

export function getSeoBlogPosts(locale: Locale): SluggedBlogPost[] {
  return contentByLocale[locale].blog.posts.map((post, index) => ({
    ...post,
    slug: blogSlugs[index],
  }));
}

export const seoDestinations = getSeoDestinations("bg");
export const seoCruises = getSeoCruises("bg");
export const seoBlogPosts = getSeoBlogPosts("bg");

export function getDestinationSlug(index: number) {
  return destinationSlugs[index];
}

export function getCruiseSlug(index: number) {
  return cruiseSlugs[index];
}

export function getBlogSlug(index: number) {
  return blogSlugs[index];
}

export function findSeoDestination(locale: Locale, slug: string) {
  return getSeoDestinations(locale).find((item) => item.slug === slug);
}

export function findSeoCruise(locale: Locale, slug: string) {
  return getSeoCruises(locale).find((item) => item.slug === slug);
}

export function findSeoBlogPost(locale: Locale, slug: string) {
  return getSeoBlogPosts(locale).find((item) => item.slug === slug);
}
