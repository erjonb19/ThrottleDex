// Same shapes as the website (src/lib/types.ts at the repo root). Keep the two in step.

export type Tier = "commuter" | "enthusiast" | "luxury" | "collector" | "working";

export const TIERS: { slug: Tier; name: string; who: string }[] = [
  { slug: "enthusiast", name: "Enthusiast", who: "Weekend cars, track days, mods" },
  { slug: "commuter", name: "Commuter", who: "Normal cars, price first" },
  { slug: "luxury", name: "Luxury and exotic", who: "Porsche, Ferrari, high-end German" },
  { slug: "collector", name: "Collector and show", who: "Classics, concours, auctions" },
  { slug: "working", name: "Working cars", who: "TLC and rideshare, small fleets, dealers" },
];

export type Category = {
  slug: string;
  group_name: string;
  name: string;
  purpose: string;
  position: number;
};

export type Metro = { slug: string; name: string; areas: string[] };

export type Curator = {
  id: string;
  handle: string;
  metro: string;
  display_name: string;
  bio: string;
  approved_at: string | null;
};

export type Vendor = {
  id: string;
  metro: string;
  category: string;
  name: string;
  area: string;
  website: string;
  instagram: string;
  phone: string;
  tiers: Tier[];
  status: "active" | "paused" | "closed";
};

export type Listing = {
  id: string;
  curator_id: string;
  vendor_id: string;
  note: string;
  confirmed_at: string;
  position: number;
  vendor: Vendor;
};

/** Months since a YYYY-MM-DD date, for the stale flag. */
export function monthsSince(iso: string, now = new Date()): number {
  const d = new Date(iso + "T12:00:00Z");
  return (now.getUTCFullYear() - d.getUTCFullYear()) * 12 + (now.getUTCMonth() - d.getUTCMonth());
}

export const STALE_AFTER_MONTHS = 9;
