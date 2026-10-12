"use client";

import { useState } from "react";
import type { SiteContent } from "../../../../constants/content";
import { heroImage } from "../../../../constants/images";
import { HeroBackground } from "../hero-background";

type HeroSectionProps = {
  content: SiteContent;
};

export function HeroSection({ content }: HeroSectionProps) {
  const [heroVideoActive, setHeroVideoActive] = useState(false);

  return (
    <section
      id="home"
      className={`hero-section relative overflow-hidden${heroVideoActive ? " hero-section--video" : ""}`}
    >
      <h1 className="sr-only">{content.hero.title}</h1>
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
      <div className="hero-bottom-fade absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--ivory)] to-transparent" />
      <a className="hero-scroll" href="#services">
        <span className="sr-only">{content.hero.scrollLabel}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
        </svg>
      </a>
    </section>
  );
}
