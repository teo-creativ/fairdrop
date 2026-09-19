import { formatPrice } from "@/lib/format";

type PriceTickerProps = {
  currentPriceWei: bigint;
  startPriceWei: bigint;
  reservePriceWei: bigint;
};

/** Prix Dutch Auction en direct + barre de progression — voir docs/design.md §3 */
export function PriceTicker({ currentPriceWei, startPriceWei, reservePriceWei }: PriceTickerProps) {
  const range = startPriceWei - reservePriceWei;
  const elapsed = startPriceWei - currentPriceWei;
  const progressPct = range === 0n ? 100 : Number((elapsed * 100n) / range);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-6xl text-white font-medium">
        {formatPrice(currentPriceWei)} <span className="text-accent text-3xl">MON</span>
      </div>

      <div className="h-1.5 bg-white/10 rounded-pill overflow-hidden">
        <div
          className="h-full bg-accent rounded-pill transition-all"
          style={{ width: `${Math.min(progressPct, 100)}%` }}
        />
      </div>

      <p className="text-muted text-sm flex items-center gap-2">
        <span>⏱</span> The price drops with every tick — every second
      </p>
    </div>
  );
}
