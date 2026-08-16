import Link from "next/link";
import { site } from "@/lib/site";
import { JsonLd, faqJsonLd } from "@/components/JsonLd";
import type { GoogleReview, GoogleReviewsPayload } from "@/lib/google-reviews";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function TrustBar() {
  return (
    <section
      aria-label="Company basics"
      className="border-y border-sand-200 bg-white"
    >
      <div className="container-site flex flex-col items-start gap-2 py-5 text-sm font-semibold text-ink-soft sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2 sm:py-6">
        <span className="text-pine-900">Licensed &amp; insured in Delaware</span>
        <span className="hidden text-sand-300 sm:inline" aria-hidden>
          ·
        </span>
        <span>Free written estimates</span>
        <span className="hidden text-sand-300 sm:inline" aria-hidden>
          ·
        </span>
        <span>Serving New Castle County</span>
      </div>
    </section>
  );
}

function stars(n: number) {
  const filled = Math.round(Math.min(5, Math.max(0, n)));
  return "★".repeat(filled) + "☆".repeat(5 - filled);
}

export function Testimonials({ data }: { data?: GoogleReviewsPayload }) {
  const payload = data ?? {
    rating: site.rating.value,
    count: site.rating.count,
    url: site.social.google,
    reviews: [],
    live: false,
  };
  const shown: GoogleReview[] = payload.reviews.slice(0, 3);

  if (shown.length === 0) return null;

  return (
    <section className="section-y">
      <div className="container-site">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Google reviews</Eyebrow>
          <h2 className="heading-display mt-3 text-3xl sm:text-[2.5rem]">
            Neighbors trust us with their yards
          </h2>
          <p className="mt-3 text-ink-soft">
            <span className="font-extrabold text-pine-900">{payload.rating.toFixed(1)}★</span>
            {" "}
            average from {payload.count}+ Google reviews
          </p>
        </div>
        <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-12">
          {shown.map((t) => (
            <figure key={`${t.author}-${t.text.slice(0, 24)}`}>
              <div
                className="text-sm text-moss-600"
                aria-label={`${t.rating} out of 5 stars`}
              >
                {stars(t.rating)}
              </div>
              <blockquote className="mt-3 text-[1.05rem] leading-relaxed text-ink">
                “{t.text}”
              </blockquote>
              <figcaption className="mt-4 text-sm font-bold text-pine-900">
                {t.author}
                <span className="font-semibold text-ink-soft">
                  {" "}
                  · Google
                  {t.relativeTime ? ` · ${t.relativeTime}` : ""}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-10 text-center">
          <a
            href={payload.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-extrabold text-pine-700 underline underline-offset-4 hover:text-pine-900"
          >
            Read more on Google →
          </a>
        </p>
      </div>
    </section>
  );
}

export interface Faq {
  q: string;
  a: string;
}

export function FaqSection({
  faqs,
  title = "Frequently asked questions",
  intro,
}: {
  faqs: Faq[];
  title?: string;
  intro?: string;
}) {
  return (
    <section className="section-y">
      <JsonLd data={faqJsonLd(faqs)} />
      <div className="container-site max-w-3xl">
        <h2 className="heading-display text-3xl sm:text-[2.5rem]">{title}</h2>
        {intro && <p className="mt-3 text-ink-soft">{intro}</p>}
        <div className="mt-7 divide-y divide-sand-200 rounded-xl border border-sand-200 bg-white">
          {faqs.map((f) => (
            <details key={f.q} className="group px-5 py-3.5 open:bg-pine-50/50 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-1 text-left font-extrabold text-pine-950 [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="text-pine-700 transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="pb-2 pt-1 text-[0.95rem] leading-relaxed text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaSection({
  title = "Ready to love your yard again?",
  body = `Call for a free, no-pressure estimate. Most quotes within 24 hours. Serving all of ${site.address.county}, Delaware.`,
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="bg-pine-900 py-14 text-white sm:py-16">
      <div className="container-site flex flex-col items-center text-center">
        <h2 className="heading-display max-w-2xl text-3xl !text-white sm:text-[2.5rem]">{title}</h2>
        <p className="mt-4 max-w-xl text-[1.05rem] text-moss-200">{body}</p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link href="/contact" className="btn-primary">
            Get My Free Estimate
          </Link>
          <a href={site.phoneHref} className="btn-ghost !border-white/30 !bg-white/10 !text-white hover:!bg-white/20">
            Call {site.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
