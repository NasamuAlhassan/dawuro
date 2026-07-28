import { HomeClient } from "@/components/HomeClient";
import {
  dayOfYear,
  getBilingualPassage,
  getVerseOfTheDayReference,
} from "@/lib/youversion";
import type { VerseResult } from "@/lib/types";

// The Word greets you — today's verse is server-rendered so Scripture is
// on screen before any JavaScript runs. Refreshed hourly; the verse
// itself changes daily.
export const revalidate = 3600;

export default async function Home() {
  let initialVotd: VerseResult | null = null;
  let initialDay: number | null = null;

  try {
    initialDay = dayOfYear();
    const usfm = await getVerseOfTheDayReference(initialDay);
    initialVotd = await getBilingualPassage(usfm, "tw");
  } catch {
    // The client hero falls back to fetching (or shows a quiet skeleton).
  }

  return <HomeClient initialVotd={initialVotd} initialDay={initialDay} />;
}
