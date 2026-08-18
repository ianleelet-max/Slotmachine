import { DidStockItem, SubscriptionPlan, ProfitMetrics } from '../types/voip';

export const PROPRIETARY_DID_INVENTORY: DidStockItem[] = [
  {
    id: 'did-qc-514-01',
    number: '+1 (514) 800-7691',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Montréal (Centre-Ville), QC',
    type: 'local',
    wholesaleCost: 0.85,
    resalePrice: 4.99,
    monthlyProfit: 4.14,
    status: 'assigned',
    assignedTo: 'Ligne Principale Utilisateur',
    assignedDate: '2026-08-01',
    planId: 'plan-pro',
    features: ['VoIP HD Opus', 'SMS Illimités', 'SIP Trunk TLS', 'Messagerie Vocale IA'],
    sipUsername: 'powai_5148007691',
    sipServer: 'sip.powai.ca:5060'
  },
  {
    id: 'did-qc-418-01',
    number: '+1 (418) 907-5520',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Québec & Lévis, QC',
    type: 'local',
    wholesaleCost: 0.85,
    resalePrice: 4.99,
    monthlyProfit: 4.14,
    status: 'assigned',
    assignedTo: 'Ligne Secondaire Québec',
    assignedDate: '2026-08-10',
    planId: 'plan-solo',
    features: ['VoIP HD', 'SMS/MMS', 'Chiffrement SRTP'],
    sipUsername: 'powai_4189075520',
    sipServer: 'sip.powai.ca:5060'
  },
  {
    id: 'did-qc-514-02',
    number: '+1 (514) 316-8800',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Montréal (Plateau & Centre), QC',
    type: 'local',
    wholesaleCost: 0.85,
    resalePrice: 5.50,
    monthlyProfit: 4.65,
    status: 'available',
    features: ['VoIP HD Opus', 'SMS Entrant/Sortant', 'WebRTC Direct', 'Enregistrement Légal']
  },
  {
    id: 'did-qc-438-01',
    number: '+1 (438) 792-1144',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Grand Montréal & Laval, QC',
    type: 'local',
    wholesaleCost: 0.85,
    resalePrice: 4.99,
    monthlyProfit: 4.14,
    status: 'available',
    features: ['VoIP HD', 'SMS/MMS', 'Transcription IA Temps Réel']
  },
  {
    id: 'did-qc-450-01',
    number: '+1 (450) 662-7733',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Laval & Couronne Nord, QC',
    type: 'local',
    wholesaleCost: 0.85,
    resalePrice: 4.99,
    monthlyProfit: 4.14,
    status: 'available',
    features: ['VoIP HD Opus', 'SMS Illimités', 'Routage multi-terminaux']
  },
  {
    id: 'did-qc-450-02',
    number: '+1 (450) 991-8822',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Longueuil & Rive-Sud, QC',
    type: 'local',
    wholesaleCost: 0.85,
    resalePrice: 4.99,
    monthlyProfit: 4.14,
    status: 'available',
    features: ['VoIP HD', 'SMS Direct', 'SIP TLS']
  },
  {
    id: 'did-qc-418-02',
    number: '+1 (418) 478-9900',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Ville de Québec (Sainte-Foy), QC',
    type: 'local',
    wholesaleCost: 0.85,
    resalePrice: 4.99,
    monthlyProfit: 4.14,
    status: 'available',
    features: ['VoIP HD', 'Renvoi d Appel Intelligent', 'Anti-Spam IA']
  },
  {
    id: 'did-qc-581-01',
    number: '+1 (581) 880-4500',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Saguenay & Est du Québec, QC',
    type: 'local',
    wholesaleCost: 0.85,
    resalePrice: 4.99,
    monthlyProfit: 4.14,
    status: 'available',
    features: ['VoIP HD', 'SMS', 'Opus 48kHz']
  },
  {
    id: 'did-qc-819-01',
    number: '+1 (819) 303-4411',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Gatineau & Outaouais, QC',
    type: 'local',
    wholesaleCost: 0.85,
    resalePrice: 4.99,
    monthlyProfit: 4.14,
    status: 'available',
    features: ['VoIP HD', 'SMS', 'Messagerie Web & Mobile']
  },
  {
    id: 'did-ca-888-01',
    number: '+1 (888) 790-7692',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Numéro Sans Frais National (1-888)',
    type: 'tollfree',
    wholesaleCost: 1.50,
    resalePrice: 9.99,
    monthlyProfit: 8.49,
    status: 'available',
    features: ['Sans frais Canada & USA', 'Menu Vocal RVI / IVR', 'Routage par heure']
  },
  {
    id: 'did-us-212-01',
    number: '+1 (212) 500-1928',
    country: 'États-Unis',
    flag: '🇺🇸',
    region: 'New York (Manhattan), NY',
    type: 'local',
    wholesaleCost: 1.00,
    resalePrice: 6.99,
    monthlyProfit: 5.99,
    status: 'available',
    features: ['VoIP HD USA', 'SMS Américain', 'SIP Trunking Direct']
  },
  {
    id: 'did-fr-01-01',
    number: '+33 (1) 79 36 00 24',
    country: 'France',
    flag: '🇫🇷',
    region: 'Paris, Île-de-France',
    type: 'local',
    wholesaleCost: 1.20,
    resalePrice: 7.99,
    monthlyProfit: 6.79,
    status: 'available',
    features: ['VoIP Européenne Conforme RGPD', 'SMS France', 'Codec Opus HD']
  }
];

export const REDISTRIBUTED_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-solo',
    name: 'Forfait Solo Essentiel',
    monthlyPrice: 4.99,
    description: 'Idéal pour travailleurs autonomes & usage personnel',
    includedMinutes: 500,
    includedSms: 'illimité',
    features: [
      '1 Numéro VoIP local québécois au choix',
      '500 minutes d appels sortants (Canada/USA)',
      'SMS entrants & sortants illimités',
      'Messagerie vocale vers courriel'
    ]
  },
  {
    id: 'plan-pro',
    name: 'Forfait Pro Affaires',
    monthlyPrice: 9.99,
    isPopular: true,
    description: 'Solution complète pour professionnels & entreprises',
    includedMinutes: 'illimité',
    includedSms: 'illimité',
    features: [
      '1 Numéro VoIP local + Choix d indicatif (514/418/450)',
      'Appels illimités Canada & USA',
      'SMS/MMS illimités',
      'Enregistrement légal des appels & transcription IA',
      'Routage multi-appareils (Android, PC, Web)'
    ]
  },
  {
    id: 'plan-enterprise',
    name: 'Forfait Entreprise & Sans Frais',
    monthlyPrice: 19.99,
    description: 'Centrale téléphonique virtuelle complète',
    includedMinutes: 'illimité',
    includedSms: 'illimité',
    features: [
      '2 Numéros inclus (1 Local Québec + 1 Sans Frais 1-888)',
      'Appels & SMS illimités Amérique du Nord',
      'Menu vocal interactif (RVI / Taper 1, Taper 2)',
      'Support prioritaire 24/7 souverain québécois'
    ]
  }
];

export function calculateProfitMetrics(inventory: DidStockItem[]): ProfitMetrics {
  const activeAssigned = inventory.filter((d) => d.status === 'assigned');
  const available = inventory.filter((d) => d.status === 'available');

  const totalRevenue = activeAssigned.reduce((acc, d) => acc + d.resalePrice, 0);
  const totalCost = activeAssigned.reduce((acc, d) => acc + d.wholesaleCost, 0);
  const netProfit = totalRevenue - totalCost;
  const marginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenueMonthly: totalRevenue,
    totalWholesaleCostMonthly: totalCost,
    netProfitMonthly: netProfit,
    profitMarginPercent: marginPercent,
    totalDids: inventory.length,
    activeAssignedDids: activeAssigned.length,
    availableDids: available.length
  };
}