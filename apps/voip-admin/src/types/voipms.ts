export interface VoipmsCredentials {
  apiUsername: string;
  apiPassword: string;
  isConfigured: boolean;
  isLiveMode: boolean;
  lastTestStatus?: 'success' | 'error' | 'untested';
  lastTestMessage?: string;
}

export interface VoipmsBalance {
  balance: number;
  currency: string;
}

export interface VoipmsDid {
  did: string;
  description: string;
  routing: string;
  pop: string;
  monthlyFee: number;
  minuteRate: number;
  setupFee: number;
  clientName?: string;
  clientEmail?: string;
  resalePrice: number;
  monthlyProfit: number;
  planName: string;
  status: 'active' | 'pending' | 'suspended';
  assignedDate?: string;
  smsEnabled: boolean;
  mmsEnabled: boolean;
  callRecording: boolean;
}

export interface VoipmsSubAccount {
  id: string;
  username: string;
  description: string;
  pop: string;
  protocol: 'SIP' | 'IAX2';
  authType: 'User/Password' | 'IP';
  assignedClient: string;
  callerIdNumber: string;
  callerIdName: string;
  status: 'active' | 'inactive';
}

export interface VoipmsServer {
  id: string;
  serverName: string;
  serverShortName: string;
  hostname: string;
  ip: string;
  location: string;
  pingMs?: number;
}

export interface AdminMetrics {
  voipmsBalance: number;
  totalClientRevenue: number;
  totalVoipmsCost: number;
  netProfit: number;
  marginPercent: number;
  totalDids: number;
  assignedDids: number;
  availableDids: number;
  activeSubAccounts: number;
}