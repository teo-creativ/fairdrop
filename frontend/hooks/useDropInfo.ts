import { useReadContract, useWatchContractEvent } from "wagmi";
import { fairDropAbi, fairDropAddress } from "@/lib/contract";

/**
 * Détail d'un drop (stock, prix, timing) — voir docs/functional-spec.md.
 * Refetch sur chaque `DropPurchased` de ce drop : `sold` change même quand l'achat vient d'un autre wallet
 * (c'est ce qui fait basculer la page en "Sold Out" en direct).
 */
export function useDropInfo(dropId: bigint) {
  const query = useReadContract({
    address: fairDropAddress,
    abi: fairDropAbi,
    functionName: "getDropInfo",
    args: [dropId],
  });

  useWatchContractEvent({
    address: fairDropAddress,
    abi: fairDropAbi,
    eventName: "DropPurchased",
    args: { dropId },
    onLogs: () => query.refetch(),
  });

  return query;
}
