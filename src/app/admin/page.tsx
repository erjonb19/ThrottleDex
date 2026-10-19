import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { supabaseServer } from "@/lib/supabase/server";
import { approveCurator, revokeCurator } from "./actions";

export const metadata = { title: "Admin", robots: { index: false } };

type Row = {
  id: string;
  handle: string;
  metro: string;
  display_name: string;
  bio: string;
  approved_at: string | null;
  created_at: string;
  listings: { id: string; vendor: { name: string; category: string } }[];
};

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <Suspense fallback={<p className="text-ink-3">Loading…</p>}>
      <AdminBody searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminBody({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  await connection();
  const [q, supabase] = await Promise.all([searchParams, supabaseServer()]);
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return <p>Please <Link href="/login" className="text-accent">sign in</Link>.</p>;
  if (auth.user.app_metadata?.role !== "admin") {
    return <p className="text-ink-2">This page is for ThrottleDex admins only.</p>;
  }

  const { data } = await supabase
    .from("curators")
    .select("id, handle, metro, display_name, bio, approved_at, created_at, listings(id, vendor:vendors(name, category))")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as unknown as Row[];
  const pending = rows.filter((r) => !r.approved_at);
  const approved = rows.filter((r) => r.approved_at);
  const flash =
    q.done === "approved" ? `Approved ${q.handle}. Their page is live now.`
    : q.done === "revoked" ? `Removed approval for ${q.handle}. Their page is hidden now.`
    : q.error ? `Could not save: ${String(q.error)}` : "";

  return (
    <div className="grid gap-8">
      <header className="border-b-[6px] border-stripe pb-4">
        <div className="eyebrow">Admin</div>
        <h1 className="font-display text-5xl font-bold leading-[.95]">Curator review</h1>
        <p className="mt-2 text-ink-2">Approve a list when you would send your own friend to the shops on it.</p>
      </header>
      {flash && <p className={`font-mono text-[12.5px] ${q.error ? "text-bad" : "text-good"}`}>{flash}</p>}

      <section>
        <h2 className="font-display text-[26px] font-semibold uppercase">Waiting for review <small className="font-mono text-[12px] font-normal text-ink-3">{pending.length}</small></h2>
        {pending.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-line bg-open p-4 text-ink-2">Nobody is waiting.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {pending.map((r) => <CuratorCard key={r.id} row={r} action="approve" />)}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-[26px] font-semibold uppercase">Live <small className="font-mono text-[12px] font-normal text-ink-3">{approved.length}</small></h2>
        <ul className="mt-3 grid gap-3">
          {approved.map((r) => <CuratorCard key={r.id} row={r} action="revoke" />)}
        </ul>
      </section>
    </div>
  );
}

function CuratorCard({ row, action }: { row: Row; action: "approve" | "revoke" }) {
  return (
    <li className="grid gap-2 rounded-lg border border-line bg-paper p-4" data-handle={row.handle}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="font-display text-2xl font-semibold">{row.display_name}</div>
          <div className="font-mono text-[12px] text-ink-3">/{row.metro}/{row.handle} · joined {row.created_at.slice(0, 10)}</div>
        </div>
        <form action={action === "approve" ? approveCurator : revokeCurator}>
          <input type="hidden" name="curator_id" value={row.id} />
          <button type="submit" className={action === "approve" ? "btn btn-primary" : "btn"}>
            {action === "approve" ? "Approve" : "Remove approval"}
          </button>
        </form>
      </div>
      {row.bio && <p className="text-[14px] text-ink-2">{row.bio}</p>}
      <div className="text-[13.5px] text-ink-2">
        {row.listings.length === 0
          ? "No picks yet."
          : <>{row.listings.length} pick{row.listings.length === 1 ? "" : "s"}: {row.listings.map((l) => l.vendor.name).join(", ")}</>}
      </div>
      {action === "revoke" && (
        <Link href={`/${row.metro}/${row.handle}`} className="text-[13.5px] text-accent">View public page</Link>
      )}
    </li>
  );
}
