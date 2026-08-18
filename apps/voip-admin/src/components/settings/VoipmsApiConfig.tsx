import React, { useState } from 'react';
import { Key, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Lock, ExternalLink, HelpCircle } from 'lucide-react';
import { VoipmsCredentials } from '../../types/voipms';
import { voipmsClient } from '../../api/voipmsClient';

interface VoipmsApiConfigProps {
  credentials: VoipmsCredentials;
  onSaveCredentials: (creds: VoipmsCredentials) => void;
}

export const VoipmsApiConfig: React.FC<VoipmsApiConfigProps> = ({
  credentials,
  onSaveCredentials
}) => {
  const [username, setUsername] = useState(credentials.apiUsername || 'ian@powai.ca');
  const [password, setPassword] = useState(credentials.apiPassword || '••••••••••••••••');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; balance?: number } | null>(null);

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    const result = await voipmsClient.testConnection(username, password);
    setTestResult(result);
    setIsTesting(false);

    if (result.success) {
      onSaveCredentials({
        apiUsername: username,
        apiPassword: password,
        isConfigured: true,
        isLiveMode: true,
        lastTestStatus: 'success',
        lastTestMessage: result.message
      });
    }
  };

  return (
    <div className="max-w-2xl bg-[#0d1527] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
            <Key size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Identifiants de l'API VoIP.ms</h3>
            <p className="text-xs text-slate-400">Interconnexion sécurisée pour la commande et le routage des DIDs</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleTestAndSave} className="space-y-4">
        
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">
            VoIP.ms API Email (ou ID de compte) :
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="votre_courriel@domaine.ca"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">
            Mot de passe de l'API VoIP.ms (API Password) :
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Clé secrète API VoIP.ms"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            Note: Il s'agit du mot de passe API activé dans votre portail VoIP.ms sous <em>Main Menu &gt; SOAP and REST API</em>.
          </span>
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 animate-fadeIn ${
              testResult.success
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/60 border-rose-800 text-rose-300'
            }`}
          >
            {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <div>
              <p className="font-bold">{testResult.message}</p>
              {testResult.balance !== undefined && (
                <p className="text-[11px] font-mono mt-0.5">
                  Solde grossiste vérifié : <strong>{testResult.balance.toFixed(2)} $ USD</strong>
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock size={13} className="text-emerald-400" />
            <span>Chiffrement local TLS / AES-256</span>
          </div>

          <button
            type="submit"
            disabled={isTesting}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            {isTesting ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Test de connexion en cours...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={15} />
                <span>Tester & Enregistrer l'Interconnexion</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Guide IP Whitelisting VoIP.ms */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
        <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
          <HelpCircle size={14} className="text-cyan-400" />
          <span>Liste blanche d'adresses IP sur VoIP.ms :</span>
        </h4>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Pour que vos requêtes API s'exécutent sans blocage, assurez-vous d'ajouter l'adresse IP de votre serveur de production (<strong>10.0.0.214</strong> / IP publique) dans votre console VoIP.ms sous <em>API Configuration &gt; Enable API &gt; Allowed IP Addresses</em>.
        </p>
      </div>

    </div>
  );
};