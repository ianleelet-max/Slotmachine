import React, { useState } from 'react';
import { X, Search, ShoppingCart, ShieldCheck, CheckCircle2, Globe, Sparkles } from 'lucide-react';
import { VoipmsDid } from '../../types/voipms';
import { POP_SERVERS } from '../../api/voipmsClient';

interface OrderDidModalProps {
  onClose: () => void;
  onOrderSuccess: (newDid: VoipmsDid) => void;
}

export const OrderDidModal: React.FC<OrderDidModalProps> = ({
  onClose,
  onOrderSuccess
}) => {
  const [selectedArea, setSelectedArea] = useState('514');
  const [selectedPop, setSelectedPop] = useState('montreal1.voip.ms');
  const [isSearching, setIsSearching] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [selectedRetailPrice, setSelectedRetailPrice] = useState('4.99');

  const availableNumbersByArea: Record<string, string[]> = {
    '514': ['5143168899', '5148007600', '5149071234'],
    '418': ['4184789911', '4189073344', '4186542288'],
    '450': ['4506627799', '4509918800', '4503215544'],
    '819': ['8193034455', '8198207766'],
    '888': ['8887907600', '8885551234']
  };

  const handleOrder = (num: string) => {
    setIsOrdering(true);
    setTimeout(() => {
      const wholesale = num.startsWith('888') ? 1.50 : 0.85;
      const retail = parseFloat(selectedRetailPrice) || 4.99;
      const item: VoipmsDid = {
        did: num,
        description: `Nouvel arrivage VoIP.ms (${selectedArea})`,
        routing: 'sys:unassigned',
        pop: selectedPop,
        monthlyFee: wholesale,
        minuteRate: num.startsWith('888') ? 0.019 : 0.009,
        setupFee: 0.50,
        resalePrice: retail,
        monthlyProfit: retail - wholesale,
        planName: 'Forfait Solo Essentiel',
        status: 'active',
        smsEnabled: true,
        mmsEnabled: true,
        callRecording: false
      };

      onOrderSuccess(item);
      setIsOrdering(false);
      onClose();
    }, 1200);
  };

  const numbers = availableNumbersByArea[selectedArea] || availableNumbersByArea['514'];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0c1427] border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fadeIn">
        
        {/* En-tête du Modal */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                <ShoppingCart size={18} />
              </span>
              <div>
                <h3 className="font-bold text-lg text-white">Commander un DID (API VoIP.ms)</h3>
                <p className="text-xs text-slate-400">Achat direct depuis les inventaires télécom</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Sélection Indicatif Régional & POP */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1">
              Indicatif Téléphonique :
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="514">🇨🇦 Montréal (514)</option>
              <option value="418">🇨🇦 Québec / Lévis (418)</option>
              <option value="450">🇨🇦 Laval & Rive-Sud (450)</option>
              <option value="819">🇨🇦 Gatineau & Sherbrooke (819)</option>
              <option value="888">🇨🇦 Sans Frais 1-888</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-bold block mb-1">
              Serveur POP Routage :
            </label>
            <select
              value={selectedPop}
              onChange={(e) => setSelectedPop(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {POP_SERVERS.map((pop) => (
                <option key={pop.id} value={pop.hostname}>
                  {pop.serverName} ({pop.pingMs}ms)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Réglage du Prix de Revente & Marge */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Prix de revente client :</span>
            <span className="font-bold text-white text-sm">{selectedRetailPrice} $ / mois</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[11px]">Coût VoIP.ms : 0.85 $</span>
            <span className="text-emerald-400 font-mono font-bold">
              Profit Net : +{(parseFloat(selectedRetailPrice) - 0.85).toFixed(2)} $ / m
            </span>
          </div>
        </div>

        {/* Liste des Numéros Disponibles à l'Achat */}
        <div className="space-y-2">
          <label className="text-xs text-slate-300 font-bold block">
            Numéros DIDs disponibles en temps réel :
          </label>

          {numbers.map((num) => (
            <div
              key={num}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between hover:border-cyan-500/50 transition-all"
            >
              <div>
                <span className="font-mono font-bold text-sm text-white">
                  +{num.slice(0, 1)} ({num.slice(1, 4)}) {num.slice(4, 7)}-{num.slice(7)}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Activation instantanée • SMS & Voice Ready
                </span>
              </div>

              <button
                onClick={() => handleOrder(num)}
                disabled={isOrdering}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                {isOrdering ? 'Activation...' : 'Commander & Stocker'}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};