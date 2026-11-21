# VoiceGen – Public Text-to-Speech website

## Important
Do not put your Google API key in `public/index.html` or commit it to GitHub.
The browser calls your own `/api/tts` endpoint. `server.js` reads the secret from `.env`.

## Setup
1. Install Node.js 18 or newer.
2. In Google Cloud, enable **Cloud Text-to-Speech API** and configure billing.
3. Create a NEW API key (the key shared in chat should be rotated/revoked).
4. Restrict the key to **Cloud Text-to-Speech API**. Keep it only in the server environment.
5. Copy `.env.example` to `.env` and paste the new key after `GOOGLE_TTS_API_KEY=`.
6. Run:
   ```bash
   npm install
   npm start
   ```
7. Open `http://localhost:3000`.

## Deploy
Deploy this Node.js project to a host that supports Node.js (for example Render, Railway, or a VPS).
Set `GOOGLE_TTS_API_KEY` as a private environment variable in the host dashboard. Do not upload `.env`.
The public site URL must serve the frontend and `/api/tts` from the same host/origin.

## Cost and abuse protection
- This starter applies a basic per-IP limit of 8 API requests per minute and a 4,000-character input limit.
- This is not sufficient by itself for a large public launch: in-memory rate limits reset on restart and can be bypassed with multiple IPs.
- Before public launch, configure Google Cloud quotas/budget alerts, monitor usage, and consider CAPTCHA/login, persistent per-user quotas, and a shared Redis-backed rate limiter.
- Budget alerts notify you; they do not automatically cap all charges. Set API quotas where available and monitor billing.
