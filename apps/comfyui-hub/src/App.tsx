import React, { useState } from 'react';
import { ComfyNavbar } from './components/layout/ComfyNavbar';
import { PromptStudio } from './components/studio/PromptStudio';
import { OutputGallery } from './components/studio/OutputGallery';
import { WorkflowEditor } from './components/studio/WorkflowEditor';
import { RunpodConfigModal } from './components/studio/RunpodConfigModal';
import { ModelCheckpoint, GeneratedImage, ComfyServerState } from './types/comfy';

const DEFAULT_MODELS: ModelCheckpoint[] = [
  { id: 'flux-1-dev', name: 'Flux.1 Dev (12B High-Precision)', file: 'flux-1-dev.safetensors', category: 'Flux', description: 'Rendu architectural et photoréalisme de pointe' },
  { id: 'flux-1-schnell', name: 'Flux.1 Schnell (4-Step Turbo)', file: 'flux-1-schnell.safetensors', category: 'Flux', description: 'Génération ultra-rapide en 4 étapes' },
  { id: 'sdxl-turbo', name: 'SDXL Turbo (1-Step Realtime)', file: 'sdxl-turbo.safetensors', category: 'SDXL', description: 'Rendu temps réel' },
  { id: 'realistic-vision-v6', name: 'Realistic Vision v6.0', file: 'realistic_vision_v6.safetensors', category: 'SD 1.5', description: 'Fidélité photoréaliste et textures' },
  { id: 'cadastre-architecture-v1', name: 'PowAI Cadastre & Architecture LoRA', file: 'powai_cadastre_v1.safetensors', category: 'LoRA', description: 'Modèle spécialisé géomatique et cadastre' }
];

const INITIAL_IMAGES: GeneratedImage[] = [
  {
    id: 'img-1',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    prompt: 'Maison contemporaine à Montréal avec limites cadastrales lumineuses, vue 3D aérienne et volumétrie du terrain',
    checkpoint: 'flux-1-dev.safetensors',
    sampler: 'euler',
    steps: 25,
    cfg: 7.0,
    seed: 849201,
    width: 1024,
    height: 1024,
    timestamp: 'Aujourd hui 10:45',
    executionTimeMs: 1420
  },
  {
    id: 'img-2',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
    prompt: 'Rendu photoréaliste de certificat de localisation architectural, façade moderne et aménagement foncier',
    checkpoint: 'sdxl-turbo.safetensors',
    sampler: 'dpmpp_2m_karras',
    steps: 20,
    cfg: 6.5,
    seed: 390194,
    width: 1344,
    height: 768,
    timestamp: 'Hier 16:20',
    executionTimeMs: 890
  }
];

export function App() {
  const [activeView, setActiveView] = useState<'studio' | 'workflow' | 'gallery'>('studio');
  const [models, setModels] = useState<ModelCheckpoint[]>(DEFAULT_MODELS);
  const [images, setImages] = useState<GeneratedImage[]>(INITIAL_IMAGES);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [serverState, setServerState] = useState<ComfyServerState>({
    isGenerating: false,
    progress: 0,
    activeJobId: null,
    serverlessEndpoint: 'comfyui-serverless-gpu',
    runpodVolumePath: '/runpod-volume/models',
    isVolumeMounted: true,
    gpuType: 'NVIDIA H100 / RTX 4090'
  });

  const handleGenerate = async (params: any) => {
    setServerState((prev) => ({ ...prev, isGenerating: true, progress: 10 }));

    try {
      const response = await fetch('/api/comfy/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      const data = await response.json();
      const newImg: GeneratedImage = {
        id: `img-${Date.now()}`,
        url: data.images?.[0]?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        prompt: params.prompt || 'Génération ComfyUI',
        checkpoint: params.checkpoint || 'flux-1-dev.safetensors',
        sampler: params.sampler || 'euler',
        steps: params.steps || 25,
        cfg: params.cfg || 7.0,
        seed: data.images?.[0]?.seed || Math.floor(Math.random() * 999999),
        width: params.width || 1024,
        height: params.height || 1024,
        timestamp: 'À l instant',
        executionTimeMs: data.executionTimeMs || 1200
      };

      setImages([newImg, ...images]);
      setActiveView('gallery');
    } catch (err) {
      console.error('Erreur lors du rendu ComfyUI:', err);
    } finally {
      setServerState((prev) => ({ ...prev, isGenerating: false, progress: 100 }));
    }
  };

  return (
    <div className="min-h-screen bg-[#060a13] text-slate-100 flex flex-col font-sans select-none">
      
      {/* Barre Supérieure */}
      <ComfyNavbar
        state={serverState}
        onOpenConfig={() => setShowConfigModal(true)}
        activeView={activeView}
        onChangeView={setActiveView}
      />

      {/* Contenu Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        
        {activeView === 'studio' && (
          <PromptStudio
            models={models}
            onGenerate={handleGenerate}
            isGenerating={serverState.isGenerating}
          />
        )}

        {activeView === 'workflow' && (
          <WorkflowEditor
            onExecuteWorkflow={handleGenerate}
            isGenerating={serverState.isGenerating}
          />
        )}

        {activeView === 'gallery' && (
          <OutputGallery
            images={images}
          />
        )}

      </main>

      {/* Modal Paramètres Volume RunPod */}
      {showConfigModal && (
        <RunpodConfigModal
          onClose={() => setShowConfigModal(false)}
          onSave={(cfg) => {
            setServerState((prev) => ({
              ...prev,
              runpodVolumePath: cfg.volumePath || prev.runpodVolumePath
            }));
          }}
        />
      )}

    </div>
  );
}

export default App;