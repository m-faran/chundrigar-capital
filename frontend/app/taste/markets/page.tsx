import type { Metadata } from "next";
import Link from "next/link";
import { fetchPSX } from "../../../lib/api-fetcher";
import { MarketsClient } from "./markets-client";
import "../taste.css";

export const metadata: Metadata = {
  title: "Markets | Chundrigar Capital",
  description:
    "Every scrip in the KSE 100 with its index weight and the day's points. Open one to read its record and trade it on Base Sepolia.",
};

type Member = {
  symbol: string;
  idx_weight: number;
  idx_point: number;
  market_cap_m: number | null;
};

type KseResponse = { data?: Member[]; meta?: { timestamp?: string } };

export default async function TasteMarkets() {
  let members: Member[] | null = null;
  let pulledAt: string | null = null;

  try {
    const json = (await fetchPSX("/indices/KSE100")) as KseResponse;
    members = (json?.data ?? []).filter((m) => m && m.symbol);
    pulledAt = json?.meta?.timestamp ?? null;
  } catch {
    members = null;
  }

  return (
    <div className="min-h-[100dvh] bg-paper text-ink dark:bg-night dark:text-night-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur dark:border-night-line dark:bg-night/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 md:px-8">
          <Link href="/taste" className="text-[15px] font-semibold tracking-tight text-ink dark:text-night-ink">
            Chundrigar Capital
          </Link>
          <nav aria-label="Site" className="ml-2 hidden gap-6 text-sm text-ink-soft dark:text-night-ink-soft md:flex">
            <Link href="/taste" className="transition-colors hover:text-ink dark:hover:text-night-ink">
              Overview
            </Link>
            <Link
              href="/taste/markets"
              aria-current="page"
              className="text-ink dark:text-night-ink"
            >
              Markets
            </Link>
          </nav>
          <span className="t-figs ml-auto hidden rounded-control border border-line px-2.5 py-1 text-[11px] text-ink-soft dark:border-night-line dark:text-night-ink-soft lg:inline-block">
            Base Sepolia · TESTNET
          </span>
          <a
            href="/"
            className="rounded-control bg-accent px-4 py-2 text-sm font-medium text-cta-text transition-colors hover:bg-accent-deep dark:bg-accent-bright dark:text-night dark:hover:bg-cta-text dark:hover:text-accent-deep"
          >
            Open the testnet app
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24 pt-12 md:px-8 md:pt-16">
        <h1 className="max-w-[24ch] text-4xl font-semibold tracking-tight md:text-5xl">
          The KSE 100, as a working list.
        </h1>
        <p className="mt-4 max-w-[58ch] text-ink-soft dark:text-night-ink-soft">
          Every scrip in the index with its weight and the day&rsquo;s move.
          Open one to read its record and trade it against the Treasury.
        </p>

        {members ? (
          <MarketsClient members={members} />
        ) : (
          <div className="mt-12 rounded-surface border border-line bg-surface p-8 dark:border-night-line dark:bg-night-surface">
            <h2 className="text-lg font-medium tracking-tight">The feed did not answer</h2>
            <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-ink-soft dark:text-night-ink-soft">
              The PSX data route is unreachable right now, so the list cannot
              be drawn. Nothing is invented in its place. Reload to pull it
              again.
            </p>
          </div>
        )}

        <p className="t-figs mt-6 text-xs leading-relaxed text-ink-soft dark:text-night-ink-soft">
          Weights and day points pulled
          {pulledAt
            ? ` ${new Date(pulledAt).toISOString().slice(0, 16).replace("T", " ")} UTC`
            : ""}{" "}
          from the PSX Data API through this site&rsquo;s cached route.
        </p>
      </main>

      <footer className="border-t border-line dark:border-night-line">
        <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <p className="text-[15px] font-semibold tracking-tight text-ink dark:text-night-ink">
              Chundrigar Capital
            </p>
            <span className="t-figs text-[11px] text-ink-soft dark:text-night-ink-soft">
              Base Sepolia · TESTNET
            </span>
          </div>
          <p className="mt-6 max-w-[78ch] text-xs leading-relaxed text-ink-soft dark:text-night-ink-soft">
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
