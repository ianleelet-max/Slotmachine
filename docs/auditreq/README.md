# AudiTREQ — Conception produit

**AudiTREQ** est un système d'intelligence d'audit corporatif bâti sur le Registre des entreprises du Québec (REQ). Il transforme une consultation fiche-par-fiche, manuelle et fragmentée, en cartographie relationnelle instantanée, détection automatisée de stratagèmes de dissimulation d'actifs, et rapports d'audit opposables.

## Sommaire des livrables

| Document | Contenu |
|---|---|
| [00 — Vision produit](./00-vision-produit.md) | Problème, proposition de valeur, différenciateur, personas, cadre légal (LPLE, Loi 25), critères de succès |
| [01 — Architecture fonctionnelle](./01-architecture-fonctionnelle.md) | Vue d'ensemble système, sources de données, couches (ingestion, cœur, API, client), stack technique indicative, scalabilité |
| [02 — Parcours utilisateurs](./02-parcours-utilisateurs.md) | 4 user flows prioritaires (investigation rapide, audit approfondi, recherche inversée, surveillance) + tableaux de bord par persona |
| [03 — Algorithmes de détection](./03-algorithmes-detection.md) | Calcul UBO, bibliothèque de red flags, scoring composite, résolution d'identité, comparaison temporelle |
| [04 — Modèle de données](./04-modele-donnees.md) | Diagramme entité-relation complet (Mermaid), notes de conception, mapping vers la base de graphe |
| [05 — Roadmap MVP → V1 → V2](./05-roadmap-mvp-v1-v2.md) | Priorisation par phase avec justification |
| [06 — Recommandations UX/UI](./06-recommandations-ux-ui.md) | Principes directeurs, système visuel (dark mode), composants clés, anti-patterns |
| [07 — Accès aux données du REQ](./07-acces-donnees-req.md) | Voies d'accès réelles, contenu exact du jeu ouvert, contraintes de licence, et ce que cela impose au produit |

Une maquette visuelle interactive des écrans clés (tableau de bord, recherche, fiche entité, graphe relationnel, timeline, générateur de rapport) est fournie dans [`maquettes.html`](./maquettes.html) — ouvrir le fichier dans un navigateur pour naviguer entre les écrans.

## Résumé exécutif

- **Problème** : reconstituer une structure de propriété corporative au Québec exige aujourd'hui des heures de recherche manuelle, fiche par fiche, sans corrélation ni détection d'anomalies.
- **Solution** : un graphe de connaissance corporatif interrogeable, avec un moteur de règles de détection (cascades, prête-noms probables, cycles de détention, dissolutions-reconstitutions rapides, adresses partagées massives, transferts suspects avant événements critiques), et un générateur de rapports traçables jusqu'à l'avis REQ source.
- **Utilisateurs cibles** : CPA/comptables, syndics de faillite, avocats (sociétés, insolvabilité, litige), enquêteurs financiers/conformité, professionnels M&A.
- **Architecture** : base de graphe (traversées de contrôle/cascades) + base relationnelle (historique versionné, dossiers, conformité), API-first, hébergement canadien, sécurité et journalisation d'audit natives.
- **Priorisation** : le MVP livre déjà la promesse centrale (recherche → arbre de propriété complet) sur données REQ pures ; V1 ajoute dossiers/collaboration/rapport opposable ; V2 ajoute sources complémentaires (RDPRM, foncier, BSF), alertes et proactivité.
