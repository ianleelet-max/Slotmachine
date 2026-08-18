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