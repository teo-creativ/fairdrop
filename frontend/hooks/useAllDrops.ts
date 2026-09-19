import { useReadContract, useReadContracts, useWatchContractEvent } from "wagmi";
import { fairDropAbi, fairDropAddress } from "@/lib/contract";

/**
 * Liste tous les drops créés (dropId de 0 à nextDropId - 1).
 * Le contrat n'a pas de getter "getAllDrops" (pas nécessaire côté contrat), donc on
 * lit `nextDropId` puis on batch les `getDropInfo` correspondants avec useReadContracts.
 * Refetch en direct sur `DropCreated` (nouvelle carte) et `DropPurchased` (le `sold` change → "Sold Out").
 */
export function useAllDrops() {
  const { data: nextDropId, refetch: refetchCount } = useReadContract({
    address: fairDropAddress,
    abi: fairDropAbi,
    functionName: "nextDropId",
  });

  const dropCount = nextDropId ? Number(nextDropId) : 0;

  const { data: drops, refetch: refetchDrops, ...rest } = useReadContracts({
    contracts: Array.from({ length: dropCount }, (_, i) => ({
      address: fairDropAddress,
      abi: fairDropAbi,
      functionName: "getDropInfo" as const,
      args: [BigInt(i)] as const,
    })),
    query: { enabled: dropCount > 0 },
  });

  useWatchContractEvent({
    address: fairDropAddress,
    abi: fairDropAbi,
    eventName: "DropCreated",
    onLogs: () => refetchCount(),
  });

  useWatchContractEvent({
    address: fairDropAddress,
    abi: fairDropAbi,
    eventName: "DropPurchased",
    onLogs: () => refetchDrops(),
  });

  return { drops, dropCount, ...rest };
}
