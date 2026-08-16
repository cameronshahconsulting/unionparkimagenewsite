import { site, services, towns } from "@/lib/site";

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LandscapeArchitect",
    "@id": `${site.url}/#business`,
    name: site.name,
    legalName: site.legalName,
    slogan: site.motto,
    url: site.url,
    telephone: `+1-${site.phone}`,
    email: site.email,
    foundingDate: String(site.foundedYear),
    priceRange: "$$",
    image: `${site.url}/opengraph-image.png`,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "17:00",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: site.rating.value,
      reviewCount: site.rating.count,
      bestRating: 5,
    },
    areaServed: towns.map((t) => ({
      "@type": "City",
      name: `${t.name}, DE`,
    })),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Landscaping Services",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.name,
          url: `${site.url}/services/${s.slug}`,
        },
      })),
    },
  };
}

export function serviceJsonLd(service: { slug: string; name: string; blurb: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.blurb,
    url: `${site.url}/services/${service.slug}`,
    serviceType: service.name,
    provider: { "@id": `${site.url}/#business` },
    areaServed: towns.map((t) => ({ "@type": "City", name: `${t.name}, DE` })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(crumbs: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${site.url}${c.href}`,
    })),
  };
}

export function blogPostingJsonLd(post: {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    url: `${site.url}/blog/${post.slug}`,
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: { "@id": `${site.url}/#business` },
    mainEntityOfPage: `${site.url}/blog/${post.slug}`,
  };
}
