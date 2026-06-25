import { notFound } from "next/navigation";
import { InterceptedContentModal } from "../../../../components/home/intercepted-content-modal";
import type { Locale } from "../../../../../constants/content";
import { contentBg } from "../../../../../constants/content-bg";
import { contentEn } from "../../../../../constants/content-en";
import { isLocale } from "../../../../../constants/i18n";
import { findSeoCruise, getSeoCruises } from "../../../../../constants/seo-content";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return getSeoCruises("bg").flatMap((cruise) => [
    { locale: "bg", slug: cruise.slug },
    { locale: "en", slug: cruise.slug },
  ]);
}

export default async function InterceptedCruiseModal({ params }: PageProps) {
  const { locale: localeParam, slug } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const cruise = findSeoCruise(locale, slug);

  if (!cruise) {
    notFound();
  }

  const content = locale === "bg" ? contentBg : contentEn;

  return (
    <InterceptedContentModal content={content} item={cruise} locale={locale} />
  );
}
