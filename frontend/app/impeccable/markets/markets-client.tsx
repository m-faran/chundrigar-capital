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
  m == null ? "—" : m >= 1000 ? `${(m / 1000).toFixed(1)} bn` : `${m.toFixed(0)} m`;

const fmtPoint = (p: number) =>
  `${p >= 0 ? "+" : "−"}${Math.abs(p).toFixed(2)}`;

export function ScanField() {
  return (
    <div className="cc-scan">
      <label className="cc-scan-label" htmlFor="cc-scan-input">
        Scan the register
      </label>
      <input
        id="cc-scan-input"
        className="cc-scan-input"
        type="search"
        placeholder="Type a symbol — e.g. OGDC, LUCK, HBL"
        autoComplete="off"
        spellCheck={false}
        list="cc-scan-suggestions"
      />
    </div>
  );
}

export function RegisterTable({ members }: { members: Member[] }) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  // Scan field drives the table: one client island owns both so the input
  // needs no plumbing. The datalist suggestions come from the roster itself.
  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return members;
    return members.filter((m) => m.symbol.includes(q));
  }, [members, query]);

  return (
    <>
      <div className="cc-scan">
        <label className="cc-scan-label" htmlFor="cc-scan-input">
          Scan the register
        </label>
        <input
          id="cc-scan-input"
          className="cc-scan-input"
          type="search"
          placeholder="Type a symbol — e.g. OGDC, LUCK, HBL"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-describedby="cc-scan-count"
        />
      </div>

      <p id="cc-scan-count" className="cc-scan-count cc-mono" role="status">
        {filtered.length === members.length
          ? `${members.length} scrips listed`
          : `${filtered.length} of ${members.length} scrips`}
      </p>

      <div className="cc-regtable-wrap">
        <table className="cc-regtable">
          <caption className="cc-visually-hidden">
            KSE 100 scrips with index weight, market capitalization, and the
            day&rsquo;s index points
          </caption>
          <thead>
            <tr>
              <th scope="col" className="cc-col-no">No.</th>
              <th scope="col">Scrip</th>
              <th scope="col" className="cc-col-num cc-col-w">Weight %</th>
              <th scope="col" className="cc-col-num cc-col-cap">Mkt cap</th>
              <th scope="col" className="cc-col-num cc-col-pts">Day pts</th>
              <th scope="col" className="cc-col-link"><span className="cc-visually-hidden">Open record</span></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={m.symbol}>
                <td className="cc-col-no cc-mono">
                  {String(i + 1).padStart(3, "0")}
                </td>
                <td>
                  <Link className="cc-regtable-symbol" href={`/impeccable/markets/${encodeURIComponent(m.symbol)}`}>
                    {m.symbol}
                  </Link>
                </td>
                <td className="cc-col-num cc-col-w cc-mono">{m.idx_weight.toFixed(2)}</td>
                <td className="cc-col-num cc-col-cap cc-mono">{fmtCap(m.market_cap_m)}</td>
                <td className="cc-col-num cc-col-pts cc-mono">{fmtPoint(m.idx_point)}</td>
                <td className="cc-col-link">
                  <Link
                    className="cc-regtable-open"
                    href={`/impeccable/markets/${encodeURIComponent(m.symbol)}`}
                    aria-label={`Open the record for ${m.symbol}`}
                  >
                    Record →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="cc-regtable-empty">
            <p>
              <strong>No line matches “{query}”.</strong>
            </p>
            <p className="cc-mono">
              The register holds KSE 100 symbols only. Clear the scan to see
              all 100.
            </p>
            <button type="button" className="cc-btn-ghost" onClick={() => setQuery("")}>
              Clear the scan
            </button>
          </div>
        )}
      </div>

      {filtered.length > 14 && !showAll && (
        <button type="button" className="cc-btn-ghost cc-regtable-more" onClick={() => setShowAll(true)}>
          Unroll the full register — {filtered.length - 14} more lines
        </button>
      )}
    </>
  );
}
