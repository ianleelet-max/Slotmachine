import React from 'react';
import { 
  FolderLock, 
  FileCheck2, 
  BarChart3, 
  ShoppingBag, 
  Scale, 
  ShieldCheck, 
  Search,
  Moon,
  Sun,
  Globe,
  BookOpen
} from 'lucide-react';

export type ActiveTab = 'diagnostic' | 'registre' | 'dossier' | 'miroir' | 'place' | 'etalon' | 'ethique' | 'strategie';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  lang: 'fr' | 'en';
  setLang: (lang: 'fr' | 'en') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onOpenDiagnostic: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  theme,
  setTheme,
  onOpenDiagnostic,
}) => {
  const tabs = [
    { id: 'registre', label: lang === 'fr' ? '1. Registre & Coffre-fort' : '1. Vault & Register', icon: FolderLock },
    { id: 'dossier', label: lang === 'fr' ? '2. Poste Arpenteur (Dossier)' : '2. Surveyor Workbench', icon: FileCheck2 },
    { id: 'miroir', label: lang === 'fr' ? '3. Miroir Public' : '3. Public Mirror', icon: BarChart3 },
    { id: 'place', label: lang === 'fr' ? '4. Place de Marché' : '4. Marketplace', icon: ShoppingBag },
    { id: 'etalon', label: lang === 'fr' ? '5. Étalon (Double-aveugle)' : '5. Benchmark & Quality', icon: Scale },
    { id: 'strategie', label: lang === 'fr' ? 'Dossier Stratégique' : 'Strategic Dossier', icon: BookOpen },
    { id: 'ethique', label: lang === 'fr' ? 'Principes & Limites' : 'Ethics & Limits', icon: ShieldCheck },
  ];

  return (
    <header style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
      {/* Top Bar with Brand & Actions */}
      <div className="borne-container" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Logo & Emblem */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
            onClick={() => setActiveTab('registre')}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: 'var(--qc-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.25rem',
                letterSpacing: '-0.05em',
                boxShadow: '0 2px 8px rgba(15, 76, 129, 0.3)',
              }}
            >
              ⚜
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                  BORNE
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--qc-blue)', letterSpacing: '0.05em' }}>
                  Québec
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                {lang === 'fr' 
                  ? 'Ce qui a déjà été mesuré n\'a pas à être remesuré.' 
                  : 'What was already measured does not need to be remeasured.'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Free Diagnostic CTA */}
          <button
            onClick={onOpenDiagnostic}
            className="btn btn-primary"
            style={{ fontSize: '0.825rem', padding: '0.5rem 1rem' }}
          >
            <Search size={16} />
            <span>{lang === 'fr' ? 'Diagnostic gratuit 90s' : 'Free 90s Diagnostic'}</span>
          </button>

          {/* Lang Switcher */}
          <button
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
            title={lang === 'fr' ? 'Passer en anglais' : 'Switch to French'}
          >
            <Globe size={15} />
            <span>{lang === 'fr' ? 'EN' : 'FR (QC)'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="btn btn-secondary"
            style={{ padding: '0.45rem 0.65rem' }}
            title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
            aria-label="Changer de thème"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ borderTop: '1px solid var(--border-light)', overflowX: 'auto' }}>
        <div className="borne-container" style={{ display: 'flex', gap: '0.5rem', padding: '0.25rem 1.5rem' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--qc-blue)' : 'var(--text-secondary)',
                  borderBottom: isActive ? '3px solid var(--qc-blue)' : '3px solid transparent',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
