"use client";

import { useState } from "react";

/**
 * "What's colourful when?" — twelve months of this exact plan.
 *
 * Quiet months are drawn as quiet, not padded out. That honesty is the hook:
 * the gap is real, and Annie's happens to sell the thing that fills it.
 */
export default function BloomRibbon({ ribbon, summary, gapFillers = [], onAddPlant }) {
  const thisMonth = new Date().getMonth() + 1;
  const [picked, setPicked] = useState(thisMonth);

  if (!ribbon?.months?.length) return null;
  const active = ribbon.months[picked - 1];

  return (
    <section className="rib">
      <div className="rib-head">
        <h3>What&apos;s colorful when?</h3>
        {summary ? <p>{summary}</p> : null}
      </div>

      <div className="rib-strip" role="tablist" aria-label="Colour through the year">
        {ribbon.months.map((m) => (
          <button
            key={m.month}
            type="button"
            role="tab"
            aria-selected={picked === m.month}
            className={
              "rib-col" +
              (picked === m.month ? " on" : "") +
              (m.month === thisMonth ? " now" : "") +
              (m.score === 0 ? " quiet" : "")
            }
            onClick={() => setPicked(m.month)}
          >
            <span className="rib-bars">
              {m.swatches.length ? (
                m.swatches.map((s, i) => (
                  <span key={i} className="rib-bar" style={{ background: s.hex }} />
                ))
              ) : (
                <span className={"rib-bar" + (m.evergreenOnly ? " ever" : " none")} />
              )}
            </span>
            <span className="rib-m">{m.label}</span>
          </button>
        ))}
      </div>

      <p className="rib-detail">
        <strong>{active.long}:</strong>{" "}
        {active.score > 0
          ? active.headline
          : active.evergreenOnly
            ? "Evergreen green only — structure, no flowers."
            : "Nothing blooming. Every garden has quiet months."}
      </p>

      {/* The honest upsell: here's the gap, here's the plant that fixes it. */}
      {gapFillers.length ? (
        <div className="rib-gaps">
          {gapFillers.map((g) => (
            <div className="rib-gap" key={g.sku}>
              {g.art ? <img src={g.art} alt="" /> : null}
              <div className="rib-gap-copy">
                <strong>{g.label} is quiet.</strong>
                <span>
                  Add {g.name} — ${g.price}
                </span>
              </div>
              <button type="button" className="rib-gap-add" onClick={() => onAddPlant?.(g)}>
                Add
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {ribbon.unknownCount > 0 ? (
        <p className="rib-foot">
          {ribbon.unknownCount} plant{ribbon.unknownCount === 1 ? "" : "s"} in your plan
          {ribbon.unknownCount === 1 ? " isn't" : " aren't"} on our bloom chart yet — ask us and
          we&apos;ll tell you straight.
        </p>
      ) : null}
    </section>
  );
}
