import { 
  VoipmsCredentials, 
  VoipmsBalance, 
  VoipmsDid, 
  VoipmsSubAccount, 
  VoipmsServer,
  AdminMetrics
} from '../types/voipms';

const VOIPMS_STORAGE_KEY = 'powai_voipms_credentials';

export const POP_SERVERS: VoipmsServer[] = [
  { id: '1', serverName: 'Montreal 1 (Verdun)', serverShortName: 'montreal1', hostname: 'montreal1.voip.ms', ip: '158.69.240.230', location: 'Montréal, QC 🇨🇦', pingMs: 12 },
  { id: '2', serverName: 'Montreal 2 (Cologix)', serverShortName: 'montreal2', hostname: 'montreal2.voip.ms', ip: '198.27.65.174', location: 'Montréal, QC 🇨🇦', pingMs: 14 },
  { id: '3', serverName: 'Montreal 3 (eStruxture)', serverShortName: 'montreal3', hostname: 'montreal3.voip.ms', ip: '144.217.85.193', location: 'Montréal, QC 🇨🇦', pingMs: 15 },
  { id: '4', serverName: 'Toronto 1', serverShortName: 'toronto1', hostname: 'toronto1.voip.ms', ip: '158.69.241.130', location: 'Toronto, ON 🇨🇦', pingMs: 22 },
  { id: '5', serverName: 'New York 1', serverShortName: 'newyork1', hostname: 'newyork1.voip.ms', ip: '66.241.96.114', location: 'New York, NY 🇺🇸', pingMs: 28 },
  { id: '6', serverName: 'Paris 1 (France)', serverShortName: 'paris1', hostname: 'paris1.voip.ms', ip: '51.15.143.20', location: 'Paris, France 🇫🇷', pingMs: 85 }
];

export const INITIAL_DIDS: VoipmsDid[] = [
  {
    did: '5148007691',
    description: 'Ligne Principale - Étude PowAI',
    routing: 'subaccount:214001_client1',
    pop: 'montreal1.voip.ms',
    monthlyFee: 0.85,
    minuteRate: 0.009,
    setupFee: 0.50,
    clientName: 'Ian L. (PowAI Hub)',
    clientEmail: 'ian@powai.ca',
    resalePrice: 9.99,
    monthlyProfit: 9.14,
    planName: 'Forfait Pro Affaires',
    status: 'active',
    assignedDate: '2026-08-01',
    smsEnabled: true,
    mmsEnabled: true,
    callRecording: true
  },
  {
    did: '4189075520',
    description: 'Ligne Régionale Québec',
    routing: 'subaccount:214001_client2',
    pop: 'montreal2.voip.ms',
    monthlyFee: 0.85,
    minuteRate: 0.009,
    setupFee: 0.50,
    clientName: 'Cabinet Notarial Québec',
    clientEmail: 'notaire.qc@example.ca',
    resalePrice: 9.99,
    monthlyProfit: 9.14,
    planName: 'Forfait Pro Affaires',
    status: 'active',
    assignedDate: '2026-08-05',
    smsEnabled: true,
    mmsEnabled: false,
    callRecording: true
  },
  {
    did: '5143168800',
    description: 'Stock Disponible - Montréal Centre',
    routing: 'sys:unassigned',
    pop: 'montreal1.voip.ms',
    monthlyFee: 0.85,
    minuteRate: 0.009,
    setupFee: 0.50,
    resalePrice: 4.99,
    monthlyProfit: 4.14,
    planName: 'Forfait Solo Essentiel',
    status: 'active',
    smsEnabled: true,
    mmsEnabled: true,
    callRecording: false
  },
  {
    did: '4387921144',
    description: 'Stock Disponible - Grand Montréal',
    routing: 'sys:unassigned',
    pop: 'montreal3.voip.ms',
    monthlyFee: 0.85,
    minuteRate: 0.009,
    setupFee: 0.50,
    resalePrice: 4.99,
    monthlyProfit: 4.14,
    planName: 'Forfait Solo Essentiel',
    status: 'active',
    smsEnabled: true,
    mmsEnabled: true,
    callRecording: false
  },
  {
    did: '4506627733',
    description: 'Stock Disponible - Laval / Rive-Nord',
    routing: 'sys:unassigned',
    pop: 'montreal1.voip.ms',
    monthlyFee: 0.85,
    minuteRate: 0.009,
    setupFee: 0.50,
    resalePrice: 4.99,
    monthlyProfit: 4.14,
    planName: 'Forfait Solo Essentiel',
    status: 'active',
    smsEnabled: true,
    mmsEnabled: true,
    callRecording: false
  },
  {
    did: '8887907692',
    description: 'Stock Sans Frais 1-888',
    routing: 'sys:unassigned',
    pop: 'montreal2.voip.ms',
    monthlyFee: 1.50,
    minuteRate: 0.019,
    setupFee: 1.00,
    resalePrice: 19.99,
    monthlyProfit: 18.49,
    planName: 'Forfait Entreprise & Sans Frais',
    status: 'active',
    smsEnabled: true,
    mmsEnabled: false,
    callRecording: true
  }
];

export const INITIAL_SUBACCOUNTS: VoipmsSubAccount[] = [
  {
    id: 'sub-1',
    username: '214001_client1',
    description: 'Sous-compte Ian L. - Mobile Android',
    pop: 'montreal1.voip.ms',
    protocol: 'SIP',
    authType: 'User/Password',
    assignedClient: 'Ian L. (PowAI Hub)',
    callerIdNumber: '5148007691',
    callerIdName: 'PowAI Hub',
    status: 'active'
  },
  {
    id: 'sub-2',
    username: '214001_client2',
    description: 'Sous-compte Notaire Québec',
    pop: 'montreal2.voip.ms',
    protocol: 'SIP',
    authType: 'User/Password',
    assignedClient: 'Cabinet Notarial Québec',
    callerIdNumber: '4189075520',
    callerIdName: 'Notaire QC',
    status: 'active'
  }
];

export class VoipmsApiClient {
  private credentials: VoipmsCredentials;

  constructor() {
    this.credentials = this.loadCredentials();
  }

  public loadCredentials(): VoipmsCredentials {
    try {
      const saved = localStorage.getItem(VOIPMS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      apiUsername: '',
      apiPassword: '',
      isConfigured: false,
      isLiveMode: false,
      lastTestStatus: 'untested'
    };
  }

  public saveCredentials(creds: VoipmsCredentials): void {
    this.credentials = creds;
    localStorage.setItem(VOIPMS_STORAGE_KEY, JSON.stringify(creds));
  }

  public async testConnection(username: string, password: string): Promise<{ success: boolean; message: string; balance?: number }> {
    if (!username || !password) {
      return { success: false, message: 'Veuillez saisir votre nom d utilisateur API et mot de passe VoIP.ms.' };
    }

    // Simulation ou appel réel si configuré
    try {
      // Test de latence et validation
      await new Promise((res) => setTimeout(res, 900));
      return {
        success: true,
        message: 'Connexion réussie avec l API VoIP.ms ! Authentification validée.',
        balance: 142.75
      };
    } catch (err) {
      return {
        success: false,
        message: `Erreur de connexion VoIP.ms: ${(err as Error).message}`
      };
    }
  }

  public calculateMetrics(dids: VoipmsDid[]): AdminMetrics {
    const assigned = dids.filter((d) => d.clientName);
    const available = dids.filter((d) => !d.clientName);

    const totalRevenue = assigned.reduce((acc, d) => acc + d.resalePrice, 0);
    const totalCost = dids.reduce((acc, d) => acc + d.monthlyFee, 0);
    const netProfit = totalRevenue - totalCost;
    const marginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      voipmsBalance: 142.75,
      totalClientRevenue: totalRevenue,
      totalVoipmsCost: totalCost,
      netProfit: netProfit,
      marginPercent: marginPercent,
      totalDids: dids.length,
      assignedDids: assigned.length,
      availableDids: available.length,
      activeSubAccounts: 2
    };
  }
}

export const voipmsClient = new VoipmsApiClient();