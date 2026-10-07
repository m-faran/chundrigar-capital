import type { Metadata } from "next";
import Link from "next/link";
import { Archivo, Archivo_Narrow, Spline_Sans_Mono } from "next/font/google";
import { FxRate, KseConstituents } from "./rate-board";
import "./impeccable.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--cc-font-sans",
});

const archivoNarrow = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--cc-font-narrow",
});

const splineMono = Spline_Sans_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--cc-font-mono",
});

export const metadata: Metadata = {
  title: "Chundrigar Capital — PSX equities, settled on-chain",
  description:
    "Compliance-gated tokens backed 1:1 by Pakistan Stock Exchange shares, bought from the protocol Treasury at prices the backend signs and the contract verifies. Base Sepolia testnet.",
};

/* Real Base Sepolia deployments, recorded in PRODUCT.md / Tasks.md. */
const ADDRESSES = {
  whitelist: "0xb090dE63b98b3e58ea1fe4374f20184076c0091A",
  spkr: "0x9B3DD15c5E4Ae4f77d48f2497A8155366a98F546",
  treasury: "0x2cE43f3854832813f1CF7fba38838F5bA2927E1A",
  usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  signer: "0xe8096648905c199769F9A37F4bAf1D5148916DdB",
};

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

const PIPELINE = [
  {
    stage: "Request",
    name: "A trade is requested",
    body: "The app asks for a price on one stock token, one quantity, one rail — PKR via SPKR at home, USDC from abroad.",
    artifact: "quote request",
  },
  {
    stage: "Sign",
    name: "The backend signs the price",
    body: "Prices never live on-chain. The signer prices the trade off-chain and signs the exact parameters: token, payment token, amount, payment amount, deadline, nonce, your address.",
    artifact: "ECDSA signature",
  },
  {
    stage: "Verify",
    name: "The contract checks everything",
    body: "The Treasury verifies the signature against those exact parameters and rejects anything expired, replayed, or altered. A quote is only spendable as written.",
    artifact: "on-chain check",
  },
  {
    stage: "Gate",
    name: "The register is consulted",
    body: "Every transfer — yours, and anyone you ever sell to — consults the GlobalWhitelist. Compliance rides inside the token, not in a promise.",
    artifact: "whitelist check",
  },
  {
    stage: "Settle",
    name: "The Treasury settles",
    body: "No AMM, no orderbook. The protocol is the counterparty: it mints or burns against its own inventory and prints the 0.50% commission on the receipt.",
    artifact: "mint / burn",
  },
];

const TERMS = [
  {
    term: "Pull, not push",
    body: "Prices live off-chain and are pulled per trade. The protocol pays nothing to keep a price feed warm, and no price exists on-chain to go stale.",
  },
  {
    term: "No stale weekend price",
    body: "A quote is bound to a deadline. The contract will not settle a trade against a price that has outlived it — market closed means nothing settles.",
  },
  {
    term: "No feed to kill",
    body: "The mechanism never depends on a third-party on-chain PKR feed that someone could deprecate out from under the protocol.",
  },
  {
    term: "Six decimals, printed",
    body: "Tokens are plain 6-decimal ERC-20s. Amounts normalize off-chain, then the signed numbers are what settle — the same figures the receipt shows.",
  },
];

export default function ImpeccableLanding() {
  return (
    <div
      className={`cc-root ${archivo.variable} ${archivoNarrow.variable} ${splineMono.variable}`}
    >
      <a className="cc-skip" href="#cc-main">
        Skip to content
      </a>

      <header className="cc-nav">
        <Link className="cc-wordmark" href="/impeccable">
          Chundrigar&nbsp;Capital
        </Link>
        <nav className="cc-nav-links" aria-label="Site">
          <Link href="/impeccable/markets">The register</Link>
          <a href="#cc-mechanism">Mechanism</a>
          <a href="#cc-rails">Rails</a>
          <a href="#cc-compliance">Compliance</a>
        </nav>
        <span className="cc-nettag" title="Every deployment on this page is on Base Sepolia">
          Base Sepolia · Testnet
        </span>
        <a className="cc-cta cc-cta-nav" href="/">
          Open the testnet app
        </a>
      </header>

      <main id="cc-main">
        <section className="cc-hero">
          <div className="cc-hero-head">
            <h1>PSX shares, settled on-chain.</h1>
            <p>
              Compliance-gated tokens backed 1:1 by real Pakistan Stock
              Exchange shares — bought from the Treasury at prices the backend
              signs and the contract verifies.
            </p>
          </div>

          <div className="cc-hero-split">
            {/* ————— The receipt ————— */}
            <article className="cc-receipt" aria-label="Specimen oracle receipt">
              <div className="cc-receipt-head">
                <p className="cc-receipt-brand">Chundrigar Capital</p>
                <p className="cc-receipt-sub">Oracle quote receipt</p>
                <p className="cc-receipt-meta">
                  <span>No. 000421</span>
                  <span>05 Oct 2026 · Karachi</span>
                </p>
                <span className="cc-specimen" aria-hidden="true">
                  Specimen
                </span>
              </div>

              <dl className="cc-receipt-rows">
                <div className="cc-rrow">
                  <dt>Action</dt>
                  <dd className="cc-mono">BUY</dd>
                </div>
                <div className="cc-rrow cc-rrow-token">
                  <dt>Token</dt>
                  <dd>
                    <span className="cc-mono">OGDC</span>
                    <span className="cc-tokname">
                      Oil &amp; Gas Development Co. Ltd.
                    </span>
                    <span className="cc-tokratio">1 token = 1 share</span>
                  </dd>
                </div>
                <div className="cc-rrow">
                  <dt>Quantity</dt>
                  <dd className="cc-mono">10 tokens</dd>
                </div>
                <div className="cc-rrow">
                  <dt>
                    Rail A <span className="cc-railhint">PKR via SPKR</span>
                  </dt>
                  <dd className="cc-mono">PKR 3,125.00</dd>
                </div>
                <div className="cc-rrow">
                  <dt>
                    Rail B <span className="cc-railhint">USDC, from abroad</span>
                  </dt>
                  <dd className="cc-mono">11.223415 USDC</dd>
                </div>
                <div className="cc-rrow">
                  <dt>
                    Commission <span className="cc-railhint">0.50%, printed</span>
                  </dt>
                  <dd className="cc-mono">PKR 15.625000</dd>
                </div>
                <div className="cc-rrow">
                  <dt>Deadline</dt>
                  <dd className="cc-mono">12:04:31 PKT</dd>
                </div>
                <div className="cc-rrow">
                  <dt>Nonce</dt>
                  <dd className="cc-mono">000341</dd>
                </div>
                <div className="cc-rrow">
                  <dt>Signed by</dt>
                  <dd
                    className="cc-mono"
                    title={`Oracle signer · ${ADDRESSES.signer}`}
                  >
                    {short(ADDRESSES.signer)}
                  </dd>
                </div>
                <div className="cc-rrow">
                  <dt>Verified by</dt>
                  <dd
                    className="cc-mono"
                    title={`Treasury contract · ${ADDRESSES.treasury}`}
                  >
                    Treasury {short(ADDRESSES.treasury)}
                  </dd>
                </div>
              </dl>

              <div className="cc-receipt-total">
                <span>Total debit — Rail A</span>
                <span className="cc-mono">PKR 3,140.625000</span>
              </div>

              <p className="cc-receipt-fineprint">
                Specimen. Amounts are illustrative — live quotes are signed
                per trade, at execution, for the parameters you choose.
              </p>

              <span className="cc-stamp" aria-label="Verified by the Treasury contract">
                Verified
                <em>Treasury · Base Sepolia</em>
              </span>

              <div className="cc-tear" aria-hidden="true" />
            </article>

            {/* ————— The rate board ————— */}
            <div className="cc-side">
              <div className="cc-board" role="status" aria-label="Live rates, pulled from the data feeds">
                <p className="cc-board-head">
                  Rates — pulled, not pushed
                </p>
                <div className="cc-board-row">
                  <span className="cc-board-label">USD / PKR</span>
                  <FxRate />
                </div>
                <div className="cc-board-row cc-board-row-kse">
                  <span className="cc-board-label">KSE 100</span>
                  <KseConstituents />
                </div>
                <p className="cc-board-foot">
                  Pulled live through the protocol&rsquo;s cached routes —
                  PSX Data API 15s, FX 60s. The same pull the signer prices
                  against.
                </p>
              </div>

              <a className="cc-cta cc-cta-hero" href="/">
                Open the testnet app
              </a>
              <p className="cc-cta-sub">
                Wallet in, pick a token, watch the receipt sign. Concierge KYC
                during the MVP.
              </p>
            </div>
          </div>
        </section>

        {/* ————— How a trade settles ————— */}
        <section id="cc-mechanism" className="cc-pipeline">
          <h2>How a trade settles</h2>
          <p className="cc-section-lede">
            One trade, end to end. Nothing in this path is a promise — each
            step produces an artifact the next step can refuse.
          </p>
          <ol className="cc-steps">
            {PIPELINE.map((s) => (
              <li key={s.stage} className="cc-step">
                <span className="cc-step-stage">{s.stage}</span>
                <span className="cc-step-name">{s.name}</span>
                <span className="cc-step-body">{s.body}</span>
                <span className="cc-step-artifact">{s.artifact}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* ————— Two rails ————— */}
        <section id="cc-rails" className="cc-rails">
          <h2>Two rails into one market</h2>
          <p className="cc-section-lede">
            The local rail and the diaspora rail are the same market seen from
            two banks of the same ledger. Co-equal from day one.
          </p>
          <div className="cc-spread">
            <div className="cc-rail">
              <h3>
                Rail A <span>· PKR, via SPKR</span>
              </h3>
              <p>
                Pricing is native: PKR in, PKR out, no FX leg. SPKR is the
                protocol&rsquo;s 6-decimal PKR stablecoin, already deployed.
              </p>
              <p className="cc-rail-line">
                <span>Stablecoin</span>
                <span className="cc-mono" title={`Storm PKR (SPKR) · ${ADDRESSES.spkr}`}>
                  SPKR {short(ADDRESSES.spkr)}
                </span>
              </p>
              <p className="cc-rail-line">
                <span>For</span>
                <span>Pakistani retail investors, no brokerage account</span>
              </p>
            </div>
            <div className="cc-spine" aria-hidden="true">
              <span>Same Treasury</span>
              <span>Same register</span>
              <span>Same fee</span>
            </div>
            <div className="cc-rail">
              <h3>
                Rail B <span>· USDC, from abroad</span>
              </h3>
              <p>
                Pay in USDC; the FX conversion happens at execution, inside
                the signed quote — not at some rate from yesterday.
              </p>
              <p className="cc-rail-line">
                <span>Payment token</span>
                <span className="cc-mono" title={`Test USDC · ${ADDRESSES.usdc}`}>
                  USDC {short(ADDRESSES.usdc)}
                </span>
              </p>
              <p className="cc-rail-line">
                <span>For</span>
                <span>Overseas Pakistanis holding PSX exposure from abroad</span>
              </p>
            </div>
          </div>
        </section>

        {/* ————— Compliance ————— */}
        <section id="cc-compliance" className="cc-compliance">
          <h2>Compliance is the product</h2>
          <p className="cc-section-lede">
            The whitelist is not a promise in the docs — it is a contract the
            token consults on every transfer. During the MVP, a person reviews
            every ID.
          </p>
          <div className="cc-register">
            <p className="cc-register-head">
              Register
              <span
                className="cc-mono"
                title={`GlobalWhitelist · ${ADDRESSES.whitelist}`}
              >
                GlobalWhitelist {short(ADDRESSES.whitelist)}
              </span>
            </p>
            <ol className="cc-register-rows">
              <li>
                <span className="cc-mono">01</span>
                <span>
                  <strong>ID uploaded.</strong> You submit identification in
                  the app; a founder reviews it by hand — concierge KYC while
                  volumes are small and honest.
                </span>
              </li>
              <li>
                <span className="cc-mono">02</span>
                <span>
                  <strong>Address written to the register.</strong> Approval
                  puts your wallet into GlobalWhitelist. Nothing else grants
                  entry.
                </span>
              </li>
              <li>
                <span className="cc-mono">03</span>
                <span>
                  <strong>Every transfer checks back.</strong> Tokens can be
                  frozen, force-transferred, or force-burned by the compliance
                  powers built into the contract.
                </span>
              </li>
            </ol>
            <p className="cc-register-foot">
              The contract set has been through one full audit pass, with
              remediations applied.
            </p>
          </div>
        </section>

        {/* ————— Why signed prices ————— */}
        <section className="cc-terms">
          <h2>Why the prices are signed</h2>
          <dl className="cc-terms-list">
            {TERMS.map((t) => (
              <div key={t.term} className="cc-term">
                <dt>{t.term}</dt>
                <dd>{t.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ————— Deployments ————— */}
        <section className="cc-deploy">
          <h2>On testnet today</h2>
          <p className="cc-section-lede">
            Real deployments, on Base Sepolia — the addresses this page
            already quotes.
          </p>
          <ul className="cc-deploy-list">
            {(
              [
                ["GlobalWhitelist", ADDRESSES.whitelist],
                ["Treasury", ADDRESSES.treasury],
                ["Storm PKR (SPKR)", ADDRESSES.spkr],
                ["Test USDC", ADDRESSES.usdc],
                ["Oracle signer", ADDRESSES.signer],
              ] as const
            ).map(([name, addr]) => (
              <li key={addr} className="cc-deploy-row">
                <span>{name}</span>
                <span className="cc-mono" title={addr}>
                  {addr}
                </span>
              </li>
            ))}
          </ul>
          <p className="cc-deploy-fineprint">
            Testnet software. Nothing here offers or implies returns, yields,
            or dividends. Stock tokens represent simulated inventory during
            the MVP, and nothing on this page is a claim of licensing or
            regulatory approval.
          </p>
        </section>
      </main>

      <footer className="cc-footer">
        <p className="cc-wordmark cc-wordmark-foot">Chundrigar&nbsp;Capital</p>
        <p className="cc-footer-line">
          A protocol for PSX equities on Base. Karachi, priced from anywhere.
        </p>
        <a className="cc-cta" href="/">
          Open the testnet app
        </a>
      </footer>
    </div>
  );
}
