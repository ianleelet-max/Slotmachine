import React, { useState } from 'react';
import { FileJson, Upload, Play, CheckCircle2, Copy, Sparkles } from 'lucide-react';

interface WorkflowEditorProps {
  onExecuteWorkflow: (workflowJson: any) => void;
  isGenerating: boolean;
}

export const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  onExecuteWorkflow,
  isGenerating
}) => {
  const [jsonText, setJsonText] = useState(JSON.stringify({
    "3": {
      "inputs": {
        "seed": 428912,
        "steps": 25,
        "cfg": 7.0,
        "sampler_name": "euler",
        "scheduler": "normal",
        "denoise": 1
      },
      "class_type": "KSampler"
    },
    "4": {
      "inputs": {
        "ckpt_name": "flux-1-dev.safetensors"
      },
      "class_type": "CheckpointLoaderSimple"
    },
    "6": {
      "inputs": {
        "text": "Ultra-detailed luxury mansion with glowing cadastral boundary lines, Montreal architecture, 8k render",
        "clip": ["4", 1]
      },
      "class_type": "CLIPTextEncode"
    }
  }, null, 2));

  const [parseError, setParseError] = useState<string | null>(null);

  const handleRun = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setParseError(null);
      onExecuteWorkflow(parsed);
    } catch (e: any) {
      setParseError(e.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        JSON.parse(content);
        setJsonText(content);
        setParseError(null);
      } catch (err) {
        setParseError('Fichier JSON invalide.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      
      <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileJson size={18} className="text-purple-400" />
              <span>Importateur & Exécuteur de Workflows ComfyUI (JSON Prompt Graph)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Collez ou chargez n'importe quel graphe de nœuds exporté depuis ComfyUI pour exécution sur RunPod
            </p>
          </div>

          <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all">
            <Upload size={14} />
            <span>Charger un fichier .json</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <textarea
          rows={14}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-300 focus:outline-none focus:border-purple-500 leading-relaxed"
        />

        {parseError && (
          <p className="text-xs text-rose-400 font-mono">
            ⚠️ Erreur de syntaxe JSON : {parseError}
          </p>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleRun}
            disabled={isGenerating}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
          >
            <Play size={15} />
            <span>{isGenerating ? 'Exécution sur RunPod GPU...' : 'Exécuter le Workflow'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};