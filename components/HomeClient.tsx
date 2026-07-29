"use client";

import Link from "next/link";
import type { VerseResult } from "@/lib/types";
import { VotdHero } from "@/components/VotdHero";
import { IconMic } from "@/components/ui/Icons";

type Props = {
  initialVotd: VerseResult | null;
  initialDay: number | null;
};

/**
 * Home: today's verse, big and playable — and one door to the heart.
 */
export function HomeClient({ initialVotd, initialDay }: Props) {
  return (
    <div className="flex flex-1 flex-col gap-8">
      <VotdHero initialVotd={initialVotd} initialDay={initialDay} />

      <Link
        href="/heart"
        className="flex min-h-16 items-center justify-center gap-3 rounded-[var(--radius)] border border-brand/25 bg-surface-2 px-5 text-[17px] font-semibold text-brand transition hover:border-brand/50 hover:bg-surface"
        style={{ fontFamily: "var(--font-display), serif" }}
      >
        <IconMic size={22} />
        What&apos;s on your heart?
      </Link>
    </div>
  );
}
