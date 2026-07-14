# Dawuro

**Scripture in the voice of your people.**

A mobile-first web app for the *Scripture in New Frontiers* hackathon (YouVersion + Gloo AI).  
Speak or type a feeling → receive a real Bible verse in **English + your language** →  
hear it aloud (where TTS is available) → get a short faith-safe reflection → share an image + audio card on WhatsApp.  
**The receiver needs no app.**

### Languages

English (BSB) always appears as the companion side. **Scripture is never machine-translated.**

#### Ghana (priority)

| Code | Language | Scripture (YouVersion) | Hear ♪ | Speak 🎤 |
|------|----------|------------------------|--------|----------|
| `tw` | Asante Twi | ASNA #2094 | Yes | Yes |
| `ak` | Akuapem Twi | AKNA #1631 | Yes (Twi TTS) | Yes |
| `ee` | Ewe | ECS #1613 | Yes | Yes |
| `gaa` | Ga | proxy → Asante Twi* | — | Yes |
| `fat` | Fante | Asante Twi (Akan)* | Yes (Twi TTS) | — |
| `dag` | Dagbani | proxy → Asante Twi* | — | Yes |
| `kus` | Kusaal | Khaya from EN* | — | Yes (Khaya ASR) |
| `gur` | Gurene (Ninkare) | NT #1323 | — | type |
| `gjn` | Gonja | #1729 | — | type |
| `xsm` | Kasem | NT #1303 | — | type |
| `sil` | Sisaala | #2553 | — | type |

\* **No YouVersion Bible** → English verse from YouVersion (authoritative) + **local text via Khaya translate**. Feelings in that language can use ASR (when available) or type → Khaya → English for verse mapping. Reflections can also be Khaya-translated. Clear UI label: not a published Bible.

#### Wider region

| Code | Language | Scripture | Hear ♪ |
|------|----------|-----------|--------|
| `yo` | Yoruba | YCB #911 | — |
| `ha` | Hausa | HCB #1614 | — |
| `ig` | Igbo | ICB #1624 | — |
| `ki` | Gĩkũyũ | GKY #1622 | Yes |
| `sw` | Kiswahili | Neno #1627 | — |
| `luo` | Dholuo | proxy → Swahili* | — |
| `mer` | Kimeru | proxy → Gĩkũyũ* | — |
| `fr` | Français | Segond #93 | — |

**Khaya voice:** TTS = Twi, Ewe, Gĩkũyũ · ASR wired for Twi, Ewe, Ga, Dagbani, **Kusaal** · Translate includes Kusaal, Fante, Gurene, and more.

---

## What it does

1. **Speak-your-heart verse retrieval** — type or speak a feeling → best-matching verse in English + Twi  
2. **Shareable audio + image cards** — PNG card + Twi audio clip for WhatsApp  
3. **Daily verse as a voice note** — YouVersion Verse of the Day, bilingual, shareable  

### Non-negotiables

| Rule | How we uphold it |
|------|------------------|
| **Never machine-translate Scripture** | When YouVersion has a published Bible, that text is used. Khaya local text is only for languages without a YouVersion Bible, and is clearly labelled. |
| **Both required APIs do real work** | YouVersion = Scripture; Gloo = reflection + optional free-text→curated-verse mapping + `tradition`. |
| **Receiver needs nothing** | Share PNG + audio; open/play without login or app install. |
| **Secrets stay server-side** | All keys in Route Handlers / `.env.local` only. Never `NEXT_PUBLIC_*` for secrets. |

---

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS  
- **YouVersion Platform API** — passages, Verse of the Day (EN BSB + Twi ASNA)  
- **Gloo AI Studio** — Completions v2 reflections, `tradition`, feeling→curated reference mapping  
- **GhanaNLP Khaya** — ASR / TTS / translate for Ghanaian & African languages  
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
curl -s http://localhost:3000/api/health | jq .
```

Returns which keys are present and whether Twi / Khaya paths work (never returns secret values).  
Want: `keys.glooPresent: true`, `twiAccess.ok: true` after Biblica license.

### Demo path

See [docs/DEMO.md](docs/DEMO.md) — fixed flow for video (anxious → Philippians 4:6–7 → share).

### Deploy (Vercel)

1. Push repo to public GitHub  
2. Import in Vercel; set env vars in the dashboard (Production + Preview):  
   `YVP_APP_KEY`, `GLOO_CLIENT_ID`, `GLOO_CLIENT_SECRET`, `KHAYA_API_KEY`,  
   optional `NEXT_PUBLIC_APP_URL`  
3. Deploy → smoke-test on a phone: type → verse EN+Twi → play → reflect → share  
4. Use that URL for the Kaggle “public project link”  

**Human steps you still own:** Biblica license, Gloo billing/keys, YouTube video, Kaggle submit.

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
