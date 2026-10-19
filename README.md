# ThrottleDex

The car people real enthusiasts send their friends to, one city at a time. A curator publishes a list of vendors by category, vouched for with their own name, re-checked every six months. Nobody pays to be listed.

Name chosen Oct 2026. Domain throttledex.com registered at Porkbun on Oct 18, 2026. USPTO search Oct 18, 2026: no marks for "throttledex".

## Status (Oct 19, 2026)

- Supabase project `throttledex` (us-east-1) is live with both migrations and the seed applied. Supabase's security advisor reports no issues.
- New: admin approval page (`/admin`), tier filters on each public list, and "Add to Home Screen" install on iPhone and Android.
- Tested end to end: 36 browser checks (magic-link sign in, profile, saving and editing picks, admin approve and remove, public page, tier filters, home-screen manifest and icons, click tracking, sign out) and 17 row-level security checks, all passing. The browser checks ran against a local copy of the schema, since the build machine could not reach supabase.co.
- Not yet deployed. Vercel is on hold; see Deploy.

## What is here

| Path | What it does |
| --- | --- |
| `supabase/migrations/0001_init.sql` | Tables, enums, row-level security, click-count view |
| `supabase/migrations/0002_harden_helpers.sql` | Tightens the two helper functions the security rules use |
| `supabase/seed.sql` | The NYC metro and the 27 categories. No people or vendors. |
| `supabase/tests/rls.sql` | 17 security checks; runs in a transaction and leaves no data. Every row should say PASS. |
| `src/app/page.tsx` | Landing page |
| `src/app/[metro]/page.tsx` | All approved curators in a metro (`/nyc`) |
| `src/app/[metro]/[handle]/page.tsx` | One curator's public list (`/nyc/erjon`), cached and tagged |
| `src/app/go/[id]/route.ts` | Click-through redirect that records a referral, works signed out |
| `src/app/login/` | Magic-link sign in |
| `src/app/dashboard/` | Curator profile and one form per category slot |
| `src/app/admin/` | Admin page: approve or remove curators; pages update right away |
| `src/components/TierFilter.tsx` | The Commuter / Enthusiast / Luxury / Collector / Working filter on a public list |
| `src/app/manifest.ts` | Makes the site installable to a phone's home screen |
| `src/lib/data.ts` | Cached public reads with cache tags |
| `src/proxy.ts` | Refreshes the session on `/dashboard` and `/admin`; sends signed-out visitors to sign in |

## Run it locally

1. Create a free project at supabase.com.
2. In the Supabase dashboard open **SQL Editor** and run these files in order, pasting each one in: `supabase/migrations/0001_init.sql`, `supabase/migrations/0002_harden_helpers.sql`, `supabase/seed.sql`.
3. In **Authentication > URL Configuration** add `http://localhost:3000/auth/callback` to Redirect URLs.
4. Copy `.env.example` to `.env.local` and fill in the URL and anon key from **Project Settings > API**.
5. `npm install`, then `npm run dev`, then open http://localhost:3000.
6. Go to **Your list**, sign in with your email, save a profile, fill in a few slots.
7. Make yourself an admin (see Admin below), then open `/admin` and press **Approve** next to your handle. Your page and the `/nyc` index update right away.

## Deploy

1. Push this repo to GitHub.
2. Import it at vercel.com, add the three environment variables from `.env.local`, deploy.
3. In Supabase, add `https://YOUR-DOMAIN/auth/callback` to Redirect URLs and set `NEXT_PUBLIC_SITE_URL` on Vercel to `https://YOUR-DOMAIN`.

## Admin

Approval is manual on purpose, and happens at `/admin`. To make a user an admin, sign in once with their email, then set `app_metadata.role = 'admin'` on their auth user in Supabase **Authentication > Users**, or:
`update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = 'you@example.com';`
Then sign out and back in so the new role takes effect. Approving in SQL directly (`update curators set approved_at = now() ...`) still works, but the `/nyc` index can take a couple of minutes to show it.

## Not built yet (see the build plan)

- The six-month confirmation email and the 30-day follow-up (phase 3, Python jobs)
- Google Business status check for closed shops (phase 3)
- Vendor dashboard and any payment (phase 4)
