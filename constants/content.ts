export type Locale = "bg" | "en";

export type NavItem = {
  label: string;
  href: string;
};

export type TitledDescription = {
  title: string;
  description: string;
};

export type Destination = {
  name: string;
  description: string;
  image: string;
};

export type SectionIntro = {
  eyebrow: string;
  title: string;
  description?: string;
};

export type SiteContent = {
  brand: {
    name: string;
    subtitle: string;
  };
  navItems: NavItem[];
  headerCta: string;
  hero: {
    label: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  imageAlts: {
    hero: string;
    profileMain: string;
    profileSecondary: string;
  };
  servicesSection: SectionIntro;
  services: TitledDescription[];
  processSection: SectionIntro;
  steps: string[];
  destinationsSection: SectionIntro;
  destinations: Destination[];
  trustSection: SectionIntro;
  trustItems: TitledDescription[];
  profileStats: string[];
  about: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    mission: string;
    tags: string[];
  };
  finalCta: {
    eyebrow: string;
    title: string;
    subtitle: string;
    button: string;
  };
};

export const defaultLocale: Locale = "bg";

export const languageOptions: { label: string; locale: Locale }[] = [
  { label: "BG", locale: "bg" },
  { label: "EN", locale: "en" },
];

export const futureLocalePaths: Record<Locale, string> = {
  bg: "/bg",
  en: "/en",
};
