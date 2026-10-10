import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { outfit, jbmono } from "../fonts";
import { TasteHeader } from "../nav";
import { KycClient } from "./kyc-client";
import "../taste.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#101114" },
  ],
};

export const metadata: Metadata = {
  title: "Verify identity | Chundrigar Capital",
  description:
    "A CNIC or passport photo, a selfie, and a consent line. The Treasury settles trades only with whitelisted wallets on Base Sepolia.",
};

/* Applies the persisted (or system-default) theme before first paint,
   so the manual toggle never flashes the wrong mode. */
const THEME_BOOT = `(function(){try{var s=localStorage.getItem("taste-theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function TasteKyc() {
  return (
    <div
      className={`t-root ${outfit.variable} ${jbmono.variable} bg-paper text-ink dark:bg-night dark:text-night-ink`}
    >
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      <TasteHeader />

      <main className="mx-auto max-w-[1280px] px-5 pb-24 pt-12 md:px-8 md:pt-16">
        <p className="t-figs text-xs text-ink-soft dark:text-night-ink-soft">
          <Link
            href="/taste"
            className="relative underline-offset-4 after:absolute after:-inset-x-2 after:-inset-y-4 after:content-[''] hover:underline"
          >
            Overview
          </Link>
          <span className="mx-2">/</span>
          <span>Verify identity</span>
        </p>
        <h1 className="mt-3 max-w-[24ch] text-4xl font-semibold tracking-tight md:text-5xl">
          One check, then you trade.
        </h1>
        <p className="mt-4 max-w-[58ch] text-ink-soft dark:text-night-ink-soft">
          The Treasury settles trades only with whitelisted wallets. Add a
          CNIC or passport, a selfie, and your consent — nothing leaves this
          tab.
        </p>

        <KycClient />
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
          <p className="mt-6 max-w-[50ch] text-xs leading-relaxed text-ink-soft dark:text-night-ink-soft">
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
