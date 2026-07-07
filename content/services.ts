import type { SceneVariant } from "@/components/Scene";
import type { Faq } from "@/components/Sections";

export interface ServiceContent {
  slug: string;
  short: string;
  name: string;
  scene: SceneVariant;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  /** First paragraph is written as a direct answer (AEO). */
  intro: string[];
  signsTitle: string;
  signs: string[];
  included: string[];
  process: { title: string; body: string }[];
  localNote: string;
  priceNote: string;
  faqs: Faq[];
}

export const serviceContent: ServiceContent[] = [
  {
    slug: "landscape-design",
    short: "Landscape Design",
    name: "Landscape Design & Installation",
    scene: "garden",
    metaTitle: "Landscape Design & Installation in Wilmington, DE",
    metaDescription:
      "Custom landscape design and planting installation in Wilmington & New Castle County, DE. Garden beds, trees, shrubs & native plants suited to Delaware. Free estimates.",
    h1: "Landscape Design & Installation in New Castle County, DE",
    intro: [
      "Union Park Landscaping designs and installs custom landscapes for homes across Wilmington and New Castle County — garden beds, foundation plantings, trees, shrubs, and perennials chosen specifically for Delaware's climate and soil. Every design starts with how you actually use your yard, and every plant is installed with proper soil prep so it thrives instead of just surviving.",
      "Whether you want a full front-yard makeover, a low-maintenance foundation planting, or a backyard that finally feels finished, we handle design and installation with one local crew — no subcontractors, no handoffs.",
    ],
    signsTitle: "A new landscape design makes sense when…",
    signs: [
      "Your foundation plantings are overgrown, woody, or hiding your windows",
      "Beds look patchy no matter how much mulch you add",
      "You've bought plants that keep dying in the same spots",
      "You're preparing to sell and want serious curb appeal",
      "Your new-construction yard is a blank slate of builder-grade grass",
    ],
    included: [
      "On-site design consultation and planting plan",
      "Bed shaping, edging, and soil amendment",
      "Trees, shrubs, perennials, and ornamental grasses",
      "Native and deer-resistant plant options",
      "Premium mulch installation",
      "Care instructions for everything we plant",
    ],
    process: [
      {
        title: "Walk & listen",
        body: "We walk your property with you, talk about how you use the space, what you like, what you hate, and your maintenance tolerance.",
      },
      {
        title: "Design & quote",
        body: "You get a planting plan and a clear written estimate — plant list, quantities, and pricing with no vague allowances.",
      },
      {
        title: "Install & guarantee",
        body: "Our crew preps soil properly, plants correctly (depth, spacing, root flare), mulches, and walks the finished work with you.",
      },
    ],
    localNote:
      "Delaware sits in USDA hardiness zone 7a–7b with heavy clay soil in much of New Castle County. We design around that reality — amending clay beds, choosing plants like inkberry holly, itea, oakleaf hydrangea, coneflower, and switchgrass that handle our humid summers, and placing deer-resistant species in neighborhoods near woods like Hockessin and Greenville.",
    priceNote:
      "Most planting projects in New Castle County run $1,500–$8,000 depending on size and plant maturity; full front-yard redesigns with larger trees typically run more. Estimates are free and itemized.",
    faqs: [
      {
        q: "How much does landscape design cost in Delaware?",
        a: "At Union Park Landscaping, design consultation is built into the project — you don't pay a separate design fee for typical residential work. Most complete bed redesigns with plants and mulch fall between $1,500 and $8,000 in New Castle County.",
      },
      {
        q: "What plants grow best in New Castle County?",
        a: "New Castle County is USDA zone 7a–7b. Reliable performers include inkberry holly, oakleaf hydrangea, itea, viburnum, coneflower, black-eyed Susan, switchgrass, and serviceberry. We favor natives and deer-resistant varieties where deer pressure is high.",
      },
      {
        q: "When is the best time to plant in Delaware?",
        a: "Spring (March–May) and fall (September–November) are ideal — plants establish roots before summer heat or winter cold. We install through the whole growing season with proper watering plans.",
      },
      {
        q: "Do you guarantee your plants?",
        a: "Yes. We plant correctly and stand behind our work with a satisfaction guarantee. We'll also leave you simple watering instructions — the #1 factor in first-year plant survival.",
      },
    ],
  },
  {
    slug: "hardscaping",
    short: "Hardscaping",
    name: "Hardscaping: Patios, Walkways & Retaining Walls",
    scene: "patio",
    metaTitle: "Paver Patios, Walkways & Retaining Walls in Wilmington, DE",
    metaDescription:
      "Paver patio, walkway, fire pit & retaining wall installation in Wilmington & New Castle County, DE. Properly compacted bases that last decades. Free estimates.",
    h1: "Paver Patios, Walkways & Retaining Walls in New Castle County",
    intro: [
      "Union Park Landscaping builds paver patios, walkways, fire pits, and retaining walls across Wilmington and New Castle County. The difference between a patio that lasts 30 years and one that heaves in 3 is invisible when the job is finished — it's the excavation depth, base material, and compaction underneath. We build the base right, every time.",
      "From a simple front walkway to a full outdoor living space with seating walls and a fire pit, we design hardscapes that fit your home's style and your budget, and we quote them in writing before a shovel hits the ground.",
    ],
    signsTitle: "Homeowners call us for hardscaping when…",
    signs: [
      "The concrete patio is cracked, stained, or sinking",
      "There's no defined outdoor space for grilling and gathering",
      "A sloped section of yard is eroding and needs a retaining wall",
      "The front entry path is a muddy shortcut through the lawn",
      "They want a fire pit area to use the yard past summer",
    ],
    included: [
      "Paver patios and natural stone patios",
      "Walkways and front entry landings",
      "Retaining walls and seating walls",
      "Fire pit areas",
      "Steps, borders, and edge restraint",
      "Polymeric sand joints and proper base compaction",
    ],
    process: [
      {
        title: "Design & layout",
        body: "We measure, discuss materials (pavers, natural stone, wall block), and mark the layout so you can see the footprint before you commit.",
      },
      {
        title: "Excavate & build the base",
        body: "We excavate to proper depth, install geotextile where soil requires it, and compact stone base in lifts — the step cheap installers skip.",
      },
      {
        title: "Set, cut & finish",
        body: "Pavers are set to consistent slope for drainage, cuts are clean, joints get polymeric sand, and we haul away all debris.",
      },
    ],
    localNote:
      "New Castle County's clay-heavy soil holds water and moves with freeze-thaw cycles, which is why patios built on shallow bases fail here. We excavate deeper and compact more than the minimum, and we pitch every surface away from your foundation — a detail that matters on Delaware's older Wilmington lots where grading is tight.",
    priceNote:
      "Typical paver patios in New Castle County run $5,000–$18,000 depending on size, material, and site access. Walkways often start around $2,500. Free written estimates with material options at multiple price points.",
    faqs: [
      {
        q: "How much does a paver patio cost in Delaware?",
        a: "Most paver patios in New Castle County cost $25–$40 per square foot installed, so a 400 sq ft patio typically runs $10,000–$16,000. Size, paver choice, site access, and features like seating walls or fire pits move the number.",
      },
      {
        q: "Pavers or concrete — which is better?",
        a: "Pavers cost more upfront but resist cracking, can be repaired seam by seam, and handle Delaware's freeze-thaw cycles far better than poured concrete slabs. Concrete is cheaper initially but cracks are permanent.",
      },
      {
        q: "How long does a patio installation take?",
        a: "Most residential patios take 3–7 working days once we start, depending on size and weather. We give you a schedule with your estimate.",
      },
      {
        q: "Do I need a permit for a patio or retaining wall in New Castle County?",
        a: "Ground-level patios usually don't require a permit, but retaining walls over 4 feet and structures may. We'll tell you exactly what applies to your project during the estimate.",
      },
    ],
  },
  {
    slug: "drainage",
    short: "Drainage",
    name: "Yard Drainage Solutions",
    scene: "drainage",
    metaTitle: "Yard Drainage Solutions in Wilmington, DE | French Drains & Grading",
    metaDescription:
      "Fix standing water for good: French drains, downspout burial, regrading & dry creek beds in Wilmington & New Castle County, DE. Free drainage assessments.",
    h1: "Yard Drainage Solutions in Wilmington & New Castle County",
    intro: [
      "Standing water in a Delaware yard is almost always fixable, and it usually comes down to one of three causes: roof water dumping next to the house, low spots with nowhere to drain, or compacted clay soil that won't absorb. Union Park Landscaping diagnoses which one you have and installs the right fix — French drains, buried downspouts, regrading, catch basins, or dry creek beds.",
      "Left alone, drainage problems don't stay in the yard. They kill grass, breed mosquitoes, rot fences, and work their way into basements. Fixing the yard is far cheaper than fixing a foundation.",
    ],
    signsTitle: "Signs your yard has a drainage problem",
    signs: [
      "Puddles that sit for more than a day after rain",
      "A soggy, mossy strip of lawn that never dries out",
      "Mulch washing out of beds during storms",
      "Water stains or dampness in the basement after heavy rain",
      "Downspouts dumping directly at the foundation",
    ],
    included: [
      "Drainage assessment and diagnosis",
      "French drain design and installation",
      "Downspout burial and extensions to daylight or dry wells",
      "Regrading and swales",
      "Catch basins and channel drains",
      "Dry creek beds that handle water and look intentional",
    ],
    process: [
      {
        title: "Diagnose",
        body: "We walk the property (ideally after rain), trace where water comes from and where it should go, and identify the actual cause — not just the symptom.",
      },
      {
        title: "Design the fix",
        body: "You get a written plan: what we'll install, where the water will end up, and what it costs. No oversized systems you don't need.",
      },
      {
        title: "Install & restore",
        body: "We trench, pipe, and grade with proper slope, then restore the surface with soil and seed or sod — you shouldn't see the fix, just the results.",
      },
    ],
    localNote:
      "Much of New Castle County sits on dense clay that absorbs water slowly, and many Wilmington and Newark neighborhoods were graded decades ago with settling since. That combination makes French drains and downspout management the highest-impact fixes here. We size pipe and stone for real Delaware storm volumes, not minimums.",
    priceNote:
      "Downspout burials often run $800–$2,500; French drain systems typically $2,500–$8,000 depending on length and outlet. Drainage assessments are free.",
    faqs: [
      {
        q: "How do I fix standing water in my yard?",
        a: "First identify the source: roof water, surface runoff, or poor absorption. Buried downspouts fix roof water, regrading and swales fix runoff paths, and French drains fix chronically wet zones. Most Delaware yards need a combination, which is why we start with a free on-site assessment.",
      },
      {
        q: "How much does a French drain cost in Delaware?",
        a: "Most residential French drains in New Castle County cost $2,500–$8,000 installed, driven by trench length, depth, and where the water can outlet. Simple downspout burials start well under that.",
      },
      {
        q: "Will a French drain protect my basement?",
        a: "An exterior yard drain dramatically reduces the water reaching your foundation, which resolves many damp-basement problems. Severe cases may also need interior waterproofing — we'll tell you honestly which situation you have.",
      },
      {
        q: "Do drainage fixes ruin the lawn?",
        a: "Temporarily, along the trench line — then we restore it with topsoil and seed or sod. Within a season you shouldn't be able to find the trench.",
      },
    ],
  },
  {
    slug: "fencing",
    short: "Fencing",
    name: "Fence Installation",
    scene: "fence",
    metaTitle: "Fence Installation in Wilmington, DE | Wood, Vinyl & Aluminum",
    metaDescription:
      "Professional fence installation in Wilmington & New Castle County, DE — privacy, picket, vinyl & aluminum fences set straight and to code. Free estimates.",
    h1: "Fence Installation in Wilmington & New Castle County",
    intro: [
      "Union Park Landscaping installs wood, vinyl, and aluminum fencing for homes across New Castle County — privacy fences, picket fences, pool-code aluminum, and pet fencing. A fence is only as good as its posts: we dig below frost line, set posts in concrete, and string every run straight, so the fence you get in year ten looks like the one you paid for in year one.",
      "We handle the full job: layout, utility marking (Miss Utility of Delmarva), permits where required, tear-out of old fencing, and haul-away.",
    ],
    signsTitle: "Time for a new fence?",
    signs: [
      "Posts are leaning or panels are sagging",
      "A new dog or a pool means containment is now a requirement",
      "The neighbor's new deck overlooks your patio",
      "Boards are rotting faster than you can replace them",
      "Your HOA or insurance flagged the old fence",
    ],
    included: [
      "Wood privacy and picket fences (pressure-treated and cedar)",
      "Low-maintenance vinyl fencing",
      "Aluminum fencing, including pool-code compliant",
      "Gates: walk gates and double drive gates",
      "Old fence removal and haul-away",
      "Utility marking and permit guidance",
    ],
    process: [
      {
        title: "Layout & quote",
        body: "We confirm your property line assumptions, mark the run, discuss style and height, and quote the full job in writing — including gates and tear-out.",
      },
      {
        title: "Utilities & posts",
        body: "Utilities get marked before digging. Posts are set below frost line in concrete and left to cure so nothing shifts.",
      },
      {
        title: "Panels, gates & cleanup",
        body: "Panels or boards go up straight and level, gates are hung to swing true, and we leave the site cleaner than we found it.",
      },
    ],
    localNote:
      "New Castle County requires fences to meet zoning height rules (typically 4 ft front yard, 7 ft rear), and pool barriers must meet Delaware's pool code. Wilmington city lots often have tight setbacks and shared lines — we help you confirm placement before anyone digs, and we always call Miss Utility first.",
    priceNote:
      "Wood privacy fencing in New Castle County typically runs $35–$60 per linear foot installed; vinyl $45–$75; aluminum $40–$70. A typical suburban backyard runs $4,000–$12,000. Estimates are free.",
    faqs: [
      {
        q: "How much does a fence cost in Delaware?",
        a: "Installed prices in New Castle County typically run $35–$60 per linear foot for wood privacy fence, $45–$75 for vinyl, and $40–$70 for aluminum. A 150-linear-foot backyard usually lands between $5,000 and $10,000 depending on material and gates.",
      },
      {
        q: "Do I need a permit to build a fence in New Castle County?",
        a: "Many residential fences under the zoning height limits don't need a building permit, but city of Wilmington properties and pool enclosures have specific requirements. We confirm what applies to your address as part of the free estimate.",
      },
      {
        q: "How close to the property line can I build a fence?",
        a: "In most of New Castle County you can build up to the line, but you're responsible for knowing where the line is. We recommend locating your survey pins or getting a survey for tight lots — we'll walk it with you.",
      },
      {
        q: "Wood or vinyl — which fence should I choose?",
        a: "Wood costs less upfront and looks natural but needs staining every few years. Vinyl costs roughly 25–40% more but needs no maintenance beyond washing. For Delaware humidity, vinyl and aluminum age best; cedar outperforms pressure-treated pine if you want wood.",
      },
    ],
  },
  {
    slug: "yard-cleanups",
    short: "Yard Cleanups",
    name: "Seasonal Yard Cleanups",
    scene: "cleanup",
    metaTitle: "Spring & Fall Yard Cleanups in Wilmington, DE",
    metaDescription:
      "Spring & fall yard cleanups in Wilmington & New Castle County, DE: leaf removal, pruning, bed edging, mulching & haul-away. One visit, total reset. Free quotes.",
    h1: "Spring & Fall Yard Cleanups in New Castle County",
    intro: [
      "A seasonal cleanup from Union Park Landscaping is a full reset for your yard: leaves removed, beds cut back and re-edged, shrubs pruned, debris hauled away, and fresh mulch down if you want it. One crew, one visit, and the yard looks cared-for again — usually in a single day.",
      "We do spring cleanups that undo winter and prep beds for the growing season, and fall cleanups that clear leaves and put the yard to bed properly so spring starts easier.",
    ],
    signsTitle: "Book a cleanup when…",
    signs: [
      "Leaves are smothering the lawn (they kill grass in weeks, not months)",
      "Bed edges have disappeared into the lawn",
      "Perennials are standing dead from last season",
      "Shrubs are shaggy and touching the house",
      "You're hosting soon and the yard is embarrassing you",
    ],
    included: [
      "Complete leaf removal and haul-away",
      "Cutting back perennials and ornamental grasses",
      "Shrub pruning and shaping",
      "Bed edging and weeding",
      "Fresh mulch installation (optional)",
      "Gutter-line and hardscape blow-off",
    ],
    process: [
      {
        title: "Quick quote",
        body: "Send photos or let us swing by — cleanup quotes are fast and usually delivered the same day.",
      },
      {
        title: "One-day reset",
        body: "The crew works the property front to back: leaves, beds, pruning, edging, and a full blow-off of walks and patios.",
      },
      {
        title: "Everything hauled",
        body: "All debris leaves with us. No curb piles, no bags for you to deal with.",
      },
    ],
    localNote:
      "New Castle County's mature oaks and maples drop heavy leaf loads from late October through early December, and matted oak leaves are notorious for smothering fescue lawns over winter. We typically recommend one mid-fall and one late-fall visit for heavily treed lots in neighborhoods like Brandywine Hundred, Hockessin, and Greenville.",
    priceNote:
      "Most cleanups in New Castle County run $300–$900 depending on lot size and leaf volume; heavily wooded properties run more. Quotes are free and fast.",
    faqs: [
      {
        q: "How much does a yard cleanup cost in Delaware?",
        a: "Most New Castle County cleanups run $300–$900. Small townhome yards can be less; heavily wooded half-acre lots with full leaf removal and mulch can exceed $1,200. We quote from photos or a quick visit, free.",
      },
      {
        q: "When should I schedule a spring cleanup in Delaware?",
        a: "March through early May is ideal — after the last hard freezes but before shrubs fully leaf out, which makes pruning and bed work cleaner. Popular weeks book out fast, so call in February or March.",
      },
      {
        q: "Should leaves be removed or mulched into the lawn?",
        a: "Light leaf cover can be mulch-mowed into the lawn and is good for it. Heavy cover — common under New Castle County's mature oaks — mats down, blocks light, and kills grass, so it needs removal. Most properties here need genuine removal at least once each fall.",
      },
      {
        q: "Do you haul everything away?",
        a: "Yes. All leaves, branches, and debris leave with our crew the same day. Nothing is left at your curb.",
      },
    ],
  },
  {
    slug: "lawn-care",
    short: "Lawn Care",
    name: "Lawn Care & Maintenance",
    scene: "lawn",
    metaTitle: "Lawn Care & Mowing in Wilmington, DE",
    metaDescription:
      "Weekly mowing, fertilization, aeration, overseeding & weed control in Wilmington & New Castle County, DE. Reliable crews, sharp blades, clean lines. Free quotes.",
    h1: "Lawn Care & Mowing in Wilmington & New Castle County",
    intro: [
      "Union Park Landscaping provides weekly mowing and full-season lawn programs across New Castle County: sharp-blade mowing with clean lines, edging and blow-off every visit, plus fertilization, weed control, aeration, and overseeding timed to Delaware's cool-season grass calendar.",
      "A great Delaware lawn is mostly about doing the right things at the right times — feeding in fall, pre-emergent in early spring, seeding in September. We run that calendar for you so the lawn just keeps getting thicker.",
    ],
    signsTitle: "Your lawn is asking for help if…",
    signs: [
      "It's more crabgrass and clover than actual grass",
      "Bare patches reappear every summer in the same spots",
      "The soil is so compacted water runs off instead of soaking in",
      "Mowing keeps getting skipped and the yard shows it",
      "It greens up late and browns out early",
    ],
    included: [
      "Weekly mowing with edging and hard-surface blow-off",
      "Fertilization programs for tall fescue and bluegrass",
      "Pre-emergent and broadleaf weed control",
      "Core aeration",
      "Overseeding with quality tall fescue blends",
      "Lime and soil amendments based on need",
    ],
    process: [
      {
        title: "Lawn assessment",
        body: "We look at grass type, thatch, compaction, shade, and weeds, then recommend only what your lawn actually needs.",
      },
      {
        title: "Season-long program",
        body: "Applications and services are scheduled to Delaware's growing calendar — you don't have to remember anything.",
      },
      {
        title: "Consistent crews",
        body: "Same crew, same day each week where possible, with clean stripes and no clumps left behind.",
      },
    ],
    localNote:
      "New Castle County lawns are overwhelmingly tall fescue — a cool-season grass that thrives in our spring and fall and suffers in July heat. That's why fall (September–October) aeration and overseeding is the single highest-impact lawn service in Delaware, and why we front-load feeding in fall rather than dumping nitrogen in summer.",
    priceNote:
      "Weekly mowing for typical New Castle County lots runs $45–$75 per visit. Full-season fertilization and weed-control programs typically run $350–$700 per year. Quotes are free.",
    faqs: [
      {
        q: "How much does lawn mowing cost in Wilmington, DE?",
        a: "Most New Castle County homes pay $45–$75 per weekly mowing visit, including edging and blow-off. Larger or heavily fenced lots run more. Season fertilization programs typically add $350–$700 per year.",
      },
      {
        q: "When should I aerate and overseed in Delaware?",
        a: "September to mid-October. Soil is warm, air is cooling, and weed pressure is fading — tall fescue seeded then establishes before winter and survives the following summer far better than spring-seeded grass.",
      },
      {
        q: "How short should grass be cut in Delaware?",
        a: "Tall fescue should be mowed at 3–4 inches, higher in summer heat. Cutting shorter stresses the grass and invites crabgrass — it's the most common DIY lawn mistake we see.",
      },
      {
        q: "Do you offer one-time mowing or only contracts?",
        a: "We prioritize weekly customers, but we take one-time and vacation cuts when the schedule allows. No long-term contracts — we keep customers by doing good work, not paperwork.",
      },
    ],
  },
];

export function getService(slug: string) {
  return serviceContent.find((s) => s.slug === slug);
}
