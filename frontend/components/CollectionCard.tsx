import { useState } from "react";
import { parseEther } from "viem";
import { ItemImage } from "@/components/ItemImage";
import { formatPrice, formatTimestamp } from "@/lib/format";
import type { DropInfo } from "@/hooks/useTokenDrops";
import type { TokenAcquisition } from "@/hooks/useTokenAcquisitions";

type CollectionCardProps = {
  tokenId: bigint;
  drop?: DropInfo;
  acquisition?: TokenAcquisition;
  /** Une transaction est en cours (signature ou confirmation) : toutes les actions sont désactivées. */
  disabled?: boolean;
  /** Action en cours sur CETTE carte, pour afficher l'état de chargement sur le bon bouton. */
  pendingAction?: "resell" | "burn";
  /** Label du bouton pendant la tx (signature wallet / confirmation on-chain). */
  pendingLabel?: string;
  onResell: (tokenId: bigint, priceWei: bigint) => void;
  onBurn: (tokenId: bigint) => void;
};

/** Carte "Personal Collection" — voir docs/mockups/04-my-collection.png */
export function CollectionCard({
  tokenId,
  drop,
  acquisition,
  disabled,
  pendingAction,
  pendingLabel,
  onResell,
  onBurn,
}: CollectionCardProps) {
  const [resalePrice, setResalePrice] = useState("");

  const name = drop?.name ?? `Token #${tokenId.toString()}`;
  const resalePriceWei = parseResalePrice(resalePrice);

  return (
    <div className="bg-card border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
      <span className="inline-flex self-start items-center gap-1 bg-accent/20 text-accent text-xs px-3 py-1 rounded-pill">
        🛡 Safe in your collection
      </span>

      <ItemImage imageURI={drop?.imageURI} alt={name} />

      <div className="border-t border-white/10 pt-3">
        <h3 className="text-white font-medium">{name}</h3>
        {drop?.description && <p className="text-muted text-sm">{drop.description}</p>}
      </div>

      <div className="border-t border-white/10 pt-3 flex gap-6 text-sm text-muted">
        <div>
          <p>Original purchase price</p>
          <p className="text-accent-light text-xl">
            {acquisition ? formatPrice(acquisition.price) : "…"} <span className="text-sm">MON</span>
          </p>
        </div>
        <div>
          <p>Date of acquisition</p>
          <p className="text-accent-light text-xl">{acquisition ? formatTimestamp(acquisition.acquiredAt) : "…"}</p>
        </div>
      </div>

      <div>
        <input
          type="text"
          inputMode="decimal"
          placeholder="Resale price (MON)"
          value={resalePrice}
          onChange={(e) => setResalePrice(e.target.value)}
          className="w-full bg-black/40 text-white rounded-lg px-3 py-2 text-sm"
        />
        {resalePrice && resalePriceWei === undefined && (
          <p className="text-danger text-xs mt-1">Enter a valid price in MON, e.g. 12.5</p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => resalePriceWei && onResell(tokenId, resalePriceWei)}
          disabled={disabled || !resalePriceWei}
          className="flex-1 bg-gradient-to-r from-accent to-accent-light text-white rounded-pill py-2 text-sm disabled:opacity-50"
        >
          {pendingAction === "resell" ? pendingLabel : "Resell the item"}
        </button>
        <button
          onClick={() => onBurn(tokenId)}
          disabled={disabled}
          className="flex-1 bg-white text-black rounded-pill py-2 text-sm disabled:opacity-50"
        >
          {pendingAction === "burn" ? pendingLabel : "📦 Request delivery"}
        </button>
      </div>
    </div>
  );
}

/** "12.5" → 12.5 MON en wei ; `undefined` si vide, invalide ou nul (le contrat exige price > 0). */
function parseResalePrice(value: string): bigint | undefined {
  try {
    const wei = parseEther(value.trim());
    return wei > 0n ? wei : undefined;
  } catch {
    return undefined;
  }
}
