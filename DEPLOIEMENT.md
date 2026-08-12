# Déploiement restreint et essais

Ce guide vise un usage **privé et confidentiel** : un poste ou un petit groupe de professionnels, sans exposition publique, avec des dossiers d'audit qui relèvent du secret professionnel.

Il ne traite pas d'un déploiement grand public : les fonctions de partage entre cabinets, le SSO et l'authentification à deux facteurs n'existent pas encore.

## 1. Le principe : ne rien exposer

Par défaut, **rien ne doit être joignable depuis l'internet**. Trois configurations, de la plus sûre à la plus souple :

| Configuration | Pour qui | Exposition |
|---|---|---|
| **A. Poste unique** | Un professionnel seul | Aucune : tout écoute sur `127.0.0.1` |
| **B. Réseau privé chiffré** | Petite équipe | Aucune : accès par Tailscale ou WireGuard |
| **C. Serveur du cabinet** | Équipe avec informatique interne | Réseau interne seulement, derrière TLS |

**Ce qu'il faut éviter** : ouvrir un port sur la box, un tunnel public (ngrok et équivalents), ou un hébergement avec nom de domaine public. Un nom de domaine se retrouve dans les journaux de transparence des certificats, qui sont publics et indexés — la discrétion serait perdue dès l'émission du certificat.

### A. Poste unique

C'est le cas le plus simple et le plus sûr. Les services n'écoutent que sur la boucle locale :

```bash
export HOTE=127.0.0.1
npm run api      # n'accepte que les connexions de votre machine
npm run web
```

> Le mode développement de Vite écoute sur toutes les interfaces si on le lui demande. Ne passez pas `--host` en usage réel.

### B. Réseau privé chiffré (recommandé pour une équipe)

[Tailscale](https://tailscale.com) crée un réseau privé chiffré entre vos appareils, sans ouvrir aucun port ni publier de nom de domaine.

```bash
# Sur la machine qui héberge
tailscale up
tailscale ip -4          # donne une adresse en 100.x.y.z, joignable par vos appareils seulement
```

Faites écouter l'API sur cette adresse, jamais sur `0.0.0.0`.

### C. Serveur du cabinet

Derrière un reverse proxy interne (nginx, Caddy) avec un certificat interne ou auto-signé. Dans ce cas :

```bash
export COOKIE_SECURISE=true   # le témoin de session n'est plus transmis en clair
```

## 2. Ce qui est déjà en place

| Protection | État |
|---|---|
| Mots de passe hachés (scrypt, sel aléatoire, coût mémoire) | Implémenté |
| Jetons de session **hachés en base** — un vol de table ne donne pas de session | Implémenté |
| Témoin `httpOnly`, `sameSite: strict`, `secure` en production | Implémenté |
| Toutes les routes protégées sauf `/api/sante` et la connexion | Implémenté |
| Blocage après 5 tentatives, 15 minutes | Implémenté |
| Message identique pour mot de passe erroné et compte inexistant | Implémenté |
| Journal d'accès en ajout seul, refusant `UPDATE` et `DELETE` | Implémenté |
| Aucun mot de passe par défaut dans le code | Implémenté |

## 3. Ce qui manque, et ce que ça implique

Soyons précis, parce que la différence compte pour décider ce que vous exposez :

- **Pas d'authentification à deux facteurs.** Un mot de passe volé suffit. Choisissez-en un long et unique, conservé dans un gestionnaire.
- **Pas de cloisonnement par cabinet appliqué aux requêtes.** Le modèle de données le prévoit, mais toute session authentifiée voit tous les dossiers de l'instance. **Conséquence : une instance par cabinet, pas de mutualisation.**
- **Pas de chiffrement applicatif de la base.** À compenser par le chiffrement du disque (§4).
- **Pas de rotation des sessions à l'élévation de privilèges**, ni de gestion fine des rôles à l'exécution.

## 4. Chiffrement au repos

La base contient des noms, des adresses et des liens entre personnes — des renseignements personnels au sens de la Loi 25.

- **Windows** : BitLocker sur le disque système.
- **macOS** : FileVault.
- **Linux** : LUKS sur la partition contenant `/var/lib/postgresql`.

Le chiffrement de disque protège une machine éteinte ou volée. Il ne protège pas une machine allumée et déverrouillée : la session utilisateur reste la vraie frontière.

## 5. Sauvegardes

```bash
pg_dump "$DATABASE_URL" | age -r <votre-clé-publique> > auditreq-$(date +%F).sql.age
```

Une sauvegarde non chiffrée d'une base d'audit est le maillon faible classique : elle finit sur un disque externe ou un nuage grand public. Chiffrez-la à la source, et conservez la clé ailleurs que la sauvegarde.

## 6. Secrets

Aucun secret ne va dans le dépôt. Créez un fichier `.env` **hors du dépôt** (il est déjà dans `.gitignore`) :

```bash
DATABASE_URL="postgres://auditreq:MOT_DE_PASSE@localhost/auditreq"
SECRET_TEMOIN="<64 caractères aléatoires>"
COOKIE_SECURISE=true          # dès que l'accès passe par TLS
MOT_DE_PASSE_INITIAL="<mot de passe fort, pour le premier compte seulement>"
```

Engendrer un secret : `openssl rand -hex 32`.

## 7. Protocole d'essai

L'ordre compte : chaque étape ne commence qu'une fois la précédente concluante.

### Étape 1 — Données fictives (aucun risque)

Le jeu de démonstration exerce toutes les règles. Vérifiez que l'outil dit des choses justes sur un montage dont vous connaissez déjà la réponse.

### Étape 2 — Données ouvertes du REQ (aucune donnée personnelle)

```bash
npm run ingerer -- /chemin/vers/archive 2026-08-02
```

Rappel : usage **non commercial** (licence CC BY-NC-SA), et aucune personne physique dans ce jeu.

### Étape 3 — Un seul dossier réel, choisi

Prenez un dossier **déjà clos**, dont vous connaissez la structure réelle. C'est le seul moyen de mesurer les faux positifs et les faux négatifs : sur un dossier en cours, vous ne pourrez pas distinguer une détection juste d'une coïncidence.

Notez, pour chaque signal : confirmé, faux positif, ou hors sujet. Ces retours sont ce qui permettra de calibrer les seuils.

### Étape 4 — Capture assistée, quelques fiches

Ouvrez trois ou quatre fiches que vous auriez consultées de toute façon. Comparez ce que le parseur a lu avec ce que la page affiche, **champ par champ**. C'est le premier contact du parseur avec la vraie mise en page : attendez-vous à des écarts, ils sont signalés plutôt que silencieux.

### Étape 5 — Un rapport complet

Générez-le et relisez-le comme si vous deviez le déposer. La question à se poser : *est-ce que je signerais ce document ?* Tout ce qui vous ferait hésiter est un défaut à corriger avant d'aller plus loin.

## 8. Obligations qui ne disparaissent pas parce que l'usage est privé

- **Loi 25** : vous devenez responsable d'un fichier de renseignements personnels. Finalité déclarée par dossier, durée de conservation, et capacité à répondre à une demande d'accès ou de rectification. L'outil fournit la finalité et le journal ; la politique de conservation reste à écrire.
- **Secret professionnel** : les dossiers d'audit relèvent de vos obligations déontologiques. Une instance partagée entre cabinets serait, en l'état, une faute.
- **Licence des données ouvertes** : CC BY-NC-SA, donc **non commercial**. Un essai interne entre dans ce cadre ; une facturation à des clients, non — cela demande une entente avec le Registraire ([document 07](./docs/auditreq/07-acces-donnees-req.md)).
- **Conditions du service de consultation** : la capture assistée a été conçue pour rester du côté de la consultation légitime ([document 08](./docs/auditreq/08-capture-assistee.md)). Cela ne remplace pas une confirmation du Registraire, qui reste la démarche à mener.

## 9. Avant d'ouvrir l'accès à un collègue

1. Un compte par personne — jamais de compte partagé, sinon le journal ne nomme plus personne.
2. Vérifiez que rien n'écoute sur `0.0.0.0` : `ss -lptn` (Linux) ou `netstat -ano` (Windows).
3. Vérifiez que le journal d'accès enregistre bien les gestes de chacun.
4. Écrivez la politique de conservation et de purge, même brièvement.
