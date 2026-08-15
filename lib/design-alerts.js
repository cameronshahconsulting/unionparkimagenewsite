import { notifyTeam } from "./team-notify";

/**
 * Alert the team when a Designer image stage fails or times out, so a stuck
 * customer isn't the only one who knows about it. Soft-fails like the rest of
 * notifyTeam — never blocks the customer-facing error response.
 */
export async function notifyDesignStageError({ stage, designId, email, error, elapsedMs }) {
  const elapsed = elapsedMs ? `${Math.round(elapsedMs / 1000)}s` : "unknown";
  const detail = String(error?.message || error || "unknown error").slice(0, 500);
  const isTimeout = /timed out/i.test(detail);

  try {
    await notifyTeam({
      kind: "design-error",
      subject: `Designer ${stage} ${isTimeout ? "timed out" : "failed"} — ${email || "unknown email"}`,
      text: [
        `A Designer image stage ${isTimeout ? "timed out" : "failed"}.`,
        ``,
        `Stage: ${stage}`,
        `Design ID: ${designId || "unknown"}`,
        `Customer email: ${email || "unknown"}`,
        `Elapsed: ${elapsed}`,
        `Error: ${detail}`,
        ``,
        designId ? `Design link: ${process.env.NEXT_PUBLIC_SITE_URL || ""}/designer/d/${designId}` : null,
      ]
        .filter((x) => x !== null)
        .join("\n"),
      email: email || null,
      meta: { stage, designId, elapsedMs: elapsedMs || null, error: detail },
    });
  } catch (err) {
    console.error("notifyDesignStageError", err);
  }
}
