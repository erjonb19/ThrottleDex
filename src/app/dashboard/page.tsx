import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { getReference } from "@/lib/data";
import { supabaseServer } from "@/lib/supabase/server";
import { TIERS, type Category, type Listing, type Metro } from "@/lib/types";
import { signOut } from "../login/actions";
import { confirmSlot, saveProfile, saveSlot } from "./actions";

export const metadata = { title: "Your list" };

export default function Dashboard({ searchParams }: PageProps<"/dashboard">) {
  return (
    <Suspense fallback={<p className="text-ink-3">Loading your list…</p>}>
      <DashboardBody searchParams={searchParams} />
    </Suspense>
  );
}

async function DashboardBody({ searchParams }: Pick<PageProps<"/dashboard">, "searchParams">) {
  // Per-person page that reads today's date for the "last confirmed" default: always render at request time.
  await connection();
  const [q, { categories, metros }, supabase] = await Promise.all([searchParams, getReference(), supabaseServer()]);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return <p>Please <Link href="/login" className="text-accent">sign in</Link>.</p>;

  const { data: curator } = await supabase.from("curators").select("*").eq("user_id", auth.user.id).maybeSingle();
  const { data: listingsRaw } = curator
    ? await supabase.from("listings").select("id, curator_id, vendor_id, note, confirmed_at, position, vendor:vendors(*)").eq("curator_id", curator.id)
    : { data: [] };
  const listings = (listingsRaw ?? []) as unknown as Listing[];
  const { data: clicks } = curator && listings.length
    ? await supabase.from("listing_click_counts").select("listing_id, clicks").in("listing_id", listings.map((l) => l.id))
    : { data: [] };
  const clickMap = new Map((clicks ?? []).map((c) => [c.listing_id as string, c.clicks as number]));
  const byCategory = new Map(listings.map((l) => [l.vendor.category, l]));
  const groups = [...new Set(categories.map((c) => c.group_name))];
  const flash = q.saved ? "Saved." : q.error ? `Could not save: ${String(q.error)}` : "";

  return (
    <div className="grid gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b-[6px] border-stripe pb-4">
        <div>
          <div className="eyebrow">Signed in as {auth.user.email}</div>
          <h1 className="mt-1 font-display text-5xl font-bold leading-[.95]">Your list</h1>
        </div>
        <div className="flex items-center gap-3">
          {curator?.approved_at && <Link href={`/${curator.metro}/${curator.handle}`} className="btn">View public page</Link>}
          <form action={signOut}><button className="btn" type="submit">Sign out</button></form>
        </div>
      </header>

      {flash && <p className={`font-mono text-[12.5px] ${q.error ? "text-bad" : "text-good"}`}>{flash}</p>}

      <ProfileForm curator={curator} metros={metros} />

      {!curator ? (
        <p className="rounded-lg border border-dashed border-line bg-open p-4 text-ink-2">Save your profile first, then the slots below unlock.</p>
      ) : !curator.approved_at ? (
        <p className="rounded-lg border border-line bg-paper p-4 text-ink-2">
          Your list is private until we approve it. Fill in your picks now; we review by hand and email you when it is live.
        </p>
      ) : null}

      {curator && groups.map((g) => (
        <section key={g}>
          <h2 className="font-display text-[26px] font-semibold uppercase">{g}</h2>
          <div className="mt-3 grid gap-3">
            {categories.filter((c) => c.group_name === g).map((c) => (
              <SlotForm key={c.slug} category={c} listing={byCategory.get(c.slug)} clicks={clickMap.get(byCategory.get(c.slug)?.id ?? "") ?? 0} metro={metros.find((m) => m.slug === curator.metro)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ProfileForm({ curator, metros }: { curator: { handle: string; display_name: string; bio: string; metro: string; approved_at: string | null } | null; metros: Metro[] }) {
  return (
    <form action={saveProfile} className="grid gap-3 rounded-lg border border-line bg-paper p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold uppercase">Profile</h2>
        <span className="eyebrow">{curator ? (curator.approved_at ? "approved" : "awaiting review") : "not set up"}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="label">Display name<input id="display_name" name="display_name" required maxLength={60} defaultValue={curator?.display_name ?? ""} className="field" /></label>
        <label className="label">Handle (your URL)<input id="handle" name="handle" required pattern="[a-z0-9][a-z0-9-]{1,30}" defaultValue={curator?.handle ?? ""} placeholder="first-name" className="field" /></label>
        <label className="label">City
          <select id="metro" name="metro" defaultValue={curator?.metro ?? "nyc"} className="field">
            {metros.map((m) => <option key={m.slug} value={m.slug}>{m.name}</option>)}
          </select>
        </label>
      </div>
      <label className="label">Who you are and what you drive, in a line or two
        <textarea id="bio" name="bio" rows={2} maxLength={600} defaultValue={curator?.bio ?? ""} className="field" />
      </label>
      <div><button className="btn btn-primary" type="submit">Save profile</button></div>
    </form>
  );
}

function SlotForm({ category, listing, clicks, metro }: { category: Category; listing?: Listing; clicks: number; metro?: Metro }) {
  const v = listing?.vendor;
  return (
    <form id={category.slug} action={saveSlot} className={`grid gap-3 rounded-lg border p-4 ${listing ? "border-line bg-paper" : "border-dashed border-line bg-open"}`}>
      <input type="hidden" name="category" value={category.slug} />
      <input type="hidden" name="listing_id" value={listing?.id ?? ""} />
      <input type="hidden" name="vendor_id" value={listing?.vendor_id ?? ""} />
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="eyebrow">{category.name}</div>
          <div className="text-[13px] text-ink-2">{category.purpose}</div>
        </div>
        {listing && <span className="font-mono text-[12px] text-ink-2">{clicks} click{clicks === 1 ? "" : "s"} · confirmed {listing.confirmed_at}</span>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="label">Shop or person<input id={`name-${category.slug}`} name="name" maxLength={120} defaultValue={v?.name ?? ""} placeholder="Leave empty to clear this slot" className="field" /></label>
        <label className="label">Area
          <select id={`area-${category.slug}`} name="area" defaultValue={v?.area ?? ""} className="field">
            <option value="">Pick one</option>
            {(metro?.areas ?? []).map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label className="label">Website<input id={`website-${category.slug}`} name="website" maxLength={300} defaultValue={v?.website ?? ""} placeholder="shop.com" className="field" /></label>
        <label className="label">Instagram<input id={`instagram-${category.slug}`} name="instagram" maxLength={60} defaultValue={v?.instagram ?? ""} placeholder="@handle" className="field" /></label>
        <label className="label">Phone<input id={`phone-${category.slug}`} name="phone" maxLength={30} defaultValue={v?.phone ?? ""} className="field" /></label>
        <label className="label">Last confirmed<input id={`confirmed-${category.slug}`} name="confirmed_at" type="date" defaultValue={listing?.confirmed_at ?? new Date().toISOString().slice(0, 10)} className="field" /></label>
      </div>
      <label className="label">Why them, one line<input id={`note-${category.slug}`} name="note" maxLength={240} defaultValue={listing?.note ?? ""} className="field" /></label>
      <fieldset className="grid gap-1">
        <legend className="label">Good for</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13.5px]">
          {TIERS.map((t) => (
            <label key={t.slug} className="inline-flex items-center gap-1.5">
              <input type="checkbox" name="tiers" value={t.slug} defaultChecked={v ? v.tiers.includes(t.slug) : t.slug === "enthusiast"} />{t.name}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" type="submit">Save slot</button>
        {listing && <button className="btn" type="submit" formAction={confirmSlot}>Still my pick (confirm today)</button>}
      </div>
    </form>
  );
}
