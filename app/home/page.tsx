import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TrustBar, Testimonials, FaqSection, CtaSection, Eyebrow } from "@/components/Sections";
import { GardenDesigner } from "@/components/designer/GardenDesigner";
import { site, services, towns, yearsInBusiness } from "@/lib/site";
import { photos, servicePhotos } from "@/lib/photos";
import "@/app/designer.css";

export const metadata: Metadata = {
  title: `Landscaping in Wilmington, DE | ${site.name}`,
  description: `Top-rated landscaping company in Wilmington & New Castle County, DE. Patios, drainage, fencing, cleanups, lawn care & landscape design since ${site.foundedYear}. Free estimates — call ${site.phone}.`,
  alternates: { canonical: "/home" },
};

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
    q: "How does the yard designer work?",
    a: "Upload a photo of your yard, pick a vibe and budget, and our designer builds a real plant list with season-by-season previews. Love it? Request a free Union Park installation estimate — or review the plant list and shop plants separately.",
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
      {/* Full-bleed conversion hero */}
      <section className="relative isolate min-h-[min(92vh,820px)] overflow-hidden">
        <Image
          src={photos.heroHome}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-pine-950/92 via-pine-900/78 to-pine-900/35"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-pine-950/55 via-transparent to-pine-950/25"
        />

        <div className="container-site relative flex min-h-[min(92vh,820px)] flex-col justify-end pb-14 pt-28 sm:justify-center sm:pb-20 sm:pt-24">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-white sm:text-base">
            {site.name}
          </p>
          <h1 className="heading-display mt-3 max-w-2xl text-[2.4rem] !text-white sm:text-5xl lg:text-[3.35rem]">
            Your yard, done right — and done to last.
          </h1>
          <p className="mt-4 max-w-lg text-base text-white/85 sm:text-lg">
            Landscape design, patios, drainage, fencing, cleanups, and lawn care for homeowners
            across {site.address.county}, DE. Family-run since {site.foundedYear}.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/contact" className="btn-primary">
              Get a Free Estimate
            </Link>
            <a href="#visualizer" className="btn-on-dark">
              Try the Yard Designer
            </a>
          </div>
          <p className="mt-5 text-sm font-semibold text-white/75">
            Or call{" "}
            <a href={site.phoneHref} className="font-extrabold text-white underline underline-offset-4">
              {site.phone}
            </a>{" "}
            · {site.hours.days}, {site.hours.open}–{site.hours.close}
          </p>
        </div>
      </section>

      <TrustBar />

      {/* Yard Designer */}
      <section id="visualizer" className="section-y scroll-mt-24 bg-white">
        <div className="container-site">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Free design tool</Eyebrow>
            <h2 className="heading-display mt-2 text-3xl sm:text-[2.5rem]">
              Design your garden — we&apos;ll install it
            </h2>
            <p className="mt-3 text-ink-soft">
              Upload a photo, pick a vibe, and get a real plant list with season-by-season
              previews. When you&apos;re happy, request a free Union Park install quote.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-md border border-sand-200 bg-cream shadow-card">
            <GardenDesigner />
          </div>
        </div>
      </section>

      {/* Services — one job: pick a trade */}
      <section className="section-y">
        <div className="container-site">
          <div className="max-w-2xl">
            <Eyebrow>What we do</Eyebrow>
            <h2 className="heading-display mt-2 text-3xl sm:text-[2.5rem]">
              Six trades. One trusted local crew.
            </h2>
            <p className="mt-3 text-ink-soft">
              From weekly lawn care to full patio builds — we handle the outdoor work so you
              don&apos;t have to juggle contractors.
            </p>
          </div>
          <ul className="mt-10 divide-y divide-sand-200 border-y border-sand-200">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="group grid items-center gap-5 py-5 transition-colors sm:grid-cols-[minmax(0,1fr)_160px] sm:gap-8 sm:py-6"
                >
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight text-pine-950 group-hover:text-pine-700">
                      {s.short}
                    </h3>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-[0.95rem]">
                      {s.blurb}
                    </p>
                    <p className="mt-3 text-sm font-extrabold text-clay-600">
                      Learn more <span aria-hidden>→</span>
                    </p>
                  </div>
                  <div className="relative hidden aspect-[4/3] overflow-hidden rounded-md sm:block">
                    <Image
                      src={servicePhotos[s.slug]}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-cover transition duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What to expect — TruGreen-style numbered path */}
      <section className="section-y bg-pine-900 text-white">
        <div className="container-site">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-pine-100">
              What to expect
            </p>
            <h2 className="heading-display mt-2 text-3xl !text-white sm:text-[2.5rem]">
              From first call to finished yard
            </h2>
          </div>
          <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
            {[
              {
                n: "01",
                t: "Tell us what you need",
                d: `Call ${site.phone}, request an estimate online, or send us a design you made above. We usually respond the same day.`,
              },
              {
                n: "02",
                t: "Get a clear, free quote",
                d: "We walk your property, answer questions, and give you a written estimate with no pressure and no surprises.",
              },
              {
                n: "03",
                t: "We build it right",
                d: "Our crew shows up on time, does the work to spec, and leaves your property spotless — backed by our satisfaction guarantee.",
              },
            ].map((s) => (
              <li key={s.n}>
                <p className="text-sm font-extrabold tracking-[0.12em] text-pine-500">{s.n}</p>
                <h3 className="mt-2 text-xl font-extrabold tracking-tight text-white">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-pine-100/85">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Testimonials />

      {/* Service area */}
      <section className="section-y bg-white">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <Eyebrow>Local &amp; nearby</Eyebrow>
            <h2 className="heading-display mt-2 text-3xl sm:text-[2.5rem]">
              Proudly serving New Castle County
            </h2>
            <p className="mt-3 text-ink-soft">
              Based in Wilmington and working throughout northern Delaware for {yearsInBusiness}+
              years. If you&apos;re in one of these towns, you&apos;re in our service area —
              and if you&apos;re close, call us anyway.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {towns.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/service-areas/${t.slug}`}
                    className="inline-block rounded-md border border-pine-800/20 bg-cream px-3.5 py-1.5 text-sm font-bold text-pine-900 transition-colors hover:border-pine-800 hover:bg-pine-50"
                  >
                    {t.name}, DE
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
            <Image
              src={photos.serviceArea}
              alt="Professionally landscaped garden bed with trees, shrubs, and seasonal flowers"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <FaqSection faqs={homeFaqs} />
      <CtaSection />
    </>
  );
}
