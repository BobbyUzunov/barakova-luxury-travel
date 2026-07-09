import type { Locale } from "../constants/content";
import { getSiteContent } from "../constants/content-by-locale";
import {
  contactEmail,
  contactPhoneDisplay,
} from "../constants/site";

export type FaqEntry = {
  id: string;
  keywords: string[];
  answer: string;
  quickReply?: string;
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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
          "услуги",
          "услуга",
          "предлагате",
          "помагате",
          "правите",
          "консултация",
          "луксозни",
          "почивки",
        ],
        answer: `Предлагам персонални консултации за луксозни пътувания:\n\n${servicesList}\n\nАко искате, мога да насоча към контакт формата за персонално предложение.`,
      },
      {
        id: "process",
        quickReply: "Как работи процесът?",
        keywords: [
          "процес",
          "как работи",
          "стъпки",
          "консултация",
          "започва",
          "процедура",
          "какво следва",
        ],
        answer: `${content.processSection.title}:\n\n${stepsList}\n\n${content.processSection.description ?? ""}`,
      },
      {
        id: "contact",
        quickReply: "Как да се свържа с вас?",
        keywords: [
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
          "безплатна",
          "безплатно",
          "цена",
          "такса",
          "заплащане",
          "консултация",
          "първоначална",
        ],
        answer:
          "Първоначалната консултация е безплатна. След като споделите какво търсите, подготвям внимателно подбрани предложения според вашия стил, бюджет и предпочитания.",
      },
      {
        id: "destinations",
        quickReply: "Кои дестинации предлагате?",
        keywords: [
          "дестинации",
          "дестинация",
          "къде",
          "маршрути",
          "предлагате",
          "пътуване",
        ],
        answer: `Работя с внимателно подбрани луксозни дестинации, включително: ${destinationsList}. Мога да разкажа повече за конкретна дестинация, ако попитате.`,
      },
      {
        id: "cruises",
        quickReply: "Имате ли круизи?",
        keywords: ["круиз", "круизи", "кораб", "море", "река"],
        answer: `Да, предлагам и луксозни круизи, включително: ${cruisesList}. Мога да помогна с избор според сезона, стила и бюджета ви.`,
      },
      {
        id: "about",
        quickReply: "Кой е Barakova Luxury Travel?",
        keywords: [
          "богдана",
          "баракова",
          "barakova",
          "за вас",
          "за мен",
          "консултант",
          "опит",
        ],
        answer: `${content.about.title}\n\n${content.about.intro}\n\n${content.about.mission}`,
      },
      {
        id: "budget",
        quickReply: "Какъв бюджет е нужен?",
        keywords: [
          "бюджет",
          "цена",
          "цени",
          "колко",
          "струва",
          "разходи",
          "луксозно",
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
        "services",
        "service",
        "offer",
        "help",
        "consulting",
        "luxury",
        "vacations",
      ],
      answer: `I offer personal luxury travel consulting:\n\n${servicesList}\n\nI can also guide you to the contact form for a tailored proposal.`,
    },
    {
      id: "process",
      quickReply: "How does the process work?",
      keywords: [
        "process",
        "how it works",
        "steps",
        "consultation",
        "procedure",
        "what happens next",
      ],
      answer: `${content.processSection.title}:\n\n${stepsList}\n\n${content.processSection.description ?? ""}`,
    },
    {
      id: "contact",
      quickReply: "How can I contact you?",
      keywords: [
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
        "free",
        "fee",
        "price",
        "cost",
        "consultation",
        "initial",
        "charge",
      ],
      answer:
        "The initial consultation is free. Once you share what you are looking for, I prepare carefully selected proposals based on your style, budget, and preferences.",
    },
    {
      id: "destinations",
      quickReply: "Which destinations do you offer?",
      keywords: [
        "destinations",
        "destination",
        "where",
        "routes",
        "travel",
      ],
      answer: `I work with carefully selected luxury destinations, including: ${destinationsList}. Ask about a specific destination and I can share more details.`,
    },
    {
      id: "cruises",
      quickReply: "Do you offer cruises?",
      keywords: ["cruise", "cruises", "ship", "sea", "river"],
      answer: `Yes, I also offer luxury cruises, including: ${cruisesList}. I can help you choose based on season, style, and budget.`,
    },
    {
      id: "about",
      quickReply: "Who is Barakova Luxury Travel?",
      keywords: [
        "bogdana",
        "barakova",
        "about",
        "consultant",
        "who",
        "experience",
      ],
      answer: `${content.about.title}\n\n${content.about.intro}\n\n${content.about.mission}`,
    },
    {
      id: "budget",
      quickReply: "What budget should I plan for?",
      keywords: [
        "budget",
        "price",
        "prices",
        "cost",
        "how much",
        "expensive",
        "luxury",
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
    keywords: [
      destination.name.toLowerCase(),
      ...destination.name.toLowerCase().split(/\s+/),
      ...destination.highlights
        .flatMap((highlight) => highlight.toLowerCase().split(/\s+/))
        .filter((word) => word.length > 4),
    ],
    answer: `${destination.name}: ${destination.description}\n\n${destination.detail}`,
  }));
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

  let bestEntry: FaqEntry | null = null;
  let bestScore = 0;

  for (const entry of getFaqEntries(locale)) {
    let score = 0;

    for (const keyword of entry.keywords) {
      const normalizedKeyword = normalizeText(keyword);

      if (!normalizedKeyword) {
        continue;
      }

      if (normalizedMessage === normalizedKeyword) {
        score += 6;
        continue;
      }

      if (normalizedMessage.includes(normalizedKeyword)) {
        score += normalizedKeyword.length >= 8 ? 4 : 2;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  if (!bestEntry || bestScore < 3) {
    return null;
  }

  return {
    id: bestEntry.id,
    answer: bestEntry.answer,
  };
}
