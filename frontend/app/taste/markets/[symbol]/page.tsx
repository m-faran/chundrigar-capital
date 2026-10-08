import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchPSX } from "../../../../lib/api-fetcher";
import { RecordChart } from "../record-chart";
import { TradePanel } from "../trade-panel";
import { ThemeToggle } from "../../theme-toggle";
import "../../taste.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#101114" },
  ],
};

export const metadata: Metadata = {
  title: "Market record | Chundrigar Capital",
  description:
    "A scrip's real PSX price record and a trade panel that settles against the Treasury on Base Sepolia.",
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

/* Applies the persisted (or system-default) theme before first paint,
   so the manual toggle never flashes the wrong mode. */
const THEME_BOOT = `(function(){try{var s=localStorage.getItem("taste-theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;

export default async function TasteRecord({
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
    d
      ? new Date(d).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "n/a";

  return (
    <div className="min-h-[100dvh] bg-paper text-ink dark:bg-night dark:text-night-ink">
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur dark:border-night-line dark:bg-night/90">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-5 md:gap-6 md:px-8">
          <Link href="/taste" className="inline-flex min-h-[44px] items-center text-[15px] font-semibold tracking-tight text-ink dark:text-night-ink">
            Chundrigar Capital
          </Link>
          <nav aria-label="Site" className="ml-2 hidden items-center gap-2 text-sm text-ink-soft dark:text-night-ink-soft md:flex">
            <Link href="/taste" className="inline-flex items-center rounded-control px-3 py-3 transition-colors hover:text-ink dark:hover:text-night-ink">
              Overview
            </Link>
            <Link href="/taste/markets" className="inline-flex items-center rounded-control px-3 py-3 transition-colors hover:text-ink dark:hover:text-night-ink">
              Markets
            </Link>
          </nav>
          <span className="t-figs ml-auto hidden rounded-control border border-line px-2.5 py-1 text-[11px] text-ink-soft dark:border-night-line dark:text-night-ink-soft lg:inline-block">
            Base Sepolia · TESTNET
          </span>
          <ThemeToggle />
          <a
            href="/"
            className="inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap rounded-control bg-accent px-4 py-2 text-sm font-medium text-cta-text transition-colors hover:bg-accent-deep dark:bg-accent-bright dark:text-night dark:hover:bg-cta-text dark:hover:text-accent-deep"
          >
            <span className="sm:hidden">Open app</span>
            <span className="hidden sm:inline">Open the testnet app</span>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-5 pb-24 pt-12 md:px-8 md:pt-16">
        <p className="t-figs text-xs text-ink-soft dark:text-night-ink-soft">
          <Link href="/taste/markets" className="relative underline-offset-4 after:absolute after:-inset-x-2 after:-inset-y-4 after:content-[''] hover:underline">
            Markets
          </Link>
          <span className="mx-2">/</span>
          <span>KSE 100</span>
        </p>
        <h1 className="t-figs mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          {symbol}
        </h1>
        <p className="mt-3 max-w-[58ch] text-ink-soft dark:text-night-ink-soft">
          One token equals one share, held 1:1 in simulated inventory during
          the MVP. The record below is the scrip&rsquo;s real PSX history.
        </p>

        {bars && price != null ? (
          <>
            {/* the record: real quote band + chart, 8/4 split */}
            <div className="mt-10 grid gap-6 lg:grid-cols-12">
              <div className="min-w-0 lg:col-span-8">
                <div className="rounded-surface border border-line bg-surface p-6 dark:border-night-line dark:bg-night-surface">
                  <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5 dark:border-night-line">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-night-ink-soft">
                        PSX close · PKR per share
                      </p>
                      <p className="t-figs mt-1.5 text-4xl font-semibold tracking-tight">
                        {price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-night-ink-soft">
                        Day change
                      </p>
                      <p className="t-figs mt-1.5 text-lg">
                        {changePct == null
                          ? "n/a"
                          : `${changePct >= 0 ? "+" : "−"}${Math.abs(changePct).toFixed(2)}%`}
                      </p>
                    </div>
                    <p className="t-figs w-full text-xs text-ink-soft dark:text-night-ink-soft sm:w-auto">
                      Daily closes {fmtDate(first)} to {fmtDate(last)}, PSX
                      Data API
                    </p>
                  </div>
                  <RecordChart bars={bars} />
                </div>
              </div>

              {/* the trade panel */}
              <div className="min-w-0 lg:col-span-4">
                <TradePanel symbol={symbol} pricePkr={price} />
              </div>
            </div>
          </>
        ) : (
          <div className="mt-10 rounded-surface border border-line bg-surface p-8 dark:border-night-line dark:bg-night-surface">
            <h2 className="text-lg font-medium tracking-tight">The feed did not answer</h2>
            <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-ink-soft dark:text-night-ink-soft">
              The PSX data route is unreachable right now, so the record
              cannot be drawn. Nothing is invented in its place. Reload to
              pull it again.
            </p>
            <Link
              href="/taste/markets"
              className="mt-4 inline-block text-sm font-medium text-accent underline-offset-4 hover:underline dark:text-accent-bright"
            >
              Back to Markets
            </Link>
          </div>
        )}

        {/* ledger-order neighbors; hidden when the index lookup resolved nothing */}
        {neighbors.prev || neighbors.next ? (
        <div className="mt-12 flex items-center justify-between border-t border-line pt-6 dark:border-night-line">
          {neighbors.prev ? (
            <Link
              href={`/taste/markets/${neighbors.prev}`}
              className="t-figs text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline dark:text-night-ink-soft dark:hover:text-night-ink"
            >
              ← {neighbors.prev}
            </Link>
          ) : (
            <span />
          )}
          <span className="t-figs text-[11px] text-ink-soft dark:text-night-ink-soft">
            Ledger order
          </span>
          {neighbors.next ? (
            <Link
              href={`/taste/markets/${neighbors.next}`}
              className="t-figs text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline dark:text-night-ink-soft dark:hover:text-night-ink"
            >
              {neighbors.next} →
            </Link>
          ) : (
            <span />
          )}
        </div>
        ) : null}
      </main>

      <footer className="border-t border-line dark:border-night-line">
        <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <p className="text-[15px] font-semibold tracking-tight text-ink dark:text-night-ink">
              Chundrigar Capital
            </p>
            <span className="t-figs text-[11px] text-ink-soft dark:text-night-ink-soft">
              Base Sepolia · TESTNET
            </span>
          </div>
          <p className="mt-6 max-w-[65ch] text-xs leading-relaxed text-ink-soft dark:text-night-ink-soft">
            Testnet software. Tokens represent simulated inventory during the
            MVP. Nothing here offers returns, yields, dividends, or
            appreciation. Chundrigar Capital is the protocol; tokens issued on
            it carry their own names.
          </p>
        </div>
      </footer>
    </div>
  );
}
