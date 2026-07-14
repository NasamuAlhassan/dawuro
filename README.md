# Dawuro

**Scripture in the voice of your people.**

A mobile-first web app for the *Scripture in New Frontiers* hackathon (YouVersion + Gloo AI).
Speak or type a feeling in English or Twi → receive a real Bible verse in **both languages** →
hear it in Twi → share an image + audio card on WhatsApp. The receiver needs no app.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- **YouVersion Platform API** — authoritative Scripture (EN + Twi)
- **Gloo AI Studio** — faith-safe contextual reflection
- **GhanaNLP Khaya** — Twi ASR (voice in) + TTS (voice out)

## Setup

```bash
# Node 18+ recommended
cp .env.example .env.local
# Edit .env.local with your real keys (see below)

npm install
npm run dev   # http://localhost:3000
```

### Required environment variables

| Variable | Source |
|----------|--------|
| `YVP_APP_KEY` | [platform.youversion.com](https://platform.youversion.com/) |
| `GLOO_CLIENT_ID` | [studio.ai.gloo.com](https://studio.ai.gloo.com/) → API Credentials |
| `GLOO_CLIENT_SECRET` | same as above |
| `KHAYA_API_KEY` | [translation.ghananlp.org](https://translation.ghananlp.org/) / [studio.khaya.ai](https://studio.khaya.ai/) |

All keys are **server-side only**. Never prefix them with `NEXT_PUBLIC_`. Never commit `.env.local`.

Health check (no secrets returned): `GET /api/health`

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | ESLint |

## Deploy (Vercel)

1. Push this repo to GitHub (public for the hackathon).
2. Import into Vercel; set the same env vars in **Project → Settings → Environment Variables**.
3. Deploy → public `*.vercel.app` URL.

## Non-negotiables

- **Never machine-translate Scripture.** Twi verse text comes from YouVersion only.
- Keys never ship to the browser.
- Graceful degradation if voice/AI calls fail — text path always works.

## Licensing & attribution

- Scripture text: publisher attribution returned by YouVersion (e.g. Biblica © for ASNA/AKNA).
- YouVersion Platform API, Gloo AI Studio, GhanaNLP Khaya — used per their respective terms.

## Project status

Built phase-by-phase. See the parent `YouVersion/` spec pack (`09_BUILD_PHASES.md`).
