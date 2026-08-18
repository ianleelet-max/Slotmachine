import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Lock, ShieldCheck } from 'lucide-react';

export const AndroidStatusBar: React.FC = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#060911] px-5 py-2 flex items-center justify-between text-xs text-slate-400 font-medium select-none z-30 border-b border-slate-900/60">
      <div className="flex items-center gap-1.5">
        <span className="text-white font-semibold">{time}</span>
        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 font-mono font-bold border border-cyan-800/40">
          VoIP HD
        </span>
      </div>

      <div className="flex items-center gap-2 text-slate-300">
        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          5G+
        </span>
        <Signal size={13} className="text-slate-300" />
        <Wifi size={13} className="text-slate-300" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono">98%</span>
          <Battery size={14} className="text-emerald-400" />
        </div>
      </div>
    </div>
  );
};