import type { SiteContent } from "../../../../constants/content";

type ProcessSectionProps = {
  content: SiteContent;
};

export function ProcessSection({ content }: ProcessSectionProps) {
  return (
    <section className="section-shell">
      <div className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <div className="section-heading text-left">
          <p>{content.processSection.eyebrow}</p>
          <h2>{content.processSection.title}</h2>
          {content.processSection.description && (
            <span>{content.processSection.description}</span>
          )}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {content.steps.map((step, index) => (
            <article className="step-card" key={step}>
              <div>{index + 1}</div>
              <h3>{step}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
