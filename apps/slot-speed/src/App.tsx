import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Zap, Flame, DollarSign, ShieldCheck, Volume2, VolumeX, RotateCcw, 
  Play, Square, Bot, TrendingUp, TrendingDown, RefreshCw, BarChart2,
  Sliders, FastForward, Check, Lock, ChevronRight, Gauge
} from 'lucide-react';
import { 
  generateServerSeed, hashServerSeed, calculateProvablyFair, ProvablyFairResult 
} from './engine/provablyFair';
import { speedAudio } from './engine/audioEngine';

export interface SpeedSymbol {
  id: string;
  name: string;
  icon: string;
  multiplier: number;
  color: string;
}

const SPEED_SYMBOLS: SpeedSymbol[] = [
  { id: 'lightning', name: 'LIGHTNING', icon: '⚡', multiplier: 100, color: 'text-amber-400' },
  { id: 'diamond', name: 'DIAMOND', icon: '💎', multiplier: 50, color: 'text-cyan-400' },
  { id: 'fire', name: 'FIRE', icon: '🔥', multiplier: 25, color: 'text-rose-500' },
  { id: 'star', name: 'STAR', icon: '🌟', multiplier: 10, color: 'text-yellow-300' },
  { id: 'seven', name: 'SEVEN', icon: '7️⃣', multiplier: 5, color: 'text-emerald-400' },
  { id: 'cherry', name: 'CHERRY', icon: '🍒', multiplier: 2, color: 'text-pink-500' },
];

export function App() {
  const [balance, setBalance] = useState<number>(1000.00);
  const [bet, setBet] = useState<number>(2.00);
  const [lastWin, setLastWin] = useState<number>(0.00);

  // Speed Settings
  const [spinSpeed, setSpinSpeed] = useState<'instant' | 'hyper' | 'fast'>('instant');
  
  // Grid 3x3
  const [grid, setGrid] = useState<SpeedSymbol[][]>([
    [SPEED_SYMBOLS[0], SPEED_SYMBOLS[1], SPEED_SYMBOLS[2]],
    [SPEED_SYMBOLS[3], SPEED_SYMBOLS[4], SPEED_SYMBOLS[5]],
    [SPEED_SYMBOLS[0], SPEED_SYMBOLS[1], SPEED_SYMBOLS[2]],
  ]);
  const [winningRows, setWinningRows] = useState<number[]>([]);

  // Autoplay & Bot Strategy State
  const [autoStrategy, setAutoStrategy] = useState<'flat' | 'martingale' | 'paroli'>('flat');

  // Burst Mode Summary State
  const [burstSummary, setBurstSummary] = useState<{ totalSpins: number; netProfit: number; maxMult: number; wins: number } | null>(null);

  // Session Statistics
  const [stats, setStats] = useState({ spins: 0, wagered: 0, paidOut: 0, wins: 0, maxWinMult: 0 });

  // Provably Fair State
  const [serverSeed, setServerSeed] = useState<string>(generateServerSeed());
  const [clientSeed, setClientSeed] = useState<string>('800rpm-degen-2026');
  const [nonce, setNonce] = useState<number>(1);
  const [showPFModal, setShowPFModal] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const getRandomSymbol = (floatVal: number): SpeedSymbol => {
    if (floatVal < 0.05) return SPEED_SYMBOLS[0]; // Lightning (100x)
    if (floatVal < 0.12) return SPEED_SYMBOLS[1]; // Diamond (50x)
    if (floatVal < 0.22) return SPEED_SYMBOLS[2]; // Fire (25x)
    if (floatVal < 0.40) return SPEED_SYMBOLS[3]; // Star (10x)
    if (floatVal < 0.65) return SPEED_SYMBOLS[4]; // Seven (5x)
    return SPEED_SYMBOLS[5];                       // Cherry (2x)
  };

  // Single Instant Spin Execution
  const executeSingleSpin = (currentBet: number, currentNonce: number): { winAmount: number; newGrid: SpeedSymbol[][]; winningIndices: number[]; multWon: number } => {
    const pf = calculateProvablyFair(serverSeed, clientSeed, currentNonce, 9);
    const newGrid: SpeedSymbol[][] = [];
    let idx = 0;
    for (let c = 0; c < 3; c++) {
      const col: SpeedSymbol[] = [];
      for (let r = 0; r < 3; r++) {
        col.push(getRandomSymbol(pf.floats[idx]));
        idx++;
      }
      newGrid.push(col);
    }

    let winAmount = 0;
    let maxMult = 0;
    const winningIndices: number[] = [];

    // Horizontal Lines (rows 0, 1, 2)
    for (let r = 0; r < 3; r++) {
      if (newGrid[0][r].id === newGrid[1][r].id && newGrid[1][r].id === newGrid[2][r].id) {
        const lineMult = newGrid[0][r].multiplier;
        winAmount += lineMult * currentBet;
        winningIndices.push(r);
        if (lineMult > maxMult) maxMult = lineMult;
      }
    }

    // Diagonal 1
    if (newGrid[0][0].id === newGrid[1][1].id && newGrid[1][1].id === newGrid[2][2].id) {
      const lineMult = newGrid[0][0].multiplier;
      winAmount += lineMult * currentBet;
      winningIndices.push(3);
      if (lineMult > maxMult) maxMult = lineMult;
    }

    // Diagonal 2
    if (newGrid[0][2].id === newGrid[1][1].id && newGrid[1][1].id === newGrid[2][0].id) {
      const lineMult = newGrid[0][2].multiplier;
      winAmount += lineMult * currentBet;
      winningIndices.push(4);
      if (lineMult > maxMult) maxMult = lineMult;
    }

    return { winAmount, newGrid, winningIndices, multWon: maxMult };
  };

  // Handle Manual Click Spin
  const handleSpinClick = () => {
    if (balance < bet) {
      alert("Solde insuffisant !");
      return;
    }

    const { winAmount, newGrid, winningIndices, multWon } = executeSingleSpin(bet, nonce);

    setNonce(prev => prev + 1);
    setGrid(newGrid);
    setWinningRows(winningIndices);
    setLastWin(winAmount);

    const netChange = winAmount - bet;
    setBalance(prev => prev + netChange);

    setStats(prev => ({
      spins: prev.spins + 1,
      wagered: prev.wagered + bet,
      paidOut: prev.paidOut + winAmount,
      wins: winAmount > 0 ? prev.wins + 1 : prev.wins,
      maxWinMult: Math.max(prev.maxWinMult, multWon)
    }));

    if (winAmount > 0) {
      speedAudio.playInstantWin();
      if (multWon >= 25) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }
    } else {
      speedAudio.playInstantClick();
    }
  };

  // 800 TOURS / MINUTE BURST MODE (Simulate 100 Spins in 1 Instant Flash!)
  const handleBurst800RPM = () => {
    const burstCount = 100;
    if (balance < bet) {
      alert("Solde insuffisant pour lancer le Mode 800 Tours/Minute !");
      return;
    }

    let currentBal = balance;
    let currentBet = bet;
    let localNonce = nonce;
    let totalWin = 0;
    let totalWager = 0;
    let winCount = 0;
    let maxMult = 0;
    let lastGridResult: SpeedSymbol[][] = grid;

    for (let i = 0; i < burstCount; i++) {
      if (currentBal < currentBet) break;

      currentBal -= currentBet;
      totalWager += currentBet;

      const { winAmount, newGrid, multWon } = executeSingleSpin(currentBet, localNonce);
      localNonce++;
      lastGridResult = newGrid;

      if (winAmount > 0) {
        totalWin += winAmount;
        currentBal += winAmount;
        winCount++;
        if (multWon > maxMult) maxMult = multWon;

        if (autoStrategy === 'paroli') currentBet = Math.min(200, currentBet * 2);
        else if (autoStrategy === 'martingale') currentBet = bet;
      } else {
        if (autoStrategy === 'martingale') currentBet = Math.min(200, currentBet * 2);
        else if (autoStrategy === 'paroli') currentBet = bet;
      }
    }

    setBalance(currentBal);
    setNonce(localNonce);
    setGrid(lastGridResult);
    setLastWin(totalWin);

    const netProfit = totalWin - totalWager;
    setBurstSummary({
      totalSpins: burstCount,
      netProfit,
      maxMult,
      wins: winCount
    });

    setStats(prev => ({
      spins: prev.spins + burstCount,
      wagered: prev.wagered + totalWager,
      paidOut: prev.paidOut + totalWin,
      wins: prev.wins + winCount,
      maxWinMult: Math.max(prev.maxWinMult, maxMult)
    }));

    if (netProfit > 0) {
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
      speedAudio.playInstantWin();
    }
  };

  const rtpSession = stats.wagered > 0 ? ((stats.paidOut / stats.wagered) * 100).toFixed(2) : '96.50';

  return (
    <div className="min-h-screen bg-[#03060c] text-slate-100 flex flex-col justify-between selection:bg-yellow-500 selection:text-black">
      
      {/* HEADER STAKE SPEED BAR */}
      <header className="sticky top-0 z-40 glass-panel-speed bg-[#070b16]/95 border-b border-amber-500/30 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center font-black text-black shadow-lg shadow-amber-500/20 text-xl font-speed">
              ⚡
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-white font-speed tracking-wider flex items-center space-x-2 leading-none">
                <span>800 TOURS/MINUTE</span>
                <span className="text-[9px] text-amber-400 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 font-mono">HYPER SPEED</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">BURST INSTANTANÉ • PROVABLY FAIR STAKE</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            
            {/* Speed Selector */}
            <div className="hidden sm:flex items-center space-x-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
              <button onClick={() => setSpinSpeed('instant')} className={`px-2.5 py-1 rounded-lg ${spinSpeed==='instant'?'bg-amber-500 text-black font-bold':'text-slate-400'}`}>0ms</button>
              <button onClick={() => setSpinSpeed('hyper')} className={`px-2.5 py-1 rounded-lg ${spinSpeed==='hyper'?'bg-amber-500 text-black font-bold':'text-slate-400'}`}>30ms</button>
              <button onClick={() => setSpinSpeed('fast')} className={`px-2.5 py-1 rounded-lg ${spinSpeed==='fast'?'bg-amber-500 text-black font-bold':'text-slate-400'}`}>100ms</button>
            </div>

            {/* Balance Box */}
            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center space-x-3">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-mono block leading-none">Solde Instant</span>
                <span className="text-base font-extrabold font-mono-casino text-amber-300">{balance.toFixed(2)} $</span>
              </div>
            </div>

            <button onClick={() => setShowPFModal(true)} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </button>

            <button onClick={() => setIsMuted(speedAudio.toggleMute())} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-400">
              {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
            </button>

          </div>

        </div>
      </header>

      {/* CORE STAGE */}
      <main className="max-w-5xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col justify-center space-y-6">
        
        {/* STATS & QUICK WIN BAR */}
        <div className="glass-panel-speed p-4 rounded-2xl border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-6 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Tours Effectués</span>
              <strong className="text-white text-sm">{stats.spins}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">RTP Session</span>
              <strong className="text-emerald-400 text-sm">{rtpSession} %</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[9px] uppercase">Max Multiplicateur</span>
              <strong className="text-amber-400 text-sm">{stats.maxWinMult}x</strong>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] text-slate-500 font-mono uppercase block">Dernier Gain</span>
            <span className="text-2xl font-black font-mono-casino text-emerald-400">+{lastWin.toFixed(2)} $</span>
          </div>
        </div>

        {/* 3x3 MINIMALIST ULTRA-CONTRAST GRID */}
        <div className="glass-panel-speed p-6 rounded-3xl border border-amber-500/40 relative">
          
          <div className="grid grid-cols-3 gap-3 bg-[#020409] p-4 rounded-2xl border border-amber-500/20 max-w-md mx-auto">
            {grid.map((col, cIdx) => (
              <div key={cIdx} className="space-y-3">
                {col.map((symbol, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-col items-center justify-center select-none shadow-inner"
                  >
                    <span className="text-5xl filter drop-shadow-md">{symbol.icon}</span>
                    <span className={`text-[10px] font-black font-speed tracking-wider mt-1 ${symbol.color}`}>
                      {symbol.name} ({symbol.multiplier}x)
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

        </div>

        {/* 800 RPM BURST CONTROLS */}
        <div className="glass-panel-speed p-6 rounded-3xl border border-slate-800 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Bet Adjustment (4/12) */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 font-mono uppercase">Mise ($)</label>
              <div className="flex items-center space-x-2">
                <button onClick={() => setBet(prev => Math.max(0.20, prev / 2))} className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold font-mono text-slate-300">½</button>
                <input
                  type="number"
                  min="0.20"
                  max="200"
                  step="0.50"
                  value={bet}
                  onChange={e => setBet(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-center font-mono-casino font-bold text-amber-400"
                />
                <button onClick={() => setBet(prev => Math.min(200, prev * 2))} className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold font-mono text-slate-300">2x</button>
              </div>
            </div>

            {/* Instant Spin Button (4/12) */}
            <div className="md:col-span-4">
              <button
                onClick={handleSpinClick}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-base uppercase font-mono-casino shadow-lg shadow-amber-500/30 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Zap className="w-5 h-5 fill-black" />
                <span>SPIN INSTANTANÉ</span>
              </button>
            </div>

            {/* 800 TOURS / MINUTE BURST BUTTON (4/12) */}
            <div className="md:col-span-4">
              <button
                onClick={handleBurst800RPM}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 via-red-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs uppercase font-mono shadow-lg shadow-rose-500/30 border border-rose-400/40 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Gauge className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span>MODE 800 TOURS / MINUTE</span>
              </button>
            </div>

          </div>

          {/* BURST RESULT SUMMARY TOAST */}
          {burstSummary && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-3">
                <span className="text-amber-400 font-bold">⚡ BILAN 800 TOURS/MIN :</span>
                <span>Victoires : <strong className="text-emerald-400">{burstSummary.wins} / 100</strong></span>
                <span>Max Multiplicateur : <strong className="text-amber-400">{burstSummary.maxMult}x</strong></span>
              </div>
              <div>
                <span>Profit Net : <strong className={burstSummary.netProfit >= 0 ? 'text-emerald-400 text-sm' : 'text-rose-400 text-sm'}>{burstSummary.netProfit >= 0 ? '+' : ''}{burstSummary.netProfit.toFixed(2)} $</strong></span>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* PROVABLY FAIR MODAL */}
      {showPFModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-speed max-w-xl w-full p-6 rounded-3xl border border-amber-500/40 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
                <h3 className="text-lg font-bold text-white font-speed">Inspecteur Provably Fair (HMAC-SHA256)</h3>
              </div>
              <button onClick={() => setShowPFModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-mono uppercase block">Empreinte Hachée Server Seed</label>
                <input type="text" readOnly value={hashServerSeed(serverSeed)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-400 font-mono truncate" />
              </div>
              <div>
                <label className="text-slate-400 font-mono uppercase block">Client Seed</label>
                <input type="text" value={clientSeed} onChange={e=>setClientSeed(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono" />
              </div>
              <div>
                <label className="text-slate-400 font-mono uppercase block">Nonce de Spin</label>
                <input type="text" readOnly value={nonce} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-cyan-400 font-mono" />
              </div>
            </div>

            <button onClick={() => setShowPFModal(false)} className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase font-mono rounded-xl">Fermer</button>
          </div>
        </div>
      )}

      <footer className="border-t border-slate-900 bg-[#020408] py-4 px-6 text-center text-xs text-slate-500 font-mono">
        800 TOURS/MINUTE • INSTANT SPEED SLOTS STAKE EDITION • 18+
      </footer>

    </div>
  );
}

export default App;
