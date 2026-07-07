export const site = {
  name: "Union Park Landscaping",
  legalName: "Union Park Landscaping LLC",
  tagline: "Quality Maintenance, Lasting Impressions.",
  phone: "302-757-5496",
  phoneHref: "tel:+13027575496",
  email: "unionparklandscaping@gmail.com",
  url: "https://www.unionparklandscape.com",
  foundedYear: 2013,
  address: {
    locality: "Wilmington",
    region: "DE",
    county: "New Castle County",
    country: "US",
  },
  geo: { lat: 39.7391, lng: -75.5398 },
  hours: {
    days: "Monday – Saturday",
    open: "8:00 AM",
    close: "5:00 PM",
    schema: "Mo-Sa 08:00-17:00",
  },
  rating: { value: 5.0, count: 30 },
  social: {
    google: "https://www.google.com/search?q=Union+Park+Landscaping+Wilmington+DE",
  },
} as const;

export const yearsInBusiness = new Date().getFullYear() - site.foundedYear;

export interface ServiceDef {
  slug: string;
  name: string;
  short: string;
  blurb: string;
}

export const services: ServiceDef[] = [
  {
    slug: "landscape-design",
    name: "Landscape Design & Installation",
    short: "Landscape Design",
    blurb:
      "Custom planting plans, garden beds, trees, and shrubs designed for Delaware's climate — installed right the first time.",
  },
  {
    slug: "hardscaping",
    name: "Hardscaping: Patios, Walkways & Retaining Walls",
    short: "Hardscaping",
    blurb:
      "Paver patios, walkways, fire pits, and retaining walls built on properly compacted bases that last for decades.",
  },
  {
    slug: "drainage",
    name: "Drainage Solutions",
    short: "Drainage",
    blurb:
      "French drains, downspout extensions, grading, and dry creek beds that end standing water and protect your foundation.",
  },
  {
    slug: "fencing",
    name: "Fence Installation",
    short: "Fencing",
    blurb:
      "Wood, vinyl, and aluminum fencing installed straight, plumb, and to code — for privacy, pets, and curb appeal.",
  },
  {
    slug: "yard-cleanups",
    name: "Seasonal Yard Cleanups",
    short: "Yard Cleanups",
    blurb:
      "Spring and fall cleanups: leaf removal, bed edging, pruning, mulching, and haul-away that reset your yard.",
  },
  {
    slug: "lawn-care",
    name: "Lawn Care & Maintenance",
    short: "Lawn Care",
    blurb:
      "Weekly mowing, fertilization, aeration, overseeding, and weed control programs for a thick, green lawn.",
  },
];

export interface TownDef {
  slug: string;
  name: string;
  zip: string[];
}

export const towns: TownDef[] = [
  { slug: "wilmington-de", name: "Wilmington", zip: ["19801", "19802", "19803", "19805", "19806", "19808", "19809", "19810"] },
  { slug: "newark-de", name: "Newark", zip: ["19702", "19711", "19713"] },
  { slug: "hockessin-de", name: "Hockessin", zip: ["19707"] },
  { slug: "pike-creek-de", name: "Pike Creek", zip: ["19808"] },
  { slug: "greenville-de", name: "Greenville", zip: ["19807"] },
  { slug: "bear-de", name: "Bear", zip: ["19701"] },
  { slug: "middletown-de", name: "Middletown", zip: ["19709"] },
];

export const serviceAreaZips = [...new Set(towns.flatMap((t) => t.zip))];
