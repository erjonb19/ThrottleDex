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

## Put it on your iPhone with TestFlight

TestFlight is Apple's beta app. It installs the real app on your phone (no Expo Go), and you can invite testers. Needs an active Apple Developer account. Builds run on Expo's servers, so no Mac or Xcode is needed.

1. Make a free account at expo.dev.
2. In Terminal, inside `ThrottleDex/mobile`, run:
   ```
   npx eas-cli@latest login
   npx eas-cli@latest init
   ```
   `init` links this folder to an Expo project and adds its id to `app.json`. Commit that change.
3. Build the iPhone app:
   ```
   npx eas-cli@latest build --platform ios --profile production
   ```
   When it asks, sign in with your Apple Developer Apple ID and let it create the certificates for you. The build takes about 15 to 30 minutes.
4. Send it to TestFlight:
   ```
   npx eas-cli@latest submit --platform ios --latest
   ```
   Let it create the app in App Store Connect if asked.
5. Once Apple finishes processing (usually under an hour), install the **TestFlight** app on your iPhone. ThrottleDex shows up there for your Apple ID.

The app id is `com.throttledex.app` (set in `app.json`).

## Later: public App Store and Google Play

A public App Store release also needs a privacy policy page, screenshots and Apple's review. Google Play needs a separate Google Play developer account, then `npx eas-cli@latest build --platform android` and `submit`.
