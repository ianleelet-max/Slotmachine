export interface VoipNumber {
  id: string;
  number: string;
  country: string;
  flag: string;
  region: string;
  type: 'local' | 'tollfree' | 'mobile';
  monthlyPrice: number;
  setupFee: number;
  features: string[];
  isPurchased?: boolean;
  isDefault?: boolean;
  sipUsername?: string;
  sipServer?: string;
  wholesaleCost?: number;
  monthlyProfit?: number;
}

export interface DidStockItem {
  id: string;
  number: string;
  country: string;
  flag: string;
  region: string;
  type: 'local' | 'tollfree' | 'mobile';
  wholesaleCost: number; // Coût d'achat grossiste (ex: 0.85 $)
  resalePrice: number;   // Prix de revente au client (ex: 4.99 $)
  monthlyProfit: number; // Profit mensuel net (resalePrice - wholesaleCost)
  status: 'available' | 'assigned' | 'reserved';
  assignedTo?: string;   // Nom du client ou ligne
  assignedDate?: string;
  planId?: string;
  features: string[];
  sipUsername?: string;
  sipServer?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  description: string;
  includedMinutes: number | 'illimité';
  includedSms: number | 'illimité';
  features: string[];
  isPopular?: boolean;
}

export interface CallRecord {
  id: string;
  number: string;
  contactName?: string;
  type: 'incoming' | 'outgoing' | 'missed';
  timestamp: string;
  durationSeconds: number;
  lineUsed: string;
}

export interface MessageItem {
  id: string;
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  peerNumber: string;
  peerName?: string;
  avatarColor: string;
  unreadCount: number;
  lastMessage: string;
  lastTimestamp: string;
  messages: MessageItem[];
}

export interface ProfitMetrics {
  totalRevenueMonthly: number;
  totalWholesaleCostMonthly: number;
  netProfitMonthly: number;
  profitMarginPercent: number;
  totalDids: number;
  activeAssignedDids: number;
  availableDids: number;
}