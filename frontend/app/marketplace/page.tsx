"use client";

import { useActiveListings } from "@/hooks/useActiveListings";
import { useTokenDrops } from "@/hooks/useTokenDrops";
import { useContractTx } from "@/hooks/useContractTx";
import { useReadContracts } from "wagmi";
import { fairDropAbi, fairDropAddress } from "@/lib/contract";
import { formatPrice } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";

/** Écran "Secondary Marketplace Items" — voir docs/mockups/03-secondary-marketplace.png */
export default function MarketplacePage() {
  const { listings } = useActiveListings();
  const { tokenDrops } = useTokenDrops(listings);
  const { send, isBusy, activeKey, pendingLabel } = useContractTx();

  const { data: listingDetails } = useReadContracts({
    contracts: (listings ?? []).map((tokenId) => ({
      address: fairDropAddress,
      abi: fairDropAbi,
      functionName: "getActiveListing" as const,
      args: [tokenId] as const,
    })),
    query: { enabled: (listings?.length ?? 0) > 0 },
  });

  function handleBuy(tokenId: bigint, priceWei: bigint) {
    send(
      { functionName: "buySecondary", args: [tokenId], value: priceWei },
      {
        key: `buy-${tokenId}`,
        success: "Item purchased!",
        link: () => ({ href: "/collection", label: "View in My collection" }),
      },
    );
  }

  return (
    <div className="px-8 py-10">
      <h1 className="text-white text-3xl mb-6">Secondary Marketplace</h1>

      {(listings?.length ?? 0) === 0 && <p className="text-muted">No active listing yet.</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {listings?.map((tokenId, i) => {
          const listing = listingDetails?.[i]?.result;
          if (!listing) return null;
          const drop = tokenDrops[i]?.drop;

          return (
            <div key={tokenId.toString()}>
              <span className="text-white text-xs mb-2 flex items-center gap-2">✓ Certified Seller</span>
              <ProductCard
                imageURI={drop?.imageURI ?? ""}
                name={drop?.name ?? `Token #${tokenId.toString()}`}
                description={drop?.description ?? "Resold via FairDrop secondary market"}
                priceWei={listing.resalePrice}
                ctaLabel={
                  activeKey === `buy-${tokenId}` ? pendingLabel : `Buy ${formatPrice(listing.resalePrice)} MON`
                }
                ctaDisabled={isBusy}
                onCtaClick={() => handleBuy(tokenId, listing.resalePrice)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
