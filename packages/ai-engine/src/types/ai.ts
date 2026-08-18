export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  provider?: 'runpod' | 'minimax' | 'auto';
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  provider: 'runpod' | 'minimax' | 'local';
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  latency_ms: number;
}

export interface RunPodJobInput {
  prompt?: string;
  messages?: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

export interface RunPodSyncResponse {
  id: string;
  status: 'COMPLETED' | 'FAILED' | 'IN_PROGRESS' | 'IN_QUEUE';
  output: any;
  executionTime?: number;
  delayTime?: number;
}