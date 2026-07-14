/** Shared types for Dawuro — used by API routes and UI components. */

export type Tradition = "evangelical" | "catholic" | "mainline";

export type VerseResult = {
  reference: string; // canonical USFM, e.g. "PHP.4.6-7"
  humanReference: string; // display, e.g. "Philippians 4:6-7"
  english: { versionId: string; text: string; copyright?: string };
  twi: { versionId: string; text: string; copyright?: string; audioUrl?: string };
};

export type Reflection = {
  english: string; // 2–3 sentences from Gloo
  twi?: string; // optional, via Khaya (reflection only — never Scripture)
  tradition?: Tradition;
};

export type ShareCard = {
  verse: VerseResult;
  reflection?: Reflection;
  imageDataUrl: string; // rendered PNG (html-to-image)
  audioUrl: string; // Twi verse audio (YouVersion pro or Khaya TTS)
};

export type InputLanguage = "en" | "tw";
