import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  renderTeamEmail,
  renderCustomerEmail,
  sendLeadEmail,
  type ContactLead,
  type VisualizerLead,
} from "@/lib/email";
import { consumeLeadSlot } from "@/lib/ratelimit";

export const maxDuration = 30;

const imageDataUrl = z
  .string()
  .max(5 * 1024 * 1024)
  .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/);

const plantLine = z.object({
  commonName: z.string().max(100),
  quantity: z.number().int().min(0).max(999),
  size: z.string().max(40).optional(),
});

const breakdownSchema = z.object({
  summary: z.string().max(2000),
  trees: z.array(plantLine).max(50),
  shrubs: z.array(plantLine).max(50),
  flowersAndPerennials: z.array(plantLine).max(50),
  materials: z
    .array(z.object({ item: z.string().max(120), estQuantity: z.string().max(60) }))
    .max(50),
  laborNotes: z.string().max(2000),
});

const base = {
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(7).max(30),
  email: z.union([z.literal(""), z.string().trim().email().max(120)]).optional(),
  company_website: z.string().optional(), // honeypot
};

const contactSchema = z.object({
  kind: z.literal("contact"),
  ...base,
  town: z.string().max(60).optional(),
  service: z.string().max(60).optional(),
  message: z.string().trim().min(1).max(2000),
});

const visualizerSchema = z.object({
  kind: z.literal("visualizer"),
  ...base,
  town: z.string().min(1).max(60),
  address: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  request: z.string().min(1).max(600),
  styles: z.array(z.string().max(60)).max(4).default([]),
  breakdown: breakdownSchema,
  originalPhoto: imageDataUrl,
  designImage: imageDataUrl,
});

const bodySchema = z.discriminatedUnion("kind", [contactSchema, visualizerSchema]);

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
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
      { error: "Please check the required fields and try again." },
      { status: 400 }
    );
  }

  // Honeypot: bots fill it, humans never see it. Pretend success.
  if (parsed.data.company_website) {
    return NextResponse.json({ ok: true });
  }

  if (!(await consumeLeadSlot(clientIp(req)))) {
    return NextResponse.json(
      { error: "Too many requests today — please call us instead: 302-757-5496." },
      { status: 429 }
    );
  }

  const lead = { ...parsed.data, email: parsed.data.email || undefined } as
    | ContactLead
    | VisualizerLead;

  try {
    await sendLeadEmail(renderTeamEmail(lead));
    if (lead.kind === "visualizer") {
      const customerEmail = renderCustomerEmail(lead);
      if (customerEmail) {
        // Confirmation is best-effort; the team already has the lead.
        await sendLeadEmail(customerEmail).catch((e) =>
          console.error("customer confirmation failed:", e)
        );
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("lead delivery error:", err);
    return NextResponse.json(
      { error: "We couldn't send your request right now. Please call us at 302-757-5496." },
      { status: 502 }
    );
  }
}
