import { contentBg } from "./content-bg";
import type { BlogPost, Destination } from "./content";

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

function addSlugs<T extends Destination>(
  entries: T[],
  slugs: readonly string[],
): SluggedDestination[] {
  return entries.map((entry, index) => ({
    ...entry,
    slug: slugs[index],
  }));
}

export const seoDestinations = addSlugs(
  contentBg.destinations,
  destinationSlugs,
);

export const seoCruises = addSlugs(contentBg.cruises, cruiseSlugs);

export const seoBlogPosts: SluggedBlogPost[] = contentBg.blog.posts.map(
  (post, index) => ({
    ...post,
    slug: blogSlugs[index],
  }),
);

export function getDestinationSlug(index: number) {
  return destinationSlugs[index];
}

export function getCruiseSlug(index: number) {
  return cruiseSlugs[index];
}

export function getBlogSlug(index: number) {
  return blogSlugs[index];
}
