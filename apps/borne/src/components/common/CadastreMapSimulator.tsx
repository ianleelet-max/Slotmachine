import React, { useState } from 'react';
import { Layers, Eye, ShieldAlert, Sparkles, MapPin, ZoomIn, ZoomOut, Compass } from 'lucide-react';

interface CadastreMapSimulatorProps {
  lang: 'fr' | 'en';
  lotNumber?: string;
  cadastreTolerance?: string;
  surveyTolerance?: string;
}

export const CadastreMapSimulator: React.FC<CadastreMapSimulatorProps> = ({
  lang,
  lotNumber = '3 412 884',
  cadastreTolerance = '± 15-30 cm',
  surveyTolerance = '± 2-3 cm',
}) => {
  const [activeLayer, setActiveLayer] = useState<'cadastre' | 'ortho2015' | 'ortho2026' | 'lidar' | 'diff'>('diff');
  const [showServitude, setShowServitude] = useState(true);
  const [showSetbacks, setShowSetbacks] = useState(true);
  const [showFence, setShowFence] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  return (
    <div className="borne-card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)' }}>
      {/* Map Control Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="borne-badge badge-blue">MTM Fuseau 7 (SCRS-NAD83)</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Lot {lotNumber} • Lévis (QC)</span>
          </div>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
            {lang === 'fr' ? 'Superposition Géospatiale Multi-Temporelle' : 'Multi-Temporal Geospatial Overlay'}
          </h4>
        </div>

        {/* Layer Selectors */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {[
            { id: 'diff', label: lang === 'fr' ? 'Différentiel 2015 vs 2026' : '2015 vs 2026 Diff' },
            { id: 'lidar', label: 'LiDAR 1m MNT' },
            { id: 'ortho2026', label: 'Ortho 2026' },
            { id: 'cadastre', label: 'Cadastre Infolot' },
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id as any)}
              className={`btn ${activeLayer === layer.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map Canvas Simulator */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '380px',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: activeLayer === 'lidar' ? '#1e293b' : '#f1f5f9',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* SVG Drawing of the Property Lot */}
        <svg
          viewBox="0 0 600 400"
          style={{
            width: '100%',
            height: '100%',
            transform: `scale(${zoomLevel})`,
            transition: 'transform 0.2s ease',
          }}
        >
          {/* Background Grid (MTM 5m intervals) */}
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke={activeLayer === 'lidar' ? '#334155' : '#e2e8f0'} strokeWidth="0.8" />
            </pattern>
            {/* Gradient for LiDAR elevation */}
            <linearGradient id="lidarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#064e3b" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          <rect width="600" height="400" fill="url(#grid)" />

          {/* Adjacent lots */}
          <path d="M 50 20 L 150 20 L 150 360 L 50 360 Z" fill="none" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1" />
          <text x="75" y="190" fill="#94a3b8" fontSize="11" transform="rotate(-90 75 190)">Lot 3 412 883</text>

          <path d="M 450 20 L 550 20 L 550 360 L 450 360 Z" fill="none" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1" />
          <text x="500" y="190" fill="#94a3b8" fontSize="11" transform="rotate(90 500 190)">Lot 3 412 885</text>

          {/* SUBJECT LOT (Lot 3 412 884) */}
          {/* Boundary Polygon */}
          <polygon
            points="150,40 450,40 450,340 150,340"
            fill={activeLayer === 'lidar' ? 'url(#lidarGrad)' : activeLayer === 'diff' ? '#ecfdf5' : '#ffffff'}
            fillOpacity={activeLayer === 'lidar' ? 0.35 : 0.8}
            stroke="#0f4c81"
            strokeWidth="2.5"
          />

          {/* Front street */}
          <line x1="100" y1="360" x2="500" y2="360" stroke="#64748b" strokeWidth="3" />
          <text x="230" y="380" fill="#475569" fontSize="12" fontWeight="bold">Rue des Sorbiers (Emprise publique)</text>

          {/* Rear Servitude Zone (Hydro-Québec & Bell) */}
          {showServitude && (
            <g>
              <rect x="150" y="40" width="300" height="45" fill="#fef08a" fillOpacity="0.4" stroke="#eab308" strokeWidth="1" strokeDasharray="4 2" />
              <text x="180" y="66" fill="#854d0e" fontSize="10" fontWeight="bold">
                Servitude Hydro-Québec & Bell (#9 812 004 — Emprise 3.0 m)
              </text>
            </g>
          )}

          {/* Municipal Setback Lines (Marges prescrites) */}
          {showSetbacks && (
            <polygon
              points="180,100 400,100 400,280 180,280"
              fill="none"
              stroke="#d97706"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          )}

          {/* 2015 Building Footprint (Base) */}
          <rect
            x="200"
            y="130"
            width="180"
            height="110"
            rx="4"
            fill={activeLayer === 'diff' ? '#0284c7' : '#0f4c81'}
            fillOpacity="0.85"
            stroke="#0f172a"
            strokeWidth="1.5"
          />
          <text x="240" y="185" fill="#ffffff" fontSize="12" fontWeight="bold">
            Bâtiment Résidentiel
          </text>
          <text x="250" y="202" fill="#e0f2fe" fontSize="10">
            142.4 m² (1 étage)
          </text>

          {/* Attached Garage */}
          <rect
            x="380"
            y="150"
            width="40"
            height="90"
            fill={activeLayer === 'diff' ? '#0369a1' : '#1e3a8a'}
            stroke="#0f172a"
            strokeWidth="1"
          />
          <text x="390" y="200" fill="#ffffff" fontSize="9" transform="rotate(90 390 200)">Garage</text>

          {/* 2026 Detection Indicator (0 Delta Green outline) */}
          {activeLayer === 'diff' && (
            <rect
              x="198"
              y="128"
              width="224"
              height="114"
              rx="6"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
          )}

          {/* Lateral Mitoyen Fence */}
          {showFence && (
            <g>
              <line x1="452" y1="40" x2="452" y2="340" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="452" cy="180" r="3" fill="#f43f5e" />
              <text x="458" y="185" fill="#e11d48" fontSize="9" fontWeight="bold">
                Clôture (4 cm intérieur)
              </text>
            </g>
          )}

          {/* Dimensions Labels */}
          {/* Front */}
          <text x="270" y="335" fill="#0f4c81" fontSize="11" fontWeight="bold">20.00 m (Façade)</text>
          {/* Rear */}
          <text x="270" y="32" fill="#0f4c81" fontSize="11" fontWeight="bold">20.01 m (Arrière)</text>
          {/* Left depth */}
          <text x="110" y="195" fill="#0f4c81" fontSize="11" fontWeight="bold" transform="rotate(-90 110 195)">34.21 m (Nord-Ouest)</text>
          {/* Right depth */}
          <text x="475" y="195" fill="#0f4c81" fontSize="11" fontWeight="bold" transform="rotate(90 475 195)">34.20 m (Sud-Est)</text>

          {/* Setback distances */}
          <line x1="290" y1="240" x2="290" y2="340" stroke="#059669" strokeWidth="1" strokeDasharray="2 2" />
          <text x="295" y="295" fill="#059669" fontSize="10" fontWeight="bold">Marge avant: 7.20 m (min 6.0 m)</text>

          <line x1="290" y1="40" x2="290" y2="130" stroke="#059669" strokeWidth="1" strokeDasharray="2 2" />
          <text x="295" y="95" fill="#059669" fontSize="10" fontWeight="bold">Marge arrière: 12.80 m (min 7.5 m)</text>
        </svg>

        {/* Floating Zoom & Legend Overlay */}
        <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-secondary)', padding: '0.35rem', borderRadius: '6px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
          <button onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: 'var(--text-primary)' }} title="Zoomer">
            <ZoomIn size={16} />
          </button>
          <button onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.15))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: 'var(--text-primary)' }} title="Dézoomer">
            <ZoomOut size={16} />
          </button>
          <button onClick={() => setZoomLevel(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: 'var(--text-primary)', fontSize: '0.7rem', fontWeight: 700 }} title="Réinitialiser">
            1:1
          </button>
        </div>

        {/* Status Chip */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', backgroundColor: 'var(--status-green-bg)', border: '1px solid var(--status-green-border)', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-green)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Sparkles size={14} />
          <span>Différentiel volumétrique : 0.00 m² (Strictement superposable)</span>
        </div>
      </div>

      {/* Layer Toggles */}
      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.85rem', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={showServitude} onChange={(e) => setShowServitude(e.target.checked)} />
          <span>Servitude Hydro/Bell (3.0 m)</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={showSetbacks} onChange={(e) => setShowSetbacks(e.target.checked)} />
          <span>Marges de recul prescrites (Zonage H-204)</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={showFence} onChange={(e) => setShowFence(e.target.checked)} />
          <span>Clôture mitoyenne (4 cm)</span>
        </label>
      </div>
    </div>
  );
};
