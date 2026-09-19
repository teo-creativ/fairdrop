import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

// Monad Testnet — see https://docs.monad.xyz/developer-essentials/testnets
export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: { name: "MonadScan", url: "https://testnet.monadscan.com" },
  },
  testnet: true,
});


export const anvilLocal = defineChain({
  id: 31337,
  name: "Anvil Local",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://localhost:8545"] },
  },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: "FairDrop",
  // TODO: replace with a real WalletConnect project id before the demo
  // (get one free at https://cloud.walletconnect.com)
  projectId: "47aaa5cf7c2b36348fad7cac2d8dfc2c",
  chains: [monadTestnet, anvilLocal],  
  ssr: true,
});
