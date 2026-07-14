"use client";

import type { Reflection } from "@/lib/types";
import { IconLoader } from "@/components/ui/Icons";

type Props = {
  reflection: Reflection;
  loading?: boolean;
};

export function ReflectionBlock({ reflection, loading }: Props) {
  if (loading) {
    return (
      <section className="dawuro-panel px-4 py-4" aria-busy="true">
        <p className="text-[11px] font-medium tracking-wide text-ink-faint">
          Reflection
        </p>
        <p className="mt-2 flex items-center gap-2 text-[13px] text-ink-soft">
          <IconLoader size={14} className="dawuro-spin" />
          Writing a short word…
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[var(--radius)] border border-line bg-surface px-4 py-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-medium tracking-wide text-ink-faint">
          Reflection
        </p>
        {reflection.tradition && (
          <p className="text-[11px] capitalize text-ink-faint">
            {reflection.tradition}
          </p>
        )}
      </div>
      {reflection.local && (
        <p className="mt-2 text-[14px] leading-relaxed text-ink">
          {reflection.local}
        </p>
      )}
      <p
        className={`text-[14px] leading-relaxed ${reflection.local ? "mt-3 text-ink-soft" : "mt-2 text-ink"}`}
      >
        {reflection.english}
      </p>
      <p className="mt-3 text-[10px] text-ink-faint">
        Pastoral reflection — not Scripture
        {reflection.local ? " · local via Khaya" : ""}.
      </p>
    </section>
  );
}

export function ReflectionSkipped({ reason }: { reason?: string }) {
  return (
    <section className="rounded-[var(--radius)] border border-dashed border-line px-4 py-3">
      <p className="text-[12px] text-ink-soft">
        {reason || "Reflection will appear once Gloo is connected."}
      </p>
    </section>
  );
}
