import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Phone, Paperclip, CheckCheck, Smile, Sparkles } from 'lucide-react';
import { Conversation, MessageItem, VoipNumber } from '../../types/voip';

interface ChatThreadProps {
  conversation: Conversation;
  activeLine?: VoipNumber;
  onBack: () => void;
  onSendMessage: (convoId: string, text: string) => void;
  onCallContact: (number: string) => void;
}

export const ChatThread: React.FC<ChatThreadProps> = ({
  conversation,
  activeLine,
  onBack,
  onSendMessage,
  onCallContact
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(conversation.id, inputText.trim());
    setInputText('');
  };

  return (
    <div className="flex-1 flex flex-col max-w-md mx-auto w-full h-full bg-[#070a12] select-none">
      
      {/* Barre Supérieure du Contact */}
      <div className="px-4 py-3 bg-[#0a0f1d] border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-slate-950 text-xs shadow-sm"
            style={{ backgroundColor: conversation.avatarColor }}
          >
            {conversation.peerName ? conversation.peerName.slice(0, 2).toUpperCase() : conversation.peerNumber.slice(-2)}
          </div>

          <div>
            <h3 className="font-bold text-sm text-white">
              {conversation.peerName || conversation.peerNumber}
            </h3>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Ligne VoIP active ({activeLine?.number || '514'})
            </p>
          </div>
        </div>

        <button
          onClick={() => onCallContact(conversation.peerNumber)}
          className="p-2.5 rounded-full bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-700/50 shadow-sm transition-all"
          title="Appeler ce contact"
        >
          <Phone size={16} />
        </button>
      </div>

      {/* Zone des Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-center my-2">
          <span className="text-[10px] px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
            🔒 Messages chiffrés de bout en bout via protocole VoIP PowAI
          </span>
        </div>

        {conversation.messages.map((msg) => {
          const isMe = msg.sender === 'me';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                  isMe
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <p>{msg.text}</p>
              </div>

              <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-500 font-mono">
                <span>{msg.timestamp}</span>
                {isMe && <CheckCheck size={12} className="text-cyan-400" />}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Barre de Saisie Inférieure */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-[#0a0f1d] border-t border-slate-800/80 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Écrire un SMS ou message IP..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`p-3 rounded-full flex items-center justify-center transition-all ${
            inputText.trim()
              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/30 active:scale-95'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          <Send size={16} />
        </button>
      </form>

    </div>
  );
};