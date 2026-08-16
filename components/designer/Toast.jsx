"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";

const Ctx = createContext(null);

let idSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setToasts((list) => list.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    ({
      title,
      message,
      href = "/contact",
      linkLabel = "Get a free estimate",
    } = {}) => {
      const id = ++idSeq;
      setToasts((list) => [
        ...list.slice(-2),
        { id, title: title || "Added to cart", message, href, linkLabel },
      ]);
      const timer = setTimeout(() => dismiss(id), 3200);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  useEffect(() => () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current.clear();
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-relevant="additions">
        {toasts.map((t) => (
          <div className="toast" key={t.id} role="status">
            <div className="toast-body">
              <strong>{t.title}</strong>
              {t.message && <span>{t.message}</span>}
            </div>
            <div className="toast-actions">
              {t.href &&
                (String(t.href).startsWith("http") ? (
                  <a
                    href={t.href}
                    className="toast-link"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => dismiss(t.id)}
                  >
                    {t.linkLabel}
                  </a>
                ) : (
                  <Link href={t.href} className="toast-link" onClick={() => dismiss(t.id)}>
                    {t.linkLabel}
                  </Link>
                ))}
              <button type="button" className="toast-x" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}
