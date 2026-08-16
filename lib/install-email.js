import { sendEmail, resendConfigured, contactInbox } from "./resend";
import { emailComplianceFooter } from "./site-config";
import { INSTALLATION } from "./pricing";

function uplInbox() {
  return (
    String(process.env.UPL_INSTALL_EMAIL || "").trim() ||
    contactInbox()
  );
}

function money(n) {
  return `$${Math.round(Number(n) || 0).toLocaleString()}`;
}

/**
 * Email customer + Union Park when someone requests an install estimate.
 */
export async function sendInstallEstimateEmails({
  customerEmail,
  customerName = "",
  phone = "",
  address = {},
  plantSummary = "",
  plantSubtotal = 0,
  shopMiles = null,
  deliveryTown = "",
} = {}) {
  if (!resendConfigured()) {
    return { ok: true, sent: false, reason: "resend_not_configured" };
  }

  const email = String(customerEmail || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, sent: false, reason: "missing_customer_email" };
  }

  const compliance = emailComplianceFooter();
  const who = customerName ? String(customerName).trim() : "there";
  const addr =
    address.formatted ||
    [address.street, address.city, address.state, address.zip].filter(Boolean).join(", ");
  const milesNote =
    shopMiles != null && Number.isFinite(Number(shopMiles))
      ? ` (~${shopMiles} mi from Wilmington)`
      : "";

  const customerText = [
    `Hi ${who},`,
    ``,
    `Thanks for requesting an installation estimate with ${INSTALLATION.partner}.`,
    ``,
    `We’ll contact you soon to schedule a good time to visit and give you an estimate for the work.`,
    ``,
    addr ? `Install address: ${addr}${milesNote}` : null,
    plantSubtotal ? `Plant subtotal on this plan: about ${money(plantSubtotal)}` : null,
    plantSummary ? `\nPlants:\n${plantSummary}` : null,
    ``,
    `Questions? Reply to this email or call (302) 757-5496.`,
    ``,
    `— Union Park Landscaping`,
    compliance.text,
  ]
    .filter((x) => x !== null)
    .join("\n");

  const customerHtml = `<div style="max-width:560px;margin:0 auto;padding:8px 4px;font-family:system-ui,sans-serif;color:#10241a">
<p style="font-size:22px;font-weight:800;color:#0a3a26;margin:0 0 12px">We’ll be in touch to schedule your estimate</p>
<p style="font-size:15px;line-height:1.5;margin:0 0 12px">Hi ${who.replace(/</g, "")},</p>
<p style="font-size:15px;line-height:1.5;margin:0 0 12px">Thanks for requesting an installation estimate with <strong>${INSTALLATION.partner}</strong>.</p>
<p style="font-size:15px;line-height:1.5;margin:0 0 12px"><strong>We’ll contact you soon to schedule a good time to visit and give you an estimate for the work.</strong></p>
${addr ? `<p style="font-size:14px;line-height:1.45;margin:0 0 12px;color:#3d5648">Install address: ${String(addr).replace(/</g, "")}${milesNote}</p>` : ""}
${plantSubtotal ? `<p style="font-size:14px;margin:0 0 8px">Plant subtotal on this plan: about ${money(plantSubtotal)}</p>` : ""}
${plantSummary ? `<pre style="white-space:pre-wrap;font-size:13px;background:#eef8f2;padding:12px;border-radius:8px;color:#3d5648">${String(plantSummary).replace(/</g, "")}</pre>` : ""}
<p style="font-size:13px;color:#4d6b5c;margin:18px 0 0">— Union Park Landscaping · (302) 757-5496</p>
${compliance.html}
</div>`;

  const uplText = [
    `New Union Park install estimate request from the yard designer.`,
    ``,
    `Please contact the customer to schedule a good time to give an estimate for the work.`,
    ``,
    `Customer: ${customerName || "(name not provided)"}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    `Address: ${addr || deliveryTown || "(none)"}${milesNote}`,
    plantSubtotal ? `Plant subtotal: ${money(plantSubtotal)}` : null,
    plantSummary ? `\nPlants:\n${plantSummary}` : null,
    ``,
    `Partner: ${INSTALLATION.partner}`,
  ]
    .filter((x) => x !== null)
    .join("\n");

  const results = { customer: false, upl: false };

  try {
    await sendEmail({
      to: email,
      subject: "We’ll contact you to schedule your install estimate",
      text: customerText,
      html: customerHtml,
      replyTo: contactInbox(),
    });
    results.customer = true;
  } catch (err) {
    console.error("install estimate customer email", err?.message || err);
  }

  try {
    await sendEmail({
      to: uplInbox(),
      subject: `[UPL] Install estimate request — ${addr || email}`,
      text: uplText,
      replyTo: email,
    });
    results.upl = true;
  } catch (err) {
    console.error("install estimate UPL email", err?.message || err);
  }

  return { ok: results.customer || results.upl, sent: true, results };
}
