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
 * Email customer + Union Park (and Annie's team CC via UPL inbox default)
 * when someone requests an install estimate at checkout.
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
    plantSubtotal ? `Plant subtotal on this order: about ${money(plantSubtotal)}` : null,
    plantSummary ? `\nPlants:\n${plantSummary}` : null,
    ``,
    `Installing with ${INSTALLATION.partner} earns ${INSTALLATION.nextOrderCreditPercent}% in-store credit toward your next Annie’s Online Nursery order — not a discount on this checkout.`,
    ``,
    `Questions? Reply to this email or call (302) 757-5496.`,
    ``,
    `— Annie’s Online Nursery`,
    compliance.text,
  ]
    .filter((x) => x !== null)
    .join("\n");

  const customerHtml = `<div style="max-width:560px;margin:0 auto;padding:8px 4px;font-family:system-ui,sans-serif;color:#33291F">
<p style="font-family:Georgia,serif;font-size:22px;color:#3B4A32;margin:0 0 12px">We’ll be in touch to schedule your estimate</p>
<p style="font-size:15px;line-height:1.5;margin:0 0 12px">Hi ${who.replace(/</g, "")},</p>
<p style="font-size:15px;line-height:1.5;margin:0 0 12px">Thanks for requesting an installation estimate with <strong>${INSTALLATION.partner}</strong>.</p>
<p style="font-size:15px;line-height:1.5;margin:0 0 12px"><strong>We’ll contact you soon to schedule a good time to visit and give you an estimate for the work.</strong></p>
${addr ? `<p style="font-size:14px;line-height:1.45;margin:0 0 12px;color:#5c5345">Install address: ${String(addr).replace(/</g, "")}${milesNote}</p>` : ""}
${plantSubtotal ? `<p style="font-size:14px;margin:0 0 8px">Plant subtotal on this order: about ${money(plantSubtotal)}</p>` : ""}
${plantSummary ? `<pre style="white-space:pre-wrap;font-size:13px;background:#f7f4ee;padding:12px;border-radius:8px;color:#4f5d45">${String(plantSummary).replace(/</g, "")}</pre>` : ""}
<p style="font-size:13px;line-height:1.45;color:#5c5345;margin:16px 0 0">Installing with ${INSTALLATION.partner} earns ${INSTALLATION.nextOrderCreditPercent}% in-store credit toward your next Annie’s order — not a discount on this checkout.</p>
<p style="font-size:13px;color:#7a7162;margin:18px 0 0">— Annie’s Online Nursery · (302) 757-5496</p>
${compliance.html}
</div>`;

  const uplText = [
    `New Union Park install estimate request from Annie's Online Nursery checkout.`,
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
    `Next-order credit if installed: ${INSTALLATION.nextOrderCreditPercent}%`,
    `Partner: ${INSTALLATION.partner}`,
  ]
    .filter((x) => x !== null)
    .join("\n");

  const results = { customer: false, upl: false, team: false };

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
      subject: `[Annie's] Install estimate request — ${addr || email}`,
      text: uplText,
      replyTo: email,
    });
    results.upl = true;
  } catch (err) {
    console.error("install estimate UPL email", err?.message || err);
  }

  // If UPL inbox differs from Annie's team, also notify the nursery desk.
  if (uplInbox().toLowerCase() !== contactInbox().toLowerCase()) {
    try {
      await sendEmail({
        to: contactInbox(),
        subject: `[Annie's] Install estimate CC — ${email}`,
        text: uplText,
        replyTo: email,
      });
      results.team = true;
    } catch (err) {
      console.error("install estimate team email", err?.message || err);
    }
  }

  return { ok: results.customer || results.upl, sent: true, results };
}
