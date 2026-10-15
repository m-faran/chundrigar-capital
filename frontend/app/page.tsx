import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Image from "next/image";
import { outfit, jbmono } from "./fonts";
import { TasteHeader } from "./nav";
import Ticker from "./ticker";
import "./taste.css";

export const metadata: Metadata = {
  title: "Chundrigar Capital | Pakistan Stock Exchange shares, as tokens",
  description:
    "Buy KSE-100 shares as tokens on Base Sepolia. Pay in PKR or USDC; tokens mint straight to your wallet at a signed price.",
};

/* Applies the persisted (or system-default) theme before first paint,
   so the manual toggle never flashes the wrong mode. */

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#101114" },
  ],
};

const STEPS = [
  {
    name: "Verify once",
    body: "Upload an ID for a quick human review. Your wallet joins the whitelist — no repeat checks after that.",
    href: "/kyc",
    cta: "Verify identity →",
  },
  {
    name: "Pick a stock, pay your way",
    body: "Choose any KSE-100 name and pay in PKR or USDC. You see the exact price before you confirm.",
    href: "/markets",
    cta: "Browse KSE-100 →",
  },
  {
    name: "Tokens land in your wallet",
    body: "Shares mint to your wallet at the quoted price. Sell them back the same way, any time.",
    href: "/markets",
    cta: "Start trading →",
  },
];

const RAILS = [
  {
    title: "In Pakistan: pay in PKR",
    body: "The rupee rail prices the market natively — no currency conversion on your trade.",
  },
  {
    title: "Abroad: pay in USDC",
    body: "Your dollars convert at trade time, inside the signed price — not yesterday's rate.",
  },
];

const TRUST = [
  {
    title: "Signed prices, verified on-chain",
    body: "Every quote is signed off-chain and checked by the contract. Nothing else settles.",
  },
  {
    title: "Whitelist-gated, always",
    body: "The token checks approval on every single transfer — in and out.",
  },
  {
    title: "0.50% fee, no middlemen",
    body: "The Treasury is your direct counterparty. One printed fee, nothing hidden.",
  },
];

export default function TasteLanding() {
  return (
    <div className={`t-root ${outfit.variable} ${jbmono.variable} bg-paper text-ink dark:bg-night dark:text-night-ink`}>
      <a href="#t-main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper dark:focus:bg-night-ink dark:focus:text-night">
        Skip to content
      </a>

      {/* ————— responsive shared nav with mobile drawer ————— */}
      <TasteHeader />

      <main id="t-main" className="mx-auto max-w-[1280px] px-5 md:px-8">
        {/* ————— hero: asymmetric split 7/5, real live data as proof ————— */}
        <section className="grid gap-12 py-16 md:grid-cols-12 md:gap-10 md:py-24 lg:grid-cols-12">
          <div className="md:col-span-7 lg:self-center">
            <h1 className="text-5xl font-semibold tracking-tight">
              Own PSX shares as tokens, from anywhere.
            </h1>
            <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-ink-soft dark:text-night-ink-soft">
              KSE-100 names like OGDC and Engro, issued as tokens on Base
              Sepolia. Pay in rupees or USDC — tokens mint straight to your
              wallet.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/markets"
                className="rounded-control bg-accent px-6 py-3 font-medium text-cta-text transition-colors hover:bg-accent-deep dark:bg-accent-bright dark:text-night dark:hover:bg-cta-text dark:hover:text-accent-deep"
              >
                Explore markets
              </Link>
              <a
                href="#t-how"
                className="rounded-control border border-line px-6 py-3 font-medium text-ink transition-colors hover:border-ink-soft dark:border-night-line dark:text-night-ink dark:hover:border-night-ink-soft"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* the visual: live market data, not a mockup */}
          <div className="md:col-span-5">
            <div className="rounded-surface border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(23,24,28,0.06),0_12px_32px_rgba(23,24,28,0.08)] dark:border-night-line dark:bg-night-surface dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_12px_32px_rgba(0,0,0,0.35)]">
              <p className="mb-5 border-b border-line pb-4 text-sm font-medium text-ink dark:border-night-line dark:text-night-ink">
                The market, live right now
              </p>
              <Ticker />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-soft dark:text-night-ink-soft">
              Live KSE 100 quotes, refreshed from the exchange feed.
            </p>
          </div>
        </section>

        {/* ————— how it works: three user-side steps with actionable links ————— */}
        <section id="t-how" className="border-t border-line py-16 dark:border-night-line md:py-24">
          <h2 className="max-w-[24ch] text-3xl font-semibold tracking-tight md:text-4xl">
            Three steps to your first token
          </h2>
          <p className="mt-3 max-w-[60ch] text-ink-soft dark:text-night-ink-soft">
            From ID check to settled trade in one sitting.
          </p>

          <ol className="mt-10 grid list-none gap-10 p-0 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.name} className="flex flex-col border-t-2 border-ink pt-5 dark:border-night-ink">
                <span className="t-figs text-xs text-accent dark:text-accent-bright">
                  0{i + 1}
                </span>
                <h3 className="mt-2 text-lg font-medium tracking-tight text-ink dark:text-night-ink">
                  {s.name}
                </h3>
                <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft dark:text-night-ink-soft">
                  {s.body}
                </p>
                <div className="mt-4 pt-2">
                  <Link
                    href={s.href}
                    className="inline-flex min-h-[44px] items-center text-sm font-medium text-accent underline-offset-4 hover:underline dark:text-accent-bright"
                  >
                    {s.cta}
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ————— rails: pay at home or from abroad ————— */}
        <section id="t-rails" className="border-t border-line py-16 dark:border-night-line md:py-24">
          <h2 className="max-w-[24ch] text-3xl font-semibold tracking-tight md:text-4xl">
            Pay the way that suits you
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {RAILS.map((r) => (
              <div
                key={r.title}
                className="rounded-surface border border-line bg-surface p-6 md:p-8 dark:border-night-line dark:bg-night-surface"
              >
                <h3 className="text-xl font-medium tracking-tight text-ink dark:text-night-ink">
                  {r.title}
                </h3>
                <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-ink-soft dark:text-night-ink-soft">
                  {r.body}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-[60ch] text-sm text-ink-soft dark:text-night-ink-soft">
            Both rails settle at the same price, at the same 0.50% fee.
          </p>
        </section>

        {/* ————— trust: three promises, no lecture ————— */}
        <section id="t-trust" className="border-t border-line py-16 dark:border-night-line md:py-24">
          <h2 className="max-w-[22ch] text-3xl font-semibold tracking-tight md:text-4xl">
            Built like an exchange, not a promise
          </h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {TRUST.map((t, i) => (
              <div key={t.title} className={i > 0 ? "md:border-l md:border-line md:pl-8 dark:md:border-night-line" : ""}>
                <h3 className="text-lg font-medium tracking-tight text-ink dark:text-night-ink">
                  {t.title}
                </h3>
                <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-ink-soft dark:text-night-ink-soft">
                  {t.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ————— architectural heritage: I.I. Chundrigar Road & PSX ————— */}
        <section className="border-t border-line py-16 dark:border-night-line md:py-24">
          <h2 className="text-3xl font-semibold tracking-tight text-ink dark:text-night-ink md:text-4xl">
            From I.I. Chundrigar Road to on-chain liquidity
          </h2>

          <div className="mt-10 overflow-hidden rounded-surface border border-line bg-surface p-2 shadow-[0_1px_2px_rgba(23,24,28,0.06),0_12px_32px_rgba(23,24,28,0.08)] sm:p-4 dark:border-night-line dark:bg-night-surface dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_12px_32px_rgba(0,0,0,0.35)]">
            <div className="relative aspect-[1024/571] w-full overflow-hidden rounded-control bg-paper dark:bg-night">
              <Image
                src="/images/psx-scene-light.png"
                alt="Pakistan Stock Exchange and I.I. Chundrigar Road architectural engraving"
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover dark:hidden"
              />
              <Image
                src="/images/psx-scene-dark.png"
                alt="Pakistan Stock Exchange and I.I. Chundrigar Road architectural engraving"
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="hidden object-cover dark:block"
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-ink-soft dark:text-night-ink-soft">
              <span className="t-figs text-[11px] tracking-wide">
                KARACHI · 24.8532° N, 67.0006° E
              </span>
              <span className="t-figs text-[11px] font-medium tracking-wider uppercase">
                Pakistan Stock Exchange &amp; Financial District
              </span>
            </div>
          </div>
        </section>

        {/* ————— close: one CTA, one line ————— */}
        <section className="border-t border-line py-16 dark:border-night-line md:py-24">
          <div className="flex flex-wrap items-center justify-between gap-6 md:flex-nowrap">
            <h2 className="max-w-[20ch] text-3xl font-semibold tracking-tight md:text-4xl">
              The testnet is live. Try a trade.
            </h2>
            <Link
              href="/markets"
              className="shrink-0 whitespace-nowrap rounded-control bg-accent px-6 py-3 font-medium text-cta-text transition-colors hover:bg-accent-deep dark:bg-accent-bright dark:text-night dark:hover:bg-cta-text dark:hover:text-accent-deep"
            >
              Explore markets
            </Link>
          </div>
        </section>
      </main>

      {/* ————— footer ————— */}
      <footer className="border-t border-line dark:border-night-line">
        <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                <Image
                  src="/images/chundrigar-emblem.png"
                  alt=""
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain dark:hidden"
                />
                <Image
                  src="/images/chundrigar-emblem-dark.png"
                  alt=""
                  width={24}
                  height={24}
                  className="hidden h-6 w-6 object-contain dark:block"
                />
              </span>
              <p className="text-[15px] font-semibold tracking-tight text-ink dark:text-night-ink">
                Chundrigar Capital
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="t-figs text-[11px] text-ink-soft dark:text-night-ink-soft">
                Base Sepolia · TESTNET
              </span>
              <Link
                href="/markets"
                className="text-sm font-medium text-accent underline-offset-4 hover:underline dark:text-accent-bright"
              >
                Explore markets
              </Link>
            </div>
          </div>
          <p className="mt-6 max-w-[50ch] text-xs leading-relaxed text-ink-soft dark:text-night-ink-soft">
            Testnet software. Tokens represent simulated inventory during the
            MVP. Nothing here claims a license or regulatory approval.
          </p>
        </div>
      </footer>
    </div>
  );
}
