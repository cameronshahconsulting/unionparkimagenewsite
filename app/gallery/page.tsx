import type { Metadata } from "next";
import Link from "next/link";
import { Scene } from "@/components/Scene";
import { CtaSection, Eyebrow } from "@/components/Sections";
import { JsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { serviceContent } from "@/content/services";
import { projectPhotos } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Project Gallery | Landscaping in New Castle County, DE",
  description:
    "Recent landscaping, hardscaping, drainage, and fencing projects across Wilmington, Newark, Hockessin, and New Castle County, DE.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/home" },
          { name: "Gallery", href: "/gallery" },
        ])}
      />
      <section className="py-14 sm:py-20">
        <div className="container-site">
          <div className="max-w-2xl">
            <Eyebrow>Our work</Eyebrow>
            <h1 className="heading-display mt-2 text-4xl sm:text-5xl">Project gallery</h1>
            <p className="mt-4 text-lg text-ink-soft">
              Explore patios, planting beds, and the details that go into caring for a yard. Want to see what might work at your home?{" "}
              <Link href="/designer" className="font-semibold text-pine-700 underline underline-offset-4">
                Try the free AI yard designer
              </Link>
              .
            </p>
          </div>
          <div className="mt-12 space-y-14">
            {serviceContent.map((s) => (
              <section key={s.slug} aria-labelledby={s.slug}>
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-t border-sand-200 pt-5">
                  <h2 id={s.slug} className="heading-display text-2xl sm:text-3xl">{s.short}</h2>
                  <Link href={`/services/${s.slug}`} aria-label={`Explore ${s.short.toLowerCase()} services`} className="font-semibold text-pine-700 underline underline-offset-4">Explore service →</Link>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {projectPhotos[s.slug].slice(0, 2).map((p) => (
                    <figure key={p.src}>
                      <Scene variant={s.scene} photo={p.src} alt={p.alt} className="aspect-[4/3] rounded-xl" />
                      <figcaption className="mt-2.5 text-sm font-medium text-ink-soft">{p.title}</figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
      <CtaSection title="Want your yard in this gallery?" />
    </>
  );
}
