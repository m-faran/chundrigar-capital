"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Member = {
  symbol: string;
  idx_weight: number;
  idx_point: number;
  market_cap_m: number | null;
};

const fmtCap = (m: number | null) =>
  m == null ? "n/a" : m >= 1000 ? `${(m / 1000).toFixed(1)}bn` : `${m.toFixed(0)}m`;

const fmtPoint = (p: number) =>
  `${p >= 0 ? "+" : "−"}${Math.abs(p).toFixed(2)}`;

const PAGE = 20;

export function MarketsClient({ members }: { members: Member[] }) {
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return members;
    return members.filter((m) => m.symbol.includes(q));
  }, [members, query]);

  const visible = filtered.slice(0, limit);

  return (
    <div className="mt-10">
      {/* search */}
      <div className="max-w-md">
        <label
          htmlFor="t-search"
          className="text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-night-ink-soft"
        >
          Search
        </label>
        <input
          id="t-search"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setLimit(PAGE);
          }}
          placeholder="Symbol, e.g. OGDC"
          autoComplete="off"
          spellCheck={false}
          aria-describedby="t-search-count"
          className="mt-2 min-h-[44px] w-full rounded-control border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none dark:border-night-line dark:bg-night-surface dark:text-night-ink dark:placeholder:text-night-ink-soft dark:focus:border-accent-bright"
        />
      </div>
      <p id="t-search-count" className="t-figs mt-3 text-xs text-ink-soft dark:text-night-ink-soft" role="status">
        {filtered.length === members.length
          ? `${members.length} scrips`
          : `${filtered.length} of ${members.length} scrips`}
      </p>

      {/* the list: a ledger, not a card grid */}
      <div className="mt-4 overflow-hidden rounded-surface border border-line bg-surface dark:border-night-line dark:bg-night-surface">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left dark:border-night-line">
              <th scope="col" className="px-5 py-3.5 text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-night-ink-soft">
                Scrip
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
                <td className="px-5 py-3">
                  <Link
                    href={`/taste/markets/${encodeURIComponent(m.symbol)}`}
                    className="t-figs relative font-medium text-ink underline-offset-4 hover:underline after:absolute after:inset-x-0 after:-inset-y-3.5 after:content-[''] dark:text-night-ink"
                  >
                    {m.symbol}
                  </Link>
                </td>
                <td className="t-figs hidden px-5 py-3 text-right text-ink-soft dark:text-night-ink-soft sm:table-cell">
                  {m.idx_weight.toFixed(2)}
                </td>
                <td className="t-figs hidden px-5 py-3 text-right text-ink-soft dark:text-night-ink-soft md:table-cell">
                  {fmtCap(m.market_cap_m)}
                </td>
                <td
                  className={`t-figs px-5 py-3 text-right ${
                    m.idx_point >= 0
                      ? "text-ink dark:text-night-ink"
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
              Nothing matches “{query}”
            </p>
            <p className="mt-1 text-sm text-ink-soft dark:text-night-ink-soft">
              The list holds KSE 100 symbols only.
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-control border border-line bg-transparent px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-ink-soft dark:border-night-line dark:text-night-ink dark:hover:border-night-ink-soft"
            >
              Clear search
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
