# AudiTREQ — Algorithmes de cartographie et de détection

## 1. Construction du graphe de propriété/contrôle

### 1.1 Modèle de graphe

- **Nœuds** : `Entite` (personne morale), `Personne` (physique), `Adresse`.
- **Arêtes typées** :
  - `ADMINISTRE(depuis, jusqu'à, titre)` — Personne → Entité
  - `DETIENT(pourcentage, depuis, jusqu'à, type_titre)` — Entité|Personne → Entité
  - `A_POUR_ADRESSE(type, depuis, jusqu'à)` — Entité|Personne → Adresse
  - `SUCCEDE_A(type_operation, date)` — Entité → Entité (fusion, scission, continuation)
  - `POSSIBLE_MEME_PERSONNE(score_confiance)` — Personne → Personne (issu de la résolution d'identité, jamais auto-fusionné au-delà d'un seuil)

### 1.2 Calcul du bénéficiaire ultime (UBO)

Algorithme de traversée pondérée, conforme à l'esprit de la réforme LPLE 2023 (seuil de 25 % de contrôle direct ou indirect, ou contrôle de fait) :

```
fonction calculerUBO(entite_racine):
    chemins = []
    parcourir_recursif(entite_racine, chemin_courant=[], produit_pourcentage=1.0,
                        profondeur_max=10, visites={})
        pour chaque arête DETIENT entrante sur le nœud courant:
            nouveau_produit = produit_pourcentage * pourcentage_arête
            si nœud_source est une Personne:
                si nouveau_produit >= seuil_UBO (0.25) OU indice_controle_de_fait:
                    ajouter (Personne, nouveau_produit, chemin_courant) à chemins
            sinon (nœud_source est une Entité):
                si nœud_source déjà dans visites du chemin courant:
                    signaler CYCLE_DETECTE (voir §2.3) et arrêter cette branche
                sinon:
                    parcourir_recursif(nœud_source, chemin_courant + [arête],
                                        nouveau_produit, profondeur_max-1, visites)
    retourner chemins triés par produit_pourcentage décroissant
```

- Le **contrôle de fait** (ex. administrateur unique sans détention majoritaire déclarée, procuration, convention entre actionnaires) est signalé séparément comme *indice de contrôle non capturé par le pourcentage déclaré* — AudiTREQ ne l'invente pas, il **expose l'angle mort** (« aucun actionnaire ≥25 % déclaré, mais X est administrateur unique depuis 8 ans — vérifier convention d'actionnaires »).
- Chaque chemin retourné est affiché à l'utilisateur avec son détail complet (traçabilité du calcul) — jamais un chiffre seul sans le chemin qui le justifie.

## 2. Bibliothèque de règles de détection (red flags)

Chaque règle produit : un **flag typé**, une **sévérité** (info/faible/moyen/élevé), une **explication en langage clair**, et les **entités/relations exactes** qui l'ont déclenchée (jamais un score sans justification consultable).

### 2.1 Structures en cascade excessives
- **Règle** : chaîne de détention Entité→Entité→Entité de profondeur ≥ 4 avant d'atteindre une personne physique, *sans* justification apparente (pas de secteurs où c'est une pratique standard, ex. fonds d'investissement structurés — ceux-ci sont pondérés à la baisse via une liste de formes juridiques « structure connue »).
- **Score** : croît avec la profondeur et avec le nombre de juridictions distinctes traversées (une cascade Québec→Québec→Québec est moins suspecte qu'une cascade incluant des entités extraprovinciales/étrangères en alternance).

### 2.2 Administrateurs/actionnaires récurrents dans des sociétés à risque
- **Règle** : une même personne apparaît comme administrateur dans *N* entités dissoutes/radiées pour non-conformité, ou dans *N* entités elles-mêmes flaguées, au-delà d'un seuil calibrable.
- **Distinction prête-nom potentiel** : personne apparaissant dans plusieurs entités **sans lien professionnel apparent entre elles** (secteurs différents, aucune détention croisée), avec une adresse résidentielle qui ne correspond à aucun établissement d'affaires connu, et un mandat de courte durée récurrent. Combinaison de signaux, jamais un seul signal isolé.

### 2.3 Cycles de détention (auto-détention circulaire)
- **Règle** : détection de cycle dans le graphe orienté `DETIENT` (A détient B détient C détient A) — algorithme de détection de cycles (Tarjan/composantes fortement connexes) appliqué au sous-graphe de détention. Un cycle rend le calcul d'UBO mathématiquement indéterminé — c'est en soi un signal fort et systématiquement remonté en sévérité élevée.

### 2.4 Transferts d'actifs suspects
- **Règle** : combinaison de signaux temporels — transfert de détention ou changement d'administrateur survenant dans une **fenêtre courte avant** un événement critique connu (avis de faillite/proposition BSF, jugement, dépôt de poursuite si intégré, radiation).
- Enrichi si disponible : recoupement avec le RDPRM (nouvelle sûreté) ou le registre foncier (transfert immobilier) dans la même fenêtre.

### 2.5 Dissolutions/reconstitutions rapides
- **Règle** : dissolution d'une entité suivie, dans une fenêtre calibrable (ex. 12-24 mois), de la constitution d'une nouvelle entité partageant ≥2 signaux parmi : mêmes administrateurs, même adresse, nom similaire (distance de Levenshtein faible ou même racine), même secteur déclaré (code NAICS/CAE si disponible).

### 2.6 Adresses partagées massives
- **Règle** : une adresse (souvent un cabinet comptable, un domiciliataire commercial ou une simple boîte postale) héberge un nombre d'entités dépassant un seuil statistique (calibré dynamiquement par écart-type par rapport à la distribution observée, pas un seuil fixe arbitraire — un immeuble à bureaux légitime n'est pas un flag). Le flag ne porte pas sur l'adresse elle-même mais sur **la coprésence anormale d'entités par ailleurs liées entre elles** à cette adresse.

### 2.7 Changements de siège social ou de nom juste avant un événement critique
- **Règle** : changement de nom légal ou de siège social dans une fenêtre courte précédant une dissolution, une faillite ou un litige connu — pattern classique de brouillage de traçabilité.

### 2.7 bis — Contrôle exercé hors du conseil d'administration

- **Règle** : la société déclare une convention unanime des actionnaires **et** le retrait des pouvoirs du conseil d'administration (indicateurs `IND_CONVEN_UNMN_ACTNR` et `IND_RET_TOUT_POUVR` des données ouvertes).
- **Pourquoi elle compte** : c'est le seul signal de contrôle réel que les données ouvertes du REQ publient, puisqu'elles excluent toute personne physique. Quand les pouvoirs du conseil ont été retirés, la liste des administrateurs — la première chose que consulte un professionnel — cesse de renseigner sur qui dirige.
- **Sévérité** : élevée lorsqu'un seul administrateur ou aucun n'est déclaré, moyenne sinon. Une convention unanime **sans** retrait de pouvoirs est une pratique courante et n'est pas signalée.
- **Ce que la règle ne prétend pas faire** : identifier le détenteur du contrôle. Elle signale que le registre ne peut pas y répondre et qu'il faut obtenir la convention auprès de la société.

### 2.8 Score de risque composite

```
score(entite) = Σ (poids_règle_i × sévérité_déclenchée_i) pour chaque règle i
              + bonus_cumul si ≥3 règles distinctes déclenchées sur la même entité
              (effet de faisceau d'indices > somme des signaux isolés)
```

- Le score est **toujours accompagné de sa décomposition** (quelle règle a contribué quoi) — jamais un chiffre opaque.
- **Alertes paramétrables** : chaque cabinet/utilisateur peut ajuster les seuils et pondérations par défaut (ex. un syndic peut vouloir une sensibilité plus élevée sur §2.4, un due-diligence M&A davantage sur §2.1 et §2.6).
- **Calibration continue** : les professionnels peuvent marquer un flag comme « confirmé » ou « faux positif » sur un dossier — ces retours alimentent un tableau de calibration par type de règle (visible à l'équipe produit, pas un ré-entraînement de modèle boîte noire côté client — la transparence prime sur le machine learning opaque pour un outil à vocation probante).

## 3. Résolution d'identité (rappel, détaillé en architecture §2.2)

Le score de similarité combine nom (Jaro-Winkler + phonétique FR/EN), adresse, chevauchement temporel de mandats, et cosignataires récurrents. Seuils :
- **≥0.92** : fusion suggérée automatiquement affichée mais **validation manuelle requise** avant fusion effective des profils dans un dossier.
- **0.75–0.92** : lien « possible même personne » affiché avec score, entités distinctes conservées.
- **<0.75** : aucun lien suggéré.

## 4. Comparaison temporelle de structures

Pour deux dates T1/T2 données, l'algorithme calcule le **diff de graphe** : nœuds/arêtes apparus, disparus, ou modifiés (ex. % de détention changé). Rendu visuel en surimpression (nœuds verts = nouveaux, rouges = disparus, jaune = modifiés) sur le graphe à T2, avec panneau listant chaque changement et sa date d'avis source exacte.
