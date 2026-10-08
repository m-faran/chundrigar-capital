"use client";

import { useCallback, useEffect, useState } from "react";
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
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS as `0x${string}`;
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

const FEE_BPS = 50;

type Phase =
  | { kind: "idle" }
  | { kind: "quoting" }
  | { kind: "wallet" }
  | { kind: "settling"; hash: string }
  | { kind: "done"; hash: string; block: number };

function Panel({ symbol, pricePkr }: { symbol: string; pricePkr: number }) {
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
  const qtyNum = Number(qty);

  const grossPkr = Number.isFinite(qtyNum) && qtyNum > 0 ? qtyNum * pricePkr : 0;
  const payAmountNum = rail === "USDC" ? (fx ? grossPkr / fx : null) : grossPkr;
  const feeNum = payAmountNum != null ? (payAmountNum * FEE_BPS) / 10000 : null;
  const totalNum =
    payAmountNum != null && feeNum != null
      ? action === "buy"
        ? payAmountNum + feeNum
        : payAmountNum - feeNum
      : null;

  /* live USD/PKR for the panel's arithmetic; the signer pulls its own at execution */
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
      /* unreadable; the panel says what it could not read */
    }
  }, [address, publicClient]);

  useEffect(() => {
    setNonce(null);
    setWhitelisted(null);
    setToken(null);
    readChainState();
  }, [readChainState]);

  /* resolve the stock token from recent TokenDeployed logs */
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
        "No stock token address is set. Deploy one from the testnet app, then paste its address under Advanced."
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
      ? "Requesting the signed quote..."
      : phase.kind === "wallet"
        ? "Confirm in the wallet..."
        : phase.kind === "settling"
          ? "Settling on-chain..."
          : null;

  const num = (v: number, dp = 2) =>
    v.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: 6 });

  return (
    <div className="rounded-surface border border-line bg-surface p-6 dark:border-night-line dark:bg-night-surface">
      <div className="flex items-baseline justify-between gap-3 border-b border-line pb-5 dark:border-night-line">
        <h2 className="text-lg font-medium tracking-tight text-ink dark:text-night-ink">
          Trade {symbol}
        </h2>
        <span className="t-figs text-xs text-ink-soft dark:text-night-ink-soft">
          1 token = 1 share
        </span>
      </div>

      {/* buy / sell segmented control */}
      <div className="mt-5 grid grid-cols-2 gap-1 rounded-none bg-accent-wash p-1 dark:bg-night-wash" role="group" aria-label="Action">
        {(["buy", "sell"] as const).map((a) => (
          <button
            key={a}
            type="button"
            aria-pressed={action === a}
            onClick={() => setAction(a)}
            className={`flex min-h-[44px] items-center justify-center rounded-none py-2 text-sm font-medium capitalize transition-colors ${
              action === a
                ? "bg-accent text-cta-text dark:bg-accent-bright dark:text-night"
                : "bg-transparent text-ink-soft hover:text-ink dark:text-night-ink-soft dark:hover:text-night-ink"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {/* quantity */}
      <div className="mt-5">
        <label htmlFor="t-qty" className="text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-night-ink-soft">
          Quantity
        </label>
        <div className="mt-2 flex items-center gap-3">
          <input
            id="t-qty"
            inputMode="decimal"
            value={qty}
            onChange={(e) => setQty(e.target.value.replace(/[^0-9.]/g, ""))}
            disabled={busy}
            className="t-figs min-h-[44px] w-28 rounded-none border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none disabled:opacity-50 dark:border-night-line dark:bg-night dark:text-night-ink dark:focus:border-accent-bright"
          />
          <span className="t-figs text-xs text-ink-soft dark:text-night-ink-soft">tokens</span>
        </div>
      </div>

      {/* rail */}
      <div className="mt-5">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-night-ink-soft">
          Rail
        </span>
        <div className="mt-2 grid gap-1.5" role="group" aria-label="Payment rail">
          {([
            ["SPKR", "PKR via SPKR, at home"],
            ["USDC", "USDC, from abroad"],
          ] as const).map(([r, label]) => (
            <button
              key={r}
              type="button"
              aria-pressed={rail === r}
              onClick={() => setRail(r)}
              disabled={busy}
              className={`flex min-h-[44px] items-center justify-between rounded-none border px-4 py-2.5 text-sm transition-colors ${
                rail === r
                  ? "border-accent bg-accent-wash text-ink dark:border-accent-bright dark:bg-night-wash dark:text-night-ink"
                  : "border-line bg-transparent text-ink-soft hover:border-ink-soft dark:border-night-line dark:text-night-ink-soft dark:hover:border-night-ink-soft"
              }`}
            >
              <span className="font-medium">{label}</span>
              <span className="t-figs text-xs">{r}</span>
            </button>
          ))}
        </div>
      </div>

      {/* computed math, real close */}
      <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm dark:border-night-line">
        <div className="flex justify-between">
          <dt className="text-ink-soft dark:text-night-ink-soft">PSX close</dt>
          <dd className="t-figs text-ink dark:text-night-ink">PKR {num(pricePkr)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-soft dark:text-night-ink-soft">Gross</dt>
          <dd className="t-figs text-ink dark:text-night-ink">
            {payAmountNum == null
              ? rail === "USDC" && !fx
                ? "FX unavailable"
                : "n/a"
              : `${num(payAmountNum)} ${rail}`}
          </dd>
        </div>
        {rail === "USDC" && fx != null && (
          <div className="flex justify-between">
            <dt className="text-ink-soft dark:text-night-ink-soft">USD/PKR, pulled live</dt>
            <dd className="t-figs text-ink dark:text-night-ink">{fx.toFixed(4)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-ink-soft dark:text-night-ink-soft">Fee, 0.50%</dt>
          <dd className="t-figs text-ink dark:text-night-ink">
            {feeNum == null ? "n/a" : `${num(feeNum)} ${rail}`}
          </dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 dark:border-night-line">
          <dt className="font-medium text-ink dark:text-night-ink">
            {action === "buy" ? "Total debit" : "Net proceeds"}
          </dt>
          <dd className="t-figs font-medium text-ink dark:text-night-ink">
            {totalNum == null ? "n/a" : `${num(totalNum)} ${rail}`}
          </dd>
        </div>
      </dl>

      {onChain ? (
        <>
          <p className="mt-5 text-xs leading-relaxed text-ink-soft dark:text-night-ink-soft" role="status">
            {whitelisted == null ? (
              "Whitelist status could not be read for this wallet."
            ) : whitelisted ? (
              <>
                Wallet is whitelisted.{" "}
                <span className="t-figs">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </span>
              </>
            ) : (
              "This wallet is not whitelisted, so the Treasury will reject the transfer. Concierge KYC happens in the testnet app."
            )}
          </p>

          <p className="t-figs mt-2 text-xs text-ink-soft dark:text-night-ink-soft">
            Token{" "}
            {token ? (
              <span title={token}>
                {token.slice(0, 6)}...{token.slice(-4)}
              </span>
            ) : tokenInput ? (
              "set manually"
            ) : (
              "not found in recent deployments"
            )}
          </p>

          {showAdvanced && (
            <div className="mt-3">
              <label htmlFor="t-token" className="text-xs font-medium uppercase tracking-wide text-ink-soft dark:text-night-ink-soft">
                Token address
              </label>
              <input
                id="t-token"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.trim())}
                placeholder="0x..."
                spellCheck={false}
                className="t-figs mt-2 w-full rounded-none border border-line bg-paper px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none dark:border-night-line dark:bg-night dark:text-night-ink dark:focus:border-accent-bright"
              />
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-none border border-line bg-accent-wash px-4 py-3 text-xs leading-relaxed text-ink dark:border-night-line dark:bg-night-wash dark:text-night-ink" role="alert">
              {error}
            </p>
          )}
          {phaseLine && !error && (
            <p className="t-figs mt-4 text-xs text-ink-soft dark:text-night-ink-soft" role="status">
              {phaseLine}
            </p>
          )}

          <button
            type="button"
            onClick={settle}
            disabled={busy}
            className="mt-5 w-full rounded-none bg-accent px-6 py-3 text-sm font-medium text-cta-text transition-colors hover:bg-accent-deep disabled:opacity-60 dark:bg-accent-bright dark:text-night dark:hover:bg-cta-text dark:hover:text-accent-deep"
          >
            {action === "buy" ? "Sign quote and buy" : "Sign quote and sell"}
          </button>

          {phase.kind === "done" && (
            <p className="t-figs mt-4 text-xs leading-relaxed text-ink dark:text-night-ink">
              Settled on-chain, block {phase.block}.{" "}
              <a
                href={`https://sepolia.basescan.org/tx/${phase.hash}`}
                target="_blank"
                rel="noreferrer"
                className="text-accent underline-offset-4 hover:underline dark:text-accent-bright"
              >
                View the transaction
              </a>
            </p>
          )}
        </>
      ) : isConnected ? (
        <button
          type="button"
          onClick={() => switchChain({ chainId: baseSepolia.id })}
          className="mt-5 w-full rounded-none border border-line bg-surface px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-ink-soft dark:border-night-line dark:bg-transparent dark:text-night-ink dark:hover:border-night-ink-soft"
        >
          Switch to Base Sepolia
        </button>
      ) : (
        <button
          type="button"
          onClick={() => connect({ connector: connectors[0] })}
          className="mt-5 w-full rounded-none bg-accent px-6 py-3 text-sm font-medium text-cta-text transition-colors hover:bg-accent-deep dark:bg-accent-bright dark:text-night dark:hover:bg-cta-text dark:hover:text-accent-deep"
        >
          Connect wallet to trade
        </button>
      )}

      <p className="mt-5 text-xs leading-relaxed text-ink-soft dark:text-night-ink-soft">
        The figures above are arithmetic from the real PSX close; the binding
        numbers come from the signed quote at execution and expire in five
        minutes. Testnet, simulated inventory, 0.50% fee on both sides. No
        return is offered or implied.
      </p>
    </div>
  );
}

export function TradePanel(props: { symbol: string; pricePkr: number }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Panel {...props} />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
