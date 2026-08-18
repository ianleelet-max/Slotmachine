import React, { useState } from 'react';
import { Download, Maximize2, Sparkles, Clock, Copy, Check, ExternalLink } from 'lucide-react';
import { GeneratedImage } from '../../types/comfy';

interface OutputGalleryProps {
  images: GeneratedImage[];
}

export const OutputGallery: React.FC<OutputGalleryProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPrompt = (img: GeneratedImage) => {
    navigator.clipboard.writeText(img.prompt);
    setCopiedId(img.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (images.length === 0) {
    return (
      <div className="p-12 text-center bg-[#0f172a] rounded-3xl border border-slate-800 space-y-3">
        <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center mx-auto text-purple-400 border border-slate-800">
          <Sparkles size={28} />
        </div>
        <h3 className="text-lg font-bold text-white">Aucun rendu dans la galerie</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Vos images générées avec Flux, SDXL et vos workflows ComfyUI s'afficheront ici en haute définition.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img) => (
          <div
            key={img.id}
            className="group rounded-3xl bg-[#0f172a] border border-slate-800 overflow-hidden shadow-xl hover:border-purple-500/50 transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-square overflow-hidden bg-slate-950">
              <img
                src={img.url}
                alt={img.prompt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 justify-between">
                <button
                  onClick={() => setSelectedImage(img)}
                  className="p-2 rounded-xl bg-black/60 backdrop-blur-md text-white hover:bg-purple-600 transition-all"
                  title="Agrandir"
                >
                  <Maximize2 size={16} />
                </button>

                <a
                  href={img.url}
                  download={`comfy_${img.seed}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-black/60 backdrop-blur-md text-white hover:bg-cyan-500 hover:text-slate-950 transition-all"
                  title="Télécharger l'image HD"
                >
                  <Download size={16} />
                </a>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-medium">
                {img.prompt}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800">
                <span>{img.checkpoint}</span>
                <span className="text-emerald-400">{img.executionTimeMs}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Zoom Plein Écran */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6" onClick={() => setSelectedImage(null)}>
          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.url}
              alt={selectedImage.prompt}
              className="max-h-[75vh] w-auto rounded-2xl shadow-2xl border border-slate-700"
            />
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 max-w-2xl text-center space-y-2">
              <p className="text-xs text-slate-200">{selectedImage.prompt}</p>
              <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 font-mono">
                <span>Seed: {selectedImage.seed}</span>
                <span>•</span>
                <span>Modèle: {selectedImage.checkpoint}</span>
                <span>•</span>
                <a
                  href={selectedImage.url}
                  download
                  target="_blank"
                  className="text-cyan-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Download size={12} />
                  <span>Télécharger HD</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};