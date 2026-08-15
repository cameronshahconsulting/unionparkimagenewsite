import { NextResponse, after } from "next/server";
import { renderInstall, buildStagePrompt, geminiConfigured } from "@/lib/gemini";
import { storeDesignImage, geminiImageErrorResponse } from "@/lib/design-images";
import { hydratePlantList, normalizeShape } from "@/lib/garden-plan";
import {
  validateDesignInput,
  verifyDesignOwnership,
  isValidEmail,
  hashEmail,
  normalizeEmail,
} from "@/lib/guard";
import { assertEmailVerified } from "@/lib/email-verify";
import { patchDesignPlan, loadDesignPlan } from "@/lib/designs";
import { sendDesignReadyEmail, notifyTeamDesignReady } from "@/lib/design-email";
import { notifyDesignStageError } from "@/lib/design-alerts";
import { resendConfigured } from "@/lib/resend";

export const runtime = "nodejs";
export const maxDuration = 300;

/** Install-day photo — the honest "day we plant it" render. Chained before bloom. */
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
      { requirePhoto: true }
    );
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 });
    const { areaImage, inspoImages, sqFt, shape, style, description, wantWalkway, keepExisting } =
      validated.data;

    const prompt = buildStagePrompt({
      stage: "install",
      plants,
      sceneNotes: String(body.sceneNotes || "").slice(0, 600),
      bedBox: body.bedBox || null,
      sqFt,
      shape: normalizeShape(shape),
      style,
      description,
      wantWalkway,
      keepExisting,
    });

    const rendered = await renderInstall({ areaImage, inspoImages, prompt });
    const installUrl = await storeDesignImage(designId, "install", rendered);
    if (!installUrl) {
      return NextResponse.json({ error: "Could not save the install photo." }, { status: 502 });
    }

    await patchDesignPlan(designId, { installUrl });

    // Return the install photo immediately; send emails in `after()` so a slow
    // Resend round-trip (or a client disconnect) can't leave the customer
    // staring at a spinner — and so mail still goes out once Gemini finishes.
    after(async () => {
      try {
        const plan = await loadDesignPlan(designId);
        const sent = await sendDesignReadyEmail({ email, designId, plan });
        if (resendConfigured() && (!sent.ok || !sent.sent)) {
          await notifyDesignStageError({
            stage: "design-ready-email",
            designId,
            email,
            error: sent.error || "sendDesignReadyEmail returned sent:false",
          });
        }
        const team = await notifyTeamDesignReady({ email, designId, plan });
        if (resendConfigured() && (!team?.ok || !team?.emailed)) {
          await notifyDesignStageError({
            stage: "team-design-email",
            designId,
            email,
            error: team?.error || "notifyTeamDesignReady returned emailed:false",
          });
        }
        await patchDesignPlan(designId, {
          customerEmailSent: Boolean(sent?.sent),
          teamEmailSent: Boolean(team?.emailed),
          emailsAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("design ready emails", err?.message || err);
        await notifyDesignStageError({ stage: "design-ready-email", designId, email, error: err });
      }
    });

    // Hand the raw install image back so the bloom render can chain off it.
    return NextResponse.json({
      id: designId,
      installUrl,
      installImage: rendered ? { base64: rendered.base64, mimeType: rendered.mimeType } : null,
    });
  } catch (err) {
    console.error("design install", err);
    const mapped = geminiImageErrorResponse(err);
    await notifyDesignStageError({ stage: "install", designId, email, error: err, elapsedMs: Date.now() - startedAt });
    return NextResponse.json({ error: mapped.error }, { status: mapped.status });
  }
}
