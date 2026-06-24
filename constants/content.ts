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
  detail: string;
  highlights: string[];
  gallery: string[];
};

export type BlogPost = {
  title: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  readTime: string;
  paragraphs: string[];
};

export type SignatureDestination = {
  name: string;
  reason: string;
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
    phoneNote: string;
    callAriaLabel: string;
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
  cruisesSection: SectionIntro;
  cruises: Destination[];
  destinationModal: {
    eyebrow: string;
    highlightsTitle: string;
    galleryTitle: string;
    closeLabel: string;
    cta: string;
  };
  blogSection: SectionIntro;
  blog: {
    readMoreLabel: string;
    closeLabel: string;
    posts: BlogPost[];
  };
  trustSection: SectionIntro;
  trustItems: TitledDescription[];
  profileStats: string[];
  about: {
    eyebrow: string;
    title: string;
    intro: string;
    paragraphs: string[];
    mission: string;
    tags: string[];
  };
  signature: {
    eyebrow: string;
    title: string;
    subtitle: string;
    storyQuote: string;
    recommendationLabel: string;
    signature: string;
    destinations: SignatureDestination[];
  };
  finalCta: {
    eyebrow: string;
    title: string;
    subtitle: string;
    button: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    subtitle: string;
    trustTitle: string;
    trustItems: string[];
    phoneCallout: {
      title: string;
      lead: string;
      trail: string;
      callAriaLabel: string;
    };
    fields: {
      fullName: string;
      email: string;
      phone: string;
      destination: string;
      travelPeriod: string;
      travelers: string;
      budget: string;
      message: string;
    };
    placeholders: {
      message: string;
    };
    requiredMark: string;
    submit: string;
    submitting: string;
    validation: {
      fullName: string;
      email: string;
      phone: string;
      captcha: string;
      submitError: string;
    };
    success: {
      title: string;
      message: string;
      reset: string;
    };
  };
  footer: {
    quote: string;
    brandText: string;
    navigationTitle: string;
    contactsTitle: string;
    languageTitle: string;
    languageNames: Record<Locale, string>;
    contacts: {
      email: string;
      phone: string;
      whatsapp: string;
      viber: string;
    };
    copyright: string;
    rights: string;
    developerCredit: string;
  };
  floatingContact: {
    groupAriaLabel: string;
    callAriaLabel: string;
    whatsappAriaLabel: string;
  };
};

export const defaultLocale: Locale = "bg";

export const languageOptions: { flag: string; label: string; locale: Locale }[] = [
  { flag: "🇧🇬", label: "BG", locale: "bg" },
  { flag: "🇬🇧", label: "EN", locale: "en" },
];
