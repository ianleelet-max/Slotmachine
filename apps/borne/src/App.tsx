import React, { useState } from 'react';
import { NetworkTopBanner } from './components/layout/NetworkTopBanner';
import { LegalBanner } from './components/layout/LegalBanner';
import { Header, ActiveTab } from './components/layout/Header';
import { FundamentalPhrases } from './components/layout/FundamentalPhrases';
import { DiagnosticModal } from './components/registre/DiagnosticModal';
import { ModuleRegistre } from './components/registre/ModuleRegistre';
import { ModuleDossier } from './components/dossier/ModuleDossier';
import { ModuleMiroir } from './components/miroir/ModuleMiroir';
import { ModulePlace } from './components/place/ModulePlace';
import { ModuleEtalon } from './components/etalon/ModuleEtalon';
import { ModuleStrategie } from './components/strategie/ModuleStrategie';
import { WhatBorneNeverDoes } from './components/ethics/WhatBorneNeverDoes';

// Helper to parse active tab from pathname or hash (e.g. powai.ca/borne/strategie or powai.ca/borne#strategie)
function getTabFromUrl(): ActiveTab {
  if (typeof window === 'undefined') return 'registre';
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase().replace('#', '');

  const target = hash || path.split('/').filter(Boolean).pop() || '';

  if (target === 'strategie' || target === 'dossier-strategique' || target === 'livre-blanc') return 'strategie';
  if (target === 'dossier' || target === 'poste-arpenteur') return 'dossier';
  if (target === 'miroir' || target === 'transparence') return 'miroir';
  if (target === 'place' || target === 'marche') return 'place';
  if (target === 'etalon' || target === 'double-aveugle') return 'etalon';
  if (target === 'ethique' || target === 'limites' || target === 'principes') return 'ethique';
  if (target === 'diagnostic') return 'registre'; // diagnostic opens as modal

  return 'registre';
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => getTabFromUrl());
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.location.hash === '#diagnostic' || window.location.pathname.endsWith('/diagnostic');
  });

  // Handle Tab Change with URL sync (supporting powai.ca/borne/[tab] and hash fallback)
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const basePath = window.location.pathname.includes('/borne') ? '/borne' : '';
      const newPath = tab === 'registre' ? `${basePath}/` : `${basePath}/${tab}`;
      try {
        window.history.pushState({ tab }, '', newPath);
      } catch {
        window.location.hash = tab;
      }
    }
  };

  // Sync on browser back / forward navigation
  React.useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromUrl();
      setActiveTab(tab);
      if (window.location.hash === '#diagnostic' || window.location.pathname.endsWith('/diagnostic')) {
        setIsDiagnosticOpen(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Apply theme to html root
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleNavigateFromDiagnostic = (module: 'registre' | 'place') => {
    handleTabChange(module);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {/* 0. Unified PowAI Network Switcher Banner */}
      <NetworkTopBanner 
        currentApp={activeTab === 'strategie' ? 'strategie' : 'borne'} 
        onNavigateTab={(tab) => handleTabChange(tab as ActiveTab)} 
      />

      {/* 1. Permanent Mandatory Legal Banner */}
      <LegalBanner lang={lang} />

      {/* 2. Institutional Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
      />

      {/* 3. Main Content Container */}
      <main style={{ flex: 1, padding: '2rem 0' }}>
        <div className="borne-container">
          {/* Always display the 4 Fundamental Legal Quotes on top of modules */}
          <FundamentalPhrases lang={lang} />

          {/* Module 1 — Registre */}
          {activeTab === 'registre' && (
            <ModuleRegistre
              lang={lang}
              onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
            />
          )}

          {/* Module 2 — Dossier (Poste Arpenteur) */}
          {activeTab === 'dossier' && (
            <ModuleDossier lang={lang} />
          )}

          {/* Module 3 — Miroir (Transparence Publique) */}
          {activeTab === 'miroir' && (
            <ModuleMiroir lang={lang} />
          )}

          {/* Module 4 — Place (Place de Marché) */}
          {activeTab === 'place' && (
            <ModulePlace lang={lang} />
          )}

          {/* Module 5 — Étalon (Double-aveugle) */}
          {activeTab === 'etalon' && (
            <ModuleEtalon lang={lang} />
          )}

          {/* Module Stratégique — Dossier & Livre Blanc */}
          {activeTab === 'strategie' && (
            <ModuleStrategie 
              lang={lang} 
              onNavigateToModule={(mod) => setActiveTab(mod as ActiveTab)} 
            />
          )}

          {/* Principes & Limites (Section 12) */}
          {activeTab === 'ethique' && (
            <WhatBorneNeverDoes lang={lang} />
          )}
        </div>
      </main>

      {/* 4. Free 90-Second Diagnostic Modal */}
      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        lang={lang}
        onNavigateToModule={handleNavigateFromDiagnostic}
      />

      {/* 5. Institutional Footer */}
      <footer style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)', padding: '2.5rem 0', marginTop: '3rem', fontSize: '0.85rem' }}>
        <div className="borne-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ maxWidth: '420px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>BORNE</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--qc-blue)' }}>QUÉBEC</span>
              </div>
              <p style={{ color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                Plateforme québécoise de réutilisation, d'automatisation et de transparence du certificat de localisation. 
                Ce qui a déjà été mesuré n'a pas à être remesuré.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Conformité & Droit</strong>
                <ul style={{ listStyle: 'none', color: 'var(--text-tertiary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>
                    <button 
                      onClick={() => handleTabChange('strategie')}
                      style={{ background: 'none', border: 'none', padding: 0, color: 'var(--qc-blue)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                    >
                      ★ Dossier Stratégique (Livre Blanc)
                    </button>
                  </li>
                  <li>Loi sur les arpenteurs-géomètres (RLRQ c. A-23)</li>
                  <li>Norme A-23 r. 10</li>
                  <li>Loi 25 (Données personnelles QC)</li>
                  <li>Hébergement souverain au Québec</li>
                </ul>
              </div>

              <div>
                <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Sources Officielles</strong>
                <ul style={{ listStyle: 'none', color: 'var(--text-tertiary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>Infolot / Cadastre officiel</li>
                  <li>Registre foncier du Québec</li>
                  <li>Données Québec (LiDAR 1m)</li>
                  <li>Ordre des arpenteurs-géomètres (OAGQ)</li>
                </ul>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
            <span>© 2026 BORNE Québec. Tous droits réservés. Outil d'aide à la décision conforme aux normes de l'OAGQ.</span>
            <span>WCAG 2.2 AA • Chiffrement SHA-256</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
