import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Image from "next/image";
import { outfit, jbmono } from "./fonts";
import { TasteHeader } from "./nav";
import { LandingV2Sections } from "./landing-v2";
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

export default function TasteLanding() {
  return (
    <div className={`t-root ${outfit.variable} ${jbmono.variable} bg-paper text-ink dark:bg-night dark:text-night-ink`}>
      <a href="#t-main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper dark:focus:bg-night-ink dark:focus:text-night">
        Skip to content
      </a>

      {/* ————— responsive shared nav with mobile drawer ————— */}
      <TasteHeader />

      <main id="t-main" className="w-full">
        {/* ————— hero: CHUNDRIGAR / CAPITAL framing the classical marble bust ————— */}
        <section className="relative overflow-hidden pt-8 pb-16 md:pt-12 md:pb-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_52%_at_50%_34%,rgba(33,72,192,0.28),rgba(147,168,255,0.22)_42%,rgba(238,241,252,0.45)_62%,transparent_80%)] dark:bg-[radial-gradient(ellipse_62%_54%_at_50%_34%,rgba(147,168,255,0.16),rgba(22,48,127,0.18)_45%,transparent_76%)]"
          />

          <div className="relative z-10 mx-auto max-w-[1280px] px-5 md:px-8">
            <div className="relative mx-auto flex max-w-[1160px] flex-col items-center">
              <p
                aria-hidden="true"
                className="pointer-events-none select-none text-center text-[13.5vw] font-semibold uppercase leading-[0.84] tracking-[-0.045em] text-ink dark:text-night-ink xl:text-[176px]"
              >
                CHUNDRIGAR
              </p>

              <div className="relative z-10 mx-auto -mt-[6.5vw] w-[240px] sm:w-[300px] md:-mt-[92px] md:w-[350px] lg:-mt-[112px] lg:w-[380px]">
                <Image
                  src="/images/hero-marble-cobalt-light.png"
                  alt="Classical marble bust with cobalt toga, carved neoclassical columns, and Mughal geometric latticework"
                  width={532}
                  height={684}
                  priority
                  sizes="(max-width: 768px) 300px, 380px"
                  className="block h-auto w-full dark:hidden"
                />
                <Image
                  src="/images/hero-marble-cobalt-dark.png"
                  alt="Classical marble bust with cobalt toga, carved neoclassical columns, and Mughal geometric latticework"
                  width={532}
                  height={684}
                  priority
                  sizes="(max-width: 768px) 300px, 380px"
                  className="hidden h-auto w-full dark:block"
                />
              </div>

              <p
                aria-hidden="true"
                className="pointer-events-none relative z-0 -mt-[11vw] select-none text-center text-[13.5vw] font-semibold uppercase leading-[0.84] tracking-[0.14em] text-ink dark:text-night-ink sm:-mt-[90px] md:-mt-[112px] lg:-mt-[126px] xl:text-[176px]"
              >
                CAPITAL
              </p>
            </div>

            <div className="mx-auto mt-10 flex max-w-[62ch] flex-col items-center text-center md:mt-12">
              <h1 className="max-w-[24ch] text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[42px] lg:leading-[1.1]">
                Trade the{" "}
                <span className="text-accent dark:text-accent-bright">
                  Pakistan Stock Exchange
                </span>{" "}
                from your crypto wallet
              </h1>

              <p className="mt-4 max-w-[50ch] text-base leading-relaxed text-ink-soft dark:text-night-ink-soft sm:text-lg">
                Skip brokerage paperwork — verify your CNIC once and trade PSX
                shares.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/kyc"
                  className="rounded-control bg-accent px-6 py-3 font-medium text-cta-text transition-colors hover:bg-accent-deep dark:bg-accent-bright dark:text-night dark:hover:bg-cta-text dark:hover:text-accent-deep"
                >
                  Verify wallet
                </Link>
                <Link
                  href="/markets"
                  className="rounded-control border border-line px-6 py-3 font-medium text-ink transition-colors hover:border-ink-soft dark:border-night-line dark:text-night-ink dark:hover:border-night-ink-soft"
                >
                  Explore markets
                </Link>
              </div>
            </div>
          </div>
        </section>

        <LandingV2Sections />
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
    </div>
  );
}
