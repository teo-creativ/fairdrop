# FairDrop — Spécifications fonctionnelles détaillées (MVP Hackathon Monad Blitz)

> Objectif de ce document : donner l'ABI fonctionnel complet du smart contract pour que le frontend puisse être codé **en parallèle** du contrat, sans attendre qu'il soit fini.

---

## 1. Hypothèses tranchées (zones grises du cahier des charges)

Ces points n'étaient pas explicites dans le CDC initial. Voici les décisions retenues pour le scope 7h — à ajuster si tu vois différemment, mais il faut les figer maintenant pour ne pas bloquer le dev :

| Zone grise | Décision retenue pour le MVP |
| --- | --- |
| Fin de Dutch Auction sans acheteur | Le prix reste bloqué au `reservePrice` une fois atteint (pas de retrait automatique du drop) |
| Nombre d'items par drop | 1 `DropItem` = 1 stock avec une quantité (`totalSupply`), tous les exemplaires suivent la même courbe de prix. Chaque achat décrémente le stock ; le drop se termine quand `sold == totalSupply` |
| Annulation d'un listing secondaire | Autorisée via `cancelListing(tokenId)` — le vendeur peut retirer son annonce à tout moment tant qu'elle n'est pas achetée |
| **[VERROUILLÉ]** Modèle de frais secondaire | Redevance fixe de **2 % au total**, répartie en **1 % protocole (adresse trésorerie fixe du projet)** et **1 % vendeur officiel** — une adresse fixe par produit/campagne (la franchise/revendeur officiel qui a lancé le drop), **pas** le particulier qui a acheté en premier au live drop. Le revendeur (le particulier qui remet en vente) récupère **98 %** du prix de revente. S'applique à chaque vente secondaire, profit ou perte, peu importe |
| Cadence de démo | On s'appuie sur la vraie cadence Monad (blocs ~1s) — pas de simulation nécessaire, c'est justement l'argument de pitch |

---

## 2. Fonctions du smart contract (à consommer via `wagmi`/`viem`)

### Écriture (transactions)

| Fonction | Signature | Écran concerné | Description |
| --- | --- | --- | --- |
| Achat primaire | `buyDrop(uint256 dropId) payable` | Live Drop Banner | Achète au prix courant (Dutch Auction). Revert si stock épuisé ou `msg.value` insuffisant |
| **[NOUVEAU]** Création de drop | `createDrop(string calldata name, string calldata description, string calldata imageURI, uint256 startPrice, uint256 reservePrice, uint256 dropDuration, uint256 totalSupply, address officialReseller) external onlyOwner returns (uint256 dropId)` | Admin | Crée une nouvelle campagne. Seul le deployer (`onlyOwner`) peut l'appeler |
| Mise en revente | `listForResale(uint256 tokenId, uint256 price)` | Mon Inventaire | Crée un listing secondaire actif |
| Annulation listing | `cancelListing(uint256 tokenId)` | Mon Inventaire | Retire un listing actif (seul le seller peut appeler) |
| Achat secondaire | `buySecondary(uint256 tokenId) payable` | Secondary Marketplace | Achète un item listé ; prélève 1 % pour le protocole + 1 % pour le vendeur officiel de la campagne d'origine, transfère les 98 % restants au revendeur |
| Burn livraison | `burnForDelivery(uint256 tokenId)` | Mon Inventaire | Brûle le token, marque l'item comme "en cours de livraison" |
| Retrait fonds | `withdrawFunds()` | (revendeur, vendeur officiel, ou trésorerie protocole) | Pull-payment : chaque partie (revendeur, vendeur officiel initial, protocole) récupère son solde accumulé séparément |

### Lecture (view, pas de gas, pour l'affichage live)

| Fonction | Signature | Écran concerné | Description |
| --- | --- | --- | --- |
| Prix courant | `getCurrentPrice(uint256 dropId) view returns (uint256)` | Live Drop Banner | Prix recalculé à chaque bloc selon la formule Dutch Auction |
| Détail d'un drop | `getDropInfo(uint256 dropId) view returns (DropItem)` | Live Drop Banner | Stock restant, prix de départ, reserve, timing |
| Tokens d'un wallet | `getUserTokens(address user) view returns (uint256[])` | Mon Inventaire | Liste des tokenId possédés |
| Listing actif | `getActiveListing(uint256 tokenId) view returns (ResaleListing)` | Secondary Marketplace | Prix, vendeur, statut |
| Tous les listings actifs | `getAllActiveListings() view returns (uint256[])` | Secondary Marketplace | Pour peupler la grille |
| Solde retirable | `getWithdrawableBalance(address user) view returns (uint256)` | Mon Inventaire | Montant que l'utilisateur peut retirer |

---

## 3. Events (pour le temps réel côté frontend, sans polling)

| Event | Payload | Usage frontend |
| --- | --- | --- |
| `DropCreated` | `uint256 dropId, string name, address officialReseller, uint256 startPrice, uint256 reservePrice, uint256 totalSupply` | Rafraîchir la liste des drops côté Admin et Live Drop Listing |
| `DropPurchased` | `address buyer, uint256 dropId, uint256 tokenId, uint256 price` | Décrémenter le stock affiché en live, animer la transition de prix |
| `ItemListed` | `uint256 tokenId, address seller, uint256 price` | Ajouter la carte au Secondary Marketplace |
| `ListingCancelled` | `uint256 tokenId` | Retirer la carte du marketplace |
| `SecondarySale` | `uint256 tokenId, address seller, address buyer, uint256 price, uint256 protocolFee, uint256 officialResellerRoyalty` | Afficher le badge "2% de redevance reversée (1% réseau + 1% revendeur officiel)", mettre à jour l'inventaire des deux parties |
| `TokenBurned` | `uint256 tokenId, address owner` | Basculer l'item en statut "Prêt pour livraison" |
| `FundsWithdrawn` | `address user, uint256 amount` | Confirmation de retrait |

---

## 4. Structures de données (rappel, alignées avec le CDC)

```solidity
struct DropItem {
    uint256 startPrice;
    uint256 reservePrice;
    uint256 startTime;
    uint256 dropDuration;
    uint256 totalSupply;      // nombre d'exemplaires du drop
    uint256 sold;              // compteur de ventes
    address officialReseller;  // [NOUVEAU] adresse fixe du revendeur officiel de la campagne, perçoit 1% à chaque revente secondaire d'un token de ce drop
}

struct ResaleListing {
    uint256 originalBuyPrice;
    uint256 resalePrice;
    address seller;
    bool isActive;
}

// [NOUVEAU] mapping nécessaire pour retrouver l'officialReseller à partir d'un tokenId lors de buySecondary
mapping(uint256 tokenId => uint256 dropId) public tokenToDropId;
```

> Note d'implémentation : `officialReseller` est fixé une seule fois, à la création du drop via `createDrop`, appelable uniquement par le deployer (`onlyOwner`, via OpenZeppelin `Ownable`).
>
> **[NOUVEAU] Écran Admin (`/admin`)** : formulaire de création de campagne (nom, description, upload photo, prix départ/plancher, durée, stock, adresse du revendeur officiel). Protégé côté front par une vérification `address === owner()`, la vraie barrière de sécurité étant le modifier `onlyOwner` du contrat.
>
> **Choix pour l'image (`imageURI`)** : pas d'infra IPFS en 7h → l'image uploadée est convertie en `data:` URI (base64) côté front et stockée directement dans la string on-chain. Le coût gas est plus élevé qu'un simple lien, mais c'est acceptable sur Monad Testnet et ça évite toute dépendance externe (pinning service, backend d'upload). Alternative plus légère si le temps manque : coller une URL d'image déjà hébergée (imgur, etc.) au lieu d'uploader un fichier.

---

## 5. Parcours écran → appels contrat (résumé pour le dev frontend)

| Écran | Au chargement (view calls) | Actions utilisateur (transactions) | Events écoutés |
| --- | --- | --- | --- |
| **Admin** (`/admin`, réservé au deployer) | `owner()` (pour vérifier l'accès) | `createDrop` | `DropCreated` |
| **Onglet Drops** | `getDropInfo`, `getCurrentPrice` (polling ou re-fetch à chaque bloc) | `buyDrop` | `DropPurchased` |
| **Mon Inventaire** | `getUserTokens`, `getWithdrawableBalance` | `listForResale`, `cancelListing`, `burnForDelivery`, `withdrawFunds` | `TokenBurned`, `FundsWithdrawn` |
| **Secondary Marketplace** | `getAllActiveListings`, puis `getActiveListing` par token | `buySecondary` | `ItemListed`, `ListingCancelled`, `SecondarySale` |
| **Visualiseur d'exécution** | — | — | Écoute passive du hash/temps d'inclusion/gas de la dernière transaction émise |

---

## 6bis. Éléments purement frontend, sans logique contrat (décisions confirmées)

| Élément | Décision |
| --- | --- |
| Badge "Certified Seller" | **Aucune logique on-chain.** Dès qu'un wallet se connecte à FairDrop, il est affiché comme "Certified" côté front — c'est un état cosmétique, pas un booléen stocké dans le contrat. Le vrai KYC/vetting est explicitement hors scope MVP |
| Compteur "X Buyers on the live" | **Chiffre d'ambiance pour la démo**, potentiellement dynamique côté front (ex : incrémenté par un petit script d'animation ou dérivé du nombre réel d'events `DropPurchased` + un offset visuel), mais ce n'est pas une donnée à faire remonter du contrat comme source de vérité |

## 7. Ce qui reste hors scope 7h (rappel MoSCoW "Won't have")

- KYC
- Intégration transporteurs (Colissimo/FedEx)
- Fiat on-ramp
- Architecture proxy/upgradeable
