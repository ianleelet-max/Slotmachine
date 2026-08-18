import React from 'react';
import { ShieldCheck, Smartphone, Cpu, Bell, Activity, Lock, Database, Presentation } from 'lucide-react';
import { AlerteTempsReel } from '../types/sursitrack';

interface NavigationProps {
  vueActive: 'pitch' | 'horizon' | 'mobile' | 'interop';
  setVueActive: (vue: 'pitch' | 'horizon' | 'mobile' | 'interop') => void;
  alertes: AlerteTempsReel[];
  nombreNonLues: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  vueActive,
  setVueActive,
  nombreNonLues,
}) => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-[#090d16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Marque Institutionnelle */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-emerald-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  SursiTrack
                </span>
                <span className="px-2 py-0.5 text-xs font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded-md tracking-wide uppercase">
                  Horizon 360°
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Ministère de la Sécurité publique du Québec (MSP)
              </p>
            </div>
          </div>

          {/* Onglets de navigation principaux */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setVueActive('pitch')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                vueActive === 'pitch'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20'
                  : 'text-amber-400 hover:text-amber-200 hover:bg-slate-800/60'
              }`}
            >
              <Presentation className="w-4 h-4" />
              <span>Pitch Exécutif MSP</span>
            </button>

            <button
              onClick={() => setVueActive('horizon')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                vueActive === 'horizon'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Horizon 360° (Agent)</span>
              <span className="sm:hidden">Horizon</span>
            </button>

            <button
              onClick={() => setVueActive('mobile')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                vueActive === 'mobile'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">App Sursitaire (Mobile)</span>
              <span className="sm:hidden">Sursitaire</span>
            </button>

            <button
              onClick={() => setVueActive('interop')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                vueActive === 'interop'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span className="hidden sm:inline">Interop & Loi 25</span>
              <span className="sm:hidden">Interop</span>
            </button>
          </nav>

          {/* Statut & Badge d'alerte */}
          <div className="flex items-center space-x-3">
            
            {/* Indicateur d'Alerte Live */}
            <div className="relative">
              <button 
                onClick={() => setVueActive('horizon')}
                className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800/80 rounded-lg border border-slate-800 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {nombreNonLues > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center pulse-crimson">
                    {nombreNonLues}
                  </span>
                )}
              </button>
            </div>

            {/* Badge de Conformité Loi 25 */}
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Conforme Loi 25</span>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
