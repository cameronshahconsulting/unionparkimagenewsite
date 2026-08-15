"use client";

/**
 * "Not this one?" — one-tap substitutes for a single line item.
 * Candidates come from real in-stock inventory in the same category and price
 * band, so a swap can never break the budget or the look.
 */
export default function SwapDrawer({ item, onSwap, onClose }) {
  if (!item) return null;
  const options = item.swaps || [];

  return (
    <div className="swap" role="dialog" aria-label={`Swap ${item.name}`}>
      <div className="swap-head">
        <div>
          <strong>Swap {item.name}</strong>
          <span>Same spot in the bed, same kind of plant.</span>
        </div>
        <button type="button" className="swap-x" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      {options.length ? (
        <div className="swap-list">
          {options.map((o) => (
            <button key={o.sku} type="button" className="swap-opt" onClick={() => onSwap(item, o)}>
              {o.art ? <img src={o.art} alt="" /> : <span className="swap-noart" />}
              <span className="swap-opt-copy">
                <strong>{o.name}</strong>
                <span>{o.size}</span>
              </span>
              <span className="swap-opt-price">
                ${o.price}
                {o.delta !== 0 ? (
                  <em className={o.delta > 0 ? "up" : "down"}>
                    {o.delta > 0 ? "+" : "−"}${Math.abs(o.delta)}
                  </em>
                ) : (
                  <em className="same">same</em>
                )}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="swap-empty">
          Nothing else in stock quite like this one right now — it&apos;s a good pick.
        </p>
      )}
    </div>
  );
}
