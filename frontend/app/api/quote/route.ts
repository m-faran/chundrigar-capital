import { NextRequest, NextResponse } from "next/server";
import { encodePacked, keccak256 } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { fetchPSX } from "../../../lib/api-fetcher";

// The private key must be set in Vercel Environment Variables.
// DO NOT use NEXT_PUBLIC_ for this.
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;

type QuoteResponse = { data?: { price?: number; change_pct?: number | null } };

export async function GET(request: NextRequest) {
    try {
        if (!PRIVATE_KEY) {
            return NextResponse.json({ error: "Server is missing PRIVATE_KEY configuration" }, { status: 500 });
        }

        const searchParams = request.nextUrl.searchParams;
        const action = searchParams.get("action"); // "buy" or "sell"
        const symbol = searchParams.get("symbol");
        const token = searchParams.get("token") as `0x${string}`;
        const paymentToken = searchParams.get("paymentToken") as `0x${string}`;
        const amount = searchParams.get("amount"); // Amount of PSX tokens in WEI (18 decimals)
        const userAddress = searchParams.get("userAddress") as `0x${string}`;
        const treasuryAddress = searchParams.get("treasuryAddress") as `0x${string}`;

        if (!action || !symbol || !token || !paymentToken || !amount || !userAddress || !treasuryAddress) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }
        if (action !== "buy" && action !== "sell") {
            return NextResponse.json({ error: "action must be buy or sell" }, { status: 400 });
        }

        // 1. Real PSX price for this scrip (PKR per share, latest daily close from the PSX Data API).
        const psxQuote = (await fetchPSX(`/stocks/${encodeURIComponent(symbol)}/quote`)) as QuoteResponse;
        const pricePkr = psxQuote?.data?.price;
        if (typeof pricePkr !== "number" || !Number.isFinite(pricePkr) || pricePkr <= 0) {
            return NextResponse.json({ error: `No PSX price available for ${symbol}` }, { status: 502 });
        }

        // 2. Live USD/PKR rate (same source as /api/fx). Only needed for the USDC rail.
        const isUSDC = paymentToken.toLowerCase() === process.env.NEXT_PUBLIC_USDC_ADDRESS?.toLowerCase();
        let fxRate = 0;
        if (isUSDC) {
            const fxRes = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 60 } });
            const fxJson = await fxRes.json();
            fxRate = fxJson?.rates?.PKR;
            if (typeof fxRate !== "number" || fxRate <= 0) {
                return NextResponse.json({ error: "FX rate unavailable" }, { status: 502 });
            }
        }

        // SPKR uses 18 decimals, USDC uses 6 on Base. PSX stock tokens are 18-decimal ERC-20s.
        const displayDecimals = isUSDC ? 6 : 18;

        // amount is in 18 decimals.
        const amountDecimal = Number(amount) / 1e18;
        if (!Number.isFinite(amountDecimal) || amountDecimal <= 0) {
            return NextResponse.json({ error: "amount must be a positive token quantity" }, { status: 400 });
        }

        // Gross cost/proceeds in the payment token: native PKR for SPKR, FX-converted for USDC.
        let paymentAmountDecimal = amountDecimal * pricePkr;
        if (isUSDC) {
            paymentAmountDecimal = paymentAmountDecimal / fxRate;
        }
        const paymentAmount = BigInt(Math.floor(paymentAmountDecimal * (10 ** displayDecimals)));
        if (paymentAmount <= BigInt(0)) {
            return NextResponse.json({ error: "Quantity too small to price" }, { status: 400 });
        }

        // 3. Nonce: read on-chain by the client and passed through, so the signer never needs RPC.
        const nonceParam = searchParams.get("nonce") || "0";
        const nonce = BigInt(nonceParam);

        // 4. Deadline (5 minutes) and signature, bound to the exact trade parameters.
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);
        const chainId = baseSepolia.id;

        const messageHash = keccak256(
            encodePacked(
                ['string', 'uint256', 'address', 'address', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'address'],
                [action.toUpperCase(), BigInt(chainId), treasuryAddress, token, paymentToken, BigInt(amount), paymentAmount, deadline, nonce, userAddress]
            )
        );

        const account = privateKeyToAccount(PRIVATE_KEY);
        // signMessage computes toEthSignedMessageHash under the hood, matching Treasury's recovery.
        const signature = await account.signMessage({ message: { raw: messageHash } });

        return NextResponse.json({
            paymentAmount: paymentAmount.toString(),
            deadline: deadline.toString(),
            nonce: nonce.toString(),
            signature,
            pricePkr,
            fxRate: fxRate || null,
            changePct: psxQuote?.data?.change_pct ?? null,
        });
    } catch (error: any) {
        console.error("Quote Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
