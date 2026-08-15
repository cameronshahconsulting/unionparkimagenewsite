import type { Metadata } from "next";
import Link from "next/link";
import { Scene } from "@/components/Scene";
import { CtaSection, Eyebrow } from "@/components/Sections";
import { JsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { galleryPhotos } from "@/lib/photos";

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
              A sample of recent work across New Castle County. Want to see how your
              own yard could look?{" "}
              <Link href="/home/#visualizer" className="font-semibold text-pine-700 underline underline-offset-4">
                Try the free AI yard designer
              </Link>
              .
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleryPhotos.map((p) => (
              <figure key={p.photo} className="card overflow-hidden">
                <Scene
                  variant={p.variant}
                  photo={p.photo}
                  alt={`${p.title} in ${p.town}`}
                  className="aspect-[4/3]"
                />
                <figcaption className="p-5">
                  <p className="font-display font-semibold text-pine-950">{p.title}</p>
                  <p className="mt-1 text-sm text-ink-soft">{p.town}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      <CtaSection title="Want your yard in this gallery?" />
    </>
  );
}
