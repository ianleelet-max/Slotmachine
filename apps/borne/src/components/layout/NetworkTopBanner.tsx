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
  FileText,
  AlertTriangle
} from 'lucide-react';

interface NetworkTopBannerProps {
  currentApp?: 'borne' | 'strategie' | 'sursitrack' | 'auditreq' | 'notaria' | 'home' | 'saadeklic';
  onNavigateTab?: (tab: string) => void;
}

export const NetworkTopBanner: React.FC<NetworkTopBannerProps> = ({ 
  currentApp = 'borne',
  onNavigateTab
}) => {
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
      desc: 'Plateforme québécoise du certificat de localisation',
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
      id: 'tel',
      name: 'PowAI TEL',
      badge: 'VoIP Android',
      url: 'https://powai.ca/tel',
      isLocalTab: false,
      icon: '📱',
      color: '#06b6d4',
      desc: 'Téléphonie & messagerie IP ultra-simpliste pour Android',
    },
    {
      id: 'tel-admin',
      name: 'TEL Admin',
      badge: 'VoIP.ms Carrier',
      url: 'https://powai.ca/tel-admin',
      isLocalTab: false,
      icon: '🏢',
      color: '#f59e0b',
      desc: 'Console de gestion de flotte DID & interconnexion VoIP.ms',
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
    },
    {
      id: 'saadeklic',
      name: 'SAAQ$$$clic (Anti-Modèle)',
      badge: 'Contre-Exemple Fiasco 1.2 Md$',
      url: 'https://powai.ca/saadeklic',
      isLocalTab: false,
      icon: '🎰',
      color: '#f43f5e',
      desc: 'Démonstration satirique des dérives traditionnelles à ne jamais reproduire',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.04em' }}>
            <Sparkles size={13} className="text-cyan-400" />
            <span style={{ textTransform: 'uppercase' }}>PowAI.ca</span>
            <span style={{ color: '#64748b', fontWeight: 500 }}>Écosystème :</span>
          </div>

          {/* Quick inline app switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            {sites.map((site) => {
              const isCurrent = (currentApp === site.id);
              const isWarning = (site.id === 'saadeklic');
              return (
                <a
                  key={site.id}
                  href={site.url}
                  title={site.desc}
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
                    backgroundColor: isCurrent ? 'rgba(56, 189, 248, 0.18)' : (isWarning ? 'rgba(244, 63, 94, 0.12)' : '#0f172a'),
                    border: isCurrent ? '1px solid rgba(56, 189, 248, 0.45)' : (isWarning ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid #1e293b'),
                    color: isCurrent ? '#ffffff' : (isWarning ? '#fca5a5' : '#94a3b8'),
                    textDecoration: 'none',
                    fontWeight: isCurrent ? 700 : 500,
                    transition: 'all 0.15s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.backgroundColor = isWarning ? 'rgba(244, 63, 94, 0.25)' : '#1e293b';
                      e.currentTarget.style.color = '#ffffff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCurrent) {
                      e.currentTarget.style.backgroundColor = isWarning ? 'rgba(244, 63, 94, 0.12)' : '#0f172a';
                      e.currentTarget.style.color = isWarning ? '#fca5a5' : '#94a3b8';
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
                        backgroundColor: isCurrent ? site.color : (isWarning ? '#450a0a' : '#1e293b'),
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