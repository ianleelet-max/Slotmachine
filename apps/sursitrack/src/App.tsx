import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { PitchDeckMSP } from './components/PitchDeckMSP';
import { DashboardHorizon } from './components/DashboardHorizon';
import { MobileSursiTrack } from './components/MobileSursiTrack';
import { CentreInterop } from './components/CentreInterop';
import { RapportOfficielMSP } from './components/RapportOfficielMSP';
import { INITIAL_SURSITAIRES, INITIAL_ALERTES, INITIAL_LOGS_LOI25 } from './data/mockData';
import { Sursitaire, AlerteTempsReel, LogAuditLoi25 } from './types/sursitrack';

export function App() {
  const [vueActive, setVueActive] = useState<'pitch' | 'horizon' | 'mobile' | 'interop'>('pitch');
  const [sursitaires, setSursitaires] = useState<Sursitaire[]>(INITIAL_SURSITAIRES);
  const [sursitaireSelectionne, setSursitaireSelectionne] = useState<Sursitaire>(INITIAL_SURSITAIRES[0]);
  const [alertes, setAlertes] = useState<AlerteTempsReel[]>(INITIAL_ALERTES);
  const [logsLoi25, setLogsLoi25] = useState<LogAuditLoi25[]>(INITIAL_LOGS_LOI25);
  const [afficherRapportOfficiel, setAfficherRapportOfficiel] = useState(false);

  const nombreNonLues = alertes.filter((a) => !a.lu).length;

  // Charger les données depuis le serveur backend SursiTrack
  useEffect(() => {
    fetch('/api/sursitrack/sursitaires')
      .then((res) => res.json())
      .then((data) => {
        if (data.sursitaires && data.sursitaires.length > 0) {
          setSursitaires(data.sursitaires);
          setSursitaireSelectionne(data.sursitaires[0]);
        }
      })
      .catch(() => {
        console.log('Utilisation du fallback mock initial');
      });

    fetch('/api/sursitrack/alertes')
      .then((res) => res.json())
      .then((data) => {
        if (data.alertes) {
          setAlertes(data.alertes);
        }
      })
      .catch(() => {});

    fetch('/api/sursitrack/logs-loi25')
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) {
          setLogsLoi25(data.logs);
        }
      })
      .catch(() => {});
  }, []);

  // Callback simulation Check-in Sursitaire Mobile
  const handleCheckInBiometrique = async (sursitaireId: string, succes: boolean) => {
    try {
      const res = await fetch('/api/sursitrack/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sursitaireId, succes }),
      });
      const data = await res.json();
      if (data.succes && data.sursitaire) {
        setSursitaires((prev) =>
          prev.map((s) => (s.id === sursitaireId ? data.sursitaire : s))
        );
        if (sursitaireSelectionne.id === sursitaireId) {
          setSursitaireSelectionne(data.sursitaire);
        }
      }
    } catch {
      // Fallback local
      const horodatageStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      setSursitaires((prev) =>
        prev.map((s) => {
          if (s.id === sursitaireId) {
            const nouveauStatut = succes ? 'conforme' : 'violation_critique';
            const nouveauScore = succes ? Math.max(10, s.scoreRisqueRTM - 5) : Math.min(95, s.scoreRisqueRTM + 25);
            
            const misAJour: Sursitaire = {
              ...s,
              statutConformite: nouveauStatut,
              scoreRisqueRTM: nouveauScore,
              niveauRisque: nouveauScore > 70 ? 'eleve' : nouveauScore > 35 ? 'modere' : 'faible',
              dernierCheckIn: {
                id: `CHK-${Math.floor(Math.random() * 9000 + 1000)}`,
                sursitaireId,
                horodatage: horodatageStr,
                typeBiometrie: 'reconnaissance_faciale',
                scoreMatching: succes ? 99.4 : 61.2,
                hachagePreuve: `sha256:${Math.random().toString(36).substring(2, 12)}...`,
                latitude: s.dernierePosition.latitude,
                longitude: s.dernierePosition.longitude,
                adresseApprox: s.dernierePosition.adresse,
                statut: succes ? 'valide' : 'echec_matching',
              },
            };

            if (s.id === sursitaireSelectionne.id) {
              setSursitaireSelectionne(misAJour);
            }
            return misAJour;
          }
          return s;
        })
      );
    }
  };

  // Callback alerte live simulée
  const handleDeclencherAlerteSimulee = () => {
    const horodatageStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const nouvelleAlerte: AlerteTempsReel = {
      id: `ALT-${Math.floor(Math.random() * 9000 + 1000)}`,
      sursitaireId: sursitaireSelectionne.id,
      dossierHorizonId: sursitaireSelectionne.dossierHorizonId,
      nomSursitaire: sursitaireSelectionne.nomComplet,
      severite: 'critique',
      typeAlerte: 'sortie_zone_interdite',
      message: `ALERTE TERRAIN : Détection de sortie du périmètre autorisé pour ${sursitaireSelectionne.nomComplet}.`,
      horodatage: horodatageStr,
      lu: false,
    };

    setAlertes((prev) => [nouvelleAlerte, ...prev]);

    setSursitaires((prev) =>
      prev.map((s) => {
        if (s.id === sursitaireSelectionne.id) {
          const misAJour: Sursitaire = {
            ...s,
            statutConformite: 'violation_critique',
            scoreRisqueRTM: 85,
            niveauRisque: 'eleve',
          };
          setSursitaireSelectionne(misAJour);
          return misAJour;
        }
        return s;
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <Navigation
        vueActive={vueActive}
        setVueActive={setVueActive}
        alertes={alertes}
        nombreNonLues={nombreNonLues}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {vueActive === 'pitch' && (
          <PitchDeckMSP />
        )}

        {vueActive === 'horizon' && (
          <DashboardHorizon
            sursitaires={sursitaires}
            sursitaireSelectionne={sursitaireSelectionne}
            onSelectSursitaire={setSursitaireSelectionne}
            alertes={alertes}
            onDeclencherAlerteSimulee={handleDeclencherAlerteSimulee}
            onOuvrirRapport={() => setAfficherRapportOfficiel(true)}
          />
        )}

        {vueActive === 'mobile' && (
          <MobileSursiTrack
            sursitaire={sursitaireSelectionne}
            onFaireCheckInBiometrique={handleCheckInBiometrique}
          />
        )}

        {vueActive === 'interop' && (
          <CentreInterop logs={logsLoi25} />
        )}
      </main>

      {/* Modal du Rapport Officiel MSP */}
      {afficherRapportOfficiel && (
        <RapportOfficielMSP
          sursitaire={sursitaireSelectionne}
          onFermer={() => setAfficherRapportOfficiel(false)}
        />
      )}
    </div>
  );
}

export default App;
