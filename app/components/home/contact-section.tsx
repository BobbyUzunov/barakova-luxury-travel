"use client";

import { type FormEvent, useState } from "react";
import type { Locale, SiteContent } from "../../../constants/content";
import {
  contactPhoneDisplay,
  contactPhoneHref,
  getCallAriaLabel,
} from "../../../constants/site";
import {
  isTurnstileConfigured,
  TurnstileWidget,
} from "../turnstile-widget";

const initialFormValues = {
  fullName: "",
  email: "",
  phone: "",
  destination: "",
  travelPeriod: "",
  travelers: "",
  budget: "",
  message: "",
  website: "",
};

type ContactFormValues = typeof initialFormValues;
type ContactFormErrors = Partial<
  Record<"fullName" | "email" | "phone" | "form", string>
>;

type ContactSectionProps = {
  content: SiteContent;
  locale: Locale;
};

export function ContactSection({ content, locale }: ContactSectionProps) {
  const [formValues, setFormValues] =
    useState<ContactFormValues>(initialFormValues);
  const [formErrors, setFormErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const requiredLabel = content.contact.requiredMark;

  const validateForm = () => {
    const nextErrors: ContactFormErrors = {};

    if (!formValues.fullName.trim()) {
      nextErrors.fullName = content.contact.validation.fullName;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email.trim())) {
      nextErrors.email = content.contact.validation.email;
    }

    if (!formValues.phone.trim()) {
      nextErrors.phone = content.contact.validation.phone;
    }

    if (isTurnstileConfigured() && !turnstileToken) {
      nextErrors.form = content.contact.validation.captcha;
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const updateFormValue = (field: keyof ContactFormValues, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({
      ...current,
      ...(field === "fullName" || field === "email" || field === "phone"
        ? { [field]: undefined }
        : {}),
      form: undefined,
    }));
  };

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formValues,
          locale,
          ...(turnstileToken ? { turnstileToken } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error("Contact request failed");
      }

      setIsSubmitted(true);
      setFormValues(initialFormValues);
      setTurnstileToken("");
      setFormErrors({});
    } catch {
      setTurnstileToken("");
      setFormErrors({ form: content.contact.validation.submitError });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="contact-section px-5 pb-8 sm:px-8 lg:px-12" id="contact">
      <div className="contact-panel mx-auto max-w-7xl">
        <div className="contact-intro">
          <p className="eyebrow">{content.contact.eyebrow}</p>
          <h2>{content.contact.title}</h2>
          <p>{content.contact.subtitle}</p>

          <div className="contact-trust-card">
            <h3>{content.contact.trustTitle}</h3>
            <div className="contact-trust-grid">
              {content.contact.trustItems.map((item) => (
                <div className="contact-trust-item" key={item}>
                  <span>✓</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="contact-form-shell">
          <div className="contact-phone-callout">
            <h3>{content.contact.phoneCallout.title}</h3>
            <p>
              {content.contact.phoneCallout.lead}{" "}
              <a
                aria-label={getCallAriaLabel(locale)}
                className="contact-phone-link"
                href={contactPhoneHref}
              >
                {contactPhoneDisplay}
              </a>{" "}
              {content.contact.phoneCallout.trail}
            </p>
          </div>

          {isSubmitted ? (
            <div className="success-card" role="status">
              <span>✓</span>
              <h3>{content.contact.success.title}</h3>
              <p>{content.contact.success.message}</p>
              <button
                className="btn-secondary"
                onClick={() => setIsSubmitted(false)}
                type="button"
              >
                {content.contact.success.reset}
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleContactSubmit}>
              <div className="form-grid">
                <label>
                  <span>
                    {content.contact.fields.fullName} {requiredLabel}
                  </span>
                  <input
                    aria-invalid={Boolean(formErrors.fullName)}
                    autoComplete="name"
                    name="fullName"
                    onChange={(event) =>
                      updateFormValue("fullName", event.target.value)
                    }
                    type="text"
                    value={formValues.fullName}
                  />
                  {formErrors.fullName && <small>{formErrors.fullName}</small>}
                </label>

                <label>
                  <span>
                    {content.contact.fields.email} {requiredLabel}
                  </span>
                  <input
                    aria-invalid={Boolean(formErrors.email)}
                    autoComplete="email"
                    name="email"
                    onChange={(event) =>
                      updateFormValue("email", event.target.value)
                    }
                    type="email"
                    value={formValues.email}
                  />
                  {formErrors.email && <small>{formErrors.email}</small>}
                </label>

                <label>
                  <span>
                    {content.contact.fields.phone} {requiredLabel}
                  </span>
                  <input
                    aria-invalid={Boolean(formErrors.phone)}
                    autoComplete="tel"
                    name="phone"
                    onChange={(event) =>
                      updateFormValue("phone", event.target.value)
                    }
                    type="tel"
                    value={formValues.phone}
                  />
                  {formErrors.phone && <small>{formErrors.phone}</small>}
                </label>

                <label>
                  <span>{content.contact.fields.destination}</span>
                  <input
                    name="destination"
                    onChange={(event) =>
                      updateFormValue("destination", event.target.value)
                    }
                    type="text"
                    value={formValues.destination}
                  />
                </label>

                <label>
                  <span>{content.contact.fields.travelPeriod}</span>
                  <input
                    name="travelPeriod"
                    onChange={(event) =>
                      updateFormValue("travelPeriod", event.target.value)
                    }
                    type="text"
                    value={formValues.travelPeriod}
                  />
                </label>

                <label>
                  <span>{content.contact.fields.travelers}</span>
                  <input
                    min="1"
                    name="travelers"
                    onChange={(event) =>
                      updateFormValue("travelers", event.target.value)
                    }
                    type="number"
                    value={formValues.travelers}
                  />
                </label>

                <label className="form-grid-wide">
                  <span>{content.contact.fields.budget}</span>
                  <input
                    name="budget"
                    onChange={(event) =>
                      updateFormValue("budget", event.target.value)
                    }
                    type="text"
                    value={formValues.budget}
                  />
                </label>
              </div>

              <label className="form-message">
                <span>{content.contact.fields.message}</span>
                <textarea
                  name="message"
                  onChange={(event) =>
                    updateFormValue("message", event.target.value)
                  }
                  placeholder={content.contact.placeholders.message}
                  rows={5}
                  value={formValues.message}
                />
              </label>

              <div aria-hidden="true" className="honeypot-field">
                <input
                  autoComplete="off"
                  aria-hidden="true"
                  id="website"
                  name="website"
                  onChange={(event) =>
                    updateFormValue("website", event.target.value)
                  }
                  tabIndex={-1}
                  type="text"
                  value={formValues.website}
                />
              </div>

              <TurnstileWidget
                onExpire={() => setTurnstileToken("")}
                onTokenChange={setTurnstileToken}
              />

              {formErrors.form && (
                <p className="form-submit-error">{formErrors.form}</p>
              )}

              <button
                className="btn-primary form-submit"
                disabled={
                  isSubmitting || (isTurnstileConfigured() && !turnstileToken)
                }
                type="submit"
              >
                {isSubmitting
                  ? content.contact.submitting
                  : content.contact.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
