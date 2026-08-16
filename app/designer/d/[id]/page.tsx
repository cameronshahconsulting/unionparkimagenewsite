import type { Metadata } from "next";
import { GardenDesigner } from "@/components/designer/GardenDesigner";
import { site } from "@/lib/site";
import "@/app/designer.css";

export const metadata: Metadata = {
  title: `Your garden design | ${site.name}`,
  robots: { index: false, follow: false },
};

export default async function DesignPermalinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <section className="py-10 sm:py-14">
      <div className="container-site max-w-3xl">
        <p className="eyebrow">Saved design</p>
        <h1 className="heading-display mt-2 text-3xl sm:text-4xl">Your garden plan</h1>
        <p className="mt-3 text-ink-soft">
          Request a Union Park install quote, or review the plant list anytime.
        </p>
        <div className="mt-8 overflow-hidden rounded-md border border-sand-200 bg-cream shadow-card">
          <GardenDesigner designId={id} />
        </div>
      </div>
    </section>
  );
}
