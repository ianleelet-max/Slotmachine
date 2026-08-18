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
  ArrowRight,
  SlidersHorizontal,
  Building2,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { DidStockItem, SubscriptionPlan } from '../../types/voip';
import { REDISTRIBUTED_PLANS } from '../../data/privateDidBank';

interface NumberStoreProps {
  availableNumbers: DidStockItem[];
  onPurchaseNumber: (numberItem: DidStockItem, plan?: SubscriptionPlan) => void;
  balance: number;
  onTopUp: (amount: number) => void;
  onOpenAdmin: () => void;
}

export const NumberStore: React.FC<NumberStoreProps> = ({
  availableNumbers,
  onPurchaseNumber,
  balance,
  onTopUp,
  onOpenAdmin
}) => {
  const [selectedCountry, setSelectedCountry] = useState<'all' | 'qc' | 'ca' | 'us' | 'fr'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [isPurchasingId, setIsPurchasingId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-pro');
  const [showPlans, setShowPlans] = useState(false);

  const countryTabs = [
    { id: 'all' as const, label: 'Tous les DIDs' },
    { id: 'qc' as const, label: '⚜️ Québec' },
    { id: 'ca' as const, label: '🇨🇦 Canada' },
    { id: 'us' as const, label: '🇺🇸 USA' },
    { id: 'fr' as const, label: '🇫🇷 France' },
  ];

  const filtered = availableNumbers.filter((item) => {
    if (item.status !== 'available') return false;
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

  const selectedPlan = REDISTRIBUTED_PLANS.find((p) => p.id === selectedPlanId) || REDISTRIBUTED_PLANS[1];

  const handleBuy = (item: DidStockItem) => {
    setIsPurchasingId(item.id);
    setTimeout(() => {
      onPurchaseNumber(item, selectedPlan);
      setIsPurchasingId(null);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-2 select-none overflow-y-auto pb-6">
      
      {/* Solde & Portefeuille VoIP */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-cyan-950/40 border border-slate-800 mb-3 shadow-lg">
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
      </div>

      {/* Bannière Banque Propriétaire PowAI & Accès Admin */}
      <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-700/40 mb-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-cyan-400 flex-shrink-0" />
          <div>
            <p className="font-bold text-white text-[11px]">Banque de Numéros Privée PowAI</p>
            <p className="text-[10px] text-slate-400">Revente directe sans intermédiaire</p>
          </div>
        </div>
        <button
          onClick={onOpenAdmin}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-cyan-300 text-[10px] font-bold transition-all"
        >
          ⚙️ Gérer ma Banque
        </button>
      </div>

      {/* Sélecteur de Forfait d'Abonnement Redistribué */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-white flex items-center gap-1">
            <Zap size={14} className="text-amber-400" />
            <span>Forfait d'Abonnement Inclus :</span>
          </span>
          <button
            onClick={() => setShowPlans(!showPlans)}
            className="text-[11px] text-cyan-400 hover:underline"
          >
            {showPlans ? 'Masquer' : 'Changer de forfait'}
          </button>
        </div>

        {/* Forfait sélectionné actuel */}
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white">{selectedPlan.name}</span>
              {selectedPlan.isPopular && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-bold">
                  Populaire
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">{selectedPlan.description}</p>
          </div>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            {selectedPlan.monthlyPrice.toFixed(2)} $/m
          </span>
        </div>

        {/* Liste déroulante des forfaits */}
        {showPlans && (
          <div className="mt-2 space-y-1.5 animate-fadeIn">
            {REDISTRIBUTED_PLANS.map((plan) => (
              <button
                key={plan.id}
                onClick={() => {
                  setSelectedPlanId(plan.id);
                  setShowPlans(false);
                }}
                className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center justify-between border ${
                  plan.id === selectedPlanId
                    ? 'bg-cyan-950 border-cyan-600 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div>
                  <p className="font-bold">{plan.name}</p>
                  <p className="text-[10px] text-slate-400">{plan.features[0]}</p>
                </div>
                <span className="font-mono font-bold text-emerald-400">
                  {plan.monthlyPrice.toFixed(2)} $/mois
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filtres par Région */}
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
          placeholder="Rechercher indicatif (514, 418, 450, 212...)"
          className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {/* Liste des Numéros Disponibles dans notre Banque */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400">Tous les numéros de cette catégorie sont attribués.</p>
            <button
              onClick={onOpenAdmin}
              className="mt-2 text-xs text-cyan-400 font-bold hover:underline"
            >
              + Ajouter de nouveaux numéros au stock
            </button>
          </div>
        ) : (
          filtered.map((item) => (
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
                    <p className="text-xs text-slate-400">{item.region}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-mono font-black text-emerald-400">
                    {item.resalePrice.toFixed(2)} $
                  </span>
                  <span className="text-[10px] text-slate-400 block">/ mois</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.features.slice(0, 2).map((feat, idx) => (
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
                      <span>Attribution...</span>
                    </>
                  ) : (
                    <>
                      <span>Acheter & Activer</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};