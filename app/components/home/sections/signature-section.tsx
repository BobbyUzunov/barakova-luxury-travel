import type { SiteContent } from "../../../../constants/content";
import { DestinationImage } from "../destination-image";

type SignatureSectionProps = {
  content: SiteContent;
};

export function SignatureSection({ content }: SignatureSectionProps) {
  return (
    <section className="signature-section section-shell">
      <div className="section-divider" />
      <blockquote className="story-quote">{content.signature.storyQuote}</blockquote>
      <div className="section-heading">
        <p>{content.signature.eyebrow}</p>
        <h2>{content.signature.title}</h2>
        <span>{content.signature.subtitle}</span>
      </div>

      <div className="signature-grid mt-12">
        {content.signature.destinations.map((destination) => (
          <article className="signature-card" key={destination.name}>
            <div className="signature-image">
              <DestinationImage
                alt={destination.name}
                remoteSrc={destination.image}
              />
            </div>
            <div className="signature-copy">
              <span>{content.signature.recommendationLabel}</span>
              <h3>{destination.name}</h3>
              <p>{destination.reason}</p>
              <small>{content.signature.signature}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
