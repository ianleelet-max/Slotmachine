import React, { useState } from 'react';
import { 
  Globe, 
  Layers, 
  ExternalLink, 
  ShieldCheck, 
  Scale, 
  BarChart3, 
  BookOpen, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Flame,
  FileText
} from 'lucide-react';

interface NetworkTopBannerProps {
  currentApp?: 'borne' | 'strategie' | 'sursitrack' | 'auditreq' | 'notaria' | 'home';
  onNavigateTab?: (tab: string) => void;
}

export const NetworkTopBanner: React.FC<NetworkTopBannerProps> = ({ 
  currentApp = 'borne',
  onNavigateTab
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const sites = [
    {
      id: 'borne',
      name: 'BORNE Québec',
      badge: 'Foncier & Certificat',
      url: 'https://powai.ca/borne',
      isLocalTab: true,
      tabId: 'registre',
      icon: '⚜️',
      color: '#38bdf8',
      desc: 'Plateforme du certificat de localisation',
    },
    {
      id: 'strategie',
      name: 'Dossier Stratégique',
      badge: 'Livre Blanc 2026',
      url: 'https://powai.ca/borne/strategie',
      isLocalTab: true,
      tabId: 'strategie',
      icon: '📑',
      color: '#f59e0b',
      desc: 'Anatomie du péage & modèle 71.9 M$',
    },
    {
      id: 'sursitrack',
      name: 'SursiTrack + Horizon',
      badge: 'MSP & Biométrie',
      url: 'https://powai.ca/sursitrack',
      isLocalTab: false,
      icon: '🛡️',
      color: '#10b981',
      desc: 'Surveillance et réinsertion judiciaire',
    },
    {
      id: 'auditreq',
      name: 'AudiTREQ',
      badge: 'Graphes & Audit',
      url: 'https://powai.ca/auditreq',
      isLocalTab: false,
      icon: '🔍',
      color: '#8b5cf6',
      desc: 'Analyse d’intégrité corporative',
    },
    {
      id: 'notaria',
      name: 'NotaR-iA',
      badge: 'IA Juridique',
      url: 'https://powai.ca/notaria',
      isLocalTab: false,
      icon: '⚖️',
      color: '#ec4899',
      desc: 'Extraction et examen de titres',
    },
    {
      id: 'home',
      name: 'Portail PowAI.ca',
      badge: 'Hub',
      url: 'https://powai.ca',
      isLocalTab: false,
      icon: '🌐',
      color: '#94a3b8',
      desc: 'Accueil & Écosystème IA',
    }
  ];

  return (
    <div 
      style={{ 
        backgroundColor: '#050b14', 
        borderBottom: '1px solid #1e293b', 
        color: '#e2e8f0', 
        fontSize: '0.78rem',
        zIndex: 110,
        position: 'relative'
      }}
    >
      <div 
        className="borne-container" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0.4rem 1.5rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        {/* Network Brand Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.04em' }}>
            <Sparkles size={13} className="text-cyan-400" />
            <span style={{ textTransform: 'uppercase' }}>PowAI.ca</span>
            <span style={{ color: '#64748b', fontWeight: 500 }}>Suite & Plateformes :</span>
          </div>

          {/* Quick inline app switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            {sites.map((site) => {
              const isCurrent = (currentApp === site.id);
              return (
                <a
                  key={site.id}
                  href={site.url}
                  onClick={(e) => {
                    if (site.isLocalTab && onNavigateTab && site.tabId) {
                      e.preventDefault();
                      onNavigateTab(site.tabId);
                    }
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '5px',
                    backgroundColor: isCurrent ? 'rgba(56, 189, 248, 0.18)' : '#0f172a',
                    border: isCurrent ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid #1e293b',
                    color: isCurrent ? '#ffffff' : '#94a3b8',
                    textDecoration: 'none',
                    fontWeight: isCurrent ? 700 : 500,
                    transition: 'all 0.15s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.backgroundColor = '#1e293b';
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.backgroundColor = '#0f172a';
                      e.currentTarget.style.color = '#94a3b8';
                    }
                  }}
                >
                  <span style={{ fontSize: '0.85rem' }}>{site.icon}</span>
                  <span>{site.name}</span>
                  {site.badge && (
                    <span 
                      style={{ 
                        fontSize: '0.65rem', 
                        padding: '0.05rem 0.35rem', 
                        borderRadius: '3px', 
                        backgroundColor: isCurrent ? site.color : '#1e293b',
                        color: isCurrent ? '#000000' : site.color,
                        fontWeight: 700 
                      }}
                    >
                      {site.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </div>

        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.72rem' }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span>Écosystème actif</span>
        </div>
      </div>
    </div>
  );
};
