# Phase 8 — Kaggle submission assets

Judging is **primarily the 3-minute video**, backed by writeup + public code.

---

## Deliverables checklist

- [ ] **Kaggle Writeup** — title, subtitle, ≤ **500 words**
- [ ] **Cover image**
- [ ] **Media gallery** — screenshots + video
- [ ] **Public notebook/repo**
- [ ] **Video** — ≤ **3 minutes**, public on YouTube, linked in Writeup
- [ ] **Public project link** — live `*.vercel.app`
- [ ] **Click Submit** — drafts are not judged

See **DEMO.md** for the fixed product path to record.

---

## 3-minute video — shot list

| Time | Beat |
|------|------|
| **0:00–0:20** | **The gap.** WhatsApp voice notes alive; Bible app unopened. |
| **0:20–0:50** | **Meet her.** Student in Accra, exams, anxious. Opens Dawuro. |
| **0:50–1:30** | **Product live.** Feeling → Philippians 4:6–7 EN+Twi → hear Twi → reflection. Real capture. |
| **1:30–2:00** | **It travels.** Share → WhatsApp → older woman plays audio in Twi. Hold the face. |
| **2:00–2:30** | **Scale.** Oral culture, WhatsApp, tens of millions of Twi speakers. |
| **2:30–3:00** | **Engineering.** YouVersion + Gloo + Khaya, live. End on the human. |

**Tips:** subtitles; real device; ≤ 3:00 hard stop.

---

## Writeup draft (trim to ≤ 500 words)

**Title:** Dawuro — Scripture in the Voice of Your People  

**Subtitle:** A voice-first companion that puts the Bible where Ghanaians already are — WhatsApp, voice notes, community.

**The problem.** Most Scripture apps assume English readers and a study habit. In Ghana, digital life runs on WhatsApp voice notes and images; oral culture is strong; Twi is the language of the heart. The Bible already exists in Twi on YouVersion. The gap is delivery that fits how people actually communicate.

**What we built.** Dawuro is a mobile web app: speak or type a feeling (English or Ghanaian languages), receive the most relevant verse in **English and a local language**, hear it when TTS is available, get a short faith-safe reflection, and download an **image + audio card** for WhatsApp. The receiver needs no app. Capabilities: speak-your-heart retrieval, shareable cards, daily verse as a voice note.

**How the APIs power it.**
- **YouVersion Platform API** — authoritative passages and Verse of the Day. We never invent verse text. When a language has a published Bible (e.g. Asante Twi), that text is used.  
- **Gloo AI Studio** — Completions v2 for warm, tradition-aware reflections, and optional free-text feeling→curated-reference mapping. Gloo chooses *which* verse; YouVersion supplies *the* words. Flourishing Engine safety dimensions and the `tradition` parameter matter for spiritual care.  
- **GhanaNLP Khaya** — Twi (and other) ASR/TTS, and translation for languages not yet on YouVersion (e.g. Kusaal), always labelled clearly so published Scripture stays distinct.

**Architecture.** Next.js on Vercel; secrets only in route handlers; curated feeling→verse backbone; audio prefers human narration when available else Khaya TTS; PNG cards with diacritic-safe fonts.

**Why it matters.** Tens of millions of Twi-adjacent speakers; church WhatsApp groups that already share audio; a share loop that spreads Scripture person to person with no install. Dawuro is a distribution layer for Scripture that already exists — it just needed a way to travel.

*(Trim to ≤500 words before submit.)*

---

## Pre-submit checks

- [ ] Live URL works on a phone end to end (incl. share receive)
- [ ] Both required APIs visibly used; Scripture never MT’d when YouVersion has it
- [ ] Video public, ≤3:00, linked
- [ ] Repo public; README complete
- [ ] Writeup **submitted**, not draft
