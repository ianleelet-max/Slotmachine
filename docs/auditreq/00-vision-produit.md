# AudiTREQ — Vision produit

> Nom du produit : **AudiTREQ**
> Positionnement : le premier système d'intelligence d'audit corporatif bâti sur le Registre des entreprises du Québec (REQ).

## 1. Le problème

Le REQ, tel qu'exposé aujourd'hui (Registraire des entreprises, ICRIS, avis publics), n'offre qu'une **consultation fiche par fiche**. Pour reconstituer une structure de propriété réelle — qui contrôle qui, qui a signé quoi, qui a transféré quoi à qui et quand — un professionnel doit :

1. Chercher une entreprise par nom ou NEQ.
2. Ouvrir sa fiche, noter administrateurs et actionnaires (quand disponibles).
3. Rechercher chaque personne/entité citée, une par une.
4. Reconstituer manuellement l'arbre dans Excel ou sur papier.
5. Recommencer pour chaque modification historique, en cherchant les avis de mise à jour un par un.
6. Croiser à la main avec des adresses, des dates de constitution/dissolution, des noms d'ex-administrateurs.

Ce travail prend des heures, parfois des jours, pour une structure de taille moyenne (10-30 entités liées) — et davantage pour des montages en cascade ou des structures utilisées pour diluer la traçabilité des actifs. Aucun outil existant ne fait de **corrélation automatisée** ni de **détection de patrons suspects** à partir des données publiques québécoises.

## 2. La proposition de valeur

AudiTREQ transforme le REQ, statique et fragmenté, en un **graphe de connaissance corporatif vivant**, interrogeable et analysable :

- **De la fiche à l'arbre** : une recherche donne instantanément la structure complète de propriété/contrôle, pas seulement l'entité recherchée.
- **De la lecture à la détection** : un moteur de règles + scoring signale automatiquement les patrons associés à la dissimulation de valeur (cascades, prête-noms probables, dissolutions-reconstitutions, adresses partagées massives).
- **De la note manuelle au rapport opposable** : chaque analyse peut être figée, horodatée, sourcée (avec référence exacte à l'avis REQ ou au document source) et exportée en rapport professionnel.
- **De l'individuel au collaboratif** : dossiers d'investigation partagés en équipe, avec traçabilité complète (qui a vu quoi, quand, quelle conclusion).

## 3. Différenciateur

| Axe | REQ / ICRIS actuel | AudiTREQ |
|---|---|---|
| Unité de consultation | Une fiche entreprise | Un graphe de relations multi-entités |
| Historique | Avis dispersés, non reliés | Timeline unifiée et rejouable |
| Détection d'anomalies | Aucune | Moteur de red flags + score de risque |
| Bénéficiaire effectif | Non calculé | Calculé selon règles LPLE (voir §5) |
| Sortie | Impression de fiche | Rapport d'audit structuré et traçable |
| Collaboration | Aucune | Dossiers, annotations, historique d'équipe |
| Accès programmatique | Aucun (interface web seulement) | API-first |

AudiTREQ ne remplace pas le REQ comme source de vérité légale — il **augmente** cette source avec de l'intelligence relationnelle, tout en conservant une traçabilité complète vers le document officiel d'origine (principe de non-altération de la preuve).

## 4. Utilisateurs cibles et jobs-to-be-done

| Persona | Job principal | Fréquence | Mode dominant |
|---|---|---|---|
| **CPA / comptable (audit, JV, évaluation)** | Vérifier l'exactitude et l'exhaustivité d'une structure déclarée par un client | Récurrent, par mandat | Audit approfondi |
| **Syndic de faillite / séquestre** | Retracer les actifs transférés avant faillite, identifier les entités liées au failli | Urgent, sous délai légal | Investigation rapide → Audit approfondi |
| **Avocat (sociétés, insolvabilité, litige)** | Établir la preuve d'un lien de contrôle ou d'un stratagème pour une procédure | Ponctuel, orienté preuve | Audit approfondi, rapport opposable |
| **Enquêteur financier / fiscaliste / conformité** | Surveiller un réseau d'entités et détecter des signaux faibles en continu | Continu, proactif | Investigation rapide, alertes |
| **Professionnel M&A / due diligence** | Cartographier la cible et ses filiales/liens avant transaction | Ponctuel, sous délai serré | Investigation rapide → rapport de synthèse |

## 5. Cadre légal et principes de conception

- **LPLE (Loi sur la publicité légale des entreprises)** : source des données de base (NEQ, administrateurs, actionnaires ≥ 10 %, bénéficiaires ultimes depuis la réforme de mars 2023 exigeant la déclaration des « personnes physiques ayant un pouvoir de contrôle »).
- **Loi 25 (protection des renseignements personnels, Québec) et LPRPDE (fédérale)** : les données du REQ concernant des dirigeants/administrateurs sont publiques par nature légale, mais leur **agrégation** (profil cross-entreprises d'une personne) crée un nouveau renseignement personnel dérivé — traité comme sensible, avec journalisation d'accès, finalité documentée par dossier, et purge des recherches sur demande.
- **Non-altération de la preuve** : toute donnée affichée référence son avis REQ source (numéro, date de publication) ; AudiTREQ ne modifie ni n'interprète silencieusement — il annote, avec la donnée brute toujours accessible.
- **Usage professionnel encadré** : accès réservé à des professionnels identifiés (CPA, avocats, syndics licenciés OSB, etc.), avec conditions d'utilisation limitant l'usage à des fins légitimes (audit, conformité, litige, diligence) — pas de surveillance de masse ou de profilage sans finalité déclarée.

## 6. Comment on mesure le succès

- **Temps de reconstitution d'une structure de 20 entités** : de plusieurs heures (manuel) à < 2 minutes.
- **Taux de détection de structures en cascade ≥ 3 niveaux** : 100 % (mécanique, pas heuristique — c'est un graphe).
- **Taux de faux positifs sur les red flags de niveau « élevé »** validé par des experts en pilote : < 20 % après calibration.
- **Adoption** : un rapport AudiTREQ cité comme pièce dans au moins une procédure judiciaire ou un dossier de faillite en première année (preuve d'opposabilité réelle).
