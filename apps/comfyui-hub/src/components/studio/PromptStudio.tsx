import React, { useState } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Layers, 
  Sliders, 
  Maximize2, 
  Cpu, 
  Zap, 
  RefreshCw, 
  HardDrive,
  CheckCircle2
} from 'lucide-react';
import { ModelCheckpoint, GeneratedImage } from '../../types/comfy';

interface PromptStudioProps {
  models: ModelCheckpoint[];
  onGenerate: (params: any) => void;
  isGenerating: boolean;
}

export const PromptStudio: React.FC<PromptStudioProps> = ({
  models,
  onGenerate,
  isGenerating
}) => {
  const [prompt, setPrompt] = useState('Vue aérienne et perspective cadastrale 3D d un domaine moderne à Montréal, limites de terrain tracées en néon cyan, rendu photoréaliste 8k, architecture contemporaine');
  const [negativePrompt, setNegativePrompt] = useState('blurry, low quality, distorted geometry, artifacts, watermark');
  const [selectedModel, setSelectedModel] = useState('flux-1-dev.safetensors');
  const [steps, setSteps] = useState(25);
  const [cfg, setCfg] = useState(7.0);
  const [sampler, setSampler] = useState('euler');
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [seed, setSeed] = useState<number | ''>('');

  const resolutionPresets = [
    { label: 'Carré 1:1', w: 1024, h: 1024 },
    { label: 'Paysage 16:9', w: 1344, h: 768 },
    { label: 'Portrait 9:16', w: 768, h: 1344 },
    { label: 'Bannière 21:9', w: 1536, h: 640 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    onGenerate({
      prompt: prompt.trim(),
      negative_prompt: negativePrompt.trim(),
      checkpoint: selectedModel,
      steps,
      cfg,
      sampler,
      width,
      height,
      seed: seed === '' ? Math.floor(Math.random() * 999999999) : Number(seed)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Zone de Saisie du Prompt Principal */}
      <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-4">
        
        <div>
          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-purple-400">
              <Sparkles size={15} />
              <span>Prompt Positif (Description du Rendu) :</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Délégation GPU RunPod vLLM</span>
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Décrivez l'image ou le rendu que vous souhaitez générer..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors leading-relaxed"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Prompt Négatif (Éléments à Exclure) :
          </label>
          <input
            type="text"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="Ce que vous ne voulez pas voir..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-700"
          />
        </div>

      </div>

      {/* Paramètres Techniques & Modèles sur le Volume RunPod */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Choix du Modèle Checkpoint */}
        <div className="p-5 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-3">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <HardDrive size={15} className="text-cyan-400" />
            <span>Modèle / Checkpoint (Volume RunPod) :</span>
          </label>
          
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
          >
            {models.map((m) => (
              <option key={m.id} value={m.file}>
                [{m.category}] {m.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">
            Stocké sur votre volume persistant et chargé instantanément en mémoire VRAM.
          </p>
        </div>

        {/* Résolution & Presets */}
        <div className="p-5 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-3">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <Maximize2 size={15} className="text-cyan-400" />
            <span>Format & Résolution :</span>
          </label>
          
          <div className="grid grid-cols-2 gap-2">
            {resolutionPresets.map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={() => { setWidth(r.w); setHeight(r.h); }}
                className={`p-2 rounded-xl text-xs font-medium border transition-all text-center ${
                  width === r.w && height === r.h
                    ? 'bg-purple-950 border-purple-600 text-purple-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {r.label} ({r.w}x{r.h})
              </button>
            ))}
          </div>
        </div>

        {/* Échantillonneur & Étapes (Sampler, Steps, CFG) */}
        <div className="p-5 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">Étapes (Steps) :</span>
            <span className="font-mono text-purple-400 font-bold">{steps}</span>
          </div>
          <input
            type="range"
            min={4}
            max={50}
            value={steps}
            onChange={(e) => setSteps(Number(e.target.value))}
            className="w-full accent-purple-500"
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="font-bold text-white">Guidance (CFG Scale) :</span>
            <span className="font-mono text-cyan-400 font-bold">{cfg.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={1.0}
            max={15.0}
            step={0.5}
            value={cfg}
            onChange={(e) => setCfg(Number(e.target.value))}
            className="w-full accent-cyan-500"
          />
        </div>

      </div>

      {/* Bouton de Déclenchement Génération */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-slate-400 font-mono">
          <span>Inférence : </span>
          <strong className="text-emerald-400">RunPod Serverless H100 / RTX 4090</strong>
        </div>

        <button
          type="submit"
          disabled={isGenerating || !prompt.trim()}
          className={`px-8 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-2xl transition-all ${
            isGenerating
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-purple-600/30 active:scale-95'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              <span>Génération en cours sur RunPod GPU...</span>
            </>
          ) : (
            <>
              <Wand2 size={18} />
              <span>Lancer le Rendu ComfyUI</span>
            </>
          )}
        </button>
      </div>

    </form>
  );
};