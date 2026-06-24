import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Barakova Luxury Travel",
    short_name: "Barakova Travel",
    description:
      "Персонални консултации за луксозни пътувания с Богдана Баракова.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F3EC",
    theme_color: "#F8F3EC",
    lang: "bg",
  };
}
