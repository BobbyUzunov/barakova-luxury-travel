import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentDetailPage } from "../../content-detail-page";
import { seoDestinations } from "../../../constants/seo-content";

const siteUrl = "https://barakovaluxurytravel.com";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return seoDestinations.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const destination = seoDestinations.find((item) => item.slug === slug);

  if (!destination) {
    return {};
  }

  const title = `${destination.name} – луксозно пътуване | Barakova Luxury Travel`;
  const description = destination.detail;
  const canonical = `/destinations/${destination.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      images: [{ url: destination.image, alt: destination.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [destination.image],
    },
  };
}

export default async function DestinationPage({ params }: PageProps) {
  const { slug } = await params;
  const destination = seoDestinations.find((item) => item.slug === slug);

  if (!destination) {
    notFound();
  }

  const pageUrl = `${siteUrl}/destinations/${destination.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: destination.name,
    description: destination.detail,
    image: destination.gallery,
    url: pageUrl,
    touristType: "Luxury travel",
  };

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />
      <ContentDetailPage
        backHref="/#destinations"
        backLabel="Обратно към дестинациите"
        ctaLabel="Заяви персонална консултация"
        eyebrow="Луксозна дестинация"
        galleryTitle="Вдъхновение"
        highlightsTitle="Какво да очаквате"
        item={destination}
      />
    </>
  );
}
