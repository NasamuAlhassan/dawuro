# Dawuro

**Scripture in the voice of your people.**

A mobile-first web app for the *Scripture in New Frontiers* hackathon (YouVersion + Gloo AI).  
Speak or type a feeling in English or Twi → receive a real Bible verse in **both languages** →  
hear it in Twi → get a short faith-safe reflection → share an image + audio card on WhatsApp.  
**The receiver needs no app.**

---

## What it does

1. **Speak-your-heart verse retrieval** — type or speak a feeling → best-matching verse in English + Twi  
2. **Shareable audio + image cards** — PNG card + Twi audio clip for WhatsApp  
3. **Daily verse as a voice note** — YouVersion Verse of the Day, bilingual, shareable  

### Non-negotiables

| Rule | How we uphold it |
|------|------------------|
| **Never machine-translate Scripture** | Twi text comes only from YouVersion (ASNA). Khaya is for voice + optional reflection translation only. |
| **Both required APIs do real work** | YouVersion = Scripture; Gloo = contextual reflection + `tradition`. |
| **Receiver needs nothing** | Share PNG + audio; open/play without login or app install. |
| **Secrets stay server-side** | All keys in Route Handlers / `.env.local` only. Never `NEXT_PUBLIC_*` for secrets. |

---

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS  
- **YouVersion Platform API** — passages, Verse of the Day (EN BSB + Twi ASNA)  
- **Gloo AI Studio** — Completions v2 reflections, `tradition` parameter  
- **GhanaNLP Khaya** — Twi ASR (voice in) + TTS (voice out)  
- **html-to-image** — shareable PNG cards  
- **Deploy target:** Vercel  

---

## Quick start

```bash
# Node 18+ recommended
cd dawuro
cp .env.example .env.local
# Edit .env.local with real keys (see below)

npm install
npm run dev          # http://localhost:3000
```

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |

### Health check

```bash
curl http://localhost:3000/api/health
```

Returns which keys are present and whether Twi passage access works (never returns secret values).

---

## Environment variables

Copy `.env.example` → `.env.local`. **Never commit `.env.local`.**

| Variable | Required | Source |
|----------|----------|--------|
| `YVP_APP_KEY` | Yes | [platform.youversion.com](https://platform.youversion.com/) — register app |
| `KHAYA_API_KEY` | Yes | [translation.ghananlp.org](https://translation.ghananlp.org/) / [studio.khaya.ai](https://studio.khaya.ai/) |
| `GLOO_CLIENT_ID` | For reflections | [studio.ai.gloo.com](https://studio.ai.gloo.com/) → API Credentials |
| `GLOO_CLIENT_SECRET` | For reflections | same |
| `NEXT_PUBLIC_APP_NAME` | Optional | Defaults to `Dawuro` |
| `NEXT_PUBLIC_APP_URL` | Optional | Public URL for Open Graph (set on Vercel) |

All vendor keys are **server-side only**. Do not prefix them with `NEXT_PUBLIC_`.

### YouVersion: accept the Biblica Fast-track license

Twi Bibles (ASNA #2094, AKNA #1631) require accepting the **Biblica Fast-track Bible License** in the YouVersion developer portal. Without it, passage requests return 403.  
English BSB works without that step; bilingual mode needs the license.

1. Open [platform.youversion.com](https://platform.youversion.com/)  
2. Licenses / Fast-track → accept **Biblica**  
3. Re-check `GET /api/health` → `twiAccess.ok: true`  

---

## Architecture (pipeline)

```
Client (phone)
  type feeling  OR  mic (EN: Web Speech / Twi: MediaRecorder)
       │                      │
       │                      ▼
       │              POST /api/transcribe  → Khaya ASR
       │                      │
       ▼                      ▼
              POST /api/verse  → curated map + YouVersion EN+Twi
                      │
                      ▼
              POST /api/reflect → Gloo Completions v2 (optional if no keys)
                      │
                      ▼
              POST /api/speak   → YouVersion pro audio URL or Khaya TTS
                      │
                      ▼
              ShareSheet → PNG (html-to-image) + audio → WhatsApp
```

Also: `GET /api/votd` — Verse of the Day in EN + Twi.

### Key files

| Path | Role |
|------|------|
| `lib/youversion.ts` | Scripture fetch, VOTD, bilingual passages |
| `lib/verses.ts` | Feeling → USFM map (theological backbone) |
| `lib/gloo.ts` | OAuth token cache + Completions v2 |
| `lib/khaya.ts` | TTS / ASR / translate wrappers + timeouts |
| `lib/card.ts` | PNG render helpers |
| `app/api/*/route.ts` | Thin HTTP glue; secrets never leave the server |
| `components/*` | Mobile-first UI |

---

## Deploy (Vercel)

1. Push this repo to **public** GitHub (required for the hackathon).  
2. Import the project in [Vercel](https://vercel.com).  
3. Set environment variables in **Project → Settings → Environment Variables**  
   (Production + Preview): `YVP_APP_KEY`, `KHAYA_API_KEY`, `GLOO_CLIENT_ID`,  
   `GLOO_CLIENT_SECRET`, optionally `NEXT_PUBLIC_APP_URL`.  
4. Deploy → public `*.vercel.app` URL.  
5. Smoke-test **on a phone**: type/speak → verse (EN+Twi) → play audio → reflection → share.  

Do **not** rely on `.env.local` in production; dashboard env vars only.

```bash
# Optional CLI deploy (after vercel login + link)
npx vercel --prod
```

---

## API credits & licensing

- **Scripture text:** YouVersion Platform API. Publisher attribution (e.g. Biblica © for Asante Twi Nkwa Asɛm / ASNA; Berean Standard Bible for English) is shown on every verse card and share image.  
- **AI reflections:** [Gloo AI Studio](https://studio.ai.gloo.com/) — Completions v2, tradition-aligned, Flourishing Engine safety dimensions.  
- **Voice:** [GhanaNLP Khaya](https://translation.ghananlp.org/) — Twi ASR and TTS.  
- **Name:** *Dawuro* (Akan) — the town crier’s announcement.  

Prefer openly licensed / Fast-track–approved Bibles for production redistribution.  

---

## Testing checklist (local)

- [ ] `npm run build` succeeds  
- [ ] `GET /api/health` — core keys present; Twi access OK after Biblica license  
- [ ] Type `anxious` → Philippians 4:6–7 (or similar) in **English + Twi** + attribution  
- [ ] VOTD loads on home  
- [ ] ▶ Hear in Twi plays audio (Khaya TTS)  
- [ ] Reflection appears when Gloo keys are set; soft skip when not  
- [ ] Settings → tradition (evangelical / catholic / mainline)  
- [ ] Mic: EN and Twi; transcript editable; failures fall back to typing  
- [ ] Share → PNG + audio download or native share sheet  
- [ ] Diacritics ɛ ɔ render on screen and on the shared image  

---

## Project status

Built phase-by-phase per the parent spec pack (`YouVersion/09_BUILD_PHASES.md`).

| Phase | Status |
|-------|--------|
| 0 Scaffold | Done |
| 1 Scripture spine | Done (needs Biblica license for live Twi) |
| 2 Gloo reflection | Done (needs Gloo keys for live calls) |
| 3 Voice out | Done |
| 4 Voice in | Done |
| 5 Share loop | Done |
| 6 PWA / polish | Done |
| 7 Deploy | README ready — set env on Vercel & deploy when you choose |
| 8 Submission assets | See `docs/SUBMISSION.md` |

---

## License

Hackathon submission code. If you win, plan for an OSI-approved open-source license as required by the competition. Scripture remains under its publishers’ licenses.
