import type { Metadata, Viewport } from "next";
import {
  contactEmail,
  contactPhone,
  siteName,
  siteUrl,
} from "../constants/site";
import { getAlternateLanguages } from "../constants/i18n";
import { heroImage, heroImageHeight, heroImageWidth } from "../constants/images";
import { Analytics } from "./analytics";
import { CookieConsent } from "./cookie-consent";
import "./globals.css";
const siteTitle = "Barakova Luxury Travel | Луксозни пътувания";
const siteDescription =
  "Персонални туристически консултации, луксозни почивки, бутикови хотели, круизи и внимателно подбрани дестинации по целия свят.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "луксозни пътувания",
    "туристически консултации",
    "луксозни почивки",
    "бутикови хотели",
    "круизи",
    "Малдиви",
    "Сейшели",
    "Богдана Баракова",
    "Barakova Luxury Travel",
  ],
  creator: "Богдана Баракова",
  publisher: "Barakova Luxury Travel",
  category: "travel",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  alternates: {
    canonical: "/bg",
    languages: getAlternateLanguages(),
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/bg",
    siteName,
    locale: "bg_BG",
    type: "website",
    images: [
      {
        url: heroImage,
        width: heroImageWidth,
        height: heroImageHeight,
        alt: "Barakova Luxury Travel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": `${siteUrl}/#website`,
                  name: siteName,
                  url: siteUrl,
                  inLanguage: "bg",
                  publisher: {
                    "@id": `${siteUrl}/#business`,
                  },
                },
                {
                  "@type": "TravelAgency",
                  "@id": `${siteUrl}/#business`,
                  name: siteName,
                  url: siteUrl,
                  founder: {
                    "@id": `${siteUrl}/#bogdana`,
                  },
                  email: contactEmail,
                  telephone: contactPhone,
                  areaServed: ["BG", "Worldwide"],
                  description: siteDescription,
                  contactPoint: {
                    "@type": "ContactPoint",
                    contactType: "customer service",
                    email: contactEmail,
                    telephone: contactPhone,
                    availableLanguage: ["Bulgarian", "English"],
                  },
                },
                {
                  "@type": "Person",
                  "@id": `${siteUrl}/#bogdana`,
                  name: "Богдана Баракова",
                  jobTitle: "Консултант за луксозни пътувания",
                  worksFor: {
                    "@id": `${siteUrl}/#business`,
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body>
        {children}
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
