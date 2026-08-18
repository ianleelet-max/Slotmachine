import React, { useState } from 'react';
import { Download, Smartphone, ShieldCheck, CheckCircle2, X, Sparkles, HelpCircle } from 'lucide-react';

export const ApkDownloadBanner: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  const handleDownload = () => {
    setDownloadStarted(true);
    // Déclencheur direct du téléchargement APK
    const link = document.createElement('a');
    link.href = './powai-tel.apk';
    link.download = 'powai-tel.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setShowModal(true);
      setDownloadStarted(false);
    }, 800);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-b border-cyan-800/40 px-3 py-1.5 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-1.5 truncate">
          <Smartphone size={14} className="text-cyan-400 flex-shrink-0" />
          <span className="text-slate-200 font-semibold truncate">
            Application Native Android disponible en <strong className="text-cyan-300">APK Direct</strong>
          </span>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloadStarted}
          className="flex-shrink-0 ml-2 px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
        >
          <Download size={12} />
          <span>{downloadStarted ? 'Téléchargement...' : 'Télécharger APK'}</span>
        </button>
      </div>

      {/* Modal d'instructions d'installation APK sur Android */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1322] border border-slate-700 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-fadeIn">
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-cyan-950 border border-cyan-600 text-cyan-400">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Installation APK Android</h3>
                  <p className="text-[11px] text-emerald-400 font-medium">Fichier powai-tel.apk prêt</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <p className="text-slate-400">
                Pour installer l'application sur votre appareil Android :
              </p>
              
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <p>
                  Ouvrez le fichier <strong>powai-tel.apk</strong> dans vos téléchargements.
                </p>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <p>
                  Si Android vous le demande, autorisez <em>"Installation d'applications inconnues"</em> pour votre navigateur.
                </p>
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                  3
                </span>
                <p>
                  Touchez <strong>"Installer"</strong> puis lancez <strong>PowAI TEL</strong> directement depuis votre écran d'accueil.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
              >
                Compris, j'installe l'APK
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};