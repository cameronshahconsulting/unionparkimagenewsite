import { NextResponse } from "next/server";
import { renderNight, buildStagePrompt, geminiConfigured } from "@/lib/gemini";
import { storeDesignImage, loadDesignImage, geminiImageErrorResponse } from "@/lib/design-images";
import {
  verifyDesignOwnership,
  isValidEmail,
  hashEmail,
  normalizeEmail,
} from "@/lib/guard";
import { assertEmailVerified } from "@/lib/email-verify";
import { patchDesignPlan } from "@/lib/designs";
import { notifyDesignStageError } from "@/lib/design-alerts";

export const runtime = "nodejs";
export const maxDuration = 300;

/** Night-lighting photo — pure dusk/lighting conversion of the full-bloom image, no growth. */
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

    let bloomImage = null;
    if (body.bloomImage?.base64) {
      bloomImage = { base64: body.bloomImage.base64, mimeType: body.bloomImage.mimeType || "image/png" };
    } else {
      const loaded = await loadDesignImage(designId, "bloom");
      if (loaded?.buffer?.length) {
        bloomImage = { base64: loaded.buffer.toString("base64"), mimeType: loaded.mimeType };
      }
    }
    if (!bloomImage) {
      return NextResponse.json({ error: "Full-glory photo not available yet." }, { status: 409 });
    }

    const prompt = buildStagePrompt({ stage: "night" });

    const rendered = await renderNight({ bloomImage, prompt });
    const nightUrl = await storeDesignImage(designId, "night", rendered);
    if (!nightUrl) {
      return NextResponse.json({ error: "Could not save the night-lighting photo." }, { status: 502 });
    }

    await patchDesignPlan(designId, { nightUrl });

    return NextResponse.json({ id: designId, nightUrl });
  } catch (err) {
    console.error("design night", err);
    const mapped = geminiImageErrorResponse(err);
    await notifyDesignStageError({ stage: "night", designId, email, error: err, elapsedMs: Date.now() - startedAt });
    return NextResponse.json({ error: mapped.error }, { status: mapped.status });
  }
}
