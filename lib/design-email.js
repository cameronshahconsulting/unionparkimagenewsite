import { sendEmail, resendConfigured } from "./resend";
import { loadDesignPlan } from "./designs";
import { notifyTeam } from "./team-notify";
import { emailComplianceFooter } from "./site-config";

export function siteOrigin() {
  const explicit = String(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "").trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = String(process.env.VERCEL_URL || "").trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return "http://localhost:3000";
}

function money(n) {
  return `$${Math.round(Number(n) || 0).toLocaleString()}`;
}

/**
 * Email the customer their design link + plant list after OTP-verified generation.
 * Soft-fails when Resend isn't configured.
 */
export async function sendDesignReadyEmail({ email, designId, plan: planArg = null }) {
  if (!resendConfigured() || !email || !designId) {
    return { ok: true, sent: false };
  }

  const plan = planArg || (await loadDesignPlan(designId));
  const link = `${siteOrigin()}/designer/d/${designId}`;
  const items = Array.isArray(plan?.items) ? plan.items : [];
  const subtotal = items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0);
  const summary = String(plan?.designSummary || "").trim();
  const lines = items.slice(0, 16).map((i) => {
    const qty = Number(i.qty) || 1;
    const botanical = i.botanical && i.botanical !== i.name ? ` — ${i.botanical}` : "";
    return `• ${qty}× ${i.name}${botanical}${i.size ? ` (${i.size})` : ""} — ${money((Number(i.price) || 0) * qty)}`;
  });
  if (items.length > 16) lines.push(`• …and ${items.length - 16} more`);

  const compliance = emailComplianceFooter();

  const text = [
    `Your Annie's yard design is ready.`,
    ``,
    summary || null,
    summary ? `` : null,
    `Open it anytime (bookmark this link):`,
    link,
    ``,
    items.length ? `Your plant list${subtotal ? ` · about ${money(subtotal)}` : ""}:` : null,
    ...lines,
    items.length ? `` : null,
    `You can swap plants, add the list to your cart, and watch the garden grow from installation day to full glory.`,
    ``,
    `Before you dig, call 811 — it's free and required by law. This design is an AI-generated illustration, not a photograph or a plan, and has no knowledge of buried lines, property boundaries, or HOA rules.`,
    ``,
    `— Annie's Online Nursery`,
    compliance.text,
  ]
    .filter((x) => x !== null)
    .join("\n");

  const htmlItems = items.length
    ? `<ul style="padding-left:18px;margin:12px 0;font-family:system-ui,sans-serif;font-size:14px;color:#33291F;line-height:1.5">${items
        .slice(0, 16)
        .map((i) => {
          const qty = Number(i.qty) || 1;
          const size = i.size ? ` <span style="color:#7a7162">(${String(i.size).replace(/</g, "")})</span>` : "";
          const botanical =
            i.botanical && i.botanical !== i.name
              ? ` <span style="font-style:italic;color:#9a9182">${String(i.botanical).replace(/</g, "")}</span>`
              : "";
          return `<li><strong>${qty}× ${String(i.name || "").replace(/</g, "")}</strong>${botanical}${size} — ${money((Number(i.price) || 0) * qty)}</li>`;
        })
        .join("")}${
        items.length > 16
          ? `<li style="color:#7a7162">…and ${items.length - 16} more on your design page</li>`
          : ""
      }</ul>`
    : "";

  const html = `<div style="max-width:560px;margin:0 auto;padding:8px 4px">
<p style="font-family:Georgia,serif;font-size:22px;color:#3B4A32;margin:0 0 10px">Your yard design is ready</p>
${summary ? `<p style="font-family:Georgia,serif;font-size:16px;color:#4f5d45;line-height:1.4;margin:0 0 16px">${summary.replace(/</g, "")}</p>` : ""}
<p style="font-family:system-ui,sans-serif;font-size:14px;color:#33291F;margin:0 0 14px">Open it anytime — we’ve saved your garden, plant list, and timeline.</p>
<p style="margin:0 0 18px"><a href="${link}" style="display:inline-block;background:#3B4A32;color:#FFFBF1;font-family:system-ui,sans-serif;font-weight:800;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:999px">View your design</a></p>
${htmlItems}
${subtotal ? `<p style="font-family:system-ui,sans-serif;font-size:14px;font-weight:800;color:#3B4A32;margin:8px 0 0">Plant total about ${money(subtotal)}</p>` : ""}
<p style="font-family:system-ui,sans-serif;font-size:12px;color:#7a4a12;background:#fff4e0;border:1px solid #e0a95c;border-radius:8px;padding:10px 12px;margin:18px 0 0;line-height:1.4"><strong>Before you dig, call 811</strong> — free and required by law. This design is an AI-generated illustration, not a photograph or a plan, and has no knowledge of buried lines, property boundaries, or HOA rules.</p>
<p style="font-family:system-ui,sans-serif;font-size:12px;color:#7a7162;margin:22px 0 0;line-height:1.4">If the button doesn’t work, paste this link into your browser:<br/><a href="${link}" style="color:#6E8B5B">${link}</a></p>
<p style="font-family:system-ui,sans-serif;font-size:12px;color:#7a7162;margin:16px 0 0">— Annie’s Online Nursery · Wilmington, DE</p>
${compliance.html}
</div>`;

  try {
    await sendEmail({
      to: email,
      subject: "Your Annie's yard design is ready",
      text,
      html,
    });
    return { ok: true, sent: true };
  } catch (err) {
    console.error("sendDesignReadyEmail", err);
    return { ok: false, sent: false, error: err?.message || "email failed" };
  }
}

/** Ping Annie's inbox when someone generates a yard design. */
export async function notifyTeamDesignReady({ email, designId, plan: planArg = null }) {
  const plan = planArg || (await loadDesignPlan(designId));
  const link = `${siteOrigin()}/designer/d/${designId}`;
  const items = Array.isArray(plan?.items) ? plan.items : [];
  const subtotal = items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0);
  const plantLines = items
    .slice(0, 20)
    .map((i) => `• ${Number(i.qty) || 1}× ${i.name}${i.size ? ` (${i.size})` : ""}`)
    .join("\n");

  return notifyTeam({
    kind: "designer",
    subject: `New yard design from ${email}`,
    email,
    replyTo: email,
    message: [
      `Someone just generated a yard design.`,
      ``,
      `Customer: ${email}`,
      `Design: ${link}`,
      plan?.designSummary ? `Summary: ${plan.designSummary}` : null,
      plan?.gardenTitle ? `Garden template: ${plan.gardenTitle}` : null,
      subtotal ? `Plant total ~${money(subtotal)}` : null,
      items.length ? `\nPlant list:\n${plantLines}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    text: [
      `Someone just generated a yard design.`,
      ``,
      `Customer: ${email}`,
      `Open their design: ${link}`,
      plan?.designSummary ? `Summary: ${plan.designSummary}` : null,
      plan?.gardenTitle ? `Garden template: ${plan.gardenTitle}` : null,
      subtotal ? `Plant total ~${money(subtotal)}` : null,
      items.length ? `\nPlant list:\n${plantLines}` : null,
      ``,
      `Reply to this email to write the customer back.`,
    ]
      .filter(Boolean)
      .join("\n"),
    meta: {
      designId,
      plantCount: items.length,
      subtotal,
      link,
    },
  });
}
