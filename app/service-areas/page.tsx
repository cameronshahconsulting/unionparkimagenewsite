import type { Metadata } from "next";
import Link from "next/link";
import { CtaSection, Eyebrow } from "@/components/Sections";
import { JsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { townContent } from "@/content/towns";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Service Areas | Landscaping Across New Castle County, DE",
  description: `${site.name} serves Wilmington, Newark, Hockessin, Pike Creek, Greenville, Bear & Middletown, DE. Find landscaping services in your town.`,
  alternates: { canonical: "/service-areas" },
};

export default function ServiceAreasPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/home" },
          { name: "Service Areas", href: "/service-areas" },
        ])}
      />
      <section className="py-14 sm:py-20">
        <div className="container-site">
          <div className="max-w-2xl">
            <Eyebrow>Where we work</Eyebrow>
            <h1 className="heading-display mt-2 text-4xl sm:text-5xl">
              Landscaping across New Castle County
            </h1>
            <p className="mt-4 text-lg text-ink-soft">
              We&apos;re based in Wilmington and stay local on purpose. It&apos;s how
              we keep response times fast and quality high. Pick your town for local
              details, common projects, and answers.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {townContent.map((t) => (
              <Link
                key={t.slug}
                href={`/service-areas/${t.slug}`}
                className="card group p-7 transition-shadow hover:shadow-lift"
              >
                <h2 className="font-display text-xl font-semibold text-pine-950 group-hover:text-pine-700">
                  {t.name}, DE
                </h2>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">{t.intro}</p>
                <p className="mt-4 text-sm font-semibold text-clay-600">
                  Landscaping in {t.name} <span aria-hidden>→</span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CtaSection />
    </>
  );
}
