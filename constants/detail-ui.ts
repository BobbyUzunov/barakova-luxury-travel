import type { Locale } from "./content";

type DetailPageCopy = {
  eyebrow: string;
  backLabel: string;
  backPath: string;
  ctaLabel: string;
  highlightsTitle: string;
  galleryTitle: string;
  galleryPhotoLabel: string;
};

type BlogPageCopy = {
  backLabel: string;
  backPath: string;
  authorLabel: string;
  ctaLabel: string;
};

export const detailUi: Record<
  Locale,
  {
    brandSubtitle: string;
    destination: DetailPageCopy;
    cruise: DetailPageCopy;
    blog: BlogPageCopy;
    notFound: {
      title: string;
      description: string;
      homeLabel: string;
    };
  }
> = {
  bg: {
    brandSubtitle: "от Богдана Баракова",
    destination: {
      eyebrow: "Луксозна дестинация",
      backLabel: "Обратно към дестинациите",
      backPath: "/destinations",
      ctaLabel: "Заявете персонална консултация",
      highlightsTitle: "Какво да очаквате",
      galleryTitle: "Вдъхновение",
      galleryPhotoLabel: "снимка",
    },
    cruise: {
      eyebrow: "Премиум круиз",
      backLabel: "Обратно към круизите",
      backPath: "/cruises",
      ctaLabel: "Заявете консултация за този круиз",
      highlightsTitle: "Какво да очаквате",
      galleryTitle: "Маршрут и атмосфера",
      galleryPhotoLabel: "снимка",
    },
    blog: {
      backLabel: "Обратно към блога",
      backPath: "/blog",
      authorLabel: "Автор",
      ctaLabel: "Заявете персонална консултация",
    },
    notFound: {
      title: "Страницата не е намерена",
      description: "Търсената страница не съществува или е преместена.",
      homeLabel: "Към началото",
    },
  },
  en: {
    brandSubtitle: "by Bogdana Barakova",
    destination: {
      eyebrow: "Luxury destination",
      backLabel: "Back to destinations",
      backPath: "/destinations",
      ctaLabel: "Request a private consultation",
      highlightsTitle: "What to expect",
      galleryTitle: "Inspiration",
      galleryPhotoLabel: "photo",
    },
    cruise: {
      eyebrow: "Premium cruise",
      backLabel: "Back to cruises",
      backPath: "/cruises",
      ctaLabel: "Request a consultation for this cruise",
      highlightsTitle: "What to expect",
      galleryTitle: "Route and atmosphere",
      galleryPhotoLabel: "photo",
    },
    blog: {
      backLabel: "Back to the blog",
      backPath: "/blog",
      authorLabel: "Author",
      ctaLabel: "Request a private consultation",
    },
    notFound: {
      title: "Page not found",
      description: "The page you are looking for does not exist or has been moved.",
      homeLabel: "Back to home",
    },
  },
};
