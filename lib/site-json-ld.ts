import type { Locale } from "../constants/content";
import {
  contactEmail,
  contactPhone,
  siteName,
  siteUrl,
} from "../constants/site";

const siteDescription =
  "Персонални туристически консултации, луксозни почивки, бутикови хотели, круизи и внимателно подбрани дестинации по целия свят.";

export function getSiteJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: siteName,
        url: siteUrl,
        inLanguage: locale,
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
  };
}
