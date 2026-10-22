import type { SiteContent } from "../../../../constants/content";

type ProcessSectionProps = {
  content: SiteContent;
};

function formatStepNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

export function ProcessSection({ content }: ProcessSectionProps) {
  return (
    <section className="section-shell process-section" id="process">
      <div className="section-heading process-section-heading">
        <p>{content.processSection.eyebrow}</p>
        <h2>{content.processSection.title}</h2>
        {content.processSection.description && (
          <span>{content.processSection.description}</span>
        )}
      </div>
      <ol className="process-steps">
        {content.steps.map((step, index) => (
          <li className="process-step" key={step.title}>
            <span aria-hidden="true" className="process-step-marker">
              {formatStepNumber(index)}
            </span>
            <div className="process-step-copy">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
