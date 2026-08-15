import fs from "node:fs";
import path from "node:path";
import { Resend } from "resend";
import { site } from "@/lib/site";
import type { DesignBreakdown, PlantLine } from "@/lib/ai";

/**
 * Lead delivery. With RESEND_API_KEY set, emails go out via Resend. Without it
 * (local dev), rendered emails are written to .lead-outbox/ for inspection.
 */

export interface LeadAttachment {
  filename: string;
  /** base64, no data: prefix */
  content: string;
}

export interface LeadEmail {
  subject: string;
  html: string;
  attachments?: LeadAttachment[];
  replyTo?: string;
  /** Send to the customer instead of the team. */
  toCustomer?: string;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const row = (label: string, value?: string) =>
  value
    ? `<tr><td style="padding:6px 12px 6px 0;color:#486570;font-size:14px;vertical-align:top;white-space:nowrap"><strong>${label}</strong></td><td style="padding:6px 0;color:#0e2730;font-size:14px">${esc(value)}</td></tr>`
    : "";

function shell(title: string, inner: string) {
  return `<!doctype html><html><body style="margin:0;background:#f6fafb;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">
    <div style="background:#093544;border-radius:12px 12px 0 0;padding:20px 24px">
      <p style="margin:0;color:#cfeef7;font-size:12px;letter-spacing:3px;text-transform:uppercase">Union Park Landscaping</p>
      <h1 style="margin:6px 0 0;color:#fff;font-size:22px">${title}</h1>
    </div>
    <div style="background:#ffffff;border:1px solid #e0eaee;border-top:none;border-radius:0 0 12px 12px;padding:24px">
      ${inner}
    </div>
    <p style="color:#90a8b1;font-size:12px;text-align:center;margin-top:16px">${site.name} · ${site.phone} · ${site.email}</p>
  </div>
</body></html>`;
}

function plantRows(label: string, lines: PlantLine[]) {
  return lines
    .map(
      (l) =>
        `<tr><td style="padding:6px 10px;border:1px solid #e0eaee;font-size:13px">${esc(label)}</td><td style="padding:6px 10px;border:1px solid #e0eaee;font-size:13px">${esc(l.commonName)}</td><td style="padding:6px 10px;border:1px solid #e0eaee;font-size:13px;text-align:center">${l.quantity}</td><td style="padding:6px 10px;border:1px solid #e0eaee;font-size:13px">${esc(l.size ?? "—")}</td></tr>`
    )
    .join("");
}

export function breakdownHtml(b: DesignBreakdown) {
  const plants =
    b.trees.length + b.shrubs.length + b.flowersAndPerennials.length > 0
      ? `<table style="border-collapse:collapse;width:100%;margin:12px 0">
      <tr>
        <th style="padding:6px 10px;border:1px solid #e0eaee;background:#ecf8fc;font-size:12px;text-align:left">Type</th>
        <th style="padding:6px 10px;border:1px solid #e0eaee;background:#ecf8fc;font-size:12px;text-align:left">Plant</th>
        <th style="padding:6px 10px;border:1px solid #e0eaee;background:#ecf8fc;font-size:12px">Qty</th>
        <th style="padding:6px 10px;border:1px solid #e0eaee;background:#ecf8fc;font-size:12px;text-align:left">Size</th>
      </tr>
      ${plantRows("Tree", b.trees)}${plantRows("Shrub", b.shrubs)}${plantRows("Flower/Perennial", b.flowersAndPerennials)}
    </table>`
      : "";

  const materials =
    b.materials.length > 0
      ? `<ul style="margin:8px 0;padding-left:18px;color:#0e2730;font-size:14px">${b.materials
          .map((m) => `<li>${esc(m.item)} — <strong>${esc(m.estQuantity)}</strong></li>`)
          .join("")}</ul>`
      : "";

  return `
    <p style="color:#0e2730;font-size:14px;line-height:1.5">${esc(b.summary)}</p>
    ${plants}
    ${materials}
    <p style="color:#486570;font-size:13px;line-height:1.5"><strong>Labor notes:</strong> ${esc(b.laborNotes)}</p>`;
}

export interface ContactLead {
  kind: "contact";
  name: string;
  phone: string;
  email?: string;
  town?: string;
  service?: string;
  message: string;
}

export interface VisualizerLead {
  kind: "visualizer";
  name: string;
  phone: string;
  email?: string;
  town: string;
  address?: string;
  notes?: string;
  request: string;
  styles: string[];
  breakdown: DesignBreakdown;
  /** data URLs */
  originalPhoto: string;
  designImage: string;
}

function dataUrlToAttachment(dataUrl: string, filename: string): LeadAttachment {
  return { filename, content: dataUrl.split(",", 2)[1] };
}

export function renderTeamEmail(lead: ContactLead | VisualizerLead): LeadEmail {
  if (lead.kind === "contact") {
    return {
      subject: `New estimate request — ${lead.name}${lead.town ? ` (${lead.town})` : ""}${lead.service ? ` · ${lead.service}` : ""}`,
      replyTo: lead.email,
      html: shell(
        "New estimate request",
        `<table style="border-collapse:collapse">${row("Name", lead.name)}${row("Phone", lead.phone)}${row("Email", lead.email)}${row("Town", lead.town)}${row("Service", lead.service)}</table>
        <h2 style="color:#093544;font-size:16px;margin:18px 0 6px">Project details</h2>
        <p style="color:#0e2730;font-size:14px;line-height:1.6;white-space:pre-wrap">${esc(lead.message)}</p>
        <p style="margin-top:20px"><a href="tel:${lead.phone.replace(/[^+\d]/g, "")}" style="background:#dd1a83;color:#fff;padding:10px 22px;border-radius:99px;text-decoration:none;font-weight:bold;font-size:14px">Call ${esc(lead.name)}</a></p>`
      ),
    };
  }

  return {
    subject: `🌿 AI design lead — ${lead.name} (${lead.town})`,
    replyTo: lead.email,
    html: shell(
      "AI Yard Designer lead",
      `<p style="color:#0e2730;font-size:14px;line-height:1.5">A customer designed their yard with the AI visualizer and wants an estimate. <strong>Their yard photo and chosen design are attached.</strong></p>
      <table style="border-collapse:collapse">${row("Name", lead.name)}${row("Phone", lead.phone)}${row("Email", lead.email)}${row("Town", lead.town)}${row("Address", lead.address)}</table>
      <h2 style="color:#093544;font-size:16px;margin:18px 0 6px">What they asked for</h2>
      <p style="color:#0e2730;font-size:14px;line-height:1.6;white-space:pre-wrap">${esc(lead.request)}</p>
      ${lead.styles.length ? `<p style="color:#486570;font-size:13px">Style: ${esc(lead.styles.join(", "))}</p>` : ""}
      ${lead.notes ? `<h2 style="color:#093544;font-size:16px;margin:18px 0 6px">Customer notes</h2><p style="color:#0e2730;font-size:14px;line-height:1.6;white-space:pre-wrap">${esc(lead.notes)}</p>` : ""}
      <h2 style="color:#093544;font-size:16px;margin:18px 0 6px">Estimated takeoff (from AI analysis)</h2>
      ${breakdownHtml(lead.breakdown)}
      <p style="margin-top:20px"><a href="tel:${lead.phone.replace(/[^+\d]/g, "")}" style="background:#dd1a83;color:#fff;padding:10px 22px;border-radius:99px;text-decoration:none;font-weight:bold;font-size:14px">Call ${esc(lead.name)}</a></p>`
    ),
    attachments: [
      dataUrlToAttachment(lead.originalPhoto, "yard-original.jpg"),
      dataUrlToAttachment(lead.designImage, "yard-ai-design.jpg"),
    ],
  };
}

export function renderCustomerEmail(lead: VisualizerLead): LeadEmail | null {
  if (!lead.email) return null;
  return {
    subject: "Your AI yard design — Union Park Landscaping",
    toCustomer: lead.email,
    html: shell(
      "We got your design!",
      `<p style="color:#0e2730;font-size:14px;line-height:1.6">Hi ${esc(lead.name.split(" ")[0])},</p>
      <p style="color:#0e2730;font-size:14px;line-height:1.6">Thanks for trying our AI yard designer — your chosen design is attached to this email. Our team is reviewing it now and will call you at <strong>${esc(lead.phone)}</strong> with a free, no-obligation estimate, usually within one business day.</p>
      <p style="color:#0e2730;font-size:14px;line-height:1.6">Can't wait? Call us at <a href="${site.phoneHref}" style="color:#0f6884;font-weight:bold">${site.phone}</a> (${site.hours.days}, ${site.hours.open}–${site.hours.close}).</p>
      <p style="color:#486570;font-size:12px;line-height:1.5">The design is an AI concept preview — your final plan and exact pricing come from our real humans after we see the property.</p>`
    ),
    attachments: [dataUrlToAttachment(lead.designImage, "your-yard-design.jpg")],
  };
}

export async function sendLeadEmail(email: LeadEmail): Promise<void> {
  const to = email.toCustomer ?? process.env.LEAD_EMAIL_TO ?? site.email;
  const from =
    process.env.LEAD_EMAIL_FROM ?? "Union Park Landscaping <onboarding@resend.dev>";

  if (!process.env.RESEND_API_KEY) {
    // Dev fallback: write the email to .lead-outbox/ for inspection.
    const dir = path.join(process.cwd(), ".lead-outbox");
    fs.mkdirSync(dir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    fs.writeFileSync(path.join(dir, `${stamp}-${to.replace(/[^a-z0-9@.]/gi, "_")}.html`), email.html);
    for (const att of email.attachments ?? []) {
      fs.writeFileSync(path.join(dir, `${stamp}-${att.filename}`), Buffer.from(att.content, "base64"));
    }
    console.log(`[lead-outbox] wrote "${email.subject}" for ${to}`);
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from,
    to,
    subject: email.subject,
    html: email.html,
    replyTo: email.replyTo,
    attachments: email.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
    })),
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}
