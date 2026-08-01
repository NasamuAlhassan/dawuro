"use client";

import { LanguageSetting } from "@/components/LanguageSetting";
import { TraditionSetting } from "@/components/TraditionSetting";
import { NotificationSetting } from "@/components/NotificationSetting";
import { useApp } from "@/lib/app-context";

export default function SettingsPage() {
  const { language, setLanguage, tradition, setTradition } = useApp();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="space-y-2">
        <h1
          className="text-[1.65rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          Settings
        </h1>
        <p className="max-w-[36ch] text-[14px] leading-relaxed text-ink-soft">
          Language of Scripture, daily reminders, and tone of reflections.
        </p>
      </header>

      <section className="dawuro-card p-4 sm:p-5">
        <LanguageSetting value={language} onChange={setLanguage} />
      </section>

      <section className="dawuro-card p-4 sm:p-5">
        <NotificationSetting />
      </section>

      <section className="dawuro-card space-y-3 p-4 sm:p-5">
        <TraditionSetting value={tradition} onChange={setTradition} />
        <p className="text-[12px] leading-relaxed text-ink-soft">
          Tradition only affects Gloo reflections. Verse text comes from
          YouVersion when available, or is clearly labelled when Khaya renders
          a language not yet on YouVersion.
        </p>
      </section>

      <section className="dawuro-panel space-y-2 p-4 sm:p-5">
        <h2
          className="text-[14px] font-semibold text-ink"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          About
        </h2>
        <p className="text-[12px] leading-relaxed text-ink-soft">
          Dawuro means the town crier&apos;s call — a message for everyone.
          Every verse you share carries a link: whoever opens it hears the
          verse and can send one back. Scripture from YouVersion · Reflection
          from Gloo AI · Voice from GhanaNLP Khaya. Publisher credits appear
          with each verse.
        </p>
      </section>
    </div>
  );
}
