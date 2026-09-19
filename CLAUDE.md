# CLAUDE.md — Contexte projet FairDrop (Monad Blitz Paris)

> Ce fichier est lu par Claude Code au démarrage de chaque session dans ce repo. Il donne tout le contexte nécessaire pour coder vite et juste, sans réexpliquer le projet à chaque fois.

---

## 1. Le projet en une phrase

**FairDrop** — plateforme de précommandes tokenisées (ERC-721) avec **Dutch Auction continue** (prix qui baisse à chaque bloc Monad) et **marketplace secondaire P2P avec redevance de revente**, pour lutter contre le scalping sur les objets de collection (cartes TCG, etc.). Déployé sur **Monad Testnet**. Hackathon Monad Blitz Paris, 19 septembre, deadline de soumission 18h30.

## 2. Stack technique (ne pas dévier — contexte 1 jour de dev)

| Couche | Choix | Notes |
| --- | --- | --- |
| Smart contract | Solidity `^0.8.20` + **Foundry** | Un seul fichier `FairDrop.sol`, pas d'architecture proxy/upgradeable |
| Tests | Foundry (`forge test`) | Écrire le test **en même temps** que chaque fonction, jamais après coup |
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS | |
| Web3 | `wagmi` v2 + `viem` | Pas d'`ethers.js` pour rester cohérent |
| Wallet | RainbowKit ou ConnectKit | Connexion MetaMask/Rabby |
| Backend | **Aucun** | Lecture RPC directe côté client via wagmi. Ne pas créer de serveur Node/FastAPI |
| Police | [Onest](https://fonts.google.com/specimen/Onest), Regular uniquement | via `next/font/google` |
| Réseau | Monad Testnet | RPC + faucet Devnads (voir README) |

## 3. Documents de référence dans ce repo

- `docs/fairdrop-specs-fonctionnelles.md` → **ABI fonctionnel complet** : toutes les fonctions du contrat, leur signature exacte, les events, et le mapping écran → appel contrat. **Source de vérité pour l'intégration frontend.**
- `docs/design.md` → design system (couleurs, typo, composants, mapping écrans ↔ routes)
- `TODO.md` → séquence de développement de la journée, à cocher au fil de l'eau
- `README.md` → présentation publique du projet (jury, GitHub)

Avant de coder une fonction ou un écran, relire le passage correspondant dans `fairdrop-specs-fonctionnelles.md` — ne pas réinventer une signature de fonction différente de celle documentée, le frontend et le contrat doivent rester synchronisés sur cette base.

## 4. Règles métier non négociables (déjà tranchées, ne pas redemander)

- **Dutch Auction** : `currentPrice = startPrice - ((startPrice - reservePrice) * (block.timestamp - startTime) / dropDuration)`, plafonné à `reservePrice`
- **Un drop = un stock** : `totalSupply` exemplaires, tous à la même courbe de prix, `sold` incrémenté à chaque `buyDrop`
- **Revente secondaire = P2P, PAS de profit-sharing 60/40.** Modèle verrouillé : **1% protocole + 1% revendeur officiel de la campagne (adresse fixe, stockée dans `DropItem.officialReseller`) + 98% au particulier qui revend.** S'applique que la revente soit à profit ou à perte.
- **Annulation de listing** autorisée (`cancelListing`)
- **"Certified Seller"** = cosmétique frontend uniquement (tout wallet connecté l'affiche), aucune logique contrat
- **Compteur "X buyers"** = chiffre d'ambiance démo, pas une donnée de vérité on-chain à faire remonter strictement

## 5. Bonnes pratiques sécurité à appliquer systématiquement

- `ReentrancyGuard` sur `buyDrop`, `buySecondary`, `withdrawFunds`
- Checks-Effects-Interactions : décrémenter le stock / mettre à jour le state **avant** tout transfert de fonds
- **Pull over push** : jamais de `transfer`/`send` direct — toujours accumuler dans un solde retirable via `withdrawFunds()`
- Vérifier les underflows sur tout calcul de delta de prix (`require` explicite, ne pas compter uniquement sur les checked arithmetics de 0.8.x pour la lisibilité)

## 6. Conventions de code

- Contrat : un seul fichier `src/FairDrop.sol`, fonctions groupées par domaine (primaire / secondaire / burn / retrait), NatSpec sur chaque fonction publique
- Frontend : hooks wagmi custom dans `/hooks` (un hook = une fonction/lecture du contrat), jamais d'appel `useReadContract` brut dans un composant de page
- Un composant = un fichier, pas de fichier "god component"
- Adresse et ABI du contrat centralisés dans `/lib/contract.ts`, jamais hardcodés ailleurs

## 7. Ce que Claude Code doit faire par défaut dans ce repo

- Toujours proposer le test Foundry associé quand une fonction du contrat est écrite ou modifiée
- Ne jamais introduire de dépendance externe non listée en section 2 sans le signaler explicitement
- Respecter strictement les signatures de fonctions et noms d'events de `docs/fairdrop-specs-fonctionnelles.md` — si un changement est nécessaire, le dire clairement plutôt que de diverger silencieusement
- Rappeler qu'on est sur un contrat **immuable** déployé pour la démo : pas de logique "on corrigera plus tard", chaque fonction doit être correcte du premier coup

## 8. Hors scope (ne pas construire, même si "ça serait plus propre")

- KYC / vetting des vendeurs
- Intégration transporteurs (Colissimo, FedEx...)
- Fiat on-ramp
- Architecture contrat proxy/upgradeable
- Backend applicatif dédié
