import React from 'react';
import { DollarSign, TrendingUp, PhoneForwarded, Layers, Users, Zap, ShieldCheck } from 'lucide-react';
import { AdminMetrics } from '../../types/voipms';

interface MetricsCardsProps {
  metrics: AdminMetrics;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* MRR Facturé aux Clients */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1427] to-[#121f3d] border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-mono font-bold uppercase">Revenu Mensuel Client (MRR)</span>
          <div className="p-2 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
            <DollarSign size={16} />
          </div>
        </div>
        <p className="text-3xl font-mono font-black text-white mt-2">
          {metrics.totalClientRevenue.toFixed(2)} $ <span className="text-xs text-slate-400 font-sans font-normal">/ mois</span>
        </p>
        <span className="text-xs text-slate-400 mt-1 block">
          Facturé sur {metrics.assignedDids} abonnements actifs
        </span>
      </div>

      {/* Facture Grossiste VoIP.ms */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1427] to-[#181829] border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-mono font-bold uppercase">Coût Grossiste VoIP.ms</span>
          <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
            <Layers size={16} />
          </div>
        </div>
        <p className="text-3xl font-mono font-black text-slate-300 mt-2">
          {metrics.totalVoipmsCost.toFixed(2)} $ <span className="text-xs text-slate-400 font-sans font-normal">/ mois</span>
        </p>
        <span className="text-xs text-slate-400 mt-1 block">
          Coût de base moyen: 0.85 $ / DID
        </span>
      </div>

      {/* Profit Net Mensuel Encaissé */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1427] to-[#0d2a23] border border-emerald-900/40 shadow-lg glow-emerald">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-mono font-bold uppercase text-emerald-400">Profit Net Mensuel</span>
          <div className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
            <TrendingUp size={16} />
          </div>
        </div>
        <p className="text-3xl font-mono font-black text-emerald-400 mt-2">
          +{metrics.netProfit.toFixed(2)} $ <span className="text-xs text-emerald-300/80 font-sans font-normal">/ mois</span>
        </p>
        <span className="text-xs text-emerald-300 font-bold mt-1 block">
          Marge bénéficiaire nette : {metrics.marginPercent.toFixed(1)} %
        </span>
      </div>

      {/* Flotte de Numéros & Utilisation */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1427] to-[#141d33] border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-mono font-bold uppercase">Inventaire DIDs</span>
          <div className="p-2 rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-800/40">
            <PhoneForwarded size={16} />
          </div>
        </div>
        <p className="text-3xl font-mono font-black text-white mt-2">
          {metrics.totalDids} <span className="text-xs text-slate-400 font-sans font-normal">DIDs en flotte</span>
        </p>
        <span className="text-xs text-cyan-400 mt-1 block">
          {metrics.availableDids} disponibles • {metrics.assignedDids} assignés
        </span>
      </div>

    </div>
  );
};