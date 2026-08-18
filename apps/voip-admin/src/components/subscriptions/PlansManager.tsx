import React, { useState } from 'react';
import { Layers, PlusCircle, CheckCircle2, DollarSign, TrendingUp, Sparkles } from 'lucide-react';

interface PlanDef {
  id: string;
  name: string;
  resalePrice: number;
  estimatedCost: number;
  minutes: string;
  sms: string;
  features: string[];
  activeSubscribers: number;
}

export const PlansManager: React.FC = () => {
  const [plans, setPlans] = useState<PlanDef[]>([
    {
      id: 'p1',
      name: 'Forfait Solo Essentiel',
      resalePrice: 4.99,
      estimatedCost: 0.85,
      minutes: '500 min sortantes',
      sms: 'SMS Illimités',
      features: ['1 Numéro VoIP local québécois', 'Opus HD Codec', 'Messagerie vocale IA vers courriel'],
      activeSubscribers: 1
    },
    {
      id: 'p2',
      name: 'Forfait Pro Affaires',
      resalePrice: 9.99,
      estimatedCost: 1.25,
      minutes: 'Illimité Canada/USA',
      sms: 'SMS/MMS Illimités',
      features: ['1 Numéro local au choix (514/418/450)', 'Enregistrement légal des appels', 'Transcription IA temps réel', 'Routage multi-terminaux'],
      activeSubscribers: 2
    },
    {
      id: 'p3',
      name: 'Forfait Entreprise & Sans Frais',
      resalePrice: 19.99,
      estimatedCost: 2.50,
      minutes: 'Illimité Amérique du Nord',
      sms: 'SMS/MMS Illimités',
      features: ['2 Numéros (1 Local + 1 Sans Frais 1-888)', 'Menu vocal interactif RVI', 'Multi-postes SIP', 'Support prioritaire souverain'],
      activeSubscribers: 0
    }
  ]);

  return (
    <div className="space-y-6">
      
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers size={18} className="text-cyan-400" />
          <span>Grille Tarifaire & Abonnements Redistribués</span>
        </h3>
        <p className="text-xs text-slate-400">
          Définissez les forfaits mensuels vendus aux utilisateurs de l'écosystème PowAI TEL
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const profit = plan.resalePrice - plan.estimatedCost;
          const margin = (profit / plan.resalePrice) * 100;

          return (
            <div
              key={plan.id}
              className="p-6 rounded-3xl bg-[#0d1527] border border-slate-800 hover:border-cyan-500/50 flex flex-col justify-between space-y-4 shadow-xl transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-white">{plan.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                    {plan.activeSubscribers} abonnés
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-mono font-black text-emerald-400">
                    {plan.resalePrice.toFixed(2)} $
                  </span>
                  <span className="text-xs text-slate-400">/ mois</span>
                </div>

                <div className="mt-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] flex items-center justify-between">
                  <span className="text-slate-400">Coût VoIP.ms : {plan.estimatedCost.toFixed(2)} $</span>
                  <span className="font-mono font-bold text-emerald-400">
                    Marge : +{profit.toFixed(2)} $ ({margin.toFixed(0)}%)
                  </span>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-cyan-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all">
                Modifier les Marges
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};