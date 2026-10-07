import type { Metadata } from "next";
import Link from "next/link";
import { fetchPSX } from "../../../lib/api-fetcher";
import { ccFontVars } from "../fonts";
import { RegisterTable } from "./markets-client";
import "../impeccable.css";

export const metadata: Metadata = {
  title: "The register — KSE 100 scrips | Chundrigar Capital",
  description:
    "All 100 scrips of the KSE 100 index, kept as a bound register: search, index weight, market capitalization, and the day's points. Tokenized on Base Sepolia.",
};

type Member = {
  symbol: string;
  idx_weight: number;
  idx_point: number;
  market_cap_m: number | null;
};

type KseResponse = { data?: Member[]; meta?: { timestamp?: string } };

export default async function ImpeccableMarkets() {
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
          <Link href="/impeccable/markets" aria-current="page">
            The register
          </Link>
        </nav>
        <span className="cc-nettag" title="Every trade on these pages settles on Base Sepolia">
          Base Sepolia · Testnet
        </span>
        <Link className="cc-cta cc-cta-nav" href="/">
          Open the testnet app
        </Link>
      </header>

      <main id="cc-main">
        <section className="cc-markets-head" style={{ paddingTop: "clamp(36px, 6vh, 64px)", paddingBottom: 0 }}>
          <h1>The register.</h1>
          <p className="cc-section-lede" style={{ marginBottom: 24 }}>
            Every scrip in the KSE 100, kept the way an exchange keeps its
            members — one line each, ruled and numbered. Open a line to read
            its record and settle a trade against the Treasury.
          </p>

          {members ? (
            <>
              <RegisterTable members={members} />
              <p className="cc-markets-foot cc-mono">
                100 scrips of the KSE 100 · weights and day points as pulled
                {pulledAt
                  ? ` ${new Date(pulledAt).toISOString().slice(0, 16).replace("T", " ")} UTC`
                  : ""}
                · source: PSX Data API via this site&rsquo;s cached route
              </p>
            </>
          ) : (
            <div className="cc-register" style={{ maxWidth: "none" }}>
              <p className="cc-register-head">Register unavailable</p>
              <p className="cc-register-foot" style={{ marginTop: 12 }}>
                The PSX data feed did not answer, so the register cannot be
                drawn. Nothing is invented in its place — reload to pull the
                list again.
              </p>
            </div>
          )}
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
