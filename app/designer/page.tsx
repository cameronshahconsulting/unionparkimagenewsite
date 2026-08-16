import type { Metadata } from "next";
import { GardenDesigner } from "@/components/designer/GardenDesigner";
import { site } from "@/lib/site";
import "@/app/designer.css";

export const metadata: Metadata = {
  title: `Yard Designer | ${site.name}`,
  description: `Design your yard with a real plant list, then get a free Union Park Landscaping installation estimate. Serving ${site.address.county}, DE.`,
  alternates: { canonical: "/designer" },
};

export default function DesignerPage() {
  return (
    <section className="py-10 sm:py-14">
      <div className="container-site max-w-3xl">
        <p className="eyebrow">Free design tool</p>
        <h1 className="heading-display mt-2 text-3xl sm:text-4xl">
          Design it. We&apos;ll install it.
        </h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          Upload a photo of your yard, pick a vibe and budget, and get a plant list with
          season-by-season previews. When you&apos;re ready, request a free Union Park install quote.
        </p>
        <div className="mt-8 overflow-hidden rounded-xl border border-sand-200 bg-white shadow-card">
          <GardenDesigner />
        </div>
      </div>
    </section>
  );
}
