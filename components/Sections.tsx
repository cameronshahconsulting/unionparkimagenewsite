import Link from "next/link";
import { site, yearsInBusiness } from "@/lib/site";
import { JsonLd, faqJsonLd } from "@/components/JsonLd";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function TrustBar() {
  const items = [
    { stat: `${yearsInBusiness}+`, label: "Years serving New Castle County" },
    { stat: "5.0★", label: "Google rating from local homeowners" },
    { stat: "100%", label: "Satisfaction guarantee on every job" },
    { stat: "24hr", label: "Typical estimate turnaround" },
  ];
  return (
    <section aria-label="Why homeowners choose us" className="border-y border-sand-200 bg-white">
      <div className="container-site grid grid-cols-2 gap-6 py-8 sm:grid-cols-4 sm:gap-8 sm:py-9">
        {items.map((i) => (
          <div key={i.label} className="text-center sm:text-left">
            <p className="text-2xl font-extrabold tracking-tight text-pine-800 sm:text-3xl">{i.stat}</p>
            <p className="mt-1 text-xs font-semibold leading-snug text-ink-soft sm:text-sm">{i.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const testimonials = [
  {
    quote:
      "The price quoted was reasonable and the work was done the very next day. Our beds have never looked better.",
    name: "Verified Google review",
    town: "Wilmington, DE",
  },
  {
    quote:
      "They responded immediately, showed up when they said they would, and the crew left everything spotless.",
    name: "Verified Google review",
    town: "New Castle County, DE",
  },
  {
    quote:
      "Fair, fast, and the quality speaks for itself. We've already booked them for our fall cleanup.",
    name: "Verified Google review",
    town: "Newark, DE",
  },
];

export function Testimonials() {
  return (
    <section className="section-y">
      <div className="container-site">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>5.0 stars on Google</Eyebrow>
          <h2 className="heading-display mt-2 text-3xl sm:text-[2.5rem]">
            Neighbors trust us with their yards
          </h2>
        </div>
        <div className="mt-10 grid gap-8 border-t border-sand-200 pt-10 md:grid-cols-3 md:gap-10">
          {testimonials.map((t) => (
            <figure key={t.quote}>
              <div className="text-sm text-clay-500" aria-label="5 out of 5 stars">
                {"★★★★★"}
              </div>
              <blockquote className="mt-3 text-[1.05rem] leading-relaxed text-ink">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-4 text-sm font-bold text-ink-soft">
                {t.name} · {t.town}
              </figcaption>
            </figure>
          ))}
        </div>
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
  body = `Call for a free, no-pressure estimate — most quotes within 24 hours. Serving all of ${site.address.county}, Delaware.`,
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="bg-pine-900 py-12 text-white sm:py-16">
      <div className="container-site flex flex-col items-center text-center">
        <h2 className="heading-display max-w-2xl text-3xl !text-white sm:text-[2.5rem]">{title}</h2>
        <p className="mt-3 max-w-xl text-[1.05rem] text-pine-100">{body}</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link href="/contact" className="btn-primary">
            Get My Free Estimate
          </Link>
          <a href={site.phoneHref} className="btn-on-dark">
            Call {site.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
