import { notFound } from "next/navigation";
import type { Locale } from "../../constants/content";
import { contentBg } from "../../constants/content-bg";
import { contentEn } from "../../constants/content-en";
import { isLocale } from "../../constants/i18n";
import { ContactSection } from "../components/home/contact-section";
import { HomePageShell } from "../components/home/home-page-context";
import { AboutSection } from "../components/home/sections/about-section";
import { BlogSection } from "../components/home/sections/blog-section";
import { CruisesSection } from "../components/home/sections/cruises-section";
import { DestinationsSection } from "../components/home/sections/destinations-section";
import { HeroSection } from "../components/home/sections/hero-section";
import { ProcessSection } from "../components/home/sections/process-section";
import { ServicesSection } from "../components/home/sections/services-section";
import { SignatureSection } from "../components/home/sections/signature-section";
import { TrustSection } from "../components/home/sections/trust-section";
import { SiteFooter } from "../components/home/site-footer";

type PageProps = {
  params: Promise<{ locale: string }>;
};

const contentByLocale = {
  bg: contentBg,
  en: contentEn,
} as const;

export default async function Page({ params }: PageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const content = contentByLocale[locale];

  return (
    <HomePageShell content={content} locale={locale}>
      <HeroSection content={content} />
      <ServicesSection content={content} />
      <ProcessSection content={content} />
      <DestinationsSection content={content} locale={locale} />
      <CruisesSection content={content} locale={locale} />
      <TrustSection content={content} />
      <AboutSection content={content} />
      <SignatureSection content={content} />
      <BlogSection content={content} locale={locale} />
      <ContactSection content={content} locale={locale} />
      <SiteFooter content={content} locale={locale} />
    </HomePageShell>
  );
}
