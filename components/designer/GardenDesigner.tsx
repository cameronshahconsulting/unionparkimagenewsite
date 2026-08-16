"use client";

import type { ComponentType } from "react";
import { ToastProvider } from "@/components/designer/Toast";
import { CartProvider } from "@/components/designer/CartProvider";
import DesignerImport from "@/components/designer/Designer";

const Designer = DesignerImport as ComponentType<{
  designId?: string | null;
  initialGardenSlug?: string | null;
  lockGarden?: boolean;
}>;

/** Annie's AI garden designer, wrapped for Union Park (install-first CTAs). */
export function GardenDesigner({
  designId = null,
  initialGardenSlug = null,
  lockGarden = false,
}: {
  designId?: string | null;
  initialGardenSlug?: string | null;
  lockGarden?: boolean;
} = {}) {
  return (
    <div className="annies-designer">
      <ToastProvider>
        <CartProvider>
          <Designer
            designId={designId}
            initialGardenSlug={initialGardenSlug}
            lockGarden={lockGarden}
          />
        </CartProvider>
      </ToastProvider>
    </div>
  );
}
