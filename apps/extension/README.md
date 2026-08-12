# AudiTREQ — extension de capture assistée

Structure la fiche du registre **que vous avez ouverte** et l'envoie à votre instance locale d'AudiTREQ.

L'extension n'effectue aucune recherche à votre place, n'ouvre aucun onglet, ne suit aucun lien et ne contacte aucun serveur tiers. Elle s'exécute uniquement lorsque vous cliquez sur son bouton. Conception détaillée : [`docs/auditreq/08-capture-assistee.md`](../../docs/auditreq/08-capture-assistee.md).

## Installation (Chrome, Edge, Brave)

1. Lancez votre instance : `npm run api` (l'extension lui parle sur `http://localhost:3001`).
2. Ouvrez `chrome://extensions`.
3. Activez le **mode développeur** (coin supérieur droit).
4. **Charger l'extension non empaquetée** → sélectionnez ce répertoire (`apps/extension`).

## Utilisation

1. Ouvrez la fiche d'une entreprise au registre, comme vous le feriez normalement.
2. Cliquez sur l'icône AudiTREQ, choisissez le dossier, puis **Capturer cette fiche**.
3. Dans AudiTREQ, écran **Captures** : relisez ce qui est signalé, puis validez ou rejetez.

Rien n'entre dans votre graphe avant cette validation.

## Fichiers

| Fichier | Rôle |
|---|---|
| `manifest.json` | Permissions minimales : `activeTab`, `scripting`, `storage` |
| `extraction.js` | Injecté à la demande ; traduit le DOM en structure neutre |
| `popup.js` / `popup.html` | Fenêtre de confirmation et envoi vers l'instance locale |

L'interprétation (reconnaître un administrateur, lire un pourcentage) n'est pas ici : elle est dans `packages/capture`, testée hors navigateur.
