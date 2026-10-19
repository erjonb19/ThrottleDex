import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-less anon client for public reads inside `'use cache'` functions.
 * It never sees a session, so Row Level Security treats it as an anonymous
 * visitor: approved curators, their listings, vendors, reference data.
 */
export const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
