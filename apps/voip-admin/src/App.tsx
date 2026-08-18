import React, { useState } from 'react';
import { AdminNavbar } from './components/layout/AdminNavbar';
import { AdminSidebar, AdminTab } from './components/layout/AdminSidebar';
import { MetricsCards } from './components/dashboard/MetricsCards';
import { DidInventoryTable } from './components/dids/DidInventoryTable';
import { OrderDidModal } from './components/dids/OrderDidModal';
import { SubAccountsList } from './components/subaccounts/SubAccountsList';
import { PlansManager } from './components/subscriptions/PlansManager';
import { VoipmsApiConfig } from './components/settings/VoipmsApiConfig';
import { VoipmsDid, VoipmsCredentials, AdminMetrics } from './types/voipms';
import { INITIAL_DIDS, voipmsClient } from './api/voipmsClient';

export function App() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [dids, setDids] = useState<VoipmsDid[]>(INITIAL_DIDS);
  const [credentials, setCredentials] = useState<VoipmsCredentials>(voipmsClient.loadCredentials());
  const [showOrderModal, setShowOrderModal] = useState(false);

  const metrics: AdminMetrics = voipmsClient.calculateMetrics(dids);

  const handleOrderSuccess = (newDid: VoipmsDid) => {
    setDids([newDid, ...dids]);
  };

  const handleUpdateResalePrice = (didNumber: string, newPrice: number) => {
    setDids((prev) =>
      prev.map((d) =>
        d.did === didNumber
          ? { ...d, resalePrice: newPrice, monthlyProfit: newPrice - d.monthlyFee }
          : d
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans select-none">
      
      {/* Barre de navigation supérieure */}
      <AdminNavbar
        credentials={credentials}
        metrics={metrics}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Corps Principal */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Menu latéral */}
        <AdminSidebar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          didCount={dids.length}
          subAccountCount={2}
        />

        {/* Zone de Contenu */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <MetricsCards metrics={metrics} />
              <DidInventoryTable
                dids={dids}
                onOpenOrderModal={() => setShowOrderModal(true)}
                onUpdateResalePrice={handleUpdateResalePrice}
              />
            </div>
          )}

          {activeTab === 'dids' && (
            <div className="space-y-6">
              <DidInventoryTable
                dids={dids}
                onOpenOrderModal={() => setShowOrderModal(true)}
                onUpdateResalePrice={handleUpdateResalePrice}
              />
            </div>
          )}

          {activeTab === 'subaccounts' && (
            <SubAccountsList />
          )}

          {activeTab === 'plans' && (
            <PlansManager />
          )}

          {activeTab === 'settings' && (
            <VoipmsApiConfig
              credentials={credentials}
              onSaveCredentials={setCredentials}
            />
          )}

        </main>

      </div>

      {/* Modal de Commande de DIDs VoIP.ms */}
      {showOrderModal && (
        <OrderDidModal
          onClose={() => setShowOrderModal(false)}
          onOrderSuccess={handleOrderSuccess}
        />
      )}

    </div>
  );
}

export default App;