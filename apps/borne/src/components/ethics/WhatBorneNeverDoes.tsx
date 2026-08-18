import React from 'react';
import { 
  ShieldAlert, 
  XCircle, 
  Scale, 
  Sliders, 
  Lock, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { CE_QUE_BORNE_NE_FERA_JAMAIS, REFERENCE_PARAMETERS } from '../../data/referenceParameters';
import { formatCurrency, formatNumber } from '../../utils/crypto';

interface WhatBorneNeverDoesProps {
  lang: 'fr' | 'en';
}

export const WhatBorneNeverDoes: React.FC<WhatBorneNeverDoesProps> = ({ lang }) => {
  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span className="borne-badge badge-rose">DÉONTOLOGIE & DROIT QUÉBÉCOIS</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {lang === 'fr' ? 'Ce que BORNE ne fera jamais' : 'What BORNE Will Never Do'}
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '800px', marginTop: '0.25rem' }}>
          {lang === 'fr'
            ? 'Une charte publique d\'engagements aussi importante que nos fonctionnalités. Câblée directement dans le code et les règles de conception.'
            : 'A public charter of commitments as critical as our features. Hardwired into the code and architecture.'}
        </p>
      </div>

      {/* The 9 Non-negotiable Rules (Section 12) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {CE_QUE_BORNE_NE_FERA_JAMAIS.map((item) => (
          <div
            key={item.id}
            className="borne-card"
            style={{
              borderLeft: '4px solid var(--status-rose)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <XCircle size={18} style={{ color: 'var(--status-rose)', flexShrink: 0 }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {item.titre}
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {item.description}
              </p>
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--status-rose)', fontWeight: 700, textTransform: 'uppercase' }}>
              Interdiction architecturale stricte
            </div>
          </div>
        ))}
      </div>

      {/* Reference Parameters Table (Section 4) */}
      <div className="borne-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Sliders size={20} style={{ color: 'var(--qc-blue)' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
            Table des Paramètres de Référence (Vérifiés Août 2026)
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Toutes ces constantes sont stockées dans une table de paramètres configurable, jamais codées en dur dans les règles métier.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border-medium)', textAlign: 'left' }}>
                <th style={{ padding: '0.65rem 0.85rem' }}>Paramètre</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Valeur officielle 2026</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Source / Justification</th>
              </tr>
            </thead>
            <tbody>
              {[
                { nom: 'TARIF_SUGGERE_OAGQ_2026_UNIFAMILIAL_URBAIN', val: formatCurrency(REFERENCE_PARAMETERS.TARIF_SUGGERE_OAGQ_2026_UNIFAMILIAL_URBAIN), src: 'Guide des tarifs suggérés OAGQ 2026' },
                { nom: 'TAUX_HORAIRE_JUNIOR (0-5 ans)', val: `${REFERENCE_PARAMETERS.TAUX_HORAIRE_JUNIOR} $/h`, src: 'Grille tarifaire OAGQ 2026' },
                { nom: 'TAUX_HORAIRE_SENIOR (10 ans +)', val: `${REFERENCE_PARAMETERS.TAUX_HORAIRE_SENIOR} $/h`, src: 'Grille tarifaire OAGQ 2026' },
                { nom: 'TRANSACTIONS_RESIDENTIELLES_QC_2025', val: formatNumber(REFERENCE_PARAMETERS.TRANSACTIONS_RESIDENTIELLES_QC_2025), src: 'Statistiques officielles APCIQ 2025' },
                { nom: 'PRIX_MEDIAN_UNIFAMILIALE_QC_2025', val: formatCurrency(REFERENCE_PARAMETERS.PRIX_MEDIAN_UNIFAMILIALE_QC_2025), src: 'APCIQ 2025' },
                { nom: 'MEMBRES_OAGQ_2025_03_31', val: formatNumber(REFERENCE_PARAMETERS.MEMBRES_OAGQ_2025_03_31), src: 'Rapport annuel OAGQ 2024-2025' },
                { nom: 'TOLERANCE_CADASTRE_POSITION_M', val: '± 0.15 m à ± 0.30 m', src: 'Portail Foncier Québec (Instructions v6.0)' },
                { nom: 'PRECISION_DRONE_RTK_HORIZ_M', val: '± 0.02 m à ± 0.03 m', src: 'Wingtra Photogrammétrie RTK 2026' },
                { nom: 'RESOLUTION_MNT_LIDAR_QC_M', val: `${REFERENCE_PARAMETERS.RESOLUTION_MNT_LIDAR_QC_M} mètre`, src: 'Données Québec LiDAR ouvert' },
                { nom: 'VERIFICATIONS_NORME_DETERMINISTES', val: '19 / 23 vérifications', src: 'Norme de pratique A-23 r. 10' },
                { nom: 'VERIFICATIONS_NORME_INTERPRETATIVES', val: '4 / 23 (Réservées arpenteur)', src: 'Loi A-23 art. 34-36' },
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '0.65rem 0.85rem' }}>
                    <code className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--qc-blue)' }}>{row.nom}</code>
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700 }} className="font-tabular">
                    {row.val}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-tertiary)' }}>
                    {row.src}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
