import type { Metadata } from "next";
import { Analytics } from "./analytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://barakova-luxury-travel.vercel.app"),
  title:
    "Barakova Luxury Travel | Персонални консултации за луксозни пътувания",
  description:
    "Персонални туристически консултации, луксозни почивки, бутикови хотели и внимателно подбрани дестинации по целия свят.",
  alternates: {
    canonical: "/",
    languages: {
      bg: "/bg",
      en: "/en",
    },
  },
  openGraph: {
    title:
      "Barakova Luxury Travel | Персонални консултации за луксозни пътувания",
    description:
      "Персонални туристически консултации, луксозни почивки, бутикови хотели и внимателно подбрани дестинации по целия свят.",
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
    title:
      "Barakova Luxury Travel | Персонални консултации за луксозни пътувания",
    description:
      "Персонални туристически консултации, луксозни почивки, бутикови хотели и внимателно подбрани дестинации по целия свят.",
    images: ["/hero-bogdana-beach.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg" data-scroll-behavior="smooth">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
