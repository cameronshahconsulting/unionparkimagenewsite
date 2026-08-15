import { NextResponse } from "next/server";
import { planDesign, geminiConfigured, paletteSummary, DEFAULT_BED_BOX, enhancePrompt } from "@/lib/gemini";
import { storeDesignBuffer } from "@/lib/design-images";
import { supabaseConfigured } from "@/lib/supabase";
import { createCart, shopifyConfigured, variantIdBySku } from "@/lib/shopify";
import { GARDENS, DESIGNER_IN_STOCK_SKUS, PLANTS } from "@/lib/inventory";
import {
  scaleGardenPlan,
  mergeAiPlantSuggestions,
  applyBudget,
  hotspotsFor,
  swapCandidatesFor,
  buildPlantPool,
} from "@/lib/garden-plan";
import { habitNote, friendlyName } from "@/lib/plant-visuals";
import { bloomRibbon, ribbonSummary, gapFillers } from "@/lib/bloom-calendar";
import { plantWhenFor } from "@/lib/plant-when";
import {
  sanitizeVibes,
  sanitizeLifestyle,
  sanitizeSun,
  gardenSlugFor,
  briefFrom,
  applyLifestyle,
  lifestyleNote,
  chipLabels,
  preferredGeneraFor,
  constraintsFromText,
} from "@/lib/vibes";
import {
  validateDesignInput,
  checkWeeklyQuota,
  reserveDesign,
  isValidEmail,
  hashEmail,
  normalizeEmail,
  clientIp,
  hashIp,
} from "@/lib/guard";
import { assertEmailVerified } from "@/lib/email-verify";
import { saveDesignPlan } from "@/lib/designs";
import { recordAssent } from "@/lib/legal-assent";
import { recordMarketingConsent } from "@/lib/marketing-consent";
import { notifyDesignStageError } from "@/lib/design-alerts";

export const runtime = "nodejs";
/** Plan + plant list only — install & bloom images are separate requests. */
export const maxDuration = 300;

export async function POST(req) {
  const startedAt = Date.now();
  let email = null;
  try {
    const body = await req.json();

    // Email OTP gate — required before generation (abuse / weekly quota).
    email = normalizeEmail(body.email);
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Enter a valid email so we can send your design." },
        { status: 400 }
      );
    }

    const verified = assertEmailVerified(req, email);
    if (!verified.ok) {
      return NextResponse.json({ error: verified.error, needsVerify: true }, { status: 403 });
    }

    const emailHash = verified.emailHash || hashEmail(email);
    const ipHash = hashIp(clientIp(req));

    // Clickwrap enforcement (P0-8) — checkbox is unchecked by default in the UI.
    if (body.assent !== true) {
      return NextResponse.json(
        { error: "Please agree to the Delivery & Plant Care Terms to continue." },
        { status: 400 }
      );
    }

    // Marketing opt-in (P1-7) — unchecked by default in the UI, separate from the
    // required Terms checkbox above.
    if (body.marketingOptIn === true) {
      await recordMarketingConsent({ email, source: "designer_email" });
    }

    // Weekly quota (5 designs / email / week).
    const quota = await checkWeeklyQuota(emailHash);
    if (!quota.allowed) {
      return NextResponse.json(
        { error: quota.error, quota: { used: quota.used, remaining: 0, limit: quota.limit } },
        {
          status: 429,
          headers: quota.retryAfter ? { "Retry-After": String(quota.retryAfter) } : undefined,
        }
      );
    }

    // Vibe chips are the front door; they pick the garden template underneath.
    // Free-text constraints (deer, shade, etc.) merge into lifestyle keys so we
    // actually filter — and we only label what we applied.
    const vibeKeys = sanitizeVibes(body.vibes);
    const fromText = constraintsFromText(body.description);
    const lifestyleKeys = sanitizeLifestyle([
      ...(Array.isArray(body.lifestyle) ? body.lifestyle : []),
      ...fromText.lifestyleKeys,
    ]);
    const sunKey = sanitizeSun(body.sunAspect || body.sun);
    const effectiveGardenSlug =
      String(body.gardenSlug || "").trim() || gardenSlugFor(vibeKeys, lifestyleKeys, sunKey);

    const validated = validateDesignInput(
      { ...body, gardenSlug: effectiveGardenSlug },
      { requirePhoto: true }
    );
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { areaImage, inspoImages, description, style, sqFt, budget, gardenSlug, shape, wantWalkway, keepExisting } =
      validated.data;
    // Opt-in, checked at setup — doesn't affect plant selection or image
    // validation, just whether we chain a night render after bloom finishes.
    const wantNightView = Boolean(body.wantNightView);

    const garden = gardenSlug ? GARDENS.find((g) => g.slug === gardenSlug) : null;
    if (gardenSlug && !garden) {
      return NextResponse.json({ error: "Unknown garden template." }, { status: 400 });
    }

    // Her taps + her words become one brief; enhance it so image prompts stay vivid.
    let desc = briefFrom({ vibeKeys, lifestyleKeys, sunKey, description }) || garden?.promptSeed || "";
    if (geminiConfigured() && desc) {
      try {
        const enhanced = await enhancePrompt({
          description: desc,
          gardenTitle: garden?.title || style || "Garden",
          gardenSeed: garden?.promptSeed || "",
          sqFt,
          shape,
          wantWalkway,
        });
        if (enhanced && enhanced.length > 40) desc = enhanced;
      } catch (err) {
        console.warn("enhancePrompt failed — using raw brief", err?.message || err);
      }
    }

    const gardenTitle = garden?.title || style || "Garden";
    const styleTag = style || garden?.styleTags?.[0] || "Cottage";
    // Keep the template's character but guarantee layers — never six hydrangeas —
    // and make sure her chips can actually pull a plant into the running.
    const baseGarden = garden || {
      slug: null,
      skus: DESIGNER_IN_STOCK_SKUS.slice(0, 40),
      title: style || "Custom",
    };
    const pool = {
      ...baseGarden,
      skus: buildPlantPool(baseGarden, { preferGenera: preferredGeneraFor(lifestyleKeys) }),
    };
    let planResult = scaleGardenPlan({ garden: pool, sqFt, shape, maxSkus: 12 });
    const allowedSkus = planResult.plants.map((p) => p.sku);

    const id = crypto.randomUUID();

    // Evidentiary record for the Designer clickwrap (P0-8) — best-effort, doesn't
    // block generation if storage is unavailable (enforcement already happened above).
    recordAssent({
      context: "designer_email",
      email,
      ipHash,
      userAgent: req.headers.get("user-agent"),
      orderRef: id,
    }).catch((err) => console.warn("recordAssent (designer)", err?.message || err));

    let beforeUrl = null;
    if (areaImage) {
      try {
        if (supabaseConfigured) {
          beforeUrl = await storeDesignBuffer(id, "before", areaImage.buffer, areaImage.mimeType);
        }
      } catch (err) {
        console.error("store before image", err);
      }
      if (!beforeUrl) beforeUrl = `data:${areaImage.mimeType};base64,${areaImage.base64}`;
    }

    // Ask the model to read the photo, plan plants, and describe the scene.
    let sceneNotes = "";
    let designSummary = "";
    let bedBox = { ...DEFAULT_BED_BOX };
    if (geminiConfigured()) {
      try {
        const aiPlan = await planDesign({
          areaImage,
          inspoImages,
          description: desc,
          style: styleTag,
          sqFt,
          shape,
          wantWalkway,
          keepExisting,
          allowedSkus: allowedSkus.length ? allowedSkus : DESIGNER_IN_STOCK_SKUS,
        });
        sceneNotes = aiPlan.sceneNotes || "";
        designSummary = aiPlan.designSummary || "";
        if (aiPlan.bedBox) bedBox = aiPlan.bedBox;
        planResult = mergeAiPlantSuggestions(planResult, aiPlan.plants, allowedSkus);
      } catch (err) {
        console.warn("gemini planDesign failed — using template plan", err?.message || err);
      }
    }

    // Lifestyle chips re-rank the bed before money gets involved, so a budget
    // trim never leaves her with the one plant she said she didn't want.
    planResult = applyLifestyle(planResult, lifestyleKeys);

    // Fit the plan to the customer's budget (quantities scale / trim).
    planResult = applyBudget(planResult, budget);

    const budgetRoom = planResult.budget ? planResult.budget - planResult.subtotal : null;
    const planSkus = planResult.plants.map((p) => p.sku);

    const items = planResult.plants.map((p) => ({
      sku: p.sku,
      name: friendlyName(p),
      botanical: p.name,
      qty: p.qty,
      price: p.price,
      variantId: p.variantId || null,
      art: p.art,
      size: p.size,
      cat: p.cat,
      bloom: p.bloom || "",
      zone: p.zone,
      habit: habitNote(p),
      toxicity: p.toxicity || null,
      swaps: swapCandidatesFor(p, { exclude: planSkus, budgetRoom }),
    }));

    // "What's colourful when?" — real Zone 7 timing for these exact plants.
    const ribbon = bloomRibbon(planResult.plants);
    const whenToPlant = plantWhenFor(planResult.plants);
    const designerCatalog = PLANTS.filter((p) => DESIGNER_IN_STOCK_SKUS.includes(p.sku));
    const ribbonGapFillers = gapFillers(ribbon, designerCatalog, { exclude: planSkus }).map(
      (g) => ({
        month: g.month,
        label: g.label,
        sku: g.plant.sku,
        name: friendlyName(g.plant),
        price: g.plant.price,
        art: g.plant.art,
        size: g.plant.size,
        variantId: g.plant.variantId || null,
      })
    );

    let checkoutUrl = null;
    try {
      if (shopifyConfigured && items.length) {
        let map = {};
        try {
          map = await variantIdBySku();
        } catch (err) {
          console.error("variantIdBySku", err);
        }
        const lines = items
          .map((i) => {
            const merchandiseId = map[i.sku] || i.variantId;
            if (!merchandiseId) return null;
            return {
              merchandiseId,
              quantity: i.qty,
              attributes: [{ key: "design_id", value: id }],
            };
          })
          .filter(Boolean);

        if (lines.length) {
          const cart = await createCart(lines, [
            { key: "design_id", value: id },
            { key: "garden", value: gardenSlug || "custom" },
            { key: "sq_ft", value: String(sqFt) },
            { key: "shape", value: shape },
            { key: "budget", value: budget ? String(budget) : "none" },
            { key: "walkway", value: wantWalkway ? "yes" : "no" },
          ]);
          checkoutUrl = cart?.checkoutUrl || null;
        }
      }
    } catch (err) {
      console.error("shopify checkout prep", err);
    }

    // Consume one weekly unit (also records the lead email).
    const reserved = await reserveDesign({
      emailHash,
      email,
      ipHash,
      designId: id,
      plantCount: items.length,
    });
    if (!reserved.ok) {
      return NextResponse.json({ error: reserved.error }, { status: 503 });
    }

    const planPayload = {
      id,
      beforeUrl,
      items,
      subtotal: planResult.subtotal,
      budget: planResult.budget,
      budgetFlex: planResult.budget == null,
      withinBudget: planResult.withinBudget,
      over: planResult.over,
      under: planResult.under,
      palette: paletteSummary(planResult.plants),
      checkoutUrl,
      sqFt,
      shape,
      style: styleTag,
      description: desc,
      sceneNotes,
      designSummary,
      wantWalkway,
      keepExisting,
      wantNightView,
      gardenSlug: gardenSlug || null,
      gardenTitle,
      bedBox,
      hotspots: hotspotsFor(planResult.plants, bedBox),
      ribbon,
      ribbonSummary: ribbonSummary(ribbon),
      ribbonGapFillers,
      whenToPlant,
      vibes: vibeKeys,
      lifestyle: lifestyleKeys,
      sunAspect: sunKey || null,
      chips: chipLabels({ vibeKeys, lifestyleKeys, sunKey }),
      lifestyleNote: lifestyleNote(lifestyleKeys, planResult.plants),
      installUrl: null,
      summerUrl: null,
      bloomUrl: null,
      nightUrl: null,
      quota: { used: quota.used + 1, remaining: Math.max(0, quota.remaining - 1), limit: quota.limit },
    };

    // Persist for /designer/d/{uuid} permalinks (strips data: URLs server-side).
    await saveDesignPlan(id, planPayload);

    return NextResponse.json(planPayload);
  } catch (err) {
    console.error("design plan", err);
    const detail = String(err?.message || err || "").slice(0, 240);
    await notifyDesignStageError({ stage: "plan", designId: null, email, error: err, elapsedMs: Date.now() - startedAt });
    return NextResponse.json(
      { error: "Something went wrong building your garden plan.", detail: detail || undefined },
      { status: 500 }
    );
  }
}
