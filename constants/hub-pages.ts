import type { Locale } from "./content";

export type HubKind = "destinations" | "cruises" | "blog";

export const hubPaths = ["destinations", "cruises", "blog"] as const;

export function isHubPath(value: string): value is HubKind {
  return (hubPaths as readonly string[]).includes(value);
}

export const hubPageCopy: Record<
  Locale,
  Record<
    HubKind,
    {
      title: string;
      description: string;
      backLabel: string;
    }
  >
> = {
  bg: {
    destinations: {
      title: "Луксозни дестинации",
      description:
        "Подбрани дестинации за спокойни, стилни и внимателно планирани пътувания.",
      backLabel: "Обратно към началото",
    },
    cruises: {
      title: "Премиум круизи",
      description:
        "Круизни маршрути с комфорт, атмосфера и внимание към всеки детайл.",
      backLabel: "Обратно към началото",
    },
    blog: {
      title: "Блог и вдъхновение",
      description:
        "Статии и идеи за луксозни пътувания, хотели и дестинации.",
      backLabel: "Обратно към началото",
    },
  },
  en: {
    destinations: {
      title: "Luxury destinations",
      description:
        "Selected destinations for calm, stylish, carefully planned journeys.",
      backLabel: "Back to home",
    },
    cruises: {
      title: "Premium cruises",
      description:
        "Cruise itineraries with comfort, atmosphere, and attention to every detail.",
      backLabel: "Back to home",
    },
    blog: {
      title: "Journal & inspiration",
      description:
        "Articles and ideas for luxury travel, hotels, and destinations.",
      backLabel: "Back to home",
    },
  },
};
