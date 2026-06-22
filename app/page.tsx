"use client";

import Image from "next/image";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { contentBg } from "../constants/content-bg";
import { contentEn } from "../constants/content-en";
import {
  type BlogPost,
  defaultLocale,
  type Destination,
  languageOptions,
  type Locale,
} from "../constants/content";

const contentByLocale = {
  bg: contentBg,
  en: contentEn,
} as const;

const localeStorageKey = "barakova-luxury-travel-locale";
const contactEmail = "bbmobile6666@gmail.com";
const contactPhoneHref = "tel:+359883770909";
const whatsappHref = "https://wa.me/359883770909";
const viberHref = "viber://chat?number=%2B359883770909";
// TODO: Replace this fallback after all destination photos are uploaded.
const destinationImageFallback = "/hero-bogdana-beach.jpeg";
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

function DestinationImage({
  alt,
  src,
}: {
  alt: string;
  src: string;
}) {
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
      className="destination-image"
      onError={() => setImageSrc(destinationImageFallback)}
    />
  );
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formValues, setFormValues] =
    useState<ContactFormValues>(initialFormValues);
  const [formErrors, setFormErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(
    null,
  );
  const content = useMemo(() => contentByLocale[locale], [locale]);
  const menuLabel = locale === "bg" ? "Меню" : "Menu";
  const closeMenuLabel = locale === "bg" ? "Затвори менюто" : "Close menu";
  const requiredLabel = content.contact.requiredMark;

  useEffect(() => {
    const savedLocale = window.localStorage.getItem(localeStorageKey);

    if (savedLocale === "bg" || savedLocale === "en") {
      setLocale(savedLocale);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(localeStorageKey, locale);
    document.documentElement.lang = locale;
    setSelectedDestination(null);
    setSelectedBlogPost(null);
  }, [locale]);

  useEffect(() => {
    if (!selectedDestination && !selectedBlogPost) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedDestination(null);
        setSelectedBlogPost(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedDestination, selectedBlogPost]);

  const scrollToContact = () => {
    setIsMenuOpen(false);
    setSelectedDestination(null);
    setSelectedBlogPost(null);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

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

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const updateFormValue = (
    field: keyof ContactFormValues,
    value: string,
  ) => {
    setFormValues((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({
      ...current,
      ...(field === "fullName" ||
      field === "email" ||
      field === "phone"
        ? { [field]: undefined }
        : {}),
      form: undefined,
    }));
  };

  const handleContactSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
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
        body: JSON.stringify({ ...formValues, locale }),
      });

      if (!response.ok) {
        throw new Error("Contact request failed");
      }

      setIsSubmitted(true);
      setFormValues(initialFormValues);
      setFormErrors({});
    } catch {
      setFormErrors({ form: content.contact.validation.submitError });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--ivory)] text-[var(--charcoal)]">
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4 lg:px-10">
        <nav className="site-header mx-auto max-w-7xl">
          <a className="brand-lockup" href="#home">
            <span>{content.brand.name}</span>
            <small>{content.brand.subtitle}</small>
          </a>

          <div
            className="header-nav"
            aria-label={
              locale === "bg" ? "Основна навигация" : "Primary navigation"
            }
          >
            {content.navItems.map((item) => (
              <a href={item.href} key={item.label}>
                {item.label}
              </a>
            ))}
          </div>

          <div className="header-actions">
            <div
              className="language-switcher"
              aria-label={locale === "bg" ? "Избор на език" : "Language"}
            >
              {languageOptions.map((option, index) => (
                <span className="language-option" key={option.locale}>
                  {index > 0 && <span className="language-divider">|</span>}
                  <button
                    aria-pressed={locale === option.locale}
                    className={locale === option.locale ? "is-active" : ""}
                    onClick={() => {
                      setLocale(option.locale);
                      setIsMenuOpen(false);
                    }}
                    type="button"
                  >
                    <span aria-hidden="true" className="language-flag">
                      {option.flag}
                    </span>
                    {option.label}
                  </button>
                </span>
              ))}
            </div>

            <button
              className="btn-primary header-cta"
              onClick={scrollToContact}
              type="button"
            >
              {content.headerCta}
            </button>

            <button
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? closeMenuLabel : menuLabel}
              className="menu-toggle"
              onClick={() => setIsMenuOpen((current) => !current)}
              type="button"
            >
              <span />
              <span />
            </button>
          </div>

          <div
            className={`mobile-menu ${isMenuOpen ? "is-open" : ""}`}
            id="mobile-menu"
          >
            {content.navItems.map((item) => (
              <a
                href={item.href}
                key={item.label}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <button
              className="btn-primary mobile-menu-cta"
              onClick={scrollToContact}
              type="button"
            >
              {content.headerCta}
            </button>
          </div>
        </nav>
      </header>

      <section
        id="home"
        className="hero-section relative min-h-[94svh] px-5 pb-14 pt-40 text-[var(--charcoal)] sm:min-h-[92svh] sm:px-8 sm:pt-36 lg:min-h-[96svh] lg:px-12"
      >
        <Image
          src="/hero-bogdana-beach.jpeg"
          alt={content.imageAlts.hero}
          fill
          priority
          quality={90}
          sizes="100vw"
          className="hero-image"
        />
        <div className="hero-soft-overlay absolute inset-0" />
        <div className="hero-gradient-overlay absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[var(--ivory)] to-transparent" />

        <div className="hero-inner relative z-10 mx-auto flex min-h-[68svh] max-w-7xl items-center justify-center text-center sm:min-h-[66svh] lg:min-h-[72svh] lg:justify-start lg:text-left">
          <div className="hero-copy max-w-3xl animate-rise rounded-[1.6rem] bg-white/24 p-4 backdrop-blur-[2px] sm:rounded-[2rem] sm:p-5 lg:bg-transparent lg:p-0 lg:backdrop-blur-0">
            <p className="hero-label mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[var(--soft-brown)] sm:mb-5 sm:text-sm sm:tracking-[0.32em]">
              {content.hero.label}
            </p>
            <h1 className="hero-title font-serif text-[2.45rem] leading-[1.03] text-balance sm:text-6xl lg:text-7xl">
              {content.hero.title}
            </h1>
            <p className="hero-subtitle mt-5 max-w-2xl text-base leading-7 text-[rgba(45,42,38,0.76)] sm:mt-6 sm:text-xl sm:leading-8">
              {content.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:justify-center lg:justify-start">
              <button
                className="btn-primary"
                onClick={scrollToContact}
                type="button"
              >
                {content.hero.primaryCta}
              </button>
              <button className="btn-secondary" type="button">
                {content.hero.secondaryCta}
              </button>
            </div>
          </div>
        </div>
      </section>

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

      <section className="section-shell" id="destinations">
        <div className="section-heading">
          <p>{content.destinationsSection.eyebrow}</p>
          <h2>{content.destinationsSection.title}</h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {content.destinations.map((destination) => (
            <button
              aria-label={`${content.destinationModal.eyebrow}: ${destination.name}`}
              className="destination-card"
              key={destination.name}
              onClick={() => setSelectedDestination(destination)}
              type="button"
            >
              <div className="destination-media">
                <DestinationImage
                  alt={destination.name}
                  src={destination.image}
                />
                <div className="destination-overlay" />
                <div className="destination-content">
                  <h3>{destination.name}</h3>
                  <span />
                  <p>{destination.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="section-shell" id="cruises">
        <div className="section-heading">
          <p>{content.cruisesSection.eyebrow}</p>
          <h2>{content.cruisesSection.title}</h2>
          {content.cruisesSection.description && (
            <span>{content.cruisesSection.description}</span>
          )}
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.cruises.map((cruise) => (
            <button
              aria-label={`${content.destinationModal.eyebrow}: ${cruise.name}`}
              className="destination-card cruise-card"
              key={cruise.name}
              onClick={() => setSelectedDestination(cruise)}
              type="button"
            >
              <div className="destination-media">
                <DestinationImage alt={cruise.name} src={cruise.image} />
                <div className="destination-overlay" />
                <div className="destination-content">
                  <h3>{cruise.name}</h3>
                  <span />
                  <p>{cruise.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

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

      <section className="section-shell" id="about">
        <div className="about-panel profile-panel grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div className="profile-gallery">
            <div className="profile-photo profile-photo-main">
              <Image
                src="/images/barakova-1.jpg"
                alt={content.imageAlts.profileMain}
                fill
                sizes="(min-width: 1024px) 42vw, (min-width: 640px) 82vw, 92vw"
                className="profile-image"
              />
            </div>
            <div className="profile-photo profile-photo-secondary">
              <Image
                src="/images/barakova-2.jpg"
                alt={content.imageAlts.profileSecondary}
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 640px) 82vw, 0vw"
                className="profile-image"
              />
            </div>
          </div>
          <div className="profile-content">
            <p className="eyebrow">{content.about.eyebrow}</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
              {content.about.title}
            </h2>
            <p className="about-intro mt-5">{content.about.intro}</p>
            <div className="about-copy mt-5 space-y-4 text-base leading-7 text-[rgba(45,42,38,0.72)] sm:text-lg sm:leading-8">
              {content.about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mission-card mt-7">
              <p>{content.about.mission}</p>
            </div>
            <div className="profile-stats mt-7">
              {content.profileStats.map((stat) => (
                <div className="profile-stat" key={stat}>
                  <span />
                  <p>{stat}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {content.about.tags.map((tag) => (
                <span className="about-pill" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="signature-section section-shell">
        <div className="section-divider" />
        <blockquote className="story-quote">
          {content.signature.storyQuote}
        </blockquote>
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
                  src={destination.image}
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

      <section className="blog-section section-shell" id="blog">
        <div className="section-heading">
          <p>{content.blogSection.eyebrow}</p>
          <h2>{content.blogSection.title}</h2>
          {content.blogSection.description && (
            <span>{content.blogSection.description}</span>
          )}
        </div>

        <div className="blog-grid mt-12">
          {content.blog.posts.map((post) => (
            <button
              aria-label={`${content.blog.readMoreLabel}: ${post.title}`}
              className="blog-card"
              key={post.title}
              onClick={() => setSelectedBlogPost(post)}
              type="button"
            >
              <div className="blog-card-image">
                <DestinationImage alt={post.title} src={post.image} />
              </div>
              <div className="blog-card-copy">
                <span>{post.category}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <small>
                  {post.date} · {post.readTime}
                </small>
              </div>
            </button>
          ))}
        </div>
      </section>

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
                    {formErrors.fullName && (
                      <small>{formErrors.fullName}</small>
                    )}
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

                <label aria-hidden="true" className="honeypot-field" hidden>
                  <span>{content.contact.fields.honeypot}</span>
                  <input
                    autoComplete="off"
                    aria-hidden="true"
                    name="website"
                    onChange={(event) =>
                      updateFormValue("website", event.target.value)
                    }
                    tabIndex={-1}
                    type="text"
                    value={formValues.website}
                  />
                </label>

                {formErrors.form && (
                  <p className="form-submit-error">{formErrors.form}</p>
                )}

                <button
                  className="btn-primary form-submit"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? content.contact.submitting : content.contact.submit}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="site-footer px-5 pb-8 sm:px-8 lg:px-12">
        <div className="footer-divider mx-auto max-w-7xl" />
        <p className="footer-quote mx-auto max-w-4xl">
          {content.footer.quote}
        </p>

        <div className="footer-panel mx-auto max-w-7xl">
          <div className="footer-brand">
            <h2>{content.brand.name}</h2>
            <p>{content.footer.brandText}</p>
          </div>

          <div className="footer-column">
            <h3>{content.footer.navigationTitle}</h3>
            <div className="footer-links">
              {content.navItems.map((item) => (
                <a href={item.href} key={item.label}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-column">
            <h3>{content.footer.contactsTitle}</h3>
            <div className="footer-contact-meta">
              <a href={`mailto:${contactEmail}`}>
                {content.footer.contacts.email}
              </a>
              <a href={contactPhoneHref}>
                {content.footer.contacts.phone}
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom mx-auto max-w-7xl">
          <div>
            <p>{content.footer.copyright}</p>
            <p>{content.footer.rights}</p>
          </div>
          <a
            className="developer-credit"
            href="https://github.com/BobbyUzunov"
            rel="noreferrer"
            target="_blank"
          >
            {content.footer.developerCredit}
          </a>
        </div>
      </footer>

      <div
        className="floating-contact-buttons"
        aria-label={locale === "bg" ? "Бърз контакт" : "Quick contact"}
      >
        <a
          aria-label="WhatsApp"
          className="floating-contact-button whatsapp-button"
          href={whatsappHref}
          rel="noreferrer"
          target="_blank"
        >
          <img alt="" src="/icons/whatsapp.svg" />
        </a>
        <a
          aria-label="Viber"
          className="floating-contact-button viber-button"
          href={viberHref}
        >
          <img alt="" src="/icons/viber.svg" />
        </a>
      </div>

      {selectedDestination && (
        <div
          aria-modal="true"
          className="destination-modal-backdrop"
          onClick={() => setSelectedDestination(null)}
          role="dialog"
        >
          <div
            className="destination-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label={content.destinationModal.closeLabel}
              className="destination-modal-close"
              onClick={() => setSelectedDestination(null)}
              type="button"
            >
              ×
            </button>

            <div className="destination-modal-hero">
              <Image
                alt={selectedDestination.name}
                className="destination-modal-image"
                fill
                sizes="(min-width: 1024px) 58vw, 94vw"
                src={selectedDestination.image}
              />
              <div className="destination-modal-overlay" />
              <div className="destination-modal-title">
                <span>{content.destinationModal.eyebrow}</span>
                <h2>{selectedDestination.name}</h2>
                <p>{selectedDestination.description}</p>
              </div>
            </div>

            <div className="destination-modal-body">
              <div className="destination-modal-copy">
                <p>{selectedDestination.detail}</p>
                <div className="destination-modal-highlights">
                  <h3>{content.destinationModal.highlightsTitle}</h3>
                  <ul>
                    {selectedDestination.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </div>
                <button
                  className="btn-primary destination-modal-cta"
                  onClick={scrollToContact}
                  type="button"
                >
                  {content.destinationModal.cta}
                </button>
              </div>

              <div className="destination-modal-gallery">
                <h3>{content.destinationModal.galleryTitle}</h3>
                <div>
                  {selectedDestination.gallery.map((image, index) => (
                    <div className="destination-gallery-item" key={image}>
                      <Image
                        alt={`${selectedDestination.name} ${index + 1}`}
                        className="destination-modal-image"
                        fill
                        sizes="(min-width: 1024px) 16vw, (min-width: 640px) 28vw, 44vw"
                        src={image}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedBlogPost && (
        <div
          aria-modal="true"
          className="destination-modal-backdrop"
          onClick={() => setSelectedBlogPost(null)}
          role="dialog"
        >
          <article
            className="blog-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label={content.blog.closeLabel}
              className="destination-modal-close"
              onClick={() => setSelectedBlogPost(null)}
              type="button"
            >
              ×
            </button>

            <div className="blog-modal-image">
              <Image
                alt={selectedBlogPost.title}
                className="destination-modal-image"
                fill
                sizes="(min-width: 1024px) 56vw, 94vw"
                src={selectedBlogPost.image}
              />
            </div>

            <div className="blog-modal-body">
              <div className="blog-modal-meta">
                <span>{selectedBlogPost.category}</span>
                <small>
                  {selectedBlogPost.date} · {selectedBlogPost.readTime}
                </small>
              </div>
              <h2>{selectedBlogPost.title}</h2>
              <p className="blog-modal-excerpt">{selectedBlogPost.excerpt}</p>
              <div className="blog-modal-copy">
                {selectedBlogPost.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}
