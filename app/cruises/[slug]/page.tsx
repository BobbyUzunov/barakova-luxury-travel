import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentDetailPage } from "../../content-detail-page";
import { seoCruises } from "../../../constants/seo-content";

const siteUrl = "https://barakovaluxurytravel.com";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return seoCruises.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cruise = seoCruises.find((item) => item.slug === slug);

  if (!cruise) {
    return {};
  }

  const title = `${cruise.name} – премиум круиз | Barakova Luxury Travel`;
  const description = cruise.detail;
  const canonical = `/cruises/${cruise.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      images: [{ url: cruise.image, alt: cruise.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cruise.image],
    },
  };
}

export default async function CruisePage({ params }: PageProps) {
  const { slug } = await params;
  const cruise = seoCruises.find((item) => item.slug === slug);

  if (!cruise) {
    notFound();
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: cruise.name,
    description: cruise.detail,
    image: cruise.gallery,
    url: `${siteUrl}/cruises/${cruise.slug}`,
    touristType: "Luxury cruise",
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />
      <ContentDetailPage
        backHref="/#cruises"
        backLabel="Обратно към круизите"
        ctaLabel="Заяви консултация за този круиз"
        eyebrow="Премиум круиз"
        galleryTitle="Маршрут и атмосфера"
        highlightsTitle="Какво да очаквате"
        item={cruise}
      />
    </>
  );
}
