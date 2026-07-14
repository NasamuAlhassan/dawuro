# Phase 8 — Kaggle submission assets

Judging is **primarily the 3-minute video**, backed by writeup + public code.  
Product first (Phases 0–7); these assets showcase it.

---

## Deliverables checklist

- [ ] **Kaggle Writeup** — title, subtitle, ≤ **500 words** (over-limit may be penalised)
- [ ] **Cover image** (required to submit the Writeup)
- [ ] **Media gallery** — screenshots + video
- [ ] **Public notebook/repo** — no login/paywall
- [ ] **Video** — ≤ **3 minutes**, **public on YouTube**, link in Writeup
- [ ] **Public project link** — live `*.vercel.app` (or public GitHub with setup)
- [ ] **Click Submit** — draft Writeups are **not** judged

> One submission per team. Ghana is eligible. Foreign winners file IRS **W-8BEN**.  
> Winning code is licensed open-source (OSI-approved).

---

## 3-minute video — shot list

Tell one person's story. Real, specific, Ghanaian. **Show the product working** (screen capture, not mockups).

| Time | Beat |
|------|------|
| **0:00–0:20** | **The gap.** WhatsApp alive with voice notes; Bible app icon unopened. VO: *billions live in digital spaces where Scripture never shows up — not because it doesn't belong, but because no one built the bridge.* |
| **0:20–0:50** | **Meet her.** Student in Accra, exam results tomorrow, anxious, scrolling. Opens Dawuro. |
| **0:50–1:30** | **Product live.** Speaks *me yɛ suro* (I'm afraid). Listening → transcript → verse in **Twi + English** (e.g. Philippians 4:6–7). Warm voice reads **in Twi**. Reflection appears. Real phone capture. |
| **1:30–2:00** | **It travels.** Share → card + audio. Sends to church WhatsApp group. Older woman who reads little English presses play, hears the Word in **Twi**. Hold on her face. |
| **2:00–2:30** | **Scale.** Tens of millions of Twi speakers; WhatsApp-active continent; Scripture already in their language — needed a way to move. |
| **2:30–3:00** | **Engineering.** Live app, code, real API responses: **YouVersion**, **Gloo**, **Khaya**. VO: real, working technology — verified, ready to scale. End on the human, not a logo. |

**Tips:** vertical or clean 16:9; real device; **subtitles** (some judges watch muted); energy up; ≤ 3:00 hard stop.

---

## Writeup skeleton (trim to ≤ 500 words)

**Title:** Dawuro — Scripture in the Voice of Your People  

**Subtitle:** A voice-first Scripture companion that puts the Bible where Ghanaians already are — WhatsApp, voice notes, community.

### The problem (≈80 words)

Scripture tech assumes English readers with smartphones and a reading habit. In Ghana, digital life runs on WhatsApp voice notes and images; oral culture is strong; Twi is the language of the heart even where English is the language of school. The Bible already exists in Twi on YouVersion. The gap isn't content — it's a delivery mechanism that fits how people actually communicate.

### What we built (≈110 words)

Dawuro is a mobile web app where you speak or type a feeling in English or Twi, receive the most relevant verse in **both languages**, hear it read **in Twi**, get a short faith-safe reflection, and download a **shareable audio + image card** for WhatsApp. The receiver needs no app. Core loop: speak-your-heart retrieval, shareable cards, and daily-verse voice notes.

### How the APIs power it (≈140 words)

- **YouVersion Platform API** — authoritative Scripture: passages + Verse of the Day in English and Asante Twi (ASNA). We **never machine-translate Scripture** — Twi text is a real published Bible.  
- **Gloo AI Studio API** — Completions v2 generates a short, warm, contextual reflection, aligned to a Christian **tradition** and passed through the Flourishing Engine's six safety dimensions (physical, ethical, emotional, factual, theological, security).  
- **GhanaNLP Khaya API** — Twi **ASR** (voice input) and Twi **TTS** (audio output) so the experience is genuinely voice-first for oral-first users.

### Architecture (≈40 words)

Next.js on Vercel; keys server-side; thin route handlers per vendor; curated feeling→verse backbone; audio prefers YouVersion pro narration then Khaya TTS; cards rendered to PNG with diacritic-safe fonts.

### Why it matters / scale (≈60 words)

Tens of millions of Twi-adjacent speakers; church infrastructure that already distributes audio; a share loop that spreads Scripture person to person with no install. Dawuro is a distribution layer for Scripture that already exists — it just needed a way to travel.

*(Trim every sentence so the whole writeup stays ≤ 500 words.)*

---

## Cover image ideas

- Phone mock showing Twi + English verse card on warm gold/terracotta background  
- Wordmark **Dawuro** + tagline  
- Export from the app’s shareable card at high resolution  

Suggested file: `public/og.png` or a dedicated 16:9 / square cover for Kaggle.

---

## Pre-submit final checks

- [ ] Live URL works on a **phone**, end to end, on a **slow** connection  
- [ ] Video public on YouTube, ≤ 3:00, linked in Writeup  
- [ ] Repo/notebook public — no login/paywall  
- [ ] Cover image + media attached  
- [ ] Both required APIs visibly used; Scripture never MT’d  
- [ ] Attribution (Biblica ©, API credits) in app + README  
- [ ] **Writeup submitted**, not left as draft  

---

## After you unlock APIs

1. Accept **Biblica Fast-track** on YouVersion → bilingual verses work.  
2. Add **Gloo** keys when card works → live reflections.  
3. Deploy to Vercel with env vars in the dashboard.  
4. Record the video on the **live** URL.  
5. Fill writeup from this skeleton; submit.
