type SoldOutBannerProps = {
  totalSupply: bigint;
};

/** Remplace le <PriceTicker> quand un drop est épuisé : plus aucun prix qui bouge. */
export function SoldOutBanner({ totalSupply }: SoldOutBannerProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-6xl text-white">Sold Out</div>

      <div className="h-1.5 bg-white/10 rounded-pill overflow-hidden">
        <div className="h-full w-full bg-white/30 rounded-pill" />
      </div>

      <p className="text-muted text-sm">
        All {totalSupply.toString()} {totalSupply === 1n ? "item has" : "items have"} been sold. Look for it on the
        secondary marketplace.
      </p>
    </div>
  );
}
