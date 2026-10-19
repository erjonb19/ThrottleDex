import { cacheLife, cacheTag } from "next/cache";
import { supabasePublic } from "./supabase/public";
import type { Category, Curator, Listing, Metro } from "./types";

/* Cached public reads. Every function here is tagged so a curator's save
 * (dashboard/actions.ts) can expire exactly the pages it touched. */

/** Throw on a database error instead of returning empty. A thrown read is never
 * cached, so a brief outage can't freeze an empty list or a false "not found". */
function check<T>(r: { data: T; error: { message: string } | null }, what: string): T {
  if (r.error) throw new Error(`ThrottleDex: could not load ${what}: ${r.error.message}`);
  return r.data;
}

export const tags = {
  reference: "reference",
  curators: (metro: string) => `curators:${metro}`,
  curator: (metro: string, handle: string) => `curator:${metro}:${handle}`,
  go: (listingId: string) => `go:${listingId}`,
};

export async function getReference(): Promise<{ categories: Category[]; metros: Metro[] }> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.reference);
  const [c, m] = await Promise.all([
    supabasePublic.from("categories").select("*").order("position"),
    supabasePublic.from("metros").select("*").order("name"),
  ]);
  return {
    categories: (check(c, "categories") ?? []) as Category[],
    metros: (check(m, "metros") ?? []) as Metro[],
  };
}

export async function getApprovedCurators(metro: string): Promise<Curator[]> {
  "use cache";
  // The admin page expires this tag on approve/revoke. "minutes" is the backstop
  // for approvals made directly in the database.
  cacheLife("minutes");
  cacheTag(tags.curators(metro));
  const res = await supabasePublic
    .from("curators")
    .select("id, handle, metro, display_name, bio, approved_at")
    .eq("metro", metro)
    .not("approved_at", "is", null)
    .order("display_name");
  return (check(res, "curators") ?? []) as Curator[];
}

/** Every city with how many approved lists it has. Live cities first, then "coming soon". */
export async function getCities(): Promise<(Metro & { lists: number })[]> {
  "use cache";
  cacheLife("minutes");
  const { metros } = await getReference();
  cacheTag(tags.reference, ...metros.map((m) => tags.curators(m.slug)));
  const res = await supabasePublic.from("curators").select("metro").not("approved_at", "is", null);
  const counts = new Map<string, number>();
  for (const r of check(res, "cities") ?? []) counts.set(r.metro, (counts.get(r.metro) ?? 0) + 1);
  return metros
    .map((m) => ({ ...m, lists: counts.get(m.slug) ?? 0 }))
    .sort((a, b) => Number(b.lists > 0) - Number(a.lists > 0) || a.name.localeCompare(b.name));
}

export async function getCuratorPage(
  metro: string,
  handle: string,
): Promise<{ curator: Curator; listings: Listing[] } | null> {
  "use cache";
  cacheTag(tags.curator(metro, handle));
  const curator = check(
    await supabasePublic
      .from("curators")
      .select("id, handle, metro, display_name, bio, approved_at")
      .eq("metro", metro)
      .eq("handle", handle)
      .not("approved_at", "is", null)
      .maybeSingle(),
    "curator",
  );
  if (!curator) {
    // Hold "not found" briefly: the curator may be approved a minute from now.
    // 30s refresh, 5 min expiry is the shortest lifetime Next.js still prerenders.
    cacheLife({ stale: 30, revalidate: 30, expire: 300 });
    return null;
  }
  // Real pages cache long; every curator save expires this tag immediately.
  cacheLife("max");
  const listings = check(
    await supabasePublic
      .from("listings")
      .select("id, curator_id, vendor_id, note, confirmed_at, position, vendor:vendors(*)")
      .eq("curator_id", curator.id)
      .order("position"),
    "listings",
  );
  return { curator: curator as Curator, listings: (listings ?? []) as unknown as Listing[] };
}

/** Destination for /go/{listing}. Cached so a viral page never hits the DB per click. */
export async function getGoTarget(listingId: string): Promise<string | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.go(listingId));
  const data = check(
    await supabasePublic
      .from("listings")
      .select("vendor:vendors(website, instagram, status)")
      .eq("id", listingId)
      .maybeSingle(),
    "link",
  );
  const v = (data as unknown as { vendor: { website: string; instagram: string; status: string } } | null)?.vendor;
  if (!v || v.status === "closed") return null;
  if (v.website) return v.website;
  if (v.instagram) return `https://instagram.com/${v.instagram.replace(/^@/, "")}`;
  return null;
}
