"use client";

import { useState } from "react";
import type { Tier } from "@/lib/types";

const LABELS: Record<Tier, string> = {
  enthusiast: "Enthusiast",
  commuter: "Commuter",
  luxury: "Luxury and exotic",
  collector: "Collector and show",
  working: "Working cars",
};

/**
 * Filters the slots below it by tier, entirely in the browser, so the curator
 * page itself stays one cached HTML page. Hiding is done with CSS rules keyed
 * on data-filter (see globals.css); this component only sets the attribute.
 */
export function TierFilter({ counts, children }: { counts: Partial<Record<Tier, number>>; children: React.ReactNode }) {
  const [tier, setTier] = useState<Tier | "all">("all");
  const tiers = (Object.keys(LABELS) as Tier[]).filter((t) => (counts[t] ?? 0) > 0);

  return (
    <div data-filter={tier} className="mt-6">
      {tiers.length > 1 && (
        <div role="group" aria-label="Filter picks by who they are good for" className="flex flex-wrap gap-2">
          <FilterButton active={tier === "all"} onClick={() => setTier("all")}>All</FilterButton>
          {tiers.map((t) => (
            <FilterButton key={t} active={tier === t} onClick={() => setTier(t)}>
              {LABELS[t]} <span className="font-mono text-[11px] opacity-70">{counts[t]}</span>
            </FilterButton>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-[13px] font-medium ${active ? "border-accent bg-accent text-accent-ink" : "border-line bg-paper text-ink hover:border-ink-3"}`}
    >
      {children}
    </button>
  );
}
