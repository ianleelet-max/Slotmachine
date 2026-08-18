import OpenAI from 'openai';

export interface PersonnePhy {
  nom: string;
  prenom: string;
  role: 'administrateur' | 'actionnaire' | 'beneficiaire_ultime';
  adresse?: string;
  pourcentageDetention?: number;
}

export interface ExtractionResult {
  neq: string;
  personnes: PersonnePhy[];
}

export class LLMReqParser {
  private client: OpenAI;
  private modelName: string;

  constructor() {
    const baseURL = process.env.LLM_API_BASE_URL || 'http://localhost:11434/v1';
    const apiKey = process.env.LLM_API_KEY || 'runpod-dummy-key';
    this.modelName = process.env.LLM_MODEL_NAME || 'llama3';

    this.client = new OpenAI({
      baseURL,
      apiKey,
    });
  }

  async parseReqPage(neq: string, htmlContent: string): Promise<ExtractionResult> {
    const prompt = `Tu es un assistant IA spécialisé dans l'analyse de documents juridiques du Registre des Entreprises du Québec (REQ).
Analyse le contenu HTML ou textuel ci-dessous pour l'entreprise avec le NEQ ${neq}.
Extrais toutes les personnes physiques répertoriées (administrateurs, actionnaires, et bénéficiaires ultimes).

Retourne UNIQUEMENT un objet JSON valide suivant exactement cette structure :
{
  "neq": "${neq}",
  "personnes": [
    {
      "nom": "Nom de famille",
      "prenom": "Prénom",
      "role": "administrateur" | "actionnaire" | "beneficiaire_ultime",
      "adresse": "Adresse complète si disponible",
      "pourcentageDetention": 50 (nombre ou null)
    }
  ]
}

Contenu de la page :
${htmlContent.slice(0, 15000)}
`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.modelName,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(content);

      return {
        neq,
        personnes: Array.isArray(parsed.personnes) ? parsed.personnes : [],
      };
    } catch (error) {
      console.warn(`[LLMReqParser] Erreur lors de l'appel au LLM (${this.modelName} sur ${process.env.LLM_API_BASE_URL}) :`, error);
      // Fallback vide si le serveur LLM/RunPod n'est pas joignable
      return {
        neq,
        personnes: [],
      };
    }
  }
}
