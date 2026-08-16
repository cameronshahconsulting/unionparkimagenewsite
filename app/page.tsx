import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Choose a destination | ${site.name}`,
  description: `Scan our trailer QR? Choose Union Park Landscaping for outdoor services, or ${site.sisterBrand.name} for plants delivered across the Delaware Valley.`,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export default function LinkTreePage() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-cream">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 15% 0%, rgb(21 122 74 / 0.16), transparent 55%),
            radial-gradient(ellipse 60% 45% at 95% 90%, rgb(221 26 131 / 0.08), transparent 50%),
            linear-gradient(165deg, #eef8f2 0%, #f5f8f6 55%, #ffffff 100%)
          `,
        }}
      />

      <div className="relative mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-5 py-12 sm:px-6">
        <header className="text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-pine-700">
            Welcome
          </p>
          <h1 className="heading-display mt-2.5 text-3xl text-pine-950 sm:text-4xl">
            Where would you like to go?
          </h1>
          <p className="mt-2.5 text-base text-ink-soft">
            Two brands, one family. Pick the site that fits what you need.
          </p>
        </header>

        <nav aria-label="Brand destinations" className="mt-8 flex flex-col gap-3">
          <Link
            href="/home"
            className="group relative overflow-hidden rounded-md border border-pine-800/15 bg-white p-5 shadow-card transition duration-200 hover:border-pine-600/40 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-700"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-pine-600">
                  Landscaping &amp; outdoor services
                </p>
                <p className="mt-1.5 text-xl font-extrabold tracking-tight text-pine-950 group-hover:text-pine-700">
                  Union Park Landscaping
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  Design, patios, drainage, fencing, cleanups &amp; lawn care across
                  New Castle County, DE.
                </p>
              </div>
              <span
                aria-hidden
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-pine-800 text-base text-white transition group-hover:bg-pine-700"
              >
                →
              </span>
            </div>
          </Link>

          <a
            href={site.sisterBrand.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-md border border-sand-300 bg-white p-5 shadow-card transition duration-200 hover:border-pine-600/30 hover:shadow-lift focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-700"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink-soft">
                  Plants &amp; nursery delivery
                </p>
                <p className="mt-1.5 text-xl font-extrabold tracking-tight text-pine-950 group-hover:text-pine-700">
                  {site.sisterBrand.name}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  Sourced &amp; grown across the Delaware Valley — browse plants and
                  get free local delivery on qualifying orders.
                </p>
              </div>
              <span
                aria-hidden
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-pine-700 text-base text-white transition group-hover:bg-pine-800"
              >
                ↗
              </span>
            </div>
          </a>
        </nav>

        <footer className="mt-10 text-center text-sm text-ink-soft">
          <p>
            Call either brand at{" "}
            <a href={site.phoneHref} className="font-extrabold text-pine-800 underline underline-offset-4">
              {site.phone}
            </a>
          </p>
          <p className="mt-1.5 text-xs font-semibold text-moss-600">
            Trailer QR landing · Wilmington &amp; New Castle County, DE
          </p>
        </footer>
      </div>
    </div>
  );
}
