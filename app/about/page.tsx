import type { Metadata } from "next";
import Link from "next/link";
import { Scene } from "@/components/Scene";
import { CtaSection, Eyebrow } from "@/components/Sections";
import { JsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { site, yearsInBusiness } from "@/lib/site";
import { photos } from "@/lib/photos";

export const metadata: Metadata = {
  title: "About Us | Family-Run Landscaping in Wilmington, DE",
  description: `${site.name} is a family-run landscaping company serving New Castle County, DE since ${site.foundedYear}. Licensed, insured, 5.0-star rated. Meet the team behind the work.`,
  alternates: { canonical: "/about" },
};

const values = [
  {
    t: "Show up when we say we will",
    d: "The most common review we get isn't about plants — it's about responsiveness. We answer the phone, we quote fast, and we start when promised.",
  },
  {
    t: "Do it right or don't do it",
    d: "Compacted patio bases, correct planting depth, posts below frost line. The invisible details are the ones that decide whether work lasts.",
  },
  {
    t: "Quote honestly",
    d: "Written estimates with real numbers. If a cheaper fix will solve your problem, we'll tell you — that's how we've kept a 5.0 rating.",
  },
  {
    t: "Leave it spotless",
    d: "Every job ends with a full cleanup and haul-away. Your neighbors should notice the yard, not the mess.",
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/home" },
          { name: "About", href: "/about" },
        ])}
      />
      <section className="py-14 sm:py-20">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Since {site.foundedYear}</Eyebrow>
            <h1 className="heading-display mt-2 text-4xl sm:text-5xl">
              A local crew that treats your yard like our reputation
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              {site.name} started in {site.foundedYear} with one truck, a trailer, and
              a simple idea: homeowners in New Castle County deserved a landscaper who
              answers the phone, quotes honestly, and does the work right the first
              time. {yearsInBusiness}+ years later, that&apos;s still the whole
              business model.
            </p>
            <p className="mt-4 leading-relaxed text-ink-soft">
              We&apos;re based in Wilmington and we stay local on purpose — Wilmington,
              Newark, Hockessin, Pike Creek, Greenville, Bear, and Middletown. Working
              close to home means we know the clay soil, the deer pressure, the HOA
              quirks, and the way water moves through these neighborhoods.
            </p>
          </div>
          <Scene
            variant="home"
            photo={photos.aboutCrew}
            alt="Union Park Landscaping crew installing plants at a Delaware residential jobsite"
            className="aspect-[4/3] w-full rounded-3xl shadow-lift"
            priority
          />
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="container-site">
          <div className="max-w-2xl">
            <Eyebrow>How we operate</Eyebrow>
            <h2 className="heading-display mt-2 text-3xl sm:text-4xl">
              Four promises on every job
            </h2>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {values.map((v) => (
              <div key={v.t} className="card p-7">
                <h3 className="font-display text-xl font-semibold text-pine-950">{v.t}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-sand-200 bg-white py-16 sm:py-20">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2">
          <Scene
            variant="garden"
            photo={photos.aboutGarden}
            alt="Close-up of a landscaper planting shrubs in a prepared garden bed"
            className="order-2 aspect-[4/3] w-full rounded-3xl shadow-lift lg:order-1"
          />
          <div className="order-1 lg:order-2">
            <Eyebrow>Licensed &amp; insured</Eyebrow>
            <h2 className="heading-display mt-2 text-3xl sm:text-4xl">
              Fully covered, fully accountable
            </h2>
            <p className="mt-4 leading-relaxed text-ink-soft">
              We&apos;re licensed and insured in Delaware, we call Miss Utility before
              we dig, and we back every project with a 100% satisfaction guarantee. If
              something isn&apos;t right, we come back and make it right — that&apos;s
              not fine print, it&apos;s the reason people refer us to their neighbors.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="btn-primary">Get a Free Estimate</Link>
              <Link href="/services" className="btn-ghost">See Our Services</Link>
            </div>
          </div>
        </div>
      </section>

      <CtaSection title="Let's talk about your yard" />
    </>
  );
}
