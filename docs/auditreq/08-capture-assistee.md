# AudiTREQ — Capture assistée du registre

> Répond au manque identifié au [document 07](./07-acces-donnees-req.md) : les données ouvertes du REQ ne publient aucune personne physique, et le service de consultation — qui les publie — n'est pas conçu pour l'extraction automatisée.

## 1. Le problème posé, et la ligne qui le tranche

Il manque au produit les administrateurs, les actionnaires et les bénéficiaires ultimes. Ils existent, publiquement, dans le service de consultation du registre. La tentation évidente est d'écrire un robot qui va les chercher.

Le Registraire a imposé des conditions d'utilisation à ce service **depuis mars 2016, précisément par crainte de l'extraction massive** : elles visent la moisson de données, leur usage lucratif et leur reproduction à des fins de diffusion.

La question déterminante n'est donc pas *où tourne le code*, mais **qui déclenche chaque consultation et à quel rythme**. Un agent qui énumère des fiches à vitesse machine reste de l'extraction massive, qu'il s'exécute sur un serveur ou sur le portable d'un syndic. Déplacer ce code sur le poste du professionnel ne change pas la nature de l'acte : cela transfère la responsabilité vers celui qui a accepté les conditions — un très mauvais service à rendre à quelqu'un dont le titre professionnel est en jeu.

**La conception retenue en tire la conséquence : l'outil ne consulte jamais le registre. Il structure ce que le professionnel a lui-même ouvert.**

## 2. Ce que l'extension fait, et ce qu'elle ne fera pas

| Fait | Ne fait pas |
|---|---|
| S'exécute sur clic explicite de l'utilisateur | Ne tourne pas en arrière-plan |
| Lit la page affichée dans l'onglet actif | N'ouvre aucun onglet, ne suit aucun lien |
| Traduit le DOM en structure neutre | N'émet aucune requête vers le registre |
| Envoie à l'instance locale du professionnel | N'envoie rien à un serveur tiers |
| Dépose la capture en file d'attente | N'écrit jamais directement dans le graphe |

Cette liste n'est pas une déclaration d'intention : elle est vérifiable dans `apps/extension/`, qui tient en trois fichiers courts et ne demande que les permissions `activeTab` et `scripting`.

## 3. Pourquoi ce modèle sert mieux le produit

Ce n'est pas un compromis subi. La capture assistée est **supérieure au scraping** pour un outil dont la valeur repose sur l'opposabilité :

- **La traçabilité est renforcée, pas affaiblie.** Chaque fait capturé est rattaché à une page que le professionnel a réellement consultée, horodatée, avec son URL. Une donnée moissonnée par un serveur, personne ne peut en jurer l'origine ; une donnée capturée depuis la fiche qu'on avait sous les yeux, si.
- **Le volume s'autorégule** par construction, sans quota à implémenter.
- **Le geste existe déjà.** Le professionnel consulte le registre fiche par fiche. On lui retire la ressaisie, pas le contrôle.

## 4. Architecture

```
Navigateur du professionnel                    Poste du professionnel
┌─────────────────────────────┐                ┌──────────────────────────────┐
│ Fiche du registre (ouverte  │                │  AudiTREQ (instance locale)  │
│ par l'utilisateur)          │                │                              │
│          ↓ clic             │                │  POST /api/captures          │
│  extraction.js              │ ──────────────▶│    ↓                         │
│  DOM → ExtraitPage          │   JSON, en     │  @auditreq/capture           │
│  (titres, tableaux, paires) │   local        │  interpreter()               │
└─────────────────────────────┘                │    ↓                         │
                                               │  file d'attente (table       │
                                               │  capture, statut en_attente) │
                                               │    ↓ validation humaine      │
                                               │  graphe (personnes,          │
                                               │  mandats, détentions)        │
                                               └──────────────────────────────┘
```

### 4.1 Une représentation intermédiaire neutre

Le script de contenu ne comprend rien au droit corporatif : il produit une `ExtraitPage` — des sections avec leurs titres, leurs tableaux et leurs paires libellé/valeur. L'interprétation se fait dans `@auditreq/capture`, hors du navigateur.

Cette séparation a trois vertus :

1. L'interprétation est **testable sans navigateur** (19 tests).
2. Une refonte visuelle du registre n'affecte que le parcours du DOM.
3. Le code injecté dans la page reste court, donc auditable par qui veut vérifier ce qu'il fait.

### 4.2 Reconnaissance par libellés, pas par sélecteurs

Le parseur reconnaît « Administrateurs », « Trois principaux actionnaires », « Bénéficiaires ultimes » — du **vocabulaire juridique**, autrement plus stable qu'une classe CSS. Les colonnes sont appariées par leur en-tête, dans n'importe quel ordre, et un tableau sans en-tête est lu avec une confiance moindre plutôt que rejeté.

## 5. Ce qui protège la valeur probante

### 5.1 Chaque champ porte sa justification

```ts
interface ChampCapture<T> {
  valeur: T;
  libelleSource: string;   // le libellé rencontré dans la page
  confiance: 'certain' | 'probable' | 'incertain';
  extraitBrut: string;     // le texte d'où la valeur est tirée
}
```

Un rapport peut ainsi citer non seulement la valeur, mais la phrase de la page dont elle provient.

### 5.2 Les tranches ne deviennent pas des chiffres

La LPLE n'exige que l'identification des trois principaux actionnaires, souvent par tranche (« 50 % ou plus »). Le parseur retient la borne inférieure et marque la lecture comme **approximative**. Annoncer 50 % comme certain fausserait un calcul de bénéficiaire ultime, et un rapport d'audit ne peut pas se le permettre.

### 5.3 Rien n'est deviné

Une section reconnue mais illisible produit un avertissement ; une section inconnue est listée comme non reconnue ; un NEQ qui ne compte pas dix chiffres est retenu mais marqué incertain et signalé. Le parseur ne comble jamais un trou par interpolation.

### 5.4 La validation humaine est un passage obligé

Une capture entre en file d'attente avec le statut `en_attente`. L'écran **Captures** met en avant ce qui mérite relecture — champs à confiance moindre, avertissements — plutôt que de présenter un résultat lisse. Le graphe n'est modifié qu'à la validation explicite, et l'opération est journalisée.

### 5.5 Aucune fusion d'identité automatique

À l'intégration, une personne homonyme déjà présente **ne devient pas** la même personne : une fiche distincte est créée et une proposition de rapprochement est inscrite, qu'un humain tranchera.

Ce point a révélé un défaut réel lors des essais : le registre présente les noms tantôt « Prénom Nom », tantôt « Nom, Prénom » — parfois **sur la même fiche**, selon la section. Jaro-Winkler seul attribuait 0,59 à « Josée Lemieux » et « Lemieux, Josée », si bien qu'une même personne entrait deux fois au graphe sans que le rapprochement soit seulement proposé. La comparaison de noms de personnes combine désormais Jaro-Winkler et le recouvrement de jetons.

### 5.6 La consultation devient une source au sens du graphe

Toute relation issue d'une capture porte un `avis_req` synthétique (`CAPTURE-<id>`) qui référence l'URL consultée et son horodatage. Le principe « aucune relation sans source » tient donc aussi pour ces données.

## 6. La place de l'IA

Volontairement, **aucune** pour l'instant. L'extraction est entièrement déterministe.

Un modèle de langage qui lit une page peut se tromper silencieusement, et dans un document destiné à être opposable, une valeur mal lue est pire qu'une valeur absente. Si l'IA devait intervenir, ce serait sous quatre conditions :

1. **En second rang seulement**, sur les cas que le parseur déterministe échoue à lire.
2. **Jamais sur un chiffre** — pourcentages et dates restent déterministes ou absents.
3. **Marquage distinct** : tout champ dérivé par IA porte `confiance: 'incertain'` et est signalé comme tel à l'écran.
4. **Capture brute conservée**, pour qu'une relecture humaine reste possible des mois plus tard.

## 7. Ce qui reste à faire

- **Confronter le parseur à la vraie page.** La mise en page réelle du registre n'a pas pu être observée depuis l'environnement de développement : les tests valident la tolérance du parseur, pas sa conformité à une page précise. Le premier essai en conditions réelles révélera des écarts que l'architecture est faite pour absorber.
- **Poser la question au Registraire.** Un outil professionnel qui expose sa méthode et demande confirmation se place bien mieux que celui qui se fait remarquer après coup. À mener avec la démarche d'entente sur les données (document 07).
- **Signer les captures.** Un condensat de la page capturée, horodaté, renforcerait encore la valeur probante.
- **Firefox.** Le manifeste est en MV3 ; le portage demande peu de travail mais n'est pas fait.
