import type { Faq } from "@/components/Sections";

export interface TownContent {
  slug: string;
  name: string;
  metaDescription: string;
  /** Direct-answer opening paragraph (AEO). */
  intro: string;
  /** Genuinely local body copy — neighborhoods, terrain, common jobs. */
  body: string[];
  popularServices: string[];
  faqs: Faq[];
}

export const townContent: TownContent[] = [
  {
    slug: "wilmington-de",
    name: "Wilmington",
    metaDescription:
      "Landscaping in Wilmington, DE: patios, drainage, cleanups, fencing & lawn care from a 5.0-star local crew based right here. Free estimates: 302-757-5496.",
    intro:
      "Union Park Landscaping is based in Wilmington, Delaware, and has served homeowners here since 2013 — from Trolley Square and the Highlands to Brandywine Hundred and North Wilmington. We provide landscape design, hardscaping, drainage solutions, fencing, seasonal cleanups, and lawn care, all with free written estimates.",
    body: [
      "Wilmington yards come with Wilmington realities: older city lots with tight side yards and grading that sends water toward hundred-year-old foundations, mature street trees that bury lawns in leaves every November, and brick-era homes whose curb appeal deserves better than a strip of tired yews. We work these blocks constantly, so our quotes account for row-home access, alley haul-outs, and city parking from the start.",
      "North of the city line, Brandywine Hundred properties bring bigger lawns, established oaks and maples, and 1950s–60s grading that has settled into soggy corners. Drainage fixes, foundation-bed makeovers, and fall leaf programs are our most-requested jobs in the 19803 and 19810 zips.",
    ],
    popularServices: ["drainage", "yard-cleanups", "landscape-design", "hardscaping"],
    faqs: [
      {
        q: "Do you offer free landscaping estimates in Wilmington?",
        a: "Yes — free written estimates anywhere in Wilmington and the surrounding 198xx zips, usually within 24 hours of your call to 302-757-5496.",
      },
      {
        q: "Can you work on small city lots in Wilmington?",
        a: "Absolutely. A large share of our work is on city and row-home lots in neighborhoods like Trolley Square, the Triangle, and Union Park Gardens. We plan material staging and haul-out around alley and street access.",
      },
      {
        q: "Do you handle leaf removal in Brandywine Hundred?",
        a: "Yes — fall cleanups with full haul-away are one of our biggest services in Brandywine Hundred, where mature oaks drop heavy leaf loads from late October into December.",
      },
    ],
  },
  {
    slug: "newark-de",
    name: "Newark",
    metaDescription:
      "Landscaping in Newark, DE: lawn care, drainage, patios, fencing & cleanups near UD and across 19702, 19711 & 19713. Free estimates: 302-757-5496.",
    intro:
      "Union Park Landscaping serves Newark, Delaware — including neighborhoods off Kirkwood Highway, Paper Mill Road, and South Newark toward Glasgow — with lawn care, drainage solutions, paver patios, fencing, cleanups, and landscape design. Estimates are free and usually delivered within 24 hours.",
    body: [
      "Newark's mix is unlike anywhere else in the county: 1960s–80s ranches and split-levels with mature lawns, newer developments toward 19702, and rental properties near the University of Delaware that need dependable, low-fuss maintenance. We tailor the approach to the property — a renovation-grade overseed for a tired owner-occupied fescue lawn, or a simple, reliable mow-and-cleanup schedule for a rental.",
      "The clay soil through the Christina River basin drains slowly, and plenty of Newark backyards hold water along rear fence lines. French drains, swales, and downspout burials are steady work for us here, as are privacy fences on the denser postwar streets.",
    ],
    popularServices: ["lawn-care", "drainage", "fencing", "yard-cleanups"],
    faqs: [
      {
        q: "Do you mow lawns near the University of Delaware?",
        a: "Yes — we maintain owner-occupied homes and rental properties throughout Newark, including student-rental areas where owners want a set-and-forget weekly schedule.",
      },
      {
        q: "My Newark backyard floods along the fence — can you fix it?",
        a: "Very likely. Slow-draining clay plus flat rear yards is the most common drainage call we get in Newark. A French drain or regraded swale with a proper outlet usually solves it; assessments are free.",
      },
      {
        q: "Which Newark zip codes do you cover?",
        a: "All of them — 19702, 19711, and 19713, plus nearby Bear and Glasgow.",
      },
    ],
  },
  {
    slug: "hockessin-de",
    name: "Hockessin",
    metaDescription:
      "Landscaping in Hockessin, DE (19707): deer-resistant landscape design, patios, drainage & estate-quality maintenance on wooded lots. Free estimates.",
    intro:
      "Union Park Landscaping provides landscape design, hardscaping, drainage, fencing, and full-property maintenance in Hockessin, Delaware (19707) — with particular depth in the two things Hockessin yards demand most: deer-resistant planting design and managing wooded, sloped lots.",
    body: [
      "Hockessin properties tend to be larger, greener, and closer to the woods than anywhere else we work — which means deer. A beautiful bed of hostas here is a salad bar. Our Hockessin planting plans lean on inkberry, boxwood, itea, ornamental grasses, hellebores, and other proven deer-resistant species, so your investment doesn't get eaten by October.",
      "The rolling terrain along Lancaster Pike and Valley Road also makes hardscaping and water management bigger considerations: retaining walls that step down slopes, patios cut into grades, and drainage that intercepts runoff before it reaches the walkout basement. That's exactly the work our crew is built for.",
    ],
    popularServices: ["landscape-design", "hardscaping", "drainage", "yard-cleanups"],
    faqs: [
      {
        q: "What plants survive deer in Hockessin?",
        a: "Reliable choices include boxwood, inkberry holly, itea, andromeda, hellebore, catmint, Russian sage, and most ornamental grasses. We design entire deer-resistant landscapes for wooded Hockessin lots — it's one of our specialties.",
      },
      {
        q: "Can you build a patio on a sloped Hockessin lot?",
        a: "Yes. Slopes usually mean a cut-and-retain design — excavating into the grade and using a retaining or seating wall. It costs more than a flat-lot patio but produces a dramatic, usable space.",
      },
      {
        q: "Do you maintain larger properties in Hockessin?",
        a: "Yes — weekly maintenance, seasonal cleanups, and bed care for properties up to several acres in 19707.",
      },
    ],
  },
  {
    slug: "pike-creek-de",
    name: "Pike Creek",
    metaDescription:
      "Landscaping in Pike Creek, DE: slope-smart landscape design, retaining walls, drainage & lawn care in the valley. Free estimates: 302-757-5496.",
    intro:
      "Union Park Landscaping serves Pike Creek, Delaware with landscaping built for the valley: retaining walls and terraced beds for sloped yards, drainage that manages runoff, plus lawn care, fencing, and seasonal cleanups for the townhome and single-family communities off Linden Hill and New Linden Hill Road.",
    body: [
      "Pike Creek sits in a literal valley, and its neighborhoods — Linden Hill, Drummond North, the communities along Skyline Drive — are full of yards that tilt. Water moves fast across these properties, mulch washes downhill, and mowing a steep back bank gets old quickly. Much of our Pike Creek work is about taming grade: terracing beds with wall block, replacing wash-prone mulch slopes with groundcover and stone, and directing runoff into drains instead of basements.",
      "Townhome and small-lot owners here also call us for right-sized jobs: tidy foundation replantings, small paver landings, privacy screening between close neighbors, and dependable weekly mowing.",
    ],
    popularServices: ["hardscaping", "drainage", "landscape-design", "lawn-care"],
    faqs: [
      {
        q: "My Pike Creek backyard is too steep to use — options?",
        a: "The usual answer is terracing: one or two retaining walls that turn a slope into flat, usable levels, often with steps between them. We'll assess the grade and quote options at different budgets, free.",
      },
      {
        q: "Mulch keeps washing off my sloped beds — what works instead?",
        a: "On serious slopes we switch to shredded hardwood (locks together better), pinned erosion fabric under stone, or living groundcovers like juniper and creeping sedum that hold soil permanently.",
      },
      {
        q: "Do you serve Pike Creek townhome communities?",
        a: "Yes — we do plenty of townhome-scale projects and maintenance throughout 19808, and we're respectful of HOA rules and shared spaces.",
      },
    ],
  },
  {
    slug: "greenville-de",
    name: "Greenville",
    metaDescription:
      "Estate landscaping in Greenville, DE (19807): landscape design, formal gardens, stone hardscaping & full-property care in chateau country. Free estimates.",
    intro:
      "Union Park Landscaping serves Greenville, Delaware (19807) with estate-quality landscape design, stone and paver hardscaping, formal garden maintenance, and full-property care — detailed work that holds up to chateau country standards, delivered by a local crew that shows up on schedule.",
    body: [
      "Greenville properties along Kennett Pike and Montchanin Road set the highest bar in the county: long drives, mature specimen trees, boxwood parterres, and landscapes that were designed — and deserve to be maintained — with intention. Our Greenville work leans formal: crisp bed lines, properly pruned (never sheared-to-death) shrubs, natural stone walks, and planting plans that respect what's already established.",
      "These properties also generate serious seasonal workloads — bulk leaf management under mature hardwoods, storm cleanup, and renovation of older foundation plantings that have outgrown their architecture. We handle all of it with one accountable crew rather than a rotating cast of subs.",
    ],
    popularServices: ["landscape-design", "hardscaping", "yard-cleanups", "lawn-care"],
    faqs: [
      {
        q: "Do you maintain formal gardens in Greenville?",
        a: "Yes — boxwood care, hand pruning, edging, and bed maintenance appropriate to formal landscapes. We prune to plant structure rather than shearing everything into gumdrops.",
      },
      {
        q: "Can you renovate overgrown foundation plantings on an older Greenville home?",
        a: "That's one of our favorite projects: remove the overgrown material, redesign at the right mature scale for the architecture, and replant with species that won't swallow the windows in five years.",
      },
      {
        q: "Do you work on larger Greenville properties?",
        a: "Yes, from village lots to multi-acre estates in 19807. We'll scope the property in person and quote a maintenance program or project in writing.",
      },
    ],
  },
  {
    slug: "bear-de",
    name: "Bear",
    metaDescription:
      "Landscaping in Bear, DE (19701): builder-grade yard upgrades, drainage for flat lots, fencing, patios & lawn care. Free estimates: 302-757-5496.",
    intro:
      "Union Park Landscaping serves Bear, Delaware (19701) with the upgrades newer developments need most: turning builder-grade yards into real landscapes, fixing flat-lot drainage, installing fences and patios, and running lawn programs that thicken thin construction-soil turf. Estimates are free.",
    body: [
      "Most Bear neighborhoods — around Governors Square, Caravel, Red Lion, and Route 40 — were built in the last few decades, and they share a starting point: a thin layer of topsoil over compacted construction clay, three builder shrubs, and a flat lot that holds water after every storm. We spend a lot of time in Bear correcting exactly that, with core aeration and overseeding programs, amended planting beds, and French drains or dry wells that give flat yards somewhere to send water.",
      "Fencing and patios are the other big requests here — new families fencing for kids and dogs, and homeowners upgrading a bare concrete builder pad into a proper paver patio. We know the common HOA requirements in Bear communities and quote with them in mind.",
    ],
    popularServices: ["drainage", "fencing", "hardscaping", "lawn-care"],
    faqs: [
      {
        q: "Why does my Bear lawn struggle no matter what I do?",
        a: "Newer developments sit on compacted construction clay with minimal topsoil, so roots can't establish. Fall core aeration plus overseeding with quality tall fescue — repeated a couple of seasons — transforms these lawns. It's our most common Bear service.",
      },
      {
        q: "My flat yard in Bear holds water — can that be fixed?",
        a: "Yes. Flat lots need engineered outlets: French drains to daylight where grade allows, or dry wells where it doesn't, plus downspout management. Free assessment first, so you only pay for what your lot actually needs.",
      },
      {
        q: "Do you know our HOA fence rules?",
        a: "We've installed fences across most large Bear communities and are familiar with typical height and style restrictions. We'll flag anything your HOA is likely to require before you order materials.",
      },
    ],
  },
  {
    slug: "middletown-de",
    name: "Middletown",
    metaDescription:
      "Landscaping in Middletown, DE (19709): new-construction landscape packages, patios, fencing & lawn establishment south of the canal. Free estimates.",
    intro:
      "Union Park Landscaping serves Middletown, Delaware (19709) — including Westown, Willow Grove, and the communities off Route 299 — with complete new-construction landscape packages: foundation plantings, trees, paver patios, fencing, and lawn establishment for yards that started as bare builder grass.",
    body: [
      "Middletown is the fastest-growing part of our service area, and most of our work south of the canal starts with a blank slate: a new home, a stretch of builder-grade lawn, and an HOA deadline to landscape the front yard. We build complete starter packages — foundation beds, a shade tree or two, defined lawn edges — priced for new-home budgets, and we design them so they still look right when everything matures.",
      "Because these communities are new, so are their problems: swales between houses that stay wet, thin turf over graded clay, and bare fence lines with zero privacy. Drainage corrections, privacy plantings, and paver patios that extend tiny builder slabs are all steady Middletown requests.",
    ],
    popularServices: ["landscape-design", "hardscaping", "fencing", "lawn-care"],
    faqs: [
      {
        q: "How much should I budget to landscape a new construction home in Middletown?",
        a: "A typical front-yard starter package — foundation beds, shrubs, a tree, and mulch — runs $2,500–$6,000. Add a paver patio and the total commonly lands between $10,000 and $20,000. We phase projects so you can spread the investment.",
      },
      {
        q: "My HOA requires front landscaping by a deadline — can you help?",
        a: "Yes, this is one of our most common Middletown calls. We know the typical requirements in communities like Westown and can design, quote, and install well within HOA timelines.",
      },
      {
        q: "The swale beside my new house never dries — is that fixable?",
        a: "Usually, but carefully: builder swales are engineered drainage paths, so the fix is improving flow (regrading low spots, adding a catch basin or river-stone channel) rather than blocking it. We'll assess it free and tell you what's allowed.",
      },
    ],
  },
];

export function getTown(slug: string) {
  return townContent.find((t) => t.slug === slug);
}
