# CHUNDRIGAR CAPITAL

Named after I.I. Chundrigar Road; the financial heart of Karachi and the Wall Street of Pakistan; Chundrigar Capital brings the Pakistan Stock Exchange (PSX) on base sepolia blockchain. Traditional stock investing in Pakistan Stock Exchange (PSX) is slow and paper-heavy, requiring complicated brokerage accounts, manual paperwork. Chundrigar Capital makes investing frictionless anyone can perform KYC, connect a crypto wallet and trade stocks. 

## DESCRIPTION

Chundrigar Capital is a decentralized trading protocol that lets anyone invest in Pakistan Stock Exchange (PSX) companies directly from their crypto wallet. Instead of waiting days for brokerage approvals or dealing with traditional bank delays, users can trade shares at official live market prices in a few clicks.

To get started, users follow these steps:

1. **Connect Wallet**: Connect your crypto wallet (such as MetaMask, Rainbow, or Coinbase Wallet) to get started on Base Sepolia.
2. **Quick Verification**: Complete a simple one-time identity check (CNIC) through the compliance portal to verify your wallet.
3. **Explore the KSE-100**: Browse 100 leading Pakistani companies across banking, energy, technology, cement, fertilizer, and more. Track top gainers and losers, search by company name, and view price charts.
4. **Choose How to Pay**:
   - **Local Rail ($SPKR)**: Pay in $SPKR Pakistani Rupee based stablecoin.
   - **Diaspora Rail ($USDC)**: Pay in $USDC with automatic, real-time currency conversion—ideal for overseas Pakistanis.
5. **Review Live Price**: Enter how many shares you want to buy or sell. The app pulls the latest price directly from the PSX-DATA API and shows you the exact total cost before you confirm.
6. **Confirm and Trade**: Confirm the transaction in your wallet. When buying, your shares are delivered straight to your wallet; when selling, your funds are sent directly back to your wallet.

## TECHNICAL ARCHITECTURE

- **Scalable Backend:** Built on Next.js App Router deployed on Vercel, utilizing serverless API routes to ensure high availability and global scale.
- **Smart Data Caching & Rate-Limit Shield:** To handle continuous price polling and respect the PSX Data API's strict rate limit (60 requests per minute per IP), the backend employs Next.js Data Caching with Incremental Static Regeneration (ISR). The KSE-100 index is cached for 15 seconds, and individual stock charts and USD/PKR FX rates are cached for 60 seconds at the edge. An automated `X-PSX-Proxy` fallback protects against shared IP rate exhaustion, allowing thousands of concurrent users while keeping upstream API requests under 4 per minute.
- **Cryptographic Pull-Oracle:** Instead of expensive on-chain price feeds that suffer from latency and stale weekend pricing, prices are signed off-chain via EIP-191 ECDSA signatures. The signature securely binds the action, stock token, payment token, price, user address, nonce, and a 5-minute expiration deadline.
- **On-Chain Settlement & Compliance:** Built and tested with Foundry on Base Sepolia:
  - `GlobalWhitelist.sol`: Central KYC registry checked on every trade and token transfer.
  - `CompliantToken.sol`: Transfer-gated 18-decimal ERC-20 tokens deployed for each KSE-100 stock with regulatory controls (freezing, force transfers, force burns).
  - `Treasury.sol`: Token factory and primary counterparty that validates oracle signatures, prevents nonce replays, routes a 50 bps protocol fee, and executes atomic mints and burns.
- **Streamlined Web3 Integration:** Built using React, Tailwind CSS, RainbowKit, and wagmi/viem for frictionless wallet connectivity (MetaMask, Rainbow, Coinbase Wallet, WalletConnect) and instant Light/Dark mode responsiveness.

## SOME LIMITATIONS
- Not production ready.
- The KYC page is mocked.
- There is no Market Maker the Treasury acts as a Market Maker itself.

## Getting Started

```shell
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application. Or you can just try stuff here [https://chundrigar-capital.vercel.app/](https://chundrigar-capital.vercel.app/).

### Smart Contracts (Foundry)

```shell
cd smart-contracts
forge install
forge test
```

## Directory Structure

- `frontend/app/` - Next.js application code, including UI components, trading panels, KYC verification, and serverless API proxy routes.
- `frontend/lib/` - PSX data fetchers, deployed token registry, and helper utilities.
- `frontend/public/` - Public assets, logos, and icons served by Next.js.
- `smart-contracts/src/` - Core Solidity contracts (`Treasury.sol`, `CompliantToken.sol`, `GlobalWhitelist.sol`).
- `smart-contracts/test/` - Foundry unit and edge-case test suites.

---

**Warning:** All rights reserved. This code may not be copied, modified, or distributed without explicit permission.
