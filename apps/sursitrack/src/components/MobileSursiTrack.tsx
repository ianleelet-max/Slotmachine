import React, { useState } from 'react';
import { 
  Smartphone, Camera, CheckCircle2, AlertTriangle, ShieldCheck, MapPin, 
  Wifi, Battery, Clock, Lock, RefreshCw, Video, Send, FileCheck
} from 'lucide-react';
import { Sursitaire } from '../types/sursitrack';

interface MobileSursiTrackProps {
  sursitaire: Sursitaire;
  onFaireCheckInBiometrique: (sursitaireId: string, succes: boolean) => void;
}

export const MobileSursiTrack: React.FC<MobileSursiTrackProps> = ({
  sursitaire,
  onFaireCheckInBiometrique,
}) => {
  const [enAnalyse, setEnAnalyse] = useState(false);
  const [checkinReussi, setCheckinReussi] = useState<boolean | null>(null);
  const [messageUrgence, setMessageUrgence] = useState('');
  const [messageEnvoye, setMessageEnvoye] = useState(false);

  const lancerCheckIn = (succes: boolean) => {
    setEnAnalyse(true);
    setCheckinReussi(null);

    setTimeout(() => {
      setEnAnalyse(false);
      setCheckinReussi(succes);
      onFaireCheckInBiometrique(sursitaire.id, succes);
    }, 2000);
  };

  const envoyerMessageAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageUrgence.trim()) return;
    setMessageEnvoye(true);
    setTimeout(() => {
      setMessageUrgence('');
      setMessageEnvoye(false);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-4">
      
      {/* Panneau de Présentation à Gauche (5/12) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Smartphone className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold text-white">
            Application Mobile SursiTrack
          </h2>
          
          <p className="text-xs text-slate-300 leading-relaxed">
            Installee directement sur le telephone personnel du sursitaire. Aucun bracelet stigmatisant ou equipement materiel lourd requis.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-3 text-xs text-slate-300">
              <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 mt-0.5">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-100 font-semibold">Check-in Biometrique Instantane</strong>
                <span className="text-[11px] text-slate-400">Scan facial 3D & empreinte numerique avec preuve SHA-256.</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs text-slate-300">
              <div className="p-1.5 rounded-lg bg-emerald-950 text-emerald-400 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-100 font-semibold">Geofencing & Respect du Couvre-feu</strong>
                <span className="text-[11px] text-slate-400">Validation automatique des zones autorisees.</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-xs text-slate-300">
              <div className="p-1.5 rounded-lg bg-purple-950 text-purple-400 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-slate-100 font-semibold">Conformite Loi 25 (Quebec)</strong>
                <span className="text-[11px] text-slate-400">Biometrie hachee localement, consentement horodate.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Frame Smartphone Interactif à Droite (7/12) */}
      <div className="lg:col-span-7 flex justify-center">
        <div className="w-[340px] sm:w-[360px] h-[680px] bg-slate-950 rounded-[45px] p-4 border-[6px] border-slate-800 shadow-2xl shadow-cyan-950/40 relative overflow-hidden flex flex-col justify-between">
          
          {/* Notch / Dynamic Island */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-slate-950" />
            <div className="w-2 h-2 rounded-full bg-indigo-900" />
          </div>

          {/* Status Bar Mobile */}
          <div className="flex justify-between items-center px-4 pt-2 text-[11px] text-slate-400 font-mono z-40">
            <span>09:41</span>
            <div className="flex items-center space-x-2">
              <Wifi className="w-3.5 h-3.5" />
              <span>5G</span>
              <Battery className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Contenu Ecran Mobile */}
          <div className="flex-1 mt-4 overflow-y-auto space-y-4 px-2">
            
            {/* Header Mobile App SursiTrack */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-4 rounded-2xl border border-slate-800 flex items-center space-x-3">
              <img
                src={sursitaire.photoUrl}
                alt={sursitaire.nomComplet}
                className="w-12 h-12 rounded-xl object-cover border border-cyan-500/50"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{sursitaire.nomComplet}</p>
                <p className="text-[10px] text-cyan-400 font-mono">ID : {sursitaire.id}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  Compte Sursitaire Valide
                </span>
              </div>
            </div>

            {/* Carte de Pointage Biométrique Interactif */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Pointage Biometrique</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Requis aujourd’hui</span>
              </div>

              {/* Zone Camera / Scan Biometrique */}
              <div className="relative h-40 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
                {enAnalyse ? (
                  <div className="flex flex-col items-center space-y-2">
                    <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                    <p className="text-xs font-bold text-cyan-300">Analyse faciale & Hachage SHA-256...</p>
                  </div>
                ) : checkinReussi === true ? (
                  <div className="flex flex-col items-center space-y-1 text-emerald-400">
                    <CheckCircle2 className="w-10 h-10" />
                    <p className="text-xs font-bold">Matching Facia (99.4%) Valide !</p>
                    <p className="text-[9px] text-slate-400 font-mono">Transmis a l’Agent Horizon</p>
                  </div>
                ) : checkinReussi === false ? (
                  <div className="flex flex-col items-center space-y-1 text-rose-400">
                    <AlertTriangle className="w-10 h-10" />
                    <p className="text-xs font-bold">Matching Facia Echoue (62%)</p>
                    <p className="text-[9px] text-slate-400 font-mono">Alerte envoyee a l’Agent</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2 text-slate-400">
                    <Camera className="w-8 h-8 text-slate-500" />
                    <p className="text-xs text-center px-4">Placez votre visage au centre du cadre pour valider votre presence.</p>
                  </div>
                )}
              </div>

              {/* Boutons d'action simulation */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => lancerCheckIn(true)}
                  disabled={enAnalyse}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Check-in Valide</span>
                </button>

                <button
                  onClick={() => lancerCheckIn(false)}
                  disabled={enAnalyse}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-rose-700/20 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Echec / Ecart</span>
                </button>
              </div>
            </div>

            {/* Envoi de Message Rapide à l'Agent */}
            <form onSubmit={envoyerMessageAgent} className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200">Contacter l’Agent Horizon</h4>
              <textarea
                value={messageUrgence}
                onChange={(e) => setMessageUrgence(e.target.value)}
                placeholder="Message ou justification de deplacement..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
              />
              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                <span>Transmettre a l’Agent</span>
              </button>
              {messageEnvoye && (
                <p className="text-[10px] text-emerald-400 text-center font-semibold">
                  Message transmis au dossier Horizon !
                </p>
              )}
            </form>

            {/* Footer Conformité Loi 25 */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
              <div className="flex items-center space-x-1 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Loi 25 Protegee</span>
              </div>
              <span className="font-mono text-slate-500">Heberge au Quebec</span>
            </div>

          </div>

          {/* Dynamic Home Bar */}
          <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-2" />

        </div>
      </div>

    </div>
  );
};
