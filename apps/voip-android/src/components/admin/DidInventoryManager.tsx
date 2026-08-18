import React, { useState } from 'react';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  PlusCircle, 
  Package, 
  ShieldCheck, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Layers,
  Sparkles,
  Users,
  Percent
} from 'lucide-react';
import { DidStockItem, SubscriptionPlan, ProfitMetrics } from '../../types/voip';
import { calculateProfitMetrics, REDISTRIBUTED_PLANS } from '../../data/privateDidBank';

interface DidInventoryManagerProps {
  inventory: DidStockItem[];
  onAddDid: (item: DidStockItem) => void;
  onUpdateDidPrice: (id: string, newPrice: number) => void;
  onClose: () => void;
}

export const DidInventoryManager: React.FC<DidInventoryManagerProps> = ({
  inventory,
  onAddDid,
  onUpdateDidPrice,
  onClose
}) => {
  const metrics: ProfitMetrics = calculateProfitMetrics(inventory);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [newRegion, setNewRegion] = useState('Montréal (514), QC');
  const [newCountry, setNewCountry] = useState('Canada');
  const [newFlag, setNewFlag] = useState('🇨🇦');
  const [newWholesaleCost, setNewWholesaleCost] = useState('0.85');
  const [newResalePrice, setNewResalePrice] = useState('4.99');

  const handleCreateDid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumber.trim()) return;

    const wholesale = parseFloat(newWholesaleCost) || 0.85;
    const resale = parseFloat(newResalePrice) || 4.99;
    const profit = resale - wholesale;

    const item: DidStockItem = {
      id: `did-custom-${Date.now()}`,
      number: newNumber.trim(),
      country: newCountry,
      flag: newFlag,
      region: newRegion,
      type: newNumber.includes('888') || newNumber.includes('800') ? 'tollfree' : 'local',
      wholesaleCost: wholesale,
      resalePrice: resale,
      monthlyProfit: profit,
      status: 'available',
      features: ['VoIP HD Opus', 'SMS Entrant/Sortant', 'SIP TLS', 'Redistribué par PowAI']
    };

    onAddDid(item);
    setNewNumber('');
    setShowAddForm(false);
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-2 select-none overflow-y-auto pb-6">
      
      {/* En-tête Console Propriétaire */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 font-bold border border-amber-800 uppercase">
              Mode Propriétaire / Admin
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Banque de Numéros & Profits</h2>
          <p className="text-xs text-slate-400">Gestion de vos stocks de DIDs et abonnements</p>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
        >
          Fermer
        </button>
      </div>

      {/* Cartes Métriques Financières Récurrentes (MRR & Profit Net) */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase font-bold">Revenu Récurrent (MRR)</span>
            <DollarSign size={15} className="text-cyan-400" />
          </div>
          <p className="text-2xl font-mono font-black text-white mt-1">
            {metrics.totalRevenueMonthly.toFixed(2)} $
          </p>
          <span className="text-[10px] text-slate-400">
            {metrics.activeAssignedDids} abonnements actifs
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/60 border border-emerald-900/40">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase font-bold">Profit Net Mensuel</span>
            <TrendingUp size={15} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-mono font-black text-emerald-400 mt-1">
            +{metrics.netProfitMonthly.toFixed(2)} $
          </p>
          <span className="text-[10px] text-emerald-300 font-bold">
            Marge brute : {metrics.profitMarginPercent.toFixed(1)} %
          </span>
        </div>

      </div>

      {/* État des Stocks DIDs */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 mb-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-cyan-400" />
          <div>
            <p className="font-bold text-white">Stock Total : {metrics.totalDids} Numéros</p>
            <p className="text-[10px] text-slate-400">
              {metrics.availableDids} disponibles à la vente • {metrics.activeAssignedDids} loués
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow transition-all active:scale-95"
        >
          <PlusCircle size={14} />
          <span>Ajouter un DID</span>
        </button>
      </div>

      {/* Formulaire d'Ajout de Numéro dans notre Stock */}
      {showAddForm && (
        <form onSubmit={handleCreateDid} className="p-4 rounded-2xl bg-[#0e1628] border border-cyan-700/50 mb-4 space-y-3 animate-fadeIn">
          <h4 className="font-bold text-xs text-cyan-300 uppercase tracking-wider">
            ➕ Ajouter un numéro à la banque de revente :
          </h4>

          <div>
            <label className="text-[10px] text-slate-400 block mb-0.5">Numéro VoIP (ex: +1 514 888-9900) :</label>
            <input
              type="text"
              required
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              placeholder="+1 (514) 888-9900"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Région / Ville :</label>
              <input
                type="text"
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
                placeholder="Montréal, QC"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Drapeau / Pays :</label>
              <input
                type="text"
                value={newFlag}
                onChange={(e) => setNewFlag(e.target.value)}
                placeholder="🇨🇦"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Coût d'Achat Grossiste ($) :</label>
              <input
                type="number"
                step="0.01"
                value={newWholesaleCost}
                onChange={(e) => setNewWholesaleCost(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-emerald-400 font-bold block mb-0.5">Prix Revente Client ($) :</label>
              <input
                type="number"
                step="0.01"
                value={newResalePrice}
                onChange={(e) => setNewResalePrice(e.target.value)}
                className="w-full bg-slate-950 border border-emerald-700 rounded-xl px-3 py-1.5 text-xs text-emerald-300 focus:outline-none focus:border-emerald-500 font-mono font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-emerald-400 font-mono font-bold">
              Profit Net : +{(parseFloat(newResalePrice || '0') - parseFloat(newWholesaleCost || '0')).toFixed(2)} $ / mois
            </span>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow transition-all"
            >
              Enregistrer dans la Banque
            </button>
          </div>
        </form>
      )}

      {/* Liste des DIDs dans la Banque Propriétaire */}
      <h3 className="font-bold text-sm text-white mb-2 flex items-center gap-1.5">
        <span>Inventaire des Numéros en Stock</span>
        <span className="text-xs text-slate-400 font-normal">({inventory.length})</span>
      </h3>

      <div className="space-y-2">
        {inventory.map((item) => {
          const isAssigned = item.status === 'assigned';
          return (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border transition-all text-xs ${
                isAssigned
                  ? 'bg-[#0b1324] border-cyan-800/40'
                  : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.flag}</span>
                  <div>
                    <p className="font-mono font-bold text-sm text-white">{item.number}</p>
                    <p className="text-[10px] text-slate-400">{item.region}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      isAssigned
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    }`}
                  >
                    {isAssigned ? 'Attribué / En Ligne' : 'Disponible en Vente'}
                  </span>
                  <div className="text-emerald-400 font-mono font-bold mt-0.5">
                    +{item.monthlyProfit.toFixed(2)} $ <span className="text-[9px] text-slate-400">profit/m</span>
                  </div>
                </div>
              </div>

              {isAssigned && item.assignedTo && (
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Client : <strong className="text-slate-200">{item.assignedTo}</strong></span>
                  <span className="font-mono text-cyan-400">{item.resalePrice.toFixed(2)} $ / mois</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};