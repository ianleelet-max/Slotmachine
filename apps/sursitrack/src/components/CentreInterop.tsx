import React from 'react';
import { Cpu, ShieldCheck, Database, Lock, Server, ArrowRight, FileText, CheckCircle, Zap } from 'lucide-react';
import { LogAuditLoi25 } from '../types/sursitrack';

interface CentreInteropProps {
  logs: LogAuditLoi25[];
}

export const CentreInterop: React.FC<CentreInteropProps> = ({ logs }) => {
  return (
    <div className="space-y-6">
      
      {/* Banner Titre Interopérabilité */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Architecture d’Intégration & Conformité Loi 25 (MSP Québec)
            </h2>
            <p className="text-xs text-slate-300">
              SursiTrack comme brique d’extension officielle du Programme Horizon (Projets 3 & 4).
            </p>
          </div>
        </div>
      </div>

      {/* Flux d'intégration visuelle entre SursiTrack et Horizon */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>Flux de Données unifié en Temps Réel</span>
        </h3>

        {/* Diagramme d'architecture visuel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          
          {/* Étape 1 : App Mobile Sursitaire */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-800/50 space-y-2 text-center relative">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 mx-auto flex items-center justify-center font-bold">1</div>
            <h4 className="text-xs font-bold text-slate-100">App Mobile Sursitaire</h4>
            <p className="text-[11px] text-slate-400">Check-in biométrique + GPS + Photo hachée localement.</p>
            <span className="inline-block px-2 py-0.5 text-[9px] font-mono bg-cyan-950 text-cyan-400 rounded border border-cyan-800">
              WebSocket / TLS 1.3
            </span>
          </div>

          {/* Étape 2 : Backend SursiTrack */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-800/50 space-y-2 text-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 mx-auto flex items-center justify-center font-bold">2</div>
            <h4 className="text-xs font-bold text-slate-100">Backend SursiTrack</h4>
            <p className="text-[11px] text-slate-400">Moteur de géofencing & validation des preuves.</p>
            <span className="inline-block px-2 py-0.5 text-[9px] font-mono bg-indigo-950 text-indigo-400 rounded border border-indigo-800">
              AWS Montréal (Hébergé au QC)
            </span>
          </div>

          {/* Étape 3 : Passerelle MSP Québec */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-800/50 space-y-2 text-center">
            <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 mx-auto flex items-center justify-center font-bold">3</div>
            <h4 className="text-xs font-bold text-slate-100">API Gateway MSP</h4>
            <p className="text-[11px] text-slate-400">Cadre commun d’interopérabilité du Québec.</p>
            <span className="inline-block px-2 py-0.5 text-[9px] font-mono bg-purple-950 text-purple-400 rounded border border-purple-800">
              OAuth2 + JWT + SSL
            </span>
          </div>

          {/* Étape 4 : Programme Horizon */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-800/50 space-y-2 text-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 mx-auto flex items-center justify-center font-bold">4</div>
            <h4 className="text-xs font-bold text-slate-100">Dossier Unique Horizon</h4>
            <p className="text-[11px] text-slate-400">Mise à jour automatique des Projets 3 & 4 + Alertes Agent.</p>
            <span className="inline-block px-2 py-0.5 text-[9px] font-mono bg-emerald-950 text-emerald-400 rounded border border-emerald-800">
              Vision 360° Agent
            </span>
          </div>

        </div>
      </div>

      {/* Grid 2 Colonnes : Avantages MSP & Spécifications API */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Avantages Clés pour le MSP (6/12) */}
        <div className="md:col-span-6 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Gains Concrets pour le Ministère (MSP)</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-slate-100 font-semibold">Productivité des Agents (+20h / semaine)</strong>
                <span className="text-slate-400">Remplacement des appels manuels par des alertes automatisées et vérifiées.</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-slate-100 font-semibold">Économie budgétaire (85% à 92%)</strong>
                <span className="text-slate-400">Utilisation des téléphones personnels des sursitaires au lieu d’équipements dédiés coûteux.</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3">
              <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-slate-100 font-semibold">Scalabilité sans friction</strong>
                <span className="text-slate-400">Déploiement immédiat de 200 sursitaires (pilote) jusqu’à 2 500 sursitaires à l’échelle nationale.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logs d'Audit Conformes Loi 25 (6/12) */}
        <div className="md:col-span-6 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Journal d’Audit & Preuves Loi 25</span>
          </h3>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {logs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{log.horodatage}</span>
                  <span className="text-emerald-400 font-bold">Loi 25 OK</span>
                </div>
                <p className="font-bold text-slate-200">{log.action}</p>
                <p className="text-[11px] text-slate-400">Dossier : {log.dossierCible}</p>
                <p className="text-[10px] text-cyan-400/80 font-mono truncate">{log.empreinteSecuritique}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
