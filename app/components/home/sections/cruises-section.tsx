import Link from "next/link";
import type { Locale, SiteContent } from "../../../../constants/content";
import { localePath } from "../../../../constants/i18n";
import { getCruiseSlug } from "../../../../constants/seo-content";
import { DestinationImage } from "../destination-image";

type CruisesSectionProps = {
  content: SiteContent;
  locale: Locale;
};

export function CruisesSection({ content, locale }: CruisesSectionProps) {
  return (
    <section className="section-shell" id="cruises">
      <div className="section-heading">
        <p>{content.cruisesSection.eyebrow}</p>
        <h2>{content.cruisesSection.title}</h2>
        {content.cruisesSection.description && (
          <span>{content.cruisesSection.description}</span>
        )}
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {content.cruises.map((cruise, index) => (
          <Link
            className="destination-card cruise-card"
            href={localePath(locale, `/cruises/${getCruiseSlug(index)}`)}
            key={cruise.name}
            scroll={false}
          >
            <div className="destination-media">
              <DestinationImage alt={cruise.name} remoteSrc={cruise.image} />
              <div className="destination-overlay" />
              <div className="destination-content">
                <h3>{cruise.name}</h3>
                <span />
                <p>{cruise.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
