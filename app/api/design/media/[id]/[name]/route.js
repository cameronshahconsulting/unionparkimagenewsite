import { NextResponse } from "next/server";
import { loadDesignImage } from "@/lib/design-images";
import { assertDesignMediaAccess } from "@/lib/email-verify";

export const runtime = "nodejs";

const ALLOWED = new Set(["before", "install", "summer", "bloom", "night"]);

/**
 * Same-origin image proxy. Requires a verified email session that owns this design.
 * Sniffs real bytes so Safari displays JPEG that was historically uploaded with
 * Content-Type image/png.
 */
export async function GET(req, { params }) {
  try {
    const { id, name } = await params;
    const safeId = String(id || "").replace(/[^a-f0-9-]/gi, "");
    const safeName = String(name || "").toLowerCase().replace(/[^a-z]/g, "");
    if (!safeId || !ALLOWED.has(safeName)) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const access = await assertDesignMediaAccess(req, safeId);
    if (!access.ok) {
      return NextResponse.json(
        { error: access.error || "Unauthorized." },
        { status: access.status || 401 }
      );
    }

    const file = await loadDesignImage(safeId, safeName);
    if (!file) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    return new NextResponse(file.buffer, {
      status: 200,
      headers: {
        "Content-Type": file.mimeType,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("design media", err);
    return NextResponse.json({ error: "Could not load image." }, { status: 500 });
  }
}
