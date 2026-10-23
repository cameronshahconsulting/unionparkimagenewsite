"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { site } from "@/lib/site";

const nav = [
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "Our story" },
  { href: "/designer", label: "Garden designer" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("menu-open");
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1280px)");
    const onResize = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", onResize);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.body.classList.remove("menu-open");
      desktop.removeEventListener("change", onResize);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-sand-200 bg-cream/95 backdrop-blur-md"
    >
      <div className="container-site flex h-20 items-center justify-between gap-4 sm:h-24">
        <Link
          href="/home"
          aria-label={`${site.name} home`}
          onClick={() => setOpen(false)}
          className="min-w-0 shrink"
        >
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 xl:flex" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname.startsWith(item.href) ? "page" : undefined}
              className="whitespace-nowrap py-3 text-sm font-bold text-pine-900 transition-colors hover:text-clay-700 aria-[current=page]:text-clay-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/contact"
            className="btn-primary hidden !min-h-11 !px-5 !py-2.5 !text-sm sm:inline-flex"
            onClick={() => setOpen(false)}
          >
            Free Estimate <span aria-hidden>↗</span>
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-sand-200 text-pine-950 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <path d="m6 6 12 12M18 6 6 18" />
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
          className="absolute inset-x-0 top-full max-h-[calc(100dvh-6rem)] overflow-y-auto border-b border-sand-200 bg-cream p-5 shadow-lift xl:hidden"
        >
          <div className="mx-auto max-w-6xl">
            {[
              ...nav,
              { href: "/service-areas", label: "Service areas" },
              { href: "/blog", label: "Planting & yard guides" },
              { href: "/contact", label: "Contact us" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={
                  pathname.startsWith(item.href) ? "page" : undefined
                }
                className="block border-b border-sand-200 py-3 font-bold text-pine-950 aria-[current=page]:text-clay-700"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="btn-primary"
              >
                Get a Free Estimate
              </Link>
              <a href={site.phoneHref} className="btn-ghost">
                Call {site.phone}
              </a>
            </div>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="mt-3 block py-3 text-center text-sm font-bold text-ink-soft"
            >
              Union Park &amp; Annie’s · Choose a brand ↗
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
