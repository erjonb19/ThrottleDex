# ThrottleDex

The car people real enthusiasts send their friends to, one city at a time. A curator publishes a list of vendors by category, vouched for with their own name, re-checked every six months. Nobody pays to be listed.

Name chosen Oct 2026. Domain and trademark checks are the owner's next step.

## What is here

| Path | What it does |
| --- | --- |
| `supabase/migrations/0001_init.sql` | Tables, enums, row-level security, click-count view |
| `supabase/seed.sql` | The NYC metro and the 27 categories. No people or vendors. |
| `src/app/page.tsx` | Landing page |
| `src/app/[metro]/page.tsx` | All approved curators in a metro (`/nyc`) |
| `src/app/[metro]/[handle]/page.tsx` | One curator's public list (`/nyc/erjon`), cached and tagged |
| `src/app/go/[id]/route.ts` | Click-through redirect that records a referral, works signed out |
| `src/app/login/` | Magic-link sign in |
| `src/app/dashboard/` | Curator profile and one form per category slot |
| `src/lib/data.ts` | Cached public reads with cache tags |
| `src/proxy.ts` | Refreshes the session on `/dashboard` only |

## Run it locally

1. Create a free project at supabase.com.
2. In the Supabase dashboard open **SQL Editor**, paste the contents of `supabase/migrations/0001_init.sql`, run it. Then do the same with `supabase/seed.sql`.
3. In **Authentication > URL Configuration** add `http://localhost:3000/auth/callback` to Redirect URLs.
4. Copy `.env.example` to `.env.local` and fill in the URL and anon key from **Project Settings > API**.
5. `npm install`, then `npm run dev`, then open http://localhost:3000.
6. Go to **Your list**, sign in with your email, save a profile, fill in a few slots.
7. To make your list public, run this in the SQL Editor (replace the handle):
   `update curators set approved_at = now() where handle = 'your-handle';`

## Deploy

1. Push this repo to GitHub.
2. Import it at vercel.com, add the three environment variables from `.env.local`, deploy.
3. In Supabase, add `https://YOUR-DOMAIN/auth/callback` to Redirect URLs and set `NEXT_PUBLIC_SITE_URL` on Vercel to `https://YOUR-DOMAIN`.

## Admin

Approval is manual on purpose. To make a user an admin (can approve curators, change vendor status), set `app_metadata.role = 'admin'` on their auth user in Supabase **Authentication > Users**, or:
`update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = 'you@example.com';`

## Not built yet (see the build plan)

- The six-month confirmation email and the 30-day follow-up (phase 3, Python jobs)
- Google Business status check for closed shops (phase 3)
- Tier filters on the public page (the data is already tagged; phase 4)
- Vendor dashboard and any payment (phase 4)
