import React from 'react';
import { QUATRE_PHRASES_FONDATRICES } from '../../data/referenceParameters';
import { Quote, ExternalLink } from 'lucide-react';

interface FundamentalPhrasesProps {
  lang: 'fr' | 'en';
}

export const FundamentalPhrases: React.FC<FundamentalPhrasesProps> = ({ lang }) => {
  return (
    <div className="borne-card" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--qc-blue)', backgroundColor: 'var(--bg-secondary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Quote size={20} style={{ color: 'var(--qc-blue)' }} />
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {lang === 'fr' 
            ? 'Fondements juridiques & doctrine de la plateforme'
            : 'Legal foundations & platform doctrine'}
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {QUATRE_PHRASES_FONDATRICES.map((item) => (
          <div
            key={item.id}
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <p style={{ fontSize: '0.875rem', fontStyle: 'italic', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              {item.texte}
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>— {item.auteur}</span>
              {item.sourceUrl && (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--qc-blue)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}
                >
                  <span>source</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
