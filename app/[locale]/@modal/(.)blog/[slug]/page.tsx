import { notFound } from "next/navigation";
import { InterceptedBlogModal } from "../../../../components/home/intercepted-blog-modal";
import type { Locale } from "../../../../../constants/content";
import { contentBg } from "../../../../../constants/content-bg";
import { contentEn } from "../../../../../constants/content-en";
import { isLocale } from "../../../../../constants/i18n";
import { findSeoBlogPost, getSeoBlogPosts } from "../../../../../constants/seo-content";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return getSeoBlogPosts("bg").flatMap((post) => [
    { locale: "bg", slug: post.slug },
    { locale: "en", slug: post.slug },
  ]);
}

export default async function InterceptedBlogModalPage({ params }: PageProps) {
  const { locale: localeParam, slug } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const post = findSeoBlogPost(locale, slug);

  if (!post) {
    notFound();
  }

  const content = locale === "bg" ? contentBg : contentEn;

  return <InterceptedBlogModal content={content} post={post} />;
}
