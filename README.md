# Union Park Landscaping — unionparklandscape.com

Modern Next.js rebuild of the Union Park Landscaping site (Wilmington, DE), designed for conversion, SEO/AEO, and an AI Yard Visualizer lead engine.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Gemini (image gen + analysis) · Resend (lead emails) · Upstash Redis (rate limiting) · Vercel

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

With no env vars set, the site runs in **demo mode**: the AI visualizer echoes the uploaded photo with sample analysis, and lead "emails" are written to `.lead-outbox/` instead of being sent. The full flow is testable without any keys.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Purpose | Where to get it |
| --- | --- | --- |
| `GEMINI_API_KEY` | AI yard designs + plant/materials analysis | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (pay-per-image, ~$0.04–0.13/design) |
| `RESEND_API_KEY` | Sends lead + confirmation emails | [resend.com](https://resend.com) (free tier: 100/day) |
| `LEAD_EMAIL_TO` | Where leads land (default `unionparklandscaping@gmail.com`) | — |
| `LEAD_EMAIL_FROM` | Verified sender. Until the domain is verified in Resend, leave unset to use `onboarding@resend.dev` | Resend → Domains |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Enforces the 3-designs/day limit across serverless instances (**required in production**; dev falls back to in-memory) | Vercel dashboard → Storage → Upstash for Redis, or [console.upstash.com](https://console.upstash.com) |
| `GEMINI_IMAGE_MODEL` / `GEMINI_TEXT_MODEL` | Optional model overrides (defaults: `gemini-3.1-flash-image`, `gemini-2.5-flash`) | — |
| `MOCK_AI=true` | Force demo mode even with keys set | — |

## Deploying to Vercel

1. Push this repo to GitHub, then **vercel.com → New Project → import the repo**. The defaults (Next.js preset) are correct.
2. In the project's **Settings → Environment Variables**, add everything from the table above.
3. **Storage → Create → Upstash for Redis** (free) — this injects the `UPSTASH_*` vars automatically.
4. Deploy, then test the visualizer and both forms on the preview URL **before** switching the domain.
5. **Domain cutover:** in Vercel → Domains, add `unionparklandscape.com` + `www`, then update DNS at the registrar as instructed. Old Squarespace URLs (`/hardscaping`, etc.) 301 to the new paths automatically.

## Launch checklist (SEO/AEO)

- [ ] Verify the domain in [Google Search Console](https://search.google.com/search-console) and submit `https://www.unionparklandscape.com/sitemap.xml`
- [ ] Update the **Google Business Profile** website link to the new site; keep name/phone/hours identical to the site footer (NAP consistency)
- [ ] Verify the sending domain in Resend and set `LEAD_EMAIL_FROM=Union Park Landscaping <estimates@unionparklandscape.com>`
- [ ] Ask happy customers for Google reviews — the review count feeds the site's rating schema (update `rating.count` in `lib/site.ts` as it grows)
- [ ] Add one blog post a month (see below) — consistency is what builds AI-search visibility

## Editing content

- **Business facts** (phone, hours, towns, rating): `lib/site.ts`
- **Service page copy**: `content/services.ts`
- **Town page copy**: `content/towns.ts`
- **Blog posts**: add a `.mdx` file to `content/blog/` with `title`, `description`, `date`, `category` frontmatter — it appears in the blog, sitemap, and `llms.txt` automatically. Write for AEO: open with a direct answer in bold, use question-style headings, include a cost table where relevant, and link to service pages.
- **Real project photos**: drop files in `public/photos/` and set the `photo` prop where `<Scene>` is used (see the swap guide in `app/gallery/page.tsx`). Illustrated placeholders render until then.

## How the AI Yard Visualizer works

1. Customer uploads a yard photo (compressed client-side), describes changes, optionally picks styles and adds up to 3 inspiration photos.
2. `POST /api/visualize` → rate-limit check (3/day per visitor cookie, 9/day per IP, failed generations refunded) → Gemini image model edits the photo (prompt constrains it to landscaping-only changes, preserving the house/structures) → a second Gemini call compares before/after and produces a structured takeoff: trees, shrubs, flowers (name + quantity + size), materials, and labor notes.
3. Customer picks a favorite and submits the estimate form → `POST /api/lead` → **team email** (customer info + both images attached + takeoff table) and a **customer confirmation** with their design attached.

Spam controls: honeypot field, per-IP lead cap, zod validation, strict image-type/size limits.

## Commands

```bash
npm run dev      # dev server
npm run build    # production build (34 static pages + 2 API routes)
npm run lint     # eslint
```
