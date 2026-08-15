import { NextResponse } from "next/server";
import { renderBloom, buildStagePrompt, locateHotspots, geminiConfigured } from "@/lib/gemini";
import { storeDesignImage, loadDesignImage, geminiImageErrorResponse } from "@/lib/design-images";
import { hydratePlantList, normalizeShape, relocateHotspots } from "@/lib/garden-plan";
import {
  validateDesignInput,
  verifyDesignOwnership,
  isValidEmail,
  hashEmail,
  normalizeEmail,
} from "@/lib/guard";
import { assertEmailVerified } from "@/lib/email-verify";
import { patchDesignPlan, loadDesignPlan } from "@/lib/designs";
import { notifyDesignStageError } from "@/lib/design-alerts";

export const runtime = "nodejs";
export const maxDuration = 300;

/** Full-bloom photo — grows from install for bed lock; summer is maturity floor. */
export async function POST(req) {
  const startedAt = Date.now();
  let designId = null;
  let email = null;
  try {
    if (!geminiConfigured()) {
      return NextResponse.json({ error: "Garden designer AI is not configured." }, { status: 503 });
    }

    const body = await req.json();
    designId = String(body.designId || "").replace(/[^a-f0-9-]/gi, "");
    if (!designId) return NextResponse.json({ error: "Missing design id." }, { status: 400 });

    email = normalizeEmail(body.email);
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Missing or invalid email." }, { status: 400 });
    }
    const verified = assertEmailVerified(req, email);
    if (!verified.ok) {
      return NextResponse.json({ error: verified.error, needsVerify: true }, { status: 403 });
    }
    const owns = await verifyDesignOwnership({ emailHash: hashEmail(email), designId });
    if (!owns.ok) return NextResponse.json({ error: owns.error }, { status: 403 });

    const plants = hydratePlantList(body.plants);
    if (!plants.length) return NextResponse.json({ error: "Missing plant list." }, { status: 400 });

    // areaImage optional here — the install image is the render base.
    const validated = validateDesignInput(
      { ...body, sqFt: body.sqFt || 200, shape: body.shape || "rectangle" },
      { requirePhoto: false }
    );
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const { areaImage, sqFt, shape, style, description, wantWalkway } = validated.data;

    // Prefer summer (mid stage) then install; fall back to storage.
    let summerImage = null;
    if (body.summerImage?.base64) {
      summerImage = { base64: body.summerImage.base64, mimeType: body.summerImage.mimeType || "image/png" };
    } else {
      const loadedSummer = await loadDesignImage(designId, "summer");
      if (loadedSummer?.buffer?.length) {
        summerImage = {
          base64: loadedSummer.buffer.toString("base64"),
          mimeType: loadedSummer.mimeType,
        };
      }
    }

    let installImage = null;
    if (body.installImage?.base64) {
      installImage = { base64: body.installImage.base64, mimeType: body.installImage.mimeType || "image/png" };
    } else {
      const loaded = await loadDesignImage(designId, "install");
      if (loaded?.buffer?.length) {
        installImage = { base64: loaded.buffer.toString("base64"), mimeType: loaded.mimeType };
      }
    }
    if (!summerImage && !installImage && !areaImage) {
      return NextResponse.json({ error: "Prior garden image not available yet." }, { status: 409 });
    }

    const prompt = buildStagePrompt({
      stage: "bloom",
      plants,
      sceneNotes: String(body.sceneNotes || "").slice(0, 600),
      bedBox: body.bedBox || null,
      sqFt,
      shape: normalizeShape(shape),
      style,
      description,
      wantWalkway,
    });

    const rendered = await renderBloom({ summerImage, installImage, areaImage, prompt });
    const bloomUrl = await storeDesignImage(designId, "bloom", rendered);
    if (!bloomUrl) {
      return NextResponse.json({ error: "Could not save the full-bloom photo." }, { status: 502 });
    }

    // Re-ground "tap for plants" pins in the photo that actually exists now —
    // best-effort, never blocks handing back the bloom photo itself.
    let hotspots = null;
    try {
      const plan = await loadDesignPlan(designId);
      if (plan?.hotspots?.length) {
        const located = await locateHotspots({ bloomImage: rendered, plants });
        if (located?.length) hotspots = relocateHotspots(plan.hotspots, located);
      }
    } catch (err) {
      console.warn("locateHotspots", err?.message || err);
    }

    await patchDesignPlan(designId, { bloomUrl, ...(hotspots ? { hotspots } : {}) });

    return NextResponse.json({ id: designId, bloomUrl, ...(hotspots ? { hotspots } : {}) });
  } catch (err) {
    console.error("design bloom", err);
    const mapped = geminiImageErrorResponse(err);
    await notifyDesignStageError({ stage: "bloom", designId, email, error: err, elapsedMs: Date.now() - startedAt });
    return NextResponse.json({ error: mapped.error }, { status: mapped.status });
  }
}
