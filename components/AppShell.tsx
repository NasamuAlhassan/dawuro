"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { getLanguage } from "@/lib/languages";
import { useApp } from "@/lib/app-context";

const TABS = [
  {
    href: "/",
    label: "Heart",
    match: (p: string) => p === "/",
    icon: HeartIcon,
  },
  {
    href: "/today",
    label: "Today",
    match: (p: string) => p.startsWith("/today"),
    icon: SunIcon,
  },
  {
    href: "/settings",
    label: "Settings",
    match: (p: string) => p.startsWith("/settings"),
    icon: GearIcon,
  },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { language } = useApp();
  const lang = getLanguage(language);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-3 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <Link href="/" className="group min-w-0">
            <p
              className="text-[1.65rem] font-semibold leading-none tracking-tight text-brand transition group-hover:text-brand-deep"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Dawuro
            </p>
            <p className="mt-1 truncate text-[11px] text-ink-soft">
              Scripture in the voice of your people
            </p>
          </Link>
          <Link
            href="/settings"
            className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-[11px] font-semibold text-ink shadow-sm transition hover:border-gold hover:bg-gold-soft/40"
          >
            {lang.label}
            <span className="text-ink-soft"> + EN</span>
          </Link>
        </div>
        {/* Signature: town-crier gold announcement line */}
        <div
          className="h-1 w-full bg-gradient-to-r from-brand via-gold to-brand-deep opacity-90"
          aria-hidden
        />
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-5">
        {children}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] backdrop-blur-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Main"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1">
          {TABS.map((tab) => {
            const active = tab.match(pathname);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex min-h-[3.25rem] min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition ${
                  active
                    ? "text-brand"
                    : "text-ink-soft hover:text-ink"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                    active ? "bg-brand/10 text-brand" : "text-ink-soft"
                  }`}
                >
                  <Icon active={active} />
                </span>
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function HeartIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 21s-6.5-4.35-9-7.5C1.2 11.2 1.5 7.8 4 6c2-.1 3.5 1 4.5 2.2C9.5 7 11 5.9 13 6c2.5 1.2 2.8 4.6 1 7.5C11.5 16.65 12 21 12 21z" strokeLinejoin="round" />
    </svg>
  );
}

function SunIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2" : "1.8"} aria-hidden>
      <circle cx="12" cy="12" r="4" fill={active ? "currentColor" : "none"} />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}

function GearIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2" : "1.8"} aria-hidden>
      <circle cx="12" cy="12" r="3" fill={active ? "currentColor" : "none"} />
      <path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" strokeLinecap="round" />
    </svg>
  );
}
