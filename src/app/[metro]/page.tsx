import Link from "next/link";
import { notFound } from "next/navigation";
import { getApprovedCurators, getReference } from "@/lib/data";

export async function generateStaticParams() {
  return [{ metro: "nyc" }];
}

export default async function MetroPage({ params }: PageProps<"/[metro]">) {
  const { metro } = await params;
  const { metros } = await getReference();
  const m = metros.find((x) => x.slug === metro);
  if (!m) notFound();
  const curators = await getApprovedCurators(metro);

  return (
    <div className="grid gap-6">
      <header className="border-b-[6px] border-stripe pb-4">
        <div className="eyebrow">{m.name}</div>
        <h1 className="font-display text-5xl font-bold leading-[.95]">Whose list do you trust?</h1>
        <p className="mt-3 max-w-[60ch] text-ink-2">
          Each list below belongs to one person who stands behind it. Pick someone whose cars and taste are close to yours.
        </p>
      </header>
      {curators.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-open p-5">
          <div className="eyebrow">Coming soon</div>
          <p className="mt-1 text-ink-2">
            {m.name} doesn&apos;t have a list yet. If you&apos;re the person friends ask &quot;who do you use for that?&quot;,
            start the first one. It goes live once we approve it.
          </p>
          <Link href="/login" className="btn btn-primary mt-3 inline-block">Start the first {m.name} list</Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {curators.map((c) => (
            <li key={c.id}>
              <Link href={`/${metro}/${c.handle}`} className="block rounded-lg border border-line bg-paper p-4 no-underline hover:border-ink-3">
                <div className="font-display text-2xl font-semibold text-ink">{c.display_name}</div>
                <div className="font-mono text-[12px] text-ink-3">/{metro}/{c.handle}</div>
                {c.bio && <p className="mt-2 line-clamp-3 text-[14px] text-ink-2">{c.bio}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
