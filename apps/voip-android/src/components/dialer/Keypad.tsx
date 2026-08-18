import React, { useState } from 'react';
import { Phone, Delete, UserPlus, Sparkles, Shield, ChevronDown } from 'lucide-react';
import { playDtmfTone } from '../../audio/dtmfTones';
import { VoipNumber } from '../../types/voip';

interface KeypadProps {
  onStartCall: (number: string) => void;
  activeLine?: VoipNumber;
  purchasedLines: VoipNumber[];
  onSelectLine: (line: VoipNumber) => void;
}

export const Keypad: React.FC<KeypadProps> = ({
  onStartCall,
  activeLine,
  purchasedLines,
  onSelectLine
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showLinePicker, setShowLinePicker] = useState(false);

  const keys = [
    { num: '1', letters: '' },
    { num: '2', letters: 'ABC' },
    { num: '3', letters: 'DEF' },
    { num: '4', letters: 'GHI' },
    { num: '5', letters: 'JKL' },
    { num: '6', letters: 'MNO' },
    { num: '7', letters: 'PQRS' },
    { num: '8', letters: 'TUV' },
    { num: '9', letters: 'WXYZ' },
    { num: '*', letters: '' },
    { num: '0', letters: '+' },
    { num: '#', letters: '' }
  ];

  const handleKeyPress = (key: string) => {
    playDtmfTone(key);
    setPhoneNumber((prev) => prev + key);
  };

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPhoneNumber('');
  };

  const handleCall = () => {
    if (!phoneNumber.trim()) return;
    onStartCall(phoneNumber.trim());
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-sm mx-auto w-full px-4 py-2">
      
      {/* Sélecteur de Ligne Sortante Active */}
      <div className="relative mb-2">
        <button
          onClick={() => setShowLinePicker(!showLinePicker)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 text-xs transition-all"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{activeLine?.flag || '🇨🇦'}</span>
            <div className="text-left">
              <p className="text-[10px] text-slate-400 font-mono uppercase">Ligne sortante active :</p>
              <p className="font-bold text-white font-mono">{activeLine?.number || '+1 (514) 800-POW1'} ({activeLine?.region || 'Montréal, QC'})</p>
            </div>
          </div>
          <ChevronDown size={14} className="text-slate-400" />
        </button>

        {showLinePicker && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-2 z-40 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">Choisir une ligne VoIP :</p>
            {purchasedLines.map((line) => (
              <button
                key={line.id}
                onClick={() => {
                  onSelectLine(line);
                  setShowLinePicker(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-all ${
                  line.id === activeLine?.id ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'hover:bg-slate-900 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{line.flag}</span>
                  <span className="font-mono">{line.number}</span>
                </div>
                <span className="text-[10px] text-slate-400">{line.region}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Affichage du Numéro Saisi */}
      <div className="text-center my-2 min-h-[56px] flex flex-col justify-center relative">
        <div className="text-3xl font-mono font-bold tracking-wider text-white overflow-x-auto whitespace-nowrap px-2">
          {phoneNumber || <span className="text-slate-600 font-sans text-xl font-normal">Composer un numéro...</span>}
        </div>
        {phoneNumber && (
          <button
            onClick={handleClear}
            className="text-[10px] text-slate-400 hover:text-rose-400 uppercase tracking-wider font-semibold mt-1"
          >
            Effacer tout
          </button>
        )}
      </div>

      {/* Grille du Clavier Numérique Android */}
      <div className="grid grid-cols-3 gap-3 my-2">
        {keys.map((k) => (
          <button
            key={k.num}
            onClick={() => handleKeyPress(k.num)}
            className="h-16 rounded-full bg-[#111a2e] hover:bg-[#192642] active:bg-cyan-900/40 active:border-cyan-500/60 border border-slate-800/80 flex flex-col items-center justify-center transition-all android-ripple shadow-sm"
          >
            <span className="text-2xl font-bold font-mono text-slate-100">{k.num}</span>
            {k.letters ? (
              <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-[-2px]">
                {k.letters}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Barre d'Action Appel & Retour */}
      <div className="grid grid-cols-3 items-center my-2 pt-1">
        <div />

        {/* Bouton Appel Vert Fluo Material */}
        <div className="flex justify-center">
          <button
            onClick={handleCall}
            disabled={!phoneNumber.trim()}
            className={`w-18 h-18 rounded-full flex items-center justify-center transition-all android-ripple p-4 shadow-lg ${
              phoneNumber.trim()
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold glow-green scale-105 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Phone size={28} className="fill-current" />
          </button>
        </div>

        {/* Bouton Effacer Retour */}
        <div className="flex justify-center">
          {phoneNumber.length > 0 && (
            <button
              onClick={handleBackspace}
              className="p-3.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 active:scale-90 transition-all android-ripple"
              title="Effacer le dernier chiffre"
            >
              <Delete size={22} />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};