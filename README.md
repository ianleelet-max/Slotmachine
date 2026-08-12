# VéloceREQ

Système d'intelligence d'audit corporatif bâti sur le Registre des entreprises du Québec (REQ) : reconstitution de l'arbre de propriété et de contrôle, calcul du bénéficiaire ultime, détection automatisée de stratagèmes de dissimulation d'actifs, et traçabilité de chaque affirmation jusqu'à son avis REQ source.

La conception produit complète — vision, architecture, parcours utilisateurs, algorithmes, modèle de données, roadmap, recommandations UX — se trouve dans [`docs/velocereq/`](./docs/velocereq/).

## État d'avancement

Le MVP décrit dans la [roadmap](./docs/velocereq/05-roadmap-mvp-v1-v2.md) est amorcé :

| Livrable | État |
|---|---|
| Moteur d'analyse (UBO, cycles, 8 règles de détection, scoring) | Implémenté et testé (45 tests) |
| Recherche multi-critères avec similarité orthographique | Implémentée |
| Schéma PostgreSQL et jeu de données de démonstration | Implémentés |
| API de consultation (recherche, fiche, graphe, UBO, chronologie, signaux) | Implémentée |
| Interface web (tableau de bord, recherche, fiche, graphe, chronologie, UBO, signaux) | Implémentée |
| Dossiers d'audit, annotations, génération de rapports | Prévu en V1 |
| Sources complémentaires (RDPRM, foncier, BSF), alertes | Prévu en V2 |

> Les données présentes sont **entièrement fictives**. Aucune connexion au REQ réel n'est établie : le raccordement aux données officielles est un chantier à part entière (voir [architecture, §2.1](./docs/velocereq/01-architecture-fonctionnelle.md)).

## Structure

```
packages/core/   Moteur d'analyse — TypeScript pur, sans dépendance, testé
packages/api/    API Fastify + PostgreSQL
apps/web/        Interface React + Vite
db/              Schéma SQL
docs/velocereq/  Conception produit
```

Le moteur (`packages/core`) est une fonction pure du graphe corporatif : il ne connaît ni la base de données, ni le réseau. C'est ce qui permet de le tester exhaustivement et de rejouer une analyse sur un état historique.

## Démarrage

Prérequis : Node 22+, PostgreSQL 16+.

```bash
npm install

# Base de données
createdb velocereq
export DATABASE_URL="postgres://$USER@localhost/velocereq"
psql "$DATABASE_URL" -f db/schema.sql
npm run seed --workspace=@velocereq/api   # charge le jeu de démonstration et lance l'analyse

# API (port 3001)
npm run api

# Interface (port 5173, proxifie /api vers 3001)
npm run web
```

Tests du moteur d'analyse :

```bash
npm test
```

## Ce que fait le jeu de démonstration

Le montage fictif chargé par le seed exerce chaque règle de détection :

- un **cycle de détention** entre trois sociétés, qui rend le bénéficiaire ultime indéterminable sur une branche ;
- un **transfert de 65 % des actions 47 jours avant** la radiation d'une société liée ;
- une **dissolution suivie 81 jours plus tard** d'une reconstitution partageant administrateurs, adresse et secteur ;
- une **grappe de quatre sociétés** à une même adresse, réunies par un administrateur sans participation déclarée et aux mandats courts ;
- une **cascade de quatre sociétés interposées** au-dessus d'un actif immobilier.

Chercher « 9284-1057 » ou « Lavalée » (avec la faute d'orthographe) permet d'entrer dans la structure.

## Principes tenus dans le code

- **Aucune relation sans source.** Toute arête du graphe porte l'identifiant de l'avis REQ qui l'atteste, et l'interface l'affiche.
- **Aucun score sans décomposition.** Le score de risque est toujours accompagné de la contribution de chaque règle et de l'explication de chaque signal.
- **Les angles morts sont montrés, pas comblés.** Quand le registre ne permet pas d'établir le contrôle réel — capital partiellement déclaré, cycle, administrateur unique sans détention — le calcul le dit explicitement plutôt que de conclure.
- **Aucune fusion d'identité automatique.** Deux graphies proches restent deux fiches distinctes tant qu'un humain n'a pas tranché.
- **Disposition de graphe déterministe.** Deux consultations du même dossier produisent la même image, condition pour qu'une capture puisse être versée à un rapport.
