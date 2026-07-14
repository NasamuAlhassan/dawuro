"use client";

import { useEffect, useState } from "react";
import type { Tradition } from "@/lib/types";

const STORAGE_KEY = "dawuro_tradition";

const OPTIONS: { id: Tradition; label: string }[] = [
  { id: "evangelical", label: "Evangelical" },
  { id: "catholic", label: "Catholic" },
  { id: "mainline", label: "Mainline" },
];

export function loadTradition(): Tradition {
  if (typeof window === "undefined") return "evangelical";
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "catholic" || v === "mainline" || v === "evangelical") return v;
  return "evangelical";
}

type Props = {
  value: Tradition;
  onChange: (t: Tradition) => void;
};

/**
 * Subtle tradition selector — feeds Gloo's `tradition` parameter.
 */
export function TraditionSetting({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-soft">
        Reflection tradition
      </p>
      <div
        className="inline-flex flex-wrap gap-1 rounded-full border border-line bg-surface p-0.5"
        role="radiogroup"
        aria-label="Christian tradition for reflections"
      >
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={value === opt.id}
            onClick={() => {
              onChange(opt.id);
              try {
                window.localStorage.setItem(STORAGE_KEY, opt.id);
              } catch {
                /* ignore */
              }
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              value === opt.id
                ? "bg-brand text-white"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Hook for pages that need persisted tradition. */
export function useTradition(): [Tradition, (t: Tradition) => void] {
  const [tradition, setTradition] = useState<Tradition>("evangelical");

  useEffect(() => {
    setTradition(loadTradition());
  }, []);

  function update(t: Tradition) {
    setTradition(t);
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
  }

  return [tradition, update];
}
