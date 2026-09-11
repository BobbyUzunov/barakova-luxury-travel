import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HubListingPage } from "../../components/hub-listing-page";
import { hubPageCopy } from "../../../constants/hub-pages";
import {
  getAlternateLanguages,
  isLocale,
  localePath,
  locales,
} from "../../../constants/i18n";
import { siteName } from "../../../constants/site";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const hub = hubPageCopy[localeParam].blog;
  const canonical = localePath(localeParam, "/blog");

  return {
    title: `${hub.title} | ${siteName}`,
    description: hub.description,
    alternates: {
      canonical,
      languages: getAlternateLanguages("/blog"),
    },
  };
}

export default async function BlogIndexPage({ params }: PageProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  return <HubListingPage kind="blog" locale={localeParam} />;
}
