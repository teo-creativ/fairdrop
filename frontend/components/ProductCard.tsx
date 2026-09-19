import { formatPrice } from "@/lib/format";
import { ItemImage } from "@/components/ItemImage";

type ProductCardProps = {
  imageURI: string;
  name: string;
  description: string;
  priceWei: bigint;
  badge?: string;
  /** Badge cosmétique "👁 X buyers on the live" — voir lib/ambientBuyers.ts */
  buyersCount?: number;
  /** Drop épuisé : plus de prix affiché, badge et CTA "Sold Out" (CTA inactif). */
  soldOut?: boolean;
  ctaLabel: string;
  ctaDisabled?: boolean;
  onCtaClick?: () => void;
};

/** Carte produit générique — voir docs/design.md §3 "Carte produit" */
export function ProductCard({
  imageURI,
  name,
  description,
  priceWei,
  badge,
  buyersCount,
  soldOut,
  ctaLabel,
  ctaDisabled,
  onCtaClick,
}: ProductCardProps) {
  return (
    <div className="bg-card border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
      {(badge || buyersCount !== undefined) && (
        <div className="flex flex-wrap gap-2">
          {badge && (
            <span
              className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-pill ${
                soldOut ? "bg-white/10 text-muted" : "bg-accent/20 text-accent"
              }`}
            >
              {badge}
            </span>
          )}
          {buyersCount !== undefined && (
            <span className="inline-flex items-center gap-1 bg-white/10 text-white text-xs px-3 py-1 rounded-pill">
              👁 {buyersCount} buyers on the live
            </span>
          )}
        </div>
      )}

      <ItemImage imageURI={imageURI} alt={name} />

      <div className="text-3xl text-white">
        {soldOut ? (
          "Sold Out"
        ) : (
          <>
            {formatPrice(priceWei)} <span className="text-muted text-lg">MON</span>
          </>
        )}
      </div>

      <div className="border-t border-white/10 pt-3">
        <h3 className="text-white font-medium">{name}</h3>
        <p className="text-muted text-sm">{description}</p>
      </div>

      <button
        onClick={onCtaClick}
        disabled={soldOut || ctaDisabled}
        // Sold Out : `pointer-events-none` laisse le clic traverser le bouton vers le <Link> parent (page du drop).
        className={
          soldOut
            ? "bg-white/10 text-muted rounded-pill py-3 font-medium pointer-events-none"
            : "bg-gradient-to-r from-accent to-accent-light text-white rounded-pill py-3 font-medium disabled:opacity-50"
        }
      >
        {ctaLabel}
      </button>
    </div>
  );
}
