# ☁️ Nextcloud Stack — Guide de déploiement Docker

Ce dossier contient la configuration complète et prête à l'emploi pour déployer un serveur **Nextcloud** conteneurisé avec haute performance et persistance des données.

---

## 📦 Architecture de la stack

| Service | Image | Description |
| :--- | :--- | :--- |
| **`app`** | `nextcloud:apache` | Serveur Nextcloud (PHP 8.2+ / Apache) avec limites de mémoire et upload optimisées |
| **`db`** | `mariadb:10.11` | Base de données relationnelle configurée en `utf8mb4_unicode_ci` |
| **`redis`** | `redis:alpine` | Cache en mémoire pour le verrouillage des fichiers et l'accélération des requêtes |
| **`cron`** | `nextcloud:apache` | Exécuteur en tâche de fond pour le nettoyage et l'indexation périodique (`cron.sh`) |

---

## 🚀 Démarrage rapide

### 1. Prérequis
- **Docker** et **Docker Compose** (ou [Docker Desktop pour Windows](https://www.docker.com/products/docker-desktop/)).

### 2. Personnaliser les mots de passe
Éditez le fichier [`.env`](file:///c:/Users/ianle/Documents/AudiTREQ/apps/borne/src/nextcloud/.env) pour définir des mots de passe sécurisés :
```env
NEXTCLOUD_PORT=8080
MYSQL_PASSWORD=VotreMotDePasseDbSecret
MYSQL_ROOT_PASSWORD=VotreMotDePasseRootSecret
NEXTCLOUD_ADMIN_USER=admin
NEXTCLOUD_ADMIN_PASSWORD=VotreMotDePasseAdminSecret
NEXTCLOUD_TRUSTED_DOMAINS=localhost 127.0.0.1 votre-nom-de-domaine.com
```

### 3. Lancer la stack
Dans PowerShell ou un terminal, naviguez dans ce dossier et exécutez :
```powershell
docker compose up -d
```

### 4. Accéder à Nextcloud
Une fois les conteneurs démarrés :
- Ouvrez votre navigateur sur : **[http://localhost:8080](http://localhost:8080)**
- Connectez-vous avec les identifiants configurés dans votre fichier `.env`.

---

## 🛠️ Commandes utiles

### Voir le statut des conteneurs
```powershell
docker compose ps
```

### Consulter les journaux en direct
```powershell
docker compose logs -f app
```

### Exécuter une commande OCC (Nextcloud CLI)
```powershell
docker compose exec --user www-data app php occ status
```

Exemple pour réparer ou mettre à jour les index :
```powershell
docker compose exec --user www-data app php occ db:add-missing-indices
```

### Arrêter ou redémarrer la stack
```powershell
# Arrêter sans supprimer les données
docker compose stop

# Redémarrer
docker compose start

# Tout arrêter et détruire les conteneurs (les volumes persistants restent intacts)
docker compose down
```

---

## 💾 Persistance des données

Toutes les données sont stockées dans des volumes Docker persistants :
- `nextcloud_user_data` : Fichiers stockés par les utilisateurs
- `nextcloud_app_data` : Fichiers de configuration et applications Nextcloud
- `nextcloud_mariadb_data` : Données de la base MariaDB
