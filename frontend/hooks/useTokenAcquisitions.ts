import { useReadContracts } from "wagmi";
import { fairDropAbi, fairDropAddress } from "@/lib/contract";

export type TokenAcquisition = { price: bigint; acquiredAt: bigint };

/**
 * Prix d'acquisition + timestamp d'acquisition (getters publics `tokenAcquisitionPrice` / `tokenAcquiredAt`)
 * pour chaque tokenId. Tableau aligné sur `tokenIds`, `undefined` tant que non chargé.
 * Ces valeurs sont mises à jour à chaque `buyDrop` et `buySecondary` : elles reflètent le dernier achat.
 */
export function useTokenAcquisitions(tokenIds: readonly bigint[] | undefined) {
  const ids = tokenIds ?? [];

  const { data, isLoading } = useReadContracts({
    contracts: ids.flatMap((tokenId) => [
      {
        address: fairDropAddress,
        abi: fairDropAbi,
        functionName: "tokenAcquisitionPrice" as const,
        args: [tokenId] as const,
      },
      {
        address: fairDropAddress,
        abi: fairDropAbi,
        functionName: "tokenAcquiredAt" as const,
        args: [tokenId] as const,
      },
    ]),
    query: { enabled: ids.length > 0 },
  });

  const acquisitions: (TokenAcquisition | undefined)[] = ids.map((_, i) => {
    const price = data?.[i * 2]?.result;
    const acquiredAt = data?.[i * 2 + 1]?.result;
    return price !== undefined && acquiredAt !== undefined ? { price, acquiredAt } : undefined;
  });

  return { acquisitions, isLoading };
}
