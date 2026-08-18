import { Router, Request, Response } from 'express';
import { runpodProvider } from '../providers/runpodServerless.js';
import { minimaxProvider } from '../providers/minimaxClient.js';

export const configRouter = Router();

configRouter.get('/', (req: Request, res: Response) => {
  res.json({
    runpodConfigured: runpodProvider.isConfigured(),
    minimaxConfigured: minimaxProvider.isConfigured(),
    defaultModel: 'minimax-h3-50k-serverless',
    maxContextTokens: 50000
  });
});

configRouter.post('/', (req: Request, res: Response) => {
  const { runpodApiKey, runpodEndpointId, minimaxApiKey, minimaxGroupId } = req.body;

  if (runpodApiKey && runpodEndpointId) {
    runpodProvider.setCredentials(runpodApiKey, runpodEndpointId);
  }

  if (minimaxApiKey && minimaxGroupId) {
    minimaxProvider.setCredentials(minimaxApiKey, minimaxGroupId);
  }

  res.json({
    success: true,
    message: 'Configuration des clés d inférence IA mise à jour avec succès.',
    runpodConfigured: runpodProvider.isConfigured(),
    minimaxConfigured: minimaxProvider.isConfigured()
  });
});