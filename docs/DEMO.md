# Demo path (for video + judges)

Rehearse this path until it is under ~90 seconds of product time. Two phones: the **sender** and the **receiver**. The receive half of the loop is the money shot.

## Prep
1. Accept **Biblica Fast-track** on [platform.youversion.com](https://platform.youversion.com/)
2. Set in `.env.local`: `YVP_APP_KEY`, `GLOO_CLIENT_ID`, `GLOO_CLIENT_SECRET`, `KHAYA_API_KEY`
3. **Record against the deployed Vercel URL, not localhost.** The WhatsApp link preview (verse card in the chat) only works when the link is publicly reachable and `NEXT_PUBLIC_APP_URL` is set on Vercel. Localhost links will not unfurl.
4. Both phones: WhatsApp signed in, a chat between them open; allow mic on the sender
5. Sender: Settings → Scripture language: **Asante Twi** (default)

## Fixed path (recommended)

### Phone 1 — the sender
1. Open **Home**
2. Tap **Anxious** (or type: `I'm anxious about my exams`)
3. Expect **Philippians 4:6–7** — Twi + English, attribution ("chosen with Gloo AI" when keys are live)
4. Tap **Play** — Twi audio (Khaya TTS)
5. Wait for **Reflection** (Gloo)
6. Tap **Send on WhatsApp** → share to the second phone. The message carries the PNG card, the WAV audio, and the receive link (`/v/tw/PHP.4.6-7`)

### Phone 2 — the receiver (no app, no login)
7. In the WhatsApp chat, the link unfurls as a **verse card preview** — reference, Twi text with ɛ/ɔ, English, "Tap to hear it aloud". Hold on this.
8. Tap the link → the **receive page** opens in the browser: "Sent to you", verse in Twi + English, publisher attribution
9. Tap **Play** — the verse aloud in Twi
10. Scroll to **"Your turn — What's on your heart?"** → tap **Anxious** (or speak a feeling)
11. A verse of their own appears → tap **Send your verse back** → it lands in the same WhatsApp thread

That round trip — verse out, verse back, same chat — is the product. End the demo there.

Optional: speak in Twi "me yɛ suro" (input language Twi) for the oral demo.

## Daily verse + Topics
The Verse of the Day now greets you at the top of **Home** — playable and
shareable with zero taps. **Topics** (middle tab) browses the eleven curated
feelings; each opens its verse inline with audio and share.

## Health check
```bash
curl -s http://localhost:3000/api/health | jq .
# Want: keys.glooPresent true, twiAccess.ok true
```

Quick OG check without WhatsApp: open
`https://YOUR-APP.vercel.app/v/tw/PHP.4.6-7/opengraph-image` in a browser —
you should see the 1200x630 verse card PNG.

## Video tips
- Real device screen capture, both phones
- Subtitles for the whole video
- Hold the receiver's face when the Twi audio plays
- Hold the chat for a beat when the link preview renders — judges should see Scripture inside WhatsApp before anyone taps
- One quick cut of real API/network or code so judges see it is not faked
