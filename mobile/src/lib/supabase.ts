import { createClient } from "@supabase/supabase-js";

/*
 * Read-only client for the public lists. Uses the publishable (public) key only,
 * which is safe to ship inside an app: row-level security decides what it can see.
 * Never put the service role key in this app.
 *
 * Defaults point at the live ThrottleDex project. Override with
 * EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY (e.g. in .env.local)
 * to test against another database.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://iejbzybxsclcywtlqyfn.supabase.co";
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_LvSCvTt0Fxyk2Kg39J-58Q_BScQMh9m";

// Nobody signs in on the phone yet (curators edit on the website), so no session storage.
export const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
