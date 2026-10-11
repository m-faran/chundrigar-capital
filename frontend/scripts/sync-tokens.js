const fs = require("fs");
const path = require("path");
const { createPublicClient, http, parseAbiItem } = require("viem");
const { baseSepolia } = require("viem/chains");

async function main() {
  const treasuryAddress =
    process.env.NEXT_PUBLIC_TREASURY_ADDRESS ||
    process.env.TREASURY_ADDRESS ||
    "0x2CDAf23131Fbc41C456C1E5A71a1E32D4b322Dd3";
  const rpcUrl = process.env.RPC_URL || "https://sepolia.base.org";

  console.log(`📡 Connecting to Base Sepolia (${rpcUrl})...`);
  console.log(`🏦 Treasury Address: ${treasuryAddress}`);

  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(rpcUrl),
  });

  const latestBlock = await client.getBlockNumber();
  // Scan recent 100,000 blocks (~2 days on Base)
  const fromBlock = latestBlock > 100000n ? latestBlock - 100000n : 0n;

  console.log(`🔍 Scanning TokenDeployed events from block ${fromBlock} to ${latestBlock}...`);

  const eventAbi = parseAbiItem("event TokenDeployed(address indexed token, string symbol)");

  const logs = await client.getLogs({
    address: treasuryAddress,
    event: eventAbi,
    fromBlock,
    toBlock: "latest",
  });

  console.log(`✅ Found ${logs.length} TokenDeployed events on-chain.`);

  const tokenMap = {};
  for (const log of logs) {
    if (log.args && log.args.symbol && log.args.token) {
      tokenMap[log.args.symbol] = log.args.token;
      console.log(`   ${log.args.symbol.padEnd(10)} → ${log.args.token}`);
    }
  }

  const outPath = path.resolve(__dirname, "../lib/deployed-tokens.json");
  fs.writeFileSync(outPath, JSON.stringify(tokenMap, null, 2));
  console.log(`\n💾 Saved ${Object.keys(tokenMap).length} token mappings to: ${outPath}`);
}

main().catch((err) => {
  console.error("❌ Error syncing tokens:", err.message);
  process.exit(1);
});
