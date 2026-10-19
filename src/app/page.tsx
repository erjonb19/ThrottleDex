import Link from "next/link";
import { TIERS } from "@/lib/types";

export default function Home() {
  return (
    <div className="grid gap-10">
      <section className="border-b-[6px] border-stripe pb-6">
        <div className="eyebrow">Who do you use for that?</div>
        <h1 className="mt-1 font-display text-5xl font-bold leading-[.95] sm:text-6xl">
          The car people real enthusiasts send their friends to.
        </h1>
        <p className="mt-5 max-w-[62ch] text-base text-ink-2">
          Every car person is already the referral desk for their friends. This is their list, written down:
          the PPF shop, the dent guy, the honest mechanic, the appraiser who actually picks up. One city at a time,
          vouched for by a name, re-checked every six months, and nobody pays to be on it.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/nyc" className="btn btn-primary">Browse NYC lists</Link>
          <Link href="/login" className="btn">Publish your own list</Link>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold uppercase">Built for the way people actually ask</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {TIERS.map((t) => (
            <div key={t.slug} className={`rounded-lg border p-4 ${t.slug === "enthusiast" ? "border-accent bg-paper" : "border-line bg-open"}`}>
              <div className="font-display text-xl font-semibold">{t.name}</div>
              <div className="text-[13.5px] text-ink-2">{t.who}</div>
              <div className="eyebrow mt-2">{t.slug === "enthusiast" ? "live in NYC" : "coming after launch"}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[64ch] text-[14.5px] text-ink-2">
        <h2 className="font-display text-2xl font-semibold uppercase text-ink">How a list stays worth something</h2>
        <ol className="mt-2 grid list-decimal gap-1 pl-5">
          <li>A curator only lists shops they have paid themselves, or sent a friend to on their own name.</li>
          <li>Every six months we ask the curator: still your pick? Shops change hands, lose their best painter, close.</li>
          <li>Thirty days after you click through, we ask you how it went. A bad outcome flags the pick.</li>
          <li>A pick not confirmed in nine months is marked until the curator deals with it.</li>
        </ol>
      </section>
    </div>
  );
}
