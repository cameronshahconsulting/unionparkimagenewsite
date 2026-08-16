"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { site } from "@/lib/site";
import { photos } from "@/lib/photos";

const nav = [
  { href: "/services", label: "Services" },
  { href: "/designer", label: "AI Designer" },
  { href: "/service-areas", label: "Service Areas" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.classList.remove("menu-open");
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 overflow-hidden border-b border-sand-200/80">
      {/* Soft landscape wash: muted so pink/cyan logo stays clear */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src={photos.serviceArea}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[center_40%] opacity-[0.18] saturate-[0.75] contrast-[0.95]"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgb(246 244 238 / 0.92) 0%, rgb(246 244 238 / 0.88) 100%)",
          }}
        />
      </div>

      <div className="relative container-site flex h-16 items-center justify-between gap-3 sm:h-[4.75rem] lg:h-[5.25rem]">
        <Link
          href="/home"
          aria-label={`${site.name} home`}
          onClick={() => setOpen(false)}
          className="min-w-0 shrink"
        >
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[14.5px] font-bold transition-colors hover:text-pine-700 ${
                  active ? "text-pine-900" : "text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={site.phoneHref}
            className="hidden text-sm font-extrabold text-pine-900 hover:text-pine-700 md:inline"
          >
            {site.phone}
          </a>
          {/* Desktop / tablet only; mobile uses sticky bar after hero CTA */}
          <Link
            href="/contact"
            className="btn-primary hidden !px-5 !py-2.5 !text-sm md:inline-flex"
            onClick={() => setOpen(false)}
          >
            Free Estimate
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-pine-950 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="relative flex max-h-[calc(100dvh-4rem)] flex-col border-t border-sand-200/80 bg-cream/95 backdrop-blur-md lg:hidden"
        >
          <ul className="flex-1 overflow-y-auto px-4 py-3">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-3.5 text-base font-semibold ${
                      active ? "bg-pine-50 text-pine-900" : "text-ink hover:bg-pine-50"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="sticky bottom-0 border-t border-sand-200 bg-cream px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_-12px_rgb(26_46_36/0.18)]">
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="btn-primary w-full"
            >
              Get a Free Estimate
            </Link>
            <a href={site.phoneHref} className="btn-ghost mt-2.5 w-full">
              Call {site.phone}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
