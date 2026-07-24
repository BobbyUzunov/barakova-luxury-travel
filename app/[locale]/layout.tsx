import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { Locale } from "../../constants/content";
import { heroImage, heroImageHeight, heroImageWidth } from "../../constants/images";
import {
  getAlternateLanguages,
  isLocale,
  localePath,
  locales,
} from "../../constants/i18n";
import { localeMetadata } from "../../constants/locale-metadata";
import { siteName, siteUrl } from "../../constants/site";
import { getSiteJsonLd } from "../../lib/site-json-ld";
import { Analytics } from "../analytics";
import { InquiryAgent } from "../components/inquiry-agent/inquiry-agent";
import { LocalePersistence } from "../components/locale-persistence";
import { CookieConsent } from "../cookie-consent";
import "../globals.css";

type LocaleLayoutProps = {
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

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
    metadataBase: new URL(siteUrl),
    applicationName: siteName,
    title: meta.title,
    description: meta.description,
    keywords: [
      "luxury travel",
      "travel consulting",
      "luxury vacations",
      "boutique hotels",
      "cruises",
      "луксозни пътувания",
      "туристически консултации",
      "Богдана Баракова",
      siteName,
    ],
    creator: locale === "bg" ? "Богдана Баракова" : "Bogdana Barakova",
    publisher: siteName,
    category: "travel",
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      shortcut: "/icon.svg",
      apple: "/apple-touch-icon.png",
    },
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
          width: heroImageWidth,
          height: heroImageHeight,
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
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  modal,
  params,
}: LocaleLayoutProps) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;

  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link href="https://images.unsplash.com" rel="dns-prefetch" />
        <link href="https://player.vimeo.com" rel="dns-prefetch" />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getSiteJsonLd(locale)),
          }}
        />
      </head>
      <body>
        <div id="app-content">
          {children}
          {modal}
        </div>
        <LocalePersistence locale={locale} />
        <InquiryAgent locale={locale} />
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
