import Link from "next/link";
import { Logo } from "@/components/Logo";
import { site, services, towns, yearsInBusiness } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-pine-950 text-pine-100">
      <div className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-moss-200">
            {site.tagline} Family-run landscaping serving New Castle County,
            Delaware for {yearsInBusiness}+ years.
          </p>
          <div className="mt-5 space-y-1.5 text-sm">
            <p>
              <a href={site.phoneHref} className="font-semibold text-white hover:underline">
                {site.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${site.email}`} className="hover:underline">
                {site.email}
              </a>
            </p>
            <p className="text-moss-200">
              {site.hours.days}, {site.hours.open} – {site.hours.close}
            </p>
          </div>
        </div>

        <nav aria-label="Services">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Services</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="hover:text-white hover:underline">
                  {s.short}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Service areas">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Where We Work</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {towns.map((t) => (
              <li key={t.slug}>
                <Link href={`/service-areas/${t.slug}`} className="hover:text-white hover:underline">
                  Landscaping in {t.name}, DE
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Company</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/about" className="hover:text-white hover:underline">About Us</Link></li>
            <li><Link href="/gallery" className="hover:text-white hover:underline">Project Gallery</Link></li>
            <li><Link href="/blog" className="hover:text-white hover:underline">Landscaping Blog</Link></li>
            <li><Link href="/contact" className="hover:text-white hover:underline">Free Estimate</Link></li>
            <li><Link href="/#visualizer" className="hover:text-white hover:underline">AI Yard Visualizer</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-2 py-5 text-xs text-moss-200 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.legalName}. Serving {site.address.county},
            Delaware since {site.foundedYear}.
          </p>
          <p>Licensed &amp; insured · 100% satisfaction guarantee</p>
        </div>
      </div>
    </footer>
  );
}
