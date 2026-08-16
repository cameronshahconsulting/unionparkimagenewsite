"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

/**
 * Mobile Call + Free Estimate bar.
 * Only appears after the hero estimate CTA scrolls out of view ,
 * so the first screen isn’t stacked with three convert buttons.
 */
export function MobileStickyCta() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  const disabled = pathname === "/" || pathname === "/contact";

  useEffect(() => {
    if (disabled) {
      setVisible(false);
      return;
    }

    const target = document.getElementById("hero-estimate-cta");
    if (!target) {
      // Non-home pages: show after a short scroll past the fold
      const onScroll = () => setVisible(window.scrollY > 420);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        // Show once the hero CTA is no longer on screen
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0, rootMargin: "0px" },
    );
    io.observe(target);
    return () => io.disconnect();
  }, [disabled, pathname]);

  useEffect(() => {
    document.body.classList.toggle("sticky-cta-on", visible && !disabled);
    return () => document.body.classList.remove("sticky-cta-on");
  }, [visible, disabled]);

  if (disabled || !visible) return null;

  return (
    <div
      className="mobile-sticky-cta fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-cream/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_28px_-14px_rgb(26_46_36/0.28)] backdrop-blur-md md:hidden"
      role="region"
      aria-label="Get a free estimate"
    >
      <div className="mx-auto flex max-w-lg gap-2.5">
        <a href={site.phoneHref} className="btn-ghost !px-4 !py-3 flex-1 !text-sm">
          Call
        </a>
        <Link href="/contact" className="btn-primary !px-4 !py-3 flex-[1.4] !text-sm">
          Free Estimate
        </Link>
      </div>
    </div>
  );
}
