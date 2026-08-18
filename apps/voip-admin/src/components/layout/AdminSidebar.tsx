import React from 'react';
import { 
  LayoutDashboard, 
  PhoneCall, 
  Users, 
  Layers, 
  Key, 
  ExternalLink,
  Shield,
  Smartphone
} from 'lucide-react';

export type AdminTab = 'dashboard' | 'dids' | 'subaccounts' | 'plans' | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onChangeTab: (tab: AdminTab) => void;
  didCount: number;
  subAccountCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onChangeTab,
  didCount,
  subAccountCount
}) => {
  const menuItems = [
    { id: 'dashboard' as AdminTab, label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'dids' as AdminTab, label: 'Flotte DIDs & Achat', icon: PhoneCall, badge: didCount },
    { id: 'subaccounts' as AdminTab, label: 'Sous-Comptes Clients', icon: Users, badge: subAccountCount },
    { id: 'plans' as AdminTab, label: 'Forfaits & Abonnements', icon: Layers },
    { id: 'settings' as AdminTab, label: 'Configuration API', icon: Key },
  ];

  return (
    <aside className="w-64 bg-[#0a101f] border-r border-slate-800/80 p-4 flex flex-col justify-between select-none">
      
      <div className="space-y-1">
        <p className="text-[10px] font-mono font-bold text-slate-500 uppercase px-3 mb-2">
          Gestion Opérateur
        </p>

        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/60 text-cyan-300 border border-cyan-800/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300 font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Raccourcis & Liens Externes */}
      <div className="space-y-2 pt-4 border-t border-slate-800/80">
        <a
          href="https://powai.ca/tel"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-cyan-300 hover:border-cyan-700/50 transition-all"
        >
          <div className="flex items-center gap-2">
            <Smartphone size={14} className="text-cyan-400" />
            <span>App Client PowAI TEL</span>
          </div>
          <ExternalLink size={12} />
        </a>

        <a
          href="https://voip.ms"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition-all"
        >
          <span>Portail Portail VoIP.ms</span>
          <ExternalLink size={12} />
        </a>
      </div>

    </aside>
  );
};