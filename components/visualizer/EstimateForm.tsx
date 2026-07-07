"use client";

import { useState } from "react";
import { site, towns } from "@/lib/site";
import type { DesignBreakdown } from "@/lib/ai";

export interface ChosenDesign {
  originalPhoto: string;
  designImage: string;
  request: string;
  styles: string[];
  breakdown: DesignBreakdown;
}

export function EstimateForm({
  design,
  onBack,
}: {
  design: ChosenDesign;
  onBack: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "visualizer",
          ...data,
          request: design.request,
          styles: design.styles,
          breakdown: design.breakdown,
          originalPhoto: design.originalPhoto,
          designImage: design.designImage,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong.");
      }
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-pine-500/40 bg-pine-50 p-8 text-center">
        <p className="font-display text-2xl font-semibold text-pine-900">
          Design sent — we&apos;re on it ✓
        </p>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Your design and details are with our team. We&apos;ll call you back with a
          real quote, usually within one business day. Want to talk now?{" "}
          <a href={site.phoneHref} className="font-semibold text-pine-800 underline">
            {site.phone}
          </a>
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-[0.95rem] text-ink placeholder:text-ink-soft/60 focus:border-pine-600 focus:outline-none focus:ring-2 focus:ring-pine-600/20";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="viz-name" className="mb-1.5 block text-sm font-semibold text-pine-950">
            Name *
          </label>
          <input id="viz-name" name="name" required maxLength={100} className={inputCls} placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="viz-phone" className="mb-1.5 block text-sm font-semibold text-pine-950">
            Phone *
          </label>
          <input id="viz-phone" name="phone" type="tel" required maxLength={30} className={inputCls} placeholder="(302) 555-0123" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="viz-email" className="mb-1.5 block text-sm font-semibold text-pine-950">
            Email
          </label>
          <input id="viz-email" name="email" type="email" maxLength={120} className={inputCls} placeholder="you@email.com" />
        </div>
        <div>
          <label htmlFor="viz-town" className="mb-1.5 block text-sm font-semibold text-pine-950">
            Town *
          </label>
          <select id="viz-town" name="town" required className={inputCls} defaultValue="">
            <option value="" disabled>
              Select your town
            </option>
            {towns.map((t) => (
              <option key={t.slug} value={t.name}>
                {t.name}, DE
              </option>
            ))}
            <option value="Other">Other / nearby</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="viz-address" className="mb-1.5 block text-sm font-semibold text-pine-950">
          Street address
        </label>
        <input
          id="viz-address"
          name="address"
          maxLength={200}
          className={inputCls}
          placeholder="So we can prep before we call (optional)"
        />
      </div>

      <div>
        <label htmlFor="viz-notes" className="mb-1.5 block text-sm font-semibold text-pine-950">
          Anything else we should know?
        </label>
        <textarea
          id="viz-notes"
          name="notes"
          rows={3}
          maxLength={1000}
          className={inputCls}
          placeholder="Budget range, timing, questions…"
        />
      </div>

      {status === "error" && (
        <p role="alert" className="rounded-lg bg-clay-100 px-4 py-3 text-sm font-medium text-clay-700">
          {error} You can also call us at {site.phone}.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onBack} className="btn-ghost sm:w-auto">
          ← Back to my designs
        </button>
        <button type="submit" disabled={status === "sending"} className="btn-primary flex-1 disabled:opacity-60">
          {status === "sending" ? "Sending your design…" : "Send My Design & Get a Free Estimate"}
        </button>
      </div>
      <p className="text-center text-xs text-ink-soft">
        We&apos;ll include your yard photo and chosen design so our estimator can prep
        before calling you back. No spam, ever.
      </p>
    </form>
  );
}
