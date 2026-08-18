export type StatutConformite = 'conforme' | 'alerte_mineure' | 'violation_critique' | 'en_attente_checkin';
export type NiveauRisque = 'faible' | 'modere' | 'eleve' | 'critique';

export interface ZoneGeofencing {
  id: string;
  nom: string;
  type: 'autorisee_travail' | 'autorisee_domicile' | 'interdite_contact' | 'interdite_alcool';
  latitude: number;
  longitude: number;
  rayonMetres: number;
  horaireDebut?: string;
  horaireFin?: string;
}

export interface ProgrammeReinsertion {
  id: string;
  titre: string;
  organisme: string;
  frequenceHebdo: number;
  heuresEffectuees: number;
  heuresRequises: number;
  prochaineSession: string;
  statut: 'en_cours' | 'conforme' | 'absence_signalee';
}

export interface CheckInBiometrique {
  id: string;
  sursitaireId: string;
  horodatage: string;
  typeBiometrie: 'reconnaissance_faciale' | 'empreinte_digitale' | 'verification_video_aleatoire';
  scoreMatching: number;
  hachagePreuve: string;
  latitude: number;
  longitude: number;
  adresseApprox: string;
  statut: 'valide' | 'echec_matching' | 'hors_zone' | 'retard';
}

export interface AlerteTempsReel {
  id: string;
  sursitaireId: string;
  dossierHorizonId: string;
  nomSursitaire: string;
  severite: 'critique' | 'avertissement' | 'info';
  typeAlerte: 'sortie_zone_interdite' | 'checkin_manque' | 'biometrie_echec' | 'horaire_non_respecte' | 'batterie_faible';
  message: string;
  horodatage: string;
  lu: boolean;
  latitude?: number;
  longitude?: number;
}

export interface Sursitaire {
  id: string;
  dossierHorizonId: string;
  nomComplet: string;
  photoUrl: string;
  telephone: string;
  agentProbationId: string;
  agentNom: string;
  
  // Projet 3 Horizon - Prise en charge & Contraintes
  dateDebutSursis: string;
  dateFinSursis: string;
  contraintes: string[];
  programmes: ProgrammeReinsertion[];
  zones: ZoneGeofencing[];

  // Projet 4 Horizon - Évaluation & Encadrement
  niveauRisque: NiveauRisque;
  scoreRisqueRTM: number;
  statutConformite: StatutConformite;
  dernierCheckIn?: CheckInBiometrique;
  
  // Position GPS Live
  dernierePosition: {
    latitude: number;
    longitude: number;
    adresse: string;
    derniereMiseAJour: string;
  };
}

export interface LogAuditLoi25 {
  id: string;
  horodatage: string;
  action: string;
  acteur: string;
  dossierCible: string;
  conformeLoi25: boolean;
  empreinteSecuritique: string;
}

export interface SlidePitch {
  id: number;
  titre: string;
  sousTitre: string;
  categorie: 'probleme' | 'solution' | 'horizon' | 'economies' | 'securite';
  pointsCles: string[];
  chiffreCle: string;
  chiffreLabel: string;
  quoteExecutif?: string;
}
