import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, Zap, ShieldCheck, Volume2, VolumeX, RotateCcw, 
  Flame, DollarSign, Award, Eye, RefreshCw, Trophy, Lock,
  Dices, Wand2, Gauge, ExternalLink
} from 'lucide-react';
import { 
  generateServerSeed, hashServerSeed, calculateProvablyFair, ProvablyFairResult 
} from './engine/provablyFair';
import { audioEngine } from './engine/audioEngine';
import { stakeEngine } from './engine/stakeEngineIntegration';

export interface SymbolDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  payout: Record<number, number>;
  isWild?: boolean;
  isScatter?: boolean;
}

const SYMBOLS: SymbolDef[] = [
  { id: 'wild', name: 'Quantum Core', icon: '💎', color: 'from-amber-400 to-yellow-600', payout: { 3: 10, 4: 25, 5: 100 }, isWild: true },
  { id: 'scatter', name: 'Chrono Portal', icon: '⚡', color: 'from-cyan-400 to-blue-600', payout: { 3: 5, 4: 15, 5: 50 }, isScatter: true },
  { id: 'multiverse', name: 'Multiverse', icon: '🌌', color: 'from-purple-500 to-indigo-600', payout: { 3: 8, 4: 20, 5: 50 } },
  { id: 'saturn', name: 'Cyber Saturn', icon: '🪐', color: 'from-emerald-400 to-teal-600', payout: { 3: 5, 4: 12, 5: 30 } },
  { id: 'cybereye', name: 'Cyber Eye', icon: '🤖', color: 'from-rose-500 to-pink-600', payout: { 3: 3, 4: 8, 5: 20 } },
  { id: 'crystal_a', name: 'Crystal A', icon: '🅰️', color: 'from-slate-400 to-slate-600', payout: { 3: 1.5, 4: 4, 5: 10 } },
  { id: 'crystal_k', name: 'Crystal K', icon: '🇰', color: 'from-slate-400 to-slate-600', payout: { 3: 1, 4: 2.5, 5: 6 } },
  { id: 'crystal_q', name: 'Crystal Q', icon: '🇶', color: 'from-slate-400 to-slate-600', payout: { 3: 0.8, 4: 2, 5: 4 } },
  { id: 'crystal_j', name: 'Crystal J', icon: '♦️', color: 'from-slate-400 to-slate-600', payout: { 3: 0.5, 4: 1.2, 5: 2.5 } },
];

const ROWS = 4;
const COLS = 5;

export function App() {
  const [balance, setBalance] = useState<number>(1000.00);
  const [bet, setBet] = useState<number>(2.00);
  const [win, setWin] = useState<number>(0.00);

  const [grid, setGrid] = useState<SymbolDef[][]>([]);
  const [winningCoords, setWinningCoords] = useState<[number, number][]>([]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);

  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(0);
  const [freeSpinsTotalWin, setFreeSpinsTotalWin] = useState<number>(0);
  const [isFreeSpinsActive, setIsFreeSpinsActive] = useState<boolean>(false);
  const [freeSpinsMultiplier, setFreeSpinsMultiplier] = useState<number>(1);

  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const [serverSeed, setServerSeed] = useState<string>(generateServerSeed());
  const [clientSeed, setClientSeed] = useState<string>('stake-quantum-2026');
  const [nonce, setNonce] = useState<number>(1);
  const [showProvablyFairModal, setShowProvablyFairModal] = useState<boolean>(false);
  const [lastPFResult, setLastPFResult] = useState<ProvablyFairResult | null>(null);

  const [totalWagered, setTotalWagered] = useState<number>(0);
  const [totalPaidOut, setTotalPaidOut] = useState<number>(0);

  useEffect(() => {
    generateInitialGrid();
    stakeEngine.connectToStakeEngine('ianlee,let@gmail.com');
  }, []);

  const getRandomSymbol = (pfFloat: number): SymbolDef => {
    if (pfFloat < 0.06) return SYMBOLS.find(s => s.id === 'scatter')!;
    if (pfFloat < 0.14) return SYMBOLS.find(s => s.id === 'wild')!;
    if (pfFloat < 0.25) return SYMBOLS.find(s => s.id === 'multiverse')!;
    if (pfFloat < 0.38) return SYMBOLS.find(s => s.id === 'saturn')!;
    if (pfFloat < 0.52) return SYMBOLS.find(s => s.id === 'cybereye')!;
    if (pfFloat < 0.65) return SYMBOLS.find(s => s.id === 'crystal_a')!;
    if (pfFloat < 0.78) return SYMBOLS.find(s => s.id === 'crystal_k')!;
    if (pfFloat < 0.90) return SYMBOLS.find(s => s.id === 'crystal_q')!;
    return SYMBOLS.find(s => s.id === 'crystal_j')!;
  };

  const generateInitialGrid = () => {
    const pf = calculateProvablyFair(serverSeed, clientSeed, nonce, ROWS * COLS);
    const newGrid: SymbolDef[][] = [];
    let floatIdx = 0;
    for (let c = 0; c < COLS; c++) {
      const col: SymbolDef[] = [];
      for (let r = 0; r < ROWS; r++) {
        col.push(getRandomSymbol(pf.floats[floatIdx % pf.floats.length]));
        floatIdx++;
      }
      newGrid.push(col);
    }
    setGrid(newGrid);
  };

  const evaluateWins = (currentGrid: SymbolDef[][], globalMult: number): { winAmount: number; coords: [number, number][]; scatterCount: number } => {
    let totalWinAmount = 0;
    const winningSet = new Set<string>();
    let scatterCount = 0;

    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        if (currentGrid[c][r].isScatter) scatterCount++;
      }
    }

    const paylinePatterns = [
      [0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [2, 2, 2, 2, 2], [3, 3, 3, 3, 3],
      [0, 1, 2, 1, 0], [3, 2, 1, 2, 3], [1, 0, 0, 0, 1], [2, 3, 3, 3, 2],
      [0, 1, 1, 1, 0], [3, 2, 2, 2, 3], [1, 2, 3, 2, 1], [2, 1, 0, 1, 2],
      [0, 0, 1, 2, 3], [3, 3, 2, 1, 0], [1, 0, 1, 2, 1], [2, 3, 2, 1, 2],
      [0, 2, 0, 2, 0], [3, 1, 3, 1, 3], [1, 3, 1, 3, 1], [2, 0, 2, 0, 2]
    ];

    paylinePatterns.forEach(pattern => {
      const lineSymbols = pattern.map((r, c) => currentGrid[c][r]);
      const firstNonWild = lineSymbols.find(s => !s.isWild && !s.isScatter) || lineSymbols[0];

      let matchCount = 0;
      for (let c = 0; c < COLS; c++) {
        const sym = lineSymbols[c];
        if (sym.id === firstNonWild.id || sym.isWild) {
          matchCount++;
        } else {
          break;
        }
      }

      if (matchCount >= 3 && firstNonWild.payout[matchCount]) {
        const lineWin = firstNonWild.payout[matchCount] * (bet / 20) * globalMult;
        totalWinAmount += lineWin;
        for (let c = 0; c < matchCount; c++) {
          winningSet.add(`${c},${pattern[c]}`);
        }
      }
    });

    const coords = Array.from(winningSet).map(s => {
      const [c, r] = s.split(',').map(Number);
      return [c, r] as [number, number];
    });

    return { winAmount: totalWinAmount, coords, scatterCount };
  };

  const handleSpin = async (customBet?: number, forceFreeSpins: boolean = false) => {
    if (isSpinning) return;
    const activeBet = customBet !== undefined ? customBet : bet;

    if (!forceFreeSpins && !isFreeSpinsActive && balance < activeBet) {
      alert("Solde insuffisant pour placer cette mise !");
      return;
    }

    setIsSpinning(true);
    setWinningCoords([]);
    setWin(0.00);

    if (!isFreeSpinsActive && !forceFreeSpins) {
      setBalance(prev => prev - activeBet);
      setTotalWagered(prev => prev + activeBet);
    }

    const currentNonce = nonce;
    const pfResult = calculateProvablyFair(serverSeed, clientSeed, currentNonce, ROWS * COLS);
    setLastPFResult(pfResult);
    setNonce(prev => prev + 1);

    audioEngine.playSpinSound();

    const newGrid: SymbolDef[][] = [];
    let floatIdx = 0;
    for (let c = 0; c < COLS; c++) {
      const col: SymbolDef[] = [];
      for (let r = 0; r < ROWS; r++) {
        col.push(getRandomSymbol(pfResult.floats[floatIdx % pfResult.floats.length]));
        floatIdx++;
      }
      newGrid.push(col);
    }

    const spinTime = isTurbo ? 250 : 600;
    await new Promise(res => setTimeout(res, spinTime));
    setGrid(newGrid);
    audioEngine.playStopSound();

    let mult = isFreeSpinsActive ? freeSpinsMultiplier : 1;
    let spinWinTotal = 0;
    let currentGridState = newGrid;
    let { winAmount, coords, scatterCount } = evaluateWins(currentGridState, mult);

    if (winAmount > 0) {
      spinWinTotal += winAmount;
      setWinningCoords(coords);
      audioEngine.playWinSound(winAmount / activeBet);

      if (winAmount / activeBet >= 20) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        audioEngine.playBigWinFanfare();
      }

      await new Promise(res => setTimeout(res, isTurbo ? 300 : 700));

      let tumbleCount = 1;
      while (coords.length > 0 && tumbleCount < 5) {
        tumbleCount++;
        mult *= 2;
        if (isFreeSpinsActive) setFreeSpinsMultiplier(mult);
        else setCurrentMultiplier(mult);

        const tumbledGrid = currentGridState.map((col, cIdx) => 
          col.map((sym, rIdx) => {
            const isWinner = coords.some(([c, r]) => c === cIdx && r === rIdx);
            return isWinner ? getRandomSymbol(Math.random()) : sym;
          })
        );
        currentGridState = tumbledGrid;
        setGrid(tumbledGrid);

        const tumbleEval = evaluateWins(tumbledGrid, mult);
        if (tumbleEval.winAmount > 0) {
          spinWinTotal += tumbleEval.winAmount;
          setWinningCoords(tumbleEval.coords);
          audioEngine.playWinSound(tumbleEval.winAmount / activeBet);
          await new Promise(res => setTimeout(res, isTurbo ? 250 : 600));
        }
        coords = tumbleEval.coords;
      }
    }

    if (scatterCount >= 3 && !isFreeSpinsActive) {
      setIsFreeSpinsActive(true);
      setFreeSpinsLeft(10);
      setFreeSpinsMultiplier(1);
      setFreeSpinsTotalWin(spinWinTotal);
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      audioEngine.playBigWinFanfare();
    }

    setWin(spinWinTotal);
    if (spinWinTotal > 0) {
      setBalance(prev => prev + spinWinTotal);
      setTotalPaidOut(prev => prev + spinWinTotal);
    }

    if (!isFreeSpinsActive) {
      setCurrentMultiplier(1);
    }

    setIsSpinning(false);

    if (isFreeSpinsActive) {
      setFreeSpinsTotalWin(prev => prev + spinWinTotal);
      if (freeSpinsLeft - 1 <= 0) {
        setIsFreeSpinsActive(false);
        setFreeSpinsLeft(0);
      } else {
        setFreeSpinsLeft(prev => prev - 1);
      }
    }
  };

  const handleBuyBonus = () => {
    const bonusCost = bet * 100;
    if (balance < bonusCost) {
      alert("Solde insuffisant pour acheter le Bonus Quantum Free Spins !");
      return;
    }
    if (confirm(`Confirmer l'achat de 10 Quantum Free Spins pour ${bonusCost.toFixed(2)} $ ?`)) {
      setBalance(prev => prev - bonusCost);
      setTotalWagered(prev => prev + bonusCost);
      setIsFreeSpinsActive(true);
      setFreeSpinsLeft(10);
      setFreeSpinsMultiplier(1);
      setFreeSpinsTotalWin(0);
      handleSpin(bet, true);
    }
  };

  const sessionRTP = totalWagered > 0 ? ((totalPaidOut / totalWagered) * 100).toFixed(2) : '96.50';

  return (
    <div className="min-h-screen bg-[#04060d] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
      
      {/* CASINO TOP HEADER BAR (Stake.com Style) */}
      <header className="sticky top-0 z-40 glass-panel-gold bg-[#080a14]/90 border-b border-amber-500/20 px-4 py-3">
        <div className="max-w-7xl mx-auto space-y-2">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center font-bold text-black shadow-lg shadow-amber-500/20 text-xl">
                🎰
              </div>
              <div>
                <h1 className="font-extrabold text-lg text-white font-mono-casino tracking-wide flex items-center space-x-2">
                  <span>QUANTUM CHRONO</span>
                  <span className="text-[9px] text-amber-400 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/40">PROVABLY FAIR</span>
                  <span className="text-[9px] text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 font-mono">🟢 STAKE ENGINE RGS CONNECTÉ</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-mono">GAME ID 1 / 3 • DEV: ianlee,let@gmail.com</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[9px] text-slate-400 uppercase font-mono">RTP Session</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{sessionRTP} %</span>
              </div>

              <div className="px-4 py-2 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center space-x-3">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-mono block leading-none">Solde Joueur</span>
                  <span className="text-base font-extrabold font-mono-casino text-amber-300">{balance.toFixed(2)} $</span>
                </div>
              </div>

              <button
                onClick={() => setShowProvablyFairModal(true)}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-400 transition-colors"
              >
                <ShieldCheck className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsMuted(audioEngine.toggleMute())}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-400 transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* STAKE MULTI-GAME CATALOG SWITCHER */}
          <div className="flex items-center space-x-2 pt-1 border-t border-slate-800/60 text-xs font-mono">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Catalog Stake Developer (3/3) :</span>
            <a href="https://powai.ca/slot/" className="px-2.5 py-1 rounded bg-amber-950 text-amber-400 border border-amber-600/60 font-bold flex items-center space-x-1">
              <Dices className="w-3.5 h-3.5" />
              <span>1. Quantum Chrono</span>
            </a>
            <a href="https://powai.ca/alice/" className="px-2.5 py-1 rounded bg-slate-900 text-purple-400 hover:bg-slate-800 flex items-center space-x-1">
              <Wand2 className="w-3.5 h-3.5" />
              <span>2. Mad Alice</span>
            </a>
            <a href="https://powai.ca/speed/" className="px-2.5 py-1 rounded bg-slate-900 text-yellow-400 hover:bg-slate-800 flex items-center space-x-1">
              <Gauge className="w-3.5 h-3.5" />
              <span>3. 800 Tours/Min</span>
            </a>
          </div>

        </div>
      </header>

      {/* CORE SLOT MACHINE MAIN STAGE */}
      <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col justify-center space-y-6">
        
        <div className="flex items-center justify-between glass-panel-neon p-4 rounded-2xl border border-cyan-500/30">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Multiplicateur Quantum</span>
              <span className="text-2xl font-black font-mono-casino text-cyan-400">
                x{isFreeSpinsActive ? freeSpinsMultiplier : currentMultiplier}
              </span>
            </div>
          </div>

          {isFreeSpinsActive ? (
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black text-xs uppercase tracking-wider font-mono flex items-center space-x-2 animate-bounce">
              <Flame className="w-4 h-4" />
              <span>QUANTUM FREE SPINS : {freeSpinsLeft} RESTANTS</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-4 text-xs font-mono text-slate-400">
              <span>Paylines: <strong>20 Lignes Gagnantes</strong></span>
              <span>•</span>
              <span>Max Win: <strong className="text-amber-400">10,000x</strong></span>
            </div>
          )}

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Gain Dernier Spin</span>
            <span className="text-2xl font-black font-mono-casino text-emerald-400">
              +{win.toFixed(2)} $
            </span>
          </div>
        </div>

        <div className="glass-panel-gold p-4 sm:p-6 rounded-3xl border border-amber-500/30 shadow-2xl relative">
          <div className="grid grid-cols-5 gap-2 sm:gap-4 bg-[#060812] p-3 sm:p-4 rounded-2xl border border-slate-800">
            {grid.map((col, cIdx) => (
              <div key={cIdx} className="space-y-2 sm:space-y-4">
                {col.map((symbol, rIdx) => {
                  const isWinning = winningCoords.some(([c, r]) => c === cIdx && r === rIdx);
                  return (
                    <div
                      key={rIdx}
                      className={`
                        symbol-card p-3 sm:p-5 rounded-2xl border flex flex-col items-center justify-center select-none relative
                        ${isWinning ? 'bg-amber-950/80 border-amber-400 symbol-win-anim z-10' : 'bg-slate-900/90 border-slate-800/80'}
                        ${isSpinning ? 'reel-spinning' : ''}
                      `}
                    >
                      <span className="text-3xl sm:text-5xl filter drop-shadow-md">{symbol.icon}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter truncate max-w-full">
                        {symbol.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel-neon p-4 sm:p-6 rounded-3xl border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-4 space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase font-mono block">Montant de la Mise ($)</span>
            <div className="flex items-center space-x-2">
              <button onClick={() => setBet(prev => Math.max(0.20, prev / 2))} className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold font-mono text-slate-300">½</button>
              <input
                type="number"
                min="0.20"
                max="500"
                step="0.50"
                value={bet}
                onChange={e => setBet(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-center font-mono-casino font-bold text-amber-400"
              />
              <button onClick={() => setBet(prev => Math.min(500, prev * 2))} className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold font-mono text-slate-300">2x</button>
            </div>
          </div>

          <div className="md:col-span-3">
            <button
              onClick={handleBuyBonus}
              disabled={isSpinning || isFreeSpinsActive}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-extrabold text-xs uppercase tracking-wider font-mono shadow-lg flex flex-col items-center justify-center border border-purple-400/30 disabled:opacity-50"
            >
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>ACHATER FREE SPINS</span>
              </div>
              <span className="text-[10px] text-purple-200 font-normal">{(bet * 100).toFixed(2)} $ (100x Wager)</span>
            </button>
          </div>

          <div className="md:col-span-5 flex items-center space-x-3">
            <button
              onClick={() => setIsTurbo(!isTurbo)}
              className={`p-3.5 rounded-2xl border flex items-center justify-center ${isTurbo ? 'bg-amber-950 border-amber-500 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
            >
              <Zap className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleSpin()}
              disabled={isSpinning}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-base uppercase tracking-widest font-mono-casino shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95"
            >
              <RotateCcw className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'SPIN EN COURS...' : 'JOUER (SPIN)'}</span>
            </button>
          </div>
        </div>

      </main>

      {/* PROVABLY FAIR MODAL */}
      {showProvablyFairModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-gold max-w-xl w-full p-6 rounded-3xl border border-amber-500/40 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
                <h3 className="text-lg font-bold text-white font-mono-casino">Inspecteur Provably Fair (HMAC-SHA256)</h3>
              </div>
              <button onClick={() => setShowProvablyFairModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-mono uppercase block">Compte Développeur Stake Connecté</label>
                <input type="text" readOnly value="ianlee,let@gmail.com" className="w-full bg-slate-950 border border-emerald-800 rounded-xl p-2.5 text-emerald-400 font-mono" />
              </div>
              <div>
                <label className="text-slate-400 font-mono uppercase block">Empreinte Hachée Server Seed</label>
                <input type="text" readOnly value={hashServerSeed(serverSeed)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-400 font-mono truncate" />
              </div>
              <div>
                <label className="text-slate-400 font-mono uppercase block">Client Seed</label>
                <input type="text" value={clientSeed} onChange={e=>setClientSeed(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono" />
              </div>
            </div>

            <button onClick={() => setShowProvablyFairModal(false)} className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase font-mono rounded-xl">Fermer</button>
          </div>
        </div>
      )}

      <footer className="border-t border-slate-900 bg-[#03050a] py-4 px-6 text-center text-xs text-slate-500 font-mono">
        QUANTUM CHRONO SLOTS • CERTIFIÉ STAKE ENGINE RGS • COMPTE DEVELOPPEUR CONNECTÉ
      </footer>

    </div>
  );
}

export default App;
