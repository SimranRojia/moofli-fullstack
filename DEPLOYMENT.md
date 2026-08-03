# Deploying Moofli (fresh setup)

Backend → **Render** (needs ffmpeg/canvas native builds + a long-running process — Vercel serverless can't do this).
Frontend → **Vercel** (CRA static build).
Redis (bullmq/ioredis in package.json) is **not actually used anywhere in the code**, so it's skipped for now — add it later only if a queue feature is built.

## 0. Push these changes
I updated two files so URLs come from env vars instead of being hardcoded:
- `frontend/src/config.js` — now reads `REACT_APP_API_URL` first, falls back to the old Render URL.
- `backend/server.js` — CORS whitelist now also includes `process.env.CLIENT_URL`.

From your own terminal (not this sandbox):
```
git add -A
git commit -m "Make API URL and CORS whitelist configurable via env vars"
git push
```

## 1. MongoDB Atlas
Already set up (`MONGO_URI` in `backend/.env`). Just make sure Network Access allows `0.0.0.0/0` (or Render's IPs) so Render can connect — Atlas → Network Access → Add IP → Allow from anywhere.

## 2. Backend on Render
1. [render.com](https://render.com) → New → Web Service → connect the `moofli-fullstack` GitHub repo.
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Instance type: Free (fine to start; free tier sleeps after inactivity)
6. Environment variables — add each from your `backend/.env`:
   `MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, `RESEND_API_KEY`, `CLIENT_URL` (set this to your Vercel URL once you have it, see step 4).
   Don't set `PORT` — Render sets it automatically and your code already reads `process.env.PORT`.
7. Deploy. Note the resulting URL, e.g. `https://moofli-backend.onrender.com`.

## 3. Frontend on Vercel
1. [vercel.com](https://vercel.com) → Add New → Project → same GitHub repo.
2. Root directory: `frontend`
3. Framework preset: Create React App (build `npm run build`, output `build`) — Vercel usually auto-detects this.
4. Environment variable: `REACT_APP_API_URL` = your Render URL from step 2 (no trailing slash).
5. Deploy. Note the resulting URL, e.g. `https://moofli.vercel.app`.

## 4. Wire them together
Go back to Render → your backend service → Environment → set `CLIENT_URL` to the Vercel URL from step 3 → save (triggers redeploy).

## 5. Verify
- Open the Vercel URL, try signing up/logging in.
- Check Render logs for `🚀 Server running on port ...` and no CORS-blocked warnings.

## Notes
- Free Render services spin down after ~15 min idle and take ~30–60s to wake on the next request — normal on the free tier.
- `EMAIL_PASS` in your `.env` looks like a Gmail App Password — fine as-is, just don't commit `.env` (already gitignored).
