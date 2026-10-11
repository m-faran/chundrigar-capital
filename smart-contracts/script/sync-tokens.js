const fs = require("fs");
const path = require("path");

function main() {
  const broadcastPath = path.resolve(__dirname, "../broadcast/Deploy.s.sol/84532/run-latest.json");
  const outPath = path.resolve(__dirname, "../../frontend/lib/deployed-tokens.json");

  if (!fs.existsSync(broadcastPath)) {
    console.error(`Broadcast file not found at: ${broadcastPath}`);
    process.exit(1);
  }

  console.log(`Reading broadcast receipts from: ${broadcastPath}`);
  const runLatest = JSON.parse(fs.readFileSync(broadcastPath, "utf8"));
  const tokens = {};

  if (runLatest.receipts) {
    runLatest.receipts.forEach((receipt) => {
      if (receipt.logs) {
        receipt.logs.forEach((log) => {
          // TokenDeployed topic0 = keccak256("TokenDeployed(address,string)")
          if (log.topics && log.topics[0] === "0x9180efc8dd0d74dfb3668e22985679e1c6d2a02e049b8a52dae385a89ac7455f") {
            const tokenAddress = "0x" + log.topics[1].slice(26);
            const dataHex = log.data.slice(2);
            const len = parseInt(dataHex.slice(64, 128), 16);
            const strHex = dataHex.slice(128, 128 + len * 2);
            const symbol = Buffer.from(strHex, "hex").toString("utf8");
            tokens[symbol] = tokenAddress;
            console.log(`   ${symbol.padEnd(10)} → ${tokenAddress}`);
          }
        });
      }
    });
  }

  const count = Object.keys(tokens).length;
  console.log(`\nExtracted ${count} tokens from broadcast logs.`);

  fs.writeFileSync(outPath, JSON.stringify(tokens, null, 2));
  console.log(`Saved token mapping to: ${outPath}`);
}

main();
