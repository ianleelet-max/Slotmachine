# VéloceREQ — Priorisation MVP → V1 → V2

Principe de priorisation : le MVP doit déjà livrer la promesse centrale — *de la fiche à l'arbre* — sur des données REQ pures, sans dépendre des sources complémentaires ni du machine learning. Chaque phase suivante ajoute une couche de valeur sans remettre en cause l'architecture (voir doc 01, pensée API-first et graphe dès le MVP).

> **Mise à jour (août 2026).** La vérification des accès aux données ([doc 07](./07-acces-donnees-req.md)) a montré que le jeu de données ouvertes du REQ ne publie aucune personne physique. La priorisation ci-dessous reste valable, mais le MVP se scinde de fait en deux : ce qui tourne sur les données ouvertes (implémenté, y compris une règle nouvelle sur le contrôle exercé hors du conseil d'administration) et ce qui attend une entente avec le Registraire (bénéficiaire ultime, cycles, cascades, prête-noms).

## MVP — « Prouver l'arbre » (cible : 3-4 mois)

Objectif : un professionnel peut chercher une entité et obtenir sa structure de propriété réelle, plus vite et plus complètement qu'à la main — c'est la valeur minimale qui justifie déjà l'outil.

**Données**
- Ingestion REQ complète (entités, administrateurs, actionnaires ≥10 %, adresses, statuts, historique d'avis).
- Résolution d'identité de base (règles déterministes : nom exact + variantes orthographiques courantes ; pas encore de scoring probabiliste fin).

**Fonctionnel**
- Recherche multi-critères (nom, NEQ, administrateur, adresse) avec fuzzy matching simple.
- Fiche entité complète (identité, statut, adresses historiques, administrateurs/actionnaires actuels et passés).
- Graphe relationnel interactif (2-3 degrés), navigation par expansion.
- Timeline basique par entité (constitutions, modifications, dissolutions).
- Calcul UBO direct (chaîne de détention déclarée ≥25 %, sans détection de contrôle de fait).
- Red flags de base, mécaniques et peu ambiguës : cycles de détention (§2.3), dissolutions/reconstitutions rapides (§2.5), adresses partagées massives (§2.6). Ce sont les règles les plus fiables à faible taux de faux positifs — bon choix pour établir la confiance dès le départ.
- Export PDF simple de la fiche + graphe (pas encore le rapport structuré complet).
- Comptes utilisateurs, cabinets, RBAC de base (Admin/Professionnel).
- Journal d'audit des consultations (obligation de conformité, non négociable même au MVP).

**Non-fonctionnel**
- Hébergement Canada, chiffrement au repos/transit, MFA.
- Mode unique (pas encore de bascule investigation rapide / audit approfondi — l'UI du MVP est déjà orientée « rapide » par défaut).

**Hors scope MVP** : sources complémentaires (RDPRM, foncier, BSF), dossiers d'audit collaboratifs, annotations, scoring composite pondéré, alertes/surveillance, comparaison temporelle, rapport structuré avec sections personnalisables.

## V1 — « Outiller l'audit » (cible : +4-6 mois après MVP)

Objectif : transformer l'outil de consultation en véritable poste de travail d'audit, avec dossiers, collaboration et rapport opposable — ce qui verrouille l'adoption professionnelle récurrente (vs usage ponctuel).

**Fonctionnel**
- **Dossiers d'audit** complets : création, ajout d'entités, mandat/finalité déclarée, statut.
- **Annotations collaboratives** sur nœuds/relations, avec historique et auteur.
- **Partage de dossier** intra-cabinet (RBAC au niveau dossier).
- **Générateur de rapport structuré** (PDF/Word) : résumé exécutif, arbre de propriété, timeline, red flags, annexes sourcées — le livrable central pour les avocats et syndics.
- **Score de risque composite** pondéré et calibrable (§2.8), avec décomposition affichée et retour utilisateur (confirmé/faux positif) pour calibration.
- Règles de détection étendues : cascades excessives (§2.1), administrateurs récurrents à risque (§2.2), transferts suspects sans enrichissement externe encore (§2.4 partiel).
- **Bascule de mode** Investigation rapide ↔ Audit approfondi.
- **Comparaison temporelle** de structures (diff de graphe entre deux dates).
- **Recherche inversée** par personne (profil agrégé multi-entités).
- API publique en lecture (recherche, fiche, graphe) pour intégrations cabinet — première itération API-first concrète.
- Résolution d'identité probabiliste (scoring Jaro-Winkler + phonétique + recoupement d'adresse/mandat), avec validation manuelle des fusions.

**Non-fonctionnel**
- SSO SAML/OIDC pour cabinets.
- Filigrane et traçabilité de source sur chaque export de rapport.
- Amélioration de performance : pré-calcul des scores à l'ingestion, cache de sous-graphes.

## V2 — « Réseau et proactivité » (cible : +6-9 mois après V1)

Objectif : passer de l'outil réactif (je cherche, j'analyse) à l'outil proactif (l'outil me signale), et enrichir avec les sources complémentaires qui corroborent les stratagèmes de dissimulation d'actifs.

**Fonctionnel**
- **Sources complémentaires intégrées** : RDPRM (sûretés), registre foncier (transferts immobiliers), BSF (procédures d'insolvabilité), Corporations Canada (entités fédérales liées) — enrichissement des red flags §2.4 avec preuve corroborante réelle.
- **Alertes et surveillance continue** (entité, personne, dossier), notifications courriel/webhook.
- **Tableaux de bord personnalisés par persona** (syndic, CPA, avocat, conformité) avec widgets dédiés.
- Détection de contrôle de fait (au-delà du % déclaré) pour affiner l'UBO.
- Détection d'indices de structures offshore liées au Québec (croisement avec registres complémentaires type OpenCorporates où légalement accessible).
- API en écriture limitée (annotations, dossiers) pour intégration profonde avec les outils de tenue de dossiers des cabinets.
- Calibration assistée des seuils de red flags par cabinet (auto-ajustement suggéré à partir des retours confirmé/faux positif accumulés — reste transparent, pas de boîte noire).
- Export de données brutes structuré (CSV/JSON/GraphML) pour analyse externe avancée.

**Non-fonctionnel**
- Scalabilité multi-cabinet à grande échelle (isolation stricte, montée en charge horizontale validée en charge réelle).
- Programme de calibration formel avec panel d'experts pilotes (mesure du taux de faux positifs par règle, objectif <20 % sur les flags « élevé »).

## Ce qui reste volontairement hors roadmap V2 (à réévaluer ensuite)

- Détection assistée par apprentissage automatique non supervisé (clustering de comportements suspects) — écartée tant que la transparence/explicabilité totale n'est pas démontrée pour un usage probant en cour.
- Intégration de données internationales hors Canada à grande échelle (au-delà de corroboration ponctuelle) — question de fiabilité/légalité des sources à trancher séparément.
- Application mobile dédiée — l'usage professionnel cible reste majoritairement desktop/portable pour ce type de travail analytique.
