/**
 * Types du domaine corporatif québécois.
 *
 * Règle structurante : toute relation porte l'identifiant de l'avis REQ qui
 * l'atteste (`avisReqId`). Une arête sans source officielle n'existe pas —
 * c'est ce qui rend une conclusion opposable (voir docs/velocereq/04).
 */

export type IdentifiantEntite = string;
export type IdentifiantPersonne = string;
export type IdentifiantAdresse = string;

export type StatutEntite =
  | 'immatriculee'
  | 'radiee_office'
  | 'radiee_volontaire'
  | 'dissoute'
  | 'fusionnee';

export type FormeJuridique =
  | 'societe_par_actions'
  | 'societe_nom_collectif'
  | 'societe_commandite'
  | 'entreprise_individuelle'
  | 'cooperative'
  | 'association'
  | 'autre';

export interface Entite {
  id: IdentifiantEntite;
  neq: string;
  nomLegal: string;
  nomsAnterieurs: string[];
  formeJuridique: FormeJuridique;
  statut: StatutEntite;
  codeNaics?: string;
  dateConstitution: string;
  dateDissolution?: string;
  /** Vrai pour les formes où une cascade profonde est une pratique normale
   *  (fonds, sociétés de gestion de portefeuille structurées). Atténue la
   *  règle de cascade excessive pour éviter les faux positifs. */
  structureConnue?: boolean;
}

export interface Personne {
  id: IdentifiantPersonne;
  nomComplet: string;
  variantesNom: string[];
  /** Confiance de la résolution d'identité, 1 = identité non ambiguë. */
  scoreConfianceIdentite: number;
}

export interface Adresse {
  id: IdentifiantAdresse;
  adresseNormalisee: string;
  codePostal?: string;
  /** Adresse d'un domiciliataire/cabinet connu : une forte concentration
   *  d'entités y est attendue et ne constitue pas en soi un signal. */
  domiciliataireConnu?: boolean;
}

export interface RelationDetention {
  id: string;
  /** Détenteur : une entité OU une personne physique, jamais les deux. */
  sourceEntiteId?: IdentifiantEntite;
  sourcePersonneId?: IdentifiantPersonne;
  cibleEntiteId: IdentifiantEntite;
  /** Fraction entre 0 et 1 (0.65 = 65 %). */
  pourcentage: number;
  typeTitre?: string;
  depuis: string;
  jusquA?: string;
  avisReqId: string;
}

export interface RelationAdministration {
  id: string;
  personneId: IdentifiantPersonne;
  entiteId: IdentifiantEntite;
  titre: string;
  depuis: string;
  jusquA?: string;
  avisReqId: string;
}

export type TypeLienAdresse = 'siege_social' | 'etablissement' | 'residence' | 'correspondance';

export interface LienAdresse {
  id: string;
  adresseId: IdentifiantAdresse;
  entiteId?: IdentifiantEntite;
  personneId?: IdentifiantPersonne;
  typeLien: TypeLienAdresse;
  depuis: string;
  jusquA?: string;
}

export type TypeEvenement =
  | 'constitution'
  | 'changement_nom'
  | 'changement_siege'
  | 'changement_administrateur'
  | 'transfert_actions'
  | 'fusion'
  | 'scission'
  | 'dissolution'
  | 'radiation'
  | 'faillite'
  | 'proposition_concordataire';

export interface Evenement {
  id: string;
  entiteId: IdentifiantEntite;
  type: TypeEvenement;
  dateEffective: string;
  description: string;
  avisReqId: string;
}

/**
 * Instantané du graphe corporatif sur lequel opèrent tous les algorithmes.
 * Volontairement une structure de données inerte : le moteur est une fonction
 * pure du graphe, ce qui le rend testable et rejouable sur un état historique.
 */
export interface GrapheCorporatif {
  entites: Entite[];
  personnes: Personne[];
  adresses: Adresse[];
  detentions: RelationDetention[];
  administrations: RelationAdministration[];
  liensAdresse: LienAdresse[];
  evenements: Evenement[];
}

export const grapheVide = (): GrapheCorporatif => ({
  entites: [],
  personnes: [],
  adresses: [],
  detentions: [],
  administrations: [],
  liensAdresse: [],
  evenements: [],
});

/** Une relation est-elle active à la date donnée ? */
export function estActive(
  relation: { depuis: string; jusquA?: string },
  date?: string,
): boolean {
  if (!date) return !relation.jusquA;
  if (relation.depuis > date) return false;
  return !relation.jusquA || relation.jusquA > date;
}

/** Écart en jours entre deux dates ISO (aaaa-mm-jj). Positif si `fin` > `debut`. */
export function ecartJours(debut: string, fin: string): number {
  const ms = Date.parse(fin) - Date.parse(debut);
  return Math.round(ms / 86_400_000);
}

/** Libellés lisibles des statuts et formes juridiques, partagés par l'API,
 *  les rapports et l'interface — un document d'audit ne montre jamais la
 *  valeur brute d'une énumération. */
export const LIBELLES_STATUTS: Record<StatutEntite, string> = {
  immatriculee: 'Immatriculée',
  radiee_office: 'Radiée d’office',
  radiee_volontaire: 'Radiée volontairement',
  dissoute: 'Dissoute',
  fusionnee: 'Fusionnée',
};

export const LIBELLES_FORMES: Record<FormeJuridique, string> = {
  societe_par_actions: 'Société par actions',
  societe_nom_collectif: 'Société en nom collectif',
  societe_commandite: 'Société en commandite',
  entreprise_individuelle: 'Entreprise individuelle',
  cooperative: 'Coopérative',
  association: 'Association',
  autre: 'Autre',
};

export const LIBELLES_EVENEMENTS: Record<TypeEvenement, string> = {
  constitution: 'Constitution',
  changement_nom: 'Changement de dénomination',
  changement_siege: 'Changement de siège social',
  changement_administrateur: 'Changement d’administrateur',
  transfert_actions: 'Transfert d’actions',
  fusion: 'Fusion',
  scission: 'Scission',
  dissolution: 'Dissolution',
  radiation: 'Radiation',
  faillite: 'Faillite',
  proposition_concordataire: 'Proposition concordataire',
};
