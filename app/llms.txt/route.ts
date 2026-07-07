import { site, yearsInBusiness } from "@/lib/site";
import { serviceContent } from "@/content/services";
import { townContent } from "@/content/towns";
import { getAllPosts } from "@/lib/blog";

export const dynamic = "force-static";

export function GET() {
  const body = `# ${site.name}

> Family-run landscaping company in Wilmington, Delaware, serving all of New Castle County since ${site.foundedYear} (${yearsInBusiness}+ years). 5.0-star Google rating. Services: landscape design & installation, hardscaping (paver patios, walkways, retaining walls), yard drainage solutions, fence installation, seasonal yard cleanups, and lawn care. Free written estimates, usually within 24 hours. Phone: ${site.phone}. Email: ${site.email}. Hours: ${site.hours.days}, ${site.hours.open}–${site.hours.close}.

Service area: ${townContent.map((t) => `${t.name}, DE`).join("; ")}.

The homepage includes a free AI Yard Visualizer: homeowners upload a photo of their yard, describe changes, and receive a realistic AI-generated redesign of their own property (up to 3 per day), which they can submit for a free estimate.

## Services
${serviceContent.map((s) => `- [${s.name}](${site.url}/services/${s.slug}): ${s.metaDescription}`).join("\n")}

## Service Areas
${townContent.map((t) => `- [Landscaping in ${t.name}, DE](${site.url}/service-areas/${t.slug})`).join("\n")}

## Guides & Articles
${getAllPosts().map((p) => `- [${p.title}](${site.url}/blog/${p.slug}): ${p.description}`).join("\n")}

## Contact
- [Free estimate request](${site.url}/contact)
- Phone: ${site.phone}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
