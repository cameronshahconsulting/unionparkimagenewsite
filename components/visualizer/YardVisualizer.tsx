"use client";

import { useEffect, useRef, useState } from "react";
import { compressImage } from "./imageUtils";
import { BreakdownCard } from "./BreakdownCard";
import { EstimateForm, type ChosenDesign } from "./EstimateForm";
import type { DesignBreakdown } from "@/lib/ai";
import { site } from "@/lib/site";

interface Design {
  id: string;
  image: string;
  breakdown: DesignBreakdown;
  request: string;
  styles: string[];
  mocked: boolean;
}

const QUICK_CHIPS = [
  "Paver patio",
  "New plant beds",
  "Fresh mulch",
  "Privacy fence",
  "Stone walkway",
  "Fire pit area",
  "Low-maintenance plants",
  "New lawn",
];

const STYLE_OPTIONS = [
  "Modern & minimal",
  "Classic colonial",
  "Native & pollinator-friendly",
  "Lush English garden",
];

const LOADING_STEPS = [
  "Reading your yard photo…",
  "Sketching the new layout…",
  "Planting trees and shrubs…",
  "Counting plants for your estimate…",
  "Final touches…",
];

export function YardVisualizer() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [request, setRequest] = useState("");
  const [styles, setStyles] = useState<string[]>([]);
  const [inspiration, setInspiration] = useState<string[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [showEstimate, setShowEstimate] = useState(false);
  const [compare, setCompare] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const inspoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/visualize")
      .then((r) => r.json())
      .then((d) => setRemaining(d.remaining))
      .catch(() => setRemaining(3));
  }, []);

  useEffect(() => {
    if (!generating) return;
    const t = setInterval(
      () => setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)),
      9000
    );
    return () => clearInterval(t);
  }, [generating]);

  const selected = designs.find((d) => d.id === selectedId) ?? null;

  async function handlePhoto(file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      setPhoto(await compressImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that photo.");
    }
  }

  async function handleInspiration(files: FileList | null) {
    if (!files) return;
    setError("");
    try {
      const next = [...inspiration];
      for (const file of Array.from(files).slice(0, 3 - next.length)) {
        next.push(await compressImage(file, 1024, 0.8));
      }
      setInspiration(next.slice(0, 3));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that photo.");
    }
  }

  function toggleStyle(s: string) {
    setStyles((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function addChip(chip: string) {
    setRequest((prev) => {
      if (prev.toLowerCase().includes(chip.toLowerCase())) return prev;
      return prev ? `${prev.replace(/[.\s]+$/, "")}. Add: ${chip.toLowerCase()}.` : `Add: ${chip.toLowerCase()}.`;
    });
  }

  async function generate() {
    if (!photo || request.trim().length < 5 || generating) return;
    setGenerating(true);
    setLoadingStep(0);
    setError("");
    try {
      const res = await fetch("/api/visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yardPhoto: photo, inspiration, request: request.trim(), styles }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Something went wrong.");
      const design: Design = {
        id: crypto.randomUUID(),
        image: body.image,
        breakdown: body.breakdown,
        request: request.trim(),
        styles,
        mocked: body.mocked,
      };
      setDesigns((prev) => [...prev, design]);
      setSelectedId(design.id);
      setRemaining(body.remaining);
      setCompare(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  const canGenerate =
    Boolean(photo) && request.trim().length >= 5 && !generating && (remaining ?? 1) > 0;

  if (showEstimate && selected && photo) {
    const chosen: ChosenDesign = {
      originalPhoto: photo,
      designImage: selected.image,
      request: selected.request,
      styles: selected.styles,
      breakdown: selected.breakdown,
    };
    return (
      <div className="card mx-auto max-w-3xl p-6 sm:p-10">
        <div className="mb-6 grid grid-cols-2 gap-3">
          {/* Chosen design recap */}
          <figure>
            <img src={photo} alt="Your yard today" className="aspect-[4/3] w-full rounded-xl object-cover" />
            <figcaption className="mt-1.5 text-center text-xs font-medium text-ink-soft">Your yard today</figcaption>
          </figure>
          <figure>
            <img src={selected.image} alt="Your chosen AI design" className="aspect-[4/3] w-full rounded-xl object-cover ring-2 ring-clay-500" />
            <figcaption className="mt-1.5 text-center text-xs font-medium text-clay-600">Your chosen design</figcaption>
          </figure>
        </div>
        <h3 className="heading-display text-2xl">Almost there — where do we send the quote?</h3>
        <p className="mb-6 mt-2 text-sm text-ink-soft">
          We&apos;ll review your design, prep pricing, and call you back — usually within one business day.
        </p>
        <EstimateForm design={chosen} onBack={() => setShowEstimate(false)} />
      </div>
    );
  }

  return (
    <div className="card mx-auto max-w-5xl overflow-hidden">
      <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
        {/* Left: inputs */}
        <div className="border-b border-sand-200 p-6 sm:p-8 lg:border-b-0 lg:border-r">
          {/* Step 1: photo */}
          <p className="eyebrow">Step 1 · Your yard</p>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePhoto(e.target.files?.[0])}
          />
          {photo ? (
            <div className="relative mt-3">
              <img src={photo} alt="Your uploaded yard" className="aspect-[16/10] w-full rounded-xl object-cover" />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="absolute bottom-3 right-3 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-pine-900 shadow-card hover:bg-white"
              >
                Change photo
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handlePhoto(e.dataTransfer.files?.[0]);
              }}
              className="mt-3 flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-moss-400 bg-pine-50/60 text-center transition-colors hover:border-pine-600 hover:bg-pine-50"
            >
              <svg viewBox="0 0 24 24" className="h-9 w-9 text-pine-700" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span className="font-semibold text-pine-900">Upload a photo of your yard</span>
              <span className="px-6 text-xs text-ink-soft">
                Tap to choose or take a photo — front yard, backyard, whatever you want to change
              </span>
            </button>
          )}

          {/* Step 2: describe */}
          <p className="eyebrow mt-7">Step 2 · Describe the change</p>
          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            rows={3}
            maxLength={600}
            placeholder="e.g. Replace the overgrown bushes with modern low plantings, add a paver walkway to the door, and fresh dark mulch…"
            className="mt-3 w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-[0.95rem] text-ink placeholder:text-ink-soft/60 focus:border-pine-600 focus:outline-none focus:ring-2 focus:ring-pine-600/20"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => addChip(chip)}
                className="rounded-full border border-sand-300 bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-pine-600 hover:text-pine-800"
              >
                + {chip}
              </button>
            ))}
          </div>

          {/* Step 3: style + inspiration */}
          <p className="eyebrow mt-7">Step 3 · Style (optional)</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={styles.includes(s)}
                onClick={() => toggleStyle(s)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  styles.includes(s)
                    ? "bg-pine-800 text-white"
                    : "border border-sand-300 bg-white text-ink-soft hover:border-pine-600 hover:text-pine-800"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <input
            ref={inspoInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleInspiration(e.target.files);
              e.target.value = "";
            }}
          />
          <div className="mt-4 flex items-center gap-3">
            {inspiration.map((img, i) => (
              <div key={i} className="relative">
                <img src={img} alt={`Inspiration ${i + 1}`} className="h-16 w-16 rounded-lg object-cover" />
                <button
                  type="button"
                  aria-label={`Remove inspiration photo ${i + 1}`}
                  onClick={() => setInspiration((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-pine-900 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
            {inspiration.length < 3 && (
              <button
                type="button"
                onClick={() => inspoInputRef.current?.click()}
                className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border-2 border-dashed border-sand-300 text-ink-soft transition-colors hover:border-pine-600 hover:text-pine-800"
              >
                <span className="text-lg leading-none">+</span>
                <span className="text-[0.6rem] font-medium">inspo</span>
              </button>
            )}
            <p className="text-xs text-ink-soft">
              Add up to 3 inspiration photos of yards or styles you love (optional)
            </p>
          </div>

          {/* Generate */}
          {error && (
            <p role="alert" className="mt-5 rounded-lg bg-clay-100 px-4 py-3 text-sm font-medium text-clay-700">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={generate}
            disabled={!canGenerate}
            className="btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating
              ? "Designing your yard…"
              : remaining === 0
                ? "No designs left today"
                : "Generate My Design ✨"}
          </button>
          <p className="mt-2.5 text-center text-xs text-ink-soft">
            {remaining === null
              ? "3 free designs per day"
              : remaining === 0
                ? `Come back tomorrow for 3 more — or call ${site.phone} for a real quote today.`
                : `${remaining} of 3 free designs left today · takes about a minute`}
          </p>
        </div>

        {/* Right: results */}
        <div className="flex flex-col bg-sand-100/60 p-6 sm:p-8">
          {generating ? (
            <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-pine-200 border-t-pine-700" aria-hidden />
              <p className="mt-5 font-display text-lg font-semibold text-pine-900" role="status">
                {LOADING_STEPS[loadingStep]}
              </p>
              <p className="mt-1.5 text-sm text-ink-soft">Usually 30–60 seconds — hang tight</p>
            </div>
          ) : selected ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="font-display font-semibold text-pine-950">
                  Design {designs.findIndex((d) => d.id === selected.id) + 1} of {designs.length}
                  {selected.mocked && (
                    <span className="ml-2 rounded-full bg-sand-200 px-2.5 py-0.5 text-xs font-medium text-ink-soft">
                      demo mode
                    </span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setCompare((v) => !v)}
                  className="rounded-full border border-sand-300 bg-white px-4 py-1.5 text-xs font-semibold text-pine-900 hover:border-pine-600"
                >
                  {compare ? "Show design" : "Compare with original"}
                </button>
              </div>
              <img
                src={compare && photo ? photo : selected.image}
                alt={compare ? "Your yard today" : "AI-generated design of your yard"}
                className="mt-3 aspect-[16/10] w-full rounded-xl object-cover shadow-card"
              />

              {designs.length > 1 && (
                <div className="mt-3 flex gap-2.5" role="tablist" aria-label="Your designs today">
                  {designs.map((d, i) => (
                    <button
                      key={d.id}
                      type="button"
                      role="tab"
                      aria-selected={d.id === selected.id}
                      aria-label={`Design ${i + 1}`}
                      onClick={() => {
                        setSelectedId(d.id);
                        setCompare(false);
                      }}
                      className={`overflow-hidden rounded-lg ${
                        d.id === selected.id ? "ring-2 ring-clay-500" : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={d.image} alt="" className="h-14 w-20 object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <details className="group mt-4">
                <summary className="cursor-pointer list-none text-sm font-semibold text-pine-800 [&::-webkit-details-marker]:hidden">
                  <span className="group-open:hidden">▸ What&apos;s in this design (plants &amp; materials)</span>
                  <span className="hidden group-open:inline">▾ What&apos;s in this design</span>
                </summary>
                <div className="mt-3">
                  <BreakdownCard breakdown={selected.breakdown} />
                </div>
              </details>

              <div className="mt-5 flex flex-col gap-3">
                <button type="button" onClick={() => setShowEstimate(true)} className="btn-primary">
                  I love this one — Get My Free Estimate
                </button>
                {(remaining ?? 0) > 0 && (
                  <button type="button" onClick={generate} disabled={!canGenerate} className="btn-ghost disabled:opacity-50">
                    Try another version ({remaining} left today)
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
              <svg viewBox="0 0 24 24" className="h-12 w-12 text-moss-400" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 22c4-3.5 7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 3 8.5 7 12Z" />
                <path d="M12 8v8M12 12l-3-2M12 12l3-2" />
              </svg>
              <p className="mt-4 font-display text-lg font-semibold text-pine-900">
                Your design will appear here
              </p>
              <p className="mx-auto mt-1.5 max-w-xs text-sm text-ink-soft">
                Upload a yard photo, describe your dream changes, and hit generate.
                You get 3 free designs a day — pick your favorite and send it to us
                for a real quote.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
