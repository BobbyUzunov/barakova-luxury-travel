import type { SiteContent } from "../../../../constants/content";

type ServicesSectionProps = {
  content: SiteContent;
};

export function ServicesSection({ content }: ServicesSectionProps) {
  return (
    <section className="section-shell pt-12" id="services">
      <div className="section-heading">
        <p>{content.servicesSection.eyebrow}</p>
        <h2>{content.servicesSection.title}</h2>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {content.services.map((service, index) => (
          <article
            className="lux-card animate-soft-in"
            style={{ animationDelay: `${index * 70}ms` }}
            key={service.title}
          >
            <span className="card-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
