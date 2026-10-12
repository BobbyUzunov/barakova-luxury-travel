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
      className={`hero-section relative overflow-hidden min-h-[90svh] sm:min-h-[92svh] lg:min-h-[96svh]${heroVideoActive ? " hero-section--video" : ""}`}
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
    </section>
  );
}
