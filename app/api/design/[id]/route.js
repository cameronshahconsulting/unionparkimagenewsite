import { NextResponse } from "next/server";
import { loadDesignPlan, ownsDesign, deleteDesignRecord } from "@/lib/designs";
import { deleteDesignImages } from "@/lib/supabase";
import { assertEmailVerified } from "@/lib/email-verify";
import { normalizeEmail, isValidEmail } from "@/lib/guard";

export const runtime = "nodejs";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Public permalink loader — UUID is the secret. No email required.
 * Returns { design: plan } with plan fields only.
 */
export async function GET(_req, context) {
  try {
    const params = await context.params;
    const id = String(params?.id || "").trim();
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "Design not found." }, { status: 404 });
    }

    const plan = await loadDesignPlan(id);
    if (!plan) {
      return NextResponse.json({ error: "Design not found." }, { status: 404 });
    }

    // Ensure id is present for the client even if an older row omitted it.
    const design = { ...plan, id: plan.id || id };
    return NextResponse.json({ design });
  } catch (err) {
    console.error("design GET", err);
    return NextResponse.json({ error: "Could not load this design." }, { status: 500 });
  }
}

/**
 * Hard-delete a design and its source photograph (P1-5 — Privacy Policy § 9.1
 * deletion promise, "within 10 business days"; this endpoint does it instantly).
 * Requires the OTP-verified email that owns the design — the UUID alone (which
 * is enough to *view* a permalink) is not enough to delete it.
 */
export async function DELETE(req, context) {
  try {
    const params = await context.params;
    const id = String(params?.id || "").trim();
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "Design not found." }, { status: 404 });
    }

    const email = normalizeEmail(new URL(req.url).searchParams.get("email"));
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Missing or invalid email." }, { status: 400 });
    }
    const verified = assertEmailVerified(req, email);
    if (!verified.ok) {
      return NextResponse.json({ error: verified.error, needsVerify: true }, { status: 403 });
    }

    const owns = await ownsDesign(verified.emailHash, id);
    if (!owns) {
      return NextResponse.json({ error: "That design isn't linked to this email." }, { status: 403 });
    }

    await deleteDesignImages(id);
    const result = await deleteDesignRecord(id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error || "Could not delete this design." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, deleted: true });
  } catch (err) {
    console.error("design DELETE", err);
    return NextResponse.json({ error: "Could not delete this design." }, { status: 500 });
  }
}
