/**
 * Spécification des fichiers de données ouvertes du Registraire des entreprises.
 *
 * Source : *Registraire des entreprises — Données publiques sur les entreprises
 * au Québec*, guide d'utilisation IN-537 (2025-11), publié avec le jeu de
 * données sur Données Québec.
 *
 * Rappel structurant : **ce jeu ne contient aucune personne physique**. Ni
 * administrateur, ni actionnaire, ni bénéficiaire ultime — le guide l'énonce
 * explicitement. L'ingestion produit donc un graphe d'entités, d'adresses et de
 * filiations, sans arête de détention ni d'administration. Voir
 * docs/auditreq/07-acces-donnees-req.md.
 *
 * Licence du jeu : CC BY-NC-SA 4.0 — usage non commercial.
 */

export interface FichierReq {
  /** Nom du fichier dans l'archive, sans extension. */
  nom: string;
  /** Colonnes attendues, dans l'ordre documenté. */
  colonnes: string[];
  /** Colonnes sans lesquelles le fichier est inutilisable. */
  colonnesRequises: string[];
}

export const FICHIER_ENTREPRISE: FichierReq = {
  nom: 'Entreprise',
  colonnes: [
    'NEQ',
    'IND_FAIL',
    'DAT_IMMAT',
    'COD_REGIM_JURI',
    'COD_INTVAL_EMPLO_QUE',
    'DAT_CESS_PREVU',
    'COD_STAT_IMMAT',
    'COD_FORME_JURI',
    'DAT_STAT_IMMAT',
    'COD_REGIM_JURI_CONSTI',
    'DAT_DEPO_DECLR',
    'AN_DECL',
    'AN_PROD',
    'DAT_LIMIT_PROD',
    'AN_PROD_PRE',
    'DAT_LIMIT_PROD_PRE',
    'DAT_MAJ_INDEX_NOM',
    'COD_ACT_ECON_CAE',
    'NO_ACT_ECON_ASSUJ',
    'DESC_ACT_ECON_ASSUJ',
    'COD_ACT_ECON_CAE2',
    'NO_ACT_ECON_ASSUJ2',
    'DESC_ACT_ECON_ASSUJ2',
    'NOM_LOCLT_CONSTI',
    'DAT_CONSTI',
    'IND_CONVEN_UNMN_ACTNR',
    'IND_RET_TOUT_POUVR',
    'IND_LIMIT_RESP',
    'DAT_DEB_RESP',
    'DAT_FIN_RESP',
    'OBJET_SOC',
    'NO_MTR_VOLONT',
    'ADR_DOMCL_ADR_DISP',
    'ADR_DOMCL_LIGN1_ADR',
    'ADR_DOMCL_LIGN2_ADR',
    'ADR_DOMCL_LIGN3_ADR',
    'ADR_DOMCL_LIGN4_ADR',
  ],
  colonnesRequises: ['NEQ'],
};

export const FICHIER_NOM: FichierReq = {
  nom: 'Nom',
  colonnes: [
    'NEQ',
    'NOM_ASSUJ',
    'NOM_ASSUJ_LANG_ETRNG',
    'STAT_NOM',
    'TYP_NOM_ASSUJ',
    'DAT_INIT_NOM_ASSUJ',
    'DAT_FIN_NOM_ASSUJ',
  ],
  colonnesRequises: ['NEQ', 'NOM_ASSUJ'],
};

export const FICHIER_ETABLISSEMENT: FichierReq = {
  nom: 'Etablissement',
  colonnes: [
    'NEQ',
    'NO_SUF_ETAB',
    'IND_ETAB_PRINC',
    'IND_SALON_BRONZ',
    'IND_VENTE_TABAC_DETL',
    'IND_DISP',
    'LIGN1_ADR',
    'LIGN2_ADR',
    'LIGN3_ADR',
    'LIGN4_ADR',
    'COD_ACT_ECON',
    'DESC_ACT_ECON_ETAB',
    'NO_ACT_ECON_ETAB',
    'COD_ACT_ECON2',
    'DESC_ACT_ECON_ETAB2',
    'NO_ACT_ECON_ETAB2',
    'NOM_ETAB',
  ],
  colonnesRequises: ['NEQ'],
};

export const FICHIER_FUSION_SCISSION: FichierReq = {
  nom: 'FusionScission',
  colonnes: [
    'NEQ',
    'NEQ_ASSUJ_REL',
    'DENOMN_SOC',
    'COD_RELA_ASSUJ',
    'DAT_EFCTVT',
    'IND_DISP',
    'LIGN1_ADR',
    'LIGN2_ADR',
    'LIGN3_ADR',
    'LIGN4_ADR',
  ],
  colonnesRequises: ['NEQ'],
};

export const FICHIER_CONTINUATION: FichierReq = {
  nom: 'ContinuationTransformation',
  colonnes: [
    'NEQ',
    'COD_TYP_CHANG',
    'COD_REGIM_JURI',
    'AUTR_REGIM_JURI',
    'NOM_LOCLT',
    'DAT_EFCTVT',
  ],
  colonnesRequises: ['NEQ'],
};

export const FICHIER_DOMAINE_VALEUR: FichierReq = {
  nom: 'DomaineValeur',
  colonnes: ['TYP_DOM_VAL', 'COD_DOM_VAL', 'VAL_DOM_FRAN'],
  colonnesRequises: ['TYP_DOM_VAL', 'COD_DOM_VAL', 'VAL_DOM_FRAN'],
};

export const FICHIERS = [
  FICHIER_ENTREPRISE,
  FICHIER_NOM,
  FICHIER_ETABLISSEMENT,
  FICHIER_FUSION_SCISSION,
  FICHIER_CONTINUATION,
  FICHIER_DOMAINE_VALEUR,
];

/**
 * Correspondance des formes juridiques du Registraire vers le vocabulaire du
 * domaine. Le fichier `DomaineValeur.csv` fournit les libellés officiels ; on
 * n'y lit que le libellé, jamais le code, parce que les codes ne sont pas
 * documentés dans le guide et peuvent évoluer.
 */
export function formeJuridiqueDepuisLibelle(libelle: string | undefined) {
  const texte = (libelle ?? '').toLowerCase();
  if (texte.includes('action')) return 'societe_par_actions' as const;
  if (texte.includes('nom collectif')) return 'societe_nom_collectif' as const;
  if (texte.includes('commandite')) return 'societe_commandite' as const;
  if (texte.includes('coop')) return 'cooperative' as const;
  if (texte.includes('association') || texte.includes('but non lucratif')) return 'association' as const;
  if (texte.includes('individuelle') || texte.includes('personne physique')) {
    return 'entreprise_individuelle' as const;
  }
  return 'autre' as const;
}

/**
 * Correspondance des statuts d'immatriculation.
 *
 * Le registre distingue la radiation d'office (défaut de déclaration annuelle)
 * de la dissolution volontaire : la première est un signal en soi, la seconde
 * beaucoup moins. La distinction est conservée.
 */
export function statutDepuisLibelle(libelle: string | undefined) {
  const texte = (libelle ?? '').toLowerCase();
  if (texte.includes('radi') && texte.includes('office')) return 'radiee_office' as const;
  if (texte.includes('radi')) return 'radiee_volontaire' as const;
  if (texte.includes('dissou')) return 'dissoute' as const;
  if (texte.includes('fusionn')) return 'fusionnee' as const;
  return 'immatriculee' as const;
}

/** Types de relation entre entités du fichier FusionScission / Continuation. */
export function typeSuccessionDepuisLibelle(libelle: string | undefined) {
  const texte = (libelle ?? '').toLowerCase();
  if (texte.includes('scission')) return 'scission' as const;
  if (texte.includes('transformation')) return 'transformation' as const;
  if (texte.includes('continuation')) return 'continuation' as const;
  return 'fusion' as const;
}
