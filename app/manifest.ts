import type { MetadataRoute } from "next";
import { defaultLocale } from "../constants/i18n";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Barakova Luxury Travel",
    short_name: "Barakova Travel",
    description:
      "Персонални консултации за луксозни пътувания с Богдана Баракова. Personal luxury travel consulting by Bogdana Barakova.",
    start_url: `/${defaultLocale}`,
    display: "standalone",
    background_color: "#F8F3EC",
    theme_color: "#F8F3EC",
    lang: "bg",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
