import Link from "next/link";
import type { Locale, SiteContent } from "../../../../constants/content";
import { localePath } from "../../../../constants/i18n";
import { getBlogSlug } from "../../../../constants/seo-content";
import { DestinationImage } from "../destination-image";

type BlogSectionProps = {
  content: SiteContent;
  locale: Locale;
};

export function BlogSection({ content, locale }: BlogSectionProps) {
  return (
    <section className="blog-section section-shell" id="blog">
      <div className="section-heading">
        <p>{content.blogSection.eyebrow}</p>
        <h2>{content.blogSection.title}</h2>
        {content.blogSection.description && (
          <span>{content.blogSection.description}</span>
        )}
        {content.blogSection.viewAllLabel ? (
          <Link className="section-view-all" href={localePath(locale, "/blog")}>
            {content.blogSection.viewAllLabel}
          </Link>
        ) : null}
      </div>

      <div className="blog-grid mt-12">
        {content.blog.posts.map((post, index) => (
          <Link
            className="blog-card"
            href={localePath(locale, `/blog/${getBlogSlug(index)}`)}
            key={post.title}
            scroll={false}
          >
            <div className="blog-card-image">
              <DestinationImage alt={post.title} remoteSrc={post.image} />
            </div>
            <div className="blog-card-copy">
              <span>{post.category}</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <small>
                {post.date} · {post.readTime}
              </small>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
