# VéloceREQ — Accès aux données du REQ

> Vérifié en août 2026 auprès des sources officielles. **Ce document corrige une hypothèse erronée du document d'architecture initial** (§2.1), qui supposait que les administrateurs et actionnaires étaient disponibles dans le jeu de données ouvertes. Ils ne le sont pas.

## 1. Le constat déterminant

Le guide officiel du Registraire (*Données publiques sur les entreprises au Québec*, 2025) est explicite :

> « Toutefois, certains renseignements publiés au registre ne sont pas disponibles dans le jeu de données. **Les renseignements plus personnels permettant de reconnaître des personnes, tels que les noms, prénoms et adresses des personnes physiques, sont absents.** »

Autrement dit : **le jeu de données ouvertes ne contient aucune personne physique** — ni administrateur, ni actionnaire, ni bénéficiaire ultime. Or c'est exactement la matière du produit. Le graphe de contrôle ne peut pas être construit à partir des données ouvertes seules.

Second constat, tout aussi structurant : la licence du jeu de données est **CC BY-NC-SA 4.0**, dont le volet *NC* interdit l'usage commercial. Un service payant ne peut donc pas être bâti sur ce jeu sans entente distincte avec le Registraire.

## 2. Les quatre voies d'accès

| Voie | Contenu | Personnes physiques | Volume | Coût | Licence / conditions |
|---|---|---|---|---|---|
| **A. Données ouvertes** (Données Québec) | Entreprises, noms, établissements, fusions/scissions, continuations | **Non** | Massif, téléchargement complet | Gratuit | CC BY-NC-SA 4.0 — **non commercial** |
| **B. Recherche au registre** (service en ligne) | Fiche complète : administrateurs, actionnaires, bénéficiaires ultimes | **Oui** | Une fiche à la fois | Gratuit | Conditions d'utilisation du service ; pas conçu pour l'extraction automatisée |
| **C. Compilation de renseignements** | Listes d'entreprises selon critères (type, activité, période, statut, employés, géographie) | Non documenté comme tel | Lot, sur commande | ~134 $ par demande, non remboursable, conservation 90 jours | Contractuelle |
| **D. Entente d'échange de données** | À négocier | À négocier | À négocier | À négocier | Contractuelle — `Groupe.EOS@req.gouv.qc.ca` |

### A. Données ouvertes — ce qu'on obtient réellement

Cinq fichiers, mis à jour **deux fois par mois** (le registre en ligne, lui, est à jour en continu — un écart à assumer et à afficher à l'utilisateur) :

| Fichier | Contenu | Clé |
|---|---|---|
| `Entreprise` | 37 colonnes : NEQ, statut et date d'immatriculation, régime et forme juridique, dates de constitution et de cessation prévue, activités économiques (code CAE), adresse du domicile, déclarations annuelles | `NEQ` |
| `Nom` | Nom légal, autres noms, versions en langue étrangère, statut et type de nom, **dates de début et de fin** | `NEQ` |
| `Établissement` | Adresses des établissements, activités économiques, indicateur d'établissement principal | `NEQ` + suffixe |
| `Fusion et scission` | NEQ de l'entité résultante **et** NEQ des entités composantes, type de relation, date d'effet | `NEQ` ↔ `NEQ_ASSUJ_REL` |
| `Continuation et transformation` | Changements de régime juridique d'une personne morale | `NEQ` |

Trois colonnes méritent une attention particulière, parce qu'elles portent un signal de contrôle que le reste du registre ne donne pas :

- **`IND_CONVEN_UNMN_ACTNR`** — existence d'une convention unanime des actionnaires ;
- **`IND_RET_TOUT_POUVR`** — retrait des pouvoirs du conseil d'administration en vertu de cette convention ;
- **`IND_FAIL`** — indicateur de faillite.

Une société dont le conseil d'administration a été dépouillé de ses pouvoirs par convention unanime est une société où **le contrôle réel ne se lit pas dans la liste des administrateurs**. C'est précisément l'angle mort que le produit cherche à exposer, et il est disponible gratuitement, sans donnée personnelle.

### B. Recherche au registre — la seule source de personnes

Le service public de consultation donne la fiche complète, y compris administrateurs, actionnaires et bénéficiaires ultimes déclarés. Depuis le **31 juillet 2024**, il accepte aussi la recherche par **nom et prénom d'une personne physique**, ce qui fournit nativement la recherche inversée « dans quelles entités cette personne apparaît-elle ».

Deux limites pratiques à retenir :

- la recherche par personne exige une **orthographe exacte** (un accent ou un second prénom manquant fait échouer l'appariement) — ce qui justifie d'autant plus le moteur de résolution d'identité côté VéloceREQ ;
- le service est conçu pour la consultation, fiche par fiche. **L'extraction automatisée en masse n'est pas un usage prévu** : la bâtir sans entente exposerait le produit à un risque contractuel et de réputation disproportionné pour un outil qui se veut opposable devant un tribunal.

### C et D. Voies contractuelles

La **compilation de renseignements** (~134 $ la demande) sert à constituer des listes ciblées par secteur, statut ou géographie — utile pour amorcer un périmètre, pas pour alimenter un graphe en continu.

La voie sérieuse pour un produit professionnel reste la **négociation d'une entente d'échange de données** avec le Registraire, qui est aussi le seul moyen de lever la clause non commerciale. Contact du distributeur du jeu de données : `Groupe.EOS@req.gouv.qc.ca`.

## 3. Conséquences pour le produit

### Ce qui reste vrai sans licence

Le moteur fonctionne déjà sur des données réelles pour tout ce qui ne dépend pas des personnes :

- graphe de **succession** d'entités (fusions, scissions, continuations) — les fichiers donnent les NEQ des deux côtés de la relation ;
- **grappes d'adresses** — les établissements et domiciles sont complets ;
- **dissolutions et reconstitutions rapides** — dates de constitution, de cessation et statuts d'immatriculation ;
- **changements de dénomination** avant un événement critique — le fichier `Nom` est historisé avec dates de début et de fin ;
- **conventions unanimes d'actionnaires** et retrait des pouvoirs du conseil — signal de contrôle de fait.

### Ce qui exige une source de personnes

- calcul du bénéficiaire ultime ;
- cycles de détention ;
- cascades de détention ;
- administrateurs récurrents et profils de prête-nom ;
- recherche inversée par personne.

Soit, en pratique : la moitié du moteur de détection et l'essentiel de la promesse. Ce n'est pas un détail d'ingénierie, c'est **la condition de viabilité du produit**, et elle se règle par une entente, pas par du code.

### Recommandation

1. **Bâtir dès maintenant l'ingestion des données ouvertes.** Elle est légale, gratuite, immédiate, et fait tourner cinq des huit règles sur des données réelles — assez pour une démonstration crédible auprès du Registraire et des premiers cabinets pilotes.
2. **Afficher l'origine et la fraîcheur de chaque donnée.** Le jeu ouvert accuse jusqu'à quinze jours de retard sur le registre : un outil d'audit doit le dire, pas le masquer.
3. **Engager la démarche contractuelle en parallèle**, en présentant l'usage professionnel encadré (cabinets identifiés, finalité déclarée par dossier, journal d'accès inaltérable — tout cela est déjà implémenté) comme argument de conformité auprès du Registraire.
4. **Ne pas construire d'extraction automatisée du service de consultation** en attendant. Le gain à court terme ne vaut pas le risque pour un produit dont la valeur repose sur son caractère opposable.

## 4. Sources

- [Jeu de données « Registre des entreprises » — Données Québec](https://www.donneesquebec.ca/recherche/dataset/registre-des-entreprises)
- [Guide d'utilisation officiel — *Données publiques sur les entreprises au Québec* (PDF, Registraire des entreprises, 2025)](https://www.donneesquebec.ca/recherche/dataset/6f710997-b5f9-4347-893b-1a47ddb61437/resource/09008d3a-2e0e-4613-ab43-bd833f381929/download/guideutilisation.pdf)
- [Registraire des entreprises — page des données ouvertes](https://www.registreentreprises.gouv.qc.ca/RQAnonymeGR/GR/GR03/GR03A2_22A_PIU_RecupDonnPub_PC/PageDonneesOuvertes.aspx)
- [Demander une compilation de renseignements — Québec.ca](https://www.quebec.ca/en/businesses-and-self-employed-workers/find-information-about-enterprise/request-a-compilation-of-information-from-the-registraire-des-entreprises)
- [Tarifs du Registraire — autres produits et services](https://www.quebec.ca/entreprises-et-travailleurs-autonomes/tarifs-registraire-entreprises/autres-produits-services)
