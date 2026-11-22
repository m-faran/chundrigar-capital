import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Image from "next/image";
import { outfit, jbmono } from "./fonts";
import { TasteHeader } from "./nav";
import {
  HeroPreviewSwitcher,
  HeroSection,
  resolveHeroVariant,
} from "./hero-variants";
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

export default async function TasteLanding({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const variant = resolveHeroVariant(await searchParams);

  return (
    <div className={`t-root ${outfit.variable} ${jbmono.variable} bg-paper text-ink dark:bg-night dark:text-night-ink`}>
      <a href="#t-main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper dark:focus:bg-night-ink dark:focus:text-night">
        Skip to content
      </a>

      {/* ————— responsive shared nav with mobile drawer ————— */}
      <TasteHeader />

      <main id="t-main" className="mx-auto max-w-[1280px] px-5 md:px-8">
        <HeroSection variant={variant} />

        {/* ————— how it works: three user-side steps with actionable links ————— */}
        <section id="t-how" className="py-16 md:py-24">
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

      {/* ————— full-bleed architectural footer ————— */}
      <footer className="relative overflow-hidden border-t border-line bg-[#f8f7f3] dark:border-night-line dark:bg-[#101113]">
        <div className="relative z-10 mx-auto max-w-[1280px] px-5 pt-14 pb-4 md:px-8 md:pt-20 md:pb-6">
          <div className="grid gap-10 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-5">
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
              <p className="mt-3 max-w-[38ch] text-sm leading-relaxed text-ink-soft dark:text-night-ink-soft">
                From I.I. Chundrigar Road to on-chain liquidity.
              </p>
              <p className="mt-4 max-w-[46ch] text-xs leading-relaxed text-ink-soft dark:text-night-ink-soft">
                Testnet software. Tokens represent simulated inventory during
                the MVP. Nothing here claims a license or regulatory approval.
              </p>
              <p className="t-figs mt-5 text-[11px] uppercase tracking-wider text-ink-soft dark:text-night-ink-soft">
                Base Sepolia · TESTNET
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
              <div>
                <h2 className="text-sm font-medium tracking-tight text-ink dark:text-night-ink">
                  Platform
                </h2>
                <ul className="mt-3 grid list-none gap-1 p-0 text-sm">
                  <li>
                    <Link
                      href="/"
                      className="inline-flex min-h-[36px] items-center text-ink-soft transition-colors hover:text-ink dark:text-night-ink-soft dark:hover:text-night-ink"
                    >
                      Overview
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/markets"
                      className="inline-flex min-h-[36px] items-center text-ink-soft transition-colors hover:text-ink dark:text-night-ink-soft dark:hover:text-night-ink"
                    >
                      Markets
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/kyc"
                      className="inline-flex min-h-[36px] items-center text-ink-soft transition-colors hover:text-ink dark:text-night-ink-soft dark:hover:text-night-ink"
                    >
                      Verify identity
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-sm font-medium tracking-tight text-ink dark:text-night-ink">
                  Guide
                </h2>
                <ul className="mt-3 grid list-none gap-1 p-0 text-sm">
                  <li>
                    <a
                      href="#t-how"
                      className="inline-flex min-h-[36px] items-center text-ink-soft transition-colors hover:text-ink dark:text-night-ink-soft dark:hover:text-night-ink"
                    >
                      How it works
                    </a>
                  </li>
                  <li>
                    <a
                      href="#t-rails"
                      className="inline-flex min-h-[36px] items-center text-ink-soft transition-colors hover:text-ink dark:text-night-ink-soft dark:hover:text-night-ink"
                    >
                      Payment rails
                    </a>
                  </li>
                  <li>
                    <a
                      href="#t-trust"
                      className="inline-flex min-h-[36px] items-center text-ink-soft transition-colors hover:text-ink dark:text-night-ink-soft dark:hover:text-night-ink"
                    >
                      Trust &amp; safety
                    </a>
                  </li>
                </ul>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <h2 className="text-sm font-medium tracking-tight text-ink dark:text-night-ink">
                  Location
                </h2>
                <div className="mt-3 grid gap-2 text-sm text-ink-soft dark:text-night-ink-soft">
                  <p>Pakistan Stock Exchange</p>
                  <p>I.I. Chundrigar Road</p>
                  <p>Karachi, Pakistan</p>
                  <p className="t-figs pt-1 text-[11px] tracking-wide">
                    24.8532° N, 67.0006° E
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[1600px] md:-mt-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-[#f8f7f3] to-transparent dark:from-[#101113]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-16 bg-gradient-to-r from-[#f8f7f3] to-transparent dark:from-[#101113] min-[1600px]:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-16 bg-gradient-to-l from-[#f8f7f3] to-transparent dark:from-[#101113] min-[1600px]:block"
          />
          <Image
            src="/images/psx-footer-light.jpg"
            alt="Pakistan Stock Exchange and I.I. Chundrigar Road architectural engraving"
            width={1376}
            height={768}
            sizes="(max-width: 1600px) 100vw, 1600px"
            className="block h-auto w-full dark:hidden"
          />
          <Image
            src="/images/psx-footer-dark.jpg"
            alt="Pakistan Stock Exchange and I.I. Chundrigar Road architectural engraving"
            width={1376}
            height={768}
            sizes="(max-width: 1600px) 100vw, 1600px"
            className="hidden h-auto w-full dark:block"
          />
        </div>
      </footer>
      <HeroPreviewSwitcher active={variant} />
    </div>
  );
}
