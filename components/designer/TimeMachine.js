"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Cart } from "./icons";

/**
 * The Time Machine — one continuous scrub from "your yard today" to "full glory".
 * Layers cross-fade smoothly while dragging (no snap-to-spot). Tick marks are
 * optional landmarks you can tap to glide; releasing the scrub leaves you
 * wherever you stopped so the transition stays gradual.
 */

export const BEATS = [
  {
    t: 0,
    key: "now",
    label: "Your yard today",
    short: "Today",
    caption: "Where we're starting from.",
    real: true,
  },
  {
    t: 34,
    key: "install",
    label: "Installation day",
    short: "Install day",
    caption: "An illustration of one way this could look. Real plants arrive at farm size, with gaps between them.",
    real: true,
  },
  {
    t: 67,
    key: "summer",
    label: "First summer",
    short: "1st summer",
    caption: "Filling in and finding its feet.",
    real: false,
  },
  {
    t: 100,
    key: "glory",
    label: "Full glory",
    short: "Full glory",
    caption: "The same bed in two to three seasons, grown in and blooming.",
    real: true,
  },
];

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const easeInOut = (p) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);

/**
 * Opacity of each stacked layer for a scrub position 0–100.
 * With a summer frame: sequential cross-fades.
 * Without: install → bloom spans the rest (classic smooth blend).
 */
function layerOpacity(t, hasSummer) {
  const t1 = BEATS[1].t;
  if (!hasSummer) {
    return {
      install: clamp(t / t1, 0, 1),
      summer: 0,
      bloom: clamp((t - t1) / (100 - t1), 0, 1),
    };
  }
  const t2 = BEATS[2].t;
  return {
    install: clamp(t / t1, 0, 1),
    summer: clamp((t - t1) / (t2 - t1), 0, 1),
    bloom: clamp((t - t2) / (100 - t2), 0, 1),
  };
}

function nearestBeat(t) {
  return BEATS.reduce((best, b) => (Math.abs(b.t - t) < Math.abs(best.t - t) ? b : best));
}

export default function TimeMachine({
  beforeSrc,
  installSrc,
  summerSrc,
  bloomSrc,
  nightSrc,
  nightEnabled = false,
  installBusy,
  summerBusy,
  bloomBusy,
  nightBusy,
  onRequestNight,
  hotspots = [],
  onAddPlant,
  onFocusPlant,
  autoPlay = false,
}) {
  const [t, setT] = useState(0);
  const [pins, setPins] = useState(false);
  const [openPin, setOpenPin] = useState(null);
  const [hint, setHint] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [nightOn, setNightOn] = useState(false);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const scrubbing = useRef(false);
  const frameRef = useRef(null);
  const shellRef = useRef(null);

  const bloomReady = Boolean(bloomSrc);
  const summerReady = Boolean(summerSrc);
  const installReady = Boolean(installSrc);
  const hasSummer = summerReady;

  const op = layerOpacity(t, hasSummer);

  /** How far the scrub can go with what's loaded. Bloom unlocks the full glide. */
  const maxReadyT = bloomReady
    ? 100
    : summerReady
      ? BEATS[2].t
      : installReady
        ? BEATS[1].t
        : 0;

  const beat = nearestBeat(t);
  const summerIsReal = summerReady;

  /** Glide to a landmark — optional; free scrub never snaps. */
  const glideTo = useCallback((target, ms = 900) => {
    cancelAnimationFrame(rafRef.current);
    const from = tRef.current;
    const start = performance.now();
    const step = (now) => {
      const p = clamp((now - start) / ms, 0, 1);
      const value = from + (target - from) * easeInOut(p);
      tRef.current = value;
      setT(value);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    if (!autoPlay || !installSrc) return;
    const enter = setTimeout(() => glideTo(BEATS[1].t, 1500), 250);
    const nudge = setTimeout(() => setHint(true), 2000);
    return () => {
      clearTimeout(enter);
      clearTimeout(nudge);
    };
  }, [autoPlay, installSrc, glideTo]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  useEffect(() => {
    if (!fullscreen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    const onFsChange = () => {
      if (!document.fullscreenElement) setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [fullscreen]);

  const enterFullscreen = async () => {
    setFullscreen(true);
    try {
      await shellRef.current?.requestFullscreen?.();
    } catch {
      /* CSS overlay still works when native fullscreen is blocked (common on iOS) */
    }
  };

  const exitFullscreen = async () => {
    setFullscreen(false);
    try {
      if (document.fullscreenElement) await document.exitFullscreen?.();
    } catch {
      /* ignore */
    }
  };

  const setScrub = useCallback(
    (value) => {
      cancelAnimationFrame(rafRef.current);
      const next = clamp(value, 0, maxReadyT || 100);
      tRef.current = next;
      setHint(false);
      setOpenPin(null);
      setT(next);
    },
    [maxReadyT]
  );

  const scrubFromClientX = useCallback(
    (clientX) => {
      const el = frameRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return;
      const pct = ((clientX - rect.left) / rect.width) * 100;
      setScrub(pct);
    },
    [setScrub]
  );

  const pinsVisible = pins && bloomReady && t > 55;
  useEffect(() => {
    if (!pinsVisible) setOpenPin(null);
  }, [pinsVisible]);

  const openPinData = useMemo(
    () => hotspots.find((h) => h.sku === openPin) || null,
    [hotspots, openPin]
  );

  const onFramePointerDown = (e) => {
    if (pinsVisible) return;
    if (e.button != null && e.button !== 0) return;
    if (
      e.target.closest?.(
        ".tm-pins-toggle, .tm-fs-btn, .tm-night-toggle, .tm-chrome, .tm-pin, .tm-card, .tm-card-x, .tm-card-add, .tm-card-find, .tm-busy"
      )
    ) {
      return;
    }
    scrubbing.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    scrubFromClientX(e.clientX);
  };

  const onFramePointerMove = (e) => {
    if (!scrubbing.current) return;
    scrubFromClientX(e.clientX);
  };

  const onFramePointerUp = () => {
    scrubbing.current = false;
  };

  const beatReady = (b) => {
    if (b.key === "now") return Boolean(beforeSrc);
    if (b.key === "install") return installReady;
    if (b.key === "summer") return summerReady || bloomReady; // blend ok once bloom exists
    return bloomReady;
  };

  const busyLabel = installBusy ? "Planting your garden…" : null;
  // Summer and bloom now generate one at a time (bloom needs summer's actual
  // result to grow from), so at most one of these is ever busy in the normal
  // flow — a manual retry of one while the other finishes is the only
  // overlap, and summer's message wins visually in that rare case.
  const laterNote = summerBusy
    ? "Growing first summer — this can take a minute…"
    : bloomBusy
      ? "Growing full glory — this can take a minute…"
      : null;

  const stampNote =
    nightOn && op.bloom > 0.5
      ? "night lighting"
      : beat.key === "summer" && !summerIsReal && bloomReady
        ? "gradual blend"
        : null;

  /** First tap requests the render (if not already ready/in flight); toggle just flips the view. */
  const toggleNight = () => {
    const turningOn = !nightOn;
    setNightOn(turningOn);
    if (turningOn) {
      if (t < 85) glideTo(100, 700);
      if (!nightSrc) onRequestNight?.();
    }
  };

  return (
    <div className={"tm" + (fullscreen ? " tm-fs" : "")} ref={shellRef}>
      <div
        className="tm-frame"
        ref={frameRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={maxReadyT || 100}
        aria-valuenow={Math.round(Math.min(t, maxReadyT || 100))}
        aria-valuetext={beat.label}
        aria-label="Drag through time, from your yard today to full bloom"
        onPointerDown={onFramePointerDown}
        onPointerMove={onFramePointerMove}
        onPointerUp={onFramePointerUp}
        onPointerCancel={onFramePointerUp}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 8 : 2.5;
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            setScrub(tRef.current + step);
          } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            setScrub(tRef.current - step);
          } else if (e.key === "Home") {
            e.preventDefault();
            setScrub(0);
          } else if (e.key === "End") {
            e.preventDefault();
            setScrub(maxReadyT || 100);
          }
        }}
      >
        {beforeSrc ? <img className="tm-layer" src={beforeSrc} alt="Your yard today" draggable={false} /> : null}
        {installSrc ? (
          <img
            className="tm-layer"
            src={installSrc}
            alt="Installation day"
            draggable={false}
            style={{ opacity: op.install }}
          />
        ) : null}
        {summerSrc ? (
          <img
            className="tm-layer"
            src={summerSrc}
            alt="First summer"
            draggable={false}
            style={{ opacity: op.summer }}
          />
        ) : null}
        {bloomSrc ? (
          <img
            className="tm-layer"
            src={bloomSrc}
            alt="In full bloom"
            draggable={false}
            style={{ opacity: op.bloom }}
          />
        ) : null}
        {nightSrc ? (
          <img
            className="tm-layer"
            src={nightSrc}
            alt="In full bloom at night, with landscape lighting on"
            draggable={false}
            style={{ opacity: nightOn ? op.bloom : 0 }}
          />
        ) : null}

        {pinsVisible
          ? hotspots.map((h) => (
              <button
                key={h.sku}
                type="button"
                className={"tm-pin" + (openPin === h.sku ? " on" : "")}
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
                onClick={() => setOpenPin(openPin === h.sku ? null : h.sku)}
                aria-label={`${h.name} — ${h.qty} in this plan`}
              >
                <span className="tm-pin-dot" />
                <span className="tm-pin-label">{h.label}</span>
              </button>
            ))
          : null}

        {openPinData ? (
          <div
            className="tm-card"
            style={{
              left: `${clamp(openPinData.x, 24, 76)}%`,
              top: `${clamp(openPinData.y, 12, 70)}%`,
            }}
          >
            <button
              type="button"
              className="tm-card-x"
              onClick={() => setOpenPin(null)}
              aria-label="Close"
            >
              ×
            </button>
            {openPinData.art ? <img src={openPinData.art} alt="" draggable={false} /> : null}
            <div className="tm-card-body">
              <strong>{openPinData.name}</strong>
              <span className="tm-card-meta">
                {openPinData.qty}× · {openPinData.size}
              </span>
              <span className="tm-card-price">
                ${Math.round(openPinData.price * openPinData.qty).toLocaleString()}
              </span>
              <div className="tm-card-acts">
                <button type="button" className="tm-card-add" onClick={() => onAddPlant?.(openPinData)}>
                  <Cart width="14" height="14" /> Add this one
                </button>
                <button
                  type="button"
                  className="tm-card-find"
                  onClick={() => {
                    setOpenPin(null);
                    onFocusPlant?.(openPinData.sku);
                  }}
                >
                  Find in list
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {busyLabel ? (
          <div className="tm-busy">
            <div className="designer-spinner" aria-hidden="true" />
            <p>{busyLabel}</p>
          </div>
        ) : null}

        {nightOn && !nightSrc ? (
          <div className="tm-busy">
            {nightBusy ? (
              <>
                <div className="designer-spinner" aria-hidden="true" />
                <p>Lighting up your garden for night…</p>
              </>
            ) : (
              <>
                <p>Couldn’t create the night view.</p>
                <button type="button" className="linkish" onClick={() => onRequestNight?.()}>
                  Try again
                </button>
              </>
            )}
          </div>
        ) : null}

        <div className={"tm-grip" + (hint ? " nudge" : "")} style={{ left: `${t}%` }} aria-hidden="true">
          <span>‹ ›</span>
        </div>

        <div className="tm-stamp">
          <strong>{beat.label}</strong>
          {stampNote ? <em>{stampNote}</em> : null}
          {/* Keep later-season progress out of the install stamp to avoid stacked chips */}
          {laterNote && beat.key !== "install" && beat.key !== "now" ? (
            <em className="tm-stamp-later">{laterNote}</em>
          ) : null}
        </div>

        <div className="tm-chrome">
          <button
            type="button"
            className="tm-fs-btn"
            onClick={() => (fullscreen ? exitFullscreen() : enterFullscreen())}
            aria-label={fullscreen ? "Exit full screen" : "View full screen"}
            title={fullscreen ? "Exit full screen" : "View full screen"}
          >
            {fullscreen ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9 9H4M9 9V4M15 9h5M15 9V4M9 15H4M9 15v5M15 15h5M15 15v5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9 3H5a2 2 0 0 0-2 2v4M15 3h4a2 2 0 0 1 2 2v4M9 21H5a2 2 0 0 1-2-2v-4M15 21h4a2 2 0 0 0 2-2v-4"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            )}
            <span>{fullscreen ? "Exit" : "Full screen"}</span>
          </button>
          {bloomReady ? (
            <button
              type="button"
              className={"tm-pins-toggle" + (pins ? " on" : "")}
              onClick={() => {
                setPins((v) => !v);
                if (!pins && t <= 55) glideTo(100, 700);
              }}
            >
              {pins ? "Hide plants" : "Tap for plants"}
            </button>
          ) : null}
          {bloomReady && (nightEnabled || nightSrc) ? (
            <button
              type="button"
              className={"tm-night-toggle" + (nightOn ? " on" : "")}
              onClick={toggleNight}
              aria-pressed={nightOn}
            >
              {nightOn ? "☀️ Day view" : "🌙 Night lighting"}
            </button>
          ) : null}
        </div>
      </div>

      <div className="tm-track">
        <div className="tm-track-fill" style={{ width: `${t}%` }} />
        {BEATS.map((b) => {
          const ready = beatReady(b);
          return (
            <button
              key={b.key}
              type="button"
              className={"tm-tick" + (beat.key === b.key ? " on" : "") + (ready ? "" : " wait")}
              style={{ left: `${b.t}%` }}
              disabled={!ready && b.key !== "now"}
              onClick={() => {
                if (!ready && b.key !== "now") return;
                const target = Math.min(b.t, maxReadyT || 100);
                setHint(false);
                glideTo(target, 800);
              }}
            >
              <span className="tm-tick-dot" />
              <span className="tm-tick-label">
                <span className="tm-tick-full">{b.label}</span>
                <span className="tm-tick-short">{b.short}</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="tm-caption">
        {beat.caption}
        {hint ? <span className="tm-caption-hint"> Drag to watch it grow →</span> : null}
      </p>
    </div>
  );
}
