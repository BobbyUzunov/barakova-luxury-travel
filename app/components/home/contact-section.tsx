"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Locale, SiteContent } from "../../../constants/content";
import {
  contactPhoneDisplay,
  contactPhoneHref,
  getCallAriaLabel,
} from "../../../constants/site";
import { maxMessageLength } from "../../../lib/contact";
import {
  clearContactFormDraft,
  markContactFormDraftApplied,
  readContactFormDraft,
  subscribeContactFormDraft,
  type ContactFormDraft,
} from "../../../lib/contact-form-draft";
import {
  localTodayIso,
  validateTravelDates,
} from "../../../lib/contact-dates";
import { resetTurnstileChallenge } from "../../../lib/turnstile-reset";
import {
  applyHandoffFieldsToFormValues,
  mergeMessageWithSummary,
} from "../../../lib/travel-summary";
import {
  isTurnstileConfigured,
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from "../turnstile-widget";

const initialFormValues = {
  fullName: "",
  email: "",
  phone: "",
  destination: "",
  travelStartDate: "",
  travelEndDate: "",
  datesFlexible: false,
  travelers: "",
  budget: "",
  message: "",
  website: "",
};

type ContactFormValues = typeof initialFormValues;
type ContactFormErrors = Partial<
  Record<
    | "fullName"
    | "email"
    | "phone"
    | "travelStartDate"
    | "travelEndDate"
    | "message"
    | "form",
    string
  >
>;

type ContactSectionProps = {
  content: SiteContent;
  locale: Locale;
};

export function ContactSection({ content, locale }: ContactSectionProps) {
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const handoffNoticeRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const fullNameInputRef = useRef<HTMLInputElement>(null);
  const appliedDraftIdsRef = useRef<Set<string>>(new Set());
  const touchedFieldsRef = useRef<Set<string>>(new Set());
  const [formValues, setFormValues] =
    useState<ContactFormValues>(initialFormValues);
  const [formErrors, setFormErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [handoffNoticeVisible, setHandoffNoticeVisible] = useState(false);
  const [handoffMessageTooLong, setHandoffMessageTooLong] = useState(false);
  const [handoffConflictDraft, setHandoffConflictDraft] =
    useState<ContactFormDraft | null>(null);
  const requiredLabel = content.contact.requiredMark;
  const fullNameErrorId = useId();
  const emailErrorId = useId();
  const phoneErrorId = useId();
  const startDateErrorId = useId();
  const endDateErrorId = useId();
  const messageErrorId = useId();
  const formErrorId = useId();
  const dateHelpId = useId();
  const handoffNoticeId = useId();
  const minStartDate = useMemo(() => localTodayIso(), []);

  const resetTurnstile = () => {
    resetTurnstileChallenge(
      () => setTurnstileToken(""),
      () => turnstileRef.current?.reset(),
    );
  };

  const focusAfterHandoff = useCallback(() => {
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      handoffNoticeRef.current?.focus({ preventScroll: true });
    });
  }, []);

  const applyDraft = useCallback(
    (draft: ContactFormDraft, options?: { forceReplaceMessage?: boolean }) => {
      if (appliedDraftIdsRef.current.has(draft.id) && !options?.forceReplaceMessage) {
        return;
      }

      appliedDraftIdsRef.current.add(draft.id);

      setFormValues((current) => {
        const fieldResult = applyHandoffFieldsToFormValues(
          current,
          draft.fields,
          touchedFieldsRef.current,
        );
        const merge = mergeMessageWithSummary({
          existing: fieldResult.next.message,
          summaryBlock: draft.summaryBlock,
          fingerprint: draft.summaryFingerprint,
          locale,
          forceReplace: options?.forceReplaceMessage === true,
        });

        if (merge.status === "conflict") {
          setHandoffConflictDraft(draft);
          setHandoffMessageTooLong(false);
          setHandoffNoticeVisible(fieldResult.filledKeys.length > 0);
          return fieldResult.next;
        }

        if (merge.status === "too-long") {
          setHandoffConflictDraft(null);
          setHandoffMessageTooLong(true);
          // Fields may still be filled; do not claim the summary was added.
          setHandoffNoticeVisible(false);
          return fieldResult.next;
        }

        setHandoffConflictDraft(null);
        setHandoffMessageTooLong(false);
        const summaryApplied =
          merge.summaryAdded &&
          (merge.status === "appended" ||
            merge.status === "replaced" ||
            merge.status === "already-present");
        if (summaryApplied || fieldResult.filledKeys.length > 0) {
          setHandoffNoticeVisible(true);
        }

        return {
          ...fieldResult.next,
          message: merge.message,
        };
      });

      markContactFormDraftApplied(locale);
      focusAfterHandoff();
    },
    [focusAfterHandoff, locale],
  );

  const tryConsumeDraft = useCallback(() => {
    const draft = readContactFormDraft(locale);
    if (!draft || draft.applied) {
      return;
    }
    if (appliedDraftIdsRef.current.has(draft.id)) {
      return;
    }
    applyDraft(draft);
  }, [applyDraft, locale]);

  useEffect(() => {
    tryConsumeDraft();
    return subscribeContactFormDraft(() => {
      tryConsumeDraft();
    });
  }, [tryConsumeDraft]);

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

    const dates = validateTravelDates({
      travelStartDate: formValues.travelStartDate,
      travelEndDate: formValues.travelEndDate,
      datesFlexible: formValues.datesFlexible,
    });

    if (!dates.ok) {
      if (dates.error === "invalid-start" || dates.error === "start-in-past") {
        nextErrors.travelStartDate =
          dates.error === "start-in-past"
            ? content.contact.validation.travelStartInPast
            : content.contact.validation.travelStartDate;
      } else if (dates.error === "invalid-end") {
        nextErrors.travelEndDate = content.contact.validation.travelEndDate;
      } else if (dates.error === "end-before-start") {
        nextErrors.travelEndDate =
          content.contact.validation.travelEndBeforeStart;
      }
    }

    if (formValues.message.length > maxMessageLength) {
      nextErrors.message = content.contact.validation.messageTooLong;
    }

    if (isTurnstileConfigured() && !turnstileToken) {
      nextErrors.form = content.contact.validation.captcha;
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const updateFormValue = <K extends keyof ContactFormValues>(
    field: K,
    value: ContactFormValues[K],
  ) => {
    if (
      field === "destination" ||
      field === "travelStartDate" ||
      field === "travelEndDate" ||
      field === "datesFlexible" ||
      field === "travelers" ||
      field === "budget" ||
      field === "message"
    ) {
      touchedFieldsRef.current.add(field);
    }

    setFormValues((current) => ({ ...current, [field]: value }));
    if (field === "message") {
      setHandoffMessageTooLong(false);
    }
    setFormErrors((current) => ({
      ...current,
      ...(field === "fullName" ||
      field === "email" ||
      field === "phone" ||
      field === "travelStartDate" ||
      field === "travelEndDate" ||
      field === "message"
        ? { [field]: undefined }
        : {}),
      ...(field === "datesFlexible" ||
      field === "travelStartDate" ||
      field === "travelEndDate"
        ? { travelStartDate: undefined, travelEndDate: undefined }
        : {}),
      form: undefined,
    }));
  };

  const handleReplaceSummary = () => {
    if (!handoffConflictDraft) {
      return;
    }
    applyDraft(handoffConflictDraft, { forceReplaceMessage: true });
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
          fullName: formValues.fullName,
          email: formValues.email,
          phone: formValues.phone,
          destination: formValues.destination,
          travelStartDate: formValues.travelStartDate || undefined,
          travelEndDate: formValues.travelEndDate || undefined,
          datesFlexible: formValues.datesFlexible,
          travelers: formValues.travelers,
          budget: formValues.budget,
          message: formValues.message,
          website: formValues.website,
          locale,
          ...(turnstileToken ? { turnstileToken } : {}),
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        resetTurnstile();
        setFormErrors({
          form: data?.message || content.contact.validation.submitError,
        });
        return;
      }

      clearContactFormDraft();
      touchedFieldsRef.current = new Set();
      setHandoffNoticeVisible(false);
      setHandoffMessageTooLong(false);
      setHandoffConflictDraft(null);
      setIsSubmitted(true);
      setFormValues(initialFormValues);
      resetTurnstile();
      setFormErrors({});
    } catch {
      resetTurnstile();
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
            <form
              className="contact-form"
              noValidate
              onSubmit={handleContactSubmit}
              ref={formRef}
            >
              {handoffNoticeVisible ? (
                <div
                  className="contact-handoff-notice"
                  id={handoffNoticeId}
                  ref={handoffNoticeRef}
                  role="status"
                  tabIndex={-1}
                >
                  <p>{content.contact.handoffAppliedNotice}</p>
                </div>
              ) : null}

              {handoffMessageTooLong ? (
                <div className="contact-handoff-conflict" role="status">
                  <p>{content.contact.handoffMessageTooLongNotice}</p>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      messageInputRef.current?.focus();
                      messageInputRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                    }}
                    type="button"
                  >
                    {content.contact.handoffEditMessage}
                  </button>
                </div>
              ) : null}

              {handoffConflictDraft ? (
                <div className="contact-handoff-conflict" role="status">
                  <p>{content.contact.handoffConflictNotice}</p>
                  <button
                    className="btn-secondary"
                    onClick={handleReplaceSummary}
                    type="button"
                  >
                    {content.contact.handoffReplaceSummary}
                  </button>
                </div>
              ) : null}

              <div className="form-grid">
                <label>
                  <span>
                    {content.contact.fields.fullName} {requiredLabel}
                  </span>
                  <input
                    aria-describedby={
                      formErrors.fullName ? fullNameErrorId : undefined
                    }
                    aria-invalid={Boolean(formErrors.fullName)}
                    autoComplete="name"
                    name="fullName"
                    onChange={(event) =>
                      updateFormValue("fullName", event.target.value)
                    }
                    ref={fullNameInputRef}
                    type="text"
                    value={formValues.fullName}
                  />
                  {formErrors.fullName && (
                    <small id={fullNameErrorId}>{formErrors.fullName}</small>
                  )}
                </label>

                <label>
                  <span>
                    {content.contact.fields.email} {requiredLabel}
                  </span>
                  <input
                    aria-describedby={
                      formErrors.email ? emailErrorId : undefined
                    }
                    aria-invalid={Boolean(formErrors.email)}
                    autoComplete="email"
                    name="email"
                    onChange={(event) =>
                      updateFormValue("email", event.target.value)
                    }
                    type="email"
                    value={formValues.email}
                  />
                  {formErrors.email && (
                    <small id={emailErrorId}>{formErrors.email}</small>
                  )}
                </label>

                <label>
                  <span>
                    {content.contact.fields.phone} {requiredLabel}
                  </span>
                  <input
                    aria-describedby={
                      formErrors.phone ? phoneErrorId : undefined
                    }
                    aria-invalid={Boolean(formErrors.phone)}
                    autoComplete="tel"
                    name="phone"
                    onChange={(event) =>
                      updateFormValue("phone", event.target.value)
                    }
                    type="tel"
                    value={formValues.phone}
                  />
                  {formErrors.phone && (
                    <small id={phoneErrorId}>{formErrors.phone}</small>
                  )}
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
                  <span>{content.contact.fields.travelStartDate}</span>
                  <input
                    aria-describedby={
                      formErrors.travelStartDate
                        ? `${dateHelpId} ${startDateErrorId}`
                        : dateHelpId
                    }
                    aria-invalid={Boolean(formErrors.travelStartDate)}
                    className="contact-date-input"
                    min={minStartDate}
                    name="travelStartDate"
                    onChange={(event) =>
                      updateFormValue("travelStartDate", event.target.value)
                    }
                    type="date"
                    value={formValues.travelStartDate}
                  />
                  {formErrors.travelStartDate && (
                    <small id={startDateErrorId}>
                      {formErrors.travelStartDate}
                    </small>
                  )}
                </label>

                <label>
                  <span>{content.contact.fields.travelEndDate}</span>
                  <input
                    aria-describedby={
                      formErrors.travelEndDate
                        ? `${dateHelpId} ${endDateErrorId}`
                        : dateHelpId
                    }
                    aria-invalid={Boolean(formErrors.travelEndDate)}
                    className="contact-date-input"
                    min={formValues.travelStartDate || minStartDate}
                    name="travelEndDate"
                    onChange={(event) =>
                      updateFormValue("travelEndDate", event.target.value)
                    }
                    type="date"
                    value={formValues.travelEndDate}
                  />
                  {formErrors.travelEndDate && (
                    <small id={endDateErrorId}>{formErrors.travelEndDate}</small>
                  )}
                </label>

                <label className="form-grid-wide contact-dates-flexible">
                  <span className="contact-checkbox-row">
                    <input
                      checked={formValues.datesFlexible}
                      name="datesFlexible"
                      onChange={(event) =>
                        updateFormValue("datesFlexible", event.target.checked)
                      }
                      type="checkbox"
                    />
                    <span>{content.contact.fields.datesFlexible}</span>
                  </span>
                </label>

                <p className="form-grid-wide contact-date-help" id={dateHelpId}>
                  {content.contact.dateHelp}
                </p>

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
                  aria-describedby={
                    formErrors.message ? messageErrorId : undefined
                  }
                  aria-invalid={Boolean(formErrors.message)}
                  maxLength={maxMessageLength}
                  name="message"
                  onChange={(event) =>
                    updateFormValue("message", event.target.value)
                  }
                  placeholder={content.contact.placeholders.message}
                  ref={messageInputRef}
                  rows={5}
                  value={formValues.message}
                />
                {formErrors.message && (
                  <small id={messageErrorId}>{formErrors.message}</small>
                )}
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
                ref={turnstileRef}
                onExpire={() => setTurnstileToken("")}
                onTokenChange={setTurnstileToken}
              />

              {formErrors.form && (
                <p className="form-submit-error" id={formErrorId} role="alert">
                  {formErrors.form}
                </p>
              )}

              <button
                aria-describedby={formErrors.form ? formErrorId : undefined}
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
