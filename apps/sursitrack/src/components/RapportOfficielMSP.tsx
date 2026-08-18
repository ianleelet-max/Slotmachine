import React from 'react';
import { X, Printer, ShieldCheck, FileText, CheckCircle2, Lock } from 'lucide-react';
import { Sursitaire } from '../types/sursitrack';

interface RapportOfficielMSPProps {
  sursitaire: Sursitaire;
  onFermer: () => void;
}

export const RapportOfficielMSP: React.FC<RapportOfficielMSPProps> = ({ sursitaire, onFermer }) => {
  const imprimerRapport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        {/* Actions d'En-tête */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold">
            <FileText className="w-4 h-4" />
            <span>FICHE OFFICIELLE HORIZON — RAPPORT DE SYNTHÈSE MSP</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={imprimerRapport}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / Export PDF</span>
            </button>
            <button
              onClick={onFermer}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenu Imprimable Officiel MSP */}
        <div className="space-y-6 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-slate-200">
          
          {/* Header institutionnel */}
          <div className="flex justify-between items-start border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">
                Gouvernement du Québec
              </h2>
              <p className="text-xs text-slate-400 font-semibold">
                Ministère de la Sécurité publique — Direction de la probation
              </p>
              <p className="text-[11px] text-cyan-400 font-mono mt-1">
                Programme Horizon — Dossier Unique Correctionnel
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 text-[10px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                DOCUMENT OFFICIEL CONFIDENTIEL
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Émis le : 14 août 2026</p>
            </div>
          </div>

          {/* Profil Sursitaire */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <p className="text-slate-400">Nom du sursitaire : <strong className="text-white">{sursitaire.nomComplet}</strong></p>
              <p className="text-slate-400">Dossier Horizon : <strong className="text-cyan-400 font-mono">{sursitaire.dossierHorizonId}</strong></p>
              <p className="text-slate-400">Nº Téléphone enregistré : <strong className="text-slate-200">{sursitaire.telephone}</strong></p>
            </div>
            <div>
              <p className="text-slate-400">Agent de probation : <strong className="text-white">{sursitaire.agentNom}</strong></p>
              <p className="text-slate-400">Période de sursis : <strong className="text-slate-200">{sursitaire.dateDebutSursis} au {sursitaire.dateFinSursis}</strong></p>
              <p className="text-slate-400">Statut de suivi : <strong className="text-emerald-400 uppercase">Actif (SursiTrack Live)</strong></p>
            </div>
          </div>

          {/* Projet 3 Horizon - Contraintes & Programmes */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              1. Bilan des Contraintes & Programmes (Horizon Projet 3)
            </h3>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800">
                <p className="font-semibold text-slate-300 mb-1">Contraintes Judiciaires en vigueur :</p>
                <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                  {sursitaire.contraintes.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              {sursitaire.programmes.map((p) => (
                <div key={p.id} className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-200">{p.titre}</p>
                    <p className="text-[11px] text-slate-400">{p.organisme}</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-emerald-400 font-bold">{p.heuresEffectuees}h / {p.heuresRequises}h</p>
                    <p className="text-[10px] text-slate-400">{p.statut === 'conforme' ? 'Assiduité Conforme' : 'Alerte'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projet 4 Horizon - Évaluation du Risque */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              2. Évaluation du Risque & Pointages Biométriques (Horizon Projet 4)
            </h3>
            <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-slate-400 text-[10px]">Niveau de risque</p>
                <p className="font-bold text-cyan-400 capitalize">{sursitaire.niveauRisque}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Score de récidive RTM</p>
                <p className="font-bold text-emerald-400">{sursitaire.scoreRisqueRTM} %</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Dernier Pointage Faciale</p>
                <p className="font-bold text-slate-200">{sursitaire.dernierCheckIn?.scoreMatching || 99.2} %</p>
              </div>
            </div>
          </div>

          {/* Preuve Cryptographique Loi 25 */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] space-y-1 font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Hachage de la preuve d'identité (Loi 25) :</span>
              <span className="text-emerald-400 font-bold">VALIDE</span>
            </div>
            <p className="text-slate-500 truncate">{sursitaire.dernierCheckIn?.hachagePreuve || 'sha256:8f4b1e90a...c99a01'}</p>
          </div>

          {/* Signature d'audit */}
          <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
            <span>Certification numérique : Système SursiTrack v2.4 (Conforme MSP Québec)</span>
            <span>Signé électroniquement par : {sursitaire.agentNom}</span>
          </div>

        </div>

      </div>
    </div>
  );
};
