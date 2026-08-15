import type { Metadata } from "next";
import Link from "next/link";
import { Scene } from "@/components/Scene";
import { CtaSection, Eyebrow } from "@/components/Sections";
import { JsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { serviceContent } from "@/content/services";
import { site } from "@/lib/site";
import { servicePhotos } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Landscaping Services in New Castle County, DE",
  description: `All ${site.name} services: landscape design, hardscaping, drainage, fencing, yard cleanups & lawn care in Wilmington and New Castle County, Delaware.`,
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/home" },
          { name: "Services", href: "/services" },
        ])}
      />
      <section className="py-14 sm:py-20">
        <div className="container-site">
          <div className="max-w-2xl">
            <Eyebrow>Our services</Eyebrow>
            <h1 className="heading-display mt-2 text-4xl sm:text-5xl">
              Landscaping services in New Castle County
            </h1>
            <p className="mt-4 text-lg text-ink-soft">
              One local crew for design, hardscaping, drainage, fencing, cleanups, and
              lawn care — so you never have to coordinate three contractors for one
              yard. Every service comes with a free written estimate.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {serviceContent.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="card group grid overflow-hidden transition-shadow hover:shadow-lift sm:grid-cols-[200px_1fr]"
              >
                <Scene
                  variant={s.scene}
                  photo={servicePhotos[s.slug]}
                  alt={`${s.short} project example`}
                  className="aspect-[16/9] sm:aspect-auto sm:h-full"
                />
                <div className="p-6">
                  <h2 className="font-display text-xl font-semibold text-pine-950 group-hover:text-pine-700">
                    {s.short}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {s.metaDescription.replace(" Free estimates.", "").replace(" Free quotes.", "")}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-clay-600">
                    View details <span aria-hidden>→</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CtaSection />
    </>
  );
}
