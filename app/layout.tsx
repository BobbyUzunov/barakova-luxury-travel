import type { Metadata } from "next";
import { Analytics } from "./analytics";
import "./globals.css";

const siteUrl = "https://barakovaluxurytravel.com";
const siteTitle =
  "Barakova Luxury Travel | Персонални консултации за луксозни пътувания";
const siteDescription =
  "Персонални туристически консултации, луксозни почивки, бутикови хотели, круизи и внимателно подбрани дестинации по целия свят.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Barakova Luxury Travel",
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
  alternates: {
    canonical: "/",
    languages: {
      bg: "/",
      "x-default": "/",
    },
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    siteName: "Barakova Luxury Travel",
    locale: "bg_BG",
    type: "website",
    images: [
      {
        url: "/hero-bogdana-beach.jpeg",
        width: 1200,
        height: 630,
        alt: "Barakova Luxury Travel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/hero-bogdana-beach.jpeg"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg" data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "TravelAgency",
              name: "Barakova Luxury Travel",
              url: siteUrl,
              founder: {
                "@type": "Person",
                name: "Богдана Баракова",
              },
              email: "bbmobile6666@gmail.com",
              telephone: "+359883770909",
              areaServed: ["BG", "Worldwide"],
              description: siteDescription,
            }),
          }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
