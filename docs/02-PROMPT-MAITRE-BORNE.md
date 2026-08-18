# PROMPT MAÎTRE — BORNE

## Plateforme québécoise de réutilisation, d'automatisation et de transparence du certificat de localisation

> **Mode d'emploi.** Ce document est un prompt. Collez-le intégralement dans un constructeur d'application (Claude, Lovable, Bolt, v0, Replit Agent) ou remettez-le à une équipe de développement. Il est écrit pour être exécuté sans que le lecteur ait besoin du dossier stratégique. La section 15 contient les variantes courtes si votre outil limite la longueur.

---

## 1. IDENTITÉ

**Nom :** BORNE

Le mot est choisi pour son triple sens : la borne d'arpentage plantée au sol, la borne numérique en libre-service, et *borner* — l'acte juridique de fixer une limite. Rien d'autre en français ne dit les trois à la fois.

**Signature :** *Ce qui a déjà été mesuré n'a pas à être remesuré.*

**Mission :** rendre au propriétaire québécois le contrôle, le prix et le délai d'un document qu'il paie sans jamais l'avoir vraiment possédé — et rendre au marché de l'arpentage une transparence qu'il n'a jamais eue.

**Langue :** français québécois par défaut. Anglais complet en seconde langue. Toute la terminologie légale reste en français, y compris dans l'interface anglaise (*certificat de localisation*, *arpenteur-géomètre*, *bornage*, *lot rénové*).

---

## 2. LE PRINCIPE NON NÉGOCIABLE DE L'ARCHITECTURE

> **BORNE ne retire jamais la signature à l'arpenteur-géomètre. BORNE lui retire tout ce qui n'est pas la signature.**

C'est une contrainte de conception absolue, et elle a trois raisons.

**Raison légale.** La *Loi sur les arpenteurs-géomètres* (RLRQ c. A-23) réserve les opérations d'arpentage à l'arpenteur-géomètre (art. 34), les déclare nulles si faites par un autre (art. 35), et interdit à l'arpenteur de signer ce qui n'a pas été fait sous sa surveillance immédiate (art. 36). L'art. 42 sanctionne l'exercice illégal.

**Raison technique.** Sur les 4 vérifications interprétatives de la norme (servitudes apparentes non publiées, qualification juridique des empiètements), un système automatisé est **moins** fiable qu'un humain qualifié, d'un facteur estimé de 2 à 3. Une architecture sans arpenteur serait à la fois illégale et pire.

**Raison stratégique.** L'objection « vous voulez remplacer les professionnels » doit être fausse, pas seulement démentie.

**Traduction en règles de code, à respecter sans exception :**

- Aucun document produit par BORNE ne porte de sceau, de signature ou de mention laissant croire à un acte d'arpentage.
- Aucun livrable de BORNE ne s'intitule « certificat de localisation ».
- Tout livrable à valeur professionnelle transite par un écran de validation où un arpenteur-géomètre identifié par son numéro de matricule OAGQ accepte, corrige ou rejette **chaque conclusion, une par une**, avant d'apposer son sceau numérique.
- Une bannière permanente, non masquable, sur tous les écrans d'analyse : *« BORNE est un outil d'aide à la décision. Seul un arpenteur-géomètre peut produire un certificat de localisation. »*
- Le journal d'audit conserve l'identité du signataire, l'horodatage et l'état exact du dossier au moment de la signature.

---

## 3. LES CINQ MODULES

BORNE est une plateforme unique composée de cinq modules interdépendants. Chacun a son public, mais ils partagent une seule base de données et se renforcent mutuellement : le Registre alimente le Miroir, le Miroir attire le public, le public alimente la Place, la Place alimente l'Étalon, l'Étalon légitime le Dossier.

---

### MODULE 1 — **BORNE REGISTRE** : la réutilisation et le score de validité

*Le module qui casse la règle des 10 ans.*

**Le problème résolu.** Un certificat de 2015 sur une propriété où rien n'a bougé est aujourd'hui jeté et refait à neuf pour 1 630 $. Le taux de réutilisation de l'information dans le système actuel est de 0 %.

**Le fait qui l'autorise.** L'Ordre des arpenteurs-géomètres du Québec écrit lui-même : *« Il n'y a pas de lois ou de règlements qui rendraient un certificat de localisation caduc ou périmé. »* Le seuil de 10 ans provient de consignes internes de la Chambre des notaires et de l'OACIQ à leurs propres membres.

**Fonctionnalités**

**1.1 Le coffre-fort personnel.** Le propriétaire dépose son certificat existant (photo, PDF, numérisation). Il est stocké, indexé, consultable à vie, partageable par lien sécurisé et révocable vers son notaire, son courtier ou son prêteur. **Gratuit, sans condition, pour toujours.** C'est le produit d'appel et il ne doit jamais devenir payant.

**1.2 L'extraction structurée.** Un pipeline d'extraction documentaire ancrée convertit le PDF en objet structuré :

```
CertificatSource {
  numeroMinute, arpenteurNom, arpenteurMatricule, dateSignature, dateLeve,
  lotsCadastraux[], circonscriptionFonciere, cadastreRenove: bool,
  superficieM2, dimensionsPerimetre[],
  batiments[ { type, distancesAuxLimites{N,S,E,O}, empriseM2 } ],
  servitudesActives[], servitudesPassives[],
  empietements[ { nature, sens: "exercé"|"souffert", ampleurM } ],
  zonageCite, margesCitees{avant,arriere,laterales},
  contraintes[ { type: "inondable"|"rive"|"agricole"|"patrimoine"|"aeronautique", detail } ],
  reservesEtOpinions[],
  confianceExtraction: 0..1,      // par champ
  sourcePage: int                  // page d'origine de chaque champ
}
```

**Règle absolue anti-hallucination : aucun champ n'est peuplé sans citation de la page et de la zone du document source. Un champ non trouvé est `null` avec le motif — jamais une valeur devinée.** Tout champ sous 0,85 de confiance passe en révision humaine avant d'entrer au registre.

**1.3 Le moteur de détection de changement.** Le cœur technique de BORNE. Sept détecteurs indépendants comparent l'état à la date du certificat source à l'état actuel :

| # | Détecteur | Source | Ce qu'il détecte |
|---|---|---|---|
| D1 | Empreinte bâtie | Imagerie aérienne/satellite multi-temporelle | Agrandissement, garage, cabanon, piscine, terrasse |
| D2 | Élévation et volume | LiDAR provincial (gratuit) + différentiel | Nouveau volume bâti, remblai, changement de niveau |
| D3 | Permis municipaux | Portails ouverts + ententes municipales | Tout permis émis depuis la date du certificat |
| D4 | Mutations foncières | Registre foncier | Vente, hypothèque, **nouvelle servitude publiée**, radiation |
| D5 | Cadastre | Infolot / cadastre officiel | Rénovation, subdivision, remplacement de lot |
| D6 | Zonage | Données Québec + règlements municipaux | Amendement de zonage, changement de marge prescrite |
| D7 | Contraintes territoriales | Couches gouvernementales | Nouvelle cartographie inondable, zone patrimoniale, bande riveraine |

Chaque détecteur retourne : `{déclenché: bool, confiance: 0..1, preuve: {source, date, extrait, url}, gravité: "nulle"|"mineure"|"majeure"}`.

**1.4 Le Score de Validité BORNE (SVB).** Note de 0 à 100 accompagnée d'un verdict et — c'est essentiel — **de la liste explicite des preuves**, jamais d'un chiffre nu.

| SVB | Verdict | Voie recommandée |
|---|---|---|
| 90-100 | Aucun changement détecté sur 7 détecteurs | **V1** — attestation de non-changement |
| 70-89 | Changement mineur localisé | **V2** — mise à jour ciblée |
| 40-69 | Changements significatifs ou données insuffisantes | **V3** — certificat pré-instruit |
| 0-39 | Refonte requise, ou aucun certificat exploitable | **V0** — processus complet |

**Le score ne remplace jamais l'arpenteur.** Il propose une voie ; l'arpenteur tranche.

**1.5 L'attestation de non-changement (voie V1).** Quand SVB ≥ 90, le dossier est présenté à un arpenteur-géomètre partenaire dans une interface de validation d'une page : les 7 détecteurs, leurs preuves horodatées, le certificat source, l'écart nul. L'arpenteur valide et signe **une attestation professionnelle de non-changement** — pas un certificat de localisation. Prix cible **~120 $**, délai cible **24 à 72 h**.

L'attestation embarque son faisceau de preuves avec empreinte cryptographique horodatée, **rejouable par n'importe quel tiers**. Un certificat traditionnel n'est vérifiable par personne ; celui-ci l'est par tout le monde.

**1.6 Le diagnostic gratuit « mon certificat est-il vraiment périmé ? »** Accessible sans compte, en 90 secondes. Résultat honnête, sources légales citées, avec cette phrase textuelle quand elle s'applique :

> *Aucune loi ni aucun règlement du Québec ne rend un certificat de localisation caduc ou périmé. La règle des 10 ans provient de consignes de la Chambre des notaires du Québec et de l'OACIQ à leurs propres membres. Voici l'état réel de votre propriété, détecteur par détecteur.*

C'est le meilleur outil d'acquisition possible, parce que c'est simplement la vérité et que personne ne la dit.

---

### MODULE 2 — **BORNE DOSSIER** : le dossier pré-instruit

*Le module qui fait aimer BORNE aux arpenteurs.*

**Le problème résolu.** Sur 11 heures de travail par certificat, environ 10 sont automatisables et 1 relève du jugement réservé. L'arpenteur passe l'essentiel de son temps en recherche documentaire à 173 $/h.

**Fonctionnement.** Dès la commande, BORNE produit automatiquement les **19 vérifications déterministes** de la norme A-23 r. 10 et les livre à la firme d'arpentage en dossier structuré, chaque conclusion accompagnée de sa source, de sa date et de son indice de confiance.

**Ce que BORNE instruit automatiquement (19/23)**

| Bloc | Vérifications | Sources |
|---|---|---|
| Titres et cadastre | Désignation, concordance, historique cadastral, chaîne de titres, servitudes actives, servitudes passives, charges publiées | Registre foncier, Infolot, cadastre rénové |
| Géométrie | Superficie, dimensions, distances aux limites | Cadastre + levé + LiDAR |
| Réglementaire | Zonage, usages, marges prescrites, normes d'implantation, conformité aux règlements en vigueur | Données Québec, grilles de spécifications, règlements municipaux |
| Contraintes | Zone agricole, zone inondable, rive et littoral, patrimoine, servitudes aéronautiques | Couches gouvernementales |

**Ce que BORNE ne fait jamais (4/23) — réservé à l'arpenteur**

- Servitudes apparentes ou charges non publiées qui devraient normalement faire l'objet d'une servitude (art. 9 de la norme)
- Qualification juridique des empiètements : apparents, exercés, soufferts
- Reconstitution de limites à partir de marques d'occupation contradictoires
- L'opinion professionnelle finale

**Le poste de travail de l'arpenteur.** Une interface unique où il voit, pour chaque conclusion automatique : la conclusion, sa source cliquable, sa date, sa confiance, et trois boutons — **Valider / Corriger / Rejeter**. Chaque correction est journalisée et alimente le module Étalon. Il complète ensuite les 4 vérifications réservées, appose son sceau numérique OAGQ, et le document part.

**Préparation du terrain.** BORNE génère aussi la fiche de levé : points de rattachement suggérés, zones d'attention identifiées par la détection de changement, itinéraire optimisé si plusieurs dossiers sont regroupés dans le même secteur, gabarit de notes de terrain conforme à l'art. 5 de la norme.

**Modèle économique.** Abonnement par siège ou tarif par dossier facturé à la firme. **BORNE ne facture jamais le citoyen pour ce module.**

**Cible.** Faire passer une firme de ~11 h à ~3,7 h par dossier, soit **une capacité multipliée par 2,5 à 3 à effectif constant.**

---

### MODULE 3 — **BORNE MIROIR** : la transparence forcée

*Le module qui oblige le milieu à l'intégrité. Entièrement public, sans compte, sans mur payant, jamais.*

**Principe fondateur : BORNE n'accuse personne, ne note personne subjectivement, ne diffame personne. BORNE publie des faits et demande à chacun d'écrire pourquoi.**

**3.1 Indice des prix réels.** Chaque devis reçu sur la plateforme est enregistré. Publication continue de la médiane, du P10 et du P90 par région administrative, par type de dossier et par saison — **superposés au tarif suggéré publié par l'Ordre (1 630 $ pour l'unifamiliale urbaine en 2026).** Si les prix réels se collent au tarif suggéré, le graphique le montrera de lui-même. Aucun commentaire n'est nécessaire ni souhaitable.

**3.2 Indice des délais.** Délai promis contre délai livré, par firme, par région, par mois. La ponctualité devient visible, donc elle devient un critère, donc elle s'améliore.

**3.3 Le REGISTRE DES REFUS MOTIVÉS — le mécanisme central.**

Quand un notaire, un prêteur ou un courtier refuse un certificat existant, l'utilisateur saisit le refus dans un formulaire structuré obligatoire :

```
Refus {
  typeIntervenant: "notaire" | "prêteur" | "courtier" | "assureur",
  dateCertificatRefusé, ageCertificatAnnees,
  motifInvoqué: enum[
    "âge du certificat (>10 ans)",
    "changement physique identifié",
    "servitude nouvelle",
    "changement de zonage",
    "politique interne de l'institution",
    "usage du marché",
    "autre"
  ],
  fondementCité: {
    type: "loi" | "règlement" | "politique interne" | "usage" | "aucun fondement cité",
    reference: string   // ex. « art. 1719 C.c.Q. » — champ libre, obligatoire
  },
  changementFactuelDémontré: bool
}
```

**Publication mensuelle, agrégée et anonymisée :** répartition des motifs, et surtout **le pourcentage de refus dont le fondement invoqué est « politique interne », « usage du marché » ou « aucun fondement cité ».**

BORNE n'interdit rien et ne poursuit personne. **BORNE demande simplement à chacun d'écrire pourquoi.** Comme la règle des 10 ans n'a aucune référence légale à citer, ce graphique se remplira tout seul. C'est le levier le plus puissant de la plateforme et il est entièrement défensif sur le plan juridique.

**3.4 Le compteur de rente évitable.** En page d'accueil, mis à jour quotidiennement :

> *Cette année au Québec : **N** dossiers où un certificat valide existait, où aucun changement n'était détectable sur 7 détecteurs, et où un nouveau certificat a tout de même été exigé.*
> *Coût pour les ménages québécois : **X $**.*
> *Temps d'attente collectif : **Y** semaines.*

**3.5 Fiches publiques des firmes.** Uniquement des données factuelles : délai médian observé, prix médian observé, volume, taux de révision, taux de dossiers retournés, et lien vers les décisions publiques du conseil de discipline de l'OAGQ. **Aucune étoile, aucun avis d'utilisateur, aucun jugement de valeur.** Toute firme peut publier une réponse à sa fiche, affichée à côté sans modération éditoriale.

**3.6 Le miroir réglementaire.** Un tableau de bord destiné à l'Office des professions, au ministère des Ressources naturelles et des Forêts, aux médias et aux chercheurs : séries temporelles de prix, de délais, d'effectif de l'Ordre, de taux de réutilisation, de composition des refus. Export CSV et API publique, gratuits. **BORNE devient l'infrastructure statistique du secteur. À ce moment-là, la réforme ne se demande plus : elle se constate.**

---

### MODULE 4 — **BORNE PLACE** : l'orchestrateur de la demande

*Le module qui transforme 97 214 ménages isolés en une contrepartie de marché.*

**4.1 Commande en 4 minutes.** Adresse ou numéro de lot → BORNE identifie le lot au cadastre, tire ce qu'il peut, détecte s'il existe déjà un certificat au registre, calcule le SVB, recommande une voie, affiche un prix estimé et un délai estimé avec sa fourchette.

**4.2 Appel d'offres inversé.** Le dossier — déjà pré-instruit, donc beaucoup moins coûteux à exécuter — est offert aux firmes du secteur qui répondent avec un prix ferme et une date ferme. Le citoyen choisit sur trois critères visibles : prix, date, historique de ponctualité.

**4.3 Regroupement géographique.** BORNE agrège les dossiers du même secteur et propose des tournées groupées, avec un rabais partagé entre le citoyen et la firme. **C'est ici que se réalise l'économie de 1,4 million de km et de 379 tonnes de CO₂ par année.**

**4.4 Suivi en temps réel.** Un fil d'étapes horodaté, visible du client, du courtier et du notaire simultanément. Fini les appels pour savoir où en est le dossier.

**4.5 Livraison numérique multi-parties.** Le document signé numériquement (sceau OAGQ via Notarius) est déposé simultanément dans le coffre-fort du propriétaire, chez le notaire, chez le courtier et chez le prêteur, avec accusés de réception horodatés. Le lien est révocable par le propriétaire.

**4.6 Mode courtier et mode notaire.** Tableaux de bord professionnels : portefeuille de dossiers, alertes de retard, déclenchement en un clic dès l'inscription d'une propriété plutôt qu'à la promesse d'achat — ce qui élimine à lui seul plusieurs semaines de délai perçu.

---

### MODULE 5 — **BORNE ÉTALON** : la mesure machine contre humain

*Le module qui transforme les convictions en preuves. Le plus important à long terme, le moins visible à court terme.*

**Ce qu'il mesure**

**5.1 L'économie réelle, dossier par dossier.** Pour chaque dossier : prix payé contre 1 630 $ de référence, délai réel contre 4-8 semaines de référence, heures-arpenteur consommées contre 11 h de référence, km parcourus, CO₂, papier. Agrégation en temps réel, publication trimestrielle.

**5.2 L'écart machine-humain.** Sur chaque dossier passé par le module Dossier, chacune des 19 conclusions automatiques reçoit un verdict de l'arpenteur : validée, corrigée, rejetée. Journalisation systématique :

```
Ecart {
  dossierId, verificationId, familleVerification,
  conclusionMachine, confianceMachine, sourceMachine,
  conclusionHumaine, verdict: "validée"|"corrigée"|"rejetée",
  natureEcart: "omission"|"source périmée"|"mauvaise source"|
               "erreur d'interprétation"|"désaccord légitime",
  quiAvaitRaison: "machine"|"humain"|"indéterminé"|"les deux défendables"
}
```

**5.3 Le protocole de double aveugle.** Un échantillon aléatoire de **5 % des dossiers** est traité indépendamment par deux arpenteurs-géomètres qui ne voient ni le travail de l'autre, ni les conclusions de la machine.

Cela produit quatre courbes, publiées trimestriellement :
1. Taux d'erreur de la machine, par famille de vérification
2. Taux d'erreur humain, par famille de vérification
3. **Taux de désaccord entre deux humains qualifiés sur le même dossier**
4. Taux d'erreur de l'architecture hybride livrée

**La troisième courbe est la plus importante de tout le projet.** Si deux arpenteurs qualifiés divergent régulièrement sur le même terrain, alors la notion même d'« erreur » humaine est une variance que le système actuel n'a jamais mesurée, jamais publiée, et jamais facturée au client. Personne au Québec ne connaît ce chiffre. **Celui qui le mesurera le premier détiendra le débat.**

**5.4 Le tableau de bord de qualité.** Public, par famille de vérification, avec les intervalles de confiance et la taille d'échantillon affichés en permanence. **Aucune donnée n'est publiée sous n = 100.** La rigueur statistique n'est pas une précaution ici : c'est l'arme.

**5.5 Boucle d'amélioration.** Toute correction humaine récurrente déclenche automatiquement un billet d'amélioration du pipeline. La différence structurelle avec l'erreur humaine tient là : **une erreur machine détectée est corrigée une fois pour tous les dossiers futurs ; une erreur humaine détectée est corrigée pour un professionnel, un dossier, une fois.**

---

## 4. VALEURS DE RÉFÉRENCE À CÂBLER DANS L'APPLICATION

Toutes vérifiées en août 2026. À stocker dans une table de paramètres modifiable, jamais en dur dans le code.

```
TARIF_SUGGERE_OAGQ_2026_UNIFAMILIAL_URBAIN = 1630   // $
TARIF_SUGGERE_OAGQ_2024                    = 1550   // $ — pour la série temporelle
TARIF_IMPLANTATION_ET_CERTIFICAT           = 2374   // $
TARIF_PIQUETAGE_URBAIN_SIMPLE              = 1548   // $
TAUX_HORAIRE_JUNIOR                        = 173    // $/h (0-5 ans)
TAUX_HORAIRE_INTERMEDIAIRE                 = 248    // $/h (5-10 ans)
TAUX_HORAIRE_SENIOR                        = 321    // $/h (10 ans +)
TAUX_HORAIRE_TERRAIN_1_PERS                = 173    // $/h
TAUX_HORAIRE_RECHERCHE_DAO                 = 158    // $/h
DELAI_MARCHE_SEMAINES                      = [4, 8]
MEMBRES_OAGQ_2025_03_31                    = 1084
MEMBRES_OAGQ_2021_03_31                    = 1135
NOUVEAUX_MEMBRES_2024_2025                 = 19
NOUVEAUX_MEMBRES_2020_2021                 = 35
TRANSACTIONS_RESIDENTIELLES_QC_2025        = 97214
PRIX_MEDIAN_UNIFAMILIALE_QC_2025           = 491500  // $
LOTS_CADASTRE_QUEBEC                       = 3800000
ASSURANCE_TITRES_500K                      = [250, 400]   // $
TOLERANCE_CADASTRE_POSITION_M              = [0.15, 0.30]
TOLERANCE_CADASTRE_LINEAIRE_MAX_M          = 0.42
PRECISION_DRONE_RTK_HORIZ_M                = [0.02, 0.03]
PRECISION_DRONE_RTK_VERT_M                 = [0.03, 0.06]
RESOLUTION_MNT_LIDAR_QC_M                  = 1
VERIFICATIONS_NORME_TOTAL                  = 23
VERIFICATIONS_DETERMINISTES                = 19
VERIFICATIONS_INTERPRETATIVES              = 4
```

---

## 5. SOURCES DE DONNÉES À INTÉGRER

| Source | Type | Coût | Priorité |
|---|---|---|---|
| Cadastre du Québec / Infolot | Géospatial officiel | Consultation gratuite | **P0** |
| Registre foncier du Québec en ligne | Actes, servitudes, mutations | Tarifé par document | **P0** |
| Données Québec — zonage et grilles de spécifications | Réglementaire ouvert | Gratuit | **P0** |
| LiDAR provincial — MNT, MHC, pentes | Élévation, 1 m | **Gratuit** | **P0** |
| Imagerie aérienne/satellite multi-temporelle | Détection de changement | Commercial | **P0** |
| Portails de permis municipaux | Permis de construction | Variable, ententes requises | P1 |
| Couches de contraintes (inondable, rive, agricole, patrimoine, aéronautique) | Géospatial gouvernemental | Gratuit | P1 |
| Répertoire des membres OAGQ | Validation des matricules | Public | P1 |
| Décisions du conseil de discipline OAGQ | Public | Gratuit | P2 |
| Notarius | Sceau et signature numériques | Commercial | P1 |
| Statistiques APCIQ / Centris | Contexte de marché | Partiel | P2 |

---

## 6. MODÈLE DE DONNÉES CENTRAL

```
Immeuble {
  id, lotsCadastraux[], circonscriptionFonciere, cadastreRenove: bool,
  adresse, municipalite, mrc, regionAdministrative,
  geometrie: Polygon(EPSG:2949..2952 selon fuseau MTM),
  superficieCadastraleM2
}

Certificat {
  id, immeubleId, source: "déposé"|"produit via BORNE",
  arpenteurMatricule, arpenteurNom, firme,
  dateSignature, dateLeve, numeroMinute,
  fichierOriginal, donneesExtraites: CertificatSource,
  confianceExtractionGlobale, statutVerification
}

AnalyseChangement {
  id, certificatId, dateAnalyse,
  detecteurs: [D1..D7],  // chacun avec preuve, confiance, gravité
  scoreValiditeBorne: 0..100,
  voieRecommandee: "V0"|"V1"|"V2"|"V3",
  empreinteCryptographique, horodatageQualifie
}

Dossier {
  id, immeubleId, voie, statut, clientId, firmeId, arpenteurSignataireMatricule,
  prixDevis, prixFinal, datePromise, dateLivree,
  heuresHumaines, kmParcourus,
  verifications: [ Verification x23 ],
  journalAudit[]
}

Verification {
  numero: 1..23, famille, nature: "déterministe"|"interprétative",
  conclusionMachine, sourceMachine{url,date,extrait}, confianceMachine,
  conclusionHumaine, verdictArpenteur, natureEcart, horodatage
}

Refus {  // voir schéma complet au module 3.3  }
```

**Systèmes de référence :** NAD 83 SCRS, projection MTM (fuseaux 7 à 10 selon la région). **Ne jamais faire de calcul métrique en WGS84 latitude/longitude** — reprojeter systématiquement avant toute mesure de distance ou de superficie.

---

## 7. INTERFACE ET EXPÉRIENCE

**Ton.** Sobre, institutionnel, québécois. Ni startup, ni cabinet d'avocats. Le registre visuel d'un service public bien fait : quelque chose qui aurait dû exister depuis toujours.

**Palette.** Fonds neutres chauds. Un accent unique, terreux — pierre, ardoise, ocre foncé. Le vert est réservé exclusivement à « aucun changement détecté », l'ambre à « changement mineur », le rouge à « refonte requise ». **Aucune couleur décorative, la couleur porte toujours de l'information.**

**Typographie.** Sans-serif à forte lisibilité pour l'interface. Chiffres tabulaires partout où des montants ou des mesures s'alignent. Les prix, délais et mesures sont toujours les éléments les plus gros de l'écran.

**Accessibilité.** WCAG 2.2 AA minimum. Contraste 4,5:1 sur tout texte. Aucune information portée par la couleur seule. Navigation complète au clavier. Mode sombre natif. **Le public cible inclut des personnes âgées qui vendent la maison familiale : gros caractères, formulaires courts, aucun jargon non expliqué.**

**Trois écrans à soigner absolument**

**Écran 1 — Le diagnostic gratuit.** Adresse → 90 secondes → verdict. Les 7 détecteurs affichés en liste, chacun avec un pictogramme d'état, sa source cliquable, sa date. En bas, le SVB et la voie recommandée. Et cette phrase, toujours visible :

> *Aucune loi ni aucun règlement du Québec ne rend un certificat de localisation caduc ou périmé.*

**Écran 2 — Le poste de validation de l'arpenteur.** Densité maximale d'information, aucune fioriture. Les 19 conclusions en liste, chacune avec source, date, confiance et trois boutons. Raccourcis clavier obligatoires : `V` valider, `C` corriger, `R` rejeter, `↓` suivant. **Un arpenteur doit pouvoir traiter un dossier V1 en moins de 4 minutes.** Chronomètre visible, parce que la vitesse est le produit.

**Écran 3 — Le Miroir public.** Une seule page, sans compte, sans mur payant. En haut : le compteur de rente évitable, en très gros. Puis les courbes de prix et de délais. Puis le graphique des refus par fondement invoqué. **Partageable, intégrable, exportable en CSV.** Conçu pour être capturé et publié tel quel par un journaliste.

---

## 8. RÈGLES ANTI-HALLUCINATION — CRITIQUES

L'application traite des données qui engagent la responsabilité professionnelle d'un officier public. Une valeur inventée peut coûter un mur démoli. Ces règles ne sont pas négociables.

1. **Aucune valeur sans source.** Chaque champ extrait ou déduit porte l'URL, la page, la date et l'extrait textuel d'origine. Un champ sans source est `null`, jamais une estimation.
2. **Absence explicite.** Quand une donnée n'existe pas — municipalité sans zonage numérisé, permis non publiés —, l'application affiche *« donnée non disponible pour cette municipalité »* et **relève la voie recommandée d'un cran**. Jamais de comblement par inférence.
3. **Fraîcheur affichée.** Chaque source porte sa date de dernière mise à jour, visible. Une source de plus de 90 jours sur le zonage déclenche un avertissement.
4. **Confiance calibrée.** Les indices de confiance doivent être calibrés sur des données réelles, pas produits par un modèle de langage. Un indice non calibré est pire qu'aucun indice.
5. **Seuil de révision humaine.** Toute extraction sous 0,85 passe en révision avant d'entrer au registre.
6. **Jamais de génération d'opinion.** L'application ne rédige jamais l'opinion professionnelle, ne suggère jamais une conclusion sur les 4 vérifications interprétatives, et ne pré-remplit jamais un champ que seul l'arpenteur peut remplir.
7. **Séparation stricte des mesures.** Une mesure issue du cadastre (tolérance 15-30 cm) et une mesure issue d'un levé (2-3 cm) ne sont **jamais** affichées dans la même colonne sans étiquette de provenance et de tolérance. **Une marge de recul se joue souvent à 30 cm : c'est exactement la tolérance du cadastre.**
8. **Journal immuable.** Toute décision, correction et signature est horodatée et inaltérable.

---

## 9. CONFORMITÉ, SÉCURITÉ, VIE PRIVÉE

- **Loi 25** (protection des renseignements personnels au Québec) : consentement granulaire, minimisation, droit à la portabilité et à l'effacement, responsable de la protection des renseignements personnels désigné, évaluation des facteurs relatifs à la vie privée documentée.
- **Hébergement des données au Québec ou au Canada.** Non négociable pour la crédibilité institutionnelle du projet.
- **Le propriétaire est maître de son coffre-fort.** Les liens de partage sont nominatifs, horodatés, révocables en un clic, avec journal des accès visible par lui.
- **Aucune revente de données personnelles, jamais.** Seules des statistiques agrégées et anonymisées sont publiées. C'est un engagement à inscrire dans les conditions d'utilisation en termes non ambigus, parce que c'est ce qui rend le module Miroir défendable.
- **Anonymisation du registre des refus** : aucun individu nommé, aucune firme identifiée sous n = 20 pour une catégorie donnée.
- Chiffrement au repos et en transit. Authentification à deux facteurs obligatoire pour tout compte professionnel.

---

## 10. MODÈLE D'AFFAIRES

| Flux | Payeur | Prix | Note |
|---|---|---|---|
| Coffre-fort et diagnostic | — | **Gratuit à vie** | Produit d'appel, jamais monétisé |
| Miroir public | — | **Gratuit à vie** | C'est le levier politique, pas un produit |
| V1 attestation de non-changement | Citoyen | ~120 $ | Commission de plateforme, arpenteur rémunéré |
| V2 mise à jour assistée | Citoyen | ~450 $ | idem |
| V3 certificat pré-instruit | Citoyen | ~780 $ | idem |
| Module Dossier | Firme d'arpentage | Abonnement par siège ou par dossier | Le revenu récurrent principal |
| API et données | Municipalités, institutions financières, assureurs | Licence | Le revenu à long terme |

**Contrainte éthique inscrite dans le produit : BORNE ne facture jamais un citoyen pour lui dire qu'il n'a pas besoin de payer.** Le diagnostic qui conclut « votre certificat est valide, ne faites rien » doit rester gratuit pour toujours. C'est la promesse qui rend tout le reste crédible.

---

## 11. SÉQUENCE DE CONSTRUCTION

**Jalon 1 (semaines 1-8) — Le registre citoyen**
Coffre-fort, dépôt de certificat, extraction structurée avec citations, consultation, partage sécurisé. Diagnostic gratuit avec les 3 détecteurs les plus fiables (D3 permis, D4 registre, D6 zonage). **Livrable : un citoyen peut savoir gratuitement, en 90 secondes, si son certificat est réellement problématique.**

**Jalon 2 (semaines 8-16) — Les 7 détecteurs et le SVB**
Intégration LiDAR et imagerie multi-temporelle. Score de Validité BORNE complet avec faisceau de preuves. Premier Miroir public : compteur de rente évitable.

**Jalon 3 (semaines 16-28) — Le poste arpenteur**
Module Dossier, les 19 vérifications automatiques, l'interface de validation, la signature numérique. Recrutement de 5 firmes pilotes. **Jalon critique : sans arpenteurs partenaires, rien de la suite n'existe.**

**Jalon 4 (semaines 28-40) — La voie V1**
Attestation de non-changement en production. Place de marché et appel d'offres inversé. Registre des refus motivés.

**Jalon 5 (semaines 40-52) — L'Étalon**
Journalisation complète des écarts, protocole de double aveugle, premier rapport trimestriel public de qualité. API et export ouverts.

---

## 12. CE QUE BORNE NE FERA JAMAIS

Une liste aussi importante que celle des fonctionnalités. À afficher publiquement sur le site.

- ❌ Produire un certificat de localisation sans arpenteur-géomètre signataire
- ❌ Apposer un sceau ou une signature professionnelle par voie automatisée
- ❌ Émettre une opinion sur une servitude apparente non publiée ou sur la qualification d'un empiètement
- ❌ Déduire une limite de propriété par superposition cadastre + orthophoto — **le cadastre indique les limites, il ne les détermine pas**
- ❌ Publier une donnée de qualité sous n = 100, ou une statistique de refus identifiant une firme sous n = 20
- ❌ Nommer, noter subjectivement ou classer un professionnel autrement que par des données factuelles vérifiables et des sources publiques
- ❌ Revendre des données personnelles
- ❌ Facturer un citoyen pour lui apprendre qu'il n'a pas besoin de payer
- ❌ Conseiller à un citoyen de passer outre l'exigence d'un notaire ou d'un prêteur — **BORNE informe et documente, l'utilisateur décide**

---

## 13. LES QUATRE PHRASES QUI DOIVENT APPARAÎTRE DANS L'INTERFACE

Textuellement. Elles font le travail politique à elles seules.

1. > *« Il n'y a pas de lois ou de règlements qui rendraient un certificat de localisation caduc ou périmé. »* — Ordre des arpenteurs-géomètres du Québec

2. > *Le seuil de 10 ans provient de consignes internes de la Chambre des notaires du Québec et de l'OACIQ à leurs membres. Ce n'est pas une loi.*

3. > *BORNE est un outil d'aide à la décision. Seul un arpenteur-géomètre peut produire un certificat de localisation.*

4. > *Ce qui a déjà été mesuré n'a pas à être remesuré.*

---

## 14. CRITÈRES DE SUCCÈS

**An 1** — 25 000 certificats déposés au registre · 10 firmes partenaires · 5 000 diagnostics gratuits par mois · registre des refus lancé avec n > 500 · premier rapport public de qualité publié

**An 3** — 30 % des dossiers du Québec transitent par BORNE · délai médian sous 10 jours · prix médian sous 700 $ · le taux de refus fondé sur « politique interne » ou « aucun fondement cité » est publiquement connu et en baisse · l'Office des professions cite les données de BORNE

**An 5** — La règle des 10 ans a été formellement révisée, ou son inapplicabilité est admise publiquement · un dépôt central des certificats existe · **l'économie annuelle cumulée pour les ménages québécois dépasse 200 M$**

---

## 15. VARIANTE COURTE (si votre outil limite la longueur)

> Construis **BORNE**, une plateforme web québécoise bilingue qui casse le coût et le délai du certificat de localisation.
>
> **Contrainte absolue :** ne jamais remplacer l'arpenteur-géomètre. La loi (RLRQ c. A-23, art. 34-36) lui réserve l'acte. BORNE automatise les 19 vérifications déterministes sur les 23 de la norme A-23 r. 10, et laisse les 4 vérifications interprétatives — servitudes apparentes non publiées, qualification des empiètements — et la signature à l'arpenteur.
>
> **Cinq modules.** (1) **Registre** — coffre-fort gratuit des certificats existants, extraction structurée avec citations obligatoires, 7 détecteurs de changement (imagerie multi-temporelle, LiDAR gratuit, permis municipaux, registre foncier, cadastre, zonage, contraintes), Score de Validité 0-100, et attestation de non-changement signée par arpenteur à ~120 $ en 24-72 h au lieu de 1 630 $ en 4-8 semaines. (2) **Dossier** — livre aux firmes d'arpentage le dossier pré-instruit, faisant passer un dossier de 11 h à 3,7 h. (3) **Miroir** — public et gratuit : indice des prix réels comparé au tarif suggéré de l'Ordre, indice des délais, et surtout un registre des refus où tout notaire ou prêteur refusant un certificat doit inscrire son fondement légal précis. (4) **Place** — commande, appel d'offres inversé, tournées groupées, livraison numérique multi-parties. (5) **Étalon** — journalise chaque écart entre conclusion machine et conclusion arpenteur, avec 5 % des dossiers en double aveugle, et publie trimestriellement les taux d'erreur réels machine, humain, et **désaccord entre deux humains**.
>
> **Règles anti-hallucination :** aucune valeur sans source citée avec URL, page et date ; un champ introuvable est null, jamais deviné ; jamais de mesure cadastrale (tolérance 15-30 cm) affichée sans étiquette à côté d'une mesure de levé (2-3 cm).
>
> **Ton :** service public sobre, accessible WCAG 2.2 AA, gros caractères, aucun jargon non expliqué. Hébergement au Québec, conformité Loi 25.
>
> **La phrase qui fonde tout, à afficher :** *« Il n'y a pas de lois ou de règlements qui rendraient un certificat de localisation caduc ou périmé. »* — Ordre des arpenteurs-géomètres du Québec.

---

## ANNEXE — SOURCES

**Droit et réglementation**
- *Loi sur les arpenteurs-géomètres*, RLRQ c. A-23, art. 34, 35, 36, 42, 43, 56 — legisquebec.gouv.qc.ca
- *Règlement sur la norme de pratique relative au certificat de localisation*, RLRQ c. A-23, r. 10
- *Règlement sur le greffe des membres de l'Ordre des arpenteurs-géomètres du Québec*, RLRQ c. A-23, r. 9
- *Code civil du Québec*, art. 1719 et 3027
- *Loi favorisant la réforme du cadastre québécois*, art. 19.2
- *Loi visant à moderniser certaines règles relatives à la publicité foncière et à favoriser la diffusion de l'information géospatiale* (PL 35, 2020)

**Ordre des arpenteurs-géomètres du Québec**
- Certificat de localisation — oagq.qc.ca/services/certificat-de-localisation/
- Durée de vie du certificat de localisation — oagq.qc.ca/grand-public/situations-communes/duree-de-vie-du-certificat-de-localisation/
- Guide des tarifs suggérés 2026 — oagq.qc.ca/ressources/guide-des-tarifs-suggeres/
- Conservation du greffe — oagq.qc.ca/membres/vos-obligations-en-tant-que-membre/conservation-du-greffe/
- Normes professionnelles : sceau et signature numérique — oagq.qc.ca/ressources/lois-et-reglements/normes-professionnelles-sceau-et-signature-numerique/
- Rapport annuel 2024-2025 et rapport annuel 2020-2021 — oagq.qc.ca/rapports-annuels/

**Chambre des notaires et OACIQ**
- Rappel : certificat de localisation de moins de 10 ans — cnq.org
- Obtention du certificat de localisation : quelle clause utiliser — oaciq.com
- Assurance titres — oaciq.com

**Gouvernement du Québec**
- Certificat de localisation — quebec.ca/habitation-territoire/achat-vente/certificat-localisation
- Rénovation cadastrale — portail-info.foncier.gouv.qc.ca
- Le cadastre rénové et sa portée (instructions v6.0) — portail-info.foncier.gouv.qc.ca
- Modernisation du Registre foncier — portail-info.foncier.gouv.qc.ca
- Les données lidar du Québec sont maintenant gratuites — quebec.ca
- Zonage et grilles de spécifications — donneesquebec.ca
- Infolot — appli.foncier.gouv.qc.ca/Infolot/

**Marché**
- APCIQ — Ventes résidentielles : le Québec enregistre sa troisième meilleure année en 2025
- Association of Ontario Land Surveyors — Title Insurance
- Wingtra — précision de la photogrammétrie par drone
