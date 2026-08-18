import React from 'react';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Phone, Trash2, Clock } from 'lucide-react';
import { CallRecord } from '../../types/voip';

interface CallHistoryProps {
  calls: CallRecord[];
  onCallNumber: (number: string) => void;
  onClearHistory: () => void;
}

export const CallHistory: React.FC<CallHistoryProps> = ({
  calls,
  onCallNumber,
  onClearHistory
}) => {
  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Journal des Appels</h2>
          <p className="text-xs text-slate-400">Historique des communications VoIP</p>
        </div>
        {calls.length > 0 && (
          <button
            onClick={onClearHistory}
            className="p-2 text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1"
            title="Effacer l'historique"
          >
            <Trash2 size={14} />
            <span>Effacer</span>
          </button>
        )}
      </div>

      {calls.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
          <div className="p-4 rounded-full bg-slate-900 text-slate-500">
            <Clock size={32} />
          </div>
          <p className="text-sm font-semibold text-slate-300">Aucun appel récent</p>
          <p className="text-xs text-slate-500">Vos appels entrants et sortants s'afficheront ici.</p>
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto flex-1 pb-4">
          {calls.map((call) => {
            const isMissed = call.type === 'missed';
            const isOutgoing = call.type === 'outgoing';

            return (
              <div
                key={call.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0f172a] border border-slate-800/80 hover:border-slate-700 transition-all android-ripple"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      isMissed
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                        : isOutgoing
                        ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40'
                        : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                    }`}
                  >
                    {isMissed ? (
                      <PhoneMissed size={16} />
                    ) : isOutgoing ? (
                      <PhoneOutgoing size={16} />
                    ) : (
                      <PhoneIncoming size={16} />
                    )}
                  </div>

                  <div>
                    <p className={`font-mono font-bold text-sm ${isMissed ? 'text-rose-300' : 'text-slate-100'}`}>
                      {call.contactName || call.number}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{call.timestamp}</span>
                      <span>•</span>
                      <span>{call.lineUsed}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onCallNumber(call.number)}
                  className="p-2.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 active:scale-90 transition-all"
                  title="Rappeler"
                >
                  <Phone size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};