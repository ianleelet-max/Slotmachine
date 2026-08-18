import React from 'react';
import { ShieldCheck, Activity, Key, Globe, DollarSign, Sparkles, ExternalLink } from 'lucide-react';
import { VoipmsCredentials, AdminMetrics } from '../../types/voipms';

interface AdminNavbarProps {
  credentials: VoipmsCredentials;
  metrics: AdminMetrics;
  onOpenSettings: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({
  credentials,
  metrics,
  onOpenSettings
}) => {
  return (
    <header className="w-full bg-[#0a101f] border-b border-slate-800/80 px-6 py-3 flex items-center justify-between z-30 select-none">
      
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 shadow-md shadow-cyan-500/20">
          VT
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base text-white tracking-wide">
              PowAI TEL <span className="text-cyan-400 font-mono text-xs uppercase bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">Carrier Admin</span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-400">
            Console de Redistribution & Flotte Télécom (Interconnecté VoIP.ms)
          </p>
        </div>
      </div>

      {/* Badges & Actions */}
      <div className="flex items-center gap-4">
        
        {/* Statut de l'API VoIP.ms */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">VoIP.ms API :</span>
          <span className="font-mono font-bold text-emerald-400">En Ligne</span>
        </div>

        {/* Solde VoIP.ms Grossiste */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">Solde Grossiste :</span>
          <span className="text-cyan-300 font-bold">{metrics.voipmsBalance.toFixed(2)} $ USD</span>
        </div>

        {/* Bouton Paramètres API */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-600/20 active:scale-95 transition-all"
        >
          <Key size={14} />
          <span>Clés API VoIP.ms</span>
        </button>

      </div>

    </header>
  );
};