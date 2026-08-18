import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatRouter } from './routes/chat.js';
import { healthRouter } from './routes/health.js';
import { configRouter } from './routes/config.js';
import { comfyRouter } from './routes/comfy.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5055;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Routes API
app.use('/api/ai/chat', chatRouter);
app.use('/api/ai/health', healthRouter);
app.use('/api/ai/config', configRouter);
app.use('/api/comfy', comfyRouter);

// Racine
app.get('/', (req, res) => {
  res.json({
    name: 'PowAI MiniMax-H3 & ComfyUI RunPod Serverless AI Engine',
    status: 'running',
    endpoints: [
      'POST /api/ai/chat',
      'GET /api/ai/health',
      'POST /api/comfy/generate',
      'GET /api/comfy/health'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 [PowAI AI Engine] Passerelle IA & ComfyUI démarrée sur http://0.0.0.0:${PORT}`);
  console.log(`⚡ Modèles: MiniMax H3 50k Params & ComfyUI Flux.1/SDXL sur RunPod Serverless GPU`);
});