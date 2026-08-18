import React, { useState } from 'react';
import { Users, PlusCircle, ShieldCheck, Key, RefreshCw, Smartphone, Server } from 'lucide-react';
import { VoipmsSubAccount } from '../../types/voipms';
import { INITIAL_SUBACCOUNTS, POP_SERVERS } from '../../api/voipmsClient';

export const SubAccountsList: React.FC = () => {
  const [subAccounts, setSubAccounts] = useState<VoipmsSubAccount[]>(INITIAL_SUBACCOUNTS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState('214001_client3');
  const [newClient, setNewClient] = useState('');
  const [newCallerId, setNewCallerId] = useState('5143168800');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim()) return;

    const item: VoipmsSubAccount = {
      id: `sub-${Date.now()}`,
      username: newUsername,
      description: `Sous-compte pour ${newClient}`,
      pop: 'montreal1.voip.ms',
      protocol: 'SIP',
      authType: 'User/Password',
      assignedClient: newClient,
      callerIdNumber: newCallerId,
      callerIdName: newClient.slice(0, 15),
      status: 'active'
    };

    setSubAccounts([...subAccounts, item]);
    setNewClient('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-[#0d1527] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users size={18} className="text-cyan-400" />
            <span>Sous-Comptes SIP Clients (Auto-Provisioning)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Identifiants SIP générés automatiquement pour connecter l'application PowAI TEL
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
        >
          <PlusCircle size={15} />
          <span>Créer un Sous-Compte SIP</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="p-4 rounded-xl bg-slate-950 border border-cyan-800/60 space-y-3 animate-fadeIn">
          <h4 className="font-bold text-xs text-cyan-300 uppercase">Nouveau Sous-Compte VoIP.ms :</h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Identifiant SIP :</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Nom du Client :</label>
              <input
                type="text"
                required
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                placeholder="Ex: Étude Notariale Martin"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Caller ID par défaut :</label>
              <input
                type="text"
                value={newCallerId}
                onChange={(e) => setNewCallerId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              Valider la création sur VoIP.ms
            </button>
          </div>
        </form>
      )}

      {/* Tableau des Sous-Comptes */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Identifiant SIP</th>
              <th className="py-3 px-4">Client Attribué</th>
              <th className="py-3 px-4">Serveur POP</th>
              <th className="py-3 px-4">Caller ID Outbound</th>
              <th className="py-3 px-4">Protocole</th>
              <th className="py-3 px-4 text-center">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {subAccounts.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-900/40">
                <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                  {sub.username}
                </td>
                <td className="py-3.5 px-4 font-bold text-white">
                  {sub.assignedClient}
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                  {sub.pop}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-200">
                  {sub.callerIdNumber} ({sub.callerIdName})
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 font-mono">
                    {sub.protocol} TLS/SRTP
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold uppercase">
                    Connecté
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};