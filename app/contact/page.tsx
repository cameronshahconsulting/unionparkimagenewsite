import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { Eyebrow } from "@/components/Sections";
import { JsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { site, services } from "@/lib/site";

export const metadata: Metadata = {
  title: "Request a Free Landscaping Estimate",
  description: `Tell us about your landscaping project in New Castle County, DE. Free written estimates. Call ${site.phone} or request online.`,
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  const initialService = services.find((s) => s.slug === service)?.short || "";
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/home" },
          { name: "Free estimate", href: "/contact" },
        ])}
      />
      <section className="section-y">
        <div className="container-site">
          <div className="mb-8 max-w-2xl sm:mb-12">
            <Eyebrow>Let’s make something of your outdoors</Eyebrow>
            <h1 className="heading-display mt-4 text-4xl sm:text-6xl">
              It starts with
              <br />a conversation.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-soft">
              Tell us what you have in mind. We’ll help you figure out the next
              step, with a free written estimate and no obligation.
            </p>
          </div>
          <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <ContactForm initialService={initialService} />
            <aside className="lg:pt-3">
              <h2 className="text-xl font-extrabold">
                Prefer to talk it through?
              </h2>
              <p className="mt-2 text-ink-soft">
                Reach our local team directly.
              </p>
              <a
                href={site.phoneHref}
                className="mt-5 inline-block text-3xl font-extrabold tracking-tight text-pine-950"
              >
                {site.phone}
              </a>
              <div className="mt-4 flex gap-3">
                <a href={site.phoneHref} className="btn-secondary">
                  Call us
                </a>
                <a href={site.smsHref} className="btn-ghost">
                  Text us
                </a>
              </div>
              <dl className="mt-8 space-y-5 border-t border-sand-200 pt-6">
                <div>
                  <dt className="text-xs font-extrabold uppercase tracking-widest text-ink-soft">
                    Office hours
                  </dt>
                  <dd className="mt-1 font-semibold">
                    {site.hours.days} · {site.hours.open}–{site.hours.close}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-extrabold uppercase tracking-widest text-ink-soft">
                    Where we work
                  </dt>
                  <dd className="mt-1 font-semibold">
                    Wilmington &amp; New Castle County, Delaware
                  </dd>
                </div>
              </dl>
              <div className="mt-8 rounded-xl border border-sand-200 bg-white p-5">
                <h3 className="font-extrabold">What happens next?</h3>
                <p className="mt-2 text-sm text-ink-soft">
                  We typically respond within one business day to talk through
                  your project and arrange a property visit when needed. Your
                  written estimate follows once we understand the scope.
                </p>
              </div>
              <p className="mt-6 text-sm text-ink-soft">
                Still gathering ideas?{" "}
                <Link
                  href="/designer"
                  className="font-bold text-pine-700 underline underline-offset-4"
                >
                  Explore the free garden designer.
                </Link>
              </p>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
