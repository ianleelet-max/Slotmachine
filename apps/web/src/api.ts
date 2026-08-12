/** Client de l'API AudiTREQ. Les types reflètent les réponses du serveur. */

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

/**
 * Requêtes en vol, par URL.
 *
 * Deux appels identiques lancés avant que le premier n'ait répondu partagent sa
 * promesse. Ce n'est pas qu'une économie de réseau : chaque consultation est
 * inscrite au journal d'accès, et un journal qui enregistre deux fois le même
 * geste perd sa valeur probante. Le cas se produit notamment sous React
 * StrictMode, qui exécute les effets deux fois en développement.
 */
const requetesEnVol = new Map<string, Promise<unknown>>();

async function obtenir<T>(chemin: string): Promise<T> {
  const enCours = requetesEnVol.get(chemin);
  if (enCours) return enCours as Promise<T>;

  const promesse = (async () => {
    const reponse = await fetch(chemin);
    if (!reponse.ok) {
      const corps = await reponse.json().catch(() => ({ erreur: reponse.statusText }));
      throw new Error(corps.erreur ?? `Requête échouée (${reponse.status})`);
    }
    return reponse.json() as Promise<T>;
  })().finally(() => requetesEnVol.delete(chemin));

  requetesEnVol.set(chemin, promesse);
  return promesse;
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

/* ------------------------------------------------------- Dossiers (V1) */

export interface Dossier {
  id: string;
  nom: string;
  client: string | null;
  finalite_declaree: string;
  mode: string;
  statut: string;
  echeance: string | null;
  cree_le: string;
  nb_entites?: number;
}

export interface EntiteDossier {
  entiteId: string;
  nomLegal: string;
  neq?: string;
  statut?: string;
  nbSignaux: number;
  severiteMax: Niveau;
  ajouteLe: string;
}

export interface Annotation {
  id: string;
  contenu: string;
  cree_le: string;
  auteur: string;
  entite_cible_id: string | null;
  entiteLibelle: string | null;
}

export interface DetailDossier {
  dossier: Dossier;
  entites: EntiteDossier[];
  annotations: Annotation[];
}

export interface Comparaison {
  dateAvant: string;
  dateApres: string;
  aucunChangement: boolean;
  detentions: {
    nature: 'apparu' | 'disparu' | 'modifie';
    relationId: string;
    detenteurLibelle: string;
    cibleLibelle: string;
    pourcentageAvant?: number;
    pourcentageApres?: number;
    avisReqId: string;
  }[];
  administrations: {
    nature: 'apparu' | 'disparu' | 'modifie';
    relationId: string;
    personneLibelle: string;
    entiteLibelle: string;
    titre: string;
    avisReqId: string;
  }[];
  entites: {
    nature: 'apparu' | 'disparu' | 'modifie';
    entiteId: string;
    libelle: string;
    detail: string;
  }[];
}

export interface EntreeJournal {
  id: string;
  action: string;
  finalite: string | null;
  contexte: Record<string, unknown>;
  horodate: string;
  dossier_id: string | null;
  utilisateur: string | null;
}

async function envoyer<T>(chemin: string, corps: unknown, methode = 'POST'): Promise<T> {
  const reponse = await fetch(chemin, {
    method: methode,
    headers: { 'Content-Type': 'application/json' },
    body: corps === undefined ? undefined : JSON.stringify(corps),
  });
  if (!reponse.ok) {
    const detail = await reponse.json().catch(() => ({ erreur: reponse.statusText }));
    throw new Error(detail.erreur ?? `Requête échouée (${reponse.status})`);
  }
  return reponse.json() as Promise<T>;
}

export const apiDossiers = {
  liste: () => obtenirPublic<{ dossiers: Dossier[] }>('/api/dossiers'),
  detail: (id: string) => obtenirPublic<DetailDossier>(`/api/dossiers/${encodeURIComponent(id)}`),
  creer: (corps: { nom: string; client?: string; finaliteDeclaree: string; echeance?: string }) =>
    envoyer<{ id: string }>('/api/dossiers', corps),
  ajouterEntite: (dossierId: string, entiteId: string) =>
    envoyer<{ ajoute: boolean }>(`/api/dossiers/${encodeURIComponent(dossierId)}/entites`, {
      entiteId,
    }),
  annoter: (dossierId: string, contenu: string, entiteCibleId?: string) =>
    envoyer<{ id: string }>(`/api/dossiers/${encodeURIComponent(dossierId)}/annotations`, {
      contenu,
      entiteCibleId,
    }),
  urlRapport: (dossierId: string) =>
    `/api/dossiers/${encodeURIComponent(dossierId)}/rapport?format=html`,
  comparer: (avant: string, apres: string) =>
    obtenirPublic<Comparaison>(
      `/api/comparaison?avant=${encodeURIComponent(avant)}&apres=${encodeURIComponent(apres)}`,
    ),
  journal: (limite = 40) => obtenirPublic<{ entrees: EntreeJournal[] }>(`/api/journal?limite=${limite}`),
  provenance: () => obtenirPublic<Provenance>('/api/provenance'),
};

const obtenirPublic = obtenir;

export interface Provenance {
  provenance: {
    source: 'donnees_ouvertes_req' | 'registre_consultation' | 'demonstration';
    dateExtraction: string;
    cadence?: string;
    licence?: string;
  } | null;
  couverture: {
    entites: number;
    personnes: number;
    detentions: number;
    reglesInactives: string[];
    motifInactivite: string | null;
  };
}

/* ------------------------------------------------- Captures assistées */

export type NiveauConfiance = 'certain' | 'probable' | 'incertain';

export interface ChampCapture<T = string> {
  valeur: T;
  libelleSource: string;
  confiance: NiveauConfiance;
  extraitBrut: string;
}

export interface PersonneCapturee {
  nomComplet: ChampCapture;
  role: string;
  fonction?: ChampCapture;
  adresse?: ChampCapture;
  pourcentage?: ChampCapture<number>;
  dateDebut?: ChampCapture;
  dateFin?: ChampCapture;
  estPersonneMorale: boolean;
}

export interface CaptureFiche {
  neq?: ChampCapture;
  nomLegal?: ChampCapture;
  statut?: ChampCapture;
  formeJuridique?: ChampCapture;
  adresseSiege?: ChampCapture;
  personnes: PersonneCapturee[];
  urlSource: string;
  captureLe: string;
  sectionsNonReconnues: string[];
  avertissements: string[];
}

export interface Capture {
  id: string;
  dossier_id: string | null;
  dossier_nom: string | null;
  url_source: string;
  capture_le: string;
  neq: string | null;
  contenu: CaptureFiche;
  statut: 'en_attente' | 'validee' | 'rejetee';
  motif_rejet: string | null;
  champsARelire: string[];
}

export interface BilanIntegration {
  entiteId: string;
  personnesCreees: number;
  administrations: number;
  detentions: number;
  rapprochementsProposes: number;
}

export const apiCaptures = {
  liste: (statut: string) =>
    obtenirPublic<{ captures: Capture[] }>(`/api/captures?statut=${encodeURIComponent(statut)}`),
  valider: (id: string) =>
    envoyer<BilanIntegration>(`/api/captures/${encodeURIComponent(id)}/valider`, {}),
  rejeter: (id: string, motif?: string) =>
    envoyer<{ statut: string }>(`/api/captures/${encodeURIComponent(id)}/rejeter`, { motif }),
};

export const LIBELLES_SOURCES: Record<string, string> = {
  donnees_ouvertes_req: 'Données ouvertes du Registraire des entreprises',
  registre_consultation: 'Consultation du registre',
  demonstration: 'Jeu de démonstration — données fictives',
};

export const LIBELLES_ACTIONS: Record<string, string> = {
  recherche: 'Recherche',
  'entite.consultation': 'Consultation de fiche',
  'dossier.creation': 'Création de dossier',
  'dossier.consultation': 'Consultation de dossier',
  'dossier.ajout_entite': 'Ajout d’une entité au dossier',
  'dossier.retrait_entite': 'Retrait d’une entité du dossier',
  'annotation.creation': 'Note ajoutée',
  'rapport.generation': 'Génération de rapport',
  'capture.reception': 'Capture reçue du navigateur',
  'capture.validation': 'Capture validée et intégrée',
  'capture.rejet': 'Capture rejetée',
};
