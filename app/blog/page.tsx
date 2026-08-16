import type { Metadata } from "next";
import Link from "next/link";
import { CtaSection, Eyebrow } from "@/components/Sections";
import { JsonLd, breadcrumbJsonLd } from "@/components/JsonLd";
import { getAllPosts, formatDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Delaware Landscaping Blog | Costs, Plants & How-Tos",
  description:
    "Straight answers about landscaping in Delaware: real local costs, the best plants for New Castle County, drainage fixes, lawn timing, and more.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/home" },
          { name: "Blog", href: "/blog" },
        ])}
      />
      <section className="py-14 sm:py-20">
        <div className="container-site">
          <div className="max-w-2xl">
            <Eyebrow>The Union Park blog</Eyebrow>
            <h1 className="heading-display mt-2 text-4xl sm:text-5xl">
              Straight answers about Delaware yards
            </h1>
            <p className="mt-4 text-lg text-ink-soft">
              Real local prices, plants that actually survive here, and fixes that
              last, written by the crew that does the work.
            </p>
          </div>

          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="card group mt-12 block p-8 transition-shadow hover:shadow-lift sm:p-10"
            >
              <p className="eyebrow">{featured.category}</p>
              <h2 className="heading-display mt-3 max-w-3xl text-2xl group-hover:text-pine-700 sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 max-w-2xl text-ink-soft">{featured.description}</p>
              <p className="mt-5 text-sm text-ink-soft">
                {formatDate(featured.date)} · {featured.readMinutes} min read
              </p>
            </Link>
          )}

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="card group flex flex-col p-7 transition-shadow hover:shadow-lift">
                <p className="eyebrow">{p.category}</p>
                <h2 className="mt-3 font-display text-xl font-semibold leading-snug text-pine-950 group-hover:text-pine-700">
                  {p.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">{p.description}</p>
                <p className="mt-auto pt-5 text-sm text-ink-soft">
                  {formatDate(p.date)} · {p.readMinutes} min read
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CtaSection title="Have a question about your own yard?" />
    </>
  );
}
