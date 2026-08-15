import { NextResponse } from "next/server";
import { listDesignsByEmailHash } from "@/lib/designs";
import { assertEmailVerified } from "@/lib/email-verify";
import { normalizeEmail, isValidEmail } from "@/lib/guard";

export const runtime = "nodejs";

/**
 * "Your designs" list (P1-5) — every design tied to this verified email,
 * across every device/browser. Requires the same OTP-verified cookie the
 * Designer generation flow sets; no email = no list.
 */
export async function GET(req) {
  try {
    const email = normalizeEmail(new URL(req.url).searchParams.get("email"));
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Missing or invalid email." }, { status: 400 });
    }
    const verified = assertEmailVerified(req, email);
    if (!verified.ok) {
      return NextResponse.json({ error: verified.error, needsVerify: true }, { status: 403 });
    }
    const designs = await listDesignsByEmailHash(verified.emailHash);
    return NextResponse.json({ designs });
  } catch (err) {
    console.error("design mine", err);
    return NextResponse.json({ error: "Could not load your designs." }, { status: 500 });
  }
}
