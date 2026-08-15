import { NextResponse } from "next/server";
import {
  sendVerificationCode,
  confirmVerificationCode,
  assertEmailVerified,
  VERIFIED_COOKIE,
  verifiedCookieOptions,
} from "@/lib/email-verify";
import { clientIp, hashIp, normalizeEmail, isValidEmail } from "@/lib/guard";

export const runtime = "nodejs";

function sendPayload(result) {
  return {
    ok: true,
    message: result.message,
    emailed: Boolean(result.emailed),
    softVerified: Boolean(result.softVerified),
    resendsRemaining: result.resendsRemaining ?? null,
    maxResends: result.maxResends ?? null,
    cooldownMs: result.cooldownMs ?? null,
    nextResendAt: result.nextResendAt ?? null,
  };
}

function sendErrorPayload(result) {
  return {
    error: result.error,
    resendsRemaining: result.resendsRemaining ?? null,
    maxResends: result.maxResends ?? null,
    cooldownMs: result.cooldownMs ?? null,
    nextResendAt: result.nextResendAt ?? null,
    retryAfter: result.retryAfter ?? null,
  };
}

/**
 * POST /api/design/verify
 * { action: 'send' | 'confirm' | 'status', email, code? }
 */
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "send");
    const email = normalizeEmail(body.email);

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }

    if (action === "status") {
      const verified = assertEmailVerified(req, email);
      return NextResponse.json({
        ok: true,
        verified: Boolean(verified.ok),
        soft: Boolean(verified.soft),
      });
    }

    if (action === "send") {
      const result = await sendVerificationCode({
        email,
        ipHash: hashIp(clientIp(req)),
      });
      if (!result.ok) {
        return NextResponse.json(sendErrorPayload(result), { status: result.status || 400 });
      }
      const res = NextResponse.json(sendPayload(result));
      if (result.cookie) {
        res.cookies.set(VERIFIED_COOKIE, result.cookie, verifiedCookieOptions());
      }
      return res;
    }

    if (action === "confirm") {
      const result = await confirmVerificationCode({
        email,
        code: body.code,
      });
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status || 400 });
      }
      const res = NextResponse.json({
        ok: true,
        verified: true,
        softVerified: Boolean(result.softVerified),
      });
      res.cookies.set(VERIFIED_COOKIE, result.cookie, verifiedCookieOptions());
      return res;
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("design/verify", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
