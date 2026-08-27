# 🧭 Gap Year Planner

A personal, installable web app for planning and coordinating your gap year travels — built to sync across every device you own (phone, laptop, tablet).

## What's inside

| Tab | What it does |
|---|---|
| **Itinerary** | Home screen: countdown to your next booking, quick stats, and a chronological timeline of everything you've booked. |
| **Ideas** | A bucket list of places/things you might do, with priority, notes, links and an estimated cost. One tap moves an idea to Booked once it's confirmed. |
| **Booked** | Flights, trains, buses, ferries, accommodation and tours — with dates, confirmation numbers, cost and booking links, always sorted chronologically. |
| **Map** | An interactive map (English place names) plotting your booked route in order, plus pins for ideas you haven't booked yet. |
| **Budget** | Automatically totals your booked costs, lets you add estimates for things like food/insurance/visas, and breaks spending down by category. |
| **Packing** | A checklist you can build from scratch or seed with a gap-year starter list (documents, tech, health, clothing, gear). |
| **Documents** | Track visa applications, insurance, vaccination admin and other prep, per item, with notes and links. |
| **Recommendations** | Reference guides for China, Thailand, Laos, Cambodia, Vietnam and Malaysia — places to visit, vaccinations, currency, weather by season, plug sockets, visas, language and safety tips. |

It's a **Progressive Web App (PWA)** — you can install it to your phone's home screen and it works offline (your data syncs again next time you're online).

---

## 1. Connect your own Firebase project

Your data is stored in your own free [Firebase](https://firebase.google.com) project, so only you can see it, and it syncs automatically the moment you sign in on a new device. This takes about five minutes and costs nothing for personal use.

1. Go to the [Firebase console](https://console.firebase.google.com/) and click **Add project**. Give it any name (e.g. "gap-year-planner") and finish the wizard (you can disable Google Analytics — you don't need it).
2. In your new project, click the **web icon (`</>`)** to register a web app. Give it a nickname and click **Register app**. You'll be shown a `firebaseConfig` object — keep this tab open.
3. In the left sidebar go to **Build → Authentication → Get started**. Under **Sign-in method**, enable **Google**, choose a support email, and save.
4. In the left sidebar go to **Build → Firestore Database → Create database**. Choose a location close to you and start in **production mode**.
5. Still in Firestore, open the **Rules** tab and paste in the contents of [`firestore.rules`](./firestore.rules) from this repo, then **Publish**. This locks your data down so only your own signed-in account can ever read or write it.
6. Back in **Project settings → General**, copy the six values from your `firebaseConfig` into a new `.env.local` file in the project root (copy `.env.local.example` as a starting point):

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

7. If you plan to deploy the app (see below), also add your deployed domain to **Authentication → Settings → Authorized domains** (Firebase adds `localhost` and your `*.web.app`/`*.firebaseapp.com` domains automatically; add a custom domain here if you use one).

That's it — restart the dev server (or redeploy) and sign in with Google. Sign in with the same Google account on every device and your ideas, bookings, budget, packing list and documents will all stay in sync.

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

Push this repo to GitHub, then import it in [Vercel](https://vercel.com/new) or [Netlify](https://app.netlify.com/) — both auto-detect Vite. Add the six `VITE_FIREBASE_*` environment variables from step 1 in the project's dashboard settings, then deploy. Remember to add the resulting domain to Firebase's **Authorized domains** list (step 7 above).

## 4. Install it on your phone

Once deployed, open the URL on your phone in Chrome (Android) or Safari (iOS) and choose **"Add to Home Screen"**. It'll behave like a native app, complete with an icon and offline support.

---

## Notes

- **Adding coordinates for the map**: when you add an Idea or a Booking, there are optional latitude/longitude fields. The easiest way to find them is to right-click (or long-press) a location on Google Maps and tap the coordinates to copy them.
- **Map tiles**: the map uses [CARTO](https://carto.com/attributions)/OpenStreetMap tiles chosen specifically because they render place names in English/Latin script worldwide, including China, Thailand, Laos, Cambodia, Vietnam and Malaysia.
- **Recommendations content** is general reference material, not medical or legal advice — always double-check current visa rules and vaccination guidance (e.g. via a GP or travel clinic) closer to departure, since these change over time.

## Tech stack

React + TypeScript + Vite, Tailwind CSS v4, Firebase (Auth + Firestore), React Router, react-leaflet/Leaflet with CARTO tiles, date-fns, and `vite-plugin-pwa` for offline/installable support.
