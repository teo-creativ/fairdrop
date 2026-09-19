/**
 * Compteur "X buyers on the live" — chiffre d'ambiance pour la démo, PAS une donnée on-chain
 * (voir docs/functional-spec.md §6bis). On part du `sold` réel du drop et on y ajoute un offset
 * arbitraire mais déterministe (dérivé du dropId) : le nombre ne bouge pas à chaque refresh
 * et augmente bien quand un achat a lieu.
 */
export function ambientBuyerCount(dropId: number, sold: bigint): number {
  const offset = 12 + ((dropId * 37 + 11) % 48); // 12..59, stable pour un dropId donné
  return Number(sold) + offset;
}
