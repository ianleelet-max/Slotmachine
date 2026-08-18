import React, { useState } from 'react';
import { X, HardDrive, Key, ShieldCheck, CheckCircle2, Cpu } from 'lucide-react';

interface RunpodConfigModalProps {
  onClose: () => void;
  onSave: (config: any) => void;
}

export const RunpodConfigModal: React.FC<RunpodConfigModalProps> = ({
  onClose,
  onSave
}) => {
  const [apiKey, setApiKey] = useState('rpa_••••••••••••••••••••••••');
  const [endpointId, setEndpointId] = useState('comfyui-serverless-gpu');
  const [volumePath, setVolumePath] = useState('/runpod-volume/models');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ apiKey, endpointId, volumePath });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0c1427] border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fadeIn">
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/60">
              <HardDrive size={18} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Paramètres RunPod Serverless & Volume</h3>
              <p className="text-xs text-slate-400">Connexion à votre stockage persistant et cluster GPU</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          <div>
            <label className="font-bold text-slate-300 block mb-1">
              Clé d'API RunPod (RUNPOD_API_KEY) :
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="rpa_..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">
              ID de l'Endpoint Serverless ComfyUI :
            </label>
            <input
              type="text"
              value={endpointId}
              onChange={(e) => setEndpointId(e.target.value)}
              placeholder="Ex: comfyui-serverless-gpu ou abc123def456"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1">
              Chemin de Montage du Volume Réseau (Models & Checkpoints) :
            </label>
            <input
              type="text"
              value={volumePath}
              onChange={(e) => setVolumePath(e.target.value)}
              placeholder="/runpod-volume/models"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs shadow-lg active:scale-95 transition-all"
            >
              Enregistrer les Paramètres
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};