import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Outfit, JetBrains_Mono } from "next/font/google";
import Ticker from "./ticker";
import "./taste.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const jbmono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jbmono",
});

export const metadata: Metadata = {
  title: "Chundrigar Capital | Pakistan Stock Exchange shares, as tokens",
  description:
    "A compliance-gated protocol that issues PSX shares as 6-decimal tokens, bought directly from the Treasury at backend-signed prices. Testnet on Base Sepolia.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#101114" },
  ],
};

const ADDRESSES = {
  whitelist: "0xb090dE63b98b3e58ea1fe4374f20184076c0091A",
  treasury: "0x2cE43f3854832813f1CF7fba38838F5bA2927E1A",
  spkr: "0x9B3DD15c5E4Ae4f77d48f2497A8155366a98F546",
  signer: "0xe8096648905c199769F9A37F4bAf1D5148916DdB",
};

const short = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;

const PRINCIPLES = [
  {
    title: "Prices live off-chain",
    body: "Nothing pays to keep a feed warm. A signer quotes each trade and signs the exact parameters.",
    span: "md:col-span-2",
    visual: true,
  },
  {
    title: "The contract checks the signature",
    body: "Altered, expired, or replayed quotes are rejected on-chain. A price is spendable only as written.",
    span: "",
    visual: false,
  },
  {
    title: "Compliance gates every transfer",
    body: "The token consults the whitelist itself, on every move, forever.",
    span: "",
    visual: true,
  },
  {
    title: "No market maker in the middle",
    body: "The Treasury is the counterparty. It mints against inventory and burns on exit. Fee: 0.50%.",
    span: "md:col-span-4",
    visual: false,
  },
];

const STEPS = [
  {
    name: "Quote",
    body: "You pick a token (say OGDC), a quantity, and a rail. The signer quotes both rails and signs the bundle: token, amount, payment amount, deadline, nonce, your address.",
  },
  {
    name: "Verify",
    body: "The Treasury contract recovers the signature and checks every parameter against it. Anything expired or replayed fails here, on-chain.",
  },
  {
    name: "Settle",
    body: "The Treasury mints 6-decimal tokens to your wallet (1:1 with shares) and takes a printed 0.5% fee. Selling runs the same path in reverse.",
  },
];

export default function TasteLanding() {
  return (
    <div className={`t-root ${outfit.variable} ${jbmono.variable} bg-paper text-ink dark:bg-night dark:text-night-ink`}>
      <a href="#t-main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper dark:focus:bg-night-ink dark:focus:text-night">
        Skip to content
      </a>

      {/* ————— nav ————— */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur dark:border-night-line dark:bg-night/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 md:px-8">
          <Link href="/taste" className="text-[15px] font-semibold tracking-tight text-ink dark:text-night-ink">
            Chundrigar Capital
          </Link>
          <nav aria-label="Sections" className="ml-2 hidden gap-6 text-sm text-ink-soft dark:text-night-ink-soft md:flex">
            <a href="#t-mechanism" className="transition-colors hover:text-ink dark:hover:text-night-ink">Mechanism</a>
            <a href="#t-compliance" className="transition-colors hover:text-ink dark:hover:text-night-ink">Compliance</a>
            <a href="#t-rails" className="transition-colors hover:text-ink dark:hover:text-night-ink">Rails</a>
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

      <main id="t-main" className="mx-auto max-w-6xl px-5 md:px-8">
        {/* ————— hero: asymmetric split 7/5 ————— */}
        <section className="grid gap-12 py-16 md:grid-cols-12 md:gap-10 md:py-24 lg:grid-cols-12">
          <div className="md:col-span-7 lg:self-center">
            <h1 className="text-5xl font-semibold tracking-tight">
              Pakistan&rsquo;s stock exchange, settled on Base.
            </h1>
            <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-ink-soft dark:text-night-ink-soft">
              PSX shares become compliance-gated tokens, bought from the
              Treasury at prices the backend signs and the contract verifies.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="/"
                className="rounded-control bg-accent px-6 py-3 font-medium text-cta-text transition-colors hover:bg-accent-deep dark:bg-accent-bright dark:text-night dark:hover:bg-cta-text dark:hover:text-accent-deep"
              >
                Open the testnet app
              </a>
              <a
                href="#t-mechanism"
                className="rounded-control border border-line px-6 py-3 font-medium text-ink transition-colors hover:border-ink-soft dark:border-night-line dark:text-night-ink dark:hover:border-night-ink-soft"
              >
                Read the mechanism
              </a>
            </div>
          </div>

          {/* the visual: real pulled data, not a mockup */}
          <div className="md:col-span-5">
            <div className="rounded-surface border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(23,24,28,0.06),0_12px_32px_rgba(23,24,28,0.08)] dark:border-night-line dark:bg-night-surface dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_12px_32px_rgba(0,0,0,0.35)]">
              <p className="mb-5 border-b border-line pb-4 text-sm font-medium text-ink dark:border-night-line dark:text-night-ink">
                Karachi, priced from anywhere
              </p>
              <Ticker />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-soft dark:text-night-ink-soft">
              Veteran names trade here: OGDC, Engro, Lucky. The KSE 100 pull
              above is live from this site&rsquo;s own cached route.
            </p>
          </div>
        </section>

        {/* ————— mechanism: bento, 4 cells for 4 items ————— */}
        <section id="t-mechanism" className="border-t border-line py-16 dark:border-night-line md:py-24">
          <h2 className="max-w-[22ch] text-3xl font-semibold tracking-tight md:text-4xl">
            Four commitments, enforced in code
          </h2>
          <p className="mt-3 max-w-[60ch] text-ink-soft dark:text-night-ink-soft">
            The mechanism is not an intention with a roadmap. Each piece below
            is a deployed contract on Base Sepolia.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {PRINCIPLES.map((p) => (
              <div
                key={p.title}
                className={`rounded-surface border border-line p-6 dark:border-night-line ${
                  p.visual
                    ? "bg-accent-wash dark:bg-night-wash"
                    : "bg-surface dark:bg-night-surface"
                } ${p.span}`}
              >
                <h3 className="text-lg font-medium tracking-tight text-ink dark:text-night-ink">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft dark:text-night-ink-soft">
                  {p.body}
                </p>
              </div>
            ))}
          </div>

          {/* the three-step trade path, on a full-width field */}
          <div className="mt-4 rounded-surface bg-accent-wash p-6 dark:bg-night-wash md:p-8">
            <ol className="grid gap-8 md:grid-cols-3">
              {STEPS.map((s) => (
                <li key={s.name}>
                  <h4 className="font-medium tracking-tight text-ink dark:text-night-ink">
                    {s.name}
                  </h4>
                  <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-soft dark:text-night-ink-soft">
                    {s.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ————— compliance: zig-zag 1 of 2 ————— */}
        <section id="t-compliance" className="border-t border-line py-16 dark:border-night-line md:py-24">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className="max-w-[18ch] text-3xl font-semibold tracking-tight md:text-4xl">
                Identity checked once, then on every transfer
              </h2>
              <p className="mt-4 max-w-[56ch] text-ink-soft dark:text-night-ink-soft">
                Onboarding is concierge KYC during the MVP: you upload an ID, a
                person reviews it, and approval writes your wallet into the
                GlobalWhitelist.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-ink-soft dark:text-night-ink-soft">
                <li className="flex gap-3">
                  <span className="t-figs shrink-0 text-accent dark:text-accent-bright">01</span>
                  <span>Your wallet enters the register. Nothing else grants entry.</span>
                </li>
                <li className="flex gap-3">
                  <span className="t-figs shrink-0 text-accent dark:text-accent-bright">02</span>
                  <span>Every token transfer, in and out, consults the register first.</span>
                </li>
                <li className="flex gap-3">
                  <span className="t-figs shrink-0 text-accent dark:text-accent-bright">03</span>
                  <span>The register carries compliance powers: freeze, force transfer, force burn.</span>
                </li>
              </ul>
              <p className="t-figs mt-6 text-xs text-ink-soft dark:text-night-ink-soft">
                GlobalWhitelist {short(ADDRESSES.whitelist)}
              </p>
            </div>
            {/* real photo goes here: founder reviewing an ID document at a desk (/todo 1600x1200) */}
            <div className="aspect-[4/3] rounded-surface border border-dashed border-line bg-accent-wash/60 dark:border-night-line dark:bg-night-wash">
              <div className="flex h-full items-center justify-center p-8 text-center">
                <p className="max-w-[30ch] text-sm text-ink-soft dark:text-night-ink-soft">
                  Image slot: the concierge review, one desk, one document. A
                  real photograph belongs here.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ————— rails: 7/5, zig-zag 2 of 2 ————— */}
        <section id="t-rails" className="border-t border-line py-16 dark:border-night-line md:py-24">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="rounded-surface border border-line bg-surface p-6 md:p-8 dark:border-night-line dark:bg-night-surface">
                <h3 className="text-xl font-medium tracking-tight text-ink dark:text-night-ink">
                  At home: pay in PKR
                </h3>
                <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-ink-soft dark:text-night-ink-soft">
                  SPKR, the protocol&rsquo;s PKR stablecoin, prices the market
                  natively. No foreign-exchange leg on your trade.
                </p>
                <p className="t-figs mt-5 text-xs text-ink-soft dark:text-night-ink-soft">
                  SPKR {short(ADDRESSES.spkr)} · 6 decimals
                </p>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-surface border border-line bg-surface p-6 md:p-8 dark:border-night-line dark:bg-night-surface">
                <h3 className="text-xl font-medium tracking-tight text-ink dark:text-night-ink">
                  From abroad: pay in USDC
                </h3>
                <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-ink-soft dark:text-night-ink-soft">
                  The FX conversion happens inside the signed quote, at
                  execution time, not at yesterday&rsquo;s rate.
                </p>
                <p className="t-figs mt-5 text-xs text-ink-soft dark:text-night-ink-soft">
                  Signer {short(ADDRESSES.signer)}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-6 max-w-[70ch] text-sm text-ink-soft dark:text-night-ink-soft">
            Both rails meet at the same Treasury ({short(ADDRESSES.treasury)}),
            under the same whitelist, at the same 0.5% fee.
          </p>
        </section>

        {/* ————— close: full-width, single line, left-aligned ————— */}
        <section className="border-t border-line py-16 dark:border-night-line md:py-24">
          <div className="flex flex-wrap items-center justify-between gap-6 md:flex-nowrap">
            <h2 className="max-w-[20ch] text-3xl font-semibold tracking-tight md:text-4xl">
              The trade path works end to end. Walk it.
            </h2>
            <a
              href="/"
              className="shrink-0 rounded-control bg-accent px-6 py-3 font-medium text-cta-text transition-colors hover:bg-accent-deep dark:bg-accent-bright dark:text-night dark:hover:bg-cta-text dark:hover:text-accent-deep"
            >
              Open the testnet app
            </a>
          </div>
        </section>
      </main>

      {/* ————— footer ————— */}
      <footer className="border-t border-line dark:border-night-line">
        <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <p className="text-[15px] font-semibold tracking-tight text-ink dark:text-night-ink">
              Chundrigar Capital
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <span className="t-figs text-[11px] text-ink-soft dark:text-night-ink-soft">
                Base Sepolia · TESTNET
              </span>
              <a
                href="/"
                className="text-sm font-medium text-accent underline-offset-4 hover:underline dark:text-accent-bright"
              >
                Open the testnet app
              </a>
            </div>
          </div>
          <p className="mt-6 max-w-[78ch] text-xs leading-relaxed text-ink-soft dark:text-night-ink-soft">
            Testnet software. Tokens represent simulated inventory during the
            MVP. Nothing here offers returns, yields, dividends, or
            appreciation, and nothing here claims a license or regulatory
            approval. Chundrigar Capital is the protocol; tokens issued on it
            carry their own names.
          </p>
        </div>
      </footer>
    </div>
  );
}
