import { createHash, createHmac, randomInt } from "crypto";
import { supabaseAdmin, supabaseConfigured } from "./supabase";
import { hashEmail, normalizeEmail, isValidEmail, verifyDesignOwnership } from "./guard";
import { loadDesignPlan } from "./designs";
import { sendEmail, resendConfigured } from "./resend";
import { emailComplianceFooter } from "./site-config";

const COOKIE = "annies_ev";
const CODE_TTL_MS = 15 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
/** Wait between the first code and each resend. */
const SEND_COOLDOWN_MS = 5 * 60 * 1000;
/** First send + this many resends (internet hiccups). */
const MAX_RESENDS = 3;
const MAX_TOTAL_SENDS = 1 + MAX_RESENDS;
const MAX_ATTEMPTS = 8;

function isProd() {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}

function secret() {
  return (
    process.env.RATE_LIMIT_SALT ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "dev-email-verify-salt"
  );
}

function hashCode(email, code) {
  return createHash("sha256")
    .update(`${secret()}:${normalizeEmail(email)}:${String(code).trim()}`)
    .digest("hex");
}

function signSession(emailHash, exp) {
  const payload = `${emailHash}.${exp}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function parseVerifiedCookie(raw) {
  const value = String(raw || "").trim();
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [emailHash, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!emailHash || !sig || !Number.isFinite(exp) || exp < Date.now()) return null;
  const expect = createHmac("sha256", secret()).update(`${emailHash}.${exp}`).digest("base64url");
  if (expect !== sig) return null;
  return { emailHash, exp };
}

export function verifiedCookieOptions(maxAgeSec = Math.floor(SESSION_TTL_MS / 1000)) {
  return {
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSec,
  };
}

export { COOKIE as VERIFIED_COOKIE, SEND_COOLDOWN_MS, MAX_RESENDS, MAX_TOTAL_SENDS };

/**
 * Ensure this request's email matches a valid verification cookie.
 * Dev without Supabase: open (so local designer still works).
 * Prod without verification: closed.
 */
export function assertEmailVerified(req, email) {
  if (!isValidEmail(email)) {
    return { ok: false, error: "Enter a valid email so we can send your design." };
  }
  const emailHash = hashEmail(email);
  const cookie = req.cookies?.get?.(COOKIE)?.value;
  const parsed = parseVerifiedCookie(cookie);

  if (parsed && parsed.emailHash === emailHash) {
    return { ok: true, emailHash };
  }

  // Soft-open when Supabase isn't configured (local) — still prefer a cookie if present.
  if (!supabaseConfigured) {
    if (!isProd()) return { ok: true, emailHash, soft: true };
  }

  return {
    ok: false,
    error: "Please verify your email with the code we sent before generating a design.",
  };
}

/**
 * Design images: cookie ownership OR a saved permalink plan (UUID is the secret).
 * Generation / verify APIs stay gated separately.
 */
export async function assertDesignMediaAccess(req, designId) {
  const cookie = req.cookies?.get?.(COOKIE)?.value;
  const parsed = parseVerifiedCookie(cookie);

  if (parsed) {
    const owns = await verifyDesignOwnership({
      emailHash: parsed.emailHash,
      designId,
    });
    if (owns.ok) {
      return { ok: true, emailHash: parsed.emailHash };
    }
  }

  // Anyone with the design UUID can view images for sharing / refresh.
  const plan = await loadDesignPlan(designId);
  if (plan) {
    return { ok: true, shared: true };
  }

  if (!supabaseConfigured && !isProd()) return { ok: true, soft: true };

  if (!parsed) {
    return {
      ok: false,
      status: 401,
      error: "Verify your email with the code we sent to view this design.",
    };
  }
  return { ok: false, status: 403, error: "This design isn’t available." };
}

/** `used` = sends already counted (including the one just completed, when applicable). */
function sendMeta({ used, latestCreatedAt }) {
  const resendsRemaining = Math.max(0, MAX_TOTAL_SENDS - used);
  let nextResendAt = null;
  if (latestCreatedAt && resendsRemaining > 0) {
    nextResendAt = new Date(latestCreatedAt).getTime() + SEND_COOLDOWN_MS;
  }
  return {
    resendsRemaining,
    maxResends: MAX_RESENDS,
    cooldownMs: SEND_COOLDOWN_MS,
    nextResendAt,
  };
}

function missingTable(error) {
  const code = String(error?.code || "");
  if (code === "42P01" || code === "PGRST205" || code === "PGRST202") return true;
  return /could not find the table|does not exist|schema cache/i.test(
    `${error?.message || ""} ${error?.hint || ""}`
  );
}

/**
 * Create + email a 6-digit code. Returns { ok } or { ok:false, error, status }.
 * Never returns the code to the client — it only goes out by email.
 * Cooldown: 5 minutes between sends. Cap: 1 initial + 3 resends.
 */
export async function sendVerificationCode({ email, ipHash }) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return { ok: false, error: "Enter a valid email.", status: 400 };
  }
  if (!supabaseConfigured) {
    if (!isProd()) {
      const emailHash = hashEmail(normalized);
      const exp = Date.now() + SESSION_TTL_MS;
      return {
        ok: true,
        softVerified: true,
        cookie: signSession(emailHash, exp),
        message: "Local mode — email verification skipped (Supabase not configured).",
        resendsRemaining: MAX_RESENDS,
        maxResends: MAX_RESENDS,
        cooldownMs: SEND_COOLDOWN_MS,
        nextResendAt: null,
      };
    }
    return {
      ok: false,
      error: "Email verification isn’t set up yet. Please try again later.",
      status: 503,
    };
  }

  const emailHash = hashEmail(normalized);
  const admin = supabaseAdmin();
  // Window long enough to cover all resends + cooldowns for one verify session.
  const windowMs = SEND_COOLDOWN_MS * MAX_TOTAL_SENDS + CODE_TTL_MS;
  const since = new Date(Date.now() - windowMs).toISOString();

  const { count: sendCount, error: countErr } = await admin
    .from("email_verifications")
    .select("id", { count: "exact" })
    .eq("email_hash", emailHash)
    .gte("created_at", since);

  if (countErr) {
    if (missingTable(countErr)) {
      return {
        ok: false,
        error:
          "Run the email_verifications section of supabase/schema.sql, then try again.",
        status: 503,
      };
    }
    console.error("email_verifications count", countErr);
    return { ok: false, error: "Could not start verification. Try again.", status: 502 };
  }

  const used = sendCount ?? 0;
  const { data: latest } = await admin
    .from("email_verifications")
    .select("created_at")
    .eq("email_hash", emailHash)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (used >= MAX_TOTAL_SENDS) {
    return {
      ok: false,
      error:
        "You’ve used all 3 resends for this email. Wait a bit, then start again with a fresh code request.",
      status: 429,
      ...sendMeta({ used, latestCreatedAt: latest?.created_at }),
    };
  }

  if (latest?.created_at) {
    const age = Date.now() - new Date(latest.created_at).getTime();
    if (age < SEND_COOLDOWN_MS) {
      const wait = Math.ceil((SEND_COOLDOWN_MS - age) / 1000);
      const mins = Math.ceil(wait / 60);
      return {
        ok: false,
        error:
          wait >= 60
            ? `Hang tight — you can resend a code in about ${mins} min.`
            : `Hang tight — you can resend a code in ${wait}s.`,
        status: 429,
        retryAfter: wait,
        ...sendMeta({ used, latestCreatedAt: latest.created_at }),
      };
    }
  }

  const code = String(randomInt(100000, 999999));
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();
  const createdAt = new Date().toISOString();

  const { error: insertErr } = await admin.from("email_verifications").insert({
    email_hash: emailHash,
    email: normalized,
    code_hash: hashCode(normalized, code),
    ip_hash: ipHash || null,
    attempts: 0,
    expires_at: expiresAt,
    created_at: createdAt,
  });

  if (insertErr) {
    if (missingTable(insertErr)) {
      return {
        ok: false,
        error:
          "Run the email_verifications section of supabase/schema.sql, then try again.",
        status: 503,
      };
    }
    console.error("email_verifications insert", insertErr);
    return { ok: false, error: "Could not start verification. Try again.", status: 502 };
  }

  let emailed = false;
  let sendError = null;
  if (resendConfigured()) {
    try {
      const compliance = emailComplianceFooter();
      await sendEmail({
        to: normalized,
        subject: "Your Annie's yard design code",
        text: [
          `Your verification code is ${code}.`,
          ``,
          `It expires in 15 minutes.`,
          `If you didn't ask for a yard design, you can ignore this email.`,
          ``,
          `— Annie's Online Nursery`,
          compliance.text,
        ].join("\n"),
        html: `<p style="font-family:Georgia,serif;font-size:16px;color:#2c3a26">Your verification code is</p>
<p style="font-family:system-ui,sans-serif;font-size:32px;font-weight:800;letter-spacing:.2em;color:#3B4A32">${code}</p>
<p style="font-family:system-ui,sans-serif;font-size:13px;color:#6b6252">Expires in 15 minutes. If you didn’t ask for a yard design, ignore this email.</p>
${compliance.html}`,
      });
      emailed = true;
    } catch (err) {
      sendError = err;
      console.error("verify email send", err);
    }
  } else {
    sendError = new Error("RESEND_API_KEY is not set");
  }

  if (!emailed) {
    const raw = String(sendError?.message || "");
    if (/only send testing emails|verify a domain|resend\.com\/domains/i.test(raw)) {
      return {
        ok: false,
        error:
          "Email codes can’t reach customers yet. In Resend, verify your domain (resend.com/domains), then set RESEND_FROM_EMAIL to an address on that domain (for example hello@yourdomain.com) in .env.local and Vercel.",
        status: 503,
      };
    }
    if (!resendConfigured()) {
      return {
        ok: false,
        error: "Email isn’t configured. Add RESEND_API_KEY (and RESEND_FROM_EMAIL after verifying a domain).",
        status: 503,
      };
    }
    return {
      ok: false,
      error: raw
        ? `Could not send the code: ${raw}`
        : "Could not send the code right now. Please try again in a moment.",
      status: 502,
    };
  }

  const afterUsed = used + 1;
  return {
    ok: true,
    emailed: true,
    message:
      used > 0
        ? `We sent a new code to ${normalized}.`
        : `We sent a 6-digit code to ${normalized}.`,
    ...sendMeta({ used: afterUsed, latestCreatedAt: createdAt }),
  };
}

/**
 * Confirm a code and return a signed session cookie value.
 */
export async function confirmVerificationCode({ email, code }) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return { ok: false, error: "Enter a valid email.", status: 400 };
  }
  const trimmed = String(code || "").replace(/\D/g, "");
  if (trimmed.length !== 6) {
    return { ok: false, error: "Enter the 6-digit code from your email.", status: 400 };
  }

  if (!supabaseConfigured) {
    if (!isProd()) {
      const emailHash = hashEmail(normalized);
      const exp = Date.now() + SESSION_TTL_MS;
      return { ok: true, softVerified: true, cookie: signSession(emailHash, exp) };
    }
    return { ok: false, error: "Verification isn’t available.", status: 503 };
  }

  const emailHash = hashEmail(normalized);
  const admin = supabaseAdmin();

  const { data: row, error } = await admin
    .from("email_verifications")
    .select("id, code_hash, attempts, expires_at, verified_at")
    .eq("email_hash", emailHash)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (missingTable(error)) {
      return {
        ok: false,
        error: "Run the email_verifications section of supabase/schema.sql, then try again.",
        status: 503,
      };
    }
    console.error("email_verifications lookup", error);
    return { ok: false, error: "Could not verify that code. Try again.", status: 502 };
  }

  if (!row) {
    return { ok: false, error: "Request a code first.", status: 400 };
  }
  if (row.verified_at) {
    const exp = Date.now() + SESSION_TTL_MS;
    return { ok: true, cookie: signSession(emailHash, exp), already: true };
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, error: "That code expired. Request a new one.", status: 400 };
  }
  if ((row.attempts ?? 0) >= MAX_ATTEMPTS) {
    return {
      ok: false,
      error: "Too many tries on this code. Request a new one.",
      status: 429,
    };
  }

  const ok = row.code_hash === hashCode(normalized, trimmed);
  await admin
    .from("email_verifications")
    .update({
      attempts: (row.attempts ?? 0) + 1,
      ...(ok ? { verified_at: new Date().toISOString() } : {}),
    })
    .eq("id", row.id);

  if (!ok) {
    return { ok: false, error: "That code doesn’t match. Check your email and try again.", status: 400 };
  }

  const exp = Date.now() + SESSION_TTL_MS;
  return { ok: true, cookie: signSession(emailHash, exp) };
}
