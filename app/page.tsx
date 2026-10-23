import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute:
      "Union Park Landscaping & Annie’s Online Nursery | Choose your destination",
  },
  description:
    "Two local brands, one family. Choose landscaping services from Union Park or shop plants at Annie’s Online Nursery.",
  alternates: { canonical: "/" },
};

export default function BrandSelector() {
  return (
    <div className="brand-selector min-h-dvh">
      <div className="container-site max-w-5xl py-6 sm:py-14">
        <header className="text-center">
          <p className="eyebrow">Two brands. One family.</p>
          <h1 className="heading-display mx-auto mt-4 max-w-2xl text-[2.1rem] sm:text-6xl">
            A better yard
            <br className="hidden sm:block" /> starts here.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-ink-soft">
            Landscaping services or plants delivered. Choose what you need.
          </p>
        </header>
        <nav
          aria-label="Choose a brand"
          className="mt-6 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6"
        >
          <Link href="/home" className="destination-card group">
            <div className="relative h-16 overflow-hidden sm:h-52">
              <Image
                src="/images/service-hardscaping.jpg"
                alt="Patio and landscaped outdoor living space"
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                preload
              />
              <span className="absolute bottom-2 left-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-pine-950">
                Let us do the work
              </span>
            </div>
            <div className="p-4 sm:p-7">
              <p className="text-xs font-extrabold uppercase tracking-widest text-clay-700">
                Union Park Landscaping
              </p>
              <h2 className="heading-display mt-2 text-2xl sm:text-3xl">
                Landscaping services
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed sm:text-sm text-ink-soft">
                Design, patios, drainage &amp; property care in New Castle
                County, DE.
              </p>
              <span className="mt-3 flex items-center sm:mt-5 justify-between border-t border-sand-200 pt-3 font-extrabold sm:pt-4 text-clay-700">
                Explore Union Park <span aria-hidden>↗</span>
              </span>
            </div>
          </Link>
          <a href={site.sisterBrand.url} className="destination-card group">
            <div className="relative h-16 overflow-hidden sm:h-52">
              <Image
                src="/images/service-area-garden.jpg"
                alt="Lush garden filled with shrubs and flowering plants"
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                preload
              />
              <span className="absolute bottom-2 left-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-pine-950">
                Find your next favorite plant
              </span>
            </div>
            <div className="p-4 sm:p-7">
              <p className="text-xs font-extrabold uppercase tracking-widest text-pine-800">
                Annie’s Online Nursery
              </p>
              <h2 className="heading-display mt-2 text-2xl sm:text-3xl">
                Plants, delivered.
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed sm:text-sm text-ink-soft">
                Trees, shrubs &amp; garden favorites, with local delivery across
                the Delaware Valley.
              </p>
              <span className="mt-3 flex items-center sm:mt-5 justify-between border-t border-sand-200 pt-3 font-extrabold sm:pt-4 text-pine-800">
                Shop Annie’s <span aria-hidden>↗</span>
              </span>
            </div>
          </a>
        </nav>
        <footer className="mt-5 text-center text-sm text-ink-soft">
          <p>
            Not sure where to start?{" "}
            <a
              href={site.phoneHref}
              className="inline-block py-2 font-extrabold text-pine-950 underline underline-offset-4"
            >
              Call {site.phone}
            </a>
          </p>
          <p className="mt-1 text-xs">
            Wilmington, Delaware · Family-owned &amp; locally rooted
          </p>
        </footer>
      </div>
    </div>
  );
}
