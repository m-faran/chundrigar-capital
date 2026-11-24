import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { FaqAccordion, type FaqItem } from "./faq-accordion";

const PROBLEMS = [
  {
    title: "Days lost to brokerage & CDC paperwork",
    cost: "Missed sessions",
    body: "Opening a traditional PSX brokerage account still means physical forms, UIN registration, bank verification, and manual broker approvals. While paperwork sits in a queue, KSE-100 sessions move without you.",
  },
  {
    title: "Capital trapped behind legacy settlement",
    cost: "T+2 lag",
    body: "Moving value between your crypto wallet, local bank accounts, and broker ledgers forces slow transfers, cutoff hours, and multi-day withdrawal waits when you want to enter or exit a position.",
  },
  {
    title: "Layered commissions and opaque execution",
    cost: "Hidden drag",
    body: "Brokerage minimums, CDC custody charges, exchange levies, and wide spreads on thinly traded names quietly eat into every trade before you ever see a net settlement figure.",
  },
];

type FeatureItem = {
  id: string;
  title: string;
  benefit: string;
  mechanism: string;
  imageSrc: string;
  imageAlt: string;
};

const FEATURES: FeatureItem[] = [
  {
    id: "whitelist",
    title: "Verify your CNIC once, trade without repeat checks",
    benefit: "Skip brokerage paperwork for good — compliance travels with your wallet.",
    mechanism:
      "A single identity review registers your address on the on-chain GlobalWhitelist contract. Every mint, burn, and transfer enforces approval automatically with zero recurring forms.",
    imageSrc: "/images/feature-whitelist-v2.jpg",
    imageAlt:
      "Pakistani National Identity Card specimen paired with a cobalt Whitelisted verification badge",
  },
  {
    id: "oracle",
    title: "Live PSX quotes, cryptographically signed",
    benefit: "Know your exact settlement price before you click confirm.",
    mechanism:
      "Every quote pulls live KSE-100 pricing from the PSX feed and signs your exact trade parameters off-chain via EIP-191 ECDSA with a 5-minute expiry and unique nonce — blocking stale or weekend price manipulation.",
    imageSrc: "/images/feature-oracle-v2.jpg",
    imageAlt:
      "PSX daily close candlestick price chart card displaying 169.61 PKR with a cobalt Signed Quote Verified badge",
  },
  {
    id: "treasury",
    title: "Direct Treasury settlement at one printed 0.50% fee",
    benefit: "Instant execution with no thin orderbooks and no middlemen.",
    mechanism:
      "The protocol Treasury acts as your direct primary counterparty. Buys mint stock tokens atomically to your wallet and sells burn them straight back — one transparent 50 bps fee, nothing hidden.",
    imageSrc: "/images/feature-treasury-light.jpg",
    imageAlt:
      "Miniature carved alabaster neoclassical portico with cobalt frieze flanked by stacked silver and stone equity discs",
  },
  {
    id: "rails",
    title: "Settle in PKR (SPKR) or USDC on one unified rail",
    benefit: "Trade natively in rupees from Pakistan, or in USDC from abroad.",
    mechanism:
      "Pay in SPKR with zero currency conversion, or pay in USDC with live USD/PKR FX locked directly inside the signed quote. Both paths settle at the exact same share price and 0.50% fee.",
    imageSrc: "/images/feature-rails-v2.jpg",
    imageAlt:
      "Split comparison of $SPKR Pakistani Rupee stablecoin versus $USDC digital dollar rail",
  },
  {
    id: "custody",
    title: "KSE-100 coverage, self-custodied in your own wallet",
    benefit: "Hold and exit leading Pakistani companies without a broker portal.",
    mechanism:
      "Browse 100 KSE-100 companies across banking, energy, cement, fertilizer, and tech with live price charts. Tokens settle directly into MetaMask, Rainbow, or Coinbase Wallet on Base Sepolia.",
    imageSrc: "/images/feature-custody-v2.jpg",
    imageAlt:
      "KSE-100 Pakistan Stock Exchange index list card showing ABL, OGDC, ENGRO, BAFL, AIRLINK, ATRL, and AKBL",
  },
];

const STEPS_V2 = [
  {
    number: "01",
    title: "Connect your wallet",
    body: "Connect MetaMask, Rainbow, or Coinbase Wallet on Base Sepolia. No broker login or password setup.",
  },
  {
    number: "02",
    title: "Verify your CNIC once",
    body: "Complete a quick one-time ID submission. Once approved, your address joins GlobalWhitelist permanently.",
    href: "/kyc",
    cta: "Verify wallet",
  },
  {
    number: "03",
    title: "Pick a stock & inspect the quote",
    body: "Choose any KSE-100 company, enter your share amount, and see the signed PSX price and 0.50% fee upfront.",
    href: "/markets",
    cta: "Explore markets",
  },
  {
    number: "04",
    title: "Confirm & settle on-chain",
    body: "Approve the transaction in your wallet. Tokens mint straight to your address on buy, and settle back on sell.",
  },
];

const FAQS: FaqItem[] = [
  {
    question: "Why do I have to verify my CNIC before trading?",
    answer:
      "Compliance is built directly into the token contract through the GlobalWhitelist registry, which checks approval on every buy, sell, and transfer. You verify once so you never fill out brokerage paperwork again.",
  },
  {
    question: "Is Chundrigar Capital live on mainnet with real PSX custody?",
    answer:
      "Not yet. Chundrigar Capital is live on Base Sepolia testnet with simulated inventory during the MVP to validate the signed pull-oracle and atomic Treasury settlement flow. Nothing here claims regulatory licensing or mainnet custody.",
  },
  {
    question: "How are share prices set, and what happens when PSX is closed?",
    answer:
      "Prices come from the live PSX Data API via a cached backend proxy and are cryptographically signed off-chain using EIP-191 ECDSA. Each quote binds your wallet, stock token, amount, nonce, and a 5-minute deadline so stale or off-hours quotes cannot be replayed.",
  },
  {
    question: "What fees apply when I buy or sell?",
    answer:
      "The protocol charges a flat 0.50% (50 bps) fee on buys and sells, printed clearly inside your quote before you sign, plus standard Base network gas. There are no brokerage minimums, CDC custody charges, or hidden spreads.",
  },
  {
    question: "Which wallets and payment tokens can I use?",
    answer:
      "Any standard EVM wallet supported by RainbowKit works — including MetaMask, Rainbow, Coinbase Wallet, and WalletConnect on Base Sepolia. You can settle locally in SPKR (PKR-pegged stablecoin) or in USDC with live USD/PKR conversion baked into the quote.",
  },
  {
    question: "Can I sell my tokens back anytime, and are dividends supported?",
    answer:
      "Yes — because the protocol Treasury is your direct counterparty, you can sell stock tokens back at a signed quote without waiting for an orderbook buyer. Corporate actions such as dividends and stock splits are deferred for post-MVP releases.",
  },
];

function FeatureVisual({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-surface border border-accent/20 bg-[#f7f6f2] shadow-[0_12px_32px_rgba(33,72,192,0.09)] dark:border-accent-bright/20 dark:shadow-[0_12px_36px_rgba(147,168,255,0.08)]">
      <Image
        src={src}
        alt={alt}
        width={1344}
        height={756}
        sizes="(max-width: 768px) 100vw, 600px"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

export function LandingV2Sections() {
  return (
    <>
      {/* ————— problem statement: friction & real cost ————— */}
      <section
        id="t-problem"
        className="border-t border-line py-16 dark:border-night-line md:py-24"
      >
        <div className="mx-auto max-w-[1280px] px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <h2 className="max-w-[16ch] text-3xl font-semibold tracking-tight md:text-4xl lg:leading-[1.1]">
                Trading PSX shouldn&apos;t cost you{" "}
                <span className="text-accent dark:text-accent-bright">
                  weeks before your first order
                </span>
              </h2>
              <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-ink-soft dark:text-night-ink-soft">
                You already hold capital on-chain and move in seconds.
                Traditional Pakistani equity access still forces you back into
                paper forms, broker queues, and multi-day settlement windows —
                turning every market move into a waiting game.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="divide-y divide-line border-y border-line dark:divide-night-line dark:border-night-line">
                {PROBLEMS.map((p) => (
                  <div
                    key={p.title}
                    className="grid gap-3 py-6 sm:grid-cols-12 sm:gap-6 md:py-7"
                  >
                    <div className="sm:col-span-4">
                      <span className="t-figs inline-block rounded-control border border-accent/25 bg-accent-wash px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-accent-deep dark:border-accent-bright/25 dark:bg-[#162040] dark:text-accent-bright">
                        {p.cost}
                      </span>
                    </div>
                    <div className="sm:col-span-8">
                      <h3 className="text-lg font-medium tracking-tight text-ink dark:text-night-ink">
                        {p.title}
                      </h3>
                      <p className="mt-2 max-w-[54ch] text-sm leading-relaxed text-ink-soft dark:text-night-ink-soft">
                        {p.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ————— solution & value: features, benefits & visuals ————— */}
      <section
        id="t-trust"
        className="border-t border-line py-16 dark:border-night-line md:py-24"
      >
        <div className="mx-auto max-w-[1280px] px-5 md:px-8">
          <div className="max-w-[58ch]">
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl lg:leading-[1.1]">
              An exchange protocol built for{" "}
              <span className="text-accent dark:text-accent-bright">
                how you already hold capital
              </span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-soft dark:text-night-ink-soft">
              Compliance-gated ERC-20 shares, live signed PSX prices, and direct
              Treasury settlement — engineered so your crypto wallet is the only
              account you need.
            </p>
          </div>

          <div className="mt-14 divide-y divide-line border-t border-line dark:divide-night-line dark:border-night-line">
            {FEATURES.map((f, index) => {
              const reverse = index % 2 === 1;
              return (
                <article
                  key={f.id}
                  className="grid items-center gap-8 py-12 md:grid-cols-12 md:gap-10 md:py-16"
                >
                  <div
                    className={`md:col-span-6 ${
                      reverse ? "md:order-2 md:pl-4" : "md:pr-4"
                    }`}
                  >
                    <h3 className="max-w-[24ch] text-2xl font-semibold tracking-tight text-ink dark:text-night-ink">
                      {f.title}
                    </h3>
                    <p className="mt-3 max-w-[48ch] text-base font-medium leading-relaxed text-accent dark:text-accent-bright">
                      {f.benefit}
                    </p>
                    <p className="mt-3 max-w-[54ch] text-sm leading-relaxed text-ink-soft dark:text-night-ink-soft sm:text-[15px]">
                      {f.mechanism}
                    </p>
                  </div>

                  <div className={`md:col-span-6 ${reverse ? "md:order-1" : ""}`}>
                    <FeatureVisual src={f.imageSrc} alt={f.imageAlt} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ————— how it works: full-bleed cobalt gradient band ————— */}
      <section
        id="t-how"
        className="border-t border-accent-deep/20 bg-gradient-to-br from-accent-deep via-accent to-[#2955d9] py-16 text-cta-text dark:border-accent-bright/20 dark:from-[#0f1733] dark:via-[#14214a] dark:to-[#18295c] dark:text-night-ink md:py-24"
      >
        <div className="mx-auto max-w-[1280px] px-5 md:px-8">
          <div className="max-w-[56ch]">
            <h2 className="text-3xl font-semibold tracking-tight text-cta-text dark:text-night-ink md:text-4xl lg:leading-[1.1]">
              From wallet connect to settled share in four steps
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#d8e1ff] dark:text-[#b8c4e8]">
              No lock-ins, no minimum deposits, and no brokerage account to
              open. Try the entire flow on Base Sepolia testnet in minutes.
            </p>
          </div>

          <ol className="mt-12 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STEPS_V2.map((s) => (
              <li
                key={s.number}
                className="flex flex-col rounded-surface border border-white/60 bg-[#f5f7ff] p-6 text-ink shadow-[0_12px_28px_rgba(16,28,74,0.28)] dark:border-accent-bright/25 dark:bg-[#192752] dark:text-night-ink dark:shadow-[0_12px_28px_rgba(0,0,0,0.4)]"
              >
                <span className="t-figs inline-flex w-fit items-center rounded-control bg-accent-wash px-2 py-0.5 text-xs font-semibold text-accent-deep dark:bg-accent-bright/15 dark:text-accent-bright">
                  {s.number}
                </span>
                <h3 className="mt-4 text-lg font-medium tracking-tight text-ink dark:text-night-ink">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft dark:text-[#b8c4e8]">
                  {s.body}
                </p>
                {s.href && s.cta && (
                  <div className="mt-auto pt-4">
                    <Link
                      href={s.href}
                      className="inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-accent underline-offset-4 hover:underline dark:text-accent-bright"
                    >
                      {s.cta}
                      <ArrowUpRight
                        size={15}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ————— FAQs ————— */}
      <section
        id="t-faq"
        className="border-t border-line py-16 dark:border-night-line md:py-24"
      >
        <div className="mx-auto max-w-[1280px] px-5 md:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-4">
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl lg:leading-[1.1]">
                Questions, answered plainly
              </h2>
              <p className="mt-4 max-w-[36ch] text-sm leading-relaxed text-ink-soft dark:text-night-ink-soft sm:text-base">
                How verification, signed quotes, fees, and testnet settlement
                work under the hood.
              </p>
            </div>

            <div className="lg:col-span-8">
              <FaqAccordion items={FAQS} />
            </div>
          </div>
        </div>
      </section>

      {/* ————— close: soft cobalt-wash band right before the PSX footer ————— */}
      <section className="border-t border-accent/15 bg-gradient-to-b from-accent-wash to-[#f5f7ff] py-16 dark:border-accent-bright/15 dark:from-[#131b35] dark:to-[#101528] md:py-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6 md:flex-nowrap">
            <div>
              <h2 className="max-w-[20ch] text-3xl font-semibold tracking-tight md:text-4xl">
                The testnet is live. Try a trade.
              </h2>
              <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-ink-soft dark:text-night-ink-soft sm:text-base">
                Verify your wallet once and test buying or selling KSE-100
                shares on Base Sepolia.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              <Link
                href="/kyc"
                className="whitespace-nowrap rounded-control bg-accent px-6 py-3 font-medium text-cta-text transition-colors hover:bg-accent-deep dark:bg-accent-bright dark:text-night dark:hover:bg-cta-text dark:hover:text-accent-deep"
              >
                Verify wallet
              </Link>
              <Link
                href="/markets"
                className="whitespace-nowrap rounded-control border border-accent/25 bg-surface px-6 py-3 font-medium text-ink transition-colors hover:border-accent dark:border-accent-bright/30 dark:bg-night-surface dark:text-night-ink dark:hover:border-accent-bright"
              >
                Explore markets
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
