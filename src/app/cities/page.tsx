import type { Metadata } from "next";
import Link from "next/link";
import { getCities } from "@/lib/data";

export const metadata: Metadata = { title: "Cities" };

export default async function CitiesPage() {
  const cities = await getCities();
  return (
    <div className="grid gap-6">
      <header className="border-b-[6px] border-stripe pb-4">
        <div className="eyebrow">ThrottleDex</div>
        <h1 className="font-display text-5xl font-bold leading-[.95]">Pick a city</h1>
        <p className="mt-3 max-w-[60ch] text-ink-2">
          A city goes live when its first curator is approved. If yours says coming soon, you can be that person.
        </p>
      </header>
      <ul className="grid gap-3 sm:grid-cols-2">
        {cities.map((c) => (
          <li key={c.slug} data-city={c.slug}>
            <Link
              href={`/${c.slug}`}
              className={`block rounded-lg border p-4 no-underline hover:border-ink-3 ${c.lists > 0 ? "border-line bg-paper" : "border-dashed border-line bg-open"}`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-display text-2xl font-semibold text-ink">{c.name}</div>
                <span className={`eyebrow ${c.lists > 0 ? "text-good" : ""}`}>
                  {c.lists > 0 ? `${c.lists} ${c.lists === 1 ? "list" : "lists"}` : "coming soon"}
                </span>
              </div>
              <div className="mt-1 text-[13px] text-ink-2">{c.areas.filter((a) => !a.startsWith("Mobile")).join(" · ")}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
