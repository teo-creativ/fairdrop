import { useAccount, useReadContract } from "wagmi";
import { fairDropAbi, fairDropAddress } from "@/lib/contract";

/** Tokens possédés par le wallet connecté — alimente l'écran "My Collection" */
export function useUserTokens() {
  const { address } = useAccount();

  return useReadContract({
    address: fairDropAddress,
    abi: fairDropAbi,
    functionName: "getUserTokens",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });
}
