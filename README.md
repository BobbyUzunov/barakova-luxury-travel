# Barakova Luxury Travel

Двуезичен (BG/EN) уебсайт за луксозни туристически консултации на **Богдана Баракова**.

**Live:** [barakovaluxurytravel.com](https://barakovaluxurytravel.com)  
**Repo:** [github.com/BobbyUzunov/barakova-luxury-travel](https://github.com/BobbyUzunov/barakova-luxury-travel)

## Функционалности

- Премиум, mobile-first дизайн с бутикова визия
- Двуезични маршрути `/bg` и `/en` със server-rendered `lang` и 96 статично генерирани страници (SSG)
- Секции: услуги, дестинации, круизи, блог, процес, контакт
- Детайлни страници за дестинации, круизи и блог постове + intercepting modals (shareable URL)
- Контактна форма с валидация, **Cloudflare Turnstile** и имейл чрез **Resend**
- Хибриден **AI асистент** (FAQ + OpenAI fallback) — свободен текст, без quick replies
- Sticky **Call now** бутон на mobile (`0883 770 909`)
- Фоново hero видео чрез **Vimeo** embed + статичен poster
- Cookie consent банер + **Google Analytics** (само след съгласие)
- Политика за поверителност (`/bg/privacy`, `/en/privacy`)
- Security headers в production (CSP, HSTS, X-Frame-Options и др.; изключени в `next dev`)
- Rate limiting (Upstash Redis в production, in-memory fallback)
- Accessibility: focus trap, inert locks върху `#app-content` (модалите са извън него), keyboard navigation за меню, cookie dialog, destination/blog modals и AI панел

## Технологии

- **Next.js 16.3** (App Router, Turbopack)
- **React 19** + **TypeScript**
- **Tailwind CSS 4.3**
- **Vercel** (hosting, deploy от `main`)
- **Resend** · **Cloudflare Turnstile** · **Upstash Redis** · **OpenAI** · **Vimeo**

## Стартиране локално

```bash
npm install
cp .env.example .env.local   # попълнете нужните ключове
npm run dev
```

Отворете [http://localhost:3000](http://localhost:3000) — root пренасочва към `/bg`.

## Скриптове

| Команда | Описание |
|---------|----------|
| `npm run dev` | Development сървър |
| `npm run build` | Production build |
| `npm run start` | Production сървър |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` (вкл. тестовете) |
| `npm run test` | Unit тестове (`lib/**/*.test.ts`) |
| `npm run qa:a11y` | Browser keyboard QA с Playwright (`QA_BASE_URL`, по подразбиране `http://127.0.0.1:3010`) |
| `npm run optimize-images` | WebP оптимизация на hero/profile |
| `npm run generate-icons` | PWA и iOS икони от `app/icon.svg` |

За `qa:a11y` първо стартирайте production сървър на същия порт, например:

```bash
npm run build
npm run start -- --port 3010
npm run qa:a11y
```

## Environment variables

Копирайте `.env.example` → `.env.local` (локално) или добавете в **Vercel → Settings → Environment Variables** (Production + Preview).

### Контактна форма (Resend)

```bash
RESEND_API_KEY=
CONTACT_RECIPIENT_EMAIL=info@barakovaluxurytravel.com
RESEND_FROM_EMAIL=Barakova Luxury Travel <info@barakovaluxurytravel.com>
```

### Spam защита (Cloudflare Turnstile)

И двата ключа са **задължителни** за пълна защита (widget + server verify):

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

Създайте widget на [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) с домейн `barakovaluxurytravel.com` (и `localhost` за локално тестване).

### AI асистент (OpenAI)

```bash
OPENAI_API_KEY=
OPENAI_CHAT_MODEL=gpt-4o-mini
```

Без `OPENAI_API_KEY` асистентът отговаря само от вградените FAQ.

### Rate limiting (Upstash — препоръчително в production)

```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### Аналитика (по избор)

```bash
NEXT_PUBLIC_GA_ID=
```

## Vercel checklist (production)

1. Свържете GitHub repo с Vercel и deploy от `main`
2. Добавете всички environment variables (виж по-горе)
3. В **Resend** верифицирайте домейна `barakovaluxurytravel.com`
4. В **Cloudflare Turnstile** добавете hostname-ите на сайта
5. След deploy проверете:
   - `/bg` и `/en` — коректен `html lang`
   - Контактна форма + Turnstile widget
   - Sticky call бутон на телефон (`tel:+359883770909`)
   - AI асистент (FAQ и сложен въпрос; Escape връща фокус към launcher)
   - Destination/blog modal: close и CTA са кликаеми
   - Cookie banner + `/bg/privacy`, `/en/privacy`
   - Невалиден slug → HTTP 404 (напр. `/en/destinations/not-real`)

Клиентски чеклист за предаване: [`docs/client-handoff-checklist.md`](docs/client-handoff-checklist.md)

## Качване на снимки за дестинации

WebP файлове в `public/images/destinations/` по slug:

```text
public/images/destinations/maldives.webp
public/images/destinations/mediterranean.webp
```

Ако файлът съществува, сайтът го ползва вместо Unsplash.

## Структура на проекта (накратко)

```text
app/[locale]/          # BG/EN страници, layouts и intercepting modals
app/api/contact/       # Контактна форма API
app/api/chat/          # AI асистент API
constants/             # Съдържание, privacy, SEO slugs
lib/                   # Helpers, rate limit, a11y, Turnstile
proxy.ts               # Redirects, locale 404, legacy paths
docs/                  # Client handoff checklist
scripts/               # Image/icon tooling, a11y QA
```

Intercepting `{modal}` се рендерира **извън** `#app-content`, за да не се заключват диалозите с `inert`.

## Privacy и трети страни

Политиката за поверителност описва обработката на данни от:

- **Google Analytics** (със съгласие)
- **Cloudflare Turnstile** (контактна форма)
- **Vimeo** (вградено hero видео)
- **OpenAI** (AI асистент при сложни въпроси)
- **Resend**, **Vercel**, **Upstash**

## Автор

Богдана Баракова · Barakova Luxury Travel  
Разработка и поддръжка: Bobby Uzunov

## Права

All rights reserved.
