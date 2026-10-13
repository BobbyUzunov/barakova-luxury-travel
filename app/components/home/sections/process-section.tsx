import type { SiteContent } from "../../../../constants/content";

type ProcessSectionProps = {
  content: SiteContent;
};

export function ProcessSection({ content }: ProcessSectionProps) {
  return (
    <section className="section-shell process-section" id="process">
      <div className="process-layout">
        <div className="section-heading text-left">
          <p>{content.processSection.eyebrow}</p>
          <h2>{content.processSection.title}</h2>
          {content.processSection.description && (
            <span>{content.processSection.description}</span>
          )}
        </div>
        <div className="process-steps">
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
