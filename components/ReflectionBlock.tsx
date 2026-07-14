"use client";

import type { Reflection } from "@/lib/types";

type Props = {
  reflection: Reflection;
  loading?: boolean;
};

/**
 * Gloo reflection — clearly labelled so it is never mistaken for Scripture.
 */
export function ReflectionBlock({ reflection, loading }: Props) {
  if (loading) {
    return (
      <section
        className="rounded-2xl border border-dashed border-line bg-gold-soft/30 px-5 py-4"
        aria-busy="true"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-gold">
          Reflection
        </p>
        <p className="mt-2 text-sm text-ink-soft">Gathering a quiet word…</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-line bg-gold-soft/35 px-5 py-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gold">
          Reflection
        </p>
        {reflection.tradition && (
          <p className="text-[10px] capitalize text-ink-soft">
            {reflection.tradition}
          </p>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink">
        {reflection.english}
      </p>
      <p className="mt-3 text-[10px] text-ink-soft">
        A pastoral reflection — not Scripture.
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
