import React, { useState } from 'react';
import { AndroidStatusBar } from './components/layout/AndroidStatusBar';
import { BottomNav, TabType } from './components/layout/BottomNav';
import { Keypad } from './components/dialer/Keypad';
import { ActiveCallModal } from './components/dialer/ActiveCallModal';
import { CallHistory } from './components/dialer/CallHistory';
import { ConversationList } from './components/messaging/ConversationList';
import { ChatThread } from './components/messaging/ChatThread';
import { NumberStore } from './components/store/NumberStore';
import { VoipNumber, CallRecord, Conversation } from './types/voip';
import { Phone, Shield, ExternalLink, Download } from 'lucide-react';

const INITIAL_PURCHASED_LINES: VoipNumber[] = [
  {
    id: 'line-qc-514',
    number: '+1 (514) 800-7691',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Montréal, QC',
    type: 'local',
    monthlyPrice: 2.50,
    setupFee: 0,
    features: ['Appels HD', 'SMS/MMS', 'Messagerie Vocale AI', 'SIP TLS'],
    isPurchased: true,
    isDefault: true,
    sipUsername: 'powai_5148007691',
    sipServer: 'sip.powai.ca:5060'
  },
  {
    id: 'line-qc-418',
    number: '+1 (418) 907-5520',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Québec, QC',
    type: 'local',
    monthlyPrice: 2.50,
    setupFee: 0,
    features: ['Appels HD', 'SMS/MMS', 'SIP TLS'],
    isPurchased: true,
    isDefault: false,
    sipUsername: 'powai_4189075520',
    sipServer: 'sip.powai.ca:5060'
  }
];

const INITIAL_CATALOG: VoipNumber[] = [
  {
    id: 'store-1',
    number: '+1 (514) 316-8800',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Montréal (Centre-Ville), QC',
    type: 'local',
    monthlyPrice: 2.50,
    setupFee: 0,
    features: ['VoIP HD Opus', 'SMS Ililimité', 'WebRTC Direct']
  },
  {
    id: 'store-2',
    number: '+1 (438) 792-1144',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Montréal & Laval, QC',
    type: 'local',
    monthlyPrice: 2.50,
    setupFee: 0,
    features: ['Appels & SMS', 'Transcription IA', 'Enregistrement Légal']
  },
  {
    id: 'store-3',
    number: '+1 (418) 478-9900',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Québec & Lévis, QC',
    type: 'local',
    monthlyPrice: 2.50,
    setupFee: 0,
    features: ['VoIP HD', 'Renvoi Cellulaire', 'SMS entrant gratuit']
  },
  {
    id: 'store-4',
    number: '+1 (450) 662-7733',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Laval & Rive-Nord, QC',
    type: 'local',
    monthlyPrice: 2.50,
    setupFee: 0,
    features: ['VoIP HD', 'SMS/MMS', 'Chiffrement SRTP']
  },
  {
    id: 'store-5',
    number: '+1 (819) 303-4411',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Gatineau & Outaouais, QC',
    type: 'local',
    monthlyPrice: 2.50,
    setupFee: 0,
    features: ['VoIP HD', 'SMS', 'Messagerie Web']
  },
  {
    id: 'store-6',
    number: '+1 (888) 790-7692',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Numéro Sans Frais (1-888)',
    type: 'tollfree',
    monthlyPrice: 4.99,
    setupFee: 0,
    features: ['Sans frais Canada/USA', 'Menu Vocal Interactif', 'Routage multi-postes']
  },
  {
    id: 'store-7',
    number: '+1 (212) 500-1928',
    country: 'États-Unis',
    flag: '🇺🇸',
    region: 'New York, NY',
    type: 'local',
    monthlyPrice: 2.99,
    setupFee: 0,
    features: ['VoIP HD', 'SMS USA', 'SIP Trunking']
  },
  {
    id: 'store-8',
    number: '+33 (1) 79 36 00 24',
    country: 'France',
    flag: '🇫🇷',
    region: 'Paris, Île-de-France',
    type: 'local',
    monthlyPrice: 3.50,
    setupFee: 0,
    features: ['VoIP HD Européenne', 'Conforme RGPD', 'Opus 48kHz']
  }
];

const INITIAL_CALLS: CallRecord[] = [
  {
    id: 'call-1',
    number: '+1 (514) 288-4444',
    contactName: 'Étude Notariale Tremblay',
    type: 'incoming',
    timestamp: 'Aujourd hui, 10:42',
    durationSeconds: 145,
    lineUsed: '+1 (514) 800-7691'
  },
  {
    id: 'call-2',
    number: '+1 (418) 643-2121',
    contactName: 'Bureau de la Publicité des Droits',
    type: 'outgoing',
    timestamp: 'Hier, 15:30',
    durationSeconds: 320,
    lineUsed: '+1 (418) 907-5520'
  },
  {
    id: 'call-3',
    number: '+1 (450) 999-1234',
    type: 'missed',
    timestamp: '16 août, 11:15',
    durationSeconds: 0,
    lineUsed: '+1 (514) 800-7691'
  }
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    peerNumber: '+1 (514) 288-4444',
    peerName: 'Me Sophie Tremblay, Notaire',
    avatarColor: '#06b6d4',
    unreadCount: 1,
    lastMessage: 'Parfait, le certificat de localisation est bien reçu sur BORNE.',
    lastTimestamp: '10:45',
    messages: [
      { id: 'm1', sender: 'them', text: 'Bonjour, avez-vous pu vérifier le cadastre 2 458 912 ?', timestamp: '10:30' },
      { id: 'm2', sender: 'me', text: 'Bonjour Me Tremblay, oui le rapport BORNE est validé à 100% conforme.', timestamp: '10:35' },
      { id: 'm3', sender: 'them', text: 'Parfait, le certificat de localisation est bien reçu sur BORNE.', timestamp: '10:45' }
    ]
  },
  {
    id: 'conv-2',
    peerNumber: '+1 (418) 555-0199',
    peerName: 'Support Technique PowAI',
    avatarColor: '#10b981',
    unreadCount: 0,
    lastMessage: 'Votre ligne VoIP 514 est active avec codec Opus HD.',
    lastTimestamp: 'Hier',
    messages: [
      { id: 'm4', sender: 'them', text: 'Bienvenue sur PowAI TEL ! Votre ligne VoIP 514 est active avec codec Opus HD.', timestamp: 'Hier 09:00' }
    ]
  }
];

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dialer');
  const [purchasedLines, setPurchasedLines] = useState<VoipNumber[]>(INITIAL_PURCHASED_LINES);
  const [activeLine, setActiveLine] = useState<VoipNumber>(INITIAL_PURCHASED_LINES[0]);
  const [catalog, setCatalog] = useState<VoipNumber[]>(INITIAL_CATALOG);
  const [balance, setBalance] = useState<number>(25.00);
  const [calls, setCalls] = useState<CallRecord[]>(INITIAL_CALLS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  // État de l'appel actif
  const [callingTarget, setCallingTarget] = useState<string | null>(null);

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const handleStartCall = (targetNum: string) => {
    setCallingTarget(targetNum);
    // Ajouter au journal des appels
    const newCall: CallRecord = {
      id: `call-${Date.now()}`,
      number: targetNum,
      type: 'outgoing',
      timestamp: 'À l instant',
      durationSeconds: 0,
      lineUsed: activeLine?.number || '514'
    };
    setCalls([newCall, ...calls]);
  };

  const handleEndCall = () => {
    setCallingTarget(null);
  };

  const handlePurchaseNumber = (item: VoipNumber) => {
    const purchasedItem: VoipNumber = {
      ...item,
      isPurchased: true,
      isDefault: false,
      sipUsername: `powai_${item.number.replace(/\D/g, '')}`,
      sipServer: 'sip.powai.ca:5060'
    };
    setPurchasedLines([...purchasedLines, purchasedItem]);
    setActiveLine(purchasedItem);
    setCatalog(catalog.filter((c) => c.id !== item.id));
    setBalance((prev) => Math.max(0, prev - item.monthlyPrice));
    setActiveTab('dialer');
  };

  const handleTopUp = (amount: number) => {
    setBalance((prev) => prev + amount);
  };

  const handleSendMessage = (convoId: string, text: string) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convoId) {
          return {
            ...c,
            lastMessage: text,
            lastTimestamp: now,
            messages: [
              ...c.messages,
              {
                id: `msg-${Date.now()}`,
                sender: 'me',
                text,
                timestamp: now,
                status: 'delivered'
              }
            ]
          };
        }
        return c;
      })
    );
  };

  const activeConvo = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="min-h-screen bg-[#04060b] flex items-center justify-center p-0 sm:p-4">
      
      {/* Cadre Téléphone Android / PWA Viewport */}
      <div className="w-full max-w-md h-screen sm:h-[844px] bg-[#070a12] sm:rounded-[36px] border-0 sm:border-4 border-slate-800 flex flex-col justify-between overflow-hidden shadow-2xl relative">
        
        {/* Barre de Statut Android */}
        <AndroidStatusBar />

        {/* Contenu Principal selon l'onglet */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          
          {activeTab === 'dialer' && (
            <Keypad
              onStartCall={handleStartCall}
              activeLine={activeLine}
              purchasedLines={purchasedLines}
              onSelectLine={(l) => setActiveLine(l)}
            />
          )}

          {activeTab === 'history' && (
            <CallHistory
              calls={calls}
              onCallNumber={handleStartCall}
              onClearHistory={() => setCalls([])}
            />
          )}

          {activeTab === 'messages' && (
            activeConvo ? (
              <ChatThread
                conversation={activeConvo}
                activeLine={activeLine}
                onBack={() => setActiveConversationId(null)}
                onSendMessage={handleSendMessage}
                onCallContact={handleStartCall}
              />
            ) : (
              <ConversationList
                conversations={conversations}
                onSelectConversation={(c) => {
                  setActiveConversationId(c.id);
                  // Marquer comme lu
                  setConversations(conversations.map((item) => item.id === c.id ? { ...item, unreadCount: 0 } : item));
                }}
                onNewMessage={() => {
                  const newNumber = prompt('Entrez le numéro du destinataire (ex: +1 514 555-0100) :');
                  if (newNumber) {
                    const newConvo: Conversation = {
                      id: `conv-${Date.now()}`,
                      peerNumber: newNumber,
                      avatarColor: '#a855f7',
                      unreadCount: 0,
                      lastMessage: 'Nouvelle conversation',
                      lastTimestamp: 'Maintenant',
                      messages: []
                    };
                    setConversations([newConvo, ...conversations]);
                    setActiveConversationId(newConvo.id);
                  }
                }}
              />
            )
          )}

          {activeTab === 'store' && (
            <NumberStore
              availableNumbers={catalog}
              onPurchaseNumber={handlePurchaseNumber}
              balance={balance}
              onTopUp={handleTopUp}
            />
          )}

        </main>

        {/* Modal d'appel actif */}
        {callingTarget && (
          <ActiveCallModal
            targetNumber={callingTarget}
            activeLine={activeLine}
            onEndCall={handleEndCall}
          />
        )}

        {/* Navigation Inférieure Android (cachée si en plein fil de clavardage) */}
        {!activeConvo && (
          <BottomNav
            activeTab={activeTab}
            onChangeTab={(t) => {
              setActiveConversationId(null);
              setActiveTab(t);
            }}
            unreadCount={totalUnread}
          />
        )}

      </div>
    </div>
  );
}

export default App;