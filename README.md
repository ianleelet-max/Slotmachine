# AudiTREQ

Système d'intelligence d'audit corporatif bâti sur le Registre des entreprises du Québec (REQ) : reconstitution de l'arbre de propriété et de contrôle, calcul du bénéficiaire ultime, détection automatisée de stratagèmes de dissimulation d'actifs, et traçabilité de chaque affirmation jusqu'à son avis REQ source.

La conception produit complète — vision, architecture, parcours utilisateurs, algorithmes, modèle de données, roadmap, recommandations UX — se trouve dans [`docs/auditreq/`](./docs/auditreq/).

## État d'avancement

Le MVP et le cœur de la V1 décrits dans la [roadmap](./docs/auditreq/05-roadmap-mvp-v1-v2.md) sont en place :

| Livrable | État |
|---|---|
| Moteur d'analyse (UBO, cycles, 9 règles de détection, scoring) | Implémenté et testé |
| Recherche multi-critères avec similarité orthographique | Implémentée |
| Schéma PostgreSQL et jeu de données de démonstration | Implémentés |
| API (recherche, fiche, graphe, UBO, chronologie, signaux, dossiers, rapport) | Implémentée |
| Interface web (tableau de bord, recherche, fiche, graphe, chronologie, UBO, signaux) | Implémentée |
| Dossiers d'audit, annotations horodatées, journal d'accès | Implémentés |
| Comparaison de structures entre deux dates | Implémentée |
| Rapport d'audit structuré et sourcé, imprimable en PDF | Implémenté |
| Ingestion des données ouvertes du REQ (5 fichiers, provenance, filiations) | Implémentée, validée contre la spécification |
| Capture assistée du registre (extension + validation humaine) | Implémentée, à confronter à la vraie page |
| Authentification, sessions, protection des routes | Implémentée |
| Partage de dossier intra-cabinet, SSO, double facteur | À faire |
| Sources complémentaires (RDPRM, foncier, BSF), alertes | Prévu en V2 |

> **Avant d'exposer quoi que ce soit** : l'API n'écoute que sur `127.0.0.1` par défaut, et une instance ne cloisonne pas encore les dossiers par cabinet — donc une instance par cabinet. Guide de déploiement restreint et protocole d'essai : **[DEPLOIEMENT.md](./DEPLOIEMENT.md)**.
>
> Les données présentes sont **entièrement fictives**. Aucune connexion au REQ réel n'est établie.
>
> Le raccordement aux données officielles est contraint : le jeu de données ouvertes du REQ **ne contient aucune personne physique** (ni administrateur, ni actionnaire, ni bénéficiaire ultime) et sa licence interdit l'usage commercial. Les personnes ne sont accessibles que par le service de consultation du registre, dont l'extraction automatisée suppose une entente avec le Registraire. Analyse complète : [07 — Accès aux données du REQ](./docs/auditreq/07-acces-donnees-req.md).

## Structure

```
packages/core/       Moteur d'analyse — TypeScript pur, sans dépendance, testé
packages/ingestion/  Lecture des données ouvertes du Registraire
packages/api/        API Fastify + PostgreSQL
apps/web/            Interface React + Vite
db/                  Schéma SQL
docs/auditreq/      Conception produit
```

Le moteur (`packages/core`) est une fonction pure du graphe corporatif : il ne connaît ni la base de données, ni le réseau. C'est ce qui permet de le tester exhaustivement et de rejouer une analyse sur un état historique.

## Démarrage

Prérequis : Node 22+, PostgreSQL 16+ (ou Docker). Guide détaillé, par système : **[DEMARRAGE.md](./DEMARRAGE.md)**.

```bash
npm install
npm test                 # 85 tests, sans base de données

export DATABASE_URL="postgres://$USER@localhost/auditreq"
npm run db:init          # crée la base et le schéma, sans exiger createdb ni psql
npm run seed             # jeu de démonstration + analyse (affiche le mot de passe du compte)

npm run api              # port 3001
npm run web              # port 5173, puis http://localhost:5173
```

Avec Docker plutôt qu'une installation de PostgreSQL :

```bash
docker compose up -d
export DATABASE_URL="postgres://auditreq:auditreq@localhost:5433/auditreq"
```

## Ingérer les données ouvertes du REQ

Le jeu de données se télécharge manuellement depuis [Données Québec](https://www.donneesquebec.ca/recherche/dataset/registre-des-entreprises) — le service du Registraire filtre les requêtes automatisées, et la licence CC BY-NC-SA engage l'exploitant. Une fois l'archive décompressée :

```bash
npm run ingerer -- /chemin/vers/archive 2026-08-02
```

La commande charge, analyse et rend compte : entités, adresses, filiations, événements reconstitués, lignes écartées avec leur motif, et signaux détectés. Elle n'écrit rien en base.

**Ce que cette source permet et ne permet pas.** Le jeu ouvert ne contient aucune personne physique. Cinq règles y fonctionnent — reconstitution après radiation, changement d'identité avant un événement critique, grappes d'adresses, transferts avant événement critique, et le contrôle exercé hors du conseil d'administration. Quatre restent inactives faute de personnes : bénéficiaire ultime, cycles de détention, cascades, prête-noms. L'interface affiche cette limite en permanence plutôt que de laisser lire une absence de signal comme un résultat d'analyse.

## Compléter le graphe par capture assistée

Les données ouvertes ne contiennent aucune personne physique. L'[extension](./apps/extension/README.md) comble ce manque **sans jamais consulter le registre à votre place** : vous ouvrez la fiche, elle structure ce qui est affiché, et rien n'entre dans le graphe avant votre validation dans l'écran **Captures**.

Chaque champ capturé porte le libellé de la page dont il provient, un niveau de confiance et l'extrait brut correspondant. Les participations exprimées par tranche (« 50 % ou plus ») sont marquées comme approximatives plutôt que présentées comme des chiffres exacts. Conception : [`docs/auditreq/08-capture-assistee.md`](./docs/auditreq/08-capture-assistee.md).

## Le rapport d'audit

Depuis un dossier, « Ouvrir le rapport d'audit » produit un document structuré : résumé exécutif, limites explicites du rapport, structure de propriété entité par entité, chronologie, signaux détectés, observations du professionnel, et **annexe listant tous les avis du registre cités**. Chaque énoncé factuel se rattache à l'un de ces avis.

Le rapport est du HTML mis en page pour l'impression : le PDF s'obtient par la commande d'impression du navigateur. Un export PDF côté serveur, avec filigrane et signature, reste à faire pour la diffusion hors cabinet.

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
- **Traçabilité sans exception.** Recherches, consultations, ajouts au dossier et exports sont inscrits au journal d'accès. La table refuse les `UPDATE` et les `DELETE` par une règle Postgres : le journal ne peut pas être réécrit après coup, y compris par un administrateur.
- **Aucun dossier sans finalité déclarée.** L'ouverture d'un dossier exige de documenter la base légale de la consultation, reprise au journal et en tête du rapport.
- **L'absence de signal n'est pas un quitus.** Un rapport sans détection le dit explicitement plutôt que de laisser lire une attestation de conformité.
