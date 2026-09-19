<div align="center">

# FairDrop

### Real-Time Anti-Scalp Liquidity on Monad

Built in one day at **Monad Blitz Paris** · 19 September 2026

[![Monad Testnet](https://img.shields.io/badge/Monad-Testnet-8A5CF6)](https://monad.xyz)
[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.20-363636)](https://soliditylang.org)
[![Built with Foundry](https://img.shields.io/badge/Built%20with-Foundry-orange)](https://getfoundry.sh)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)](https://nextjs.org)

[Live Demo](#) · [Testnet Contract](#) · [Pitch Deck](#)

</div>

---

## The Problem

Limited collectible drops — TCG boxes, sneakers, concert tickets — sell out in seconds to bots and scalpers, then resurface minutes later on secondary markets at 5-10x the price. A €10 booster becomes a €100 flip, **sold out in 3 seconds**, while the fans who actually want the product are left out.

This isn't just annoying for collectors — it's a real cost for the brands running the drop:

- **Brand damage** — fans get burned and walk away from the license
- **Market distortion** — brands can never gauge real demand vs. bot-driven demand
- **Lost revenue** — billions in secondary-market value that never flows back to the people who created it

## The Solution

**FairDrop** is a tokenized pre-order vault (ERC-721) that makes the entire resale lifecycle transparent and fair, on-chain:

- **Continuous Dutch Auction** — the price ticks down every single block (≈1s on Monad) until someone buys. No gas wars, no bots racing for a fixed-price mint — just a fair, visible price discovery.
- **P2P Secondary Marketplace** — token holders can resell freely. Every secondary sale automatically routes a small, transparent fee split — **1% to the network/protocol and 1% to the official reseller of that drop** — while the seller keeps **98%** of the sale price, whether they sell at a profit or a loss.
- **Burn for Vault Delivery** — burning the token on-chain triggers the real-world delivery of the sealed item, closing the loop between the digital asset and the physical product.

## Why Monad

FairDrop leans directly on what makes Monad different, not just "a cheaper Ethereum":

| Monad feature | What it unlocks for FairDrop |
| --- | --- |
| ~1 second blocks | A Dutch Auction that feels genuinely continuous — the price visibly ticks down in the UI, block by block |
| High throughput / parallel execution | Hundreds of buyers can hit the same drop at the exact same price tick without gas spikes pricing out real fans |
| EVM compatibility | Standard, auditable Solidity — no custom VM risk, on a chain built for exactly this kind of high-frequency, high-volume consumer use case |

### Contract security

- **Atomic settlement** — the resale fee split (protocol + official reseller + seller) is computed and resolved inside a single transaction. No partial states, no follow-up step.
- **ReentrancyGuard** on every fund-moving function (`buyDrop`, `buySecondary`, `withdrawFunds`)
- **Pull over push** — no direct `transfer`/`send` to third parties. Every party (seller, official reseller, protocol) withdraws their own accumulated balance via `withdrawFunds()`
- **Checks-Effects-Interactions** — stock and state are updated before any fund transfer
- Single, immutable, unified contract file — no proxy/upgradeable complexity for a one-day build

## Product Walkthrough

| Screen | What happens |
| --- | --- |
| **Live Drop** | Watch the price tick down in real time and buy at the current price |
| **Secondary Market** | Browse items resold by other holders, buy directly, fee split shown transparently |
| **My Collection** | See your items, resell them, or burn them to request physical delivery |
| **My Wallet** | Balance, collection value, full activity history, withdraw accumulated funds |

*(Screenshots to be added — see `/docs/screenshots`)*

## Tech Stack

| Layer | Choice |
| --- | --- |
| Smart contract | Solidity `^0.8.20`, [Foundry](https://getfoundry.sh) |
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Web3 | `wagmi` v2 + `viem` |
| Wallet | RainbowKit / ConnectKit |
| Network | Monad Testnet |
| Backend | None — direct RPC reads from the client |

Full functional spec (every contract function, event, and screen-to-call mapping) lives in [`/docs/fairdrop-specs-fonctionnelles.md`](./docs/fairdrop-specs-fonctionnelles.md). Design system in [`/docs/design.md`](./docs/design.md).

## Getting Started

```bash
# Smart contract
cd contracts
forge install
forge build
forge test

# Deploy locally (Anvil)
anvil
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

# Deploy to Monad Testnet
forge script script/Deploy.s.sol --rpc-url $MONAD_TESTNET_RPC --broadcast --private-key $PRIVATE_KEY

# Frontend
cd frontend
npm install
npm run dev
```

Set the deployed contract address in `frontend/lib/contract.ts` before running the frontend.

## The Opportunity

The global resale market for collectibles, tickets, and limited drops — TCG, sneakers, concerts — is estimated at **$15B+**. Capturing even 5% of that flow on-chain through a model like FairDrop means millions of native transactions and a real, frictionless bridge onboarding tens of thousands of Web2 collectors into Web3 — without ever asking them to think about gas or wallets first.

## Team & Submission

Built in 7 hours of active dev at Monad Blitz Paris.

- **GitHub**: this repository (fork of `monad-developers/monad-blitz-paris`)
- **Testnet contract**: _add address after deployment_
- **Demo**: _add link or fallback video after recording_

---

<div align="center">

**"Let's be fair with fans, so everyone earns real money."**

</div>
