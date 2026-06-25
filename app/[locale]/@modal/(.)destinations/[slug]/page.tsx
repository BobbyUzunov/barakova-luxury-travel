import { notFound } from "next/navigation";
import { InterceptedContentModal } from "../../../../components/home/intercepted-content-modal";
import type { Locale } from "../../../../../constants/content";
import { contentBg } from "../../../../../constants/content-bg";
import { contentEn } from "../../../../../constants/content-en";
import { isLocale } from "../../../../../constants/i18n";
import {
  findSeoDestination,
  getSeoDestinations,
} from "../../../../../constants/seo-content";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return getSeoDestinations("bg").flatMap((destination) => [
    { locale: "bg", slug: destination.slug },
    { locale: "en", slug: destination.slug },
  ]);
}

export default async function InterceptedDestinationModal({ params }: PageProps) {
  const { locale: localeParam, slug } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const destination = findSeoDestination(locale, slug);

  if (!destination) {
    notFound();
  }

  const content = locale === "bg" ? contentBg : contentEn;

  return (
    <InterceptedContentModal
      content={content}
      item={destination}
      locale={locale}
    />
  );
}
