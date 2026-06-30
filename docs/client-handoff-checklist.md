# Barakova Luxury Travel — Client Handoff Checklist

**Project:** Barakova Luxury Travel  
**Client:** Bogdana Barakova  
**Live domain:** [https://barakovaluxurytravel.com](https://barakovaluxurytravel.com)  
**Default language:** Bulgarian (`/bg`) — English at `/en`  
**Built and maintained by:** Bobby Uzunov

---

## Live URLs

| Page | URL |
|------|-----|
| Homepage (BG) | https://barakovaluxurytravel.com/bg |
| Homepage (EN) | https://barakovaluxurytravel.com/en |
| Root redirect | https://barakovaluxurytravel.com → `/bg` |

---

## Features Included

### Design & experience
- Premium, boutique landing page design
- Responsive, mobile-first layout
- Cinematic hero with Vimeo background video and static poster fallback
- Sticky “Call now” button on mobile (`0883 770 909`)
- Cookie consent banner and privacy policy page

### Content & navigation
- **12 destination** detail pages (BG + EN) with modal overlays and shareable URLs
- **6 cruise** detail pages (BG + EN)
- **3 blog** articles (BG + EN)
- About section, services, testimonials, and contact section
- Language switcher between Bulgarian and English

### Contact & communication
- Contact form with validation
- Click-to-call phone link
- Mailto link to **info@barakovaluxurytravel.com**
- Cloudflare Turnstile spam protection
- Rate limiting (Upstash Redis in production)
- Email delivery via Resend API

### SEO & technical
- Per-locale metadata, Open Graph, and hreflang tags
- XML sitemap and `robots.txt`
- 95 statically generated pages
- Security headers (CSP, HSTS)
- Optional Google Analytics (`NEXT_PUBLIC_GA_ID`)

### Email setup (current)
- Public contact address: **info@barakovaluxurytravel.com**
- This address is forwarded to the client’s Gmail inbox for day-to-day reading
- Outbound form emails are sent through Resend from the verified domain

---

## What the Client Should Test

Use this checklist before signing off on the handoff. Test on at least one phone and one desktop browser.

- [ ] Open the live site and confirm it loads without errors
- [ ] Browse the homepage sections (hero, destinations, cruises, about, blog, contact)
- [ ] Open several destination and cruise pages from cards and from direct URLs
- [ ] Submit a test message through the contact form (see steps below)
- [ ] Confirm the test email arrives in the Gmail inbox
- [ ] Call the phone number from the site and confirm it connects
- [ ] Switch between Bulgarian and English and spot-check key pages
- [ ] Accept or decline cookies and confirm the banner behaves correctly
- [ ] Read the privacy policy page in both languages

---

## Contact Form — Test Steps

1. Go to **https://barakovaluxurytravel.com/bg** (repeat on `/en`).
2. Scroll to the contact section or use the navigation link.
3. Fill in all required fields:
   - Name
   - Email (use a real address you can check)
   - Message
4. Complete the Cloudflare Turnstile challenge if shown.
5. Submit the form.
6. Confirm a success message appears in the correct language.
7. Check **info@barakovaluxurytravel.com** (forwarded to Gmail) within a few minutes.
8. Verify the email contains the name, reply-to address, and message text.
9. Reply to the notification email to confirm replies reach the visitor.

**If the form fails:** note the error message, browser, device, and time — then contact Bobby Uzunov.

---

## Email Delivery Checklist

These items are configured in Vercel and Resend (not in the website UI). Confirm with your technical contact if anything is unclear.

- [ ] Domain **barakovaluxurytravel.com** is verified in [Resend](https://resend.com)
- [ ] Vercel environment variables are set for Production:
  - `RESEND_API_KEY`
  - `CONTACT_RECIPIENT_EMAIL` → `info@barakovaluxurytravel.com`
  - `RESEND_FROM_EMAIL` → `Barakova Luxury Travel <info@barakovaluxurytravel.com>`
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`
  - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (recommended)
- [ ] Turnstile widget allows `barakovaluxurytravel.com` (and `localhost` for development)
- [ ] Test submission delivers to the Gmail inbox via forwarding
- [ ] Sender address is not marked as spam (check Promotions/Spam folders on first test)
- [ ] Optional: `NEXT_PUBLIC_GA_ID` set if Google Analytics is desired

---

## Mobile Checklist

Test on iPhone (Safari) and Android (Chrome) if possible.

- [ ] Homepage loads quickly; hero poster image appears before video
- [ ] Vimeo background video plays (muted, looping) where supported
- [ ] Hero text remains readable over video and poster
- [ ] Sticky **“Обади се веднага”** / **“Call now”** button is visible and taps through to the phone dialer
- [ ] Sticky call button does not overlap the cookie banner awkwardly
- [ ] Navigation and section links scroll smoothly
- [ ] Destination/cruise modals open and close correctly; URL updates in the address bar
- [ ] Contact form fields are easy to tap; keyboard does not hide the submit button
- [ ] Turnstile challenge works on mobile
- [ ] Language switcher works on small screens
- [ ] No horizontal scrolling or clipped text

---

## BG / EN Language Checklist

| Check | BG (`/bg`) | EN (`/en`) |
|-------|------------|------------|
| Homepage hero and CTAs | [ ] | [ ] |
| Navigation labels | [ ] | [ ] |
| Destinations section and detail pages | [ ] | [ ] |
| Cruises section and detail pages | [ ] | [ ] |
| Blog section and articles | [ ] | [ ] |
| About and services copy | [ ] | [ ] |
| Contact form labels and success/error messages | [ ] | [ ] |
| Cookie banner and privacy policy | [ ] | [ ] |
| Page title and browser tab text | [ ] | [ ] |
| Phone CTA: „Обади се веднага“ / “Call now” | [ ] | [ ] |

**Language switcher:** switching locale should keep you on the equivalent section or page where possible.

**Sample deep links to verify:**

- BG destination: `https://barakovaluxurytravel.com/bg/destinations/maldives`
- EN destination: `https://barakovaluxurytravel.com/en/destinations/maldives`
- BG blog: `https://barakovaluxurytravel.com/bg/blog/maldives-beyond-the-photos`
- EN blog: `https://barakovaluxurytravel.com/en/blog/maldives-beyond-the-photos`

---

## Future Improvements (Not in Current Scope)

These are optional enhancements for a later phase — the current site is complete for launch.

### Content & media
- Replace Unsplash stock images with the client’s own destination and cruise photography
- Add higher-resolution hero poster image for very large screens
- Update About section photos with additional client portraits
- Publish more blog articles over time

### Product & admin
- Content and image updates are made by Bobby Uzunov via the codebase
- A self-service CMS may be considered in a future phase if needed

### Technical polish (optional)
- Add higher-resolution hero source photo (current file is 1024px wide)
- Replace Unsplash stock images with client photography
- Further analytics and conversion tracking beyond basic GA

---

## Support & Maintenance

| Item | Detail |
|------|--------|
| Website | Built and maintained by **Bobby Uzunov** |
| Hosting | Vercel (deploys from `main` branch on GitHub) |
| Contact email | **info@barakovaluxurytravel.com** (forwarded to Gmail) |
| Phone on site | **0883 770 909** |

For content updates, bug reports, or new features, contact Bobby Uzunov.

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Client | Bogdana Barakova | | |
| Developer | Bobby Uzunov | | |

**Notes:**

---

*Document version: handoff checklist — June 2025*
