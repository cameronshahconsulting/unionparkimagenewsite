import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/SiteChrome";
import { JsonLd, localBusinessJsonLd } from "@/components/JsonLd";
import { site } from "@/lib/site";

/** Same sans family Annie's uses for body — keeps the two brands feeling related. */
const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800"],
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
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <JsonLd data={localBusinessJsonLd()} />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
