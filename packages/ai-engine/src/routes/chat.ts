import { Router, Request, Response } from 'express';
import { ChatCompletionRequest } from '../types/ai.js';
import { runpodProvider } from '../providers/runpodServerless.js';
import { minimaxProvider } from '../providers/minimaxClient.js';

export const chatRouter = Router();

chatRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const body: ChatCompletionRequest = req.body;

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    res.status(400).json({ error: 'Le champ "messages" doit être un tableau non vide.' });
    return;
  }

  const providerType = body.provider || 'auto';

  try {
    let result;
    if (providerType === 'minimax' && minimaxProvider.isConfigured()) {
      result = await minimaxProvider.generateCompletion(body);
    } else {
      // Par défaut on utilise RunPod Serverless GPU
      result = await runpodProvider.generateCompletion(body);
    }

    res.json(result);
  } catch (error: any) {
    console.error('[Chat API Error]:', error);
    res.status(500).json({
      error: 'Erreur lors de la génération de la complétion IA.',
      details: error.message
    });
  }
});