import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { detailUi } from "../../../../constants/detail-ui";
import type { Locale } from "../../../../constants/content";
import {
  getAlternateLanguages,
  isLocale,
  localePath,
  localizedHash,
} from "../../../../constants/i18n";
import { findSeoBlogPost, getSeoBlogPosts } from "../../../../constants/seo-content";
import { siteUrl } from "../../../../constants/site";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return getSeoBlogPosts("bg").flatMap((post) => [
    { locale: "bg", slug: post.slug },
    { locale: "en", slug: post.slug },
  ]);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const locale = localeParam as Locale;
  const post = findSeoBlogPost(locale, slug);

  if (!post) {
    return {};
  }

  const title =
    locale === "bg"
      ? `${post.title} | Богдана Баракова`
      : `${post.title} | Bogdana Barakova`;
  const canonical = localePath(locale, `/blog/${post.slug}`);

  return {
    title,
    description: post.excerpt,
    alternates: {
      canonical,
      languages: getAlternateLanguages(`/blog/${post.slug}`),
    },
    openGraph: {
      title,
      description: post.excerpt,
      type: "article",
      url: canonical,
      locale: locale === "bg" ? "bg_BG" : "en_US",
      images: [{ url: post.image, alt: post.title }],
      authors: [locale === "bg" ? "Богдана Баракова" : "Bogdana Barakova"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { locale: localeParam, slug } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const post = findSeoBlogPost(locale, slug);
  const copy = detailUi[locale].blog;

  if (!post) {
    notFound();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    url: `${siteUrl}${localePath(locale, `/blog/${post.slug}`)}`,
    inLanguage: locale,
    author: {
      "@type": "Person",
      name: locale === "bg" ? "Богдана Баракова" : "Bogdana Barakova",
    },
    publisher: {
      "@type": "Organization",
      name: "Barakova Luxury Travel",
      url: siteUrl,
    },
  };

  return (
    <main className="min-h-screen bg-[var(--ivory)] text-[var(--charcoal)]">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />
      <header className="detail-header">
        <Link className="detail-brand" href={localePath(locale)}>
          <span>Barakova Luxury Travel</span>
          <small>{detailUi[locale].brandSubtitle}</small>
        </Link>
        <Link
          className="detail-back-link"
          href={localizedHash(locale, copy.backHash)}
        >
          {copy.backLabel}
        </Link>
      </header>

      <article className="article-page">
        <div className="article-hero">
          <Image
            alt={post.title}
            className="detail-hero-image"
            fill
            priority
            sizes="100vw"
            src={post.image}
          />
          <div className="detail-hero-overlay" />
        </div>
        <div className="article-content">
          <div className="article-meta">
            <span>{post.category}</span>
            <small>{post.readTime}</small>
          </div>
          <h1>{post.title}</h1>
          <p className="article-excerpt">{post.excerpt}</p>
          <div className="article-copy">
            {post.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="article-author">
            <span>{copy.authorLabel}</span>
            <strong>{locale === "bg" ? "Богдана Баракова" : "Bogdana Barakova"}</strong>
          </div>
          <Link
            className="btn-primary detail-cta"
            href={localizedHash(locale, "#contact")}
          >
            {copy.ctaLabel}
          </Link>
        </div>
      </article>
    </main>
  );
}
