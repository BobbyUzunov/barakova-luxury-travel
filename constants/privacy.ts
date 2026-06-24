import type { Locale } from "./content";

type PrivacySection = {
  title: string;
  paragraphs: string[];
};

export type PrivacyContent = {
  pageTitle: string;
  backLabel: string;
  lastUpdated: string;
  intro: string;
  sections: PrivacySection[];
};

export const privacyContent: Record<Locale, PrivacyContent> = {
  bg: {
    pageTitle: "Политика за поверителност",
    backLabel: "Обратно към началото",
    lastUpdated: "Последна актуализация: юни 2026",
    intro:
      "Barakova Luxury Travel уважава вашата поверителност. Тази политика описва какви данни събираме, защо ги използваме и какви са вашите права.",
    sections: [
      {
        title: "Кои сме ние",
        paragraphs: [
          "Barakova Luxury Travel предоставя персонални консултации за луксозни пътувания. Администратор на личните данни е Богдана Баракова.",
          "Контакт: bbmobile6666@gmail.com",
        ],
      },
      {
        title: "Какви данни събираме",
        paragraphs: [
          "При изпращане на запитване през контактната форма събираме име, email, телефон и други доброволно предоставени данни (дестинация, период, бюджет, съобщение).",
          "При посещение на сайта може да се събират технически данни чрез бисквитки и аналитични инструменти (напр. Google Analytics), само ако сте дали съгласие.",
        ],
      },
      {
        title: "За какво използваме данните",
        paragraphs: [
          "Данните от формата се използват единствено за отговор на вашето запитване и организиране на консултация.",
          "Аналитичните данни ни помагат да разберем как се използва сайтът и да подобрим потребителското изживяване.",
        ],
      },
      {
        title: "Правно основание",
        paragraphs: [
          "Обработваме данните от формата на основание вашето съгласие и/или преддоговорни мерки по ваше искане.",
          "Аналитичните бисквитки се активират само след изрично съгласие.",
        ],
      },
      {
        title: "Съхранение и споделяне",
        paragraphs: [
          "Данните от запитванията се съхраняват колкото е необходимо за обработка на заявката и последваща комуникация.",
          "Използваме доставчици за изпращане на имейли (Resend) и хостинг (Vercel). Те обработват данни от наше име съгласно договорни задължения.",
        ],
      },
      {
        title: "Вашите права",
        paragraphs: [
          "Имате право на достъп, корекция, изтриване, ограничаване на обработката и възражение срещу обработката на личните ви данни.",
          "Можете да оттеглите съгласието си за бисквитки по всяко време, като изчистите предпочитанията в браузъра си или отхвърлите аналитиката при следващо посещение.",
          "Имате право да подадете жалба до Комисията за защита на личните данни (КЗЛД).",
        ],
      },
    ],
  },
  en: {
    pageTitle: "Privacy Policy",
    backLabel: "Back to home",
    lastUpdated: "Last updated: June 2026",
    intro:
      "Barakova Luxury Travel respects your privacy. This policy explains what data we collect, why we use it, and what your rights are.",
    sections: [
      {
        title: "Who we are",
        paragraphs: [
          "Barakova Luxury Travel provides personal consulting for luxury travel. The data controller is Bogdana Barakova.",
          "Contact: bbmobile6666@gmail.com",
        ],
      },
      {
        title: "What data we collect",
        paragraphs: [
          "When you submit an inquiry through the contact form, we collect your name, email, phone, and any optional details you provide (destination, travel period, budget, message).",
          "When you visit the site, technical data may be collected through cookies and analytics tools (e.g. Google Analytics) only if you have given consent.",
        ],
      },
      {
        title: "How we use the data",
        paragraphs: [
          "Form data is used solely to respond to your inquiry and arrange a consultation.",
          "Analytics data helps us understand how the site is used and improve the experience.",
        ],
      },
      {
        title: "Legal basis",
        paragraphs: [
          "We process form data based on your consent and/or pre-contractual steps at your request.",
          "Analytics cookies are activated only after explicit consent.",
        ],
      },
      {
        title: "Retention and sharing",
        paragraphs: [
          "Inquiry data is kept as long as needed to process your request and follow up.",
          "We use providers for email delivery (Resend) and hosting (Vercel). They process data on our behalf under contractual obligations.",
        ],
      },
      {
        title: "Your rights",
        paragraphs: [
          "You have the right to access, rectify, erase, restrict processing, and object to the processing of your personal data.",
          "You may withdraw cookie consent at any time by clearing your browser preferences or declining analytics on your next visit.",
          "You have the right to lodge a complaint with your local data protection authority.",
        ],
      },
    ],
  },
};

export const cookieConsentStorageKey = "barakova-cookie-consent";
export const localeStorageKey = "barakova-luxury-travel-locale";

export const cookieConsentCopy: Record<
  Locale,
  { message: string; accept: string; reject: string; privacyLink: string }
> = {
  bg: {
    message:
      "Използваме бисквитки за анализ на трафика. Можете да приемете или откажете аналитичните бисквитки.",
    accept: "Приемам",
    reject: "Отказвам",
    privacyLink: "Политика за поверителност",
  },
  en: {
    message:
      "We use cookies for traffic analytics. You can accept or decline analytics cookies.",
    accept: "Accept",
    reject: "Decline",
    privacyLink: "Privacy Policy",
  },
};

export type CookieConsentValue = "accepted" | "rejected";

export function getStoredCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(cookieConsentStorageKey);

  if (value === "accepted" || value === "rejected") {
    return value;
  }

  return null;
}

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return "bg";
  }

  const value = window.localStorage.getItem(localeStorageKey);
  return value === "en" ? "en" : "bg";
}
