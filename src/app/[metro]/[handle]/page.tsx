import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { Slot } from "@/components/Slot";
import { getCuratorPage, getReference } from "@/lib/data";

export async function generateStaticParams() {
  // Pages not listed here render on first visit and are then cached (ISR).
  return [{ metro: "nyc", handle: "about" }];
}

export async function generateMetadata({ params }: PageProps<"/[metro]/[handle]">): Promise<Metadata> {
  const { metro, handle } = await params;
  const page = await getCuratorPage(metro, handle);
  if (!page) return { title: "Not found" };
  return {
    title: `${page.curator.display_name}'s car people`,
    description: page.curator.bio || `Trusted car vendors in ${metro.toUpperCase()}, vouched for by ${page.curator.display_name}.`,
  };
}

export default async function CuratorPage({ params }: PageProps<"/[metro]/[handle]">) {
  const { metro, handle } = await params;
  const [page, { categories, metros }] = await Promise.all([getCuratorPage(metro, handle), getReference()]);
  if (!page) notFound();
  const { curator, listings } = page;
  const m = metros.find((x) => x.slug === metro);
  const byCategory = new Map(listings.map((l) => [l.vendor.category, l]));
  const groups = [...new Set(categories.map((c) => c.group_name))];
  const filled = listings.length;

  return (
    <div className="grid gap-2">
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b-[6px] border-stripe pb-4">
        <div>
          <div className="eyebrow">{m?.name ?? metro} · trusted list</div>
          <h1 className="mt-1 font-display text-5xl font-bold leading-[.95] sm:text-6xl">{curator.display_name}&apos;s car people</h1>
        </div>
        <div className="grid gap-0.5 font-mono text-[12px] text-ink-2 sm:text-right">
          <span>{filled} of {categories.length} slots filled</span>
        </div>
      </header>
      {curator.bio && <p className="mt-4 max-w-[62ch] text-base text-ink-2">{curator.bio}</p>}
      {m && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {m.areas.map((a) => (
            <span key={a} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11.5px] text-ink-2">{a}</span>
          ))}
        </div>
      )}

      {/* Staleness depends on today's date, so it renders at request time inside Suspense;
          the rest of the page is a static shell. */}
      <Suspense fallback={<SlotsSkeleton count={categories.length} />}>
        <Slots groups={groups} categories={categories} byCategory={byCategory} />
      </Suspense>

      <aside className="mt-10 max-w-[64ch] border-t border-line pt-4 text-[14px] text-ink-2">
        <h2 className="font-display text-xl font-semibold uppercase text-ink">How this list works</h2>
        <ol className="mt-1.5 grid list-decimal gap-1 pl-5">
          <li>Every name here is someone {curator.display_name} has paid, or sent a friend to on their own name.</li>
          <li>Picks are re-checked about every six months. Shops change hands, lose their best painter, or close.</li>
          <li>A pick not confirmed in nine months is flagged until it is.</li>
          <li>Nobody pays to be on this list.</li>
        </ol>
        <p className="mt-2.5">If a referral from here goes badly, tell us. That is the only way the list stays worth anything.</p>
      </aside>
    </div>
  );
}

async function Slots({
  groups, categories, byCategory,
}: { groups: string[]; categories: Awaited<ReturnType<typeof getReference>>["categories"]; byCategory: Map<string, Parameters<typeof Slot>[0]["listing"]> }) {
  await connection();
  const now = new Date();
  return (
    <>
      {groups.map((g) => {
        const cats = categories.filter((c) => c.group_name === g);
        const n = cats.filter((c) => byCategory.has(c.slug)).length;
        return (
          <section key={g} className="mt-9">
            <h2 className="flex items-baseline gap-3 font-display text-[26px] font-semibold uppercase">
              {g}<small className="font-mono text-[12px] font-normal normal-case tracking-[.06em] text-ink-3">{n}/{cats.length}</small>
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {cats.map((c) => <Slot key={c.slug} category={c} listing={byCategory.get(c.slug)} now={now} />)}
            </div>
          </section>
        );
      })}
    </>
  );
}

function SlotsSkeleton({ count }: { count: number }) {
  return (
    <div className="mt-9 grid gap-3 sm:grid-cols-2" aria-hidden>
      {Array.from({ length: Math.min(count, 8) }).map((_, i) => (
        <div key={i} className="h-28 rounded-lg border border-line bg-open" />
      ))}
    </div>
  );
}
