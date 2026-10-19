import { cacheLife, cacheTag } from "next/cache";
import { supabasePublic } from "./supabase/public";
import type { Category, Curator, Listing, Metro } from "./types";

/* Cached public reads. Every function here is tagged so a curator's save
 * (dashboard/actions.ts) can expire exactly the pages it touched. */

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
  return { categories: (c.data ?? []) as Category[], metros: (m.data ?? []) as Metro[] };
}

export async function getApprovedCurators(metro: string): Promise<Curator[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.curators(metro));
  const { data } = await supabasePublic
    .from("curators")
    .select("id, handle, metro, display_name, bio, approved_at")
    .eq("metro", metro)
    .not("approved_at", "is", null)
    .order("display_name");
  return (data ?? []) as Curator[];
}

export async function getCuratorPage(
  metro: string,
  handle: string,
): Promise<{ curator: Curator; listings: Listing[] } | null> {
  "use cache";
  cacheLife("max");
  cacheTag(tags.curator(metro, handle));
  const { data: curator } = await supabasePublic
    .from("curators")
    .select("id, handle, metro, display_name, bio, approved_at")
    .eq("metro", metro)
    .eq("handle", handle)
    .not("approved_at", "is", null)
    .maybeSingle();
  if (!curator) return null;
  const { data: listings } = await supabasePublic
    .from("listings")
    .select("id, curator_id, vendor_id, note, confirmed_at, position, vendor:vendors(*)")
    .eq("curator_id", curator.id)
    .order("position");
  return { curator: curator as Curator, listings: (listings ?? []) as unknown as Listing[] };
}

/** Destination for /go/{listing}. Cached so a viral page never hits the DB per click. */
export async function getGoTarget(listingId: string): Promise<string | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(tags.go(listingId));
  const { data } = await supabasePublic
    .from("listings")
    .select("vendor:vendors(website, instagram, status)")
    .eq("id", listingId)
    .maybeSingle();
  const v = (data as unknown as { vendor: { website: string; instagram: string; status: string } } | null)?.vendor;
  if (!v || v.status === "closed") return null;
  if (v.website) return v.website;
  if (v.instagram) return `https://instagram.com/${v.instagram.replace(/^@/, "")}`;
  return null;
}
