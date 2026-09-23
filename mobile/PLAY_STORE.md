# Publishing AICC to Google Play

Everything that can be prepared in the repo is done. What's left needs **your** accounts and logins, so it's
listed here in order. Do the steps top to bottom.

## Already done in the repo

- App icon, adaptive icon, splash screen, package id `com.alexanderandreasson.aicc`, `versionCode`
- Release build config (`eas.json`) with the app's public settings baked in (`.env.local` is gitignored, so EAS
  never sees it — without this the built app would crash on launch)
- A build guard (`scripts/check-release-env.js`) that **fails the build on purpose** if the backend URL is still a
  placeholder, plain `http`, or a local address
- In-app **Delete account** (Profile tab) + `/api/account` endpoint — Google requires this for apps with sign-up
- Public pages the Play Console asks for: `/privacy` and `/delete-account` (in the web app)
- Store graphics in `mobile/store-assets/`: `play-icon-512.png`, `feature-graphic-1024x500.png`
- Target SDK 36 (meets Google's current requirement); only the camera permission is requested on modern Android

---

## Step 1 — Deploy the web backend (Vercel)

The phone app calls your Next.js app for AI analysis, weekly summaries and account deletion. It must be on a
public **https** URL — `192.168.x.x` / `localhost` won't work for anyone else (release builds also block plain
`http`).

1. Commit and push the repo to GitHub.
2. [vercel.com](https://vercel.com) → **Add New → Project** → import the repo (root directory = repo root).
3. Add these **Environment Variables** (Production):

   | Name | Required | Where to get it |
   |---|---|---|
   | `ANTHROPIC_API_KEY` | yes | console.anthropic.com → API Keys |
   | `SUPABASE_SERVICE_ROLE_KEY` | yes (account deletion) | Supabase → Project Settings → **API Keys** → **Secret keys** → copy the `sb_secret_…` key (create one with "New secret key" if none exists). If your dashboard still shows a "Legacy" tab, its `service_role` key works too. Keep the variable name `SUPABASE_SERVICE_ROLE_KEY` either way. **Server-only secret — never put it in the mobile app, a `NEXT_PUBLIC_` variable, or a chat/message.** |
   | `NEXT_PUBLIC_CONTACT_EMAIL` | optional | Shown on /privacy and /delete-account. Leave unset to point people at the contact email on your Play listing instead. |
   | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | optional | Built-in defaults already point at your project. |

4. Deploy. Open `https://<your-url>/privacy` and `https://<your-url>/delete-account` **in a private/incognito window**
   (so you're not logged into Vercel) to confirm they load. Two common traps:
   - **Deployment Protection**: if you're sent to a Vercel login page, go to the project → **Settings → Deployment
     Protection** → set **Vercel Authentication** to **Disabled** → Save. Left on, the phone app, Google's reviewers and
     password-reset links are all locked out. (The app has its own login, so this is safe.)
   - **Use the stable domain** (project → **Domains**, e.g. `<project-name>.vercel.app`), *not* the long per-deployment
     URL with a random hash in it — those are snapshots of one build and return `410 Gone` once that deployment is replaced.
   - **Renaming a Vercel project does not rename its address.** The old `*.vercel.app` address keeps working; to get an
     address matching the new name, add it under **Settings → Domains → Add**, then update every place listed in step 6.
5. **Supabase → Authentication → URL Configuration**: set **Site URL** to `https://<your-url>` and add
   `https://<your-url>/reset-password` to **Redirect URLs** (password reset breaks without it).
6. `mobile/eas.json` → `EXPO_PUBLIC_API_BASE_URL` must be your final production URL (no trailing slash). It is currently
   `https://ai-caloriecounter.vercel.app` (Vercel redirects the older `aicc-8znh` address to it, but the phone app must
   call the final address directly). **If you ever change the address, update it in all of these:** `mobile/eas.json`,
   Supabase (Site URL + the `/reset-password` Redirect URL), and the Play Console (privacy policy and account-deletion
   links). The build guard will refuse a placeholder or `http` URL.

## Step 2 — Build and test the app

```bash
npm install -g eas-cli
eas login
cd mobile
eas build -p android --profile preview
```

- First run: say yes when EAS offers to create the project (it writes a project id into `app.json` — commit that),
  and let EAS generate the Android keystore.
- Install the resulting `.apk` on your phone and test everything against the **deployed** backend: sign up,
  onboarding, camera **and** library photos, AI analysis, manual food search, edit/delete meals, password-reset email,
  sign out/in, and **Delete account using a throwaway account**. (The delete endpoint was tested for auth and error
  handling, but never against the real database — no service key was available locally. This is that test.)
- When happy, build the release bundle Play wants:

```bash
eas build -p android --profile production
```

## Step 3 — Google Play Console (only you can do these)

1. [play.google.com/console](https://play.google.com/console) → create a developer account (one-time **$25** plus
   identity verification, which can take days).
2. **Create app**: name `AICC – AI Macro Tracker`, App, Free.
3. **App content** (all sections are required):
   - **Privacy policy**: `https://<your-url>/privacy`
   - **App access**: "restricted" → give reviewers a working demo account (create one in the app, finish onboarding, log
     a couple of meals). Enter the credentials here in the console — don't commit them.
   - **Ads**: No
   - **Content rating**: questionnaire — answer **No** to violence, sexual content, profanity, drugs, gambling; no
     user-to-user sharing; no location sharing; no purchases. Expect "Everyone".
   - **Target audience**: 18+ (matches the privacy policy)
   - **Data safety**: see the table below. Account-deletion URL: `https://<your-url>/delete-account`
   - **Health apps declaration**: complete it (the app has nutrition / weight-management features)
4. **Store settings**: category **Health & Fitness**; a public contact email.
5. **Main store listing**: copy below; icon `store-assets/play-icon-512.png`; feature graphic
   `store-assets/feature-graphic-1024x500.png`; **at least 2 phone screenshots** — take them on your phone (Today with
   data, Log with detected foods, History chart, Profile). Crop out your email address on the Profile screen.
6. **Closed testing → Create release** → upload the `.aab` → add testers. New personal developer accounts must run a
   closed test before they can publish (currently **12+ testers opted in for 14 continuous days** — the console shows the
   exact, current requirement). Organization accounts are exempt.
7. After the test window: Dashboard → **Apply for production** → answer the questions → Google reviews it (can take
   days) → **Production → Create release** → submit.

---

## Store listing copy

**Title (≤30):** `AICC – AI Macro Tracker`

**Short description (≤80):**
`Snap a photo of your meal and get instant AI calorie and macro estimates.`

**Full description:**

```
Know what's on your plate — in seconds.

AICC is a simple, fast macro and calorie tracker powered by AI. Take a photo of your meal and AICC identifies each food, estimates the portion, and calculates calories, protein, carbs and fat. Adjust anything that looks off, add missing foods from a built-in search, and save the meal to your day.

WHAT YOU GET
• Photo meal logging — snap a picture and get an instant AI estimate for every food on the plate
• Fully editable — change names, portion sizes and macros any time, in the moment or later from your history
• Daily goals built for you — enter your height, weight, age and activity level and AICC sets your calorie and macro targets
• Today at a glance — calories versus goal, plus protein, carbs and fat
• History and trends — a clear chart of your calories and protein over the past week, month or three months
• Streaks — build the habit of logging every day
• Weekly AI insight — a short summary of your recent eating pattern
• Light and dark themes

YOUR DATA, YOUR CONTROL
Your meals and profile are private to your account. Delete your account and all your data any time from the Profile screen. No ads, and we never sell your data.

IMPORTANT
AICC provides estimates based on AI analysis of photos and typical nutrition values. Results can be inaccurate and are not medical advice. Consult a qualified professional before changing your diet.
```

## Data safety form — suggested answers

Review these against the console's wording; you are the one attesting to them.

| Data type | Collected | Shared | Optional? | Purpose |
|---|---|---|---|---|
| Email address (Personal info) | Yes | No | Required | Account management, app functionality |
| Name (Personal info) | Yes | No | Required | App functionality (personalization) |
| Health info — height, weight, age, sex, logged meals/nutrition | Yes | No | Required | App functionality |
| Fitness info — activity level | Yes | No | Required | App functionality |
| Photos — meal photos | Yes (processed **ephemerally**: relayed for analysis, never stored by you) | No | Optional (manual entry works) | App functionality |

- **Sharing = No:** Supabase and Anthropic process the data on your behalf as service providers, which Google's
  guidance does not count as "sharing" — confirm in the form's help text.
- Data is **encrypted in transit**: Yes.
- Users can **request data deletion**: Yes — in the app, and at `https://<your-url>/delete-account`.
- Independent security review: No. Families policy: not applicable (18+).

## Before you promote it widely

- **No rate limiting on `/api/analyze-meal`.** Every photo is a paid Anthropic call, and any signed-up user can repeat
  it without limit. Fine for a small test group; add per-user limits before a public launch.
- The privacy policy is a good-faith draft written from what the code does. You are in the EU and the app handles
  health-related data (GDPR "special category"), so have it reviewed if you can.
- Every later update: `eas build --profile production` (version codes auto-increment), upload the new `.aab`.
