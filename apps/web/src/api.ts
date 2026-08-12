/** Client de l'API VéloceREQ. Les types reflètent les réponses du serveur. */

export type Niveau = 'faible' | 'moyen' | 'eleve';
export type Severite = 'info' | 'faible' | 'moyen' | 'eleve';

export interface ResultatRecherche {
  type: 'entite' | 'personne';
  id: string;
  libelle: string;
  neq?: string;
  pertinence: number;
  motifCorrespondance: 'neq' | 'nom_exact' | 'nom_partiel' | 'nom_similaire' | 'nom_anterieur';
  statut?: string;
  formeJuridique?: string;
  score?: number;
  niveau?: Niveau;
}

export interface Entite {
  id: string;
  neq: string;
  nomLegal: string;
  nomsAnterieurs: string[];
  formeJuridique: string;
  statut: string;
  codeNaics?: string;
  dateConstitution: string;
  dateDissolution?: string;
}

export interface Personne {
  id: string;
  nomComplet: string;
  variantesNom: string[];
  scoreConfianceIdentite: number;
}

export interface Contribution {
  typeRegle: string;
  severiteMax: Severite;
  occurrences: number;
  points: number;
}

export interface RedFlag {
  typeRegle: string;
  entiteId: string;
  severite: Severite;
  explication: string;
  elementsNommes?: {
    entites: { id: string; libelle: string }[];
    personnes: { id: string; libelle: string }[];
    adresses: { id: string; libelle: string }[];
    avisReq: string[];
  };
}

export interface FicheEntite {
  entite: Entite;
  score: { score: number; niveau: Niveau; contributions: Contribution[]; bonusFaisceau: number } | null;
  administrateurs: {
    id: string;
    titre: string;
    depuis: string;
    jusquA?: string;
    avisReqId: string;
    personne?: Personne;
    actif: boolean;
  }[];
  actionnaires: {
    id: string;
    pourcentage: number;
    typeTitre?: string;
    depuis: string;
    jusquA?: string;
    avisReqId: string;
    detenteur: { type: string; nomLegal?: string; nomComplet?: string; id?: string };
    actif: boolean;
  }[];
  participations: {
    id: string;
    pourcentage: number;
    depuis: string;
    avisReqId: string;
    cible?: Entite;
    actif: boolean;
  }[];
  adresses: {
    id: string;
    typeLien: string;
    depuis: string;
    jusquA?: string;
    adresse?: { adresseNormalisee: string; codePostal?: string };
    actif: boolean;
  }[];
  evenements: Evenement[];
}

export interface Evenement {
  id: string;
  entiteId: string;
  type: string;
  dateEffective: string;
  description: string;
  avisReqId: string;
  entite?: string;
  estEntitePrincipale?: boolean;
}

export interface NoeudGraphe {
  id: string;
  type: 'entite' | 'personne';
  libelle: string;
  neq?: string;
  statut?: string;
  score: number;
  niveau: Niveau;
  estRacine: boolean;
}

export interface AreteGraphe {
  id: string;
  type: 'detention' | 'administration';
  source: string;
  cible: string;
  libelle: string;
  pourcentage?: number;
  actif: boolean;
  enCycle: boolean;
  avisReqId: string;
}

export interface Graphe {
  racineId: string;
  degres: number;
  noeuds: NoeudGraphe[];
  aretes: AreteGraphe[];
  cycles: { entites: string[]; relations: string[] }[];
}

export interface Maillon {
  relationId: string;
  pourcentage: number;
  avisReqId: string;
  deLibelle?: string;
  versLibelle?: string;
}

export interface Ubo {
  entiteRacineId: string;
  indetermine: boolean;
  beneficiaires: {
    personneId: string;
    pourcentageEffectif: number;
    atteintSeuil: boolean;
    personne?: Personne;
    chaine: Maillon[];
  }[];
  cheminsSousSeuil: Ubo['beneficiaires'];
  anglesMorts: { motif: string; explication: string; entite?: string; personne?: string }[];
}

export interface TableauDeBord {
  statistiques: {
    entites: number;
    dossiersActifs: number;
    redFlags: number;
    entitesRisqueEleve: number;
  };
  dossiers: {
    id: string;
    nom: string;
    client: string;
    mode: string;
    statut: string;
    echeance: string | null;
    nb_entites: number;
    score_max: number;
  }[];
  entitesARisque: {
    entiteId: string;
    nom: string;
    neq: string;
    score: number;
    niveau: Niveau;
    principauxSignaux: string[];
  }[];
}

export interface FlagsEntite {
  entiteId: string;
  score: number;
  niveau: Niveau;
  contributions: Contribution[];
  bonusFaisceau: number;
  flags: RedFlag[];
}

async function obtenir<T>(chemin: string): Promise<T> {
  const reponse = await fetch(chemin);
  if (!reponse.ok) {
    const corps = await reponse.json().catch(() => ({ erreur: reponse.statusText }));
    throw new Error(corps.erreur ?? `Requête échouée (${reponse.status})`);
  }
  return reponse.json() as Promise<T>;
}

export const api = {
  rechercher: (q: string, similarite = true) =>
    obtenir<{ requete: string; resultats: ResultatRecherche[] }>(
      `/api/recherche?q=${encodeURIComponent(q)}&similarite=${similarite}`,
    ),
  fiche: (id: string) => obtenir<FicheEntite>(`/api/entites/${encodeURIComponent(id)}`),
  graphe: (id: string, degres = 2) =>
    obtenir<Graphe>(`/api/entites/${encodeURIComponent(id)}/graphe?degres=${degres}`),
  ubo: (id: string) => obtenir<Ubo>(`/api/entites/${encodeURIComponent(id)}/ubo`),
  chronologie: (id: string) =>
    obtenir<{ entiteId: string; evenements: Evenement[] }>(
      `/api/entites/${encodeURIComponent(id)}/chronologie`,
    ),
  flags: (id: string) => obtenir<FlagsEntite>(`/api/entites/${encodeURIComponent(id)}/flags`),
  tableauDeBord: () => obtenir<TableauDeBord>('/api/tableau-de-bord'),
};

/** Libellés lisibles des règles de détection, utilisés partout dans l'interface. */
export const LIBELLES_REGLES: Record<string, string> = {
  cycle_detention: 'Cycle de détention',
  cascade_excessive: 'Cascade de sociétés interposées',
  administrateur_recurrent: 'Administrateur récurrent en entités défaillantes',
  prete_nom_probable: 'Profil de prête-nom probable',
  transfert_avant_evenement_critique: 'Transfert avant événement critique',
  dissolution_reconstitution: 'Dissolution puis reconstitution apparentée',
  adresse_partagee_massive: 'Grappe d’entités à une même adresse',
  changement_avant_evenement_critique: 'Changement d’identité avant événement critique',
};

export const LIBELLES_EVENEMENTS: Record<string, string> = {
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

export const LIBELLES_STATUTS: Record<string, string> = {
  immatriculee: 'Immatriculée',
  radiee_office: 'Radiée d’office',
  radiee_volontaire: 'Radiée volontairement',
  dissoute: 'Dissoute',
  fusionnee: 'Fusionnée',
};

export const LIBELLES_FORMES: Record<string, string> = {
  societe_par_actions: 'Société par actions',
  societe_nom_collectif: 'Société en nom collectif',
  societe_commandite: 'Société en commandite',
  entreprise_individuelle: 'Entreprise individuelle',
  cooperative: 'Coopérative',
  association: 'Association',
  autre: 'Autre',
};
