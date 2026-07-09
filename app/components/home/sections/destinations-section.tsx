import Link from "next/link";
import type { Locale, SiteContent } from "../../../../constants/content";
import { localePath } from "../../../../constants/i18n";
import { getDestinationSlug } from "../../../../constants/seo-content";
import { DestinationImage } from "../destination-image";

type DestinationsSectionProps = {
  content: SiteContent;
  locale: Locale;
};

export function DestinationsSection({
  content,
  locale,
}: DestinationsSectionProps) {
  return (
    <section className="section-shell" id="destinations">
      <div className="section-heading">
        <p>{content.destinationsSection.eyebrow}</p>
        <h2>{content.destinationsSection.title}</h2>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {content.destinations.map((destination, index) => (
          <Link
            className="destination-card"
            href={localePath(
              locale,
              `/destinations/${getDestinationSlug(index)}`,
            )}
            key={destination.name}
            scroll={false}
          >
            <div className="destination-media">
              <DestinationImage
                alt={destination.name}
                remoteSrc={destination.image}
              />
              <div className="destination-overlay" />
              <div className="destination-content">
                <h3>{destination.name}</h3>
                <span />
                <p>{destination.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
