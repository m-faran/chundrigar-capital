const fs = require("fs");
const path = require("path");
const { createWalletClient, createPublicClient, http, parseAbi } = require("viem");
const { privateKeyToAccount } = require("viem/accounts");
const { baseSepolia } = require("viem/chains");

// Read .env.local manually
function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env.local");
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const privateKey = process.env.PRIVATE_KEY || env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("Missing PRIVATE_KEY in environment or .env.local");
  }

  const treasuryAddress =
    process.env.NEXT_PUBLIC_TREASURY_ADDRESS ||
    env.NEXT_PUBLIC_TREASURY_ADDRESS ||
    "0x2CDAf23131Fbc41C456C1E5A71a1E32D4b322Dd3";

  const usdcAddress =
    process.env.NEXT_PUBLIC_USDC_ADDRESS ||
    env.NEXT_PUBLIC_USDC_ADDRESS ||
    "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

  const spkrAddress =
    process.env.NEXT_PUBLIC_SPKR_ADDRESS ||
    env.NEXT_PUBLIC_SPKR_ADDRESS ||
    "0xA5F5747b47b7fe8F91bAeD38B75Be28B5D68C7a8";

  const rpcUrl = process.env.RPC_URL || "https://sepolia.base.org";

  console.log(`Connecting to Base Sepolia RPC: ${rpcUrl}`);
  console.log(`Treasury Address: ${treasuryAddress}`);

  const account = privateKeyToAccount(privateKey);
  console.log(`Using Deployer/Signer: ${account.address}`);

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(rpcUrl),
  });

  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(rpcUrl),
  });

  const abi = parseAbi([
    "function owner() view returns (address)",
    "function allowedPaymentTokens(address) view returns (bool)",
    "function setAllowedPaymentToken(address _token, bool _status) external",
  ]);

  const owner = await publicClient.readContract({
    address: treasuryAddress,
    abi,
    functionName: "owner",
  });
  console.log(`Treasury Owner: ${owner}`);

  if (owner.toLowerCase() !== account.address.toLowerCase()) {
    throw new Error(`Caller ${account.address} is not Treasury owner (${owner})`);
  }

  // 1. Check USDC
  const usdcAllowed = await publicClient.readContract({
    address: treasuryAddress,
    abi,
    functionName: "allowedPaymentTokens",
    args: [usdcAddress],
  });
  console.log(`USDC (${usdcAddress}) currently allowed: ${usdcAllowed}`);

  if (!usdcAllowed) {
    console.log(`Allowing USDC...`);
    const tx = await walletClient.writeContract({
      address: treasuryAddress,
      abi,
      functionName: "setAllowedPaymentToken",
      args: [usdcAddress, true],
    });
    console.log(`Sent tx: ${tx}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`USDC allowed in block ${receipt.blockNumber} (status: ${receipt.status})`);
  }

  // 2. Check SPKR
  const spkrAllowed = await publicClient.readContract({
    address: treasuryAddress,
    abi,
    functionName: "allowedPaymentTokens",
    args: [spkrAddress],
  });
  console.log(`SPKR (${spkrAddress}) currently allowed: ${spkrAllowed}`);

  if (!spkrAllowed) {
    console.log(`Allowing SPKR...`);
    const tx = await walletClient.writeContract({
      address: treasuryAddress,
      abi,
      functionName: "setAllowedPaymentToken",
      args: [spkrAddress, true],
    });
    console.log(`Sent tx: ${tx}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`SPKR allowed in block ${receipt.blockNumber} (status: ${receipt.status})`);
  }

  console.log("\nDone! Payment tokens configured successfully.");
}

main().catch((err) => {
  console.error("Execution failed:", err.message);
  process.exit(1);
});
