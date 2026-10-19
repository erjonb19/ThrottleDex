# ThrottleDex phone app (iPhone and Android)

One Expo app for both phones. It reads the same Supabase database as the website, using the public key only.

What it does today:

- **Cities**: every city, live ones first, the rest marked "coming soon".
- **A city**: everyone with an approved list there. An empty city gets a "start the first list" button that opens the website.
- **A list**: picks grouped like the website, with the same tier filter (Enthusiast, Commuter, and so on). Tapping **Website**, **Instagram** or **Call** opens it and counts the click for the curator, the same as the website's `/go` link.

Curators still sign in and edit their lists on the website.

## Open it on your phone (first run)

1. Install Node.js (the LTS version) on your computer from nodejs.org.
2. Install **Expo Go** on your phone from the App Store or Google Play.
3. On your computer, open Terminal and run:
   ```
   git clone https://github.com/erjonb19/ThrottleDex.git
   cd ThrottleDex/mobile
   npm install
   npx expo start
   ```
4. A QR code appears. On iPhone, scan it with the Camera app. On Android, scan it from inside Expo Go.
5. The app opens in Expo Go. Phone and computer need to be on the same Wi-Fi. If it can't connect, stop it (Ctrl+C) and run `npx expo start --tunnel` instead.

It talks to the live ThrottleDex database by default, so you see the real cities and lists.

## Settings (optional)

Put these in `mobile/.env.local` to point the app somewhere else:

| Name | Default |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | the live ThrottleDex project |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | the live publishable key (public by design) |
| `EXPO_PUBLIC_SITE_URL` | `https://throttledex.com` (where "start a list" goes) |

Never put the Supabase service role key in this app. Anything in the app can be read by anyone who downloads it.

## Checks

```
npm run typecheck
npx eslint .
```

## Later: putting it in the App Store and Google Play

That's done with EAS Build and Submit (`npx eas-cli@latest build`), and needs an Apple Developer account and a Google Play developer account. The app id is already set to `com.throttledex.app` in `app.json`.
