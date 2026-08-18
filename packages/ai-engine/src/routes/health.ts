import { Router, Request, Response } from 'express';
import { runpodProvider } from '../providers/runpodServerless.js';
import { minimaxProvider } from '../providers/minimaxClient.js';

export const healthRouter = Router();

healthRouter.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'PowAI Neural Gateway (MiniMax-H3 / RunPod Serverless)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    providers: {
      runpodServerless: {
        status: 'ready',
        model: 'minimax-h3-50k-serverless',
        gpuBackend: 'RunPod Serverless Cluster',
        configured: runpodProvider.isConfigured()
      },
      minimaxDirect: {
        status: 'ready',
        model: 'MiniMax-Text-01 (Mamba H3)',
        configured: minimaxProvider.isConfigured()
      }
    },
    uptimeSeconds: Math.floor(process.uptime())
  });
});