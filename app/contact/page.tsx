import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { Eyebrow } from "@/components/Sections";
import { JsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { site, towns } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free Landscaping Estimate | Contact Us",
  description: `Get a free landscaping estimate in Wilmington & New Castle County, DE. Call ${site.phone} or request online. Most quotes within 24 hours.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/home" },
          { name: "Contact", href: "/contact" },
        ])}
      />
      <section className="py-14 sm:py-20">
        <div className="container-site grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Eyebrow>Free estimates</Eyebrow>
            <h1 className="heading-display mt-2 text-4xl sm:text-5xl">
              Let&apos;s look at your yard
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Tell us what you&apos;re dealing with and we&apos;ll get you a clear,
              written estimate, usually within 24 hours. Prefer to talk?
            </p>

            <div className="mt-8 space-y-5">
              <a href={site.phoneHref} className="card flex items-center gap-4 p-5 transition-shadow hover:shadow-lift">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-pine-800 text-white" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span>
                  <span className="block text-sm text-ink-soft">Call or text</span>
                  <span className="block font-display text-xl font-semibold text-pine-950">{site.phone}</span>
                </span>
              </a>
              <div className="card p-5">
                <p className="text-sm text-ink-soft">Hours</p>
                <p className="mt-1 font-semibold text-pine-950">
                  {site.hours.days} · {site.hours.open} – {site.hours.close}
                </p>
              </div>
              <div className="card p-5">
                <p className="text-sm text-ink-soft">Service area</p>
                <p className="mt-1 font-semibold text-pine-950">{site.address.county}, Delaware</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {towns.map((t) => t.name).join(" · ")}
                </p>
              </div>
              <div className="card border-clay-500/30 bg-clay-100/40 p-5">
                <p className="font-semibold text-pine-950">Want a visual first?</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                  Upload a photo of your yard to our free{" "}
                  <Link href="/home/#visualizer" className="font-semibold text-clay-600 underline underline-offset-4">
                    AI Yard Designer
                  </Link>{" "}
                  and send us the design you like with your estimate request.
                </p>
              </div>
            </div>
          </div>

          <div>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
