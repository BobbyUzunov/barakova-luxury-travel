import type { SiteContent } from "../../../../constants/content";

type TrustSectionProps = {
  content: SiteContent;
};

export function TrustSection({ content }: TrustSectionProps) {
  return (
    <section className="section-shell">
      <div className="section-heading">
        <p>{content.trustSection.eyebrow}</p>
        <h2>{content.trustSection.title}</h2>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {content.trustItems.map((item, index) => (
          <article className="trust-card" key={item.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
