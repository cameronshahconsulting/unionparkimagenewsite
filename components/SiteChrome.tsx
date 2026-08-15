"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

/** Trailer QR linktree at `/` is chrome-free; the rest of the UPL site keeps nav + footer. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLinkTree = pathname === "/";

  if (isLinkTree) {
    return <main id="main">{children}</main>;
  }

  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
