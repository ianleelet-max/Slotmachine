import React from 'react';
import { Phone, MessageSquare, ShoppingBag, Clock } from 'lucide-react';

export type TabType = 'dialer' | 'history' | 'messages' | 'store';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  unreadCount = 0
}) => {
  const tabs = [
    { id: 'dialer' as TabType, label: 'Clavier', icon: Phone },
    { id: 'history' as TabType, label: 'Récents', icon: Clock },
    { id: 'messages' as TabType, label: 'Messages', icon: MessageSquare, badge: unreadCount },
    { id: 'store' as TabType, label: 'Numéros VoIP', icon: ShoppingBag },
  ];

  return (
    <nav className="w-full bg-[#0a0f1d] border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around select-none z-30 pb-safe">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3.5 rounded-2xl transition-all android-ripple ${
              isActive
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {/* Pilule Material You pour l'onglet actif */}
            <div
              className={`p-1 px-4 rounded-full flex items-center justify-center transition-all ${
                isActive ? 'bg-cyan-950/90 border border-cyan-700/50 shadow-sm shadow-cyan-500/20 text-cyan-300' : 'bg-transparent text-slate-400'
              }`}
            >
              <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
            </div>

            <span className="text-[11px] mt-0.5 tracking-tight">
              {tab.label}
            </span>

            {/* Badge de notifications non lues */}
            {tab.badge && tab.badge > 0 ? (
              <span className="absolute top-0 right-3 bg-rose-500 text-white font-bold text-[9px] min-w-[16px] h-4 rounded-full px-1 flex items-center justify-center shadow">
                {tab.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
};