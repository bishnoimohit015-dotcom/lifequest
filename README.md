# LifeQuest

Turn real-life habits into a game. Complete quests, earn XP, build streaks, level up.

A minimalist habit tracker with light RPG progression — dashboard, daily quests,
a Sheets-style monthly tracker, analytics, and achievements.

---

## Deploying your own permanent copy (free, ~5 minutes)

LifeQuest stores everything in your browser, so it needs **no database, no
API keys, and no environment variables**. That makes deployment trivial.

### 1. Put the code on GitHub

Create an empty repository at [github.com/new](https://github.com/new) — name it
`lifequest`, keep it **Private** if you like, and do **not** tick "Add a README".

Then, in this project folder on your computer:

```bash
git init
git add .
git commit -m "LifeQuest"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/lifequest.git
git push -u origin main
```

> `.gitignore` already excludes `.env` and `node_modules`, so no secrets are published.

### 2. Deploy on Vercel

1. Sign in at [vercel.com](https://vercel.com) with your GitHub account.
2. Click **Add New → Project**.
3. Pick your `lifequest` repository and click **Import**.
4. Change nothing. Leave every setting on its default and **do not add any
   environment variables**.
5. Click **Deploy** and wait about a minute.

You'll get a permanent URL like `https://lifequest-xxxx.vercel.app`.

Every future `git push` redeploys automatically.

### 3. Install it on your iPhone

1. Open the Vercel URL in **Safari** (must be Safari — not Chrome).
2. Tap the **Share** button (square with an up arrow).
3. Scroll down and tap **Add to Home Screen** → **Add**.

It now launches fullscreen from your Home Screen with its own icon, and works
offline.

### Optional: a nicer address

In Vercel, open your project → **Settings → Domains** to add a custom domain,
or rename the project to change the `*.vercel.app` prefix.

---

## Moving your progress between devices

Progress is saved per browser, so your phone and laptop each start fresh.

To copy a profile across:

1. On the old device: **Settings → Backup & transfer → Copy backup**.
2. Send the text to the new device (Messages, Notes, AirDrop, email).
3. On the new device: **Settings → Paste backup → Restore**.

**Download backup** saves a dated `.json` file instead. Exporting occasionally is
wise — iOS can clear website data for sites you haven't opened in a while
(installing to the Home Screen makes this much less likely).

---

## Running locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

---

## Architecture

```
src/
  app/            routes: dashboard, today, habits, calendar,
                  analytics, achievements, profile, settings
  components/     dashboard/ habits/ calendar/ analytics/
                  layout/ settings/ ui/
  lib/            types, dates, xp, streaks, calculations,
                  achievements, storage, demo, sound, format
  state/          app-store.tsx — single provider, derived stats
  hooks/          use-animated-number
```

Business logic lives in `src/lib` as pure, UI-free functions. `src/lib/storage.ts`
is the **only** module that touches `localStorage`, so a cloud backend can be
swapped in behind the same interface without changing any UI.

**Key rules encoded in the domain layer**

- **Dates** are local calendar keys (`YYYY-MM-DD`) — never UTC round-tripped, so
  August 16 always stays August 16. Month lengths and leap years are handled.
- **XP is derived** from the completion map, never accumulated. Completing →
  undoing → completing can't double-count.
- **Levels** follow `xpToReach(L) = 25·L·(L+1) − 50` (L2 = 100, L3 = 250,
  L4 = 450 …) and continue indefinitely.
- **Streaks** need a configurable share of the day's scheduled habits (default
  80%). Days with nothing scheduled neither count nor break a streak, and future
  dates are ignored.

## Tech

Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · Lucide icons.
UI primitives are hand-built on native accessible elements; charts are plain
SVG/CSS. No component, chart, or state library.

The Postgres/Drizzle wiring from the starter template is retained but unused by
the app — `/api/health` reports healthy whether or not a database is configured.
