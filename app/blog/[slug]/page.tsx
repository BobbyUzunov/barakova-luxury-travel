import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { seoBlogPosts } from "../../../constants/seo-content";

const siteUrl = "https://barakovaluxurytravel.com";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return seoBlogPosts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = seoBlogPosts.find((item) => item.slug === slug);

  if (!post) {
    return {};
  }

  const title = `${post.title} | Богдана Баракова`;
  const canonical = `/blog/${post.slug}`;

  return {
    title,
    description: post.excerpt,
    alternates: { canonical },
    openGraph: {
      title,
      description: post.excerpt,
      type: "article",
      url: canonical,
      images: [{ url: post.image, alt: post.title }],
      authors: ["Богдана Баракова"],
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
  const { slug } = await params;
  const post = seoBlogPosts.find((item) => item.slug === slug);

  if (!post) {
    notFound();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    url: `${siteUrl}/blog/${post.slug}`,
    inLanguage: "bg",
    author: {
      "@type": "Person",
      name: "Богдана Баракова",
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
        <Link className="detail-brand" href="/">
          <span>Barakova Luxury Travel</span>
          <small>by Богдана Баракова</small>
        </Link>
        <Link className="detail-back-link" href="/#blog">
          Обратно към блога
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
            <span>Автор</span>
            <strong>Богдана Баракова</strong>
          </div>
          <Link className="btn-primary detail-cta" href="/#contact">
            Заяви персонална консултация
          </Link>
        </div>
      </article>
    </main>
  );
}
