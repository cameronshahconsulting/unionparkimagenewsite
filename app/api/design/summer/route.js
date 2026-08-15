import { NextResponse } from "next/server";
import { renderSummer, buildStagePrompt, geminiConfigured } from "@/lib/gemini";
import { storeDesignImage, loadDesignImage, geminiImageErrorResponse } from "@/lib/design-images";
import { hydratePlantList, normalizeShape } from "@/lib/garden-plan";
import {
  validateDesignInput,
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

/** First-summer photo — filling in from the install image (real frame, not a blend). */
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

    const validated = validateDesignInput(
      { ...body, sqFt: body.sqFt || 200, shape: body.shape || "rectangle" },
      { requirePhoto: false }
    );
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const { areaImage, sqFt, shape, style, description, wantWalkway } = validated.data;

    let installImage = null;
    if (body.installImage?.base64) {
      installImage = {
        base64: body.installImage.base64,
        mimeType: body.installImage.mimeType || "image/png",
      };
    } else {
      const loaded = await loadDesignImage(designId, "install");
      if (loaded?.buffer?.length) {
        installImage = { base64: loaded.buffer.toString("base64"), mimeType: loaded.mimeType };
      }
    }
    if (!installImage && !areaImage) {
      return NextResponse.json({ error: "Install image not available yet." }, { status: 409 });
    }

    const prompt = buildStagePrompt({
      stage: "summer",
      plants,
      sceneNotes: String(body.sceneNotes || "").slice(0, 600),
      bedBox: body.bedBox || null,
      sqFt,
      shape: normalizeShape(shape),
      style,
      description,
      wantWalkway,
    });

    const rendered = await renderSummer({ installImage, areaImage, prompt });
    const summerUrl = await storeDesignImage(designId, "summer", rendered);
    if (!summerUrl) {
      return NextResponse.json({ error: "Could not save the first-summer photo." }, { status: 502 });
    }

    await patchDesignPlan(designId, { summerUrl });

    return NextResponse.json({
      id: designId,
      summerUrl,
      summerImage: rendered ? { base64: rendered.base64, mimeType: rendered.mimeType } : null,
    });
  } catch (err) {
    console.error("design summer", err);
    const mapped = geminiImageErrorResponse(err);
    await notifyDesignStageError({ stage: "summer", designId, email, error: err, elapsedMs: Date.now() - startedAt });
    return NextResponse.json({ error: mapped.error }, { status: mapped.status });
  }
}
