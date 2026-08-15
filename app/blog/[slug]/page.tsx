import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { CtaSection } from "@/components/Sections";
import { JsonLd, breadcrumbJsonLd, blogPostingJsonLd } from "@/components/JsonLd";
import { getAllPosts, getPost, formatDate } from "@/lib/blog";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const others = getAllPosts().filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <JsonLd data={blogPostingJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/home" },
          { name: "Blog", href: "/blog" },
          { name: post.title, href: `/blog/${post.slug}` },
        ])}
      />
      <article className="py-14 sm:py-20">
        <div className="container-site max-w-3xl">
          <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
            <Link href="/blog" className="hover:text-pine-700 hover:underline">
              Blog
            </Link>{" "}
            <span aria-hidden>/</span> <span>{post.category}</span>
          </nav>
          <h1 className="heading-display mt-4 text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]">
            {post.title}
          </h1>
          <p className="mt-4 text-sm text-ink-soft">
            By the Union Park Landscaping crew · {formatDate(post.date)} ·{" "}
            {post.readMinutes} min read
          </p>
          <div className="prose-site mt-8 max-w-none">
            <MDXRemote source={post.content} />
          </div>
          <div className="mt-12 rounded-2xl bg-pine-50 p-7">
            <p className="font-display text-lg font-semibold text-pine-950">
              Dealing with this in your own yard?
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              We give free written estimates across New Castle County — or preview
              changes first with our{" "}
              <Link href="/home/#visualizer" className="font-semibold text-pine-700 underline underline-offset-4">
                free AI yard designer
              </Link>
              .
            </p>
            <Link href="/contact" className="btn-primary mt-4">
              Get a Free Estimate
            </Link>
          </div>
        </div>
      </article>

      {others.length > 0 && (
        <section className="pb-16">
          <div className="container-site">
            <h2 className="heading-display text-2xl sm:text-3xl">Keep reading</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {others.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="card group p-6 transition-shadow hover:shadow-lift">
                  <p className="eyebrow">{p.category}</p>
                  <h3 className="mt-2 font-display font-semibold leading-snug text-pine-950 group-hover:text-pine-700">
                    {p.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaSection />
    </>
  );
}
