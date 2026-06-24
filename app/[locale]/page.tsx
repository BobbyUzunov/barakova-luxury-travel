import { notFound } from "next/navigation";
import { HomePage } from "../components/home/home-page";
import { isLocale } from "../../constants/i18n";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <HomePage locale={locale} />;
}
