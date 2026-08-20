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

## Roadmap

Next: real Google Calendar read and optional push reminders.
