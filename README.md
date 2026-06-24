# Barakova Luxury Travel

Бутикова лендинг страница за луксозни туристически консултации на Богдана Баракова.

## Функционалности

* Премиум дизайн
* Responsive дизайн
* Бутикова визия
* Представяне на луксозни дестинации
* Лендинг страница за консултации
* Mobile-first подход
* Модерна Next.js архитектура

## Използвани технологии

* Next.js
* TypeScript
* Tailwind CSS
* React

## Стартиране локално

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

## Deploy

Проектът е подготвен за Vercel.

Production домейн:

```bash
https://barakovaluxurytravel.com
```

## Environment Variables

За контакт формата във Vercel:

```bash
RESEND_API_KEY=
CONTACT_RECIPIENT_EMAIL=bbmobile6666@gmail.com
RESEND_FROM_EMAIL=Barakova Luxury Travel <onboarding@resend.dev>
NEXT_PUBLIC_GA_ID=
```

За защита срещу спам (Cloudflare Turnstile — безплатен):

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

Създайте widget на [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) с домейна `barakovaluxurytravel.com` (и `localhost` за локално тестване).

За production rate limiting (препоръчително на Vercel):

```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Без Upstash лимитът работи in-memory (по-слаб при serverless).

След верифициране на домейна в Resend, `RESEND_FROM_EMAIL` може да бъде сменен към адрес от домейна, например:

```bash
RESEND_FROM_EMAIL=Barakova Luxury Travel <noreply@barakovaluxurytravel.com>
```

## GitHub repository

Препоръчително име на repository:

```bash
barakova-luxury-travel
```

Команди за свързване към GitHub repository:

```bash
git remote set-url origin https://github.com/<username>/barakova-luxury-travel.git
git branch -M main
git push -u origin main
```

## Автор

Богдана Баракова

## Права

All rights reserved.
