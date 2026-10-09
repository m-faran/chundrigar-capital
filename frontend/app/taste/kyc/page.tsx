import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ThemeToggle } from "../theme-toggle";
import { outfit, jbmono } from "../fonts";
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
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur dark:border-night-line dark:bg-night/90">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-5 md:gap-6 md:px-8">
          <Link
            href="/taste"
            className="inline-flex min-h-[44px] items-center text-[15px] font-semibold tracking-tight text-ink dark:text-night-ink"
          >
            Chundrigar Capital
          </Link>
          <nav
            aria-label="Site"
            className="ml-2 hidden items-center gap-2 text-sm text-ink-soft dark:text-night-ink-soft md:flex"
          >
            <Link
              href="/taste"
              className="inline-flex items-center rounded-control px-3 py-3 transition-colors hover:text-ink dark:hover:text-night-ink"
            >
              Overview
            </Link>
            <Link
              href="/taste/markets"
              className="inline-flex items-center rounded-control px-3 py-3 transition-colors hover:text-ink dark:hover:text-night-ink"
            >
              Markets
            </Link>
            <Link
              href="/taste/kyc"
              aria-current="page"
              className="inline-flex items-center rounded-control px-3 py-3 text-ink dark:text-night-ink"
            >
              Verify
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
          <Link
            href="/taste/markets"
            className="relative underline-offset-4 after:absolute after:-inset-x-2 after:-inset-y-4 after:content-[''] hover:underline"
          >
            Markets
          </Link>
          <span className="mx-2">/</span>
          <span>Verify</span>
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
