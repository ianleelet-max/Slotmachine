export interface ModelCheckpoint {
  id: string;
  name: string;
  file: string;
  category: 'Flux' | 'SDXL' | 'SD 1.5' | 'LoRA';
  description: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  negativePrompt?: string;
  checkpoint: string;
  sampler: string;
  steps: number;
  cfg: number;
  seed: number;
  width: number;
  height: number;
  timestamp: string;
  executionTimeMs: number;
}

export interface ComfyServerState {
  isGenerating: boolean;
  progress: number;
  activeJobId: string | null;
  serverlessEndpoint: string;
  runpodVolumePath: string;
  isVolumeMounted: boolean;
  gpuType: string;
}