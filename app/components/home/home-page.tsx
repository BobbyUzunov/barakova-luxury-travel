"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { contentBg } from "../../../constants/content-bg";
import { contentEn } from "../../../constants/content-en";
import {
  type Locale,
  type SiteContent,
} from "../../../constants/content";
import {
  heroImage,
  profileMainImage,
  profileSecondaryImage,
} from "../../../constants/images";
import { localePath } from "../../../constants/i18n";
import {
  contactPhoneHref,
  getCallAriaLabel,
} from "../../../constants/site";
import {
  getBlogSlug,
  getCruiseSlug,
  getDestinationSlug,
} from "../../../constants/seo-content";
import { ContactSection } from "./contact-section";
import { DestinationImage } from "./destination-image";
import { HeroBackground } from "./hero-background";
import { MobileFloatingContact } from "./mobile-floating-contact";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

const contentByLocale = {
  bg: contentBg,
  en: contentEn,
} as const;

type HomePageProps = {
  locale: Locale;
};

export function HomePage({ locale }: HomePageProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [heroVideoActive, setHeroVideoActive] = useState(false);

  const content = useMemo<SiteContent>(
    () => contentByLocale[locale],
    [locale],
  );
  const menuLabel = locale === "bg" ? "Меню" : "Menu";
  const closeMenuLabel = locale === "bg" ? "Затвори менюто" : "Close menu";

  const scrollToContact = () => {
    setIsMenuOpen(false);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToDestinations = () => {
    setIsMenuOpen(false);
    document
      .getElementById("destinations")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLocaleChange = (nextLocale: Locale) => {
    setIsMenuOpen(false);
    router.push(localePath(nextLocale));
  };

  return (
    <main className="min-h-screen overflow-x-clip bg-[var(--ivory)] text-[var(--charcoal)]">
      <SiteHeader
        closeMenuLabel={closeMenuLabel}
        content={content}
        isMenuOpen={isMenuOpen}
        locale={locale}
        menuLabel={menuLabel}
        onLocaleChange={handleLocaleChange}
        onMenuToggle={() => setIsMenuOpen((current) => !current)}
        onNavigate={() => setIsMenuOpen(false)}
        scrollToContact={scrollToContact}
      />

      <section
        id="home"
        className={`hero-section relative overflow-hidden min-h-[94svh] px-5 pb-14 pt-40 text-[var(--charcoal)] sm:min-h-[92svh] sm:px-8 sm:pt-36 lg:min-h-[96svh] lg:px-12${heroVideoActive ? " hero-section--video" : ""}`}
      >
        <HeroBackground
          imageAlt={content.imageAlts.hero}
          imageSrc={heroImage}
          onVideoActiveChange={setHeroVideoActive}
        />
        <div
          className={`hero-soft-overlay absolute inset-0${heroVideoActive ? " hero-soft-overlay--video" : ""}`}
        />
        <div
          className={`hero-gradient-overlay absolute inset-0${heroVideoActive ? " hero-gradient-overlay--video" : ""}`}
        />
        <div className="hero-bottom-fade absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[var(--ivory)] to-transparent" />

        <div className="hero-inner relative z-10 mx-auto flex min-h-[68svh] max-w-7xl items-center justify-center text-center sm:min-h-[66svh] lg:min-h-[72svh] lg:justify-start lg:text-left">
          <div
            className={`hero-copy max-w-3xl animate-rise rounded-[1.6rem] p-4 sm:rounded-[2rem] sm:p-5${
              heroVideoActive
                ? " hero-copy--video-panel"
                : " bg-white/24 backdrop-blur-[2px] lg:bg-transparent lg:p-0 lg:backdrop-blur-0"
            }`}
          >
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
              <button
                className="btn-secondary"
                onClick={scrollToDestinations}
                type="button"
              >
                {content.hero.secondaryCta}
              </button>
            </div>
            <div className="hero-phone-cta">
              <a
                aria-label={getCallAriaLabel(locale)}
                className="hero-phone-link"
                href={contactPhoneHref}
              >
                <span aria-hidden="true">📞</span>
                {content.hero.phoneLinkLabel}
              </a>
              <p>{content.hero.phoneNote}</p>
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
          {content.destinations.map((destination, index) => (
            <Link
              className="destination-card"
              href={localePath(
                locale,
                `/destinations/${getDestinationSlug(index)}`,
              )}
              key={destination.name}
              scroll={false}
            >
              <div className="destination-media">
                <DestinationImage
                  key={`destination-${getDestinationSlug(index)}`}
                  alt={destination.name}
                  remoteSrc={destination.image}
                  slug={getDestinationSlug(index)}
                />
                <div className="destination-overlay" />
                <div className="destination-content">
                  <h3>{destination.name}</h3>
                  <span />
                  <p>{destination.description}</p>
                </div>
              </div>
            </Link>
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
          {content.cruises.map((cruise, index) => (
            <Link
              className="destination-card cruise-card"
              href={localePath(locale, `/cruises/${getCruiseSlug(index)}`)}
              key={cruise.name}
              scroll={false}
            >
              <div className="destination-media">
                <DestinationImage
                  key={`cruise-${getCruiseSlug(index)}`}
                  alt={cruise.name}
                  remoteSrc={cruise.image}
                  slug={getCruiseSlug(index)}
                />
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
                src={profileMainImage}
                alt={content.imageAlts.profileMain}
                fill
                sizes="(min-width: 1024px) 42vw, (min-width: 640px) 82vw, 92vw"
                className="profile-image"
              />
            </div>
            <div className="profile-photo profile-photo-secondary">
              <Image
                src={profileSecondaryImage}
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
                  key={`signature-${destination.name}`}
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

      <section className="blog-section section-shell" id="blog">
        <div className="section-heading">
          <p>{content.blogSection.eyebrow}</p>
          <h2>{content.blogSection.title}</h2>
          {content.blogSection.description && (
            <span>{content.blogSection.description}</span>
          )}
        </div>

        <div className="blog-grid mt-12">
          {content.blog.posts.map((post, index) => (
            <Link
              className="blog-card"
              href={localePath(locale, `/blog/${getBlogSlug(index)}`)}
              key={post.title}
              scroll={false}
            >
              <div className="blog-card-image">
                <DestinationImage
                  key={`blog-${getBlogSlug(index)}`}
                  alt={post.title}
                  remoteSrc={post.image}
                  slug={getBlogSlug(index)}
                />
              </div>
              <div className="blog-card-copy">
                <span>{post.category}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <small>
                  {post.date} · {post.readTime}
                </small>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ContactSection content={content} locale={locale} />
      <SiteFooter content={content} locale={locale} />
      <MobileFloatingContact content={content} locale={locale} />
    </main>
  );
}
