import type { Metadata } from "next";
import Link from "next/link";
import { Scene, type SceneVariant } from "@/components/Scene";
import { CtaSection, Eyebrow } from "@/components/Sections";
import { JsonLd, breadcrumbJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Project Gallery | Landscaping in New Castle County, DE",
  description:
    "Recent landscaping, hardscaping, drainage, and fencing projects across Wilmington, Newark, Hockessin, and New Castle County, DE.",
  alternates: { canonical: "/gallery" },
};

/**
 * PHOTO SWAP GUIDE: drop real project photos into /public/photos and set the
 * `photo` field (e.g. photo: "/photos/patio-hockessin.jpg"). The illustration
 * renders only until a photo is provided.
 */
const projects: { variant: SceneVariant; photo?: string; title: string; town: string }[] = [
  { variant: "patio", title: "Paver patio with fire pit", town: "Hockessin, DE" },
  { variant: "garden", title: "Front foundation replanting", town: "Wilmington, DE" },
  { variant: "drainage", title: "French drain + dry creek bed", town: "Newark, DE" },
  { variant: "fence", title: "Cedar privacy fence", town: "Pike Creek, DE" },
  { variant: "cleanup", title: "Full fall cleanup & mulch", town: "Greenville, DE" },
  { variant: "lawn", title: "Lawn renovation & overseed", town: "Bear, DE" },
  { variant: "home", title: "Complete front yard redesign", town: "Middletown, DE" },
  { variant: "patio", title: "Walkway & entry landing", town: "Wilmington, DE" },
  { variant: "garden", title: "Native pollinator beds", town: "Newark, DE" },
];

export default function GalleryPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/" },
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
              <Link href="/#visualizer" className="font-semibold text-pine-700 underline underline-offset-4">
                Try the free AI yard designer
              </Link>
              .
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <figure key={i} className="card overflow-hidden">
                <Scene variant={p.variant} photo={p.photo} alt={`${p.title} in ${p.town}`} className="aspect-[4/3]" />
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
