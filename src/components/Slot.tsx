import type { Category, Listing } from "@/lib/types";
import { STALE_AFTER_MONTHS, monthsSince } from "@/lib/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmt(iso: string) {
  const d = new Date(iso + "T12:00:00Z");
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** One category slot on a curator page: a pick, or an honest empty. */
export function Slot({ category, listing, now }: { category: Category; listing?: Listing; now: Date }) {
  if (!listing) {
    return (
      <article className="grid content-start gap-1.5 rounded-lg border border-dashed border-line bg-open p-4">
        <div className="eyebrow flex justify-between gap-2"><span>{category.name}</span><span>open</span></div>
        <div className="text-[13px] text-ink-2">{category.purpose}</div>
        <div className="font-display text-2xl font-medium leading-tight text-ink-3">No pick yet</div>
      </article>
    );
  }
  const v = listing.vendor;
  const months = monthsSince(listing.confirmed_at, now);
  const stale = months > STALE_AFTER_MONTHS;
  const hasLink = Boolean(v.website || v.instagram);
  return (
    <article className="grid content-start gap-1.5 rounded-lg border border-line bg-paper p-4">
      <div className="eyebrow">{category.name}</div>
      <div className="text-[13px] text-ink-2">{category.purpose}</div>
      <div className="mt-1 font-display text-2xl font-semibold leading-tight break-words">{v.name}</div>
      {v.area && <div className="font-mono text-[12px] text-ink-2">{v.area}</div>}
      {listing.note && <div className="text-[14px] text-ink-2">{listing.note}</div>}
      <div className="mt-1 flex flex-wrap items-center gap-x-3.5 gap-y-2">
        {hasLink && (
          <a href={`/go/${listing.id}`} rel="noopener" className="border-b border-current text-[13.5px] font-medium text-accent no-underline hover:border-b-2">
            {v.website ? "Website" : "Instagram"}
          </a>
        )}
        {v.phone && <span className="font-mono text-[12px] text-ink-2 select-all">{v.phone}</span>}
        <span className={`font-mono text-[11.5px] ${stale ? "text-warn" : "text-good"}`}>
          {stale ? "needs re-check, last confirmed " : "confirmed "}{fmt(listing.confirmed_at)}
        </span>
        {v.status === "paused" && <span className="font-mono text-[11.5px] text-warn">taking a break from new work</span>}
      </div>
    </article>
  );
}
