import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Scene } from "@/components/Scene";
import { CtaSection, FaqSection, Eyebrow } from "@/components/Sections";
import { JsonLd, serviceJsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { serviceContent, getService } from "@/content/services";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return serviceContent.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = serviceContent.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <JsonLd data={serviceJsonLd({ slug: service.slug, name: service.name, blurb: service.metaDescription })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Services", href: "/services" },
          { name: service.short, href: `/services/${service.slug}` },
        ])}
      />

      {/* Hero */}
      <section className="py-14 sm:py-20">
        <div className="container-site grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
              <Link href="/services" className="hover:text-pine-700 hover:underline">
                Services
              </Link>{" "}
              <span aria-hidden>/</span> <span>{service.short}</span>
            </nav>
            <h1 className="heading-display mt-3 text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]">
              {service.h1}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">{service.intro[0]}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="btn-primary">
                Get a Free Estimate
              </Link>
              <a href={site.phoneHref} className="btn-ghost">
                Call {site.phone}
              </a>
            </div>
          </div>
          <Scene
            variant={service.scene}
            alt={`${service.short} illustration`}
            className="aspect-[4/3] w-full rounded-3xl shadow-lift"
            priority
          />
        </div>
      </section>

      {/* Body */}
      <section className="border-y border-sand-200 bg-white py-14 sm:py-20">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_360px]">
          <div className="prose-site max-w-none">
            <p>{service.intro[1]}</p>

            <h2>{service.signsTitle}</h2>
            <ul>
              {service.signs.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>

            <h2>How we work</h2>
            <ol>
              {service.process.map((p) => (
                <li key={p.title}>
                  <strong>{p.title}.</strong> {p.body}
                </li>
              ))}
            </ol>

            <h2>Built for Delaware conditions</h2>
            <p>{service.localNote}</p>

            <h2>What it costs</h2>
            <p>{service.priceNote}</p>
          </div>

          <aside className="space-y-6 lg:pt-2">
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-pine-950">What&apos;s included</h2>
              <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
                {service.included.map((i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="mt-0.5 text-pine-600" aria-hidden>✓</span>
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card bg-pine-900 p-6 text-white">
              <h2 className="font-display text-lg font-semibold">Free estimate, fast</h2>
              <p className="mt-2 text-sm leading-relaxed text-pine-100">
                Most quotes within 24 hours. No pressure, no obligation.
              </p>
              <a href={site.phoneHref} className="btn-primary mt-4 w-full">
                {site.phone}
              </a>
            </div>
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-pine-950">Preview it first</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Curious how this would look on your property? Try our free AI yard
                designer with a photo of your yard.
              </p>
              <Link href="/#visualizer" className="mt-3 inline-block text-sm font-semibold text-clay-600 hover:underline">
                Open the AI Yard Designer →
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <FaqSection faqs={service.faqs} title={`${service.short} questions, answered`} />

      {/* Related */}
      <section className="pb-16">
        <div className="container-site">
          <h2 className="heading-display text-2xl sm:text-3xl">Homeowners also book</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/services/${r.slug}`} className="card group overflow-hidden transition-shadow hover:shadow-lift">
                <Scene variant={r.scene} alt="" className="aspect-[16/9]" />
                <div className="p-5">
                  <h3 className="font-display font-semibold text-pine-950 group-hover:text-pine-700">{r.short}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CtaSection title={`Ready to talk ${service.short.toLowerCase()}?`} />
    </>
  );
}
