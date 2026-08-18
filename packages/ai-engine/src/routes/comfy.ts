import { Router, Request, Response } from 'express';
import { comfyuiProvider, ComfyWorkflowRequest } from '../providers/comfyuiRunpod.js';

export const comfyRouter = Router();

// Génération d'image / exécution de workflow
comfyRouter.post('/generate', async (req: Request, res: Response): Promise<void> => {
  const body: ComfyWorkflowRequest = req.body;

  try {
    const result = await comfyuiProvider.generate(body);
    res.json(result);
  } catch (error: any) {
    console.error('[ComfyUI API Error]:', error);
    res.status(500).json({
      error: 'Erreur lors de l exécution du workflow ComfyUI sur RunPod Serverless.',
      details: error.message
    });
  }
});

// Statut de santé et modèles sur le volume RunPod
comfyRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'ComfyUI RunPod Serverless GPU Bridge',
    configured: comfyuiProvider.isConfigured(),
    volumeModels: [
      { id: 'flux-1-dev', name: 'Flux.1 Dev (12B High-Precision)', file: 'flux-1-dev.safetensors', category: 'Flux' },
      { id: 'flux-1-schnell', name: 'Flux.1 Schnell (4-Step Turbo)', file: 'flux-1-schnell.safetensors', category: 'Flux' },
      { id: 'sdxl-turbo', name: 'SDXL Turbo (1-Step Realtime)', file: 'sdxl-turbo.safetensors', category: 'SDXL' },
      { id: 'realistic-vision-v6', name: 'Realistic Vision v6.0 (Photorealism)', file: 'realistic_vision_v6.safetensors', category: 'SD 1.5' },
      { id: 'cadastre-architecture-v1', name: 'PowAI Cadastre & Architecture LoRA', file: 'powai_cadastre_v1.safetensors', category: 'LoRA' }
    ],
    samplers: ['euler', 'euler_ancestral', 'dpmpp_2m_karras', 'dpmpp_sde_karras', 'ddim'],
    schedulers: ['normal', 'karras', 'exponential', 'sgm_uniform']
  });
});

// Configuration des clés
comfyRouter.post('/config', (req: Request, res: Response) => {
  const { apiKey, endpointId, volumePath } = req.body;
  if (apiKey && endpointId) {
    comfyuiProvider.setConfig(apiKey, endpointId, volumePath);
  }
  res.json({
    success: true,
    message: 'Configuration du pont ComfyUI / RunPod Serverless mise à jour.',
    configured: comfyuiProvider.isConfigured()
  });
});