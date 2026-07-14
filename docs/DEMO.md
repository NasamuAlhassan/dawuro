# Demo path (for video + judges)

Rehearse this path until it is under ~90 seconds of product time.

## Prep
1. Accept **Biblica Fast-track** on [platform.youversion.com](https://platform.youversion.com/)
2. Set in `.env.local`: `YVP_APP_KEY`, `GLOO_CLIENT_ID`, `GLOO_CLIENT_SECRET`, `KHAYA_API_KEY`
3. `npm run dev` or use the live Vercel URL
4. Phone on the same network (or tunnel); allow mic
5. Settings → Scripture language: **Asante Twi** (default)

## Fixed path (recommended)
1. Open **Home**
2. Tap **Anxious** (or type: `I'm anxious about my exams`)
3. Expect **Philippians 4:6–7** — Twi + English, attribution
4. Tap **Play in Twi**
5. Wait for **Reflection** (Gloo)
6. Tap **Share on WhatsApp** → send to a second phone
7. Second phone: open image, play audio — **no app install**

Optional: speak in Twi “me yɛ suro” (input language Twi) for the oral demo.

## Today tab
Open **Today** → Verse of the Day → Share as voice note.

## Health check
```bash
curl -s http://localhost:3000/api/health | jq .
# Want: keys.glooPresent true, twiAccess.ok true
```

## Video tips
- Real device screen capture
- Subtitles for the whole video
- Hold the grandmother / receive moment
- One quick cut of real API/network or code so judges see it is not faked
