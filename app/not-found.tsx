import Link from "next/link";
import { detailUi } from "../constants/detail-ui";
import { defaultLocale, localePath } from "../constants/i18n";

export default function NotFound() {
  const copy = detailUi[defaultLocale].notFound;

  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <p className="not-found-code">404</p>
        <h1>{copy.title}</h1>
        <p>{copy.description}</p>
        <Link className="btn-primary" href={localePath(defaultLocale)}>
          {copy.homeLabel}
        </Link>
      </div>
    </main>
  );
}
