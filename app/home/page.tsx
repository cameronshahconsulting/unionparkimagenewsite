import type { Metadata } from "next";
import Link from "next/link";
import { Scene } from "@/components/Scene";
import { TrustBar, Testimonials, FaqSection, CtaSection, Eyebrow } from "@/components/Sections";
import { GardenDesigner } from "@/components/designer/GardenDesigner";
import { site, services, towns } from "@/lib/site";
import { photos, servicePhotos } from "@/lib/photos";
import { getGoogleReviews } from "@/lib/google-reviews";
import "@/app/designer.css";

export const metadata: Metadata = {
  title: `Landscaping in Wilmington, DE | ${site.name}`,
  description: `Top-rated landscaping company in Wilmington & New Castle County, DE. Patios, drainage, fencing, cleanups, lawn care & landscape design since ${site.foundedYear}. Free estimates. Call ${site.phone}.`,
  alternates: { canonical: "/home" },
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
    a: "Most of our New Castle County projects fall between $500 for a seasonal cleanup and $15,000+ for a full paver patio with new plantings. Every property is different, so we give free written estimates, usually within 24 hours of your call.",
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
    a: "Upload a photo of your yard, pick a vibe and budget, and our designer (powered by Annie's plant catalog) builds a real plant list with season-by-season previews. Love it? Request a free Union Park installation estimate, or open the plant cart on Annie's to buy the plants yourself.",
  },
  {
    q: "How soon can you start my project?",
    a: "Small jobs like cleanups are often scheduled within the week. Larger builds like patios and drainage systems typically start within 2–4 weeks depending on the season.",
  },
  {
    q: "Are you licensed and insured?",
    a: `Yes. ${site.name} is fully licensed and insured in Delaware, and every job is backed by our 100% satisfaction guarantee.`,
  },
];

export default async function HomePage() {
  const googleReviews = await getGoogleReviews();

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(145deg, #f6f4ee 0%, #eef3e6 42%, #e2ebe0 100%)",
          }}
        />
        <div className="relative container-site grid items-center gap-10 py-12 sm:gap-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-20">
          <div className="max-w-xl">
            <p className="text-[1.05rem] font-extrabold tracking-tight text-clay-600 sm:text-lg">
              “{site.motto}”
            </p>
            <h1 className="heading-display mt-3 text-[2.2rem] sm:text-4xl lg:text-[3.1rem]">
              Your yard, done right.
              <span className="block text-pine-700">And done to last.</span>
            </h1>
            <p className="mt-5 text-[1.05rem] leading-relaxed text-ink-soft sm:text-lg">
              Landscape design, paver patios, drainage, fencing, cleanups &amp; lawn care
              across {site.address.county}, Delaware. Family-run since {site.foundedYear}.{" "}
              {site.tagline}
            </p>
            <div
              id="hero-estimate-cta"
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link href="/contact" className="btn-primary w-full sm:w-auto">
                Get a Free Estimate
              </Link>
              <a href="#visualizer" className="btn-ghost w-full sm:w-auto">
                Try the AI Yard Designer
              </a>
            </div>
            <p className="mt-5 text-sm font-semibold text-ink-soft">
              Free written quotes · Usually within 24 hours ·{" "}
              <a
                href={site.phoneHref}
                className="font-extrabold text-pine-900 underline decoration-pine-600/40 underline-offset-4 hover:text-pine-700"
              >
                {site.phone}
              </a>
            </p>
          </div>
          <Scene
            variant="home"
            photo={photos.heroHome}
            alt="Professionally landscaped Delaware home with new plantings, trees, and a walkway"
            className="aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lift"
            priority
          />
        </div>
      </section>

      <TrustBar />

      <section id="visualizer" className="section-y scroll-mt-28">
        <div className="container-site">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Free design tool</Eyebrow>
            <h2 className="heading-display mt-3 text-3xl sm:text-[2.5rem]">
              Design your garden. We&apos;ll install it.
            </h2>
            <p className="mt-4 text-ink-soft">
              Same designer as {site.sisterBrand.name}: real in-stock plants and bloom
              previews. When you&apos;re happy, get a free Union Park install quote, or{" "}
              <a
                href={site.sisterBrand.cartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-extrabold text-pine-700 underline underline-offset-4"
              >
                view the plant cart on Annie&apos;s
              </a>
              .
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-card">
            <GardenDesigner />
          </div>
        </div>
      </section>

      <section className="section-y bg-white">
        <div className="container-site">
          <div className="max-w-2xl">
            <Eyebrow>What we do</Eyebrow>
            <h2 className="heading-display mt-3 text-3xl sm:text-[2.5rem]">
              Six trades. One trusted local crew.
            </h2>
          </div>
          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
            {services.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="group block">
                <Scene
                  variant={sceneByService[s.slug as keyof typeof sceneByService]}
                  photo={servicePhotos[s.slug]}
                  alt={`${s.short} project example`}
                  className="aspect-[4/3] w-full overflow-hidden rounded-xl shadow-card transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-lift"
                />
                <h3 className="mt-4 text-lg font-extrabold tracking-tight text-pine-950 group-hover:text-pine-700">
                  {s.short}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{s.blurb}</p>
                <p className="mt-2.5 text-sm font-extrabold text-pine-700">
                  Learn more <span aria-hidden>→</span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-site">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="heading-display mt-3 text-3xl sm:text-[2.5rem]">
              From phone call to finished yard
            </h2>
          </div>
          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-10">
            {[
              {
                n: "01",
                t: "Tell us what you need",
                d: `Call ${site.phone}, request an estimate online, or send an AI design from above. We usually reply the same day.`,
              },
              {
                n: "02",
                t: "Get a clear, free quote",
                d: "We walk your property, answer questions, and give you a written estimate with no pressure.",
              },
              {
                n: "03",
                t: "We build it right",
                d: "Our crew shows up on time, does the work to spec, and leaves your property spotless.",
              },
            ].map((s) => (
              <li key={s.n}>
                <span className="text-sm font-extrabold tracking-[0.14em] text-moss-600">
                  {s.n}
                </span>
                <h3 className="mt-2 text-lg font-extrabold tracking-tight text-pine-950">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Testimonials data={googleReviews} />

      <section className="section-y">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <Eyebrow>Service area</Eyebrow>
            <h2 className="heading-display mt-3 text-3xl sm:text-[2.5rem]">
              Proudly serving New Castle County
            </h2>
            <p className="mt-4 text-ink-soft">
              Based in Wilmington and working throughout northern Delaware. If you&apos;re
              nearby, give us a call. We&apos;ll let you know if we can help.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {towns.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/service-areas/${t.slug}`}
                    className="inline-block rounded-lg border border-sand-200 bg-white px-3.5 py-2 text-sm font-bold text-pine-900 transition-colors hover:border-pine-600 hover:bg-pine-50"
                  >
                    {t.name}, DE
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Scene
            variant="garden"
            photo={photos.serviceArea}
            alt="Professionally landscaped garden bed with trees, shrubs, and seasonal flowers"
            className="aspect-[5/4] w-full overflow-hidden rounded-2xl shadow-lift"
          />
        </div>
      </section>

      <FaqSection faqs={homeFaqs} />
      <CtaSection />
    </>
  );
}
