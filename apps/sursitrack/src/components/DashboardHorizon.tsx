import React, { useState } from 'react';
import { 
  ShieldAlert, Camera, MapPin, Printer, CheckCircle2, Lock, Activity, User
} from 'lucide-react';
import { Sursitaire, AlerteTempsReel } from '../types/sursitrack';
import { CarteTempsReel } from './CarteTempsReel';

interface DashboardHorizonProps {
  sursitaires: Sursitaire[];
  sursitaireSelectionne: Sursitaire;
  onSelectSursitaire: (sursitaire: Sursitaire) => void;
  alertes: AlerteTempsReel[];
  onDeclencherAlerteSimulee: () => void;
  onOuvrirRapport?: () => void;
}

export const DashboardHorizon: React.FC<DashboardHorizonProps> = ({
  sursitaires,
  sursitaireSelectionne,
  onSelectSursitaire,
  alertes,
  onDeclencherAlerteSimulee,
  onOuvrirRapport,
}) => {
  const [ongletActif, setOngletActif] = useState<'360' | 'projet3' | 'projet4'>('360');

  const getCouleurNiveauRisque = (niveau: string) => {
    switch (niveau) {
      case 'critique':
      case 'eleve':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/60';
      case 'modere':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
      default:
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner Supérieur d'Interopérabilité Horizon MSP */}
      <div className="glass-panel p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-cyan-950/50 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
              PROGRAMME HORIZON — DOSSIER UNIQUE
            </span>
            <span className="text-xs text-slate-400 font-mono">ID Session : MSP-QC-2026-9921</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Encadrement & Monitoring Terrain des Sursitaires
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Vision 360° unifiée : Données de probation Horizon enrichies par les flux biométriques & GPS SursiTrack.
          </p>
        </div>

        {/* Actions Rapides */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          {onOuvrirRapport && (
            <button
              onClick={onOuvrirRapport}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 flex items-center justify-center space-x-2 transition-all"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Générer Fiche MSP</span>
            </button>
          )}

          <button
            onClick={onDeclencherAlerteSimulee}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 transition-all"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Simuler Alerte Live</span>
          </button>
        </div>
      </div>

      {/* Grill Principale : Sélecteur de Sursitaires + Contenu Dossier 360° */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Colonne Gauche : Liste des Sursitaires (4/12) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Sursitaires sous suivi ({sursitaires.length})</span>
              <span className="text-[10px] text-cyan-400 font-mono">Agent M. Lapointe</span>
            </h2>

            <div className="space-y-2">
              {sursitaires.map((s) => (
                <div
                  key={s.id}
                  onClick={() => onSelectSursitaire(s)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    sursitaireSelectionne.id === s.id
                      ? 'bg-gradient-to-r from-slate-900 to-cyan-950/60 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={s.photoUrl}
                      alt={s.nomComplet}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-100 truncate">{s.nomComplet}</p>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${getCouleurNiveauRisque(s.niveauRisque)}`}>
                          Risque {s.niveauRisque}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono">{s.dossierHorizonId}</p>
                      <p className="text-[11px] text-cyan-400 mt-1 flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{s.dernierePosition.adresse}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panneau des Alertes Récemment Reçues */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Alertes Live SursiTrack ({alertes.length})</span>
            </h3>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {alertes.map((alt) => (
                <div
                  key={alt.id}
                  className={`p-3 rounded-xl border text-xs ${
                    alt.severite === 'critique'
                      ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>{alt.nomSursitaire}</span>
                    <span className="text-[10px] font-mono text-slate-400">{alt.horodatage.split(' ')[1]}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{alt.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne Droite : Vue Détaillée Dossier 360° Horizon (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card Profil Sursitaire Sélectionné */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center space-x-4">
                <img
                  src={sursitaireSelectionne.photoUrl}
                  alt={sursitaireSelectionne.nomComplet}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-white">{sursitaireSelectionne.nomComplet}</h2>
                    <span className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
                      {sursitaireSelectionne.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dossier Horizon : <strong className="text-cyan-400 font-mono">{sursitaireSelectionne.dossierHorizonId}</strong>
                  </p>
                  <p className="text-xs text-slate-400">
                    Agent responsable : <strong className="text-slate-200">{sursitaireSelectionne.agentNom}</strong>
                  </p>
                </div>
              </div>

              {/* Statut & Score de Risque */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Score de risque RTM</p>
                  <p className="text-2xl font-black text-cyan-400 font-mono">{sursitaireSelectionne.scoreRisqueRTM}%</p>
                </div>
                <div className={`p-3 rounded-xl border text-center ${getCouleurNiveauRisque(sursitaireSelectionne.niveauRisque)}`}>
                  <span className="block text-[10px] uppercase font-bold tracking-wider">Risque</span>
                  <span className="text-sm font-black capitalize">{sursitaireSelectionne.niveauRisque}</span>
                </div>
              </div>
            </div>

            {/* Selector d'onglets Horizon : 360° / Projet 3 / Projet 4 */}
            <div className="flex items-center space-x-2 pt-4">
              <button
                onClick={() => setOngletActif('360')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  ongletActif === '360'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                Vue Synthèse 360°
              </button>

              <button
                onClick={() => setOngletActif('projet3')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  ongletActif === 'projet3'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                Projet 3 — Prise en charge & Contraintes
              </button>

              <button
                onClick={() => setOngletActif('projet4')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  ongletActif === 'projet4'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                Projet 4 — Évaluation & Suivi
              </button>
            </div>
          </div>

          {/* Contenu Onglet 1 : Synthèse 360° + Carte GIS Live */}
          {ongletActif === '360' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Carte Télémétrie GPS (7/12) */}
              <div className="lg:col-span-7">
                <CarteTempsReel sursitaire={sursitaireSelectionne} />
              </div>

              {/* Bloc Biométrie & Dernier Check-in (5/12) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <span>Dernier Check-in Biométrique</span>
                  </h3>

                  {sursitaireSelectionne.dernierCheckIn ? (
                    <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Date & Heure :</span>
                        <span className="font-mono text-slate-200">{sursitaireSelectionne.dernierCheckIn.horodatage}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Score de correspondance :</span>
                        <span className={`font-bold font-mono ${
                          sursitaireSelectionne.dernierCheckIn.scoreMatching >= 90
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}>
                          {sursitaireSelectionne.dernierCheckIn.scoreMatching}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Méthode :</span>
                        <span className="font-semibold text-cyan-300 capitalize">
                          {sursitaireSelectionne.dernierCheckIn.typeBiometrie.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80">
                        <p className="text-[10px] text-slate-500 uppercase font-mono">Empreinte SHA-256 (Loi 25) :</p>
                        <p className="text-[11px] font-mono text-slate-400 truncate">
                          {sursitaireSelectionne.dernierCheckIn.hachagePreuve}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Aucun check-in enregistré aujourd’hui.</p>
                  )}
                </div>

                {/* Contraintes Légales d'Encadrement */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Contraintes Judiciaires Actives</span>
                  </h3>
                  <ul className="space-y-2">
                    {sursitaireSelectionne.contraintes.map((c, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          )}

          {/* Contenu Onglet 2 : Projet 3 Horizon (Prise en charge & Programmes) */}
          {ongletActif === 'projet3' && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">
                  Projet 3 Horizon — Événements, Contraintes & Réinsertion
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Suivi personnalisé des programmes de prise en charge et adhésion du sursitaire.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sursitaireSelectionne.programmes.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                        {p.statut === 'conforme' ? 'Assiduité Conforme' : 'Alerte Absence'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{p.prochaineSession}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100">{p.titre}</h4>
                    <p className="text-xs text-slate-400">Organisme : {p.organisme}</p>

                    {/* Barre de Progression des Heures */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Progression des heures</span>
                        <span className="font-mono">{p.heuresEffectuees}h / {p.heuresRequises}h</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                          style={{ width: `${(p.heuresEffectuees / p.heuresRequises) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contenu Onglet 3 : Projet 4 Horizon (Évaluation du risque) */}
          {ongletActif === 'projet4' && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">
                  Projet 4 Horizon — Évaluation du Risque & Encadrement
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Matrice d’évaluation du risque de récidive et suivi des mesures de probation communautaire.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <p className="text-xs text-slate-400 uppercase font-bold">Niveau de Risque</p>
                  <p className="text-xl font-black text-cyan-400 mt-1 capitalize">{sursitaireSelectionne.niveauRisque}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <p className="text-xs text-slate-400 uppercase font-bold">Probabilité de Récidive</p>
                  <p className="text-xl font-black text-emerald-400 mt-1">{sursitaireSelectionne.scoreRisqueRTM}%</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <p className="text-xs text-slate-400 uppercase font-bold">Statut de Suivi</p>
                  <p className="text-xl font-black text-slate-200 mt-1">Actif (24/7)</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
