import Image from "next/image";
import Link from "next/link";
import type { Destination, Locale } from "../constants/content";

type ContentDetailPageProps = {
  item: Destination;
  locale: Locale;
  homeHref: string;
  eyebrow: string;
  backLabel: string;
  backHref: string;
  highlightsTitle: string;
  galleryTitle: string;
  galleryPhotoLabel: string;
  ctaLabel: string;
  contactHref: string;
};

export function ContentDetailPage({
  item,
  locale,
  homeHref,
  eyebrow,
  backLabel,
  backHref,
  highlightsTitle,
  galleryTitle,
  galleryPhotoLabel,
  ctaLabel,
  contactHref,
}: ContentDetailPageProps) {
  return (
    <main className="min-h-screen bg-[var(--ivory)] text-[var(--charcoal)]">
      <header className="detail-header">
        <Link className="detail-brand" href={homeHref}>
          <span>Barakova Luxury Travel</span>
          <small>
            {locale === "bg" ? "by Богдана Баракова" : "by Bogdana Barakova"}
          </small>
        </Link>
        <Link className="detail-back-link" href={backHref}>
          {backLabel}
        </Link>
      </header>

      <article>
        <section className="detail-hero">
          <Image
            alt={item.name}
            className="detail-hero-image"
            fill
            priority
            sizes="100vw"
            src={item.image}
          />
          <div className="detail-hero-overlay" />
          <div className="detail-hero-copy">
            <p>{eyebrow}</p>
            <h1>{item.name}</h1>
            <span>{item.description}</span>
          </div>
        </section>

        <div className="detail-layout">
          <section className="detail-copy">
            <p>{item.detail}</p>
            <div className="detail-highlights">
              <h2>{highlightsTitle}</h2>
              <ul>
                {item.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
            <Link className="btn-primary detail-cta" href={contactHref}>
              {ctaLabel}
            </Link>
          </section>

          <section className="detail-gallery" aria-labelledby="gallery-title">
            <h2 id="gallery-title">{galleryTitle}</h2>
            <div>
              {item.gallery.map((image, index) => (
                <figure key={image}>
                  <Image
                    alt={`${item.name} - ${galleryPhotoLabel} ${index + 1}`}
                    className="detail-gallery-image"
                    fill
                    sizes="(min-width: 900px) 24vw, 90vw"
                    src={image}
                  />
                </figure>
              ))}
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}
