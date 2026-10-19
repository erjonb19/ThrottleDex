"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { tags } from "@/lib/data";
import { supabaseServer } from "@/lib/supabase/server";
import type { Tier } from "@/lib/types";

const TIER_SET = new Set<Tier>(["commuter", "enthusiast", "luxury", "collector", "working"]);
const s = (v: FormDataEntryValue | null, max = 200) => String(v ?? "").trim().slice(0, max);

async function requireCurator() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data: curator } = await supabase.from("curators").select("*").eq("user_id", auth.user.id).maybeSingle();
  return { supabase, user: auth.user, curator };
}

function expireCuratorPages(metro: string, handle: string) {
  updateTag(tags.curator(metro, handle));
  updateTag(tags.curators(metro));
}

/** Create or update the curator's own profile. Approval is separate and admin-only. */
export async function saveProfile(formData: FormData) {
  const { supabase, user, curator } = await requireCurator();
  const handle = s(formData.get("handle"), 32).toLowerCase();
  const display_name = s(formData.get("display_name"), 60);
  const bio = s(formData.get("bio"), 600);
  const metro = s(formData.get("metro"), 20) || "nyc";
  if (!/^[a-z0-9][a-z0-9-]{1,30}$/.test(handle)) redirect("/dashboard?error=handle");
  if (!display_name) redirect("/dashboard?error=name");

  const row = { handle, display_name, bio, metro };
  const { error } = curator
    ? await supabase.from("curators").update(row).eq("id", curator.id)
    : await supabase.from("curators").insert({ ...row, user_id: user.id });
  if (error) redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);

  if (curator) expireCuratorPages(curator.metro, curator.handle);
  expireCuratorPages(metro, handle);
  redirect("/dashboard?saved=profile");
}

/**
 * Save one slot: find or create the vendor, then upsert this curator's listing for it.
 * An empty vendor name clears the slot.
 */
export async function saveSlot(formData: FormData) {
  const { supabase, curator } = await requireCurator();
  if (!curator) redirect("/dashboard?error=profile-first");

  const category = s(formData.get("category"), 40);
  const name = s(formData.get("name"), 120);
  const existingListingId = s(formData.get("listing_id"), 40);

  if (!name) {
    if (existingListingId) await supabase.from("listings").delete().eq("id", existingListingId).eq("curator_id", curator.id);
    expireCuratorPages(curator.metro, curator.handle);
    if (existingListingId) updateTag(tags.go(existingListingId));
    redirect(`/dashboard?saved=${category}#${category}`);
  }

  const tiers = formData.getAll("tiers").map(String).filter((t): t is Tier => TIER_SET.has(t as Tier));
  const vendorInput = {
    metro: curator.metro,
    category,
    name,
    area: s(formData.get("area"), 60),
    website: normalizeUrl(s(formData.get("website"), 300)),
    instagram: s(formData.get("instagram"), 60).replace(/^@/, ""),
    phone: s(formData.get("phone"), 30),
    tiers: tiers.length ? tiers : ["enthusiast"],
  };

  // Reuse a vendor with the same name in the same metro and category, so "listed by 4 curators" is possible.
  let vendorId = s(formData.get("vendor_id"), 40);
  if (!vendorId) {
    const { data: match } = await supabase
      .from("vendors").select("id").eq("metro", curator.metro).eq("category", category).ilike("name", name).maybeSingle();
    vendorId = match?.id ?? "";
  }
  if (vendorId) {
    await supabase.from("vendors").update(vendorInput).eq("id", vendorId).eq("created_by", curator.id);
  } else {
    const { data: created, error } = await supabase.from("vendors").insert({ ...vendorInput, created_by: curator.id }).select("id").single();
    if (error || !created) redirect(`/dashboard?error=${encodeURIComponent(error?.message ?? "vendor")}`);
    vendorId = created.id;
  }

  const confirmed_at = /^\d{4}-\d{2}-\d{2}$/.test(s(formData.get("confirmed_at"))) ? s(formData.get("confirmed_at")) : new Date().toISOString().slice(0, 10);
  const listing = { curator_id: curator.id, vendor_id: vendorId, note: s(formData.get("note"), 240), confirmed_at };

  // Replace whatever listing this curator had in this category.
  if (existingListingId) await supabase.from("listings").delete().eq("id", existingListingId).eq("curator_id", curator.id);
  const { data: saved, error } = await supabase.from("listings").upsert(listing, { onConflict: "curator_id,vendor_id" }).select("id").single();
  if (error) redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);

  expireCuratorPages(curator.metro, curator.handle);
  if (existingListingId) updateTag(tags.go(existingListingId));
  if (saved) updateTag(tags.go(saved.id));
  redirect(`/dashboard?saved=${category}#${category}`);
}

/** One-click "still my pick" on an existing listing. */
export async function confirmSlot(formData: FormData) {
  const { supabase, curator } = await requireCurator();
  if (!curator) redirect("/dashboard");
  const id = s(formData.get("listing_id"), 40);
  await supabase.from("listings").update({ confirmed_at: new Date().toISOString().slice(0, 10) }).eq("id", id).eq("curator_id", curator.id);
  expireCuratorPages(curator.metro, curator.handle);
  redirect("/dashboard?saved=confirm");
}

function normalizeUrl(u: string) {
  if (!u) return "";
  const withScheme = /^https?:\/\//i.test(u) ? u : `https://${u}`;
  try { return new URL(withScheme).href; } catch { return ""; }
}
