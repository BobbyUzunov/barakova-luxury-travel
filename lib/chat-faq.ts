import type { Locale } from "../constants/content";
import { getSiteContent } from "../constants/content-by-locale";
import {
  contactEmail,
  contactPhoneDisplay,
} from "../constants/site";
import {
  destinationMentionedIn,
  isSimpleDestinationQuestion,
  normalizeText,
  shouldPreferAiReply,
} from "./chat-routing";

export type FaqEntry = {
  id: string;
  keywords: string[];
  answer: string;
  quickReply?: string;
};

function buildStaticFaqs(locale: Locale): FaqEntry[] {
  const content = getSiteContent(locale);
  const servicesList = content.services
    .map((service) => `• ${service.title}: ${service.description}`)
    .join("\n");
  const stepsList = content.steps
    .map((step, index) => `${index + 1}. ${step}`)
    .join("\n");
  const destinationsList = content.destinations
    .map((destination) => destination.name)
    .join(", ");
  const cruisesList = content.cruises.map((cruise) => cruise.name).join(", ");

  if (locale === "bg") {
    return [
      {
        id: "services",
        quickReply: "Какви услуги предлагате?",
        keywords: [
          "какви услуги",
          "услуги",
          "услуга",
          "предлагате",
          "помагате",
          "правите",
          "луксозни почивки",
        ],
        answer: `Предлагам персонални консултации за луксозни пътувания:\n\n${servicesList}\n\nАко искате, мога да насоча към контакт формата за персонално предложение.`,
      },
      {
        id: "process",
        quickReply: "Как работи процесът?",
        keywords: [
          "как работи",
          "процес",
          "стъпки",
          "какво следва",
          "процедура",
          "консултацията",
        ],
        answer: `${content.processSection.title}:\n\n${stepsList}\n\n${content.processSection.description ?? ""}`,
      },
      {
        id: "contact",
        quickReply: "Как да се свържа с вас?",
        keywords: [
          "как да се свържа",
          "контакт",
          "телефон",
          "обадя",
          "имейл",
          "email",
          "връзка",
          "свържа",
          "0883",
        ],
        answer: `Можете да се свържете с нас на телефон ${contactPhoneDisplay} или на ${contactEmail}. Също така можете да попълните формата за запитване в секция „Контакт“ на сайта.`,
      },
      {
        id: "consultation",
        quickReply: "Безплатна ли е консултацията?",
        keywords: [
          "безплатна ли",
          "безплатна",
          "безплатно",
          "такса",
          "заплащане",
          "първоначална консултация",
        ],
        answer:
          "Първоначалната консултация е безплатна. След като споделите какво търсите, подготвям внимателно подбрани предложения според вашия стил, бюджет и предпочитания.",
      },
      {
        id: "destinations",
        quickReply: "Кои дестинации предлагате?",
        keywords: [
          "кои дестинации",
          "дестинации предлагате",
          "дестинации",
          "къде пътувате",
          "маршрути",
        ],
        answer: `Работя с внимателно подбрани луксозни дестинации, включително: ${destinationsList}. Мога да разкажа повече за конкретна дестинация, ако попитате.`,
      },
      {
        id: "cruises",
        quickReply: "Имате ли круизи?",
        keywords: ["имате ли круизи", "круиз", "круизи", "кораб", "речен круиз"],
        answer: `Да, предлагам и луксозни круизи, включително: ${cruisesList}. Мога да помогна с избор според сезона, стила и бюджета ви.`,
      },
      {
        id: "about",
        quickReply: "Кой е Barakova Luxury Travel?",
        keywords: [
          "богдана баракова",
          "богдана",
          "баракова",
          "barakova",
          "кой сте",
          "за вас",
          "консултант",
        ],
        answer: `${content.about.title}\n\n${content.about.intro}\n\n${content.about.mission}`,
      },
      {
        id: "budget",
        quickReply: "Какъв бюджет е нужен?",
        keywords: [
          "какъв бюджет",
          "бюджет е нужен",
          "колко струва",
          "цени",
          "разходи",
        ],
        answer:
          "Всяко пътуване е индивидуално. Споделяте приблизителен бюджет и предпочитания, а аз подбирам предложения, които съответстват на очакванията ви за комфорт и стил. Попълнете формата за запитване с бюджет и период.",
      },
    ];
  }

  return [
    {
      id: "services",
      quickReply: "What services do you offer?",
      keywords: [
        "what services",
        "services",
        "service",
        "do you offer",
        "help",
        "consulting",
        "luxury vacations",
      ],
      answer: `I offer personal luxury travel consulting:\n\n${servicesList}\n\nI can also guide you to the contact form for a tailored proposal.`,
    },
    {
      id: "process",
      quickReply: "How does the process work?",
      keywords: [
        "how does the process",
        "how it works",
        "process",
        "steps",
        "procedure",
        "what happens next",
      ],
      answer: `${content.processSection.title}:\n\n${stepsList}\n\n${content.processSection.description ?? ""}`,
    },
    {
      id: "contact",
      quickReply: "How can I contact you?",
      keywords: [
        "how can i contact",
        "contact",
        "phone",
        "call",
        "email",
        "reach",
        "0883",
      ],
      answer: `You can reach us at ${contactPhoneDisplay} or ${contactEmail}. You can also use the inquiry form in the Contact section of the website.`,
    },
    {
      id: "consultation",
      quickReply: "Is the consultation free?",
      keywords: [
        "is the consultation free",
        "free consultation",
        "free",
        "fee",
        "initial consultation",
        "charge",
      ],
      answer:
        "The initial consultation is free. Once you share what you are looking for, I prepare carefully selected proposals based on your style, budget, and preferences.",
    },
    {
      id: "destinations",
      quickReply: "Which destinations do you offer?",
      keywords: [
        "which destinations",
        "destinations do you offer",
        "destinations",
        "where do you travel",
        "routes",
      ],
      answer: `I work with carefully selected luxury destinations, including: ${destinationsList}. Ask about a specific destination and I can share more details.`,
    },
    {
      id: "cruises",
      quickReply: "Do you offer cruises?",
      keywords: ["do you offer cruises", "cruise", "cruises", "ship", "river cruise"],
      answer: `Yes, I also offer luxury cruises, including: ${cruisesList}. I can help you choose based on season, style, and budget.`,
    },
    {
      id: "about",
      quickReply: "Who is Barakova Luxury Travel?",
      keywords: [
        "who is barakova",
        "bogdana barakova",
        "bogdana",
        "barakova",
        "about",
        "consultant",
      ],
      answer: `${content.about.title}\n\n${content.about.intro}\n\n${content.about.mission}`,
    },
    {
      id: "budget",
      quickReply: "What budget should I plan for?",
      keywords: [
        "what budget",
        "budget should",
        "how much",
        "prices",
        "cost",
      ],
      answer:
        "Every trip is personal. Share your approximate budget and preferences, and I prepare proposals that match your expectations for comfort and style. Use the inquiry form with your budget and travel period.",
    },
  ];
}

function buildDestinationFaqs(locale: Locale): FaqEntry[] {
  const content = getSiteContent(locale);

  return content.destinations.map((destination) => ({
    id: `destination-${destination.name.toLowerCase().replace(/\s+/g, "-")}`,
    keywords: [destination.name.toLowerCase()],
    answer: `${destination.name}: ${destination.description}\n\n${destination.detail}`,
  }));
}

function scoreFaqEntry(normalizedMessage: string, entry: FaqEntry) {
  let score = 0;

  for (const keyword of entry.keywords) {
    const normalizedKeyword = normalizeText(keyword);

    if (!normalizedKeyword) {
      continue;
    }

    if (normalizedMessage === normalizedKeyword) {
      score += 8;
      continue;
    }

    if (normalizedKeyword.includes(" ") && normalizedMessage.includes(normalizedKeyword)) {
      score += 7;
      continue;
    }

    if (normalizedMessage.includes(normalizedKeyword)) {
      score += normalizedKeyword.length >= 8 ? 4 : 2;
    }
  }

  return score;
}

function getStaticFaqThreshold(normalizedMessage: string) {
  const wordCount = normalizedMessage.split(/\s+/).filter(Boolean).length;

  if (wordCount >= 8) {
    return 6;
  }

  if (wordCount >= 5) {
    return 5;
  }

  return 4;
}

function matchStaticFaq(locale: Locale, message: string) {
  const normalizedMessage = normalizeText(message);
  let bestEntry: FaqEntry | null = null;
  let bestScore = 0;

  for (const entry of buildStaticFaqs(locale)) {
    const score = scoreFaqEntry(normalizedMessage, entry);

    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  if (!bestEntry || bestScore < getStaticFaqThreshold(normalizedMessage)) {
    return null;
  }

  return {
    id: bestEntry.id,
    answer: bestEntry.answer,
  };
}

function matchDestinationFaq(locale: Locale, message: string) {
  if (!isSimpleDestinationQuestion(message, locale)) {
    return null;
  }

  const content = getSiteContent(locale);
  const destination = content.destinations.find((entry) =>
    destinationMentionedIn(message, entry.name),
  );

  if (!destination) {
    return null;
  }

  const faqEntry = buildDestinationFaqs(locale).find((entry) =>
    entry.id.endsWith(destination.name.toLowerCase().replace(/\s+/g, "-")),
  );

  if (!faqEntry) {
    return null;
  }

  return {
    id: faqEntry.id,
    answer: faqEntry.answer,
  };
}

export function getFaqEntries(locale: Locale) {
  return [...buildStaticFaqs(locale), ...buildDestinationFaqs(locale)];
}

export function getQuickReplyFaqs(locale: Locale) {
  return buildStaticFaqs(locale).filter((entry) => entry.quickReply);
}

export function findFaqById(locale: Locale, faqId: string) {
  return getFaqEntries(locale).find((entry) => entry.id === faqId) ?? null;
}

export function matchFaqAnswer(locale: Locale, message: string) {
  const normalizedMessage = normalizeText(message);

  if (!normalizedMessage) {
    return null;
  }

  if (shouldPreferAiReply(message, locale)) {
    return null;
  }

  return matchStaticFaq(locale, message) ?? matchDestinationFaq(locale, message);
}
