import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { createHash, randomBytes } from 'crypto';

const app = Fastify({ logger: true });

// Types
interface ZoneGeofencing {
  id: string;
  nom: string;
  type: 'autorisee_travail' | 'autorisee_domicile' | 'interdite_contact' | 'interdite_alcool';
  latitude: number;
  longitude: number;
  rayonMetres: number;
}

interface ProgrammeReinsertion {
  id: string;
  titre: string;
  organisme: string;
  frequenceHebdo: number;
  heuresEffectuees: number;
  heuresRequises: number;
  prochaineSession: string;
  statut: 'en_cours' | 'conforme' | 'absence_signalee';
}

interface CheckInBiometrique {
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

interface AlerteTempsReel {
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

interface Sursitaire {
  id: string;
  dossierHorizonId: string;
  nomComplet: string;
  photoUrl: string;
  telephone: string;
  agentProbationId: string;
  agentNom: string;
  dateDebutSursis: string;
  dateFinSursis: string;
  contraintes: string[];
  programmes: ProgrammeReinsertion[];
  zones: ZoneGeofencing[];
  niveauRisque: 'faible' | 'modere' | 'eleve' | 'critique';
  scoreRisqueRTM: number;
  statutConformite: 'conforme' | 'alerte_mineure' | 'violation_critique' | 'en_attente_checkin';
  dernierCheckIn?: CheckInBiometrique;
  dernierePosition: {
    latitude: number;
    longitude: number;
    adresse: string;
    derniereMiseAJour: string;
  };
}

interface LogAuditLoi25 {
  id: string;
  horodatage: string;
  action: string;
  acteur: string;
  dossierCible: string;
  conformeLoi25: boolean;
  empreinteSecuritique: string;
}

// Jeu de données initiales MSP Québec
let sursitairesDB: Sursitaire[] = [
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
      'Suivi obligatoire en gestion de la colère (2x / semaine)'
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
      }
    ],
    zones: [
      {
        id: 'Z-DOM',
        nom: 'Résidence principale (Rosemont)',
        type: 'autorisee_domicile',
        latitude: 45.5412,
        longitude: -73.5781,
        rayonMetres: 250
      },
      {
        id: 'Z-TRAV',
        nom: 'Chantier de construction Nordet (Ville-Marie)',
        type: 'autorisee_travail',
        latitude: 45.5088,
        longitude: -73.5542,
        rayonMetres: 350
      }
    ],
    niveauRisque: 'modere',
    scoreRisqueRTM: 42,
    statutConformite: 'conforme',
    dernierePosition: {
      latitude: 45.5088,
      longitude: -73.5542,
      adresse: 'Chantier Nordet, Boul. René-Lévesque O, Montréal',
      derniereMiseAJour: 'À l’instant'
    },
    dernierCheckIn: {
      id: 'CHK-9910',
      sursitaireId: 'SUR-2026-089',
      horodatage: '2026-08-14 07:02:14',
      typeBiometrie: 'reconnaissance_faciale',
      scoreMatching: 99.2,
      hachagePreuve: 'sha256:8f4b1e90a2c99a0188b02199',
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
    }
  }
];

let alertesDB: AlerteTempsReel[] = [
  {
    id: 'ALT-1099',
    sursitaireId: 'SUR-2026-104',
    dossierHorizonId: 'HOR-QC-91024',
    nomSursitaire: 'Marc-André Gagnon',
    severite: 'critique',
    typeAlerte: 'sortie_zone_interdite',
    message: 'ALERTE GÉOFENCING : Présence détectée dans la zone interdite (Grande Allée, Québec).',
    horodatage: new Date().toISOString().replace('T', ' ').substring(0, 19),
    lu: false,
    latitude: 46.8055,
    longitude: -71.2185
  }
];

let logsLoi25DB: LogAuditLoi25[] = [
  {
    id: 'LOG-8801',
    horodatage: new Date().toISOString().replace('T', ' ').substring(0, 19),
    action: 'INITIALISATION_SERVEUR_SURSITRACK',
    acteur: 'Système SursiTrack Engine v2.4 (Fastify Backend)',
    dossierCible: 'Réseau MSP Québec',
    conformeLoi25: true,
    empreinteSecuritique: createHash('sha256').update('init-system').digest('hex')
  }
];

// Register Plugins
await app.register(cors, { origin: true });
await app.register(websocket);

// Active WebSocket Clients
const clientsWebSocket = new Set<any>();

app.get('/api/sursitrack/ws', { websocket: true }, (connection) => {
  clientsWebSocket.add(connection.socket);
  app.log.info('Client WebSocket Agent Horizon connecté');

  connection.socket.on('close', () => {
    clientsWebSocket.delete(connection.socket);
    app.log.info('Client WebSocket déconnecté');
  });
});

function broadcastEvent(type: string, data: any) {
  const payload = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  for (const client of clientsWebSocket) {
    if (client.readyState === 1) {
      client.send(payload);
    }
  }
}

// Endpoints REST
app.get('/api/sursitrack/sante', async () => {
  return {
    statut: 'OK',
    service: 'SursiTrack + Horizon Backend Engine',
    version: '2.4.0',
    statutLoi25: 'Conforme - Chiffrement SHA-256',
    clientsWebSocketsActifs: clientsWebSocket.size
  };
});

app.get('/api/sursitrack/sursitaires', async () => {
  return { sursitaires: sursitairesDB };
});

app.get('/api/sursitrack/alertes', async () => {
  return { alertes: alertesDB };
});

app.get('/api/sursitrack/logs-loi25', async () => {
  return { logs: logsLoi25DB };
});

// Post Check-in Biométrique
app.post('/api/sursitrack/checkin', async (request, reply) => {
  const body = request.body as { sursitaireId: string; succes: boolean; latitude?: number; longitude?: number };
  const { sursitaireId, succes } = body;

  const sursitaire = sursitairesDB.find((s) => s.id === sursitaireId);
  if (!sursitaire) {
    return reply.status(404).send({ erreur: 'Sursitaire introuvable' });
  }

  const horodatageStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const scoreMatching = succes ? Number((96 + Math.random() * 3.8).toFixed(1)) : Number((58 + Math.random() * 8).toFixed(1));
  const proofHash = `sha256:${createHash('sha256').update(`${sursitaireId}-${horodatageStr}-${randomBytes(8).toString('hex')}`).digest('hex')}`;

  const nouveauStatut = succes ? 'conforme' : 'violation_critique';
  const nouveauScoreRisque = succes ? Math.max(10, sursitaire.scoreRisqueRTM - 5) : Math.min(95, sursitaire.scoreRisqueRTM + 25);

  sursitaire.statutConformite = nouveauStatut;
  sursitaire.scoreRisqueRTM = nouveauScoreRisque;
  sursitaire.niveauRisque = nouveauScoreRisque > 70 ? 'eleve' : nouveauScoreRisque > 35 ? 'modere' : 'faible';

  sursitaire.dernierCheckIn = {
    id: `CHK-${Math.floor(Math.random() * 9000 + 1000)}`,
    sursitaireId,
    horodatage: horodatageStr,
    typeBiometrie: 'reconnaissance_faciale',
    scoreMatching,
    hachagePreuve: proofHash,
    latitude: body.latitude || sursitaire.dernierePosition.latitude,
    longitude: body.longitude || sursitaire.dernierePosition.longitude,
    adresseApprox: sursitaire.dernierePosition.adresse,
    statut: succes ? 'valide' : 'echec_matching'
  };

  // Log Loi 25
  const logLoi25: LogAuditLoi25 = {
    id: `LOG-${Math.floor(Math.random() * 9000 + 1000)}`,
    horodatage: horodatageStr,
    action: succes ? 'CHECKIN_BIOMÉTRIQUE_REUSSI' : 'ÉCHEC_POINTAGE_BIOMÉTRIQUE',
    acteur: 'App Mobile SursiTrack Client',
    dossierCible: `${sursitaire.dossierHorizonId} (${sursitaire.nomComplet})`,
    conformeLoi25: true,
    empreinteSecuritique: proofHash
  };
  logsLoi25DB.unshift(logLoi25);

  // Alerte si échec
  if (!succes) {
    const nouvelleAlerte: AlerteTempsReel = {
      id: `ALT-${Math.floor(Math.random() * 9000 + 1000)}`,
      sursitaireId,
      dossierHorizonId: sursitaire.dossierHorizonId,
      nomSursitaire: sursitaire.nomComplet,
      severite: 'critique',
      typeAlerte: 'biometrie_echec',
      message: `ÉCHEC BIOMÉTRIQUE : Reconnaissance faciale sous le seuil pour ${sursitaire.nomComplet} (${scoreMatching}%).`,
      horodatage: horodatageStr,
      lu: false
    };
    alertesDB.unshift(nouvelleAlerte);
    broadcastEvent('NOUVELLE_ALERTE', nouvelleAlerte);
  }

  broadcastEvent('SURCHARGE_DOSSIER', sursitaire);

  return {
    succes: true,
    checkIn: sursitaire.dernierCheckIn,
    sursitaire
  };
});

// Start Server
const PORT = 3002;
app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`🚀 Serveur Backend SursiTrack + Horizon actif sur ${address}`);
});
