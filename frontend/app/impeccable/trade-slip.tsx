"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createConfig,
  http,
  WagmiProvider,
  useAccount,
  useConnect,
  useWriteContract,
  useSwitchChain,
  usePublicClient,
} from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "wagmi/connectors";
import { parseUnits } from "viem";

/* Real Base Sepolia deployments (PRODUCT.md / Tasks.md). */
const TREASURY_ADDRESS = process.env
  .NEXT_PUBLIC_TREASURY_ADDRESS as `0x${string}`;
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;
const SPKR_ADDRESS = process.env.NEXT_PUBLIC_SPKR_ADDRESS as `0x${string}`;

const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: { [baseSepolia.id]: http() },
  connectors: [injected()],
});
const queryClient = new QueryClient();

const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

const TREASURY_ABI = [
  {
    type: "function",
    name: "nonces",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "buy",
    inputs: [
      { name: "token", type: "address" },
      { name: "paymentToken", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "paymentAmount", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "sell",
    inputs: [
      { name: "token", type: "address" },
      { name: "paymentToken", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "paymentAmount", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "signature", type: "bytes" },
    ],
    outputs: [],
  },
  {
    type: "event",
    name: "TokenDeployed",
    inputs: [
      { name: "tokenAddress", type: "address", indexed: false },
      { name: "symbol", type: "string", indexed: false },
    ],
  },
] as const;

const WHITELIST_ABI = [
  {
    type: "function",
    name: "isWhitelisted",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

const WHITELIST_ADDRESS = "0xb090dE63b98b3e58ea1fe4374f20184076c0091A" as const;

/* ————— the slim board-green quote band ————— */

export function QuoteBand({
  price,
  changePct,
  pulledAt = null,
}: {
  symbol: string;
  price: number;
  changePct: number | null;
  pulledAt?: string | null;
}) {
  return (
    <div className="cc-quoteband" role="status" aria-label="Latest PSX close">
      <div className="cc-quoteband-cell">
        <span className="cc-quoteband-label">PSX close · PKR per share</span>
        <span className="cc-mono cc-quoteband-price">
          {price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
      <div className="cc-quoteband-cell">
        <span className="cc-quoteband-label">Day change</span>
        <span className="cc-mono cc-quoteband-change">
          {changePct == null ? "—" : `${changePct >= 0 ? "+" : "−"}${Math.abs(changePct).toFixed(2)}%`}
        </span>
      </div>
      <div className="cc-quoteband-cell cc-quoteband-meta">
        <span className="cc-quoteband-label">Pulled</span>
        <span className="cc-mono cc-quoteband-time">
          {pulledAt
            ? new Date(pulledAt).toISOString().slice(0, 16).replace("T", " ") + " UTC"
            : "daily close, PSX Data API"}
        </span>
      </div>
    </div>
  );
}

/* ————— the graph-paper chart ————— */

type Bar = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

const RANGES = [
  { key: "1M", bars: 22 },
  { key: "3M", bars: 66 },
  { key: "6M", bars: 132 },
  { key: "1Y", bars: 248 },
  { key: "ALL", bars: 380 },
] as const;

const W = 720;
const H = 320;
const PAD_L = 8;
const PAD_R = 64;
const PAD_T = 14;
const PAD_B = 26;

export function HistoryChart({ bars: newestFirst }: { bars: Bar[] }) {
  const bars = useMemo(() => [...newestFirst].reverse(), [newestFirst]);
  const [rangeKey, setRangeKey] = useState<(typeof RANGES)[number]["key"]>("3M");

  const view = useMemo(() => {
    const n = RANGES.find((r) => r.key === rangeKey)?.bars ?? 66;
    const slice = bars.slice(-n);
    if (slice.length === 0) return null;

    const lows = slice.map((b) => b.low);
    const highs = slice.map((b) => b.high);
    let min = Math.min(...lows);
    let max = Math.max(...highs);
    const pad = (max - min) * 0.06 || max * 0.02;
    min -= pad;
    max += pad;

    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;
    const x = (i: number) => PAD_L + (plotW * (i + 0.5)) / slice.length;
    const y = (v: number) => PAD_T + plotH - (plotH * (v - min)) / (max - min);

    const ticks = [];
    for (let i = 0; i <= 4; i++) {
      const v = min + ((max - min) * i) / 4;
      ticks.push({ v, y: y(v) });
    }

    const dateCount = Math.min(5, slice.length);
    const dates = Array.from({ length: dateCount }, (_, k) => {
      const i = Math.round((k * (slice.length - 1)) / Math.max(1, dateCount - 1));
      return { x: x(i), label: slice[i].date.slice(2).replace(/^\d\d-/, "") };
    });

    const candle = slice.length <= 70;
    const cw = Math.max(1.6, (plotW / slice.length) * 0.62);

    return { slice, x, y, ticks, dates, candle, cw, min, max };
  }, [bars, rangeKey]);

  const fmtNum = (v: number) =>
    v >= 1000 ? v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : v.toFixed(2);

  return (
    <figure className="cc-chart">
      <div className="cc-chart-head">
        <figcaption className="cc-chart-caption">
          Price record — daily, printed on the square
        </figcaption>
        <div className="cc-chart-ranges" role="tablist" aria-label="Range">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              role="tab"
              aria-selected={r.key === rangeKey}
              className={`cc-chart-tab${r.key === rangeKey ? " is-active" : ""}`}
              onClick={() => setRangeKey(r.key)}
            >
              {r.key}
            </button>
          ))}
        </div>
      </div>

      {view && (
        <div className="cc-chart-scroll">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="cc-chart-svg"
            role="img"
            aria-label={`Daily price chart, last ${view.slice.length} trading days`}
          >
            <defs>
              <pattern id="cc-graph" width="24" height="32" patternUnits="userSpaceOnUse">
                <path
                  d="M 24 0 L 0 0 0 32"
                  fill="none"
                  stroke="rgba(34,51,74,0.13)"
                  strokeWidth="0.6"
                />
              </pattern>
            </defs>
            <rect x={0} y={0} width={W} height={H} fill="url(#cc-graph)" />

            {view.ticks.map((t, i) => (
              <g key={i}>
                <line
                  x1={PAD_L}
                  x2={W - PAD_R}
                  y1={t.y}
                  y2={t.y}
                  stroke="rgba(34,51,74,0.24)"
                  strokeWidth="0.7"
                />
                <text
                  x={W - PAD_R + 6}
                  y={t.y + 3.2}
                  className="cc-chart-ax"
                >
                  {fmtNum(t.v)}
                </text>
              </g>
            ))}

            {view.dates.map((d, i) => (
              <text key={i} x={d.x} y={H - 8} textAnchor="middle" className="cc-chart-ax">
                {d.label}
              </text>
            ))}

            {view.candle
              ? view.slice.map((b, i) => {
                  const up = b.close >= b.open;
                  const cx = view.x(i);
                  const bw = view.cw;
                  const top = view.y(Math.max(b.open, b.close));
                  const bot = view.y(Math.min(b.open, b.close));
                  return (
                    <g key={b.date + i}>
                      <title>{`${b.date}: O ${b.open} · H ${b.high} · L ${b.low} · C ${b.close}`}</title>
                      <line x1={cx} x2={cx} y1={view.y(b.high)} y2={view.y(b.low)} stroke="var(--cc-ink)" strokeWidth="0.9" />
                      <rect
                        x={cx - bw / 2}
                        y={top}
                        width={bw}
                        height={Math.max(1, bot - top)}
                        fill={up ? "var(--cc-paper-2)" : "var(--cc-ink)"}
                        stroke="var(--cc-ink)"
                        strokeWidth="0.9"
                      />
                    </g>
                  );
                })
              : (() => {
                  const pts = view.slice.map((b, i) => `${view.x(i).toFixed(1)},${view.y(b.close).toFixed(1)}`).join(" ");
                  const last = view.slice[view.slice.length - 1];
                  return (
                    <g>
                      {view.slice.map((b, i) => (
                        <title key={b.date + i}>{`${b.date}: close ${b.close}`}</title>
                      ))}
                      <polyline points={pts} fill="none" stroke="var(--cc-ink)" strokeWidth="1.5" strokeLinejoin="round" />
                      <line
                        x1={PAD_L}
                        x2={W - PAD_R}
                        y1={view.y(last.close)}
                        y2={view.y(last.close)}
                        stroke="var(--cc-ink)"
                        strokeWidth="0.7"
                        strokeDasharray="3 4"
                        opacity="0.55"
                      />
                      <circle cx={view.x(view.slice.length - 1)} cy={view.y(last.close)} r="2.4" fill="var(--cc-ink)" />
                    </g>
                  );
                })()}
          </svg>
        </div>
      )}
      <p className="cc-chart-note">
        Candles print through the 3-month window; longer ranges draw the close
        line. Hover a day for its full record.
      </p>
    </figure>
  );
}

/* ————— the order slip ————— */

const fmtPkr = (v: number) =>
  `PKR ${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const FEE_BPS = 50;

type Phase =
  | { kind: "idle" }
  | { kind: "quoting" }
  | { kind: "wallet" }
  | { kind: "settling"; hash: string }
  | { kind: "done"; hash: string; block: number };

function Slip({ symbol, pricePkr }: { symbol: string; pricePkr: number }) {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [action, setAction] = useState<"buy" | "sell">("buy");
  const [rail, setRail] = useState<"SPKR" | "USDC">("SPKR");
  const [qty, setQty] = useState("10");
  const [fx, setFx] = useState<number | null>(null);
  const [nonce, setNonce] = useState<bigint | null>(null);
  const [whitelisted, setWhitelisted] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [error, setError] = useState<string | null>(null);

  const paymentToken = rail === "USDC" ? USDC_ADDRESS : SPKR_ADDRESS;
  const payDecimals = rail === "USDC" ? 6 : 18;
  const qtyNum = Number(qty);

  const grossPkr = Number.isFinite(qtyNum) && qtyNum > 0 ? qtyNum * pricePkr : 0;
  const payAmountNum =
    rail === "USDC" ? (fx ? grossPkr / fx : null) : grossPkr;
  const feeNum = payAmountNum != null ? (payAmountNum * FEE_BPS) / 10000 : null;
  const totalNum =
    payAmountNum != null && feeNum != null
      ? action === "buy"
        ? payAmountNum + feeNum
        : payAmountNum - feeNum
      : null;

  /* live USD/PKR for the slip's own arithmetic; the signer pulls its own at execution */
  useEffect(() => {
    let alive = true;
    fetch("/api/fx")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("fx"))))
      .then((j) => {
        if (alive && typeof j?.rate === "number") setFx(j.rate);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const readChainState = useCallback(async () => {
    if (!address || !publicClient) return;
    try {
      const n = (await publicClient.readContract({
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: "nonces",
        args: [address],
      })) as bigint;
      const w = (await publicClient.readContract({
        address: WHITELIST_ADDRESS,
        abi: WHITELIST_ABI,
        functionName: "isWhitelisted",
        args: [address],
      })) as boolean;
      setNonce(n);
      setWhitelisted(w);
    } catch {
      /* leave as null; the slip says what it could not read */
    }
  }, [address, publicClient]);

  useEffect(() => {
    setNonce(null);
    setWhitelisted(null);
    setToken(null);
    readChainState();
  }, [readChainState]);

  /* resolve the stock token: scan recent TokenDeployed logs for this symbol */
  useEffect(() => {
    if (!publicClient) return;
    let alive = true;
    (async () => {
      try {
        const latest = await publicClient.getBlockNumber();
        const window = BigInt(2_000_000);
        const from = latest > window ? latest - window : BigInt(0);
        const logs = await publicClient.getLogs({
          address: TREASURY_ADDRESS,
          event: TREASURY_ABI[3],
          fromBlock: from,
          toBlock: "latest",
        });
        const matches = logs
          .map((l) => l.args as { symbol?: string; tokenAddress?: string })
          .filter((a) => a.symbol === symbol && a.tokenAddress);
        if (alive && matches.length > 0) {
          setToken(matches[matches.length - 1].tokenAddress!);
        }
      } catch {
        /* unresolved; the advanced field covers it */
      }
    })();
    return () => {
      alive = false;
    };
  }, [publicClient, symbol]);

  const onChain = isConnected && chainId === baseSepolia.id && !!address;

  const settle = async () => {
    if (!onChain || !address || !publicClient) return;
    setError(null);

    const resolvedToken = (tokenInput.trim() || token) as `0x${string}` | null;
    if (!resolvedToken || resolvedToken.length !== 42) {
      setError(
        "No stock token address is on this slip. Deploy one from the testnet app, then paste its address under Advanced."
      );
      setShowAdvanced(true);
      return;
    }
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
      setError("Quantity must be a positive number of tokens.");
      return;
    }

    try {
      setPhase({ kind: "quoting" });
      const amountWei = parseUnits(qty.trim(), 18);
      const url =
        `/api/quote?action=${action}&symbol=${encodeURIComponent(symbol)}` +
        `&token=${resolvedToken}&paymentToken=${paymentToken}` +
        `&amount=${amountWei.toString()}&userAddress=${address}` +
        `&treasuryAddress=${TREASURY_ADDRESS}&nonce=${(nonce ?? BigInt(0)).toString()}`;
      const res = await fetch(url);
      const quote = await res.json();
      if (!res.ok || quote.error) throw new Error(quote.error || "The quote could not be signed.");

      setPhase({ kind: "wallet" });
      const hash = await writeContractAsync({
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: action,
        args: [
          resolvedToken,
          paymentToken,
          BigInt(amountWei.toString()),
          BigInt(quote.paymentAmount),
          BigInt(quote.deadline),
          BigInt(quote.nonce),
          quote.signature as `0x${string}`,
        ],
      });

      setPhase({ kind: "settling", hash });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      setPhase({ kind: "done", hash, block: Number(receipt.blockNumber) });
      readChainState();
    } catch (e: any) {
      setPhase({ kind: "idle" });
      const msg: string = e?.message ?? "The trade did not settle.";
      setError(
        msg.includes("PRIVATE_KEY")
          ? "The signer is not configured on this deployment (missing PRIVATE_KEY). Until it is set, quotes cannot be signed."
          : msg
      );
    }
  };

  const busy =
    phase.kind === "quoting" || phase.kind === "wallet" || phase.kind === "settling";

  const phaseLine =
    phase.kind === "quoting"
      ? "Requesting the signed quote…"
      : phase.kind === "wallet"
        ? "Confirm in the wallet…"
        : phase.kind === "settling"
          ? "Settling on-chain…"
          : null;

  return (
    <div className="cc-slip">
      <p className="cc-slip-head">
        Order slip
        <span className="cc-mono">{symbol} · 1 token = 1 share</span>
      </p>

      <div className="cc-slip-toggle" role="group" aria-label="Action">
        {(["buy", "sell"] as const).map((a) => (
          <button
            key={a}
            type="button"
            className={`cc-slip-opt${action === a ? " is-active" : ""}`}
            aria-pressed={action === a}
            onClick={() => setAction(a)}
          >
            {a === "buy" ? "Buy" : "Sell"}
          </button>
        ))}
      </div>

      <div className="cc-slip-row">
        <label htmlFor="cc-slip-qty">Quantity</label>
        <div className="cc-slip-qty">
          <input
            id="cc-slip-qty"
            inputMode="decimal"
            value={qty}
            onChange={(e) => setQty(e.target.value.replace(/[^0-9.]/g, ""))}
            disabled={busy}
          />
          <span className="cc-mono">tokens</span>
        </div>
      </div>

      <div className="cc-slip-row">
        <span id="cc-slip-rail-label">Rail</span>
        <div className="cc-slip-rails" role="group" aria-labelledby="cc-slip-rail-label">
          {([
            ["SPKR", "A · PKR via SPKR"],
            ["USDC", "B · USDC, from abroad"],
          ] as const).map(([r, label]) => (
            <button
              key={r}
              type="button"
              className={`cc-slip-opt cc-slip-opt-rail${rail === r ? " is-active" : ""}`}
              aria-pressed={rail === r}
              onClick={() => setRail(r)}
              disabled={busy}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <dl className="cc-slip-math">
        <div className="cc-rrow">
          <dt>PSX close</dt>
          <dd className="cc-mono">{fmtPkr(pricePkr)}</dd>
        </div>
        <div className="cc-rrow">
          <dt>Gross</dt>
          <dd className="cc-mono">
            {payAmountNum == null
              ? rail === "USDC" && !fx
                ? "FX unavailable"
                : "—"
              : `${payAmountNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${rail}`}
          </dd>
        </div>
        {rail === "USDC" && fx != null && (
          <div className="cc-rrow">
            <dt>
              FX <span className="cc-railhint">USD/PKR, pulled live</span>
            </dt>
            <dd className="cc-mono">{fx.toFixed(4)}</dd>
          </div>
        )}
        <div className="cc-rrow">
          <dt>
            Commission <span className="cc-railhint">0.50%, printed</span>
          </dt>
          <dd className="cc-mono">
            {feeNum == null ? "—" : `${feeNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${rail}`}
          </dd>
        </div>
        <div className="cc-slip-total">
          <span>{action === "buy" ? "Total debit" : "Net proceeds"}</span>
          <span className="cc-mono">
            {totalNum == null
              ? "—"
              : `${totalNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ${rail}`}
          </span>
        </div>
      </dl>

      {onChain ? (
        <>
          <p className="cc-slip-register" role="status">
            {whitelisted == null ? (
              <span>Register — could not be read…</span>
            ) : whitelisted ? (
              <span>
                Register — this wallet is whitelisted.{" "}
                <span className="cc-mono">{address.slice(0, 6)}…{address.slice(-4)}</span>
              </span>
            ) : (
              <span className="cc-slip-register-no">
                Register — this wallet is not whitelisted. The Treasury will
                reject the transfer; concierge KYC happens in the testnet app.
              </span>
            )}
          </p>

          <p className="cc-slip-token cc-mono">
            Token{" "}
            {token ? (
              <span title={token}>
                {token.slice(0, 6)}…{token.slice(-4)}
              </span>
            ) : tokenInput ? (
              <span>set manually</span>
            ) : (
              <span>not found in recent deployments</span>
            )}
          </p>

          {showAdvanced && (
            <div className="cc-slip-advanced">
              <label htmlFor="cc-slip-token-input">Token address</label>
              <input
                id="cc-slip-token-input"
                className="cc-mono"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.trim())}
                placeholder="0x…"
                spellCheck={false}
              />
            </div>
          )}

          {error && (
            <p className="cc-slip-error" role="alert">
              {error}
            </p>
          )}
          {phaseLine && !error && (
            <p className="cc-slip-phase cc-mono" role="status">
              {phaseLine}
            </p>
          )}

          <button type="button" className="cc-cta cc-slip-cta" onClick={settle} disabled={busy}>
            {action === "buy" ? "Sign quote & buy" : "Sign quote & sell"}
          </button>

          {phase.kind === "done" && (
            <p className="cc-slip-done cc-mono">
              Settled on-chain · block {phase.block}
              <br />
              <a href={`https://sepolia.basescan.org/tx/${phase.hash}`} target="_blank" rel="noreferrer">
                View the transaction ↗
              </a>
            </p>
          )}

          {phase.kind === "done" && (
            <span className="cc-slip-stamp" aria-hidden="true">
              Settled
              <em>Treasury · Base Sepolia</em>
            </span>
          )}
        </>
      ) : isConnected ? (
        <button
          type="button"
          className="cc-cta cc-slip-cta"
          onClick={() => switchChain({ chainId: baseSepolia.id })}
        >
          Switch to Base Sepolia
        </button>
      ) : (
        <button
          type="button"
          className="cc-cta cc-slip-cta"
          onClick={() => connect({ connector: connectors[0] })}
        >
          Connect wallet to trade
        </button>
      )}

      <p className="cc-slip-fineprint">
        The slip above is arithmetic from the real PSX close; the binding
        figures come from the signed quote at execution and expire in five
        minutes. Testnet, simulated inventory, 0.50% fee on both sides. No
        return is offered or implied.
      </p>
    </div>
  );
}

export function TradeSlip(props: { symbol: string; pricePkr: number }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Slip {...props} />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
