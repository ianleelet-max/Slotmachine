import React, { useState } from 'react';
import { AndroidStatusBar } from './components/layout/AndroidStatusBar';
import { BottomNav, TabType } from './components/layout/BottomNav';
import { Keypad } from './components/dialer/Keypad';
import { ActiveCallModal } from './components/dialer/ActiveCallModal';
import { CallHistory } from './components/dialer/CallHistory';
import { ConversationList } from './components/messaging/ConversationList';
import { ChatThread } from './components/messaging/ChatThread';
import { NumberStore } from './components/store/NumberStore';
import { DidInventoryManager } from './components/admin/DidInventoryManager';
import { ApkDownloadBanner } from './components/apk/ApkDownloadBanner';
import { VoipNumber, CallRecord, Conversation, DidStockItem, SubscriptionPlan } from './types/voip';
import { PROPRIETARY_DID_INVENTORY } from './data/privateDidBank';

const INITIAL_PURCHASED_LINES: VoipNumber[] = [
  {
    id: 'did-qc-514-01',
    number: '+1 (514) 800-7691',
    country: 'Canada',
    flag: '🇨🇦',
    region: 'Montréal (Centre-Ville), QC',
    type: 'local',
    monthlyPrice: 4.99,
    setupFee: 0,
    features: ['Appels HD', 'SMS/MMS', 'Messagerie Vocale AI', 'SIP TLS'],
    isPurchased: true,
    isDefault: true,
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
    monthlyPrice: 4.99,
    setupFee: 0,
    features: ['Appels HD', 'SMS/MMS', 'SIP TLS'],
    isPurchased: true,
    isDefault: false,
    sipUsername: 'powai_4189075520',
    sipServer: 'sip.powai.ca:5060'
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
  const [didInventory, setDidInventory] = useState<DidStockItem[]>(PROPRIETARY_DID_INVENTORY);
  const [purchasedLines, setPurchasedLines] = useState<VoipNumber[]>(INITIAL_PURCHASED_LINES);
  const [activeLine, setActiveLine] = useState<VoipNumber>(INITIAL_PURCHASED_LINES[0]);
  const [balance, setBalance] = useState<number>(35.00);
  const [calls, setCalls] = useState<CallRecord[]>(INITIAL_CALLS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // État de l'appel actif
  const [callingTarget, setCallingTarget] = useState<string | null>(null);

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const handleStartCall = (targetNum: string) => {
    setCallingTarget(targetNum);
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

  const handlePurchaseNumber = (didItem: DidStockItem, plan?: SubscriptionPlan) => {
    // 1. Marquer le DID comme 'assigned' dans notre banque propriétaire
    setDidInventory((prev) =>
      prev.map((d) =>
        d.id === didItem.id
          ? { ...d, status: 'assigned', assignedTo: 'Client PowAI TEL', assignedDate: new Date().toISOString().slice(0, 10), planId: plan?.id }
          : d
      )
    );

    // 2. Ajouter le numéro aux lignes utilisables par l'utilisateur
    const newLine: VoipNumber = {
      id: didItem.id,
      number: didItem.number,
      country: didItem.country,
      flag: didItem.flag,
      region: didItem.region,
      type: didItem.type,
      monthlyPrice: plan ? plan.monthlyPrice : didItem.resalePrice,
      setupFee: 0,
      features: didItem.features,
      isPurchased: true,
      isDefault: false,
      sipUsername: `powai_${didItem.number.replace(/\D/g, '')}`,
      sipServer: 'sip.powai.ca:5060'
    };

    setPurchasedLines([...purchasedLines, newLine]);
    setActiveLine(newLine);
    setBalance((prev) => Math.max(0, prev - newLine.monthlyPrice));
    setActiveTab('dialer');
  };

  const handleAddDidToBank = (newDid: DidStockItem) => {
    setDidInventory([newDid, ...didInventory]);
  };

  const handleUpdateDidPrice = (didId: string, newPrice: number) => {
    setDidInventory((prev) =>
      prev.map((d) =>
        d.id === didId
          ? { ...d, resalePrice: newPrice, monthlyProfit: newPrice - d.wholesaleCost }
          : d
      )
    );
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
      <div className="w-full max-w-md h-screen sm:h-[860px] bg-[#070a12] sm:rounded-[36px] border-0 sm:border-4 border-slate-800 flex flex-col justify-between overflow-hidden shadow-2xl relative">
        
        {/* Barre de Statut Android */}
        <AndroidStatusBar />

        {/* Bannière Téléchargement APK Direct */}
        <ApkDownloadBanner />

        {/* Contenu Principal selon l'onglet ou modal admin */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          
          {showAdminPanel ? (
            <DidInventoryManager
              inventory={didInventory}
              onAddDid={handleAddDidToBank}
              onUpdateDidPrice={handleUpdateDidPrice}
              onClose={() => setShowAdminPanel(false)}
            />
          ) : (
            <>
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
                  availableNumbers={didInventory}
                  onPurchaseNumber={handlePurchaseNumber}
                  balance={balance}
                  onTopUp={handleTopUp}
                  onOpenAdmin={() => setShowAdminPanel(true)}
                />
              )}
            </>
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

        {/* Navigation Inférieure Android (cachée si en plein fil de clavardage ou console admin) */}
        {!activeConvo && !showAdminPanel && (
          <BottomNav
            activeTab={activeTab}
            onChangeTab={(t) => {
              setActiveConversationId(null);
              setShowAdminPanel(false);
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