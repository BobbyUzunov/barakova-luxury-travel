import { notFound } from "next/navigation";
import type { Locale } from "../../constants/content";
import { locales, isLocale } from "../../constants/i18n";
import { LocaleHtml } from "../components/locale-html";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <LocaleHtml locale={locale as Locale}>{children}</LocaleHtml>;
}
