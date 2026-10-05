import { NextRequest, NextResponse } from "next/server";
import { encodePacked, keccak256 } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

// The private key must be set in Vercel Environment Variables.
// DO NOT use NEXT_PUBLIC_ for this.
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;

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

        // 1. Fetch real stock price and FX rate (Mocked for MVP port, replace with actual fetchPSX logic)
        // For example, if OGDC is 150 PKR per share...
        const simulatedPricePkr = 150.0;
        const simulatedFxRate = 280.0; // 1 USD = 280 PKR

        // Calculate payment amount based on whether the user is paying in USDC or SPKR.
        // SPKR uses 18 decimals, USDC uses 6 decimals on Base.
        const isUSDC = paymentToken.toLowerCase() === process.env.NEXT_PUBLIC_USDC_ADDRESS?.toLowerCase();
        const displayDecimals = isUSDC ? 6 : 18;

        // amount is in 18 decimals.
        // Let's calculate the gross cost in payment tokens.
        const amountDecimal = Number(amount) / 1e18;
        
        let paymentAmountDecimal = amountDecimal * simulatedPricePkr;
        if (isUSDC) {
            paymentAmountDecimal = paymentAmountDecimal / simulatedFxRate;
        }

        // Convert back to integer (wei equivalent) for the payment token
        const paymentAmount = BigInt(Math.floor(paymentAmountDecimal * (10 ** displayDecimals)));

        // 2. Fetch User's current Nonce from the Treasury contract (Normally done via viem readContract)
        // For this port, we will assume the frontend could pass it, but ideally the backend reads it to be safe.
        // As a placeholder, we use 0, but in production, we must read `nonces[userAddress]` from Treasury.
        // To keep it simple, we'll fetch it using a public client if we had RPC_URL, or expect it in query.
        const nonceParam = searchParams.get("nonce") || "0"; 
        const nonce = BigInt(nonceParam);

        // 3. Set Deadline (e.g., 5 minutes from now)
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);

        // 4. Construct Payload and Sign
        const chainId = baseSepolia.id;
        
        const messageHash = keccak256(
            encodePacked(
                ['string', 'uint256', 'address', 'address', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'address'],
                [action.toUpperCase(), BigInt(chainId), treasuryAddress, token, paymentToken, BigInt(amount), paymentAmount, deadline, nonce, userAddress]
            )
        );

        const account = privateKeyToAccount(PRIVATE_KEY);
        // Note: signMessage automatically computes toEthSignedMessageHash under the hood in viem
        const signature = await account.signMessage({ message: { raw: messageHash } });

        return NextResponse.json({
            paymentAmount: paymentAmount.toString(),
            deadline: deadline.toString(),
            nonce: nonce.toString(),
            signature
        });

    } catch (error: any) {
        console.error("Quote Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
