"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { getLanguage } from "@/lib/languages";
import { useApp } from "@/lib/app-context";
import { IconCalendar, IconHome, IconSliders } from "@/components/ui/Icons";

const TABS = [
  {
    href: "/",
    label: "Home",
    match: (p: string) => p === "/",
    Icon: IconHome,
  },
  {
    href: "/today",
    label: "Today",
    match: (p: string) => p.startsWith("/today"),
    Icon: IconCalendar,
  },
  {
    href: "/settings",
    label: "Settings",
    match: (p: string) => p.startsWith("/settings"),
    Icon: IconSliders,
  },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { language } = useApp();
  const lang = getLanguage(language);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-3 px-5 pb-3.5 pt-[max(0.85rem,env(safe-area-inset-top))]">
          <Link href="/" className="min-w-0">
            <p
              className="text-[1.5rem] font-semibold leading-none tracking-[-0.02em] text-ink"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Dawuro
            </p>
            <p className="mt-1 text-[12px] leading-none text-ink-soft">
              Scripture, spoken and shared
            </p>
          </Link>
          <Link
            href="/settings"
            className="shrink-0 rounded-md border border-line bg-surface-2 px-2.5 py-1.5 text-[12px] font-medium text-ink transition hover:border-line-strong"
          >
            {lang.label}
            <span className="text-ink-faint"> · EN</span>
          </Link>
        </div>
        <div className="h-px w-full bg-brand/80" aria-hidden />
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-5 pb-[calc(5.25rem+env(safe-area-inset-bottom))] pt-6">
        {children}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface-2/95 backdrop-blur-sm"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Main"
      >
        <div className="mx-auto grid max-w-lg grid-cols-3">
          {TABS.map((tab) => {
            const active = tab.match(pathname);
            const { Icon } = tab;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex min-h-[3.4rem] flex-col items-center justify-center gap-1 text-[11px] font-medium tracking-wide transition ${
                  active ? "text-brand" : "text-ink-faint hover:text-ink-soft"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon solid={active} size={20} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
