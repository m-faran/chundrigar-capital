import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createPublicClient, http, encodePacked, keccak256, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) throw new Error("Missing PRIVATE_KEY in .env");

const account = privateKeyToAccount(`0x${privateKey.replace('0x', '')}`);
console.log(`Backend Signer Public Address: ${account.address}`);

const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.RPC_URL || 'https://sepolia.base.org')
});

// Minimal ABI just for fetching nonce
const TREASURY_ABI = [{
    "type": "function",
    "name": "nonces",
    "inputs": [{"name": "", "type": "address"}],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
}];

app.get('/api/quote', async (req, res) => {
    try {
        const { action, token, symbol, paymentToken, amount, userAddress, treasuryAddress } = req.query;
        
        if (!action || !token || !symbol || !paymentToken || !amount || !userAddress || !treasuryAddress) {
            return res.status(400).json({ error: "Missing required query parameters. Ensure 'symbol' (e.g. OGDC) is passed." });
        }

        // 1. Fetch Real PSX Price in PKR
        const psxRes = await fetch(`https://psxdata-api.fastapicloud.dev/stocks/${symbol}/quote`);
        if (!psxRes.ok) throw new Error(`Failed to fetch PSX price for ${symbol}`);
        const psxData = await psxRes.json();
        if (!psxData.data || !psxData.data.price) throw new Error(`Invalid PSX data for ${symbol}`);
        const priceInPKR = psxData.data.price;

        const shares = Number(amount) / 1e18; 
        let paymentAmount;

        // Route logic based on payment token
        if (paymentToken.toLowerCase() === process.env.USDC_ADDRESS?.toLowerCase()) {
            // USDC: Fetch Real FX Rate (PKR to USD)
            const fxRes = await fetch(`https://api.exchangerate-api.com/v4/latest/PKR`);
            if (!fxRes.ok) throw new Error("Failed to fetch FX rate");
            const fxData = await fxRes.json();
            const pkrToUsd = fxData.rates.USD;

            const priceInUSD = priceInPKR * pkrToUsd;
            const paymentAmountNum = shares * priceInUSD;
            paymentAmount = parseUnits(paymentAmountNum.toFixed(6), 6); // 6 decimals for USDC
        } else if (paymentToken.toLowerCase() === process.env.SPKR_ADDRESS?.toLowerCase()) {
            // SPKR: Use PKR price directly and 18 decimals
            const paymentAmountNum = shares * priceInPKR;
            paymentAmount = parseUnits(paymentAmountNum.toFixed(18), 18);
        } else {
            throw new Error("Unsupported payment token. Must be USDC or SPKR.");
        }
        
        // 2. Fetch User Nonce from Treasury
        const nonce = await publicClient.readContract({
            address: treasuryAddress,
            abi: TREASURY_ABI,
            functionName: 'nonces',
            args: [userAddress]
        });

        // 3. Set Deadline (5 minutes from now)
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 300);

        // 4. Create Message Hash mimicking Solidity's keccak256(abi.encodePacked(...))
        const messageHash = keccak256(
            encodePacked(
                ['string', 'address', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'address'],
                [action.toUpperCase(), token, paymentToken, BigInt(amount), paymentAmount, deadline, nonce, userAddress]
            )
        );

        // 5. Sign the hash
        // viem's signMessage automatically adds the "\x19Ethereum Signed Message" prefix
        // which matches Solidity's MessageHashUtils.toEthSignedMessageHash
        const signature = await account.signMessage({ message: { raw: messageHash } });

        res.json({
            paymentAmount: paymentAmount.toString(),
            deadline: deadline.toString(),
            nonce: nonce.toString(),
            signature
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3001, () => {
    console.log('Oracle Backend running on http://localhost:3001');
});
