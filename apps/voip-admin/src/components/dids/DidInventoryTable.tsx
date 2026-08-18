import React, { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  ShieldCheck, 
  Edit2, 
  ArrowUpRight,
  Sparkles,
  Phone
} from 'lucide-react';
import { VoipmsDid } from '../../types/voipms';

interface DidInventoryTableProps {
  dids: VoipmsDid[];
  onOpenOrderModal: () => void;
  onUpdateResalePrice: (did: string, newPrice: number) => void;
}

export const DidInventoryTable: React.FC<DidInventoryTableProps> = ({
  dids,
  onOpenOrderModal,
  onUpdateResalePrice
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'assigned' | 'available'>('all');

  const filtered = dids.filter((d) => {
    if (statusFilter === 'assigned' && !d.clientName) return false;
    if (statusFilter === 'available' && d.clientName) return false;

    if (search) {
      const q = search.toLowerCase();
      const match =
        d.did.includes(q) ||
        d.description.toLowerCase().includes(q) ||
        (d.clientName && d.clientName.toLowerCase().includes(q)) ||
        d.pop.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="bg-[#0d1527] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      
      {/* Barre d'Action & Recherche */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Phone size={18} className="text-cyan-400" />
            <span>Flotte de Numéros DIDs (VoIP.ms)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Gestion du routage SIP, des forfaits attribués et des marges de revente
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher DID, client, POP..."
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={onOpenOrderModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <PlusCircle size={15} />
            <span>Commander un DID VoIP.ms</span>
          </button>
        </div>
      </div>

      {/* Tableau des DIDs */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Numéro DID</th>
              <th className="py-3 px-4">Description / Région</th>
              <th className="py-3 px-4">Serveur POP</th>
              <th className="py-3 px-4">Client Attribué</th>
              <th className="py-3 px-4">Forfait Client</th>
              <th className="py-3 px-4 text-right">Coût VoIP.ms</th>
              <th className="py-3 px-4 text-right">Prix Facturé</th>
              <th className="py-3 px-4 text-right">Profit Net</th>
              <th className="py-3 px-4 text-center">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.map((item) => {
              const isAssigned = !!item.clientName;
              return (
                <tr key={item.did} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                    +{item.did.slice(0, 1)} ({item.did.slice(1, 4)}) {item.did.slice(4, 7)}-{item.did.slice(7)}
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    {item.description}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px] text-cyan-400">
                    {item.pop}
                  </td>

                  <td className="py-3.5 px-4">
                    {item.clientName ? (
                      <div>
                        <p className="font-bold text-slate-200">{item.clientName}</p>
                        <p className="text-[10px] text-slate-500">{item.clientEmail}</p>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Non assigné (En stock)</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                      {item.planName}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                    {item.monthlyFee.toFixed(2)} $
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                    {item.resalePrice.toFixed(2)} $
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400">
                    +{item.monthlyProfit.toFixed(2)} $
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                        isAssigned
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isAssigned ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
                      {isAssigned ? 'En Ligne' : 'Stock Prêt'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};