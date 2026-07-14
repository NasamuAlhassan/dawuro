"use client";

import { LanguageSetting } from "@/components/LanguageSetting";
import { TraditionSetting } from "@/components/TraditionSetting";
import { useApp } from "@/lib/app-context";

export default function SettingsPage() {
  const { language, setLanguage, tradition, setTradition } = useApp();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <section className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
          Settings
        </p>
        <h2
          className="text-[1.75rem] font-semibold leading-tight tracking-tight text-ink"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Make it yours
        </h2>
        <p className="text-sm leading-relaxed text-ink-soft">
          Choose the language of Scripture and the tone of reflections.
        </p>
      </section>

      <section className="dawuro-card space-y-5 p-4 sm:p-5">
        <LanguageSetting value={language} onChange={setLanguage} />
      </section>

      <section className="dawuro-card space-y-4 p-4 sm:p-5">
        <TraditionSetting value={tradition} onChange={setTradition} />
        <p className="text-[11px] leading-relaxed text-ink-soft">
          Tradition shapes Gloo AI reflections only. Verse text always comes
          from YouVersion (or is clearly labelled when Khaya renders a language
          not yet on YouVersion).
        </p>
      </section>

      <section className="dawuro-card space-y-2 p-4 sm:p-5">
        <h3
          className="text-sm font-semibold text-ink"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          About Dawuro
        </h3>
        <p className="text-xs leading-relaxed text-ink-soft">
          <em>Dawuro</em> is the town crier&apos;s announcement — the message
          meant to be heard. Scripture via YouVersion · Reflection via Gloo AI ·
          Voice via GhanaNLP Khaya.
        </p>
        <p className="text-[11px] text-ink-soft">
          Publisher copyrights are shown with each verse.
        </p>
      </section>
    </div>
  );
}
