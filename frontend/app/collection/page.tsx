"use client";

import { useUserTokens } from "@/hooks/useUserTokens";
import { useTokenDrops } from "@/hooks/useTokenDrops";
import { useTokenAcquisitions } from "@/hooks/useTokenAcquisitions";
import { useContractTx } from "@/hooks/useContractTx";
import { CollectionCard } from "@/components/CollectionCard";

/** Écran "Personal Collection" — voir docs/mockups/04-my-collection.png */
export default function CollectionPage() {
  const { data: tokens } = useUserTokens();
  const { tokenDrops } = useTokenDrops(tokens);
  const { acquisitions } = useTokenAcquisitions(tokens);
  const { send, isBusy, activeKey, pendingLabel } = useContractTx();

  function handleResell(tokenId: bigint, priceWei: bigint) {
    send(
      { functionName: "listForResale", args: [tokenId, priceWei] },
      {
        key: `resell-${tokenId}`,
        success: "Item listed for resale",
        link: () => ({ href: "/marketplace", label: "View on the marketplace" }),
      },
    );
  }

  function handleBurn(tokenId: bigint) {
    send(
      { functionName: "burnForDelivery", args: [tokenId] },
      { key: `burn-${tokenId}`, success: "Delivery requested — the token has been burned" },
    );
  }

  return (
    <div className="px-8 py-10">
      <h1 className="text-white text-3xl mb-6">My collection</h1>

      {(tokens?.length ?? 0) === 0 && <p className="text-muted">Your collection is empty.</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tokens?.map((tokenId, i) => (
          <CollectionCard
            key={tokenId.toString()}
            tokenId={tokenId}
            drop={tokenDrops[i]?.drop}
            acquisition={acquisitions[i]}
            disabled={isBusy}
            pendingAction={
              activeKey === `resell-${tokenId}` ? "resell" : activeKey === `burn-${tokenId}` ? "burn" : undefined
            }
            pendingLabel={pendingLabel}
            onResell={handleResell}
            onBurn={handleBurn}
          />
        ))}
      </div>
    </div>
  );
}
