import { useReadContracts } from "wagmi";
import type { ReadContractReturnType } from "viem";
import { fairDropAbi, fairDropAddress } from "@/lib/contract";

export type DropInfo = ReadContractReturnType<typeof fairDropAbi, "getDropInfo">;
export type TokenDrop = { dropId: bigint; drop: DropInfo };

/**
 * Pour chaque tokenId : `tokenToDropId(tokenId)` puis `getDropInfo(dropId)` (name / description / imageURI…).
 * Le tableau retourné est aligné sur `tokenIds` ; une entrée vaut `undefined` tant qu'elle n'est pas chargée.
 * Les `getDropInfo` sont dédupliqués par dropId : l'imageURI est un data: URI potentiellement lourd,
 * inutile de le relire pour chaque exemplaire d'un même drop.
 */
export function useTokenDrops(tokenIds: readonly bigint[] | undefined) {
  const ids = tokenIds ?? [];

  const dropIdsQuery = useReadContracts({
    contracts: ids.map((tokenId) => ({
      address: fairDropAddress,
      abi: fairDropAbi,
      functionName: "tokenToDropId" as const,
      args: [tokenId] as const,
    })),
    query: { enabled: ids.length > 0 },
  });

  const dropIds = ids.map((_, i) => dropIdsQuery.data?.[i]?.result as bigint | undefined);
  const uniqueDropIds = Array.from(new Set(dropIds.filter((d): d is bigint => d !== undefined)));

  const dropsQuery = useReadContracts({
    contracts: uniqueDropIds.map((dropId) => ({
      address: fairDropAddress,
      abi: fairDropAbi,
      functionName: "getDropInfo" as const,
      args: [dropId] as const,
    })),
    query: { enabled: uniqueDropIds.length > 0 },
  });

  const dropsById = new Map<bigint, DropInfo>();
  uniqueDropIds.forEach((dropId, i) => {
    const drop = dropsQuery.data?.[i]?.result;
    if (drop) dropsById.set(dropId, drop);
  });

  const tokenDrops: (TokenDrop | undefined)[] = ids.map((_, i) => {
    const dropId = dropIds[i];
    const drop = dropId !== undefined ? dropsById.get(dropId) : undefined;
    return dropId !== undefined && drop ? { dropId, drop } : undefined;
  });

  return { tokenDrops, isLoading: dropIdsQuery.isLoading || dropsQuery.isLoading };
}
