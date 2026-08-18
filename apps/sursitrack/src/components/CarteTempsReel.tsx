import React from 'react';
import { MapPin, Navigation as NavIcon, ShieldAlert, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Sursitaire } from '../types/sursitrack';

interface CarteTempsReelProps {
  sursitaire: Sursitaire;
  onCheckInSimule?: () => void;
}

export const CarteTempsReel: React.FC<CarteTempsReelProps> = ({ sursitaire }) => {
  const getBadgeStatut = () => {
    switch (sursitaire.statutConformite) {
      case 'conforme':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Conforme aux contraintes</span>
          </span>
        );
      case 'violation_critique':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-950 text-rose-400 border border-rose-800/60 flex items-center space-x-1.5 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Violation critique détectée</span>
          </span>
        );
      case 'alerte_mineure':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-950 text-amber-400 border border-amber-800/60 flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Attention requise</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-400 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>En attente</span>
          </span>
        );
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800 flex flex-col h-full">
      {/* En-tête de la carte */}
      <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
            <NavIcon className="w-5 h-5 animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <span>Géofencing & Telemetrie GPS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h3>
            <p className="text-xs text-slate-400">{sursitaire.dernierePosition.adresse}</p>
          </div>
        </div>
        <div>{getBadgeStatut()}</div>
      </div>

      {/* Rendu Visuel de la Carte GIS (Simulée avec style Sombre Tactical) */}
      <div className="relative flex-1 min-h-[320px] bg-[#070b14] overflow-hidden flex items-center justify-center">
        {/* Grille Tactique de Fond */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#06b6d4 1px, transparent 1px), radial-gradient(#1e293b 1px, #070b14 1px)`,
            backgroundSize: '30px 30px',
            backgroundPosition: '0 0, 15px 15px'
          }}
        />

        {/* Représentation des Périmètres Géofencés */}
        <div className="relative w-full h-full p-6 flex flex-col justify-between">
          
          {/* Zone Autorisée Domicile / Travail */}
          <div className="absolute top-12 left-12 p-4 rounded-full border-2 border-dashed border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center w-48 h-48 pointer-events-none">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider bg-slate-900/80 px-2 py-0.5 rounded border border-emerald-800/50">
              Zone travail autorisée (350m)
            </span>
          </div>

          {/* Zone Interdite (Rouge) */}
          <div className="absolute bottom-8 right-12 p-4 rounded-full border-2 border-rose-500/60 bg-rose-500/15 flex items-center justify-center w-56 h-56 pointer-events-none animate-pulse">
            <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider bg-slate-900/90 px-2 py-0.5 rounded border border-rose-800/80 flex items-center space-x-1">
              <ShieldAlert className="w-3 h-3 text-rose-500" />
              <span>Zone d’exclusion (500m)</span>
            </span>
          </div>

          {/* Marqueur GPS Live du Sursitaire */}
          <div className={`absolute transition-all duration-700 ease-in-out ${
            sursitaire.statutConformite === 'violation_critique' ? 'bottom-16 right-24' : 'top-24 left-28'
          }`}>
            <div className="relative flex items-center justify-center">
              {/* Pulse Ring */}
              <div className={`absolute w-12 h-12 rounded-full ${
                sursitaire.statutConformite === 'violation_critique' 
                  ? 'bg-rose-500/30 pulse-crimson' 
                  : 'bg-cyan-500/30 pulse-emerald'
              }`} />
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                sursitaire.statutConformite === 'violation_critique'
                  ? 'bg-rose-600 text-white shadow-rose-600/50'
                  : 'bg-cyan-500 text-slate-950 font-bold shadow-cyan-500/50'
              }`}>
                <MapPin className="w-5 h-5 fill-current" />
              </div>

              {/* Tooltip Info Sursitaire */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/95 border border-slate-700 px-3 py-1.5 rounded-lg shadow-xl text-xs z-10">
                <p className="font-bold text-slate-100">{sursitaire.nomComplet}</p>
                <p className="text-[10px] text-cyan-400 font-mono">
                  {sursitaire.dernierePosition.latitude.toFixed(4)} N, {sursitaire.dernierePosition.longitude.toFixed(4)} W
                </p>
              </div>
            </div>
          </div>

          {/* Overlay d'information bas de carte */}
          <div className="mt-auto z-10 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Zone autorisée</span>
              </span>
              <span className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Périmètre d’exclusion</span>
              </span>
            </div>
            <span className="text-slate-400 font-mono">
              Signal GPS : <strong className="text-emerald-400">Haute précision (HD-GPS)</strong>
            </span>
          </div>

        </div>
      </div>

      {/* Liste des contraintes géographiques */}
      <div className="p-4 bg-slate-900/40 border-t border-slate-800">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Périmètres enregistrés dans le Dossier Horizon :
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sursitaire.zones.map((zone) => (
            <div 
              key={zone.id}
              className={`p-2.5 rounded-lg text-xs border flex items-center justify-between ${
                zone.type === 'interdite_contact' || zone.type === 'interdite_alcool'
                  ? 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                  : 'bg-slate-950/40 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MapPin className={`w-3.5 h-3.5 ${
                  zone.type.startsWith('interdite') ? 'text-rose-400' : 'text-emerald-400'
                }`} />
                <span className="font-medium">{zone.nom}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{zone.rayonMetres}m</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
