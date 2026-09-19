import { useAccount, useReadContract } from "wagmi";
import { fairDropAbi, fairDropAddress } from "@/lib/contract";

/** Solde retirable du wallet connecté (ventes primaires/secondaires, remboursements) */
export function useWithdrawableBalance() {
  const { address } = useAccount();

  return useReadContract({
    address: fairDropAddress,
    abi: fairDropAbi,
    functionName: "getWithdrawableBalance",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });
}
