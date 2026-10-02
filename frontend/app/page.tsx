"use client";

import { useState, useEffect } from 'react';
import { createConfig, http, WagmiProvider, useAccount, useConnect, useWriteContract, useSwitchChain, usePublicClient } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';
import { parseUnits, decodeEventLog } from 'viem';

const queryClient = new QueryClient();
const config = createConfig({
  chains: [baseSepolia],
  transports: { [baseSepolia.id]: http() },
  connectors: [injected()],
});

// Load from .env.local
const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS as `0x${string}`;
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;
const SPKR_ADDRESS = process.env.NEXT_PUBLIC_SPKR_ADDRESS as `0x${string}`;

const TOKEN_ABI = [
  { "type": "function", "name": "approve", "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }], "outputs": [{ "name": "", "type": "bool" }] }
];

const TREASURY_ABI = [
  { "type": "function", "name": "buy", "inputs": [{ "name": "token", "type": "address" }, { "name": "paymentToken", "type": "address" }, { "name": "amount", "type": "uint256" }, { "name": "paymentAmount", "type": "uint256" }, { "name": "deadline", "type": "uint256" }, { "name": "nonce", "type": "uint256" }, { "name": "signature", "type": "bytes" }], "outputs": [] },
  { "type": "function", "name": "deployToken", "inputs": [{ "name": "name", "type": "string" }, { "name": "symbol", "type": "string" }], "outputs": [{ "name": "", "type": "address" }] },
  { "type": "event", "name": "TokenDeployed", "inputs": [{ "indexed": false, "name": "tokenAddress", "type": "address" }, { "indexed": false, "name": "symbol", "type": "string" }] }
];

function TradingApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { address, isConnected, chainId } = useAccount();
  const { connect } = useConnect();
  const { writeContractAsync } = useWriteContract();
  const { switchChain } = useSwitchChain();

  const publicClient = usePublicClient();
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  
  const addLog = (msg: string) => setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const [amount, setAmount] = useState("1");
  const [paymentToken, setPaymentToken] = useState<`0x${string}`>(USDC_ADDRESS);
  const [psxTokenAddress, setPsxTokenAddress] = useState<string>("");
  const [symbol, setSymbol] = useState("OGDC");

  // Admin deployment states
  const [deployName, setDeployName] = useState("OGDC Stock");
  const [deploySymbol, setDeploySymbol] = useState("OGDC");

  const handleDeployToken = async () => {
    addLog(`Deploying new PSX token (${deployName}) via Treasury...`);
    try {
      const hash = await writeContractAsync({
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: 'deployToken',
        args: [deployName, deploySymbol]
      });
      addLog(`Tx submitted: ${hash}. Waiting for confirmation...`);
      
      const receipt = await publicClient!.waitForTransactionReceipt({ hash });
      addLog(`Tx confirmed! Block: ${receipt.blockNumber}`);

      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: TREASURY_ABI,
            data: log.data,
            topics: log.topics
          });
          if (decoded.eventName === 'TokenDeployed') {
            const args = decoded.args as any;
            const tokenAddr = args.tokenAddress;
            addLog(`✅ SUCCESS! TokenDeployed at ${tokenAddr} for ${args.symbol}`);
            setPsxTokenAddress(tokenAddr as string);
            setSymbol(args.symbol as string);
          }
        } catch (err) {}
      }
    } catch (e: any) {
      addLog(`Deploy Error: ${e.message}`);
    }
  };

  const handleApprove = async () => {
    addLog(`Approving Treasury to spend ${paymentToken === USDC_ADDRESS ? "USDC" : "SPKR"}...`);
    try {
      const hash = await writeContractAsync({ 
        address: paymentToken, 
        abi: TOKEN_ABI, 
        functionName: 'approve', 
        args: [TREASURY_ADDRESS, parseUnits("1000000000", 18)] 
      });
      addLog(`Approve Tx submitted: ${hash}. Waiting for confirmation...`);
      await publicClient!.waitForTransactionReceipt({ hash });
      addLog("✅ Approval confirmed!");
    } catch (e: any) {
      addLog(`Approve Error: ${e.message}`);
    }
  };

  const handleBuy = async () => {
    try {
      if (!psxTokenAddress || psxTokenAddress.length !== 42) {
        throw new Error("Invalid PSX Token Address! Did you deploy one?");
      }

      addLog(`Fetching Quote from Backend for ${symbol}...`);
      const amountInWei = parseUnits(amount, 18).toString();

      // 1. Fetch Pull Oracle Quote
      const res = await fetch(`http://localhost:3001/api/quote?action=buy&symbol=${symbol}&token=${psxTokenAddress}&paymentToken=${paymentToken}&amount=${amountInWei}&userAddress=${address}&treasuryAddress=${TREASURY_ADDRESS}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const displayDecimals = paymentToken === USDC_ADDRESS ? 6 : 18;
      const displayAmount = Number(data.paymentAmount) / (10 ** displayDecimals);
      const tokenName = paymentToken === USDC_ADDRESS ? "USDC" : "SPKR";
      
      addLog(`Quote received: Pay ${displayAmount} ${tokenName}. Submitting Trade...`);

      // 2. Submit signed trade to Treasury
      const hash = await writeContractAsync({
        address: TREASURY_ADDRESS,
        abi: TREASURY_ABI,
        functionName: 'buy',
        args: [psxTokenAddress, paymentToken, BigInt(amountInWei), BigInt(data.paymentAmount), BigInt(data.deadline), BigInt(data.nonce), data.signature],
      });
      
      addLog(`Trade Tx submitted: ${hash}. Waiting for confirmation...`);
      await publicClient!.waitForTransactionReceipt({ hash });
      addLog(`✅ Trade Successful! You just bought ${amount} ${symbol} on-chain.`);
    } catch (e: any) {
      addLog(`Trade Error: ${e.message}`);
    }
  };

  if (!mounted) return null;

  if (!isConnected) return <button onClick={() => connect({ connector: injected() })}>Connect Wallet</button>;

  if (chainId !== baseSepolia.id) {
    return (
      <div style={{ backgroundColor: 'white', color: 'black', padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>Wrong Network</h1>
        <p>You are currently on an unsupported network. Please switch to Base Sepolia.</p>
        <button onClick={() => switchChain({ chainId: baseSepolia.id })}>
          Switch to Base Sepolia
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', color: 'black', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Terminal</h1>
        <div>
          <span style={{ marginRight: "10px" }}>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </div>
      </div>
      
      <div style={{ marginBottom: "30px", padding: "15px", border: "1px dashed gray" }}>
        <h3>Admin: Deploy New PSX Token</h3>
        <input type="text" value={deployName} onChange={(e) => setDeployName(e.target.value)} placeholder="Token Name (e.g. OGDC Stock)" style={{ marginRight: "10px" }} />
        <input type="text" value={deploySymbol} onChange={(e) => setDeploySymbol(e.target.value)} placeholder="Symbol (e.g. OGDC)" style={{ marginRight: "10px" }} />
        <button onClick={handleDeployToken}>Deploy via Treasury</button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>1. Setup Trade</h3>
        <select value={paymentToken} onChange={(e) => setPaymentToken(e.target.value as `0x${string}`)} style={{ marginRight: "10px" }}>
          <option value={USDC_ADDRESS}>Base Sepolia USDC</option>
          <option value={SPKR_ADDRESS}>Storm PKR (SPKR)</option>
        </select>
        <button onClick={handleApprove}>Approve Treasury to spend Selected Token</button>
      </div>
      <div>
        <h3>2. Execute Trade</h3>
        <input type="text" value={psxTokenAddress} onChange={(e) => setPsxTokenAddress(e.target.value as `0x${string}`)} placeholder="Target PSX Token Address" style={{ marginRight: "10px", width: "300px" }} />
        <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="PSX Symbol (e.g. OGDC)" style={{ marginRight: "10px", width: "150px" }} />
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount to Buy" />
        <button onClick={handleBuy} style={{ marginLeft: "10px" }}>Get Quote & Buy</button>
      </div>


      <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#1e1e1e", color: "#00ff00", borderRadius: "5px", height: "250px", overflowY: "auto", fontFamily: "monospace" }}>
        <h4 style={{ color: "#fff", marginTop: 0 }}>Activity Console</h4>
        {consoleLogs.map((log, i) => <div key={i} style={{ marginBottom: "5px" }}>{log}</div>)}
        {consoleLogs.length === 0 && <div style={{ color: "#666" }}>No activity yet...</div>}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TradingApp />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
