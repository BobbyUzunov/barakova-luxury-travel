"use client";

import { useState } from "react";
import type { SiteContent } from "../../../../constants/content";
import { heroImage } from "../../../../constants/images";
import { contactPhoneHref, getCallAriaLabel } from "../../../../constants/site";
import { HeroBackground } from "../hero-background";
import { useHomePage } from "../home-page-context";

type HeroSectionProps = {
  content: SiteContent;
};

export function HeroSection({ content }: HeroSectionProps) {
  const { locale, scrollToContact, scrollToDestinations } = useHomePage();
  const [heroVideoActive, setHeroVideoActive] = useState(false);

  return (
    <section
      id="home"
      className={`hero-section relative overflow-hidden min-h-[94svh] px-5 pb-14 pt-40 text-[var(--charcoal)] sm:min-h-[92svh] sm:px-8 sm:pt-36 lg:min-h-[96svh] lg:px-12${heroVideoActive ? " hero-section--video" : ""}`}
    >
      <HeroBackground
        imageAlt={content.imageAlts.hero}
        imageSrc={heroImage}
        videoTitle={content.imageAlts.heroVideo}
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
              ? " hero-copy--video-panel lg:p-0"
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
  );
}
