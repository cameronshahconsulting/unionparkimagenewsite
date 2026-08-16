import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Scene } from "@/components/Scene";
import { CtaSection, FaqSection, Testimonials, Eyebrow } from "@/components/Sections";
import { JsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { townContent, getTown } from "@/content/towns";
import { getService } from "@/content/services";
import { site } from "@/lib/site";
import { photos } from "@/lib/photos";
import { getGoogleReviews } from "@/lib/google-reviews";

export function generateStaticParams() {
  return townContent.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const town = getTown(slug);
  if (!town) return {};
  return {
    title: `Landscaping in ${town.name}, DE`,
    description: town.metaDescription,
    alternates: { canonical: `/service-areas/${town.slug}` },
  };
}

export default async function TownPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const town = getTown(slug);
  if (!town) notFound();

  const popular = town.popularServices
    .map((s) => getService(s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const googleReviews = await getGoogleReviews();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/home" },
          { name: "Service Areas", href: "/service-areas" },
          { name: `${town.name}, DE`, href: `/service-areas/${town.slug}` },
        ])}
      />

      <section className="py-14 sm:py-20">
        <div className="container-site grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
              <Link href="/service-areas" className="hover:text-pine-700 hover:underline">
                Service Areas
              </Link>{" "}
              <span aria-hidden>/</span> <span>{town.name}, DE</span>
            </nav>
            <h1 className="heading-display mt-3 text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]">
              Landscaping in {town.name}, Delaware
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">{town.intro}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="btn-primary">Get a Free Estimate</Link>
              <a href={site.phoneHref} className="btn-ghost">Call {site.phone}</a>
            </div>
          </div>
          <Scene
            variant="home"
            photo={photos.townHero}
            alt={`Landscaped home in ${town.name}, Delaware`}
            className="aspect-[4/3] w-full rounded-3xl shadow-lift"
            priority
          />
        </div>
      </section>

      <section className="border-y border-sand-200 bg-white py-14 sm:py-20">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_360px]">
          <div className="prose-site max-w-none">
            <h2>What {town.name} yards actually need</h2>
            {town.body.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          <aside className="lg:pt-2">
            <div className="card p-6">
              <h2 className="font-display text-lg font-semibold text-pine-950">
                Most-requested in {town.name}
              </h2>
              <ul className="mt-4 space-y-3">
                {popular.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/services/${s.slug}`}
                      className="group flex items-center justify-between rounded-xl border border-sand-200 px-4 py-3 text-sm font-semibold text-pine-950 transition-colors hover:border-pine-600 hover:bg-pine-50"
                    >
                      {s.short}
                      <span className="text-clay-600" aria-hidden>→</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/home/#visualizer" className="mt-5 inline-block text-sm font-semibold text-clay-600 hover:underline">
                Preview your {town.name} yard with AI →
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <FaqSection
        faqs={town.faqs}
        title={`${town.name} homeowners ask us…`}
      />
      <Testimonials data={googleReviews} />
      <CtaSection title={`Get your free ${town.name} estimate`} />
    </>
  );
}
