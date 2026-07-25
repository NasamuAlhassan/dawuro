# Kaggle submission assets

Judging weights: Impact & Vision 40 / Video 30 / Technical Depth 30.
The writeup below is 435 words — buffer under the 500-word limit. Do not let edits push it past 450.

---

## Deliverables checklist

- [ ] **Kaggle Writeup** — title, subtitle, the writeup below (≤500 words)
- [ ] **Cover image**
- [ ] **Media gallery** — screenshots + video
- [ ] **Public notebook/repo**
- [ ] **Video** — ≤ **3 minutes**, public on YouTube, linked in Writeup
- [ ] **Public project link** — live `*.vercel.app` (with `NEXT_PUBLIC_APP_URL` set)
- [ ] **Click Submit** — drafts are not judged

See **DEMO.md** for the fixed product path to record.

---

## 3-minute video — shot list

| Time | Beat |
|------|------|
| **0:00–0:20** | **The gap.** WhatsApp voice notes alive; Bible app unopened. |
| **0:20–0:45** | **Meet her.** Student in Accra, exams, anxious. Opens Dawuro. |
| **0:45–1:20** | **Product live.** Feeling → Philippians 4:6–7 EN+Twi → hear Twi → reflection. Real capture. |
| **1:20–1:50** | **It travels.** Share → WhatsApp → on the second phone the link unfurls as a verse card in the chat. Older woman taps it, plays the Twi audio. Hold the face. |
| **1:50–2:15** | **The reply.** Same page: "Your turn — what's on your heart?" She speaks, gets her own verse, sends it back into the thread. Scripture as conversation. |
| **2:15–2:40** | **Scale.** Oral culture, WhatsApp groups, tens of millions of speakers, zero-install loop. |
| **2:40–3:00** | **Engineering.** YouVersion + Gloo + Khaya, live network tab. End on the human. |

**Tips:** subtitles; real devices; ≤ 3:00 hard stop.

---

## Writeup (435 words — final)

**Title:** Dawuro — Scripture as Conversation on WhatsApp

**Subtitle:** Speak a feeling, receive a verse in the language of your heart, send it on — and whoever opens it replies with a verse of their own. No app on either side.

**The gap.** The brief says the goal is not another Bible app. Good — Ghana does not need one. Digital life here runs through WhatsApp voice notes: short, spoken, person to person. Oral culture is strong, and Twi, Ewe, or Dagbani is the language of the heart even when English is the language of school. The Bible already exists in these languages on YouVersion. What is missing is Scripture that moves the way conversation moves.

**The loop.** Dawuro (Akan: the town crier's gong) is a mobile web app built around one round trip. You speak or type a feeling — "I'm anxious about my exams" — in English or a Ghanaian language. A verse comes back in English and your language, spoken aloud, with a short pastoral reflection. You share it on WhatsApp: an image card, an audio clip, and a link. That link unfurls in the chat as a verse card. The person who taps it needs no app and no login — the verse renders in their browser, they press play, and then the page asks: your turn, what is on your heart? They answer, get their own verse, and send it back into the same thread. The receiver is a user. Scripture becomes a conversation, not a broadcast.

**How the APIs power it.** Gloo AI is the brain: its faith-tuned model reads the feeling and chooses the best verse — but only from a curated allow-list, validated server-side, so it can choose Scripture yet never write it. Gloo's Completions v2 also writes the reflection, tuned by tradition (evangelical, catholic, mainline). YouVersion Platform API is the only source of Scripture words: English (BSB) plus published local Bibles like Asante Twi (ASNA). GhanaNLP Khaya is the voice — speech recognition for feelings spoken in Twi, Ewe, Ga, Dagbani, Kusaal, or Yorùbá, and text-to-speech so the verse is heard, not just read.

**The guardrails.** Published Scripture is never machine-translated. When a language has no Bible on YouVersion — Kusaal, Ga, Dagbani — the local text is a clearly labelled Khaya translation of the YouVersion English verse, and English remains the published Scripture. Publisher attribution appears on every card, share image, and link preview. If Gloo is offline, a curated keyword map answers instead; the loop never breaks.

**The scale.** Church WhatsApp groups already pass audio hand to hand. Tens of millions of people speak the nineteen languages Dawuro serves today. Every shared verse carries its own zero-install invitation to reply, so each conversation seeds the next one. Dawuro is a delivery path for Scripture that already exists — built for the way people already talk.

---

## Pre-submit checks

- [ ] Live URL works on a phone end to end (incl. opening the receive link and replying)
- [ ] `NEXT_PUBLIC_APP_URL` set on Vercel — receive links and WhatsApp previews depend on it
- [ ] Both required APIs visibly used; Scripture never MT'd when YouVersion has it
- [ ] Video public, ≤3:00, linked
- [ ] Repo public; README complete
- [ ] Attach public notebook (`notebook/dawuro-architecture.ipynb`)
- [ ] Writeup **submitted**, not draft
