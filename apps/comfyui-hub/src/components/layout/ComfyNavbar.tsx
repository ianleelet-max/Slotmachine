import React from 'react';
import { 
  Sparkles, 
  Cpu, 
  HardDrive, 
  Settings, 
  Layers, 
  ExternalLink, 
  Zap,
  Activity,
  Image as ImageIcon
} from 'lucide-react';
import { ComfyServerState } from '../../types/comfy';

interface ComfyNavbarProps {
  state: ComfyServerState;
  onOpenConfig: () => void;
  activeView: 'studio' | 'workflow' | 'gallery';
  onChangeView: (view: 'studio' | 'workflow' | 'gallery') => void;
}

export const ComfyNavbar: React.FC<ComfyNavbarProps> = ({
  state,
  onOpenConfig,
  activeView,
  onChangeView
}) => {
  return (
    <header className="w-full bg-[#0a0f1d] border-b border-slate-800/90 px-6 py-3.5 flex items-center justify-between z-30 select-none">
      
      {/* Logo & Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center font-black text-white shadow-lg shadow-purple-600/30">
          <Sparkles size={20} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base text-white tracking-wide flex items-center gap-1.5">
              <span>ComfyUI Studio</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/90 text-purple-300 border border-purple-700/60 font-mono uppercase font-bold">
                RunPod Serverless
              </span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-400">
            Génération Visuelle & Modèles Flux/SDXL sur Volume Dédié
          </p>
        </div>
      </div>

      {/* Sélecteur de Vues */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800">
        <button
          onClick={() => onChangeView('studio')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeView === 'studio'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Studio de Prompting
        </button>
        <button
          onClick={() => onChangeView('workflow')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeView === 'workflow'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Workflows JSON
        </button>
        <button
          onClick={() => onChangeView('gallery')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeView === 'gallery'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Galerie des Rendus
        </button>
      </div>

      {/* Indicateurs GPU & Volume RunPod */}
      <div className="flex items-center gap-3">
        
        {/* Statut Volume Réseau RunPod */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <HardDrive size={13} className="text-cyan-400" />
          <span className="text-slate-400">Volume :</span>
          <span className="font-mono font-bold text-slate-200 truncate max-w-[140px]">
            {state.runpodVolumePath}
          </span>
        </div>

        {/* GPU Serverless */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">GPU :</span>
          <span className="font-mono font-bold text-emerald-400">{state.gpuType}</span>
        </div>

        {/* Configuration RunPod */}
        <button
          onClick={onOpenConfig}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-sm"
          title="Paramètres du Volume & Endpoint RunPod"
        >
          <Settings size={16} />
        </button>

      </div>

    </header>
  );
};