"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, Spark, Leaf, Cart } from "./icons";
import { useCart } from "./CartProvider";
import { GARDENS } from "@/lib/inventory";
import { downscaleImage } from "@/lib/image";
import { VIBES, LIFESTYLE, SUN_ASPECTS } from "@/lib/vibes";
import { IMPACT_PATH, impactPledge } from "@/lib/impact";
import TimeMachine from "./TimeMachine";
import BloomRibbon from "./BloomRibbon";
import ShareCard from "./ShareCard";
import SwapDrawer from "./SwapDrawer";
import ToxicityFlag from "./ToxicityFlag";
import ProgressRing from "./ProgressRing";
import { EstimateForm } from "@/components/visualizer/EstimateForm";

const ANNIES_URL = "https://anniesonlinenursery.com";
const ANNIES_CART = `${ANNIES_URL}/cart`;
const ANNIES_TERMS = `${ANNIES_URL}/designer-terms`;
const ANNIES_SITE_TERMS = `${ANNIES_URL}/terms`;
const ANNIES_DESIGNS = `${ANNIES_URL}/designer/mine`;

const EMAIL_KEY = "annies-designer-email";
const VERIFIED_KEY = "annies-designer-verified";
const LAST_DESIGN_KEY = "annies-last-design-id";
const designStorageKey = (id) => `annies-design-${id}`;

/** Persist URLs + items for refresh; strip huge data: URLs. */
function persistDesignLocal(plan) {
  if (typeof window === "undefined" || !plan?.id) return;
  try {
    const slim = { ...plan };
    for (const key of ["beforeUrl", "installUrl", "summerUrl", "bloomUrl", "nightUrl"]) {
      const v = slim[key];
      if (typeof v === "string" && (v.startsWith("data:") || v.length > 2048)) slim[key] = null;
    }
    localStorage.setItem(designStorageKey(plan.id), JSON.stringify(slim));
    localStorage.setItem(LAST_DESIGN_KEY, plan.id);
  } catch {
    /* quota / private mode */
  }
}

function loadDesignLocal(id) {
  if (typeof window === "undefined" || !id) return null;
  try {
    const raw = localStorage.getItem(designStorageKey(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

const inflightKey = (id) => `annies-design-inflight-${id}`;

/** Typical wait until the first usable Time Machine (plan + truck-day render). */
const EXPECTED_GEN_MS = 75_000;

const GEN_STAGES = {
  plan: {
    start: 0,
    end: 28,
    expectMs: 28_000,
    title: "Planting your garden…",
    sub: "Reading your photo, choosing plants we actually have in stock, and sizing it all to your budget. You’ll see installation day first — later seasons keep painting in the background.",
  },
  install: {
    start: 28,
    end: 92,
    expectMs: 45_000,
    title: "Painting installation day…",
    sub: "Laying in the installation-day look — honest farm sizes, fresh mulch, and the real gaps you’ll see when we deliver.",
  },
  done: {
    start: 100,
    end: 100,
    expectMs: 1,
    title: "Your garden is ready",
    sub: "Opening your design — first summer and full glory keep rendering in the background.",
  },
};

/**
 * Friendly size presets, set to realistic average sizes for each category
 * (a typical foundation bed runs 150-300 sq ft; a big feature or wrap-around
 * bed runs 500-800; whole-yard-scale beds top out around 1,200-1,500) so the
 * slider's top preset lands exactly at the slider's max — no dead zone past
 * "X-Large" that doesn't correspond to any named size.
 */
const SIZE_PRESETS = [
  { sqFt: 100, label: "Small", hint: "An entry or border bed" },
  { sqFt: 300, label: "Medium", hint: "A front-yard bed" },
  { sqFt: 700, label: "Large", hint: "A big feature bed" },
  { sqFt: 1500, label: "X-Large", hint: "A whole-yard refresh" },
];
const SIZE_SLIDER_MIN = 25;
const SIZE_SLIDER_MAX = 1500;

/**
 * Budget is discrete tiers, not a freeform slider — a slider implies
 * meaningful resolution between, say, $2,500 and $5,000 that quantity
 * pricing and plant-count math don't actually have. Above $5,000 there's a
 * real number field instead, so someone with a specific number in mind can
 * set an actual cap rather than "however much it wants to spend."
 */
const BUDGET_PRESETS = [250, 500, 1000, 2500, 5000];
const BUDGET_FLEX = 5000;
const CUSTOM_BUDGET_MAX = 20000; // matches the server's MAX_BUDGET ceiling

const money = (n) => `$${Math.round(Number(n) || 0).toLocaleString()}`;
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || "").trim());

export default function Designer({
  initialGardenSlug = null,
  lockGarden = false,
  designId = null,
} = {}) {
  const router = useRouter();
  const { addItem } = useCart();
  const areaRef = useRef(null);
  const inspoRef = useRef(null);
  const listRef = useRef(null);
  const wizardRef = useRef(null);
  const skipStepScroll = useRef(true);

  const [step, setStep] = useState(1); // 1 photo · 2 vibe/size/budget · 3 email → reveal
  const [areaUrl, setAreaUrl] = useState("");
  const [areaB64, setAreaB64] = useState("");
  const [inspoUrls, setInspoUrls] = useState([]);
  const [inspoB64, setInspoB64] = useState([]);
  const [sqFt, setSqFt] = useState(300);
  const [budgetTier, setBudgetTier] = useState(500);
  const [customBudget, setCustomBudget] = useState("");
  const [vibes, setVibes] = useState(["romantic"]);
  const [lifestyle, setLifestyle] = useState([]);
  const [desc, setDesc] = useState("");
  const [wantWalkway, setWantWalkway] = useState(false);
  const [keepExisting, setKeepExisting] = useState(false);
  const [wantNightView, setWantNightView] = useState(false);
  const [sunAspect, setSunAspect] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [gate, setGate] = useState("email"); // email | code | ready
  const [agreedDesigner, setAgreedDesigner] = useState(false);
  const [wantsMarketing, setWantsMarketing] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [confirmingCode, setConfirmingCode] = useState(false);
  const [nextResendAt, setNextResendAt] = useState(null);
  const [resendsRemaining, setResendsRemaining] = useState(3);
  const [resendTick, setResendTick] = useState(0);
  const [genStage, setGenStage] = useState("plan"); // plan | install | summer | bloom | done
  const [genProgress, setGenProgress] = useState(0);
  const [genEta, setGenEta] = useState("About 2 minutes");
  const genStartedAt = useRef(0);
  const stageStartedAt = useRef(0);

  const [phase, setPhase] = useState("setup"); // setup · generating · result
  const [result, setResult] = useState(null);
  const [installBusy, setInstallBusy] = useState(false);
  const [summerBusy, setSummerBusy] = useState(false);
  const [bloomBusy, setBloomBusy] = useState(false);
  // Night lighting is generated lazily, on demand, the first time someone
  // toggles it on — not eagerly with every design — since it's an extra
  // Gemini image call most viewers may never ask for.
  const [nightBusy, setNightBusy] = useState(false);
  // Elapsed-time tracking so a stage that's taking too long shows a "still
  // working" message and, past a threshold, a manual retry button — instead
  // of a spinner that silently sits there with no indication anything is
  // wrong (or how to get unstuck) if it never finishes.
  const [stageSeconds, setStageSeconds] = useState({ summer: 0, bloom: 0 });
  const stageStartRef = useRef({ summer: null, bloom: null });
  const stageAbortRef = useRef({ summer: null, bloom: null });
  const RETRY_THRESHOLD_S = 120;

  // Only the $5,000+ tier with no custom number is truly uncapped — typing a
  // real number there sets an actual ceiling instead of "spend whatever."
  const customBudgetNum = Number(customBudget);
  const hasCustomBudget = budgetTier >= BUDGET_FLEX && Number.isFinite(customBudgetNum) && customBudgetNum >= BUDGET_FLEX;
  const budgetIsFlex = budgetTier >= BUDGET_FLEX && !hasCustomBudget;
  const effectiveBudget = hasCustomBudget ? Math.min(CUSTOM_BUDGET_MAX, customBudgetNum) : budgetTier;

  const [swapFor, setSwapFor] = useState(null);
  const swapAnchorRef = useRef(null);
  const [flash, setFlash] = useState("");
  const [highlight, setHighlight] = useState("");
  const [error, setError] = useState("");
  const [areaDragOver, setAreaDragOver] = useState(false);
  const [showInstallEstimate, setShowInstallEstimate] = useState(false);

  // A locked garden (from a garden page) still drives the plan under the hood.
  const lockedGarden = useMemo(
    () => (lockGarden ? GARDENS.find((g) => g.slug === initialGardenSlug) : null),
    [lockGarden, initialGardenSlug]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(EMAIL_KEY);
    if (saved) setEmail(saved);
    const verified = localStorage.getItem(VERIFIED_KEY);
    if (!(saved && verified && verified === saved)) return;

    // Confirm the httpOnly cookie is still valid — localStorage alone is not enough.
    (async () => {
      try {
        const res = await fetch("/api/design/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "status", email: saved }),
        });
        const data = await res.json().catch(() => ({}));
        if (data.verified) setGate("ready");
        else localStorage.removeItem(VERIFIED_KEY);
      } catch {
        localStorage.removeItem(VERIFIED_KEY);
      }
    })();
  }, []);

  // Permalink / refresh: load saved plan by UUID (API first, localStorage fallback).
  useEffect(() => {
    if (!designId) return undefined;
    let cancelled = false;

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      let plan = null;
      try {
        const res = await fetch(`/api/design/${designId}`);
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.design) plan = data.design;
        }
      } catch {
        /* try cache */
      }
      if (!plan) plan = loadDesignLocal(designId);
      if (cancelled) return;
      if (!plan) {
        setError("We couldn’t find that design. It may have expired — try generating a new one.");
        setPhase("setup");
        return;
      }

      setResult(plan);
      persistDesignLocal(plan);
      setPhase("result");

      // After router.replace mid-generation, the prior tab’s install/summer/bloom
      // (and, if opted in, night) requests still finish server-side — poll until
      // URLs land instead of letting a refresh re-trigger (and re-bill) them.
      const wantsNight = Boolean(plan.wantNightView);
      const missing =
        !plan.installUrl || !plan.summerUrl || !plan.bloomUrl || (wantsNight && !plan.nightUrl);
      if (!missing) return;

      setInstallBusy(!plan.installUrl);
      setSummerBusy(!plan.summerUrl);
      setBloomBusy(!plan.bloomUrl);
      if (wantsNight) setNightBusy(!plan.nightUrl);

      // Cover the full serverless maxDuration (~300s). Ending poll early used to
      // clear busy flags while Gemini was still writing summer/bloom URLs — then
      // "Try again" aborted the in-flight request and the UI claimed failure
      // even though the photo landed moments later.
      for (let i = 0; i < 100 && !cancelled; i++) {
        await sleep(3000);
        if (cancelled) return;
        try {
          const res = await fetch(`/api/design/${designId}`);
          if (!res.ok) continue;
          const data = await res.json().catch(() => ({}));
          if (!data.design) continue;
          setResult(data.design);
          persistDesignLocal(data.design);
          setInstallBusy(!data.design.installUrl);
          setSummerBusy(!data.design.summerUrl);
          setBloomBusy(!data.design.bloomUrl);
          if (wantsNight) setNightBusy(!data.design.nightUrl);
          const allDone =
            data.design.installUrl &&
            data.design.summerUrl &&
            data.design.bloomUrl &&
            (!wantsNight || data.design.nightUrl);
          if (allDone) {
            try {
              sessionStorage.removeItem(inflightKey(designId));
            } catch {
              /* ignore */
            }
            break;
          }
        } catch {
          /* keep waiting */
        }
      }
      if (!cancelled) {
        setInstallBusy(false);
        setSummerBusy(false);
        setBloomBusy(false);
        setNightBusy(false);
        try {
          sessionStorage.removeItem(inflightKey(designId));
        } catch {
          /* ignore */
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [designId]);

  // Keep local cache in sync whenever the result grows (install/summer/bloom URLs).
  useEffect(() => {
    if (result?.id) persistDesignLocal(result);
  }, [result]);

  // Start/stop the per-stage stopwatch as busy flags flip. A stage that's
  // stuck (never resolves, never errors — the original symptom) still ticks
  // here even though the fetch itself is silent, so the UI doesn't go quiet.
  useEffect(() => {
    const now = Date.now();
    if (summerBusy && !stageStartRef.current.summer) stageStartRef.current.summer = now;
    if (!summerBusy) stageStartRef.current.summer = null;
    if (bloomBusy && !stageStartRef.current.bloom) stageStartRef.current.bloom = now;
    if (!bloomBusy) stageStartRef.current.bloom = null;

    if (!summerBusy && !bloomBusy) return;
    const id = setInterval(() => {
      setStageSeconds({
        summer: stageStartRef.current.summer ? Math.round((Date.now() - stageStartRef.current.summer) / 1000) : 0,
        bloom: stageStartRef.current.bloom ? Math.round((Date.now() - stageStartRef.current.bloom) / 1000) : 0,
      });
    }, 1000);
    return () => clearInterval(id);
  }, [summerBusy, bloomBusy]);

  // Tick the resend countdown once a second while waiting on the code step.
  useEffect(() => {
    if (gate !== "code" || !nextResendAt) return undefined;
    const id = setInterval(() => setResendTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [gate, nextResendAt]);

  const resendWaitSec = useMemo(() => {
    void resendTick;
    if (!nextResendAt) return 0;
    return Math.max(0, Math.ceil((nextResendAt - Date.now()) / 1000));
  }, [nextResendAt, resendTick]);

  const canResend = gate === "code" && resendsRemaining > 0 && resendWaitSec <= 0 && !sendingCode;

  const applySendMeta = (data) => {
    if (typeof data?.resendsRemaining === "number") setResendsRemaining(data.resendsRemaining);
    if (data?.nextResendAt) setNextResendAt(Number(data.nextResendAt));
    else if (data?.cooldownMs) setNextResendAt(Date.now() + Number(data.cooldownMs));
  };

  const formatResendWait = (sec) => {
    if (sec <= 0) return "";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m <= 0) return `${s}s`;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!flash) return;
    const id = setTimeout(() => setFlash(""), 2200);
    return () => clearTimeout(id);
  }, [flash]);

  // Keep the active wizard step under the sticky nav (esp. step 2 → email on mobile).
  useEffect(() => {
    if (phase !== "setup") return;
    if (skipStepScroll.current) {
      skipStepScroll.current = false;
      return;
    }
    const el = wizardRef.current;
    if (!el) return;
    let inner = 0;
    const outer = window.requestAnimationFrame(() => {
      // Second frame: wait until the short email panel has replaced the tall step-2 layout.
      inner = window.requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [step, phase]);

  const goToStep = (n) => {
    setError("");
    setStep(n);
  };

  // Progressive circle while generating (stage-aware + ~2 min expectation).
  useEffect(() => {
    if (phase !== "generating") return undefined;
    const tick = () => {
      const meta = GEN_STAGES[genStage] || GEN_STAGES.plan;
      const elapsed = Date.now() - stageStartedAt.current;
      const within = Math.min(1, elapsed / meta.expectMs);
      const stagePct = meta.start + (meta.end - meta.start) * within;
      const wallPct = Math.min(97, ((Date.now() - genStartedAt.current) / EXPECTED_GEN_MS) * 100);
      const pct =
        genStage === "done"
          ? 100
          : Math.min(meta.end, Math.max(stagePct, Math.min(wallPct, meta.end - 0.5)));
      setGenProgress(pct);
      const remainSec = Math.max(
        0,
        Math.ceil((EXPECTED_GEN_MS - (Date.now() - genStartedAt.current)) / 1000)
      );
      setGenEta(
        genStage === "done"
          ? "Almost done"
          : remainSec > 90
            ? "About 2 minutes"
            : remainSec > 45
              ? "About a minute left"
              : remainSec > 8
                ? `About ${remainSec} seconds left`
                : "Almost done"
      );
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [phase, genStage]);

  const applyAreaFile = async (file) => {
    if (!file || !/^image\/(jpeg|png|webp)$/i.test(file.type || "")) {
      setError("Use a JPG, PNG, or WebP photo.");
      return;
    }
    try {
      const { dataUrl, base64 } = await downscaleImage(file);
      setAreaUrl(dataUrl);
      setAreaB64(base64);
      setError("");
    } catch {
      setError("Could not read that photo. Try a JPG or PNG.");
    }
  };

  const onArea = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    await applyAreaFile(f);
    e.target.value = "";
  };

  const onAreaDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    setAreaDragOver(true);
  };

  const onAreaDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Ignore leave events that bubble from children inside the drop zone.
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setAreaDragOver(false);
  };

  const onAreaDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAreaDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) await applyAreaFile(f);
  };

  const onInspo = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 4);
    if (!files.length) return;
    try {
      const resized = await Promise.all(files.map((f) => downscaleImage(f)));
      setInspoUrls(resized.map((r) => r.dataUrl));
      setInspoB64(resized.map((r) => r.base64));
      setError("");
    } catch {
      setError("Could not read an inspiration photo. Try JPG or PNG.");
    }
  };

  const toggleVibe = (key) => {
    setVibes((cur) => {
      if (cur.includes(key)) return cur.length === 1 ? cur : cur.filter((k) => k !== key);
      return [...cur, key].slice(-2); // one primary + one accent
    });
  };

  const toggleLifestyle = (key) =>
    setLifestyle((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]));

  /** Payload shared by the two image routes. */
  const stagePayload = (plan) => ({
    designId: plan.id,
    email: email.trim().toLowerCase(),
    plants: plan.items.map((i) => ({ sku: i.sku, qty: i.qty, zone: i.zone })),
    sqFt: plan.sqFt,
    shape: plan.shape,
    style: plan.style,
    description: plan.description,
    sceneNotes: plan.sceneNotes,
    bedBox: plan.bedBox,
    wantWalkway: plan.wantWalkway,
    keepExisting: plan.keepExisting,
  });

  const beginStage = (name) => {
    setGenStage(name);
    stageStartedAt.current = Date.now();
  };

  // Background connection safety net only — deliberately well above both the
  // 120s "Check again" threshold and the server's own worst case (~190s,
  // 3 retries at 45s each). It exists purely so the browser never holds a
  // connection open forever if one genuinely never resolves; it should almost
  // never fire before a real response (success or error) comes back first.
  const STAGE_TIMEOUT_MS = 240000;

  /** Ask the server if this stage already finished (e.g. after a client abort). */
  const pollForStageUrl = async (stage, { attempts = 18, delayMs = 2000 } = {}) => {
    const id = result?.id || designId;
    if (!id) return null;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let i = 0; i < attempts; i++) {
      try {
        const res = await fetch(`/api/design/${id}`);
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const plan = data.design;
          const url = plan?.[`${stage}Url`];
          if (url) {
            setResult((prev) => (prev ? { ...prev, ...plan } : plan));
            persistDesignLocal(plan);
            return url;
          }
        }
      } catch {
        /* keep polling */
      }
      if (i < attempts - 1) await sleep(delayMs);
    }
    return null;
  };

  /** Fire one stage's generation request; used by both the initial flow and manual retry. */
  const runStage = async (stage, endpoint, body) => {
    const setBusy = stage === "summer" ? setSummerBusy : stage === "night" ? setNightBusy : setBloomBusy;
    setBusy(true);

    stageAbortRef.current[stage]?.abort();
    const controller = new AbortController();
    stageAbortRef.current[stage] = controller;
    const timeoutId = setTimeout(() => controller.abort(), STAGE_TIMEOUT_MS);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `${stage} photo failed.`);
      setResult((prev) =>
        prev
          ? { ...prev, [`${stage}Url`]: data[`${stage}Url`], ...(data.hotspots ? { hotspots: data.hotspots } : {}) }
          : prev
      );
      return data;
    } catch (err) {
      if (err.name === "AbortError") {
        console.warn(`${stage} generation timed out / aborted client-side — checking server`);
      } else {
        console.error(err);
      }
      // Server often finished writing the URL even when the browser connection died.
      const recovered = await pollForStageUrl(stage);
      if (recovered) return { [`${stage}Url`]: recovered };
      return null;
    } finally {
      clearTimeout(timeoutId);
      setBusy(false);
      if (stageAbortRef.current[stage] === controller) stageAbortRef.current[stage] = null;
    }
  };

  const finishLaterSeasons = async (payload) => {
    if (!payload) return;
    // Sequential on purpose: bloom must be MORE grown than summer, and the only
    // way to guarantee that is to hand bloom summer's actual finished output as
    // a growth reference. Firing both in parallel off the same install image
    // let two independent, uncoordinated generations each guess at "how mature"
    // — nothing kept bloom from coming back less grown than summer, which is
    // exactly the swapped-looking result this replaces.
    const summerData = await runStage("summer", "/api/design/summer", payload);
    const summerImage = summerData?.summerImage || null;
    await runStage("bloom", "/api/design/bloom", { ...payload, summerImage });

    // Opt-in only (checked at setup, step 2) — never spend a Gemini call on
    // this unless the customer actually asked for it. When they did, start it
    // now in the background so it's usually ready by the time they reach the
    // Time Machine's night toggle instead of making them wait for it there.
    if (wantNightView) {
      await runStage("night", "/api/design/night", payload);
    }
  };

  /**
   * While a stage is still in flight, only poll — never abort (that caused
   * "failed" after the photo actually landed). Fresh generation only when idle.
   * Bloom retries must wait until summer exists so glory grows FROM summer, not
   * a second independent install render (which caused summer/glory swaps).
   */
  const retryStage = async (stage) => {
    if (!result?.id) return;
    const busy = stage === "summer" ? summerBusy : bloomBusy;
    const setBusy = stage === "summer" ? setSummerBusy : setBloomBusy;

    if (busy) {
      const url = await pollForStageUrl(stage, { attempts: 10, delayMs: 2000 });
      if (url) setBusy(false);
      return;
    }

    const payload = stagePayload(result);
    if (stage === "bloom") {
      if (!result.summerUrl) {
        setFlash("First-summer photo isn’t ready yet — wait for it, then try full glory.");
        return;
      }
      runStage("bloom", "/api/design/bloom", payload);
    } else {
      runStage("summer", "/api/design/summer", payload);
    }
  };

  /**
   * Night lighting is a lazy, on-demand render off the finished full-glory
   * photo — kicked off the first time someone flips the Time Machine's night
   * toggle, not eagerly for every design. Safe to call repeatedly: it's a
   * no-op once nightUrl exists or a request is already in flight.
   */
  /** Fallback/retry only — the eager render already fires from finishLaterSeasons for opted-in designs. */
  const ensureNight = () => {
    if (!result?.id || !result.wantNightView || result.nightUrl || nightBusy) return;
    if (!result.bloomUrl) return; // night grows out of the full-glory frame
    runStage("night", "/api/design/night", stagePayload(result));
  };

  useEffect(() => {
    if (!swapFor) return;
    const id = window.requestAnimationFrame(() => {
      swapAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => cancelAnimationFrame(id);
  }, [swapFor]);

  const sendCode = async () => {
    if (!emailOk(email)) {
      setError("Enter a valid email so we can verify it.");
      return;
    }
    if (gate === "code" && !canResend) {
      if (resendsRemaining <= 0) {
        setError("You’ve used all 3 resends. Wait a bit, then try again with your email.");
      } else if (resendWaitSec > 0) {
        setError(`You can resend in ${formatResendWait(resendWaitSec)}.`);
      }
      return;
    }
    setSendingCode(true);
    setError("");
    try {
      const res = await fetch("/api/design/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      applySendMeta(data);
      if (!res.ok) {
        setError(data.error || "Could not send a code.");
        if (gate !== "code" && data.nextResendAt) setGate("code");
        return;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(EMAIL_KEY, email.trim().toLowerCase());
      }
      if (data.softVerified) {
        if (typeof window !== "undefined") {
          localStorage.setItem(VERIFIED_KEY, email.trim().toLowerCase());
        }
        setGate("ready");
        await generate();
        return;
      }
      setOtp("");
      setGate("code");
      setFlash(data.message || "Check your email for a code.");
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setSendingCode(false);
    }
  };

  const confirmCode = async () => {
    if (!emailOk(email)) {
      setError("Enter a valid email.");
      return;
    }
    if (String(otp).replace(/\D/g, "").length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setConfirmingCode(true);
    setError("");
    try {
      const res = await fetch("/api/design/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm",
          email: email.trim().toLowerCase(),
          code: otp,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "That code didn’t work.");
        return;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(EMAIL_KEY, email.trim().toLowerCase());
        localStorage.setItem(VERIFIED_KEY, email.trim().toLowerCase());
      }
      setGate("ready");
      await generate();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setConfirmingCode(false);
    }
  };

  const generate = async () => {
    if (!areaB64) {
      setError("Add a photo of your yard first.");
      setStep(1);
      return;
    }
    if (!emailOk(email)) {
      setError("Enter a valid email so we can send your design.");
      return;
    }
    if (!agreedDesigner) {
      setError("Please agree to the Delivery & Plant Care Terms to continue.");
      return;
    }
    if (typeof window !== "undefined") localStorage.setItem(EMAIL_KEY, email.trim().toLowerCase());

    genStartedAt.current = Date.now();
    stageStartedAt.current = Date.now();
    setGenStage("plan");
    setGenProgress(0);
    setPhase("generating");
    setError("");
    setResult(null);
    setInstallBusy(false);
    setSummerBusy(false);
    setBloomBusy(false);

    try {
      const planRes = await fetch("/api/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          assent: agreedDesigner,
          marketingOptIn: wantsMarketing,
          areaImage: areaB64,
          inspoImages: inspoB64,
          description: desc,
          gardenSlug: lockedGarden?.slug || undefined,
          vibes,
          lifestyle,
          sunAspect: sunAspect || undefined,
          sqFt,
          shape: "rectangle",
          budget: budgetIsFlex ? null : effectiveBudget,
          wantWalkway,
          keepExisting,
          wantNightView,
        }),
      });
      const plan = await planRes.json().catch(() => ({}));
      if (!planRes.ok) {
        if (plan.needsVerify || planRes.status === 403) {
          if (typeof window !== "undefined") localStorage.removeItem(VERIFIED_KEY);
          setGate("email");
          setPhase("setup");
          setStep(3);
          setError(plan.error || "Please verify your email with the code we send.");
          return;
        }
        setError(
          plan.detail
            ? `${plan.error || "Could not build a plan."} (${plan.detail})`
            : plan.error || "Could not build a plan."
        );
        setPhase("setup");
        return;
      }

      const base = {
        ...plan,
        installUrl: null,
        summerUrl: null,
        bloomUrl: null,
        nightUrl: null,
        budgetFlex: budgetIsFlex,
        requestedBudget: effectiveBudget || null,
      };
      setResult(base);
      persistDesignLocal(base);
      if (plan.id) {
        try {
          sessionStorage.setItem(inflightKey(plan.id), "1");
        } catch {
          /* private mode */
        }
        router.replace(`/designer/d/${plan.id}`);
      }
      beginStage("install");
      setInstallBusy(true);
      setSummerBusy(true);
      setBloomBusy(true);

      // Truck day first (blocking). Summer + full glory run in parallel afterward
      // so the customer can explore sooner without dropping image quality.
      let installImage = null;
      try {
        const res = await fetch("/api/design/install", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...stagePayload(base), areaImage: areaB64, inspoImages: inspoB64 }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Install photo failed.");
        installImage = data.installImage || null;
        setResult((prev) => (prev ? { ...prev, installUrl: data.installUrl } : prev));
      } catch (err) {
        console.error(err);
        setError((prev) => prev || err.message || "Install photo failed.");
        setInstallBusy(false);
        setSummerBusy(false);
        setBloomBusy(false);
        setPhase("setup");
        return;
      }
      setInstallBusy(false);
      beginStage("done");
      setGenProgress(100);
      setPhase("result");

      const payload = { ...stagePayload(base), installImage, areaImage: areaB64 };
      await finishLaterSeasons(payload);
    } catch {
      setError("Could not build your design. Please try again.");
      setPhase("setup");
      setInstallBusy(false);
      setSummerBusy(false);
      setBloomBusy(false);
    }
  };

  const items = result?.items || [];
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.qty, 0),
    [items]
  );
  const beforeSrc = result?.beforeUrl || areaUrl;

  const addOne = (plant, qty = 1) => {
    addItem(
      {
        sku: plant.sku,
        name: plant.name,
        price: plant.price,
        art: plant.art,
        size: plant.size,
        variantId: plant.variantId,
      },
      qty,
      { silent: true }
    );
    setFlash(`${plant.name} added to your cart`);
  };

  const addPlanToCart = () => {
    if (!items.length) return;
    items.forEach((i) => {
      addItem(
        { sku: i.sku, name: i.name, price: i.price, art: i.art, size: i.size, variantId: i.variantId },
        i.qty,
        { silent: true }
      );
    });
    // Prefer Annie's Shopify checkout (real cart with these SKUs). If the list
    // was edited, open the design on Annie's so they can rebuild the cart there.
    if (result?.checkoutUrl && !result?.edited) {
      window.location.href = result.checkoutUrl;
      return;
    }
    if (result?.id) {
      window.location.href = `${ANNIES_URL}/designer/d/${result.id}`;
      return;
    }
    window.location.href = ANNIES_CART;
  };

  const anniesCartHref =
    result?.checkoutUrl && !result?.edited
      ? result.checkoutUrl
      : result?.id
        ? `${ANNIES_URL}/designer/d/${result.id}`
        : ANNIES_CART;

  const installEstimateDesign = result
    ? {
        originalPhoto: result.beforeUrl || areaUrl || "",
        designImage: result.installUrl || result.summerUrl || result.bloomUrl || result.beforeUrl || "",
        request:
          result.designSummary ||
          "Customer designed a planting plan with the AI garden designer and wants a Union Park installation estimate.",
        styles: result.chips || [],
        breakdown: {
          summary:
            result.designSummary ||
            "Plant plan generated from Annie's Online Nursery stock for Union Park installation.",
          trees: [],
          shrubs: [],
          flowersAndPerennials: (result.items || []).map((i) => ({
            commonName: i.name,
            quantity: i.qty || 1,
            size: i.size || undefined,
          })),
          materials: [
            {
              item: "Plants sourced via Annie's Online Nursery",
              estQuantity: `${(result.items || []).reduce((s, i) => s + (i.qty || 0), 0)} plants · see cart on Annie's`,
            },
          ],
          laborNotes:
            "Customer requested a Union Park Landscaping installation estimate for this Annie's plant plan. Confirm bed size, access, and soil conditions on site.",
        },
      }
    : null;

  /** Replace one line item with an in-stock substitute, keeping qty and zone. */
  const applySwap = (item, option) => {
    setResult((prev) => {
      if (!prev) return prev;
      const next = prev.items.map((i) =>
        i.sku === item.sku
          ? {
              ...i,
              sku: option.sku,
              name: option.name,
              price: option.price,
              art: option.art,
              size: option.size,
              variantId: option.variantId,
              bloom: option.bloom,
              swaps: [
                {
                  sku: item.sku,
                  name: item.name,
                  price: item.price,
                  size: item.size,
                  art: item.art,
                  delta: Math.round((item.price - option.price) * i.qty),
                },
                ...(i.swaps || []).filter((s) => s.sku !== option.sku),
              ].slice(0, 4),
            }
          : i
      );
      return { ...prev, items: next, edited: true };
    });
    setSwapFor(null);
    setFlash(`Swapped in ${option.name}`);
  };

  const focusPlant = (sku) => {
    setHighlight(sku);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => setHighlight(""), 2400);
  };

  const restart = () => {
    setPhase("setup");
    setResult(null);
    setError("");
    setStep(1);
    if (designId) router.push("/designer");
  };

  /* ----------------------------- RESULT VIEW ----------------------------- */
  if (phase === "result" && result && showInstallEstimate && installEstimateDesign) {
    return (
      <div className="tool designer-v2 dz-result">
        <div className="dz-result-head">
          <p className="dz-eyebrow">
            <Spark width="15" height="15" /> Installation estimate
          </p>
          <h2 className="dz-q">Union Park will install this plan</h2>
          <p className="dz-sub">
            Send your design to our crew for a free, no-obligation install quote. Plants stay
            available on Annie&apos;s — you can review the full cart there anytime.
          </p>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-3">
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={installEstimateDesign.originalPhoto}
              alt="Your yard today"
              className="aspect-[4/3] w-full rounded-xl object-cover"
            />
            <figcaption className="mt-1.5 text-center text-xs font-medium text-ink-soft">
              Your yard today
            </figcaption>
          </figure>
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={installEstimateDesign.designImage}
              alt="Installation-day design"
              className="aspect-[4/3] w-full rounded-xl object-cover ring-2 ring-clay-500"
            />
            <figcaption className="mt-1.5 text-center text-xs font-medium text-clay-600">
              Installation day
            </figcaption>
          </figure>
        </div>
        <EstimateForm design={installEstimateDesign} onBack={() => setShowInstallEstimate(false)} />
        <p className="mt-6 text-center text-sm">
          <a className="dz-back-link" href={anniesCartHref} target="_blank" rel="noopener noreferrer">
            View plant cart on Annie&apos;s ↗
          </a>
        </p>
      </div>
    );
  }

  if (phase === "result" && result) {
    // Trust the plan payload only. $5,000+ sends budget:null (no hard cap); after
    // router.replace to /designer/d/… local state resets to the default $500, so
    // never fall back to the setup slider here.
    const guideBudget =
      typeof result.budget === "number" && Number.isFinite(result.budget) && result.budget > 0
        ? result.budget
        : null;
    const budgetPct = guideBudget ? Math.min(100, Math.round((subtotal / guideBudget) * 100)) : null;
    const within = !guideBudget || subtotal <= guideBudget;
    const remaining = result.quota?.remaining;

    return (
      <div className="tool designer-v2 dz-result">
        <div className="dz-result-head">
          <p className="dz-eyebrow">
            <Spark width="15" height="15" /> Your garden
          </p>
          {result.designSummary ? <p className="dz-summary">{result.designSummary}</p> : null}
          {result.chips?.length ? (
            <div className="dz-chip-row">
              {result.chips.map((c) => (
                <span className="dz-chip-read" key={c}>
                  {c}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <TimeMachine
          beforeSrc={beforeSrc}
          installSrc={result.installUrl}
          summerSrc={result.summerUrl}
          bloomSrc={result.bloomUrl}
          nightSrc={result.nightUrl}
          nightEnabled={Boolean(result.wantNightView)}
          installBusy={installBusy && !result.installUrl}
          summerBusy={summerBusy && !result.summerUrl}
          bloomBusy={bloomBusy && !result.bloomUrl}
          nightBusy={nightBusy && !result.nightUrl}
          onRequestNight={ensureNight}
          hotspots={result.hotspots || []}
          onAddPlant={(pin) => {
            const line = items.find((i) => i.sku === pin.sku);
            addOne(line || pin, line?.qty || 1);
          }}
          onFocusPlant={focusPlant}
          autoPlay
        />

        {["summer", "bloom"].map((stage) => {
          const busy = stage === "summer" ? summerBusy : bloomBusy;
          const url = stage === "summer" ? result.summerUrl : result.bloomUrl;
          const seconds = stageSeconds[stage];
          if (url) return null;
          const label = stage === "summer" ? "first-summer" : "full-glory";
          const stalled = !busy || seconds >= RETRY_THRESHOLD_S;

          if (!stalled) {
            // Still well within the expected window — show progress, no button yet.
            return (
              <div className="dz-stage-status dz-stage-progress" key={stage}>
                <ProgressRing percent={(seconds / RETRY_THRESHOLD_S) * 100} size={40} stroke={4} />
                <span>Growing your {label} photo…</span>
              </div>
            );
          }
          return (
            <p className="dz-stage-status" key={stage}>
              {busy
                ? `Still growing your ${label} photo — this is taking longer than usual.`
                : `Your ${label} photo didn't finish.`}{" "}
              <button type="button" className="linkish" onClick={() => retryStage(stage)}>
                {busy ? "Check again" : "Try again"}
              </button>
            </p>
          );
        })}

        {result.edited ? (
          <p className="dz-image-note">Garden photos show your original list — swaps update the plants below.</p>
        ) : null}

        {error ? (
          <p className="dz-note-warn" role="alert">
            {error}
          </p>
        ) : null}

        <BloomRibbon
          ribbon={result.ribbon}
          summary={result.ribbonSummary}
          gapFillers={result.ribbonGapFillers || []}
          onAddPlant={(p) => addOne(p, 1)}
        />

        {result.whenToPlant ? (
          <div className="dz-when">
            <h3>{result.whenToPlant.headline}</h3>
            <p>{result.whenToPlant.detail}</p>
            {result.whenToPlant.byCat?.length > 1 ? (
              <ul>
                {result.whenToPlant.byCat.map((c) => (
                  <li key={c.cat}>
                    <strong>{c.window}</strong> for {c.cat}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        {/* P1-3 / P1-4 — persistent, not a tooltip or accordion. */}
        <div className="dz-811-warn" role="note">
          <strong>Before you dig, call 811.</strong> It&rsquo;s free and required by law. This
          design was generated by AI and has no knowledge of buried gas, electric, water, or
          sewer lines, property boundaries, easements, or HOA rules. It is an idea, not a
          plan — and we are not landscape architects.{" "}
          <a href={ANNIES_TERMS}>Read the full terms</a>.
        </div>

        {/* Plant list + budget */}
        <section className="dz-list" ref={listRef}>
          <div className="dz-list-head">
            <h3>Your plant list</h3>
            <span>
              {items.length} kind{items.length === 1 ? "" : "s"} · in stock now
            </span>
          </div>
          {result.lifestyleNote ? <p className="dz-list-note">{result.lifestyleNote}</p> : null}

          <div className="plantlist">
            {items.map((it) => (
              <div className={"it" + (highlight === it.sku ? " lit" : "")} key={it.sku}>
                <span className="q">{it.qty}×</span>
                <span className="nm">
                  {it.name}
                  {it.botanical && it.botanical !== it.name ? (
                    <small className="dz-latin">{it.botanical}</small>
                  ) : null}
                  {it.habit ? <small className="dz-habit">{it.habit}</small> : null}
                  <ToxicityFlag toxicity={it.toxicity} compact />
                </span>
                <span className="pr">{money(it.price * it.qty)}</span>
                <button
                  type="button"
                  className="dz-swap-btn"
                  onClick={() => setSwapFor(swapFor?.sku === it.sku ? null : it)}
                >
                  Swap
                </button>
              </div>
            ))}
          </div>
          <p className="dz-safety-note">
            Some plants in this list may be toxic to children or pets — check each variety
            before planting.
          </p>

          {swapFor ? (
            <div ref={swapAnchorRef}>
              <SwapDrawer item={swapFor} onSwap={applySwap} onClose={() => setSwapFor(null)} />
            </div>
          ) : null}

          <div className="dz-budget">
            <div className="totrow">
              <span>Plant total</span>
              <span className="tot">{money(subtotal)}</span>
            </div>
            {guideBudget ? (
              <>
                <div className="dz-budget-bar">
                  <div
                    className={"dz-budget-fill" + (within ? "" : " over")}
                    style={{ width: `${budgetPct}%` }}
                  />
                </div>
                <p className={"dz-budget-note" + (within ? "" : " over")}>
                  {within
                    ? `Within your ${money(guideBudget)} budget${
                        guideBudget - subtotal > 0 ? ` — ${money(guideBudget - subtotal)} to spare` : ""
                      }.`
                    : `About ${money(subtotal - guideBudget)} over your ${money(guideBudget)} budget.`}
                </p>
              </>
            ) : (
              <p className="dz-budget-note">
                You chose $5,000+ — sized for your bed with no hard spend cap. Swap or add plants
                to spend what feels right.
              </p>
            )}
            <p className="dz-impact-note">
              <Link href={IMPACT_PATH}>{impactPledge()}</Link>
            </p>
          </div>

          <button
            type="button"
            className="btn btn-fern dz-cta"
            onClick={() => setShowInstallEstimate(true)}
          >
            Get free installation estimate — Union Park
          </button>
          <a
            className="btn btn-outline dz-cta"
            href={anniesCartHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              // Still sync local lines so a return visit on Annie's design page is ready.
              if (!result?.checkoutUrl || result?.edited) return;
              e.preventDefault();
              addPlanToCart();
            }}
            style={{ marginTop: 10, textAlign: "center" }}
          >
            <Cart width="18" height="18" /> View plant cart on Annie&apos;s — {money(subtotal)}
          </a>
          <p className="dz-sub" style={{ marginTop: 10, textAlign: "center" }}>
            Plants are fulfilled by {`Annie's Online Nursery`}. Installation is quoted separately by
            Union Park Landscaping.
          </p>
        </section>

        <ShareCard
          beforeSrc={beforeSrc}
          bloomSrc={result.bloomUrl}
          items={items}
          subtotal={subtotal}
          peakMonth={result.ribbon?.peak?.label}
          designId={result.id}
        />

        <button type="button" className="btn btn-outline dz-restart" onClick={restart}>
          Try another vibe / start over
        </button>
        <p style={{ textAlign: "center", marginTop: 10 }}>
          <a href={ANNIES_DESIGNS} className="dz-back-link" target="_blank" rel="noopener noreferrer">
            See all your saved designs on Annie&apos;s ↗
          </a>
        </p>
        {typeof remaining === "number" ? (
          <p className="dz-quota">
            <Leaf width="13" height="13" />{" "}
            {remaining === 0
              ? "No free designs left this week"
              : `${remaining} free design${remaining === 1 ? "" : "s"} left this week`}
            {result.quota?.limit ? ` of ${result.quota.limit}` : ""}
          </p>
        ) : null}

        {flash ? (
          <div className="dz-flash" role="status">
            {flash}
          </div>
        ) : null}
      </div>
    );
  }

  /* --------------------------- GENERATING VIEW --------------------------- */
  if (phase === "generating") {
    const meta = GEN_STAGES[genStage] || GEN_STAGES.plan;
    const pct = Math.max(0, Math.min(100, genProgress));
    const r = 54;
    const c = 2 * Math.PI * r;
    const dash = (pct / 100) * c;
    const remainLabel = genEta;
    return (
      <div className="tool designer-v2">
        <div className="dz-grow" role="status" aria-live="polite">
          <div className="dz-ring" aria-hidden="true">
            <svg viewBox="0 0 120 120" width="120" height="120">
              <circle className="dz-ring-track" cx="60" cy="60" r={r} />
              <circle
                className="dz-ring-fill"
                cx="60"
                cy="60"
                r={r}
                strokeDasharray={`${dash} ${c}`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <span className="dz-ring-pct">{Math.round(pct)}%</span>
          </div>
          <p className="dz-grow-title">{meta.title}</p>
          <p className="dz-grow-sub">{meta.sub}</p>
          <p className="dz-grow-eta">{remainLabel}</p>
        </div>
      </div>
    );
  }

  /* ----------------------------- SETUP WIZARD ---------------------------- */
  const canContinue1 = Boolean(areaB64);

  return (
    <div className="tool designer-v2" ref={wizardRef}>
      <div className="lead">
        <Spark width="18" height="18" style={{ color: "#6E8B5B" }} /> Design my garden
      </div>

      <div className="dz-steps" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={"dz-step-dot" + (step >= n ? " on" : "")} />
        ))}
      </div>

      {/* STEP 1 — photo */}
      {step === 1 && (
        <div className="dz-panel">
          <h3 className="dz-q">Show us your yard</h3>
          <p className="dz-sub">Snap or upload one photo of the spot you want to plant.</p>
          <div
            className={
              "drop dz-drop" +
              (areaUrl ? " filled" : "") +
              (areaDragOver ? " drag-over" : "")
            }
            onClick={() => areaRef.current?.click()}
            onDragEnter={onAreaDragOver}
            onDragOver={onAreaDragOver}
            onDragLeave={onAreaDragLeave}
            onDrop={onAreaDrop}
          >
            {areaUrl ? (
              <img src={areaUrl} alt="Your yard" />
            ) : (
              <>
                <Upload width="26" height="26" style={{ color: "#6E8B5B" }} />
                <div className="dt">Drop a photo here, or click to browse</div>
                <div className="ds">JPG or PNG · a clear daytime photo works best</div>
              </>
            )}
            <input
              ref={areaRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={onArea}
            />
          </div>
          {error ? <p className="dz-note-warn">{error}</p> : null}
          {!canContinue1 ? (
            <p className="dz-hint-disabled">Add a photo first to continue.</p>
          ) : null}
          <button
            className={"btn btn-primary dz-next" + (!canContinue1 ? " is-disabled" : "")}
            disabled={!canContinue1}
            onClick={() => goToStep(2)}
          >
            Continue
          </button>
        </div>
      )}

      {/* STEP 2 — vibe, life, size, budget */}
      {step === 2 && (
        <div className="dz-panel">
          <h3 className="dz-q">What are you going for?</h3>
          <p className="dz-sub">Pick one or two. No garden jargon required.</p>
          {lockedGarden ? (
            <p className="designer-locked-garden">{lockedGarden.title}</p>
          ) : (
            <div className="dz-vibes">
              {VIBES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  className={"dz-vibe" + (vibes.includes(v.key) ? " on" : "")}
                  onClick={() => toggleVibe(v.key)}
                >
                  <span className="dz-vibe-emoji" aria-hidden="true">
                    {v.emoji}
                  </span>
                  <strong>{v.label}</strong>
                  <span className="dz-vibe-hint">{v.hint}</span>
                </button>
              ))}
            </div>
          )}

          <h3 className="dz-q dz-q-mt">Anything we should know?</h3>
          <div className="dz-life">
            {LIFESTYLE.map((l) => (
              <button
                key={l.key}
                type="button"
                className={"dz-life-chip" + (lifestyle.includes(l.key) ? " on" : "")}
                onClick={() => toggleLifestyle(l.key)}
              >
                <span aria-hidden="true">{l.emoji}</span> {l.label}
              </button>
            ))}
          </div>

          <h3 className="dz-q dz-q-mt">Which way does the sun hit this spot?</h3>
          <p className="dz-sub">This matters more than almost anything for picking the right plants.</p>
          <div className="dz-sun">
            {SUN_ASPECTS.map((s) => (
              <button
                key={s.key}
                type="button"
                className={"dz-sun-chip" + (sunAspect === s.key ? " on" : "")}
                onClick={() => setSunAspect(s.key)}
              >
                <strong>{s.label}</strong>
                <span>{s.hint}</span>
              </button>
            ))}
          </div>

          <h3 className="dz-q dz-q-mt">How big is the area?</h3>
          <p className="dz-sub">Pick the closest fit, then fine-tune with the slider if you like.</p>
          <div className="pills">
            {SIZE_PRESETS.map((s) => (
              <button
                key={s.sqFt}
                type="button"
                className={"pill" + (sqFt === s.sqFt ? " on" : "")}
                onClick={() => setSqFt(s.sqFt)}
                title={s.hint}
              >
                {s.label}
              </button>
            ))}
          </div>
          <input
            className="dz-range-input"
            type="range"
            min={SIZE_SLIDER_MIN}
            max={SIZE_SLIDER_MAX}
            step="25"
            value={Math.min(SIZE_SLIDER_MAX, sqFt)}
            onChange={(e) => setSqFt(Number(e.target.value))}
            aria-valuetext={`${sqFt} square feet`}
          />
          <p className="dz-range-val">
            About {sqFt.toLocaleString()} sq ft{" "}
            {sqFt >= SIZE_SLIDER_MAX ? "— our largest supported size" : null}
          </p>

          <h3 className="dz-q dz-q-mt">What&apos;s your budget?</h3>
          <p className="dz-sub">A guide for sizing the plant list — not a hard ceiling on what you can buy.</p>
          <div className="pills">
            {BUDGET_PRESETS.map((b) => (
              <button
                key={b}
                type="button"
                className={"pill" + (budgetTier === b ? " on" : "")}
                onClick={() => {
                  setBudgetTier(b);
                  if (b < BUDGET_FLEX) setCustomBudget("");
                }}
              >
                {b >= BUDGET_FLEX ? `${money(b)}+` : money(b)}
              </button>
            ))}
          </div>
          {budgetTier >= BUDGET_FLEX ? (
            <div className="dz-custom-budget">
              <label className="dz-field-label" htmlFor="dz-custom-budget-input">
                Have a specific number in mind? (optional)
              </label>
              <div className="dz-custom-budget-row">
                <span>$</span>
                <input
                  id="dz-custom-budget-input"
                  type="number"
                  inputMode="numeric"
                  min={BUDGET_FLEX}
                  max={CUSTOM_BUDGET_MAX}
                  step="100"
                  placeholder="5,000+"
                  value={customBudget}
                  onChange={(e) => setCustomBudget(e.target.value)}
                />
              </div>
            </div>
          ) : null}
          <p className="dz-range-val">
            {budgetIsFlex
              ? "We’ll design for a generous bed — $5,000+ with no hard spend cap. Add or swap plants freely."
              : `We’ll size the plant list to stay near ${money(effectiveBudget)}.`}
          </p>

          <div className="dz-touches">
            <div className="dz-touches-head">
              <h3 className="dz-q">Make it yours</h3>
              <p className="dz-sub">
                A few details go a long way — we weave them into the design before the photos are drawn.
              </p>
            </div>
            <label className="dz-field-label">Anything specific?</label>
            <textarea
              value={desc}
              maxLength={600}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g. soft pink blooms by the front door, hide the AC unit, keep it deer-tough"
            />
            <label className="dz-check" onClick={() => setWantWalkway((v) => !v)}>
              <span className={"toggle" + (wantWalkway ? " on" : "")}>
                <b />
              </span>
              Add a path through the garden
            </label>
            <label className="dz-check" onClick={() => setKeepExisting((v) => !v)}>
              <span className={"toggle" + (keepExisting ? " on" : "")}>
                <b />
              </span>
              Keep my existing plants — design around what's already there
            </label>
            <label className="dz-check" onClick={() => setWantNightView((v) => !v)}>
              <span className={"toggle" + (wantNightView ? " on" : "")}>
                <b />
              </span>
              Also show me a nighttime view — full glory with the landscape lighting on
            </label>
            <div
              className={"drop dz-drop-sm" + (inspoUrls.length ? " filled inspo-drop" : "")}
              onClick={() => inspoRef.current?.click()}
            >
              {inspoUrls.length > 0 ? (
                <div className="inspo-strip">
                  {inspoUrls.map((u, i) => (
                    <img key={i} src={u} alt={`Inspiration ${i + 1}`} />
                  ))}
                </div>
              ) : (
                <>
                  <Spark width="18" height="18" style={{ color: "#6E8B5B" }} />
                  <div className="dt">Add inspiration photos</div>
                  <div className="ds">Optional · up to 4 looks you love</div>
                </>
              )}
              <input
                ref={inspoRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                hidden
                onChange={onInspo}
              />
            </div>
          </div>

          <div className="dz-nav-row">
            <button type="button" className="btn btn-outline" onClick={() => goToStep(1)}>
              Back
            </button>
            <button
              className="btn btn-primary"
              onClick={() => goToStep(3)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — email OTP (abuse gate) + then generate */}
      {step === 3 && (
        <div className="dz-panel">
          <h3 className="dz-q">
            {gate === "code" ? "Check your email" : "Where should we send it?"}
          </h3>
          <p className="dz-sub">
            {gate === "code"
              ? `Enter the 6-digit code we sent to ${email.trim().toLowerCase()}. This keeps free designs for real neighbors — not bots.`
              : "We’ll email a quick code, then design your yard on screen and send you a link to come back to it anytime."}
          </p>

          {gate !== "code" ? (
            <>
              <input
                className="dz-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (gate === "ready") setGate("email");
                  setNextResendAt(null);
                  setResendsRemaining(3);
                }}
                placeholder="you@email.com"
              />
              {error ? <p className="dz-note-warn">{error}</p> : null}
              {gate === "ready" ? (
                <>
                  <label className="assent-check">
                    <input
                      type="checkbox"
                      checked={agreedDesigner}
                      onChange={(e) => setAgreedDesigner(e.target.checked)}
                    />
                    <span>
                      <strong>By checking this box I agree</strong> to the{" "}
                      <a href={ANNIES_TERMS} target="_blank" rel="noopener noreferrer">
                        Delivery &amp; Plant Care Terms
                      </a>{" "}
                      and{" "}
                      <a href={ANNIES_SITE_TERMS} target="_blank" rel="noopener noreferrer">
                        Terms of Service
                      </a>
                      . I understand this design is an AI-generated illustration, not a plan or
                      a promise of what I&rsquo;ll receive.
                    </span>
                  </label>
                  <label className="assent-check marketing-check">
                    <input
                      type="checkbox"
                      checked={wantsMarketing}
                      onChange={(e) => setWantsMarketing(e.target.checked)}
                    />
                    <span>Email me seasonal plant tips and offers.</span>
                  </label>
                  <button
                    className="btn btn-fern dz-reveal"
                    disabled={!emailOk(email) || !agreedDesigner}
                    onClick={generate}
                  >
                    <Spark width="18" height="18" /> Show me my garden
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-fern dz-reveal"
                  disabled={!emailOk(email) || sendingCode}
                  onClick={sendCode}
                >
                  {sendingCode ? "Sending code…" : "Email me a code"}
                </button>
              )}
              {gate === "ready" ? (
                <button
                  type="button"
                  className="dz-back-link"
                  onClick={() => {
                    setGate("email");
                    if (typeof window !== "undefined") localStorage.removeItem(VERIFIED_KEY);
                  }}
                >
                  Use a different email
                </button>
              ) : null}
            </>
          ) : (
            <>
              <input
                className="dz-email dz-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="------"
                aria-label="6-digit verification code"
              />
              {error ? <p className="dz-note-warn">{error}</p> : null}
              <button
                className="btn btn-fern dz-reveal"
                disabled={String(otp).replace(/\D/g, "").length !== 6 || confirmingCode}
                onClick={confirmCode}
              >
                {confirmingCode ? "Checking…" : "Verify & show my garden"}
              </button>
              {resendsRemaining > 0 ? (
                <button
                  type="button"
                  className="dz-back-link"
                  disabled={!canResend}
                  onClick={sendCode}
                >
                  {sendingCode
                    ? "Sending…"
                    : resendWaitSec > 0
                      ? `Resend code in ${formatResendWait(resendWaitSec)}`
                      : `Resend code (${resendsRemaining} left)`}
                </button>
              ) : (
                <p className="dz-resend-exhausted">
                  No resends left — wait a bit, then start again with your email.
                </p>
              )}
              <button
                type="button"
                className="dz-back-link"
                onClick={() => {
                  setGate("email");
                  setOtp("");
                  setError("");
                  setNextResendAt(null);
                  setResendsRemaining(3);
                }}
              >
                Change email
              </button>
            </>
          )}

          <p className="dz-quota">
            <Leaf width="13" height="13" /> 5 free designs a week · only plants we have in stock
          </p>
          <button type="button" className="dz-back-link" onClick={() => goToStep(2)}>
            Back
          </button>
        </div>
      )}
    </div>
  );
}
