"use client";

import { useAccount, useBalance } from "wagmi";
import { useWithdrawableBalance } from "@/hooks/useWithdrawableBalance";
import { useContractTx } from "@/hooks/useContractTx";
import { formatPrice } from "@/lib/format";

/** Écran "Profile Dashboard / My Wallet" — voir docs/mockups/05-my-wallet.png */
export default function WalletPage() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const { data: withdrawable } = useWithdrawableBalance();
  const { send, isBusy, pendingLabel } = useContractTx();

  function handleWithdraw() {
    send({ functionName: "withdrawFunds", args: [] }, { success: "Funds withdrawn to your wallet" });
  }

  return (
    <div className="px-8 py-10">
      <h1 className="text-white text-3xl mb-6">My Wallet</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-card border border-white/10 rounded-2xl p-6">
          <p className="text-muted text-sm">Wallet Balance</p>
          <p className="text-white text-3xl">{formatPrice(balance?.value ?? 0n)} MON</p>
        </div>

        <div className="bg-card border border-white/10 rounded-2xl p-6">
          <p className="text-muted text-sm">Withdrawable Balance</p>
          <p className="text-white text-3xl">{formatPrice(withdrawable ?? 0n)} MON</p>
          <button
            onClick={handleWithdraw}
            disabled={isBusy || !withdrawable || withdrawable === 0n}
            className="mt-3 bg-white text-black rounded-pill px-4 py-2 text-sm disabled:opacity-40"
          >
            {isBusy ? pendingLabel : "Withdraw"}
          </button>
        </div>

        <div className="bg-card border border-white/10 rounded-2xl p-6">
          <p className="text-muted text-sm">Profile</p>
          <p className="text-white text-sm mt-2">{address ?? "Not connected"}</p>
          <span className="inline-flex mt-2 items-center gap-1 bg-success/20 text-success text-xs px-3 py-1 rounded-pill">
            ✓ Monad Testnet
          </span>
        </div>
      </div>

      <h2 className="text-white text-2xl mb-4">Activity</h2>
      {/* TODO: dériver l'historique en écoutant DropPurchased / SecondarySale / TokenBurned / FundsWithdrawn
          filtrés sur `address` via useWatchContractEvent, voir docs/functional-spec.md §3 */}
      <p className="text-muted">Activity feed coming from on-chain events — see TODO in this file.</p>
    </div>
  );
}
