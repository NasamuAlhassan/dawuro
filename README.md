# Dawuro

**Scripture as conversation, for WhatsApp voice-note culture.**

Dawuro (Akan: the town crier's gong) is not another Bible app. It is a reply.
In Ghana and much of Africa, digital life runs on WhatsApp voice notes — short,
spoken, person to person. Dawuro puts Scripture inside that loop: you speak a
feeling, a verse comes back in English and the language of your heart, you hear
it aloud, and you send it on. The person who receives it opens a link — no app,
no login — hears the verse, and replies with a verse of their own into the same
chat. **The receiver is a user.** That round trip, not a reading plan, is the
product.

Built for the *Scripture in New Frontiers* hackathon (YouVersion + Gloo AI).

---

## The loop

1. **Speak or type a feeling** — English via Web Speech; Twi, Ewe, Ga, Dagbani,
   Kusaal, Yorùbá via GhanaNLP Khaya ASR. Non-English feelings are Khaya-translated
   to English for mapping.
2. **Gloo AI picks the verse** — the faith-tuned model chooses the best fit from a
   curated allow-list (`lib/verses.ts`). It can only *choose* a verse, never write
   Scripture; output is validated server-side against the allow-list. The curated
   keyword map is the offline fallback, and the one-tap suggestion chips resolve
   from it directly so the demo path stays deterministic.
3. **YouVersion supplies the words** — bilingual: English (BSB) + the local
   language (e.g. Asante Twi ASNA #2094). When a language has no published Bible
   on YouVersion (Kusaal, Ga, Dagbani, ...), the local side is a clearly labelled
   Khaya translation of the YouVersion English verse. Scripture is never
   machine-translated when a published Bible exists.
4. **Khaya TTS speaks it aloud** — Twi, Ewe, Gĩkũyũ (Fante text uses the Twi voice).
5. **Gloo writes a short reflection** — 2-3 sentences, tradition-aware
   (evangelical / catholic / mainline), optionally Khaya-translated to the local
   language. It reflects on the verse; it never quotes or rewrites it.
6. **Share on WhatsApp — with a receive link.** The share carries a PNG card +
   WAV audio + a link to `/v/{lang}/{usfm}` (e.g. `/v/tw/PHP.4.6-7`). The link
   unfurls in WhatsApp as a dynamically generated verse card (Open Graph image).
   The receiver opens it in any browser: server-rendered verse in their language
   + English, a Play button, publisher attribution — and then "Your turn — What's
   on your heart?", the full feeling-to-verse flow, so they send a verse back
   into the same thread.

### Languages

English (BSB) always appears as the companion side. **Scripture is never machine-translated when a published Bible exists.**

#### Ghana (priority)

| Code | Language | Scripture (local side) | Hear (TTS) | Speak (ASR) |
|------|----------|------------------------|------------|-------------|
| `tw` | Asante Twi | YouVersion ASNA #2094 | Yes | Yes |
| `ak` | Akuapem Twi | YouVersion AKNA #1631 | Yes (Twi voice) | Yes (Twi ASR) |
| `ee` | Ewe | YouVersion ECS #1613 | Yes | Yes |
| `gaa` | Ga | Khaya from EN* | — | Yes |
| `fat` | Fante | Khaya from EN* | Yes (Twi voice) | type |
| `dag` | Dagbani | Khaya from EN* | — | Yes |
| `kus` | Kusaal | Khaya from EN* | — | Yes |
| `gur` | Gurene (Ninkare) | YouVersion NT #1323 | — | type |
| `gjn` | Gonja | YouVersion #1729 | — | type |
| `xsm` | Kasem | YouVersion NT #1303 | — | type |
| `sil` | Sisaala | YouVersion #2553 | — | type |

\* **No YouVersion Bible** → English verse from YouVersion (authoritative) + **local text via Khaya translate**, with a clear UI label: not a published Bible. Feelings in that language use Khaya ASR (when available) or typing → Khaya → English for verse mapping. Reflections can also be Khaya-translated.

#### Wider region

| Code | Language | Scripture (local side) | Hear (TTS) | Speak (ASR) |
|------|----------|------------------------|------------|-------------|
| `yo` | Yorùbá | YouVersion YCB #911 | — | Yes |
| `ha` | Hausa | YouVersion HCB #1614 | — | type |
| `ig` | Igbo | YouVersion ICB #1624 | — | type |
| `ki` | Gĩkũyũ | YouVersion GKY #1622 | Yes | type |
| `sw` | Kiswahili | YouVersion Neno #1627 | — | type |
| `luo` | Dholuo | Khaya from EN* | — | type |
| `mer` | Kĩmĩĩrũ | Khaya from EN* | — | type |
| `fr` | Français | YouVersion Segond #93 | — | type |

**Khaya voice:** TTS = Twi, Ewe, Gĩkũyũ · ASR wired = Twi, Ewe, Ga, Dagbani, Kusaal, Yorùbá · Translate includes Kusaal, Fante, Gurene, Dholuo, Kĩmĩĩrũ, and more.

---

## What it does

1. **Speak-your-heart verse retrieval** — type or speak a feeling → the best-fitting verse in English + your language
2. **The receive link** — every share carries `/v/{lang}/{usfm}`; the receiver hears the verse and replies with one of their own, no app, no login
3. **Shareable audio + image cards** — PNG card + local-language audio clip for WhatsApp
4. **Daily verse as a voice note** — YouVersion Verse of the Day, bilingual, shareable

### Non-negotiables

| Rule | How we uphold it |
|------|------------------|
| **Never machine-translate Scripture** | When YouVersion has a published Bible, that text is used. Khaya local text is only for languages without a YouVersion Bible, and is clearly labelled. |
| **AI never writes Scripture** | Gloo chooses from a curated USFM allow-list; the pick is validated server-side (`allowedReferences.includes(usfm)`); verse text always comes from YouVersion. |
| **Both required APIs do real work** | Gloo = primary feeling-to-verse brain + tradition-aware reflection; YouVersion = the only source of Scripture words. |
| **Receiver needs nothing — literally** | The receive page at `/v/{lang}/{usfm}` is the no-app experience: server-rendered verse, audio, and the full reply flow in any browser, no login or install. |
| **Secrets stay server-side** | All keys in Route Handlers / `.env.local` only. Never `NEXT_PUBLIC_*` for secrets. |

---

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **YouVersion Platform API** — passages, Verse of the Day (EN BSB + local Bibles)
- **Gloo AI Studio** — Completions v2: verse selection from the allow-list, tradition-aware reflections
- **GhanaNLP Khaya** — ASR / TTS / translate for Ghanaian and African languages
- **html-to-image** — shareable PNG cards
- **next/og `ImageResponse`** — dynamic verse-card link previews for WhatsApp
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

Returns which keys are present and whether the Twi / Khaya paths work (never returns secret values).
Want: `keys.glooPresent: true`, `twiAccess.ok: true` after the Biblica license.

### Demo path

See [docs/DEMO.md](docs/DEMO.md) — fixed flow for video (anxious → Philippians 4:6-7 → share → second phone opens the receive link and replies).

---

## Environment variables

Copy `.env.example` → `.env.local`. **Never commit `.env.local`.**

| Variable | Required | Source |
|----------|----------|--------|
| `YVP_APP_KEY` | Yes | [platform.youversion.com](https://platform.youversion.com/) — register app |
| `KHAYA_API_KEY` | Yes | [translation.ghananlp.org](https://translation.ghananlp.org/) / [studio.khaya.ai](https://studio.khaya.ai/) |
| `GLOO_CLIENT_ID` | For verse mapping + reflections | [studio.ai.gloo.com](https://studio.ai.gloo.com/) → API Credentials |
| `GLOO_CLIENT_SECRET` | Same | same |
| `NEXT_PUBLIC_APP_URL` | **Required in production** | Public URL. Receive links in WhatsApp messages and PNG footers, and Open Graph previews, are built from it. Without it, shared links fall back to the browser origin (fine locally, wrong behind proxies). |
| `NEXT_PUBLIC_APP_NAME` | Optional | Defaults to `Dawuro` |

All vendor keys are **server-side only**. Do not prefix them with `NEXT_PUBLIC_`.

### YouVersion: accept the Biblica Fast-track license

Twi Bibles (ASNA #2094, AKNA #1631) require accepting the **Biblica Fast-track Bible License** in the YouVersion developer portal. Without it, passage requests return 403 (the app surfaces a clear fix-it message).
English BSB works without that step; bilingual mode needs the license.

1. Open [platform.youversion.com](https://platform.youversion.com/)
2. Licenses / Fast-track → accept **Biblica**
3. Re-check `GET /api/health` → `twiAccess.ok: true`

---

## Architecture (pipeline)

```
Sender (phone)
  type feeling  OR  mic (EN: Web Speech / local: MediaRecorder)
       │                      │
       │                      ▼
       │              POST /api/transcribe → Khaya ASR
       │                      │
       ▼                      ▼
              POST /api/verse
                │  Gloo picks from curated allow-list (primary)
                │  keyword map fallback · YouVersion EN + local text
                ▼
              POST /api/reflect → Gloo Completions v2 (tradition-aware,
                │                 optional Khaya translation to local)
                ▼
              POST /api/speak   → Khaya TTS (WAV)
                ▼
              ShareSheet → PNG (html-to-image) + WAV + receive link
                │
                ▼  WhatsApp message
Receiver (any phone, no app)
  link unfurls as a verse card ── /v/{lang}/{usfm}/opengraph-image
       │                          (next/og ImageResponse, 1200x630,
       ▼                           local text with ɛ/ɔ diacritics)
  /v/{lang}/{usfm} — server-rendered verse EN + local, Play (Khaya TTS),
  attribution, then "Your turn" → the same feeling→verse flow
       │
       ▼
  replies with a verse of their own → the loop continues
```

Also: `GET /api/votd` — Verse of the Day in EN + local language.

### Key files

| Path | Role |
|------|------|
| `lib/youversion.ts` | Scripture fetch, VOTD, bilingual passages, passage/copyright caches, 403 license handling |
| `lib/verses.ts` | Curated feeling → USFM map (theological backbone + Gloo allow-list) |
| `lib/gloo.ts` | OAuth token cache, Completions v2 reflection, allow-list verse mapping with timeout |
| `lib/khaya.ts` | TTS / ASR / translate wrappers, chunking, audio cache, timeouts |
| `lib/share.ts` | Receive-link helpers (`/v/{lang}/{usfm}` URLs for messages and PNG footer) |
| `lib/card.ts` | PNG render helpers |
| `app/v/[lang]/[usfm]/page.tsx` | The receive page — server-rendered verse + reply flow |
| `app/v/[lang]/[usfm]/opengraph-image.tsx` | Dynamic WhatsApp link-preview verse card |
| `components/VerseFlow.tsx` | The conversation turn (feeling → verse → reflection → share), used on Home and the receive page |
| `components/ReceiveClient.tsx` | Receiver-side UI: verse card + "Your turn" reply section |
| `app/api/*/route.ts` | Thin HTTP glue; secrets never leave the server |
| `components/*` | Mobile-first UI |

---

## Deploy (Vercel)

1. Push this repo to **public** GitHub (required for the hackathon).
2. Import the project in [Vercel](https://vercel.com).
3. Set environment variables in **Project → Settings → Environment Variables**
   (Production + Preview): `YVP_APP_KEY`, `KHAYA_API_KEY`, `GLOO_CLIENT_ID`,
   `GLOO_CLIENT_SECRET`, and **`NEXT_PUBLIC_APP_URL`** (the deployed URL —
   required for receive links and WhatsApp link previews).
4. Deploy → public `*.vercel.app` URL.
5. Smoke-test **on a phone**: type/speak → verse (EN + local) → play audio →
   reflection → share → open the receive link on a second phone → reply.
6. Use that URL for the Kaggle "public project link".

Do **not** rely on `.env.local` in production; dashboard env vars only.

```bash
# Optional CLI deploy (after vercel login + link)
npx vercel --prod
```

**Human steps you still own:** Biblica license, Gloo billing/keys, YouTube video, Kaggle submit.

---

## API credits & licensing

- **Scripture text:** YouVersion Platform API. Publisher attribution (e.g. Biblica © for Asante Twi Nkwa Asɛm / ASNA; Berean Standard Bible for English) is shown on every verse card, share image, and link preview.
- **AI:** [Gloo AI Studio](https://studio.ai.gloo.com/) — Completions v2, tradition-aligned; used for verse selection (choice only, never text) and reflections.
- **Voice:** [GhanaNLP Khaya](https://translation.ghananlp.org/) — ASR, TTS, and translation for African languages.
- **Name:** *Dawuro* (Akan) — the town crier's gong.

Prefer openly licensed / Fast-track-approved Bibles for production redistribution.

---

## Testing checklist (local)

- [ ] `npm run build` succeeds
- [ ] `GET /api/health` — core keys present; Twi access OK after Biblica license
- [ ] Type `anxious` → Philippians 4:6-7 (or similar) in **English + Twi** + attribution
- [ ] VOTD teaser loads on Home; Today page shows the daily verse
- [ ] Play in Twi produces audio (Khaya TTS)
- [ ] Reflection appears when Gloo keys are set; soft skip when not
- [ ] Settings → tradition (evangelical / catholic / mainline)
- [ ] Mic: EN and Twi; transcript editable; failures fall back to typing
- [ ] Share → PNG + audio download or native share sheet; message text contains the receive link
- [ ] Open `/v/tw/PHP.4.6-7` directly → verse renders EN + Twi, Play works, "Your turn" flow returns a verse and offers "Send your verse back"
- [ ] `/v/tw/PHP.4.6-7/opengraph-image` returns a PNG verse card (reference, Twi text with diacritics, English, attribution)
- [ ] Paste a deployed receive link into WhatsApp → it unfurls as the verse card (requires `NEXT_PUBLIC_APP_URL` on the deployment)
- [ ] Malformed link `/v/tw/NOT.A.REF` → friendly "ask your friend to send it again" page
- [ ] Diacritics ɛ ɔ render on screen, on the shared PNG, and in the OG image

---

## Project status

Built phase-by-phase per the parent spec pack (`YouVersion/09_BUILD_PHASES.md`).

| Phase | Status |
|-------|--------|
| 0 Scaffold | Done |
| 1 Scripture spine | Done (needs Biblica license for live Twi) |
| 2 Gloo reflection + verse mapping | Done (needs Gloo keys for live calls; degrades to curated map) |
| 3 Voice out | Done |
| 4 Voice in | Done |
| 5 Share loop | Done |
| 6 Receive link + OG verse card | Done |
| 7 PWA / polish | Done |
| 8 Deploy | README ready — set env on Vercel and deploy when you choose |
| 9 Submission assets | See `docs/SUBMISSION.md` |

---

## License

Hackathon submission code. If you win, plan for an OSI-approved open-source license as required by the competition. Scripture remains under its publishers' licenses.
