import { useReadContract, useWatchContractEvent } from "wagmi";
import { fairDropAbi, fairDropAddress } from "@/lib/contract";

/** Listings actifs du marketplace secondaire — refetch en temps réel sur les events pertinents */
export function useActiveListings() {
  const { data, refetch, ...rest } = useReadContract({
    address: fairDropAddress,
    abi: fairDropAbi,
    functionName: "getAllActiveListings",
  });

  useWatchContractEvent({
    address: fairDropAddress,
    abi: fairDropAbi,
    eventName: "ItemListed",
    onLogs: () => refetch(),
  });

  useWatchContractEvent({
    address: fairDropAddress,
    abi: fairDropAbi,
    eventName: "ListingCancelled",
    onLogs: () => refetch(),
  });

  useWatchContractEvent({
    address: fairDropAddress,
    abi: fairDropAbi,
    eventName: "SecondarySale",
    onLogs: () => refetch(),
  });

  return { listings: data, ...rest };
}
