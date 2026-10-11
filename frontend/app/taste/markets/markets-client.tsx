"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { SectorCategory } from "../../../lib/psx-scrips";

export type Member = {
  symbol: string;
  name?: string;
  sector?: SectorCategory;
  idx_weight: number;
  idx_point: number;
  market_cap_m: number | null;
};

const SECTORS: Array<"All" | SectorCategory> = [
  "All",
  "Banks",
  "Oil & Gas",
  "Fertilizer",
  "Cement",
  "Tech",
  "Power",
  "Pharma",
  "Automobile",
  "Textile",
];

type SortOrder = "default" | "gainers" | "losers";

const fmtCap = (m: number | null) =>
  m == null ? "n/a" : m >= 1000 ? `${(m / 1000).toFixed(1)}bn` : `${m.toFixed(0)}m`;

const fmtPoint = (p: number) =>
  `${p >= 0 ? "+" : "−"}${Math.abs(p).toFixed(2)}`;

const PAGE = 25;

export function MarketsClient({ members }: { members: Member[] }) {
  const [query, setQuery] = useState("");
  const [activeSector, setActiveSector] = useState<"All" | SectorCategory>("All");
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");
  const [limit, setLimit] = useState(PAGE);

  const filtered = useMemo(() => {
    let list = members;

    if (activeSector !== "All") {
      list = list.filter((m) => m.sector === activeSector);
    }

    const q = query.trim().toUpperCase();
    if (q) {
      list = list.filter((m) => {
        const symbolMatch = m.symbol.toUpperCase().includes(q);
        const nameMatch = m.name ? m.name.toUpperCase().includes(q) : false;
        const sectorMatch = m.sector ? m.sector.toUpperCase().includes(q) : false;
        return symbolMatch || nameMatch || sectorMatch;
      });
    }

    if (sortOrder === "gainers") {
      return [...list].sort((a, b) => b.idx_point - a.idx_point);
    }
    if (sortOrder === "losers") {
      return [...list].sort((a, b) => a.idx_point - b.idx_point);
    }

    return list;
  }, [members, query, activeSector, sortOrder]);

  const visible = filtered.slice(0, limit);

  return (
    <div className="mt-10">
      {/* search and sort controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="w-full max-w-lg">
          <label
            htmlFor="t-search"
            className="text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-night-ink-soft"
          >
            Search scrips
          </label>
          <input
            id="t-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
            placeholder="Search by symbol, name, or sector (e.g. OGDC, Meezan, Banks)..."
            autoComplete="off"
            spellCheck={false}
            aria-describedby="t-search-count"
            className="mt-2 min-h-[44px] w-full rounded-control border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none dark:border-night-line dark:bg-night-surface dark:text-night-ink dark:placeholder:text-night-ink-soft dark:focus:border-accent-bright"
          />
        </div>

        {/* sort by gainers / losers / weight */}
        <div className="flex items-center gap-1.5 self-start text-xs md:self-end">
          <span className="text-ink-soft dark:text-night-ink-soft">Sort:</span>
          <button
            type="button"
            onClick={() => setSortOrder("default")}
            className={`rounded-control px-2.5 py-1.5 transition-colors ${
              sortOrder === "default"
                ? "bg-ink font-medium text-paper dark:bg-night-ink dark:text-night"
                : "text-ink-soft hover:bg-accent-wash hover:text-ink dark:text-night-ink-soft dark:hover:bg-night-wash dark:hover:text-night-ink"
            }`}
          >
            Weight
          </button>
          <button
            type="button"
            onClick={() => setSortOrder("gainers")}
            className={`rounded-control px-2.5 py-1.5 transition-colors ${
              sortOrder === "gainers"
                ? "bg-emerald-600 font-medium text-white dark:bg-emerald-500"
                : "text-ink-soft hover:bg-emerald-50 hover:text-emerald-700 dark:text-night-ink-soft dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
            }`}
          >
            Gainers
          </button>
          <button
            type="button"
            onClick={() => setSortOrder("losers")}
            className={`rounded-control px-2.5 py-1.5 transition-colors ${
              sortOrder === "losers"
                ? "bg-rose-600 font-medium text-white dark:bg-rose-500"
                : "text-ink-soft hover:bg-rose-50 hover:text-rose-700 dark:text-night-ink-soft dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
            }`}
          >
            Losers
          </button>
        </div>
      </div>

      {/* category pills */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter by sector">
        {SECTORS.map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={activeSector === s}
            onClick={() => {
              setActiveSector(s);
              setLimit(PAGE);
            }}
            className={`rounded-control px-3 py-1.5 text-xs font-medium transition-colors ${
              activeSector === s
                ? "bg-ink text-paper dark:bg-night-ink dark:text-night"
                : "border border-line bg-surface text-ink-soft hover:bg-accent-wash hover:text-ink dark:border-night-line dark:bg-night-surface dark:text-night-ink-soft dark:hover:bg-night-wash dark:hover:text-night-ink"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <p id="t-search-count" className="t-figs mt-3 text-xs text-ink-soft dark:text-night-ink-soft" role="status">
        {filtered.length === members.length
          ? `${members.length} scrips`
          : `${filtered.length} of ${members.length} scrips ${
              activeSector !== "All" ? `in ${activeSector}` : ""
            }`}
      </p>

      {/* the list: a ledger, not a card grid */}
      <div className="mt-4 overflow-hidden rounded-surface border border-line bg-surface dark:border-night-line dark:bg-night-surface">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left dark:border-night-line">
              <th scope="col" className="px-5 py-3.5 text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-night-ink-soft">
                Scrip & Company
              </th>
              <th scope="col" className="hidden px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-night-ink-soft sm:table-cell">
                Weight %
              </th>
              <th scope="col" className="hidden px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-night-ink-soft md:table-cell">
                Mkt cap
              </th>
              <th scope="col" className="px-5 py-3.5 text-right text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-night-ink-soft">
                Day pts
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((m) => (
              <tr
                key={m.symbol}
                className="border-b border-line last:border-0 transition-colors hover:bg-accent-wash/60 dark:border-night-line dark:hover:bg-night-wash"
              >
                <td className="px-5 py-3.5">
                  <div className="flex flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/taste/markets/${encodeURIComponent(m.symbol)}`}
                        className="t-figs font-semibold text-ink underline-offset-4 hover:underline dark:text-night-ink"
                      >
                        {m.symbol}
                      </Link>
                      {m.sector && m.sector !== "Other" && (
                        <span className="rounded bg-accent-wash px-1.5 py-0.5 text-[10px] font-medium text-ink-soft dark:bg-night-wash dark:text-night-ink-soft">
                          {m.sector}
                        </span>
                      )}
                    </div>
                    {m.name && m.name !== m.symbol && (
                      <span className="mt-0.5 line-clamp-1 text-xs text-ink-soft dark:text-night-ink-soft">
                        {m.name}
                      </span>
                    )}
                  </div>
                </td>
                <td className="t-figs hidden px-5 py-3.5 text-right text-ink-soft dark:text-night-ink-soft sm:table-cell">
                  {m.idx_weight.toFixed(2)}
                </td>
                <td className="t-figs hidden px-5 py-3.5 text-right text-ink-soft dark:text-night-ink-soft md:table-cell">
                  {fmtCap(m.market_cap_m)}
                </td>
                <td
                  className={`t-figs px-5 py-3.5 text-right font-medium ${
                    m.idx_point > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : m.idx_point < 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-ink-soft dark:text-night-ink-soft"
                  }`}
                >
                  {fmtPoint(m.idx_point)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="px-5 py-14 text-center">
            <p className="text-sm font-medium text-ink dark:text-night-ink">
              Nothing matches “{query || activeSector}”
            </p>
            <p className="mt-1 text-sm text-ink-soft dark:text-night-ink-soft">
              {activeSector !== "All"
                ? `No scrips found in ${activeSector} with your search query.`
                : "The list holds KSE 100 symbols only."}
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveSector("All");
              }}
              className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-control border border-line bg-transparent px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-soft dark:border-night-line dark:text-night-ink dark:hover:border-night-ink-soft"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {filtered.length > visible.length && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((l) => l + PAGE)}
            className="inline-flex min-h-[44px] items-center justify-center rounded-control border border-line bg-transparent px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink-soft dark:border-night-line dark:text-night-ink dark:hover:border-night-ink-soft"
          >
            Show {Math.min(PAGE, filtered.length - visible.length)} more
          </button>
        </div>
      )}
    </div>
  );
}
