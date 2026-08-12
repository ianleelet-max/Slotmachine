# Démarrer AudiTREQ sur votre poste

Compter **20 à 30 minutes** la première fois, dont l'essentiel en téléchargements. Rien à configurer ensuite : le projet ne dépend d'aucun service en ligne, d'aucune clé d'API et d'aucun compte.

## 1. Ce qu'il faut installer

| Outil | Version | Pourquoi |
|---|---|---|
| [Node.js](https://nodejs.org) | **22 ou plus** | Fait tourner le moteur, l'API et l'interface |
| [Git](https://git-scm.com) | quelconque | Récupérer le code |
| PostgreSQL | **16 ou plus** | Stocke les dossiers, annotations et le journal d'accès |

Pour PostgreSQL, deux chemins — prenez celui qui vous convient :

- **Installation classique** : [postgresql.org/download](https://www.postgresql.org/download/). Sous Windows, l'installateur propose pgAdmin, pratique pour inspecter la base.
- **Docker**, si vous préférez ne rien installer durablement : un fichier `docker-compose.yml` est fourni (voir §3b).

Vérifiez vos versions :

```bash
node --version    # doit afficher v22 ou plus
git --version
```

## 2. Récupérer le code

```bash
git clone https://github.com/ianleelet-max/AudiTREQ.git
cd AudiTREQ
git checkout claude/velocereq-audit-req-3j6rq6
npm install
```

> Le dépôt s'appelle encore `Slotmachine` tant qu'il n'a pas été renommé dans ses paramètres GitHub — dans ce cas, remplacez `AudiTREQ.git` par `Slotmachine.git` dans la commande ci-dessus.

Vérifiez tout de suite que le cœur fonctionne, sans base de données :

```bash
npm test
```

Vous devez voir passer **85 tests** (61 pour le moteur d'analyse, 24 pour l'ingestion). Si c'est le cas, la partie la plus substantielle du projet tourne déjà chez vous.

## 3a. La base de données — installation classique

Créez une base vide, puis chargez le schéma et le jeu de démonstration :

```bash
# macOS / Linux
createdb auditreq
export DATABASE_URL="postgres://$USER@localhost/auditreq"

# Windows (PowerShell) — adaptez l'utilisateur et le mot de passe choisis à l'installation
createdb -U postgres auditreq
$env:DATABASE_URL = "postgres://postgres:VOTRE_MOT_DE_PASSE@localhost/auditreq"
```

Puis, dans les deux cas :

```bash
npm run db:init
npm run seed
```

`db:init` crée les tables sans passer par l'outil `psql` — inutile donc de le chercher dans votre PATH.

## 3b. La base de données — avec Docker

```bash
docker compose up -d
```

Puis :

```bash
# macOS / Linux
export DATABASE_URL="postgres://auditreq:auditreq@localhost:5433/auditreq"

# Windows (PowerShell)
$env:DATABASE_URL = "postgres://auditreq:auditreq@localhost:5433/auditreq"
```

```bash
npm run db:init
npm run seed
```

Le port 5433 est volontaire : il évite tout conflit avec un PostgreSQL déjà présent sur votre machine.

## 4. Lancer l'application

Deux terminaux, chacun avec `DATABASE_URL` défini.

```bash
# Terminal 1 — API sur le port 3001
npm run api

# Terminal 2 — interface sur le port 5173
npm run web
```

Ouvrez **http://localhost:5173**.

## 5. Ce que vous devriez voir

Le tableau de bord affiche 3 dossiers, 9 entités et 15 signaux détectés. Pour parcourir la démonstration :

1. Cherchez `9284-1057` ou `Lavalée` (avec la faute d'orthographe — la recherche par similarité la rattrape).
2. Ouvrez la fiche, puis l'onglet **Graphe** : le cycle de détention apparaît en rouge.
3. Onglet **Bénéficiaires ultimes** : les chaînes de détention sont détaillées, et l'indétermination causée par le cycle est annoncée.
4. **Dossiers** → ouvrez un dossier → **Ouvrir le rapport d'audit**, puis imprimez-le en PDF depuis votre navigateur.

## 6. Ingérer les vraies données du REQ (facultatif)

```bash
npm run ingerer -- /chemin/vers/archive/décompressée 2026-08-02
```

L'archive se télécharge à la main depuis [Données Québec](https://www.donneesquebec.ca/recherche/dataset/registre-des-entreprises). Lisez [`docs/auditreq/07-acces-donnees-req.md`](./docs/auditreq/07-acces-donnees-req.md) avant : ce jeu ne contient **aucune personne physique** et sa licence interdit l'usage commercial.

## 7. Si quelque chose coince

| Symptôme | Cause probable | Correctif |
|---|---|---|
| `ECONNREFUSED ... 5432` | PostgreSQL n'est pas démarré | Démarrez le service, ou `docker compose up -d` |
| `password authentication failed` | Mot de passe absent de `DATABASE_URL` | Reprenez la chaîne de connexion du §3 |
| `database "auditreq" does not exist` | Base non créée | `createdb auditreq`, puis `npm run db:init` |
| `EADDRINUSE ... 3001` | Un serveur tourne déjà | Fermez-le, ou lancez avec `PORT=3002` |
| `Unsupported engine ... node` | Node trop ancien | Installez Node 22 ou plus |
| L'interface affiche « Erreur » partout | L'API n'est pas lancée | Vérifiez le terminal 1 |

Le `DATABASE_URL` défini avec `export` ou `$env:` ne vaut que pour le terminal courant : il faut le redéfinir à chaque nouveau terminal, ou le placer dans votre profil.

## Ce qui ne se transfère pas

Rien d'essentiel — mais pour être précis :

- **Les données sont fictives.** Aucune connexion au REQ réel n'est établie, et le raccordement est contraint (voir le document 07).
- **L'authentification n'existe pas encore.** Toutes les écritures sont attribuées à un utilisateur de démonstration. À n'exposer sur aucun réseau tant que ce point n'est pas traité.
- **Le rapport s'imprime en PDF par le navigateur**, sans filigrane ni signature côté serveur.
