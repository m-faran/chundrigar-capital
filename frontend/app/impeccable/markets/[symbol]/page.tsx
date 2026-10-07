import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchPSX } from "../../../../lib/api-fetcher";
import { ccFontVars } from "../../fonts";
import { QuoteBand, HistoryChart, TradeSlip } from "../../trade-slip";
import "../../impeccable.css";

export const metadata: Metadata = {
  title: "Market record | Chundrigar Capital",
  description:
    "One scrip's real market record — PSX price history on graph paper, and an order slip that settles against the Treasury on Base Sepolia.",
};

type Bar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type HistResponse = { data?: Bar[] };
type QuoteResponse = {
  data?: { price?: number; change_pct?: number | null } | null;
};
type KseResponse = { data?: { symbol: string }[] };

export default async function StockRecord({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol: raw } = await params;
  const symbol = decodeURIComponent(raw).trim().toUpperCase();
  if (!/^[A-Z0-9-]{2,12}$/.test(symbol)) notFound();

  let bars: Bar[] | null = null;
  let price: number | null = null;
  let changePct: number | null = null;
  let neighbors: { prev: string | null; next: string | null } = {
    prev: null,
    next: null,
  };

  try {
    const [hist, quote, index] = await Promise.all([
      fetchPSX(`/stocks/${encodeURIComponent(symbol)}/historical`) as Promise<HistResponse>,
      fetchPSX(`/stocks/${encodeURIComponent(symbol)}/quote`) as Promise<QuoteResponse>,
      fetchPSX("/indices/KSE100") as Promise<KseResponse>,
    ]);

    const all = hist?.data ?? [];
    if (all.length === 0) notFound();
    bars = all.slice(0, 380);

    price = typeof quote?.data?.price === "number" ? quote.data.price : null;
    changePct =
      typeof quote?.data?.change_pct === "number" ? quote.data.change_pct : null;

    const symbols = (index?.data ?? []).map((m) => m.symbol);
    const i = symbols.indexOf(symbol);
    if (i !== -1) {
      neighbors = {
        prev: symbols[i - 1] ?? null,
        next: symbols[i + 1] ?? null,
      };
    }
  } catch {
    bars = bars ?? null;
  }

  const first = bars?.[bars.length - 1]?.date ?? null;
  const last = bars?.[0]?.date ?? null;
  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className={`cc-root ${ccFontVars}`}>
      <a className="cc-skip" href="#cc-main">
        Skip to content
      </a>

      <header className="cc-nav">
        <Link className="cc-wordmark" href="/impeccable">
          Chundrigar&nbsp;Capital
        </Link>
        <nav className="cc-nav-links" aria-label="Site">
          <Link href="/impeccable">The protocol</Link>
          <Link href="/impeccable/markets">The register</Link>
        </nav>
        <span className="cc-nettag" title="Every trade on this page settles on Base Sepolia">
          Base Sepolia · Testnet
        </span>
        <Link className="cc-cta cc-cta-nav" href="/">
          Open the testnet app
        </Link>
      </header>

      <main id="cc-main">
        <section
          className="cc-record-head"
          style={{ paddingTop: "clamp(36px, 6vh, 64px)", paddingBottom: 0 }}
        >
          <p className="cc-record-crumb cc-mono">
            <Link href="/impeccable/markets">← The register</Link>
            <span aria-hidden="true"> · </span>
            <span>KSE 100</span>
          </p>
          <h1 className="cc-record-symbol">{symbol}</h1>
          <p className="cc-record-sub">
            One token = one share, held 1:1 in simulated inventory during the
            MVP. The record below is the scrip&rsquo;s real PSX history.
          </p>
        </section>

        {bars && price != null ? (
          <section className="cc-record-body" style={{ paddingTop: 28, paddingBottom: 0 }}>
            <QuoteBand symbol={symbol} price={price} changePct={changePct} />

            <div className="cc-record-split">
              <div className="cc-record-chart">
                <HistoryChart bars={bars} />
                <p className="cc-chart-fineprint cc-mono">
                  Daily bars {fmtDate(first)} to {fmtDate(last)} · PSX Data
                  API, real closes · drawn as printed, not advice
                </p>
              </div>
              <TradeSlip symbol={symbol} pricePkr={price} />
            </div>
          </section>
        ) : (
          <section className="cc-record-body" style={{ paddingTop: 28, paddingBottom: 0 }}>
            <div className="cc-register" style={{ maxWidth: "none" }}>
              <p className="cc-register-head">Record unavailable</p>
              <p className="cc-register-foot" style={{ marginTop: 12 }}>
                {bars
                  ? "The PSX data feed answered for the history but not the price, so the record cannot be drawn honestly. Nothing is invented in its place."
                  : "The PSX data feed did not answer for this scrip, so the record cannot be drawn. Nothing is invented in its place — reload to pull it again."}
              </p>
              <p className="cc-register-foot">
                <Link href="/impeccable/markets">← Back to the register</Link>
              </p>
            </div>
          </section>
        )}

        <section className="cc-record-neighbors" style={{ paddingBottom: 0 }}>
          <div className="cc-record-neighbor-row">
            {neighbors.prev ? (
              <Link className="cc-record-neighbor" href={`/impeccable/markets/${neighbors.prev}`}>
                ← {neighbors.prev}
              </Link>
            ) : (
              <span />
            )}
            <span className="cc-record-neighbor-mid cc-mono">Ledger order</span>
            {neighbors.next ? (
              <Link className="cc-record-neighbor" href={`/impeccable/markets/${neighbors.next}`}>
                {neighbors.next} →
              </Link>
            ) : (
              <span />
            )}
          </div>
        </section>
      </main>

      <footer className="cc-footer">
        <p className="cc-wordmark cc-wordmark-foot">Chundrigar&nbsp;Capital</p>
        <p className="cc-footer-line">
          Stock tokens represent simulated inventory during the MVP. Nothing
          here offers or implies returns, yields, or dividends.
        </p>
        <Link className="cc-cta" href="/">
          Open the testnet app
        </Link>
      </footer>
    </div>
  );
}
