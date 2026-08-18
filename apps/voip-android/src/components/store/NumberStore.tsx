import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Globe, 
  PlusCircle, 
  CreditCard,
  Zap,
  ArrowRight
} from 'lucide-react';
import { VoipNumber } from '../../types/voip';

interface NumberStoreProps {
  availableNumbers: VoipNumber[];
  onPurchaseNumber: (numberItem: VoipNumber) => void;
  balance: number;
  onTopUp: (amount: number) => void;
}

export const NumberStore: React.FC<NumberStoreProps> = ({
  availableNumbers,
  onPurchaseNumber,
  balance,
  onTopUp
}) => {
  const [selectedCountry, setSelectedCountry] = useState<'all' | 'qc' | 'ca' | 'us' | 'fr'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [isPurchasingId, setIsPurchasingId] = useState<string | null>(null);

  const countryTabs = [
    { id: 'all' as const, label: 'Tous' },
    { id: 'qc' as const, label: '⚜️ Québec' },
    { id: 'ca' as const, label: '🇨🇦 Canada' },
    { id: 'us' as const, label: '🇺🇸 USA' },
    { id: 'fr' as const, label: '🇫🇷 France' },
  ];

  const filtered = availableNumbers.filter((item) => {
    if (item.isPurchased) return false;
    if (selectedCountry === 'qc' && !item.region.includes('QC') && !item.region.includes('Québec')) return false;
    if (selectedCountry === 'ca' && item.country !== 'Canada') return false;
    if (selectedCountry === 'us' && item.country !== 'États-Unis') return false;
    if (selectedCountry === 'fr' && item.country !== 'France') return false;

    if (searchFilter) {
      const match =
        item.number.includes(searchFilter) ||
        item.region.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.country.toLowerCase().includes(searchFilter.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const handleBuy = (item: VoipNumber) => {
    setIsPurchasingId(item.id);
    setTimeout(() => {
      onPurchaseNumber(item);
      setIsPurchasingId(null);
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-2 select-none">
      
      {/* Solde & Portefeuille VoIP */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-cyan-950/40 border border-slate-800 mb-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
              Solde de Communications :
            </span>
            <div className="text-2xl font-mono font-black text-emerald-400 mt-0.5">
              {balance.toFixed(2)} $ <span className="text-xs text-slate-400 font-sans font-normal">CAD</span>
            </div>
          </div>
          <button
            onClick={() => onTopUp(10)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <PlusCircle size={14} />
            <span>Recharger +10$</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
          <ShieldCheck size={13} className="text-cyan-400" />
          <span>Activation instantanée en 10 secondes avec routage SIP chiffré.</span>
        </p>
      </div>

      {/* Titre Boutique */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="text-cyan-400" size={20} />
            <span>Acheter un Numéro VoIP</span>
          </h2>
          <p className="text-xs text-slate-400">Lignes dédiées pour appels & SMS</p>
        </div>
      </div>

      {/* Filtres par Pays */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 mb-3">
        {countryTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedCountry(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCountry === t.id
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Recherche */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filtrer par indicatif (514, 418, 450, 212...)"
          className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {/* Liste des Numéros Disponibles */}
      <div className="space-y-2.5 overflow-y-auto flex-1 pb-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-cyan-500/50 flex flex-col justify-between gap-2.5 transition-all shadow-sm group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{item.flag}</span>
                <div>
                  <h4 className="text-base font-mono font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {item.number}
                  </h4>
                  <p className="text-xs text-slate-400">{item.region} • {item.country}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-mono font-black text-emerald-400">
                  {item.monthlyPrice.toFixed(2)} $
                </span>
                <span className="text-[10px] text-slate-400 block">/ mois</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 flex-wrap">
                {item.features.map((feat, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                  >
                    {feat}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleBuy(item)}
                disabled={isPurchasingId === item.id}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all"
              >
                {isPurchasingId === item.id ? (
                  <>
                    <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Activation...</span>
                  </>
                ) : (
                  <>
                    <span>Activer</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};