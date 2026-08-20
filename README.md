# Daybreak

A calm, self-cleaning daily to-do app — your day at a glance.

Built for real life over work: fast capture, gentle reminders, and a list that tidies itself so nothing important slips away. Separate **Personal** and **Work** tabs, date filters (today / tomorrow / this week / this month), an **overdue spotlight**, an **undo** safety net, and a **"before you leave"** checklist. Installable as a home-screen app (PWA) and works offline.

## Running locally

It's a single static page — no build step. Serve the folder with any static server:

```bash
py -m http.server 8777
```

Then open http://localhost:8777.

## Tech

- Single-file HTML/CSS/JS, no framework or build.
- Data stored locally in the browser (`localStorage`), key `daybreak.v1`.
- Material 3 Expressive design; Bricolage Grotesque + Plus Jakarta Sans.
- PWA: `manifest.webmanifest` + `sw.js` service worker for offline + installability.

## Cloud backup & sync

Optional. Turn it on in **Settings → Cloud backup & sync** by entering a private key. Your whole list is mirrored to Firebase Realtime Database at `daybreak/<key>/blob` (newest copy wins via an `updatedAt` stamp). The key is also your **recovery key** — enter the same one on a new phone, or after clearing data, to restore everything.

## Google Calendar (optional)

Read-only. When connected, today's events appear in the **Brief** ("From your calendar today"). One-time setup to get an OAuth **Client ID**:

1. **Google Cloud Console** → console.cloud.google.com. Pick a project (the shared `bon-echo-bd946` is fine).
2. **APIs & Services → Library** → search **"Google Calendar API"** → **Enable**.
3. **APIs & Services → OAuth consent screen** → User type **External** → app name "Daybreak", your support email → add scope `.../auth/calendar.readonly` → add **your own Google address as a Test user** → Save. Leave publishing status on **Testing** (fine for personal use; a token just needs re-connecting periodically).
4. **APIs & Services → Credentials → Create credentials → OAuth client ID** → Application type **Web application** → **Authorized JavaScript origins**: add `https://cheungeric02.github.io` (add `http://localhost:8777` too if testing locally) → Create.
5. Copy the **Client ID** (ends in `.apps.googleusercontent.com`) → paste it in Daybreak → **Settings → Google Calendar** → **Connect**.

The Client ID is public/safe to store in the app; the access token lives only on your device (never in the cloud backup).

## Roadmap

Optional next: push reminders (needs Firebase Cloud Functions on the Blaze plan + FCM).
