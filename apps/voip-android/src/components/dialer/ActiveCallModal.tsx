import React, { useState, useEffect } from 'react';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Pause, 
  Play, 
  Hash, 
  Radio, 
  ShieldCheck, 
  Wifi,
  Sparkles
} from 'lucide-react';
import { VoipNumber } from '../../types/voip';

interface ActiveCallModalProps {
  targetNumber: string;
  activeLine?: VoipNumber;
  onEndCall: () => void;
}

export const ActiveCallModal: React.FC<ActiveCallModalProps> = ({
  targetNumber,
  activeLine,
  onEndCall
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [statusText, setStatusText] = useState('Connexion SIP WebRTC...');

  useEffect(() => {
    const t1 = setTimeout(() => setStatusText('Sonnerie...'), 1200);
    const t2 = setTimeout(() => setStatusText('Appel chiffré TLS/SRTP (HD Audio Opus)'), 3500);

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(timer);
    };
  }, []);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 bg-[#060911]/95 backdrop-blur-2xl z-50 flex flex-col justify-between p-6 select-none animate-fadeIn">
      
      {/* En-tête de Sécurité */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span className="font-mono text-[10px] text-slate-300">Opus 48kHz Chiffré</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[11px] text-cyan-400">
          <Wifi size={12} />
          <span>VoIP HD</span>
        </div>
      </div>

      {/* Avatar & Infos du Destinataire */}
      <div className="flex flex-col items-center justify-center space-y-4 my-auto">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-1 shadow-2xl glow-cyan animate-pulse">
            <div className="w-full h-full rounded-full bg-[#0a0f1d] flex items-center justify-center text-4xl font-black text-white">
              {targetNumber.slice(-2)}
            </div>
          </div>
          <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#060911] flex items-center justify-center text-[10px]">
            📞
          </span>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wide">
            {targetNumber}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Via {activeLine?.number || '+1 (514) 800-POW1'} ({activeLine?.region || 'QC'})
          </p>
          <div className="pt-2">
            <span className="text-2xl font-mono font-black text-emerald-400 tracking-widest">
              {formatDuration(seconds)}
            </span>
          </div>
          <p className="text-[11px] text-cyan-400 font-medium animate-pulse">
            {statusText}
          </p>
        </div>
      </div>

      {/* Tableau des Contrôles d'Appel (Mute, Speaker, Hold) */}
      <div className="space-y-6 max-w-xs mx-auto w-full">
        <div className="grid grid-cols-3 gap-4">
          
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all android-ripple ${
              isMuted ? 'bg-rose-950 border border-rose-600 text-rose-300' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            <span className="text-[10px] font-bold mt-1">{isMuted ? 'Muet ON' : 'Micro'}</span>
          </button>

          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all android-ripple ${
              isSpeaker ? 'bg-cyan-950 border border-cyan-600 text-cyan-300' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isSpeaker ? <Volume2 size={22} /> : <VolumeX size={22} />}
            <span className="text-[10px] font-bold mt-1">{isSpeaker ? 'HP ON' : 'Écouteur'}</span>
          </button>

          <button
            onClick={() => setIsOnHold(!isOnHold)}
            className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all android-ripple ${
              isOnHold ? 'bg-amber-950 border border-amber-600 text-amber-300' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isOnHold ? <Play size={22} /> : <Pause size={22} />}
            <span className="text-[10px] font-bold mt-1">{isOnHold ? 'Reprendre' : 'Attente'}</span>
          </button>

        </div>

        {/* Bouton Raccrocher Rouge Android */}
        <div className="flex justify-center pt-2">
          <button
            onClick={onEndCall}
            className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-2xl shadow-rose-600/50 android-ripple active:scale-95 transition-all"
          >
            <PhoneOff size={32} />
          </button>
        </div>
      </div>

    </div>
  );
};