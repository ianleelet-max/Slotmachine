import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { chatRouter } from './routes/chat.js';
import { healthRouter } from './routes/health.js';
import { configRouter } from './routes/config.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5055;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes API
app.use('/api/ai/chat', chatRouter);
app.use('/api/ai/health', healthRouter);
app.use('/api/ai/config', configRouter);

// Racine
app.get('/', (req, res) => {
  res.json({
    name: 'PowAI MiniMax-H3 & RunPod Serverless AI Engine',
    status: 'running',
    endpoints: [
      'POST /api/ai/chat',
      'GET /api/ai/health',
      'GET /api/ai/config'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`ðŸš€ [PowAI AI Engine] Passerelle IA dÃ©marrÃ©e sur http://0.0.0.0:${PORT}`);
  console.log(`âš¡ ModÃ¨le actif: MiniMax H3 50k Params via RunPod Serverless GPU`);
});