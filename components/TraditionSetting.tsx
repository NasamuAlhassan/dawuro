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

export function TraditionSetting({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[13px] font-medium text-ink">Reflection tradition</p>
      <div
        className="flex flex-wrap gap-1.5"
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
            className={`rounded-md px-2.5 py-1.5 text-[12px] font-medium transition ${
              value === opt.id
                ? "bg-ink text-surface-2"
                : "text-ink-soft ring-1 ring-line hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

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
