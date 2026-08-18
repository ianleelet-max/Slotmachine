import React, { useState } from 'react';
import { MessageSquarePlus, Search, User, CheckCheck, Sparkles } from 'lucide-react';
import { Conversation } from '../../types/voip';

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (convo: Conversation) => void;
  onNewMessage: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onSelectConversation,
  onNewMessage
}) => {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(
    (c) =>
      c.peerNumber.toLowerCase().includes(search.toLowerCase()) ||
      (c.peerName && c.peerName.toLowerCase().includes(search.toLowerCase())) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-2">
      
      {/* En-tête Messagerie */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-bold text-white">Messagerie IP & SMS</h2>
          <p className="text-xs text-slate-400">Conversations VoIP chiffrées</p>
        </div>
        <button
          onClick={onNewMessage}
          className="px-3 py-1.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
        >
          <MessageSquarePlus size={15} />
          <span>Écrire</span>
        </button>
      </div>

      {/* Barre de Recherche */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un message ou contact..."
          className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
      </div>

      {/* Liste des conversations */}
      <div className="space-y-2 overflow-y-auto flex-1 pb-4">
        {filtered.map((convo) => (
          <button
            key={convo.id}
            onClick={() => onSelectConversation(convo)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#0f172a] border border-slate-800/80 hover:border-cyan-500/40 transition-all text-left android-ripple group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-slate-950 text-sm shadow-md flex-shrink-0"
                style={{ backgroundColor: convo.avatarColor }}
              >
                {convo.peerName ? convo.peerName.slice(0, 2).toUpperCase() : convo.peerNumber.slice(-2)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-100 truncate">
                    {convo.peerName || convo.peerNumber}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono ml-2">
                    {convo.lastTimestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5 group-hover:text-slate-300">
                  {convo.lastMessage}
                </p>
              </div>
            </div>

            {convo.unreadCount > 0 && (
              <span className="ml-2 bg-cyan-500 text-slate-950 font-black text-[10px] min-w-[18px] h-[18px] rounded-full px-1 flex items-center justify-center shadow">
                {convo.unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

    </div>
  );
};