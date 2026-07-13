# Barakova Luxury Travel

Двуезичен (BG/EN) уебсайт за луксозни туристически консултации на **Богдана Баракова**.

**Live:** [barakovaluxurytravel.com](https://barakovaluxurytravel.com)

## Функционалности

- Премиум, mobile-first дизайн с бутикова визия
- Двуезични маршрути `/bg` и `/en` със server-rendered `lang` и статично генерирани страници (SSG)
- Секции: услуги, дестинации, круизи, блог, процес, контакт
- Детайлни страници за дестинации, круизи и блог постове + intercepting modals
- Контактна форма с **Cloudflare Turnstile**, имейл чрез **Resend**
- Хибриден **AI асистент** (FAQ + OpenAI fallback)
- Фоново hero видео чрез **Vimeo** embed
- Cookie consent банер + **Google Analytics** (само след съгласие)
- Политика за поверителност (`/bg/privacy`, `/en/privacy`)
- Security headers (CSP, HSTS, X-Frame-Options и др.)
- Rate limiting (Upstash Redis в production, in-memory fallback)
- Accessibility: focus trap, inert locks, keyboard navigation за меню, cookie dialog и AI панел

## Технологии

- **Next.js 16** (App Router, Turbopack)
- **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Vercel** (hosting)
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
| `npm run test` | Unit тестове (`lib/**/*.test.ts`) |
| `npm run qa:a11y` | Browser keyboard QA (Playwright; изисква `npm start`) |
| `npm run optimize-images` | WebP оптимизация на hero/profile |
| `npm run generate-icons` | PWA и iOS икони от `app/icon.svg` |

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
   - AI асистент (FAQ и сложен въпрос)
   - Cookie banner + `/bg/privacy`, `/en/privacy`
   - Невалиден slug → HTTP 404 (напр. `/en/destinations/not-real`)

## Качване на снимки за дестинации

WebP файлове в `public/images/destinations/` по slug:

```text
public/images/destinations/maldives.webp
public/images/destinations/mediterranean.webp
```

Ако файлът съществува, сайтът го ползва вместо Unsplash.

## Структура на проекта (накратко)

```text
app/[locale]/          # BG/EN страници и layouts
app/api/contact/       # Контактна форма API
app/api/chat/          # AI асистент API
constants/             # Съдържание, privacy, SEO slugs
lib/                   # Helpers, rate limit, a11y, Turnstile
proxy.ts               # Redirects, locale 404, legacy paths
scripts/               # Image/icon tooling, a11y QA
```

## Privacy и трети страни

Политиката за поверителност описва обработката на данни от:

- **Google Analytics** (със съгласие)
- **Cloudflare Turnstile** (контактна форма)
- **Vimeo** (вградено hero видео)
- **OpenAI** (AI асистент при сложни въпроси)
- **Resend**, **Vercel**, **Upstash**

## GitHub

```text
https://github.com/BobbyUzunov/barakova-luxury-travel
```

## Автор

Богдана Баракова · Barakova Luxury Travel

## Права

All rights reserved.
