import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createYardDesign, isMockAi, type ImageInput } from "@/lib/ai";
import { consumeCredit, refundCredit, getRemainingCredits, DAILY_LIMIT } from "@/lib/ratelimit";

export const maxDuration = 120;

const VISITOR_COOKIE = "upl_vid";
// ~3MB of base64 per image (client compresses to well under this)
const MAX_IMAGE_B64 = 4 * 1024 * 1024;

const dataUrlSchema = z
  .string()
  .max(MAX_IMAGE_B64 + 64)
  .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/, "Invalid image");

const bodySchema = z.object({
  yardPhoto: dataUrlSchema,
  inspiration: z.array(dataUrlSchema).max(3).default([]),
  request: z.string().trim().min(5, "Describe the changes you want").max(600),
  styles: z.array(z.string().max(60)).max(4).default([]),
});

function parseDataUrl(dataUrl: string): ImageInput {
  const [meta, data] = dataUrl.split(",", 2);
  const mimeType = meta.slice(5, meta.indexOf(";"));
  return { data, mimeType };
}

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

async function getOrSetVisitorId() {
  const store = await cookies();
  const existing = store.get(VISITOR_COOKIE)?.value;
  if (existing && /^[a-f0-9-]{36}$/.test(existing)) return existing;
  const id = crypto.randomUUID();
  store.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return id;
}

export async function GET() {
  const visitorId = await getOrSetVisitorId();
  const remaining = await getRemainingCredits(visitorId);
  return NextResponse.json({ remaining, limit: DAILY_LIMIT, mock: isMockAi });
}

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  const visitorId = await getOrSetVisitorId();
  const ip = clientIp(req);
  const { allowed, remaining } = await consumeCredit(visitorId, ip);
  if (!allowed) {
    return NextResponse.json(
      {
        error:
          "You've used all 3 free designs for today — come back tomorrow, or call us for a real quote: 302-757-5496.",
        remaining: 0,
      },
      { status: 429 }
    );
  }

  try {
    const result = await createYardDesign({
      yardPhoto: parseDataUrl(parsed.data.yardPhoto),
      inspiration: parsed.data.inspiration.map(parseDataUrl),
      request: parsed.data.request,
      styles: parsed.data.styles,
    });

    return NextResponse.json({
      image: `data:${result.image.mimeType};base64,${result.image.data}`,
      breakdown: result.breakdown,
      mocked: result.mocked,
      remaining,
    });
  } catch (err) {
    console.error("visualize error:", err);
    await refundCredit(visitorId, ip).catch(() => {});
    const message =
      err instanceof Error && err.message.includes("model returned no image")
        ? err.message
        : "We couldn't generate a design right now. Please try again in a minute.";
    return NextResponse.json({ error: message, remaining: remaining + 1 }, { status: 502 });
  }
}
