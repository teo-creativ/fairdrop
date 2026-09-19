import { useReadContract, useWatchBlockNumber } from "wagmi";
import { fairDropAbi, fairDropAddress } from "@/lib/contract";

/**
 * Prix Dutch Auction courant d'un drop — refetch à chaque nouveau bloc Monad (~1s).
 * `getCurrentPrice` est purement temporel (il ne regarde jamais sold/totalSupply) : l'appelant doit
 * passer `enabled = false` quand le drop est épuisé pour figer le ticker et arrêter les refetch.
 */
export function useCurrentPrice(dropId: bigint, enabled = true) {
  const { data, refetch, ...rest } = useReadContract({
    address: fairDropAddress,
    abi: fairDropAbi,
    functionName: "getCurrentPrice",
    args: [dropId],
    query: { enabled },
  });

  useWatchBlockNumber({
    enabled,
    onBlockNumber: () => refetch(),
  });

  return { currentPrice: data, ...rest };
}
