import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, Zap, ShieldCheck, Volume2, VolumeX, RotateCcw, 
  Flame, DollarSign, Award, Eye, RefreshCw, Trophy, Crown,
  Wand2, Coffee, Ghost, ArrowUpRight, Scale, Layers
} from 'lucide-react';
import { 
  generateServerSeed, hashServerSeed, calculateProvablyFair, ProvablyFairResult 
} from './engine/provablyFair';
import { aliceAudio } from './engine/audioEngine';

export interface SymbolDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  payout: Record<number, number>;
  isWild?: boolean;
  isScatter?: boolean;
  isDrinkMe?: boolean;
  isEatMe?: boolean;
}

const ALICE_SYMBOLS: SymbolDef[] = [
  { id: 'cheshire', name: 'Cheshire Cat', icon: '🐱', color: 'from-purple-500 to-pink-500', payout: { 3: 15, 4: 40, 5: 150 }, isWild: true },
  { id: 'rabbit', name: 'White Rabbit', icon: '🐇', color: 'from-cyan-400 to-blue-500', payout: { 3: 10, 4: 25, 5: 80 }, isScatter: true },
  { id: 'drinkme', name: 'Drink Me Potion', icon: '🧪', color: 'from-rose-500 to-purple-600', payout: { 3: 5, 4: 15, 5: 50 }, isDrinkMe: true },
  { id: 'eatme', name: 'Eat Me Cake', icon: '🍰', color: 'from-emerald-400 to-teal-600', payout: { 3: 5, 4: 15, 5: 50 }, isEatMe: true },
  { id: 'hatter', name: 'Mad Hatter', icon: '🎩', color: 'from-amber-400 to-yellow-500', payout: { 3: 8, 4: 20, 5: 60 } },
  { id: 'queen', name: 'Queen of Hearts', icon: '👑', color: 'from-red-500 to-rose-700', payout: { 3: 6, 4: 15, 5: 45 } },
  { id: 'mushroom', name: 'Magic Mushroom', icon: '🍄', color: 'from-indigo-400 to-purple-600', payout: { 3: 4, 4: 10, 5: 30 } },
  { id: 'teapot', name: 'Mad Teapot', icon: '🫖', color: 'from-amber-500 to-orange-600', payout: { 3: 3, 4: 8, 5: 20 } },
  { id: 'card_a', name: 'Card A', icon: '♠️', color: 'from-slate-400 to-slate-600', payout: { 3: 1.5, 4: 4, 5: 10 } },
  { id: 'card_k', name: 'Card K', icon: '♥️', color: 'from-slate-400 to-slate-600', payout: { 3: 1, 4: 2.5, 5: 6 } },
  { id: 'card_q', name: 'Card Q', icon: '♣️', color: 'from-slate-400 to-slate-600', payout: { 3: 0.8, 4: 2, 5: 4 } },
  { id: 'card_j', name: 'Card J', icon: '♦️', color: 'from-slate-400 to-slate-600', payout: { 3: 0.5, 4: 1.2, 5: 2.5 } },
];

export function App() {
  const [balance, setBalance] = useState<number>(1000.00);
  const [bet, setBet] = useState<number>(2.00);
  const [win, setWin] = useState<number>(0.00);

  // Dynamic Grid Dimensions (3x3, 5x4, 6x6)
  const [gridMode, setGridMode] = useState<'standard' | 'drinkme' | 'eatme'>('standard');
  const [cols, setCols] = useState<number>(5);
  const [rows, setRows] = useState<number>(4);

  const [grid, setGrid] = useState<SymbolDef[][]>([]);
  const [winningCoords, setWinningCoords] = useState<[number, number][]>([]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1);

  // Free Spins & Tea Party Mode
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(0);
  const [isTeaPartyActive, setIsTeaPartyActive] = useState<boolean>(false);
  const [teaPartyMultiplier, setTeaPartyMultiplier] = useState<number>(1);

  // Provably Fair State
  const [serverSeed, setServerSeed] = useState<string>(generateServerSeed());
  const [clientSeed, setClientSeed] = useState<string>('alice-madness-2026');
  const [nonce, setNonce] = useState<number>(1);
  const [showPFModal, setShowPFModal] = useState<boolean>(false);
  const [lastPFResult, setLastPFResult] = useState<ProvablyFairResult | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    generateGrid(5, 4);
  }, []);

  const getRandomAliceSymbol = (floatVal: number): SymbolDef => {
    if (floatVal < 0.05) return ALICE_SYMBOLS.find(s => s.id === 'rabbit')!;
    if (floatVal < 0.12) return ALICE_SYMBOLS.find(s => s.id === 'cheshire')!;
    if (floatVal < 0.18) return ALICE_SYMBOLS.find(s => s.id === 'drinkme')!;
    if (floatVal < 0.24) return ALICE_SYMBOLS.find(s => s.id === 'eatme')!;
    if (floatVal < 0.35) return ALICE_SYMBOLS.find(s => s.id === 'hatter')!;
    if (floatVal < 0.48) return ALICE_SYMBOLS.find(s => s.id === 'queen')!;
    if (floatVal < 0.60) return ALICE_SYMBOLS.find(s => s.id === 'mushroom')!;
    if (floatVal < 0.72) return ALICE_SYMBOLS.find(s => s.id === 'teapot')!;
    if (floatVal < 0.82) return ALICE_SYMBOLS.find(s => s.id === 'card_a')!;
    if (floatVal < 0.90) return ALICE_SYMBOLS.find(s => s.id === 'card_k')!;
    if (floatVal < 0.96) return ALICE_SYMBOLS.find(s => s.id === 'card_q')!;
    return ALICE_SYMBOLS.find(s => s.id === 'card_j')!;
  };

  const generateGrid = (targetCols: number, targetRows: number) => {
    const pf = calculateProvablyFair(serverSeed, clientSeed, nonce, targetCols * targetRows);
    const newGrid: SymbolDef[][] = [];
    let idx = 0;
    for (let c = 0; c < targetCols; c++) {
      const col: SymbolDef[] = [];
      for (let r = 0; r < targetRows; r++) {
        col.push(getRandomAliceSymbol(pf.floats[idx % pf.floats.length]));
        idx++;
      }
      newGrid.push(col);
    }
    setGrid(newGrid);
    setCols(targetCols);
    setRows(targetRows);
  };

  const handleSpin = async (customBet?: number) => {
    if (isSpinning) return;
    const activeBet = customBet !== undefined ? customBet : bet;

    if (!isTeaPartyActive && balance < activeBet) {
      alert("Solde insuffisant pour la mise au Pays des Merveilles !");
      return;
    }

    setIsSpinning(true);
    setWinningCoords([]);
    setWin(0.00);

    if (!isTeaPartyActive) {
      setBalance(prev => prev - activeBet);
    }

    // Provably Fair Spin
    const pfResult = calculateProvablyFair(serverSeed, clientSeed, nonce, cols * rows);
    setLastPFResult(pfResult);
    setNonce(prev => prev + 1);

    aliceAudio.playSpinSound();

    // Generate Spin Grid
    const newGrid: SymbolDef[][] = [];
    let idx = 0;
    let drinkMeCount = 0;
    let eatMeCount = 0;
    let rabbitCount = 0;

    for (let c = 0; c < cols; c++) {
      const col: SymbolDef[] = [];
      for (let r = 0; r < rows; r++) {
        const sym = getRandomAliceSymbol(pfResult.floats[idx % pfResult.floats.length]);
        if (sym.isDrinkMe) drinkMeCount++;
        if (sym.isEatMe) eatMeCount++;
        if (sym.isScatter) rabbitCount++;
        col.push(sym);
        idx++;
      }
      newGrid.push(col);
    }

    await new Promise(res => setTimeout(res, 500));
    setGrid(newGrid);
    aliceAudio.playStopSound();

    // Dynamic Geometry Trigger (Drink Me / Eat Me Potion Effects)
    if (drinkMeCount >= 2 && gridMode !== 'drinkme') {
      setGridMode('drinkme');
      aliceAudio.playMagicPotionSound(false);
      generateGrid(3, 3);
    } else if (eatMeCount >= 2 && gridMode !== 'eatme') {
      setGridMode('eatme');
      aliceAudio.playMagicPotionSound(true);
      generateGrid(6, 6);
    }

    // Evaluate Win Matchings
    let spinWin = 0;
    const winSet = new Set<string>();

    // Horizontal & Vertical Cluster Pay logic
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const sym = newGrid[c][r];
        if (sym.isWild || sym.isScatter || sym.isDrinkMe || sym.isEatMe) continue;

        // Check Horizontal 3-in-a-row
        if (c <= cols - 3 && (newGrid[c+1][r].id === sym.id || newGrid[c+1][r].isWild) && (newGrid[c+2][r].id === sym.id || newGrid[c+2][r].isWild)) {
          spinWin += sym.payout[3] * (activeBet / 10);
          winSet.add(`${c},${r}`); winSet.add(`${c+1},${r}`); winSet.add(`${c+2},${r}`);
        }
      }
    }

    // Free Spins Trigger (3+ Rabbits)
    if (rabbitCount >= 3 && !isTeaPartyActive) {
      setIsTeaPartyActive(true);
      setFreeSpinsLeft(10);
      setTeaPartyMultiplier(5);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });
      aliceAudio.playWinMadness(50);
    }

    const mult = isTeaPartyActive ? teaPartyMultiplier : (gridMode === 'drinkme' ? 5 : (gridMode === 'eatme' ? 3 : 1));
    const finalWin = spinWin * mult;

    if (finalWin > 0) {
      setWin(finalWin);
      setBalance(prev => prev + finalWin);
      setWinningCoords(Array.from(winSet).map(s => s.split(',').map(Number) as [number, number]));
      aliceAudio.playWinMadness(finalWin / activeBet);
      if (finalWin / activeBet >= 15) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }

    setIsSpinning(false);

    if (isTeaPartyActive) {
      if (freeSpinsLeft - 1 <= 0) {
        setIsTeaPartyActive(false);
        setFreeSpinsLeft(0);
      } else {
        setFreeSpinsLeft(prev => prev - 1);
        setTeaPartyMultiplier(prev => prev * 2);
      }
    }
  };

  const handleBuyMadness = () => {
    const cost = bet * 100;
    if (balance < cost) {
      alert("Solde insuffisant pour acheter le Mad Tea Party !");
      return;
    }
    if (confirm(`Acheter le Mad Tea Party (10 Free Spins) pour ${cost.toFixed(2)} $ ?`)) {
      setBalance(prev => prev - cost);
      setIsTeaPartyActive(true);
      setFreeSpinsLeft(10);
      setTeaPartyMultiplier(5);
      handleSpin(bet);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0514] text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 glass-panel-wonderland bg-[#0f071d]/90 border-b border-purple-500/30 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center font-bold text-white shadow-lg text-xl">
              🎩
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white font-display tracking-wider flex items-center space-x-2">
                <span>MAD ALICE</span>
                <span className="text-[10px] text-purple-300 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-600/40 font-mono">WONDERLAND MATRIX</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono">GÉOMÉTRIE VARIABLE & PROVABLY FAIR STAKE</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            
            {/* Mode Grille Indicator */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-purple-500/40 text-xs font-mono">
              <Layers className="w-4 h-4 text-purple-400" />
              <span className="text-slate-300">Grille : <strong className="text-purple-300 uppercase">{gridMode} ({cols}x{rows})</strong></span>
            </div>

            {/* Balance Box */}
            <div className="px-4 py-2 rounded-xl bg-slate-950 border border-purple-500/30 flex items-center space-x-3">
              <DollarSign className="w-4 h-4 text-purple-400" />
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-mono block leading-none">Solde Merveilles</span>
                <span className="text-base font-extrabold font-mono-casino text-purple-300">{balance.toFixed(2)} $</span>
              </div>
            </div>

            <button onClick={() => setShowPFModal(true)} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </button>

            <button onClick={() => setIsMuted(aliceAudio.toggleMute())} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-purple-400">
              {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-purple-400" />}
            </button>

          </div>

        </div>
      </header>

      {/* CORE MATRIX STAGE */}
      <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col justify-center space-y-6">
        
        {/* BANNER MAD MULTIPLIER & FREE SPINS */}
        <div className="flex items-center justify-between glass-panel-wonderland p-4 rounded-2xl border border-purple-500/40">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-purple-950 border border-purple-800 text-purple-400">
              <Wand2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Multiplicateur du Chapeautier</span>
              <span className="text-2xl font-black font-mono-casino text-purple-400">
                x{isTeaPartyActive ? teaPartyMultiplier : (gridMode==='drinkme'?5:gridMode==='eatme'?3:1)}
              </span>
            </div>
          </div>

          {isTeaPartyActive ? (
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider font-mono flex items-center space-x-2 animate-bounce shadow-lg shadow-purple-500/30">
              <Coffee className="w-4 h-4" />
              <span>MAD TEA PARTY : {freeSpinsLeft} SPINS RESTANTS</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-4 text-xs font-mono text-slate-400">
              <span>Drink Me: <strong className="text-rose-400">Rétrécit à 3x3 (Multiplicateurs MAX)</strong></span>
              <span>•</span>
              <span>Eat Me: <strong className="text-emerald-400">Étend à 6x6 (Giant Clusters)</strong></span>
            </div>
          )}

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Gain Dernier Spin</span>
            <span className="text-2xl font-black font-mono-casino text-emerald-400">
              +{win.toFixed(2)} $
            </span>
          </div>
        </div>

        {/* DYNAMIC MATRIX GRID */}
        <div className="glass-panel-wonderland p-4 sm:p-6 rounded-3xl border border-purple-500/40 shadow-2xl relative">
          
          <div className={`grid gap-2 sm:gap-3 bg-[#07030e] p-4 rounded-2xl border border-purple-900/60 ${cols===3?'grid-cols-3':cols===6?'grid-cols-6':'grid-cols-5'}`}>
            {grid.map((col, cIdx) => (
              <div key={cIdx} className="space-y-2 sm:space-y-3">
                {col.map((symbol, rIdx) => {
                  const isWinning = winningCoords.some(([c, r]) => c === cIdx && r === rIdx);
                  return (
                    <div
                      key={rIdx}
                      className={`
                        symbol-card-wonderland p-3 sm:p-4 rounded-2xl border flex flex-col items-center justify-center select-none relative
                        ${isWinning ? 'bg-purple-950/90 border-pink-400 symbol-win-madness z-10' : 'bg-slate-900/90 border-purple-950/80'}
                        ${isSpinning ? 'reel-spinning-alice' : ''}
                      `}
                    >
                      <span className="text-3xl sm:text-4xl filter drop-shadow-lg">{symbol.icon}</span>
                      <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter truncate max-w-full">
                        {symbol.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

        </div>

        {/* CONTROLS */}
        <div className="glass-panel-wonderland p-4 sm:p-6 rounded-3xl border border-purple-500/30 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          <div className="md:col-span-4 space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase font-mono block">Mise Merveilleuse ($)</span>
            <div className="flex items-center space-x-2">
              <button onClick={() => setBet(prev => Math.max(0.20, prev / 2))} className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold font-mono text-slate-300">½</button>
              <input
                type="number"
                min="0.20"
                max="500"
                step="0.50"
                value={bet}
                onChange={e => setBet(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-center font-mono-casino font-bold text-purple-400 focus:outline-none focus:border-purple-500"
              />
              <button onClick={() => setBet(prev => Math.min(500, prev * 2))} className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold font-mono text-slate-300">2x</button>
              <button onClick={() => setBet(500)} className="px-3 py-2 bg-purple-950 hover:bg-purple-900 border border-purple-700/50 rounded-xl text-xs font-bold font-mono text-purple-400">MAX</button>
            </div>
          </div>

          <div className="md:col-span-4">
            <button
              onClick={handleBuyMadness}
              disabled={isSpinning || isTeaPartyActive}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider font-mono shadow-lg shadow-purple-500/20 border border-pink-400/30 flex flex-col items-center justify-center transition-all disabled:opacity-50"
            >
              <div className="flex items-center space-x-1.5">
                <Coffee className="w-4 h-4 text-amber-300" />
                <span>ACHETER MAD TEA PARTY</span>
              </div>
              <span className="text-[10px] text-pink-200 font-normal">{(bet * 100).toFixed(2)} $ (10 Free Spins)</span>
            </button>
          </div>

          <div className="md:col-span-4">
            <button
              onClick={() => handleSpin()}
              disabled={isSpinning}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-500 hover:to-pink-500 text-white font-black text-base uppercase tracking-widest font-mono-casino shadow-xl shadow-purple-500/40 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 active:scale-95"
            >
              <RotateCcw className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'ENCHANTEMENT...' : 'TOURNER (SPIN)'}</span>
            </button>
          </div>

        </div>

      </main>

      {/* PROVABLY FAIR MODAL */}
      {showPFModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel-wonderland max-w-xl w-full p-6 rounded-3xl border border-purple-500/40 space-y-6 relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-bold text-white font-display">Inspecteur Cryptographique Provably Fair</h3>
              </div>
              <button onClick={() => setShowPFModal(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-mono uppercase block">Empreinte Hachée Server Seed</label>
                <input type="text" readOnly value={hashServerSeed(serverSeed)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-purple-400 font-mono truncate" />
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

            <button onClick={() => setShowPFModal(false)} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase font-mono rounded-xl">Fermer l'Inspecteur</button>
          </div>
        </div>
      )}

      <footer className="border-t border-purple-950 bg-[#07030e] py-4 px-6 text-center text-xs text-slate-500 font-mono">
        MAD ALICE WONDERLAND MATRIX • STAKE.COM CERTIFIED PROVABLY FAIR • 18+
      </footer>

    </div>
  );
}

export default App;
