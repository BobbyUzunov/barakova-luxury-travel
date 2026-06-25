import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Locale } from "../../constants/content";
import { heroImage } from "../../constants/images";
import {
  getAlternateLanguages,
  isLocale,
  localePath,
  locales,
} from "../../constants/i18n";
import { localeMetadata } from "../../constants/locale-metadata";
import { siteName } from "../../constants/site";
import { LocaleHtml } from "../components/locale-html";

type LocaleLayoutProps = {
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    return {};
  }

  const locale = localeParam as Locale;
  const meta = localeMetadata[locale];
  const canonical = localePath(locale);

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical,
      languages: getAlternateLanguages(),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
      siteName,
      locale: meta.openGraphLocale,
      type: "website",
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [heroImage],
    },
  };
}

export default async function LocaleLayout({
  children,
  modal,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <LocaleHtml locale={locale as Locale}>
      {children}
      {modal}
    </LocaleHtml>
  );
}
