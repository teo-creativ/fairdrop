"use client";

import Link from "next/link";
import { useAllDrops } from "@/hooks/useAllDrops";
import { ProductCard } from "@/components/ProductCard";
import { ambientBuyerCount } from "@/lib/ambientBuyers";

/** Écran "Official Live Drop Listing" — voir docs/mockups/02-live-drop-listing.png */
export default function DropsPage() {
  const { drops, dropCount, isLoading } = useAllDrops();

  return (
    <div className="px-8 py-10">
      <h1 className="text-white text-3xl mb-6">Official Drop</h1>

      {isLoading && <p className="text-muted">Loading drops…</p>}
      {dropCount === 0 && !isLoading && <p className="text-muted">No drop created yet.</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {drops?.map((result, i) => {
          if (!result.result) return null;
          const drop = result.result;
          // getCurrentPrice ne regarde pas le stock : c'est sold/totalSupply qui décide si le drop est épuisé.
          const soldOut = drop.sold >= drop.totalSupply;
          return (
            <Link key={i} href={`/drops/${i}`}>
              <ProductCard
                imageURI={drop.imageURI}
                name={drop.name}
                description={drop.description}
                priceWei={drop.startPrice}
                badge={soldOut ? "● Sold Out" : "● Live Drop"}
                buyersCount={ambientBuyerCount(i, drop.sold)}
                soldOut={soldOut}
                ctaLabel={soldOut ? "Sold Out" : "Connect Wallet to Purchase"}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
