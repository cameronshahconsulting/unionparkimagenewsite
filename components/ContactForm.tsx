"use client";

import { useState } from "react";
import { site, services, towns } from "@/lib/site";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "contact", ...data }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong.");
      }
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "sent") {
    return (
      <div className="card border-pine-500/40 bg-pine-50 p-8 text-center">
        <p className="font-display text-2xl font-semibold text-pine-900">Request received ✓</p>
        <p className="mt-2 text-ink-soft">
          Thanks — we&apos;ll get back to you shortly, usually within one business day.
          Need us sooner? Call{" "}
          <a href={site.phoneHref} className="font-semibold text-pine-800 underline">
            {site.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-[0.95rem] text-ink placeholder:text-ink-soft/60 focus:border-pine-600 focus:outline-none focus:ring-2 focus:ring-pine-600/20";

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6 sm:p-8">
      {/* Honeypot */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-pine-950">
            Name *
          </label>
          <input id="name" name="name" required maxLength={100} className={inputCls} placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-pine-950">
            Phone *
          </label>
          <input id="phone" name="phone" type="tel" required maxLength={30} className={inputCls} placeholder="(302) 555-0123" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-pine-950">
            Email
          </label>
          <input id="email" name="email" type="email" maxLength={120} className={inputCls} placeholder="you@email.com" />
        </div>
        <div>
          <label htmlFor="town" className="mb-1.5 block text-sm font-semibold text-pine-950">
            Town
          </label>
          <select id="town" name="town" className={inputCls} defaultValue="">
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
        <label htmlFor="service" className="mb-1.5 block text-sm font-semibold text-pine-950">
          What do you need?
        </label>
        <select id="service" name="service" className={inputCls} defaultValue="">
          <option value="" disabled>
            Select a service
          </option>
          {services.map((s) => (
            <option key={s.slug} value={s.short}>
              {s.short}
            </option>
          ))}
          <option value="Multiple / not sure">Multiple things / not sure yet</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-pine-950">
          Tell us about the project *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          maxLength={2000}
          className={inputCls}
          placeholder="e.g. Our backyard floods near the fence line and we'd like a patio near the back door…"
        />
      </div>

      {status === "error" && (
        <p role="alert" className="rounded-lg bg-clay-100 px-4 py-3 text-sm font-medium text-clay-700">
          {error} You can also call us at {site.phone}.
        </p>
      )}

      <button type="submit" disabled={status === "sending"} className="btn-primary w-full disabled:opacity-60">
        {status === "sending" ? "Sending…" : "Request My Free Estimate"}
      </button>
      <p className="text-center text-xs text-ink-soft">
        No spam, no obligation. We typically reply within one business day.
      </p>
    </form>
  );
}
