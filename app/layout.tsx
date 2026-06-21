import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://barakova-luxury-travel.vercel.app"),
  title: "Barakova Luxury Travel | Бутикови луксозни пътувания",
  description:
    "Персонални туристически консултации с Богдана Баракова за бутикови луксозни почивки по света.",
  alternates: {
    canonical: "/",
    languages: {
      bg: "/bg",
      en: "/en",
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
      <body>{children}</body>
    </html>
  );
}
