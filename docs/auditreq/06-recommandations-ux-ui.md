# AudiTREQ — Recommandations UX/UI

## 1. Principes directeurs

1. **Densité maîtrisée, jamais austère** : le public est expert (CPA, avocats, syndics) — l'interface peut être dense en information sans être décorative, mais chaque écran garde une hiérarchie visuelle claire (une action principale, des actions secondaires en retrait).
2. **La source est toujours à portée de clic** : aucune donnée affichée n'est orpheline de son avis REQ source. Convention constante : icône de provenance à côté de chaque donnée factuelle, clic → aperçu du document/avis d'origine.
3. **Le graphe est le centre de gravité, pas un gadget** : contrairement à un simple visualiseur, le graphe doit rester lisible à l'échelle (expansion progressive, jamais un « big bang » de 500 nœuds au premier chargement).
4. **Rien n'est une boîte noire** : score de risque, UBO calculé, suggestion de fusion d'identité — chaque résultat dérivé a un « pourquoi » consultable en un clic.
5. **Le mode d'usage doit être visible en permanence** : Investigation rapide vs Audit approfondi n'est pas un réglage caché — c'est un sélecteur persistant qui change réellement la densité d'UI affichée.

## 2. Système visuel

### 2.1 Mode sombre par défaut (exigence produit)
- Fond de base très sombre neutre (pas de bleu nuit saturé qui fatigue) : `#0F1216` à `#161A20`.
- Surfaces élevées (cartes, panneaux) légèrement plus claires que le fond, avec élévation par contraste plutôt que par ombre portée lourde.
- Mode clair disponible en parité complète (même hiérarchie, mêmes composants) — certains professionnels impriment/partagent en clair pour des raisons de lisibilité PDF.

### 2.2 Couleur = signal, pas décoration
- La couleur est réservée quasi exclusivement à la **sévérité des red flags** et au **score de risque** : une échelle cohérente (neutre → attention → élevé) utilisée identiquement partout (badge de fiche, nœud de graphe, ligne de timeline, cellule de tableau).
- Le reste de l'interface reste en tons neutres (gris, un accent de marque unique pour les actions primaires) — pour que la couleur de risque saute réellement aux yeux au lieu de se noyer dans une UI multicolore.
- Distinction typée des sources (REQ officiel vs complémentaire) par un badge textuel/pictogramme, pas par la couleur (réservée au risque).

### 2.3 Typographie et données tabulaires
- Police à forte lisibilité pour chiffres et identifiants (NEQ, pourcentages, dates) — chiffres tabulaires alignés (tabular figures) partout où des colonnes de pourcentages/dates sont comparées.
- Hiérarchie typographique limitée (3-4 niveaux) pour ne pas surcharger des écrans déjà denses en données.

## 3. Composants clés

| Composant | Rôle | Exigences |
|---|---|---|
| **Barre de recherche omniprésente** | Point d'entrée unique, accessible par raccourci (`/`) depuis n'importe quel écran | Suggestions instantanées typées (Entité / Personne / Adresse), affichage du NEQ dans les résultats |
| **Badge de score de risque** | Résumé visuel immédiat sur fiche, nœud de graphe, ligne de tableau | Couleur + valeur numérique + icône de sévérité, jamais couleur seule (accessibilité) |
| **Canvas de graphe** | Cœur de l'analyse relationnelle | Zoom/pan fluide, expansion par clic sur nœud, légende persistante des types de relations, mode « figer la disposition » pour le rapport |
| **Panneau contextuel (drawer)** | Détail au survol/clic d'un nœud sans quitter le graphe | Mini-fiche, red flags associés, bouton d'ajout au dossier |
| **Timeline horizontale** | Vue chronologique alternative au graphe | Filtrable par type d'événement, synchronisée avec la sélection du graphe (sélectionner une entité filtre sa timeline) |
| **Panneau de red flags** | Liste priorisée par sévérité | Chaque item explique le déclencheur en une phrase + lien direct vers l'élément du graphe concerné |
| **Éditeur d'annotation** | Note contextualisée | Horodatage et auteur visibles, historique de modification, jamais de suppression silencieuse (append + statut archivé) |
| **Générateur de rapport** | Sélection de sections + prévisualisation avant export | Prévisualisation fidèle au PDF final, pas de surprise à la génération |
| **Sélecteur de mode** | Bascule Investigation rapide / Audit approfondi | Persistant en en-tête, change la densité des panneaux sans perdre le contexte courant |

## 4. Accessibilité et ergonomie professionnelle

- Conformité WCAG 2.1 AA minimum (contraste, navigation clavier complète — un professionnel travaille souvent avec de multiples fenêtres et raccourcis).
- Le graphe doit avoir une **vue tabulaire équivalente** (liste des nœuds/relations) pour les utilisateurs préférant/nécessitant une lecture non graphique, et pour l'export de données brutes.
- Raccourcis clavier pour les actions fréquentes (recherche, ajout au dossier, bascule de mode, expansion de nœud) — public professionnel à haute fréquence d'usage, l'efficacité clavier compte autant que la découvrabilité souris.
- États de chargement explicites sur les traversées de graphe complexes (jamais un écran figé sans feedback pendant un calcul d'UBO profond).

## 5. Anti-patterns à éviter explicitement

- **Ne pas** afficher un score de risque sans sa décomposition accessible — casse la confiance et l'opposabilité.
- **Ne pas** rendre le graphe complet par défaut sur une grande structure — noie l'utilisateur, tue la performance perçue.
- **Ne pas** fusionner automatiquement des identités similaires sans validation humaine — risque réputationnel et légal direct.
- **Ne pas** multiplier les couleurs décoratives qui diluent le signal de risque.
- **Ne pas** cacher le mode d'usage courant dans un menu — doit rester visible en permanence vu son impact sur la densité d'écran.
