"use client";

import type { Reflection } from "@/lib/types";

type Props = {
  reflection: Reflection;
  loading?: boolean;
};

export function ReflectionBlock({ reflection, loading }: Props) {
  if (loading) {
    return (
      <section className="dawuro-card border-dashed px-5 py-4" aria-busy="true">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gold">
          Reflection
        </p>
        <p className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gold" />
          Gathering a quiet word…
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gold/30 bg-gold-soft/40 px-5 py-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-deep">
          Reflection
        </p>
        {reflection.tradition && (
          <p className="text-[10px] capitalize text-ink-soft">
            {reflection.tradition}
          </p>
        )}
      </div>
      {reflection.local && (
        <p className="mt-2 text-sm leading-relaxed text-ink">
          {reflection.local}
        </p>
      )}
      <p
        className={`text-sm leading-relaxed ${reflection.local ? "mt-3 text-ink-soft" : "mt-2 text-ink"}`}
      >
        {reflection.english}
      </p>
      <p className="mt-3 text-[10px] text-ink-soft">
        Pastoral reflection — not Scripture
        {reflection.local ? " · local via Khaya" : ""}.
      </p>
    </section>
  );
}

export function ReflectionSkipped({ reason }: { reason?: string }) {
  return (
    <section className="rounded-2xl border border-dashed border-line px-5 py-3">
      <p className="text-xs text-ink-soft">
        {reason ||
          "Reflection will appear here once Gloo AI is connected."}
      </p>
    </section>
  );
}
