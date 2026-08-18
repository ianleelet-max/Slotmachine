import { Sursitaire, AlerteTempsReel, LogAuditLoi25 } from '../types/sursitrack';

export const INITIAL_SURSITAIRES: Sursitaire[] = [
  {
    id: 'SUR-2026-089',
    dossierHorizonId: 'HOR-QC-88491',
    nomComplet: 'Alexandre Tremblay',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    telephone: '514-555-0192',
    agentProbationId: 'AGT-772',
    agentNom: 'Agent Martin Lapointe',
    dateDebutSursis: '2026-01-15',
    dateFinSursis: '2026-10-15',
    contraintes: [
      'Couvre-feu strict de 21h00 à 06h00',
      'Interdiction d’approcher à moins de 500m du 450 Rue Saint-Denis (Montréal)',
      'Suivi obligatoire en gestion de la colère (2x / semaine)',
      'Interdiction de consommer de l’alcool ou stupéfiants'
    ],
    programmes: [
      {
        id: 'PRG-01',
        titre: 'Programme de réinsertion socio-professionnelle',
        organisme: 'YMCA Centre-Ville Montréal',
        frequenceHebdo: 3,
        heuresEffectuees: 42,
        heuresRequises: 60,
        prochaineSession: 'Aujourd’hui à 14h00',
        statut: 'conforme'
      },
      {
        id: 'PRG-02',
        titre: 'Atelier de gestion de la colère et impulsivité',
        organisme: 'Maison de transition Le Tremplin',
        frequenceHebdo: 2,
        heuresEffectuees: 18,
        heuresRequises: 24,
        prochaineSession: 'Demain à 10h00',
        statut: 'conforme'
      }
    ],
    zones: [
      {
        id: 'Z-DOM',
        nom: 'Résidence principale (Rosemont)',
        type: 'autorisee_domicile',
        latitude: 45.5412,
        longitude: -73.5781,
        rayonMetres: 250,
        horaireDebut: '21:00',
        horaireFin: '06:00'
      },
      {
        id: 'Z-TRAV',
        nom: 'Chantier de construction Nordet (Ville-Marie)',
        type: 'autorisee_travail',
        latitude: 45.5088,
        longitude: -73.5542,
        rayonMetres: 350,
        horaireDebut: '07:00',
        horaireFin: '17:00'
      },
      {
        id: 'Z-INTERD',
        nom: 'Périmètre d’exclusion Victime (St-Denis)',
        type: 'interdite_contact',
        latitude: 45.5152,
        longitude: -73.5621,
        rayonMetres: 500
      }
    ],
    niveauRisque: 'modere',
    scoreRisqueRTM: 42,
    statutConformite: 'conforme',
    dernierePosition: {
      latitude: 45.5088,
      longitude: -73.5542,
      adresse: 'Chantier Nordet, Boul. René-Lévesque O, Montréal',
      derniereMiseAJour: 'Il y a 3 minutes'
    },
    dernierCheckIn: {
      id: 'CHK-9910',
      sursitaireId: 'SUR-2026-089',
      horodatage: '2026-08-14 07:02:14',
      typeBiometrie: 'reconnaissance_faciale',
      scoreMatching: 99.2,
      hachagePreuve: 'sha256:8f4b1e...c99a01',
      latitude: 45.5088,
      longitude: -73.5542,
      adresseApprox: 'René-Lévesque / St-Laurent',
      statut: 'valide'
    }
  },
  {
    id: 'SUR-2026-104',
    dossierHorizonId: 'HOR-QC-91024',
    nomComplet: 'Marc-André Gagnon',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    telephone: '418-555-0823',
    agentProbationId: 'AGT-772',
    agentNom: 'Agent Martin Lapointe',
    dateDebutSursis: '2026-03-01',
    dateFinSursis: '2026-12-01',
    contraintes: [
      'Interdiction absolue de présence dans les établissements licenciés (bars/clubs)',
      'Test salivaire/alcoolimétrique sur convocation aléatoire',
      'Assignation à résidence le week-end'
    ],
    programmes: [
      {
        id: 'PRG-03',
        titre: 'Thérapie de prévention des dépendances',
        organisme: 'Centre Normand-Laramée',
        frequenceHebdo: 2,
        heuresEffectuees: 10,
        heuresRequises: 40,
        prochaineSession: 'Vendredi à 13h30',
        statut: 'absence_signalee'
      }
    ],
    zones: [
      {
        id: 'Z-DOM2',
        nom: 'Domicile Québec (Sainte-Foy)',
        type: 'autorisee_domicile',
        latitude: 46.7812,
        longitude: -71.2781,
        rayonMetres: 200
      },
      {
        id: 'Z-BARS',
        nom: 'Secteur Grande Allée (Zone à risque)',
        type: 'interdite_alcool',
        latitude: 46.8055,
        longitude: -71.2185,
        rayonMetres: 600
      }
    ],
    niveauRisque: 'eleve',
    scoreRisqueRTM: 78,
    statutConformite: 'violation_critique',
    dernierePosition: {
      latitude: 46.8055,
      longitude: -71.2185,
      adresse: 'Proximité Grande Allée Est, Québec',
      derniereMiseAJour: 'À l’instant'
    },
    dernierCheckIn: {
      id: 'CHK-9912',
      sursitaireId: 'SUR-2026-104',
      horodatage: '2026-08-14 10:45:00',
      typeBiometrie: 'reconnaissance_faciale',
      scoreMatching: 64.1,
      hachagePreuve: 'sha256:77a0bc...11f09e',
      latitude: 46.8055,
      longitude: -71.2185,
      adresseApprox: 'Grande Allée, Québec',
      statut: 'echec_matching'
    }
  },
  {
    id: 'SUR-2026-142',
    dossierHorizonId: 'HOR-QC-77210',
    nomComplet: 'Sophie Beaulieu',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
    telephone: '450-555-0419',
    agentProbationId: 'AGT-804',
    agentNom: 'Agente Élodie Desjardins',
    dateDebutSursis: '2025-11-10',
    dateFinSursis: '2026-11-10',
    contraintes: [
      'Pointage biometrique quotidien avant 12h00',
      'Maintien d’un emploi à temps plein ou formation reconnue'
    ],
    programmes: [
      {
        id: 'PRG-04',
        titre: 'Formation diplômante en secrétariat médical',
        organisme: 'Cégep de Saint-Jérôme',
        frequenceHebdo: 5,
        heuresEffectuees: 180,
        heuresRequises: 200,
        prochaineSession: 'En cours',
        statut: 'conforme'
      }
    ],
    zones: [
      {
        id: 'Z-DOM3',
        nom: 'Domicile Saint-Jérôme',
        type: 'autorisee_domicile',
        latitude: 45.7788,
        longitude: -74.0042,
        rayonMetres: 300
      }
    ],
    niveauRisque: 'faible',
    scoreRisqueRTM: 14,
    statutConformite: 'conforme',
    dernierePosition: {
      latitude: 45.7788,
      longitude: -74.0042,
      adresse: 'Rue Labelle, Saint-Jérôme',
      derniereMiseAJour: 'Il y a 12 minutes'
    },
    dernierCheckIn: {
      id: 'CHK-9915',
      sursitaireId: 'SUR-2026-142',
      horodatage: '2026-08-14 08:30:11',
      typeBiometrie: 'reconnaissance_faciale',
      scoreMatching: 99.8,
      hachagePreuve: 'sha256:41a80c...b8812c',
      latitude: 45.7788,
      longitude: -74.0042,
      adresseApprox: 'Saint-Jérôme Centre',
      statut: 'valide'
    }
  }
];

export const INITIAL_ALERTES: AlerteTempsReel[] = [
  {
    id: 'ALT-1099',
    sursitaireId: 'SUR-2026-104',
    dossierHorizonId: 'HOR-QC-91024',
    nomSursitaire: 'Marc-André Gagnon',
    severite: 'critique',
    typeAlerte: 'sortie_zone_interdite',
    message: 'ALERTE GÉOFENCING : Présence détectée dans la zone interdite (Secteur Grande Allée, Québec).',
    horodatage: '2026-08-14 11:02:15',
    lu: false,
    latitude: 46.8055,
    longitude: -71.2185
  },
  {
    id: 'ALT-1098',
    sursitaireId: 'SUR-2026-104',
    dossierHorizonId: 'HOR-QC-91024',
    nomSursitaire: 'Marc-André Gagnon',
    severite: 'critique',
    typeAlerte: 'biometrie_echec',
    message: 'ÉCHEC BIOMÉTRIQUE : Reconnaissance faciale sous le seuil (64.1% de correspondance).',
    horodatage: '2026-08-14 10:45:02',
    lu: false
  },
  {
    id: 'ALT-1095',
    sursitaireId: 'SUR-2026-089',
    dossierHorizonId: 'HOR-QC-88491',
    nomSursitaire: 'Alexandre Tremblay',
    severite: 'info',
    typeAlerte: 'checkin_manque',
    message: 'Check-in du matin validé avec succès (Matching 99.2%).',
    horodatage: '2026-08-14 07:02:15',
    lu: true
  }
];

export const INITIAL_LOGS_LOI25: LogAuditLoi25[] = [
  {
    id: 'LOG-8801',
    horodatage: '2026-08-14 11:02:16',
    action: 'ÉMISSION_ALERTE_TEMPS_RÉEL',
    acteur: 'Système SursiTrack Engine v2.4',
    dossierCible: 'HOR-QC-91024 (Marc-André Gagnon)',
    conformeLoi25: true,
    empreinteSecuritique: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'LOG-8800',
    horodatage: '2026-08-14 10:45:03',
    action: 'CHECKIN_BIOMÉTRIQUE_HACHAGE',
    acteur: 'SursiTrack Mobile Client iOS',
    dossierCible: 'HOR-QC-91024 (Marc-André Gagnon)',
    conformeLoi25: true,
    empreinteSecuritique: 'sha256:77a0bc11f09e88aa09b1129f123bc410928a716c72109854bc8192a01723fa12'
  },
  {
    id: 'LOG-8799',
    horodatage: '2026-08-14 09:15:00',
    action: 'CONSULTATION_DOSSIER_360',
    acteur: 'Agent Martin Lapointe (AGT-772)',
    dossierCible: 'HOR-QC-88491 (Alexandre Tremblay)',
    conformeLoi25: true,
    empreinteSecuritique: 'sha256:91b2c4510098fca201991823abf1092491a082716c5412984bc0192410928501'
  }
];
