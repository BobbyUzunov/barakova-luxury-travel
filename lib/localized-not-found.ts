import type { Locale } from "../constants/content";
import { detailUi } from "../constants/detail-ui";
import { isHubPath } from "../constants/hub-pages";
import { localePath } from "../constants/i18n";
import { blogSlugs, cruiseSlugs, destinationSlugs } from "../constants/seo-slugs";

const slugsBySection = {
  blog: new Set<string>(blogSlugs),
  cruises: new Set<string>(cruiseSlugs),
  destinations: new Set<string>(destinationSlugs),
} as const;

const standalonePages = new Set(["privacy", "cookies"]);

export function isKnownLocalizedPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 1) {
    return true;
  }

  if (segments.length === 2) {
    const page = segments[1];
    return standalonePages.has(page) || isHubPath(page);
  }

  if (segments.length !== 3) {
    return false;
  }

  const section = segments[1] as keyof typeof slugsBySection;
  const slug = segments[2];
  const knownSlugs = slugsBySection[section];

  return Boolean(knownSlugs && slug && knownSlugs.has(slug));
}

export function renderLocalizedNotFoundDocument(locale: Locale) {
  const copy = detailUi[locale].notFound;
  const title = locale === "bg" ? "Страницата не е намерена" : "Page not found";

  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="robots" content="noindex, nofollow">
    <title>404 | Barakova Luxury Travel</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; background: #f8f3ec; color: #2d2a26; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      main { min-height: 100vh; display: grid; place-items: center; padding: 1.5rem; background: radial-gradient(circle at 50% 20%, rgba(200,169,106,.2), transparent 28rem), linear-gradient(180deg, #f8f3ec, #e8dcc8); }
      article { width: min(100%, 34rem); padding: clamp(2rem, 7vw, 4rem); border: 1px solid rgba(200,169,106,.28); border-radius: 1.75rem; background: rgba(255,255,255,.72); box-shadow: 0 24px 70px rgba(45,42,38,.12); text-align: center; }
      .code { margin: 0; color: #7a6652; font: 700 clamp(3.5rem, 18vw, 7rem)/.9 Georgia, "Times New Roman", serif; }
      h1 { margin: 1rem 0 .75rem; font: 700 clamp(1.8rem, 7vw, 3rem)/1.08 Georgia, "Times New Roman", serif; }
      .description { margin: 0 auto 1.75rem; max-width: 26rem; color: rgba(45,42,38,.68); line-height: 1.7; }
      a { display: inline-flex; min-height: 3rem; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,.55); border-radius: 999px; padding: 1rem 1.35rem; background: linear-gradient(135deg, #ddc486, #c8a96a); color: #2d2a26; font-size: .76rem; font-weight: 800; letter-spacing: .08em; text-decoration: none; text-transform: uppercase; box-shadow: 0 18px 44px rgba(122,102,82,.22); }
      a:focus-visible { outline: 3px solid rgba(122,102,82,.55); outline-offset: 4px; }
    </style>
  </head>
  <body>
    <main>
      <article>
        <p class="code">404</p>
        <h1>${title}</h1>
        <p class="description">${copy.description}</p>
        <a href="${localePath(locale)}">${copy.homeLabel}</a>
      </article>
    </main>
  </body>
</html>`;
}
