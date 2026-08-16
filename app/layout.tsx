import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";
import { JsonLd, localBusinessJsonLd } from "@/components/JsonLd";
import { site } from "@/lib/site";

/** Clean commercial sans — strong, non-generic, fits a conversion landscaping brand. */
const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Landscaping in Wilmington, DE & New Castle County`,
    template: `%s | ${site.name}`,
  },
  description: `Landscape design, hardscaping, drainage, fencing, cleanups & lawn care across New Castle County, DE since ${site.foundedYear}. 5.0-star rated. Free estimates: ${site.phone}.`,
  alternates: { canonical: "/home" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <JsonLd data={localBusinessJsonLd()} />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
