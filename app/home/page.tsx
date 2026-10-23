import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  TrustBar,
  Testimonials,
  FaqSection,
  CtaSection,
  Eyebrow,
} from "@/components/Sections";
import { site, services, towns } from "@/lib/site";
import { photos, servicePhotos } from "@/lib/photos";
import { getGoogleReviews } from "@/lib/google-reviews";

export const metadata: Metadata = {
  title: "Landscaping in Wilmington & New Castle County, DE",
  description: `Landscape design, patios, drainage, fencing, cleanups and lawn care in New Castle County, Delaware. Family-run since ${site.foundedYear}. Request a free estimate.`,
  alternates: { canonical: "/home" },
};

const homeFaqs = [
  {
    q: "What areas do you serve?",
    a: "We work throughout New Castle County, Delaware, including Wilmington, Newark, Hockessin, Pike Creek, Greenville, Bear, and Middletown. If you’re nearby, contact us and we’ll confirm whether we can help.",
  },
  {
    q: "How do I get an estimate?",
    a: "Tell us what you have in mind using our estimate form, or give us a call. We’ll discuss your project, arrange a property visit when needed, and provide a free written quote with no obligation.",
  },
  {
    q: "Can you help with more than one part of my yard?",
    a: "Yes. Our services include landscape design and planting, patios and walkways, drainage, fencing, seasonal cleanups, and lawn care. Tell us about the whole project and we’ll help you plan the work.",
  },
  {
    q: "How soon can you start?",
    a: "Availability depends on the scope, season, and weather. We typically respond within one business day and discuss scheduling as part of your estimate.",
  },
  {
    q: "Can I see an idea before committing?",
    a: "Our free garden designer lets you explore a planting concept using a photo of your space and plants from Annie’s Online Nursery. AI previews are inspiration; the final plan, site conditions, and installation price are confirmed with our team.",
  },
];

export default async function HomePage() {
  const reviews = await getGoogleReviews();
  return (
    <>
      <section className="hero-section">
        <div className="container-site grid items-center gap-9 py-10 sm:py-14 lg:grid-cols-[1fr_1.08fr] lg:gap-12 lg:py-20">
          <div>
            <Eyebrow>Wilmington &amp; New Castle County, DE</Eyebrow>
            <h1 className="heading-display mt-5 text-[2.3rem] sm:text-6xl lg:text-[clamp(2.3rem,4.1vw,3.4rem)]">
              More life.
              <br />
              Less yard work.
              <br />
              <span className="text-clay-700">That’s Union Park.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
              From a fresh start for your garden to a patio made for gathering.
              One local crew for the outdoor space you’ve been imagining.
            </p>
            <div
              id="hero-estimate-cta"
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link href="/contact" className="btn-primary">
                Get a Free Estimate <span aria-hidden>↗</span>
              </Link>
              <a href={site.phoneHref} className="btn-ghost">
                Call {site.phone}
              </a>
            </div>
            <p className="mt-4 text-sm text-ink-soft">
              No obligation. Clear written quotes. Family-run since 2013.
            </p>
            <a
              href="#services"
              className="mt-7 inline-flex items-center gap-3 py-2 text-sm font-bold text-pine-900"
            >
              Find the right service <span aria-hidden>↓</span>
            </a>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image
                src={photos.heroHome}
                alt="Garden beds and a curved walkway framing a welcoming home"
                fill
                sizes="(max-width: 1023px) 100vw, 52vw"
                className="object-cover"
                preload
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-pine-950/90 to-transparent px-7 pb-7 pt-20 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/75">
                  Your outdoors. Our everyday.
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight">
                  We love to get down and dirty.
                </p>
              </div>
            </div>
            <div className="absolute -right-2 -top-3 rounded-full border border-sand-200 bg-cream px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-pine-900 sm:-right-4">
              Locally rooted. Since 2013.
            </div>
          </div>
        </div>
      </section>
      <TrustBar />
      <section id="services" className="section-y scroll-mt-24 bg-white">
        <div className="container-site">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <Eyebrow>Good things happen outside</Eyebrow>
              <h2 className="heading-display mt-3 text-3xl sm:text-[2.75rem]">
                Your yard has potential.
                <br />
                We’ll help you find it.
              </h2>
            </div>
            <p className="max-w-xs text-sm text-ink-soft">
              A single project or a little help all season. Start with what your
              property needs.
            </p>
          </div>
          <div className="mt-10 grid gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="service-link group"
              >
                <div className="relative aspect-[3/2] overflow-hidden rounded-xl">
                  <Image
                    src={servicePhotos[service.slug]}
                    alt={`${service.short} inspiration`}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <h3 className="text-xl font-extrabold tracking-tight">
                    {service.short}
                  </h3>
                  <span aria-hidden className="text-clay-700">
                    ↗
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {service.blurb}
                </p>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-pine-800">
                  0{index + 1} / Explore service
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="bg-pine-950 text-white">
        <div className="container-site grid items-center gap-9 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <Image
              src="/images/gallery-patio-hockessin.jpg"
              alt="Paver patio with a circular fire pit and surrounding planting"
              fill
              sizes="(max-width: 1023px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-moss-200">
              Make room for the good moments
            </p>
            <h2 className="heading-display mt-4 text-4xl !text-white sm:text-5xl">
              A place to gather.
              <br />A reason to stay.
            </h2>
            <p className="mt-5 max-w-md text-white/75">
              Quiet mornings. Long dinners. One more evening by the fire. Let’s
              make your outdoor space feel like part of your home.
            </p>
            <Link
              href="/gallery"
              className="mt-7 inline-flex items-center gap-6 border-b border-white/40 pb-2 font-bold text-white"
            >
              Explore the gallery <span aria-hidden>↗</span>
            </Link>
          </div>
        </div>
      </section>
      <section className="section-y">
        <div className="container-site">
          <Eyebrow>Simple from the start</Eyebrow>
          <h2 className="heading-display mt-3 max-w-xl text-3xl sm:text-[2.75rem]">
            A better yard.
            <br />
            Without the runaround.
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-12">
            {[
              {
                title: "Tell us what you have in mind",
                text: "A few details, a quick call, a problem you want solved. You don’t need a finished plan to get started.",
              },
              {
                title: "Get a clear, written estimate",
                text: "We talk through the work, visit your property when needed, and give you a free quote. You decide what comes next.",
              },
              {
                title: "Enjoy your outdoors",
                text: "We agree on the scope and schedule, get to work, and keep you informed along the way.",
              },
            ].map((step, i) => (
              <li key={step.title} className="border-t border-sand-300 pt-5">
                <span className="text-xs font-extrabold tracking-widest text-clay-700">
                  0{i + 1}
                </span>
                <h3 className="mt-4 text-xl font-extrabold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-ink-soft">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <Testimonials data={reviews} />
      <section
        id="visualizer"
        className="section-y scroll-mt-24 border-y border-sand-200"
      >
        <div className="container-site grid items-center gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <div>
            <Eyebrow>A little inspiration goes a long way</Eyebrow>
            <h2 className="heading-display mt-3 text-3xl sm:text-[2.75rem]">
              See the possibilities.
              <br />
              Then let’s plant them.
            </h2>
            <p className="mt-5 max-w-xl text-ink-soft">
              Upload a photo and explore a garden concept with plants from
              Annie’s Online Nursery. Request an installation estimate from
              Union Park, or shop the plants yourself.
            </p>
            <Link href="/designer" className="btn-secondary mt-7">
              Try the Free Garden Designer <span aria-hidden>↗</span>
            </Link>
            <p className="mt-3 text-xs text-ink-soft">
              AI concept previews. Final plans and pricing confirmed by our
              team.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 sm:p-9">
            <p className="font-extrabold text-pine-950">
              Your photo. A fresh perspective.
            </p>
            <ol className="mt-5 space-y-5">
              {[
                "Upload a photo of one garden bed",
                "Choose your style, sunlight & budget",
                "Explore your design & request a quote",
              ].map((s, i) => (
                <li
                  key={s}
                  className="flex items-center gap-4 text-sm text-ink-soft"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pine-50 font-extrabold text-pine-800">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
      <section className="section-y">
        <div className="container-site grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <Eyebrow>Right here in your neighborhood</Eyebrow>
            <h2 className="heading-display mt-3 text-3xl sm:text-[2.75rem]">
              Local crew.
              <br />
              Delaware roots.
            </h2>
            <p className="mt-4 max-w-md text-ink-soft">
              Based in Wilmington and serving New Castle County. Not sure if
              you’re in our area? Give us a call.
            </p>
          </div>
          <ul className="grid content-center grid-cols-2 gap-x-6">
            {towns.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/service-areas/${t.slug}`}
                  className="flex items-center justify-between gap-2 border-b border-sand-200 py-4 text-sm font-bold text-pine-900 hover:text-clay-700"
                >
                  {t.name}
                  <span aria-hidden>↗</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <FaqSection faqs={homeFaqs} />
      <CtaSection />
    </>
  );
}
