// Types canoniques pour BORNE - Plateforme québécoise du certificat de localisation

export type VoieRecommandee = 'V0' | 'V1' | 'V2' | 'V3';

export type StatutGravite = 'nulle' | 'mineure' | 'majeure';

export interface PreuveDetecteur {
  source: string;
  date: string;
  extrait: string;
  url: string;
  zoneDoc?: string;
  pageDoc?: number;
}

export interface ResultatDetecteur {
  id: 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6' | 'D7';
  nom: string;
  declenche: boolean;
  confiance: number; // 0..1
  gravite: StatutGravite;
  preuve: PreuveDetecteur;
  descriptionDetaillee: string;
}

export interface CertificatSource {
  numeroMinute: string;
  arpenteurNom: string;
  arpenteurMatricule: string;
  firme: string;
  dateSignature: string;
  dateLeve: string;
  lotsCadastraux: string[];
  circonscriptionFonciere: string;
  cadastreRenove: boolean;
  superficieM2: number;
  dimensionsPerimetre: { cote: string; dimensionM: number; tolerance: string }[];
  batiments: {
    type: string;
    distancesAuxLimites: { nord: number; sud: number; est: number; ouest: number };
    empriseM2: number;
    anneeConstruction?: number;
  }[];
  servitudesActives: { numeroInscription: string; beneficiaire: string; objet: string; date: string }[];
  servitudesPassives: { numeroInscription: string; fardeau: string; objet: string; date: string }[];
  empietements: { nature: string; sens: 'exercé' | 'souffert'; ampleurM: number; description: string }[];
  zonageCite: string;
  margesCitees: { avant: number; arriere: number; laterales: { gauche: number; droite: number } };
  contraintes: { type: 'inondable' | 'rive' | 'agricole' | 'patrimoine' | 'aeronautique'; detail: string }[];
  reservesEtOpinions: string[];
  confianceExtraction: Record<string, number>;
  sourcePage: Record<string, number>;
  sourceZone: Record<string, string>;
}

export interface Immeuble {
  id: string;
  lotsCadastraux: string[];
  circonscriptionFonciere: string;
  cadastreRenove: boolean;
  adresse: string;
  municipalite: string;
  mrc: string;
  regionAdministrative: string;
  codePostal: string;
  coordonneesMTM: { x: number; y: number; fuseau: number };
  superficieCadastraleM2: number;
}

export interface Certificat {
  id: string;
  immeubleId: string;
  source: 'déposé' | 'produit via BORNE';
  arpenteurMatricule: string;
  arpenteurNom: string;
  firme: string;
  dateSignature: string;
  dateLeve: string;
  numeroMinute: string;
  fichierOriginal: string;
  donneesExtraites: CertificatSource;
  confianceExtractionGlobale: number;
  statutVerification: 'valide' | 'a_reviser' | 'obsolete';
}

export interface AnalyseChangement {
  id: string;
  certificatId: string;
  dateAnalyse: string;
  detecteurs: ResultatDetecteur[];
  scoreValiditeBorne: number; // 0..100
  voieRecommandee: VoieRecommandee;
  empreinteCryptographique: string; // SHA-256
  horodatageQualifie: string;
}

export type FamilleVerification = 'Titres et cadastre' | 'Géométrie' | 'Réglementaire' | 'Contraintes';
export type NatureVerification = 'déterministe' | 'interprétative';
export type VerdictArpenteur = 'en_attente' | 'validée' | 'corrigée' | 'rejetée';
export type NatureEcart = 'aucune' | 'omission' | 'source périmée' | 'mauvaise source' | 'erreur d\'interprétation' | 'désaccord légitime';

export interface VerificationNorme {
  numero: number;
  articleNorme: string;
  titre: string;
  famille: FamilleVerification;
  nature: NatureVerification;
  conclusionMachine: string;
  sourceMachine: { url: string; date: string; extrait: string; typeSource: string };
  confianceMachine: number;
  valeurCadastre?: { valeur: string; tolerance: string };
  valeurLeve?: { valeur: string; tolerance: string };
  conclusionHumaine?: string;
  verdictArpenteur: VerdictArpenteur;
  natureEcart?: NatureEcart;
  horodatageVerdict?: string;
  commentaireArpenteur?: string;
}

export interface DossierArpentage {
  id: string;
  immeuble: Immeuble;
  certificatInitial?: Certificat;
  analyse?: AnalyseChangement;
  voie: VoieRecommandee;
  statut: 'nouveau' | 'pre_instruit' | 'en_validation_arpenteur' | 'signe_notarius' | 'livre';
  clientId: string;
  clientNom: string;
  firmeId: string;
  firmeNom: string;
  arpenteurSignataireMatricule?: string;
  arpenteurSignataireNom?: string;
  prixDevis: number;
  prixFinal: number;
  datePromise: string;
  dateLivree?: string;
  heuresMachineEstimees: number;
  heuresHumainesPassees: number;
  kmParcourus: number;
  verifications: VerificationNorme[];
  journalAudit: { date: string; auteur: string; action: string; details: string; empreinte: string }[];
  partageTokens: { destinataire: string; role: 'notaire' | 'courtier' | 'preteur'; actif: boolean; expiration: string; accesses: number }[];
}

export interface RefusMotif {
  id: string;
  dateRefus: string;
  typeIntervenant: 'notaire' | 'prêteur' | 'courtier' | 'assureur';
  nomInstitution: string;
  regionAdministrative: string;
  dateCertificatRefuse: string;
  ageCertificatAnnees: number;
  motifInvoque: 
    | 'âge du certificat (>10 ans)'
    | 'changement physique identifié'
    | 'servitude nouvelle'
    | 'changement de zonage'
    | 'politique interne de l\'institution'
    | 'usage du marché'
    | 'autre';
  fondementCite: {
    type: 'loi' | 'règlement' | 'politique interne' | 'usage' | 'aucun fondement cité';
    reference: string;
  };
  changementFactuelDemontre: boolean;
  scoreValiditeBorneAuMoment: number;
}

export interface FirmePublique {
  id: string;
  nom: string;
  region: string;
  delaiMedianJours: number;
  prixMedian: number;
  volumeDossiersAn: number;
  tauxRevision: number; // %
  tauxRetour: number; // %
  nbArpenteurs: number;
  repertoireOagqUrl: string;
  decisionsDisciplineUrl?: string;
  reponsePublique?: string;
}

export interface EcartJournal {
  id: string;
  dossierId: string;
  verificationId: number;
  familleVerification: FamilleVerification;
  conclusionMachine: string;
  confianceMachine: number;
  sourceMachine: string;
  conclusionHumaine: string;
  verdict: 'validée' | 'corrigée' | 'rejetée';
  natureEcart: NatureEcart;
  quiAvaitRaison: 'machine' | 'humain' | 'indéterminé' | 'les deux défendables';
  date: string;
}
