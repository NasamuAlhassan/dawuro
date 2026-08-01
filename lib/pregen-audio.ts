/**
 * Pre-generated Scripture audio — offline, no API, no quota.
 *
 * Dawuro's verses come from fixed sets (the curated topical map + the
 * yearly Verse of the Day), so we synthesize them once with Meta's open
 * MMS models and ship the clips as static assets. Twi audio then survives
 * any vendor outage — the play button always works for these verses.
 *
 * Files live at public/audio/{lang}/{file}; the manifest maps a USFM
 * reference to its filename per language.
 */

import manifest from "@/public/audio/manifest.json";

type Manifest = Record<string, Record<string, string>>;

const covered = manifest as Manifest;

/** Static URL for a pre-generated clip, or null when not covered. */
export function pregeneratedAudioUrl(
  langId: string,
  usfm: string,
): string | null {
  const file = covered[langId]?.[usfm];
  return file ? `/audio/${langId}/${file}` : null;
}
