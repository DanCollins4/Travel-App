# 🧭 Gap Year Planner

A personal, installable web app for planning and coordinating your gap year travels — built to sync across every device you own (phone, laptop, tablet).

## What's inside

| Tab | What it does |
|---|---|
| **Itinerary** | Home screen: countdown to your next booking, quick stats, a chronological timeline of everything you've booked, and a button to generate a public **shareable link** to your itinerary. |
| **Ideas** | A bucket list of places/things you might do, with priority, notes, links and an estimated cost. One tap moves an idea to Booked once it's confirmed. |
| **Booked** | Flights, trains, buses, ferries, accommodation and tours — with dates, confirmation numbers, cost and booking links, always sorted chronologically. |
| **Map** | An interactive map (English place names) that plots itself automatically from the place names you type — booked transport legs show as solid, mode-coloured routes; idea pins are coloured by priority and loosely joined by a dashed line. No coordinates needed. |
| **Journal** | A running log of what actually happened, with photos, optionally linked to a specific booked stop. |
| **Contacts** | People you meet on the road — name, where/when you met, phone, email, socials, notes. |
| **Budget** | Automatically totals your booked costs, lets you add estimates for things like food/insurance/visas, breaks spending down by category and by country, and includes a live currency converter. |
| **Packing** | A master checklist you can seed with a gap-year starter list, plus extra lists per leg or climate (tropical, cold/mountain, jungle trekking, city). |
| **Documents** | Track visa applications, insurance, vaccination admin and other prep, per item, with notes and links. |
| **Recommendations** | Reference guides for Australia, Cambodia, China, Hong Kong, Laos, Malaysia, Thailand and Vietnam — places to visit, vaccinations, currency, weather by season, plug sockets, visas, a language cheat sheet, and safety tips. |

It's a **Progressive Web App (PWA)** — you can install it to your phone's home screen and it works offline (your data syncs again next time you're online).

---

## 1. Connect your own Firebase project

Your data is stored in your own free [Firebase](https://firebase.google.com) project, so only you can see it, and it syncs automatically the moment you sign in on a new device.

1. Go to the [Firebase console](https://console.firebase.google.com/) and click **Add project** (or **Get started with a Firebase project**). Give it any name (e.g. "Travel Planner") and finish the wizard — you can skip Google Analytics, it isn't needed.
2. On the project's overview page, click **+ Add app** and choose the **`</>`** (web) icon. Give it a nickname and click **Register app** — leave "Also set up Firebase Hosting" unchecked. You'll be shown a `firebaseConfig` object; keep this handy.
3. In the left sidebar, expand **Security** → **Authentication** → **Get started** → **Sign-in method** tab → enable **Google** → pick a support email → **Save**.
4. Expand **Databases & Storage** → **Firestore Database** → **Create database** → pick a location near you → **production mode** → **Create**. Then open its **Rules** tab, paste in the contents of [`firestore.rules`](./firestore.rules) from this repo, and **Publish**. This locks your data down so only your own signed-in account can ever read or write it.
5. Copy the six values from your `firebaseConfig` into a new `.env.local` file in the project root (copy `.env.local.example` as a starting point):

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

6. If you plan to deploy the app (see below), also add your deployed domain to **Security → Authentication → Settings → Authorized domains** (Firebase adds `localhost` and your `*.web.app`/`*.firebaseapp.com` domains automatically; add your Vercel/Netlify domain here too).

That's it for the core app — restart the dev server (or redeploy) and sign in with Google. Sign in with the same Google account on every device and everything stays in sync.

### Optional: enable photo uploads in the Journal tab

Uploading photos needs **Firebase Storage**, which requires switching your project to Firebase's pay-as-you-go **Blaze** plan (Google requires a card on file for Storage, even though normal personal usage — a few hundred photos — stays within the free monthly allowance, so realistically you won't be charged anything). If you'd rather skip this, the rest of the app works fully without it; journal entries just won't support photo uploads.

1. Bottom-left of the Firebase console, click **Upgrade** next to the "Spark" plan badge, and follow the prompts to switch to **Blaze**.
2. Expand **Databases & Storage** → **Storage** → **Get started**, choosing the same location as your Firestore database → **Done**.
3. Open the **Rules** tab for Storage, paste in the contents of [`storage.rules`](./storage.rules) from this repo, and **Publish**.

---

## 2. Run it locally

```bash
npm install
npm run dev
```

Open the printed local URL, sign in with Google, and start planning.

## 3. Deploy it so you can access it from anywhere

Any static host works. Two easy, free options:

### Option A: Firebase Hosting (recommended — same project as your data)

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only hosting
```

This uses the `firebase.json` already in this repo. On first run, if it asks you to select a project, choose the one you created above. Your app will be live at `https://<your-project-id>.web.app`.

### Option B: Vercel / Netlify

Push this repo to GitHub, then import it in [Vercel](https://vercel.com/new) or [Netlify](https://app.netlify.com/) — both auto-detect Vite. Add the six `VITE_FIREBASE_*` environment variables from step 1 in the project's dashboard settings, then deploy. Remember to add the resulting domain to Firebase's **Authorized domains** list (step 6 above). `vercel.json` is already included so client-side routes (like `/share/...`) work correctly on a direct link, not just in-app navigation.

## 4. Install it on your phone

Once deployed, open the URL on your phone in Chrome (Android) or Safari (iOS) and choose **"Add to Home Screen"**. It'll behave like a native app, complete with an icon and offline support.

---

## Notes

- **The map plots itself.** Just use real place names — the title on an Idea, or From/To on a Booking — and the app looks up coordinates for you in the background (via OpenStreetMap's free Nominatim service) and saves them onto the entry. If a pin lands in the wrong spot, make the place name more specific (add a city or country) and re-save.
- **Map tiles** use [CARTO](https://carto.com/attributions)/OpenStreetMap, chosen because they render place names in English/Latin script worldwide.
- **The currency converter** uses [exchangerate-api.com](https://www.exchangerate-api.com/)'s free, keyless endpoint — no setup needed, rates are cached for the day.
- **Shared itinerary links** are public and read-only: anyone with the link can see your booked stops' places and dates, but not costs, confirmation numbers, notes, or anything else in the app. Generate/revoke the link any time from the Itinerary tab.
- **Recommendations content** is general reference material, not medical or legal advice — always double-check current visa rules and vaccination guidance (e.g. via a GP or travel clinic) closer to departure, since these change over time.

## Tech stack

React + TypeScript + Vite, Tailwind CSS v4, Firebase (Auth + Firestore + Storage), React Router, react-leaflet/Leaflet with CARTO tiles, OpenStreetMap Nominatim geocoding, exchangerate-api.com, date-fns, and `vite-plugin-pwa` for offline/installable support.
