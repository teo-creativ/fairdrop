# TODO.md — FairDrop, Monad Blitz Paris (19 sept, deadline 18h30)

> Coche au fil de la journée. L'ordre est pensé pour ne jamais bloquer le frontend en attendant le contrat.

## 0. Avant / pendant l'accueil (9h-11h30)

> Le squelette complet (contrat `FairDrop.sol`, tests, script de déploiement, frontend Next.js, docs, assets) est déjà dans `fairdrop-project.zip`. Cette section est de l'installation, pas de la création.

- [ ] Fork du repo `monad-blitz-paris`, nom du projet + description renseignés
- [ ] Dézipper `fairdrop-project.zip` par-dessus le repo forké (ou dedans), commit initial
- [ ] Foundry installé (`curl -L https://foundry.paradigm.xyz | bash && foundryup`, `forge --version` ≥ v1.8)
- [ ] Dans `/contracts` : `forge install OpenZeppelin/openzeppelin-contracts` (requis par `remappings.txt`)
- [ ] Dans `/contracts` : `forge install foundry-rs/forge-std` si absent (dépendance des tests)
- [ ] `forge test` : les tests fournis dans `test/FairDrop.t.sol` doivent tous passer avant de continuer
- [ ] Dans `/frontend` : `npm install`
- [ ] Remplacer `REPLACE_WITH_WALLETCONNECT_PROJECT_ID` dans `frontend/lib/wagmi.ts` par un vrai project ID (gratuit sur https://cloud.walletconnect.com)
- [ ] Wallet configuré sur Monad Testnet, faucet utilisé pour récupérer des MON de test (`https://faucet.monad.xyz`)
- [ ] Pendant le Monad101 (10h-11h30) : noter les spécificités RPC/faucet/MonadDb utiles pour le pitch (slide "Pourquoi Monad")

## 1. Smart contract — vérifier, ajuster, ne pas réécrire (11h30-14h)

> `src/FairDrop.sol` implémente déjà tout ce qui suit. Le travail ici est de relire, faire tourner les tests, et ajuster si un cas limite a été oublié — pas de repartir de zéro.

- [ ] Relire `createDrop`, `buyDrop`, `getCurrentPrice` — vérifier la formule Dutch Auction contre `docs/functional-spec.md`
- [ ] Relire `listForResale` / `cancelListing` / `buySecondary` — vérifier le split **1% protocole / 1% officialReseller / 98% seller**, profit ou perte (tests `test_BuySecondarySplitsFeeCorrectly` et `test_BuySecondaryAppliesFeeEvenAtALoss` déjà fournis)
- [ ] Relire `burnForDelivery` / `withdrawFunds` (pull-payment)
- [ ] `forge test -vvv` : tout est vert, y compris les cas limites (sold out, paiement insuffisant, listing déjà actif)
- [ ] Ajouter un test si un cas limite propre à ta démo n'est pas couvert (ex : plusieurs drops en parallèle)
- [ ] Déploiement local sur Anvil (`anvil` puis `forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast`) pour brancher le frontend en attendant le testnet
- [ ] Une fois déployé sur Anvil : appeler `createDrop` une première fois (via `cast send` ou un script) pour avoir un drop de test

## 2. Frontend — le squelette existe, il faut le brancher et l'habiller

> Pages, hooks wagmi et composants de base sont déjà dans `frontend/app`, `frontend/hooks`, `frontend/components`. Priorité : ABI réelle + adresse déployée + vrai design, avant d'ajouter des écrans.

- [ ] **Remplacer l'ABI à la main dans `lib/contract.ts` par la vraie ABI compilée** : après `forge build`, copier le tableau `abi` de `contracts/out/FairDrop.sol/FairDrop.json`
- [ ] Mettre à jour `fairDropAddress` dans `lib/contract.ts` avec l'adresse Anvil, puis testnet
- [ ] Vérifier que `/drops`, `/drops/[id]`, `/marketplace`, `/collection`, `/wallet`, `/admin` chargent sans erreur avec un nœud Anvil + un drop créé
- [ ] Remplacer les images placeholder (`/placeholder-item.png` dans `marketplace/page.tsx`) par le vrai visuel une fois `getDropInfo` branché sur les tokenId du marketplace (TODO explicite dans le fichier)
- [ ] Brancher `tokenAcquisitionPrice(tokenId)` / `tokenAcquiredAt(tokenId)` (getters publics auto-générés) dans `collection/page.tsx` — actuellement des placeholders visuels
- [ ] Remplacer la palette/police estimées (`tailwind.config.ts`, `docs/design.md`) si tu as les vrais tokens Figma
- [ ] Historique "Activity" (`wallet/page.tsx`) : brancher `useWatchContractEvent` sur `DropPurchased`/`SecondarySale`/`TokenBurned`/`FundsWithdrawn` filtrés sur l'adresse connectée (TODO explicite dans le fichier)
- [ ] Badge "Certified Seller" : déjà cosmétique dans le code, rien à connecter au contrat
- [ ] Compteur "X buyers on the live" : pas encore implémenté dans les pages — ajouter une valeur d'ambiance/dynamique si le temps le permet

## 3. Intégration testnet & polish (16h30-17h30)

- [ ] Déploiement du contrat sur Monad Testnet, adresse mise à jour dans `/lib/contract.ts`
- [ ] Vérification bout-en-bout : achat primaire → revente → achat secondaire → burn → retrait, tout fonctionne sur testnet
- [ ] **Composant "Visualiseur d'exécution"** : hash de tx, temps d'inclusion (< 1s), gas payé — c'est l'argument de pitch, ne pas le sauter
- [ ] Responsive minimal (au moins lisible sur laptop de démo)
- [ ] Gestion des erreurs UI (tx qui revert, wallet non connecté, etc.) — pas d'écran blanc en cas d'échec

## 4. Repo & soumission (17h30-18h30)

- [ ] `README.md` finalisé : adresse du contrat déployé, lien démo/vidéo, captures d'écran réelles (pas les maquettes brutes)
- [ ] Vérifier que le repo est bien **public**
- [ ] Captures d'écran + courte vidéo de secours enregistrées (backup si le RPC lag pendant le live)
- [ ] Soumission sur **Blitz.devnads.com** avant **18h30** (URL GitHub + URL de démo ou GitHub à nouveau si pas de démo hébergée)
- [ ] Double-vérifier que la soumission est bien enregistrée (on peut modifier jusqu'au début du vote)

## 5. Pitch (19h-19h03, 3 minutes)

- [ ] Mettre à jour le contenu des slides si besoin (le split doit être présenté comme **1% réseau + 1% revendeur officiel**, pas "60/40" — voir note dans le README)
- [ ] Répéter le pitch au moins 2 fois avec un chrono
- [ ] Dive direct dans la démo live (ou vidéo de secours), peu d'intro
- [ ] Mettre en avant : tick 1s Monad → Dutch Auction fluide, atomic settlement du split de royalties, ReentrancyGuard/Pull-payment
