import { ReqBrowser } from './browser.js';
import { LLMReqParser, type ExtractionResult } from './llm-parser.js';

export class ReqAgentWorker {
  private browser: ReqBrowser;
  private parser: LLMReqParser;
  private isRunning: boolean = false;

  constructor() {
    this.browser = new ReqBrowser();
    this.parser = new LLMReqParser();
  }

  async processNeq(neq: string): Promise<ExtractionResult> {
    console.log(`[Agent Worker] Traitement du NEQ: ${neq}...`);
    
    // 1. Navigation discrète Playwright
    const html = await this.browser.fetchCompanyHtml(neq);
    console.log(`[Agent Worker] Page récupérée (${html.length} octets). Analyse avec LLM...`);

    // 2. Extraction structurée par le modèle IA (RunPod / Local / Ollama)
    const result = await this.parser.parseReqPage(neq, html);
    console.log(`[Agent Worker] Extraction terminée pour ${neq}: ${result.personnes.length} personnes identifiées.`);

    return result;
  }

  async startDaemon(queueNeqs: string[], intervalMs: number = 10000) {
    this.isRunning = true;
    console.log(`[Agent Worker Daemon] Agent IA démarré en arrière-plan (intervalle: ${intervalMs}ms).`);

    for (const neq of queueNeqs) {
      if (!this.isRunning) break;
      try {
        await this.processNeq(neq);
      } catch (err) {
        console.error(`[Agent Worker Daemon] Erreur sur le NEQ ${neq}:`, err);
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }

    await this.browser.close();
    console.log(`[Agent Worker Daemon] Traitement de la file terminé.`);
  }

  stop() {
    this.isRunning = false;
  }
}

if (process.argv[1]?.endsWith('worker.js')) {
  const neqs = process.argv.slice(2);
  const targetNeqs = neqs.length > 0 ? neqs : ['1160000000', '1170000000'];

  const worker = new ReqAgentWorker();
  worker.startDaemon(targetNeqs).catch(console.error);
}
