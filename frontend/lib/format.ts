import { formatEther } from "viem";

/**
 * Montant en wei → texte à 2 décimales pour l'AFFICHAGE, ex. 211466666666666666667n → "211.47".
 * À n'utiliser que pour du texte : le calcul Dutch Auction et les `value` des transactions restent en
 * pleine précision (bigint wei). Un montant > 0 mais < 0.005 s'affiche "<0.01" plutôt que "0.00".
 */
export function formatPrice(wei: bigint): string {
  const value = Number(formatEther(wei));
  if (wei > 0n && value < 0.005) return "<0.01";
  return value.toFixed(2);
}

/** Timestamp Unix (secondes, bigint on-chain) → date lisible, ex. "18 Sept 2026, 14:32". */
export function formatTimestamp(unixSeconds: bigint): string {
  if (unixSeconds === 0n) return "—";
  return new Date(Number(unixSeconds) * 1000).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
