# AICC — Android app

The native rewrite of the AICC web app, built with Expo (React Native). It
talks to the **same Supabase project** as the web app, and reuses the web
app's `/api/analyze-meal` and `/api/weekly-summary` routes as its backend (so
the Anthropic API key never ships inside the mobile bundle).

## One-time setup

```bash
cd mobile
npm install
```

Edit `mobile/.env.local` (already gitignored) if you need to point at a
different Supabase project or API backend:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_API_BASE_URL=https://your-deployed-web-app.vercel.app
```

`EXPO_PUBLIC_API_BASE_URL` defaults to `http://localhost:3000` — fine for
local development (run `npm run dev` in the repo root alongside this app),
but **must** point at your real deployed URL for a build you'll actually
install on a phone, since `localhost` on a phone means the phone itself.

## Running it during development

```bash
npx expo start
```

Scan the QR code with the **Expo Go** app on your Android phone (install it
from the Play Store) — fastest way to iterate, but a few native modules
(none currently used here beyond what Expo Go supports) would need a
"development build" instead. `npx expo start --web` also works for quick
UI iteration in a browser, though camera capture and a couple of native-only
behaviors (e.g. the edit-meal modal's overlay) can't be fully exercised there.

## Building a real installable Android app

This project is preconfigured for [EAS Build](https://docs.expo.dev/build/introduction/)
(`eas.json` already has `development`/`preview`/`production` profiles). You'll
need your own free Expo account — this is the one step that has to happen
under your login, not something that can be scripted for you.

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

That produces an installable `.apk` you can download and sideload directly
onto a phone (or share the link). When you're ready for the Play Store, use
the `production` profile instead (`eas build -p android --profile production`),
which builds an `.aab` — you'll need a Google Play Console developer account
to actually publish it (`eas submit -p android` can push the finished build
there once you do).

## Publishing to Google Play

The full step-by-step runbook (deploying the backend, building, the Play Console
forms, store listing copy, Data safety answers) is in [`PLAY_STORE.md`](./PLAY_STORE.md).

## Regenerating the app icon / splash screen

Both are generated from `scripts/generate-icons.js` (via `sharp`, already a
dependency) rather than hand-exported PNGs — rerun it after tweaking the
glyph/colors in that file:

```bash
node scripts/generate-icons.js
```
