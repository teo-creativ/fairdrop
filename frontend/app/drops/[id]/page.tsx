"use client";

import { useDropInfo } from "@/hooks/useDropInfo";
import { useCurrentPrice } from "@/hooks/useCurrentPrice";
import { PriceTicker } from "@/components/PriceTicker";
import { SoldOutBanner } from "@/components/SoldOutBanner";
import { useContractTx } from "@/hooks/useContractTx";

/** Écran "Live Drop Campaign Page" — voir docs/mockups/01-live-drop-detail.png */
export default function DropDetailPage({ params }: { params: { id: string } }) {
  const dropId = BigInt(params.id);
  const { data: drop } = useDropInfo(dropId);
  // getCurrentPrice ne regarde jamais le stock : on le lit ici et on fige le ticker quand le drop est épuisé.
  const soldOut = drop !== undefined && drop.sold >= drop.totalSupply;
  const { currentPrice } = useCurrentPrice(dropId, !soldOut);
  const { send, isBusy, pendingLabel } = useContractTx();

  if (!drop) {
    return <p className="text-muted px-8 py-10">Loading…</p>;
  }

  // Un drop inexistant renvoie une struct vide (totalSupply = 0).
  if (drop.totalSupply === 0n) {
    return <p className="text-muted px-8 py-10">This drop does not exist.</p>;
  }

  if (!soldOut && currentPrice === undefined) {
    return <p className="text-muted px-8 py-10">Loading…</p>;
  }

  function handleBuy() {
    if (currentPrice === undefined) return;

    // Marge de 1 % : le prix baisse entre l'estimation de gas du wallet et le minage. Quand il a baissé,
    // le contrat crédite l'excédent dans withdrawable[msg.sender] (un SSTORE de plus, ~22k gas) ; en envoyant
    // un peu plus que le prix affiché, l'estimation du wallet inclut déjà ce chemin. L'excédent reste
    // récupérable via withdrawFunds() (page Wallet).
    send(
      { functionName: "buyDrop", args: [dropId], value: (currentPrice * 101n) / 100n },
      { success: "Item purchased!", link: () => ({ href: "/collection", label: "View in My collection" }) },
    );
  }

  return (
    <div className="px-8 py-10 grid md:grid-cols-2 gap-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={drop.imageURI} alt={drop.name} className="rounded-2xl bg-black object-contain w-full" />

      <div className="flex flex-col gap-4">
        <h1 className="text-white text-4xl">{drop.name}</h1>
        <p className="text-muted">{drop.description}</p>

        {soldOut ? (
          <SoldOutBanner totalSupply={drop.totalSupply} />
        ) : (
          currentPrice !== undefined && (
            <PriceTicker
              currentPriceWei={currentPrice}
              startPriceWei={drop.startPrice}
              reservePriceWei={drop.reservePrice}
            />
          )
        )}

        <button
          onClick={handleBuy}
          disabled={soldOut || isBusy}
          className={
            soldOut
              ? "bg-white/10 text-muted rounded-pill py-4 text-lg font-medium cursor-not-allowed"
              : "bg-gradient-to-r from-accent to-accent-light text-white rounded-pill py-4 text-lg font-medium disabled:opacity-50"
          }
        >
          {soldOut ? "Sold Out" : isBusy ? pendingLabel : "Buy item"}
        </button>
      </div>
    </div>
  );
}
