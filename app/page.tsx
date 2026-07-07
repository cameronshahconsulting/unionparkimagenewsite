import type { Metadata } from "next";
import Link from "next/link";
import { Scene } from "@/components/Scene";
import { TrustBar, Testimonials, FaqSection, CtaSection, Eyebrow } from "@/components/Sections";
import { YardVisualizer } from "@/components/visualizer/YardVisualizer";
import { site, services, towns, yearsInBusiness } from "@/lib/site";

export const metadata: Metadata = {
  title: `Landscaping in Wilmington, DE | ${site.name}`,
  description: `Top-rated landscaping company in Wilmington & New Castle County, DE. Patios, drainage, fencing, cleanups, lawn care & landscape design since ${site.foundedYear}. Free estimates — call ${site.phone}.`,
  alternates: { canonical: "/" },
};

const sceneByService = {
  "landscape-design": "garden",
  hardscaping: "patio",
  drainage: "drainage",
  fencing: "fence",
  "yard-cleanups": "cleanup",
  "lawn-care": "lawn",
} as const;

const homeFaqs = [
  {
    q: "How much does landscaping cost in Wilmington, DE?",
    a: "Most of our New Castle County projects fall between $500 for a seasonal cleanup and $15,000+ for a full paver patio with new plantings. Every property is different, so we give free written estimates — usually within 24 hours of your call.",
  },
  {
    q: "What areas does Union Park Landscaping serve?",
    a: "We serve all of New Castle County, Delaware, including Wilmington, Newark, Hockessin, Pike Creek, Greenville, Bear, and Middletown.",
  },
  {
    q: "Are estimates really free?",
    a: "Yes. We walk your property, talk through what you want, and give you a clear written quote at no cost and with no obligation.",
  },
  {
    q: "How does the AI yard designer work?",
    a: "Upload a photo of your yard, describe the changes you want, and optionally add inspiration photos. Our AI generates a realistic redesign of your actual yard — up to 3 designs per day, free. Pick your favorite and send it to us for a real quote.",
  },
  {
    q: "How soon can you start my project?",
    a: "Small jobs like cleanups are often scheduled within the week. Larger builds like patios and drainage systems typically start within 2–4 weeks depending on the season.",
  },
  {
    q: "Are you licensed and insured?",
    a: `Yes — ${site.name} is fully licensed and insured in Delaware, and every job is backed by our 100% satisfaction guarantee.`,
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-site grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-1.5 text-sm font-medium text-pine-900 shadow-card">
              <span className="text-clay-500">★★★★★</span> 5.0 on Google · {yearsInBusiness}+ years local
            </p>
            <h1 className="heading-display mt-5 text-4xl leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
              Your yard, done right —{" "}
              <span className="text-pine-700">and done to last.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-soft">
              Landscape design, paver patios, drainage fixes, fencing, cleanups, and
              lawn care for homeowners across {site.address.county}, Delaware.
              Family-run since {site.foundedYear}. {site.tagline}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="btn-primary">
                Get a Free Estimate
              </Link>
              <a href="#visualizer" className="btn-ghost">
                Try the AI Yard Designer ↓
              </a>
            </div>
            <p className="mt-4 text-sm text-ink-soft">
              Or call{" "}
              <a href={site.phoneHref} className="font-semibold text-pine-800 underline underline-offset-4">
                {site.phone}
              </a>{" "}
              — {site.hours.days}, {site.hours.open}–{site.hours.close}
            </p>
          </div>
          <div className="relative">
            <Scene
              variant="home"
              alt="Illustration of a landscaped Delaware home with new plantings, trees, and a walkway"
              className="aspect-[4/3] w-full rounded-3xl shadow-lift"
              priority
            />
            <div className="absolute -bottom-4 left-6 rounded-xl bg-white px-4 py-3 shadow-lift">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Satisfaction</p>
              <p className="font-display text-xl font-semibold text-pine-800">100% Guaranteed</p>
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      {/* AI Visualizer */}
      <section id="visualizer" className="scroll-mt-24 py-16 sm:py-24">
        <div className="container-site">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Free AI design tool</Eyebrow>
            <h2 className="heading-display mt-2 text-3xl sm:text-4xl">
              See your new yard before we build it
            </h2>
            <p className="mt-4 text-ink-soft">
              Upload a photo of your yard, tell us what you want changed, and our AI
              will show you a realistic redesign of <em>your actual property</em> in
              about a minute. Love one? Send it straight to us for a free estimate.
            </p>
          </div>
          <div className="mt-10">
            <YardVisualizer />
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container-site">
          <div className="max-w-2xl">
            <Eyebrow>What we do</Eyebrow>
            <h2 className="heading-display mt-2 text-3xl sm:text-4xl">
              Six trades. One trusted local crew.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="card group overflow-hidden transition-shadow hover:shadow-lift"
              >
                <Scene
                  variant={sceneByService[s.slug as keyof typeof sceneByService]}
                  alt={`${s.short} illustration`}
                  className="aspect-[16/9]"
                />
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold text-pine-950 group-hover:text-pine-700">
                    {s.short}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.blurb}</p>
                  <p className="mt-4 text-sm font-semibold text-clay-600">
                    Learn more <span aria-hidden>→</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24">
        <div className="container-site">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Simple process</Eyebrow>
            <h2 className="heading-display mt-2 text-3xl sm:text-4xl">
              From phone call to finished yard
            </h2>
          </div>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                n: "1",
                t: "Tell us what you need",
                d: `Call ${site.phone}, request an estimate online, or send us an AI design you made above. We'll respond fast — often the same day.`,
              },
              {
                n: "2",
                t: "Get a clear, free quote",
                d: "We walk your property, answer questions, and give you a written estimate with no pressure and no surprises.",
              },
              {
                n: "3",
                t: "We build it right",
                d: "Our crew shows up on time, does the work to spec, and leaves your property spotless — backed by our satisfaction guarantee.",
              },
            ].map((s) => (
              <li key={s.n} className="relative rounded-2xl border border-sand-200 bg-white p-7 shadow-card">
                <span className="font-display absolute -top-5 left-7 flex h-10 w-10 items-center justify-center rounded-full bg-pine-800 text-lg font-semibold text-white">
                  {s.n}
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold text-pine-950">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Testimonials />

      {/* Service area */}
      <section className="py-16 sm:py-24">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Local &amp; nearby</Eyebrow>
            <h2 className="heading-display mt-2 text-3xl sm:text-4xl">
              Proudly serving New Castle County
            </h2>
            <p className="mt-4 text-ink-soft">
              We&apos;re based in Wilmington and work throughout northern Delaware. If
              you&apos;re in one of these towns, you&apos;re in our service area — and
              if you&apos;re close, call us anyway.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {towns.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/service-areas/${t.slug}`}
                    className="inline-block rounded-full border border-pine-800/20 bg-white px-4 py-2 text-sm font-medium text-pine-900 transition-colors hover:border-pine-800 hover:bg-pine-50"
                  >
                    {t.name}, DE
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Scene
            variant="garden"
            alt="Illustration of a professionally landscaped garden bed with trees, shrubs, and seasonal flowers"
            className="aspect-[4/3] w-full rounded-3xl shadow-lift"
          />
        </div>
      </section>

      <FaqSection faqs={homeFaqs} />
      <CtaSection />
    </>
  );
}
