# Celina

**🟢 Live in production: [celinaeda.ru](https://celinaeda.ru)**

Marketplace for home-cooked food, built for the Russian market. Released to the world in July 2026 — site and API serving since.

Verified home cooks sell to neighbours in their own city. Delivery or pickup, cash on handover, identity verification for every cook, composition and allergens on every dish, reviews only from real orders.

I built all of it myself: product, backend, frontend, infrastructure, SEO and the legal layer.

## Scope

| What | Amount |
|---|---|
| TypeScript (backend + frontend) | 24,124 lines |
| REST route modules | 14 |
| React pages | 43 |
| Prerendered URLs | 108 |
| Legal sections (RU + EN) | 92 |
| Blog articles (RU + EN) | 49 |

TypeScript on both sides. Node, Express and Prisma with SQLite on the server. React 18, Vite and Tailwind on the client, prerendered with `vite-react-ssg`. One Docker image serves the API and the prerendered frontend from the same origin, so the client uses relative `/api` paths and there is no CORS setup to get wrong.

## The interesting parts

**SEO prerendering, two languages.** [`frontend/vite.config.ts`](frontend/vite.config.ts), [`frontend/src/pages/seo/`](frontend/src/pages/seo/)

Yandex does not reliably execute JavaScript, so every public page is built to real HTML at compile time: city landings, category×city pages, dish pages and the blog, plus a generated `sitemap.xml` and a Yandex Turbo feed. The same components hydrate on the client, so it stays one codebase.

**Search that survives typos and two alphabets.** [`frontend/src/lib/aiSearch.ts`](frontend/src/lib/aiSearch.ts)

`borsht`, `borcht`, `борщь` and `борщ` all find the same dish. Levenshtein distance over a synonym dictionary, latin to cyrillic transliteration, phonetic folding (`щ` to `ш`, `ё` to `е`). The query parser pulls rating, radius, city and "open now" out of free text like `борщ 4 звезды рядом 500 метров`.

One detail worth knowing if you write regexes for Safari: lookbehind throws a `SyntaxError` at module level on iOS 15. Not at runtime, at parse time, which takes down the whole app. The parser captures the preceding character instead.

**Serving passport scans without leaking them.** [`backend/src/routes/uploads.routes.ts`](backend/src/routes/uploads.routes.ts)

Verification documents are stored outside the static directory and served by an authorised route. Owner or operator only, and the operator additionally needs an active two-factor session. File extensions come from the verified MIME type, never from the filename the client sent. Otherwise an upload declaring `image/png` but named `x.html` comes back as HTML from your own origin, which is stored XSS.

**Sessions.** [`backend/src/lib/session.ts`](backend/src/lib/session.ts), [`backend/src/middleware/auth.ts`](backend/src/middleware/auth.ts)

Every JWT carries a session id. Sessions are listed per device and can be revoked one at a time or all at once. A password change invalidates every token issued before it, including older tokens that predate session ids, using a `sessionsRevokedAt` timestamp on the user.

**Legal text lives in the repo.** [`frontend/src/components/LegalContent.tsx`](frontend/src/components/LegalContent.tsx)

Personal data and biometric consent, consumer protection duties, marketplace disclosure under the platform economy law, and the mandatory product marking rules that limit what a self-employed cook is allowed to sell. Russian and English. Keeping it in code means it changes through review like everything else.

## Running it

```bash
cp backend/.env.example backend/.env      # set JWT_SECRET and SMTP_*
docker compose up -d --build
```

Create the operator account. There are no default credentials and the script exits if you omit them:

```bash
docker compose exec celina env \
  FOUNDER_PHONE=+70000000000 \
  FOUNDER_EMAIL=you@example.com \
  FOUNDER_PASSWORD='<a strong password>' \
  npm run create-founder
```

Without Docker:

```bash
cd backend  && npm install && npx prisma db push && npm run seed && npm run dev
cd frontend && npm install && npm run dev
```

## Current state

The product is finished and running: ordering, delivery tracking, identity verification, gatherings, reviews, the operator dashboard and the legal layer all work end to end.

Celina launched in Russia in July 2026 and is onboarding its first cooks. The platform is complete; the marketplace is in its early days — worth saying plainly, since finished code and a mature marketplace are different things.

## Also here

[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`DEPLOY.md`](DEPLOY.md).

No credentials anywhere in the tree; everything sensitive is read from the environment. Business material, operational data, large media and anything holding personal data of users or third parties is left out on purpose, including the promo video the About page links to.

MIT licensed.
