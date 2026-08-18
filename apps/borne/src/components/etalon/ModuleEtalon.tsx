import React, { useState } from 'react';
import { 
  Scale, 
  GitCompare, 
  CheckCircle2, 
  HelpCircle, 
  BarChart2, 
  RotateCw, 
  Sparkles, 
  AlertCircle, 
  ArrowUpRight,
  TrendingUp,
  Cpu,
  UserCheck,
  Check,
  Layers
} from 'lucide-react';
import { MOCK_ECARTS_ETALON } from '../../data/mockData';
import { formatCurrency, formatNumber } from '../../utils/crypto';

interface ModuleEtalonProps {
  lang: 'fr' | 'en';
}

export const ModuleEtalon: React.FC<ModuleEtalonProps> = ({ lang }) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'doubleaveugle' | 'ecarts' | 'economie' | 'boucle'>('doubleaveugle');
  const [sampleSize, setSampleSize] = useState<number>(1420);
  const [patchApplied, setPatchApplied] = useState(false);

  const handleApplyPatch = () => {
    setPatchApplied(true);
    setTimeout(() => setPatchApplied(false), 3500);
  };

  return (
    <div>
      {/* Module Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span className="borne-badge badge-blue">MODULE 5</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
            {lang === 'fr' ? 'La mesure hybride machine vs humain & Double-aveugle' : 'Hybrid Benchmark Machine vs Human'}
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          BORNE ÉTALON
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '800px', marginTop: '0.25rem' }}>
          {lang === 'fr'
            ? 'Mesure scientifique et journalisation des écarts machine-humain, protocole de double aveugle sur 5% des dossiers et publication de la variance entre deux arpenteurs qualifiés sur le même terrain.'
            : 'Scientific measurement and logging of machine-human deltas, 5% double-blind protocol and publication of inter-surveyor divergence rate.'}
        </p>
      </div>

      {/* Sub-navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {[
          { id: 'doubleaveugle', label: lang === 'fr' ? 'Protocole Double-Aveugle (4 Courbes)' : 'Double-Blind Protocol (4 Curves)', icon: GitCompare },
          { id: 'ecarts', label: lang === 'fr' ? 'Journalisation des Écarts' : 'Delta Logging', icon: Scale },
          { id: 'economie', label: lang === 'fr' ? 'Gains Réels Cumulés' : 'Cumulative Real Gains', icon: TrendingUp },
          { id: 'boucle', label: lang === 'fr' ? 'Boucle d\'Amélioration Continue' : 'Feedback Loop', icon: RotateCw },
        ].map((sub) => {
          const Icon = sub.icon;
          const isActive = selectedSubTab === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubTab(sub.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.85rem',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--qc-blue)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-secondary)' : 'transparent',
                borderTop: '1px solid ' + (isActive ? 'var(--border-light)' : 'transparent'),
                borderLeft: '1px solid ' + (isActive ? 'var(--border-light)' : 'transparent'),
                borderRight: '1px solid ' + (isActive ? 'var(--border-light)' : 'transparent'),
                borderBottom: isActive ? '2px solid var(--qc-blue)' : '1px solid transparent',
                borderRadius: '6px 6px 0 0',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={15} />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: DOUBLE-BLIND PROTOCOL & THE 4 KEY CURVES (Section 5.3) */}
      {selectedSubTab === 'doubleaveugle' && (
        <div>
          {/* Highlight on the 3rd Curve */}
          <div
            className="borne-card"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderLeft: '6px solid var(--qc-blue)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Sparkles size={18} style={{ color: 'var(--qc-blue)' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                La découverte clé : Le taux de désaccord entre deux professionnels qualifiés
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Sur un échantillon aléatoire de <strong>5 % des dossiers</strong> traités en double aveugle par deux arpenteurs indépendants, le système mesure pour la première fois au Québec la variance intrinsèque humaine.
            </p>
          </div>

          {/* The 4 Comparative Curves Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="borne-card" style={{ borderTop: '4px solid var(--stone-accent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: 700 }}>
                <Cpu size={14} />
                COURBE 1 — MACHINE SEULE
              </div>
              <div className="font-tabular" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.35rem 0' }}>
                3.4 %
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden', margin: '0.5rem 0' }}>
                <div style={{ width: '34%', height: '100%', backgroundColor: 'var(--stone-accent)' }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Taux d'omission ou source imprécise corrigé par l'arpenteur lors du poste de validation (n = {sampleSize}).
              </span>
            </div>

            <div className="borne-card" style={{ borderTop: '4px solid var(--status-amber)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-tertiary)', fontSize: '0.75rem', fontWeight: 700 }}>
                <UserCheck size={14} />
                COURBE 2 — HUMAIN SEUL
              </div>
              <div className="font-tabular" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--status-amber)', margin: '0.35rem 0' }}>
                4.8 %
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden', margin: '0.5rem 0' }}>
                <div style={{ width: '48%', height: '100%', backgroundColor: 'var(--status-amber)' }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Taux d'écart relevé par un second professionnel indépendant sur le même terrain (n = 310).
              </span>
            </div>

            <div className="borne-card" style={{ borderTop: '6px solid var(--qc-blue)', backgroundColor: 'var(--bg-blue-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--qc-blue)', fontSize: '0.75rem', fontWeight: 800 }}>
                <GitCompare size={14} />
                COURBE 3 — DÉSACCORD ENTRE 2 HUMAINS
              </div>
              <div className="font-tabular" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--qc-blue)', margin: '0.35rem 0' }}>
                6.2 %
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--qc-blue-border)', borderRadius: '4px', overflow: 'hidden', margin: '0.5rem 0' }}>
                <div style={{ width: '62%', height: '100%', backgroundColor: 'var(--qc-blue)' }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                Taux de divergence interprétative légitime entre deux arpenteurs d'expérience sur les marques d'occupation.
              </span>
            </div>

            <div className="borne-card" style={{ borderTop: '4px solid var(--status-green)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--status-green)', fontSize: '0.75rem', fontWeight: 700 }}>
                <CheckCircle2 size={14} />
                COURBE 4 — ARCHITECTURE HYBRIDE BORNE
              </div>
              <div className="font-tabular" style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--status-green)', margin: '0.35rem 0' }}>
                &lt; 0.08 %
              </div>
              <div style={{ height: '8px', backgroundColor: 'var(--status-green-border)', borderRadius: '4px', overflow: 'hidden', margin: '0.5rem 0' }}>
                <div style={{ width: '3%', height: '100%', backgroundColor: 'var(--status-green)' }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Machine 19/23 + Validation humaine + Sceau Notarius : fiabilité maximale inégalée.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: DELTA LOGGING (Section 5.2) */}
      {selectedSubTab === 'ecarts' && (
        <div className="borne-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Journal d'Audit des Écarts Machine vs Arpenteur
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Chaque correction humaine lors du poste de validation est enregistrée et anonymisée pour alimenter les statistiques de fiabilité.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border-medium)', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Dossier & Date</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Vérification</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Conclusion Machine</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Verdict Arpenteur</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Nature de l'Écart</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Arbitrage</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ECARTS_ETALON.map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <div style={{ fontWeight: 700 }}>{e.dossierId}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{e.date}</div>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <strong>#{e.verificationId}</strong> ({e.familleVerification})
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {e.conclusionMachine}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <span className={`borne-badge ${e.verdict === 'validée' ? 'badge-green' : 'badge-amber'}`}>
                        {e.verdict}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', fontSize: '0.8rem' }}>
                      {e.natureEcart}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <span className="borne-badge badge-blue" style={{ fontSize: '0.7rem' }}>
                        {e.quiAvaitRaison}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: CUMULATIVE REAL GAINS (Section 5.1) */}
      {selectedSubTab === 'economie' && (
        <div className="borne-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Impact Économique et Environnemental Cumulé
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Mesure en temps réel des gains générés par rapport au modèle traditionnel (1 630 $ et 11 heures par certificat).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>Économies pour les familles québécoises</span>
              <div className="font-tabular" style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--status-green)', marginTop: '0.25rem' }}>
                43 850 000 $
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>sur 32 000 dossiers traités</span>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>Heures professionnelles libérées</span>
              <div className="font-tabular" style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--qc-blue)', marginTop: '0.25rem' }}>
                233 600 h
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>réallouées au cadastre & bornages</span>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>Papier et impressions épargnés</span>
              <div className="font-tabular" style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--stone-accent)', marginTop: '0.25rem' }}>
                384 000 plans
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>100% numérique scellé</span>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: FEEDBACK LOOP (Section 5.5) */}
      {selectedSubTab === 'boucle' && (
        <div className="borne-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RotateCw size={20} style={{ color: 'var(--qc-blue)' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                Boucle d'Amélioration Systémique Continue
              </h3>
            </div>

            <button onClick={handleApplyPatch} className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
              <Sparkles size={14} />
              <span>{patchApplied ? 'Patch déployé ✓' : 'Déployer patch v4.3'}</span>
            </button>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            <strong>Le principe clé :</strong> Une erreur humaine corrigée n'est corrigée que pour un seul professionnel sur un seul dossier. Une erreur machine détectée déclenche automatiquement un correctif de pipeline et est <strong>corrigée définitivement pour tous les dossiers futurs de tout le Québec.</strong>
          </p>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', borderLeft: '4px solid var(--status-green)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Dernier patch de pipeline appliqué : v4.2.8 (14 août 2026)
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Amélioration de la détection des avenants de servitudes d'utilité publique sur le registre foncier en ligne de la Mauricie suite au retour d'expérience de 3 arpenteurs partenaires.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
