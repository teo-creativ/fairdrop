# FairDrop — Design System (draft extrait des maquettes)

> ⚠️ Ce fichier est une **extraction visuelle approximative** à partir des captures d'écran. Les valeurs exactes (police, hex précis) sont à confirmer dès que tu m'envoies les assets sources (fichier logo, nom/fichier de police). Marqué `[À CONFIRMER]` partout où j'ai dû estimer.

---

## 1. Palette de couleurs

| Rôle | Valeur estimée | Usage observé |
| --- | --- | --- |
| Fond principal (contenu) | `#0A0A0F` [À CONFIRMER] | Fond noir/quasi-noir sous le header |
| Header — dégradé haut | `#3D4FA8` → `#1B2454` [À CONFIRMER] | Bandeau supérieur, dégradé bleu clair → bleu marine foncé |
| Accent primaire (CTA) | `#4C6FFF` → `#6C8CFF` (dégradé) [À CONFIRMER] | Boutons "Buy item", prix en gros, badges actifs |
| Fond des cartes | `#12131A` avec bordure `rgba(255,255,255,0.08)` [À CONFIRMER] | Cartes produit, cartes wallet/activité |
| Texte principal | `#FFFFFF` | Titres, prix |
| Texte secondaire | `#9AA3B8` [À CONFIRMER] | Descriptions, sous-titres |
| Succès / gain | `#34D399` [À CONFIRMER] | Montants positifs (`+130 MON`), badge "Monad Testnet" |
| Erreur / dépense | `#F87171` [À CONFIRMER] | Montants négatifs (`-85 MON`), pastille "Live" |
| Bouton secondaire | Blanc plein `#FFFFFF`, texte noir | "Log out", "Request delivery" |

## 2. Typographie

- **Police unique confirmée : [Onest](https://fonts.google.com/specimen/Onest), graisse Regular** — disponible sur Google Fonts, utilisable en `<link>` direct ou via `next/font/google`
- Le logo (SVG fourni) est un lettering vectoriel blanc pur, fond transparent — à poser directement sur le header sans variante colorée à gérer
- Les gros nombres (prix, soldes) restent en Onest, mise en valeur par la taille + une couleur légèrement différente sur l'unité (`MON` en plus petit/plus clair que le chiffre)

## 3. Composants identifiés

| Composant | Description |
| --- | --- |
| **Pill button (primaire)** | Fond dégradé bleu, coins totalement arrondis, texte blanc centré |
| **Pill button (secondaire)** | Fond blanc plein, texte noir, même forme |
| **Badge statut** | Pastille arrondie avec icône + texte (`● Live Drop`, `👁 483 Buyers`, `✓ Certified Seller`, `🛡 Safe in your collection`, `✓ Monad Testnet`) |
| **Barre de progression** | Fine, coins arrondis, remplissage bleu sur fond gris foncé — représente le stock vendu ou la progression du prix |
| **Carte produit** | Image produit en haut, badges, titre, description courte, séparateur fin, prix ou CTA en bas |
| **Avatar** | Cercle bleu clair avec émoji visage simple — placeholder |
| **Menu déroulant profil** | Overlay sombre avec liste verticale simple (Wallet / Activity / Balance / Parameters) |

## 4. Écrans identifiés (mapping maquettes → routes)

| # | Nom maquette | Route probable | Contenu clé |
| --- | --- | --- | --- |
| 1 | Live Drop Campaign Page | `/drops/[id]` | Détail d'un drop unique, prix Dutch Auction en direct, CTA "Buy item" |
| 2 | Official Live Drop Listing | `/drops` (accueil non connecté) | Grille des drops actifs, filtres par catégorie, recherche, CTA "Connect Wallet to Purchase" |
| 3 | Secondary Marketplace Items | `/marketplace` | Grille des listings P2P, vendeur + badge "Certified Seller", CTA "Buy X MON" |
| 4 | Personal Collection | `/collection` | Item(s) possédés, prix d'achat / valeur estimée / date, CTA "Resell" + "Request delivery" |
| 5 | Profile Dashboard (My Wallet) | `/wallet` | Solde wallet, valeur collection, infos profil, historique d'activité, section paramètres |
| 6 | Profile Dropdown | overlay (composant, pas une route) | Accès rapide Wallet / Activity / Balance / Parameters depuis l'avatar |

## 5. Ce qu'il manque pour un design.md définitif

- [x] Fichier logo source (SVG) — fourni, wordmark blanc, fond transparent
- [x] Police — Onest Regular (Google Fonts)
- [ ] Confirmation des hex exacts (export Figma ou variables CSS si tu les as) — sinon on part sur les valeurs estimées ci-dessus
- [ ] Set d'icônes utilisé (Lucide ? Phosphor ? Heroicons ?) — j'ai supposé un style compatible **Lucide** (disponible nativement dans notre stack React) sauf indication contraire
