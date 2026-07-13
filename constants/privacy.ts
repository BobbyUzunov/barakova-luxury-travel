import type { Locale } from "./content";
import { contactEmail } from "./site";

type PrivacySection = {
  title: string;
  paragraphs: string[];
};

export type PrivacyContent = {
  pageTitle: string;
  backLabel: string;
  lastUpdated: string;
  intro: string;
  otherLocaleTitle: string;
  otherLocaleLink: string;
  sections: PrivacySection[];
};

export const privacyContent: Record<Locale, PrivacyContent> = {
  bg: {
    pageTitle: "Политика за поверителност",
    backLabel: "Обратно към началото",
    lastUpdated: "Последна актуализация: юли 2026",
    intro:
      "Barakova Luxury Travel уважава вашата поверителност. Тази политика описва какви данни събираме, защо ги използваме и какви са вашите права.",
    otherLocaleTitle: "Версия на английски",
    otherLocaleLink: "Прочетете политиката на английски",
    sections: [
      {
        title: "Кои сме ние",
        paragraphs: [
          "Barakova Luxury Travel предоставя персонални консултации за луксозни пътувания. Администратор на личните данни е Богдана Баракова.",
          `Контакт: ${contactEmail}`,
        ],
      },
      {
        title: "Какви данни събираме",
        paragraphs: [
          "При изпращане на запитване през контактната форма събираме име, email, телефон и други доброволно предоставени данни (дестинация, период, бюджет, съобщение).",
          "При използване на AI асистента на сайта обработваме съдържанието на вашите съобщения и кратка история на разговора в рамките на текущата сесия, за да можем да отговорим на запитването ви.",
          "За защита срещу спам контактната форма използва Cloudflare Turnstile. При проверката Cloudflare може да обработва технически данни (напр. IP адрес и данни за браузъра) и да поставя необходими бисквитки.",
          "При посещение на сайта може да се събират технически данни чрез аналитични бисквитки (напр. Google Analytics) само ако сте дали съгласие. Вграденият видео плейър на Vimeo може да поставя собствени бисквитки, когато видеото се зареди или пусне.",
        ],
      },
      {
        title: "За какво използваме данните",
        paragraphs: [
          "Данните от формата се използват единствено за отговор на вашето запитване и организиране на консултация.",
          "Съобщенията към AI асистента се използват, за да отговорим на въпроси за услугите, дестинациите и процеса на консултация. Сложни въпроси могат да бъдат обработени чрез OpenAI; не използваме чата за маркетингов профил.",
          "Turnstile се използва единствено за защита на контактната форма срещу автоматизирани изпращания.",
          "Аналитичните данни ни помагат да разберем как се използва сайтът и да подобрим потребителското изживяване.",
        ],
      },
      {
        title: "Правно основание",
        paragraphs: [
          "Обработваме данните от формата на основание вашето съгласие и/или преддоговорни мерки по ваше искане.",
          "Съобщенията към AI асистента обработваме на основание вашето съгласие и законен интерес да отговорим на запитването ви.",
          "Turnstile се използва на основание законен интерес за сигурност и предотвратяване на злоупотреби.",
          "Аналитичните бисквитки се активират само след изрично съгласие.",
        ],
      },
      {
        title: "Съхранение и споделяне",
        paragraphs: [
          "Данните от запитванията се съхраняват колкото е необходимо за обработка на заявката и последваща комуникация.",
          "Съобщенията от AI асистента не се съхраняват в постоянна клиентска база на сайта; те се предават за обработка към OpenAI (САЩ) само когато въпросът не може да бъде отговорен от вградените FAQ отговори. OpenAI обработва данните като подизпълнител по наши инструкции и според своите условия за поверителност.",
          "Използваме доставчици за изпращане на имейли (Resend), хостинг (Vercel), защита на формата (Cloudflare Turnstile) и видео вграждане (Vimeo). Те обработват данни от наше име или като самостоятелни администратори според своите политики, когато взаимодействате с тяхното съдържание на сайта.",
        ],
      },
      {
        title: "Бисквитки и външни технологии",
        paragraphs: [
          "Google Analytics: аналитични бисквитки за трафик и използване на сайта — само след ваше съгласие чрез банера за бисквитки.",
          "Cloudflare Turnstile: технически/сигурностни бисквитки при изпращане на контактната форма, за да разграничим реални потребители от автоматизиран трафик. Повече: https://www.cloudflare.com/privacypolicy/",
          "Vimeo: при зареждане на фоновото видео на началната страница Vimeo може да поставя бисквитки и да събира данни за плейъра. Повече: https://vimeo.com/privacy",
          "Локално съхранение: предпочитания за бисквитки и език се пазят в localStorage на вашия браузър.",
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
    lastUpdated: "Last updated: July 2026",
    intro:
      "Barakova Luxury Travel respects your privacy. This policy explains what data we collect, why we use it, and what your rights are.",
    otherLocaleTitle: "Bulgarian version",
    otherLocaleLink: "Read the policy in Bulgarian",
    sections: [
      {
        title: "Who we are",
        paragraphs: [
          "Barakova Luxury Travel provides personal consulting for luxury travel. The data controller is Bogdana Barakova.",
          `Contact: ${contactEmail}`,
        ],
      },
      {
        title: "What data we collect",
        paragraphs: [
          "When you submit an inquiry through the contact form, we collect your name, email, phone, and any optional details you provide (destination, travel period, budget, message).",
          "When you use the on-site AI assistant, we process the content of your messages and a short conversation history within the current session so we can respond to your inquiry.",
          "To protect against spam, the contact form uses Cloudflare Turnstile. During verification, Cloudflare may process technical data (e.g. IP address and browser data) and set necessary cookies.",
          "When you visit the site, analytics cookies (e.g. Google Analytics) may collect technical data only if you have given consent. The embedded Vimeo video player may set its own cookies when the video loads or plays.",
        ],
      },
      {
        title: "How we use the data",
        paragraphs: [
          "Form data is used solely to respond to your inquiry and arrange a consultation.",
          "AI assistant messages are used to answer questions about our services, destinations, and consultation process. Complex questions may be processed via OpenAI; we do not use the chat for marketing profiling.",
          "Turnstile is used solely to protect the contact form against automated submissions.",
          "Analytics data helps us understand how the site is used and improve the experience.",
        ],
      },
      {
        title: "Legal basis",
        paragraphs: [
          "We process form data based on your consent and/or pre-contractual steps at your request.",
          "AI assistant messages are processed based on your consent and our legitimate interest in responding to your inquiry.",
          "Turnstile is used on the basis of legitimate interest in security and abuse prevention.",
          "Analytics cookies are activated only after explicit consent.",
        ],
      },
      {
        title: "Retention and sharing",
        paragraphs: [
          "Inquiry data is kept as long as needed to process your request and follow up.",
          "AI assistant messages are not stored in a permanent client database on the site; they are sent to OpenAI (USA) for processing only when a question cannot be answered from built-in FAQ responses. OpenAI processes data as a processor under our instructions and its own privacy terms.",
          "We use providers for email delivery (Resend), hosting (Vercel), form protection (Cloudflare Turnstile), and video embedding (Vimeo). They process data on our behalf or as independent controllers under their own policies when you interact with their content on the site.",
        ],
      },
      {
        title: "Cookies and third-party technologies",
        paragraphs: [
          "Google Analytics: analytics cookies for traffic and site usage — only after your consent via the cookie banner.",
          "Cloudflare Turnstile: technical/security cookies when submitting the contact form, to distinguish real users from automated traffic. More: https://www.cloudflare.com/privacypolicy/",
          "Vimeo: when the homepage background video loads, Vimeo may set cookies and collect player data. More: https://vimeo.com/privacy",
          "Local storage: cookie and language preferences are stored in your browser's localStorage.",
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
