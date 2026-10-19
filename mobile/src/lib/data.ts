import { supabase } from "./supabase";
import type { Category, Curator, Listing, Metro } from "./types";

function check<T>(r: { data: T; error: { message: string } | null }, what: string): T {
  if (r.error) throw new Error(`Could not load ${what}. Check your connection and try again.`);
  return r.data;
}

/** Where "start a list" sends people: curators sign up and edit on the website. */
export const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL || "https://throttledex.com";

/** Every city with its number of approved lists. Live cities first, then "coming soon". Same order as the website. */
export async function getCities(): Promise<(Metro & { lists: number })[]> {
  const [m, c] = await Promise.all([
    supabase.from("metros").select("*"),
    supabase.from("curators").select("metro").not("approved_at", "is", null),
  ]);
  const counts = new Map<string, number>();
  for (const r of (check(c, "cities") ?? []) as { metro: string }[]) counts.set(r.metro, (counts.get(r.metro) ?? 0) + 1);
  return ((check(m, "cities") ?? []) as Metro[])
    .map((x) => ({ ...x, lists: counts.get(x.slug) ?? 0 }))
    .sort((a, b) => Number(b.lists > 0) - Number(a.lists > 0) || a.name.localeCompare(b.name));
}

export async function getCurators(metro: string): Promise<{ metro: Metro | null; curators: Curator[] }> {
  const [m, c] = await Promise.all([
    supabase.from("metros").select("*").eq("slug", metro).maybeSingle(),
    supabase
      .from("curators")
      .select("id, handle, metro, display_name, bio, approved_at")
      .eq("metro", metro)
      .not("approved_at", "is", null)
      .order("display_name"),
  ]);
  return { metro: check(m, "city") as Metro | null, curators: (check(c, "lists") ?? []) as Curator[] };
}

export type CuratorPage = { curator: Curator; listings: Listing[]; categories: Category[]; metro: Metro | null };

/** One curator's list, or null if there is no approved curator with that handle. */
export async function getCuratorPage(metro: string, handle: string): Promise<CuratorPage | null> {
  const [cur, cats, m] = await Promise.all([
    supabase
      .from("curators")
      .select("id, handle, metro, display_name, bio, approved_at")
      .eq("metro", metro)
      .eq("handle", handle)
      .not("approved_at", "is", null)
      .maybeSingle(),
    supabase.from("categories").select("*").order("position"),
    supabase.from("metros").select("*").eq("slug", metro).maybeSingle(),
  ]);
  const curator = check(cur, "this list") as Curator | null;
  if (!curator) return null;
  const listings = check(
    await supabase
      .from("listings")
      .select("id, curator_id, vendor_id, note, confirmed_at, position, vendor:vendors(*)")
      .eq("curator_id", curator.id)
      .order("position"),
    "picks",
  );
  return {
    curator,
    listings: (listings ?? []) as unknown as Listing[],
    categories: (check(cats, "categories") ?? []) as Category[],
    metro: check(m, "city") as Metro | null,
  };
}

// One random id per app launch, so a curator's click count can tell repeat taps
// from new people without the app storing anything about the person.
const launchId = Math.random().toString(36).slice(2, 14);

/** Count a tap on a pick, same table the website's /go link writes to. Never blocks the tap. */
export function recordClick(listingId: string): void {
  void supabase
    .from("referrals")
    .insert({ listing_id: listingId, visitor_hash: `app:${launchId}` })
    .then(() => {}, () => {});
}

export function vendorLink(v: Listing["vendor"]): { url: string; label: string } | null {
  if (v.status === "closed") return null;
  if (v.website) return { url: v.website, label: "Website" };
  if (v.instagram) return { url: `https://instagram.com/${v.instagram.replace(/^@/, "")}`, label: "Instagram" };
  return null;
}
