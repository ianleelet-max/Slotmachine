import React from 'react';
import { ShieldAlert, Scale } from 'lucide-react';

interface LegalBannerProps {
  lang: 'fr' | 'en';
}

export const LegalBanner: React.FC<LegalBannerProps> = ({ lang }) => {
  return (
    <div
      style={{
        backgroundColor: '#092c4d',
        color: '#ffffff',
        borderBottom: '2px solid #0f4c81',
        padding: '0.65rem 1rem',
        fontSize: '0.85rem',
        fontWeight: 500,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
      }}
      role="banner"
      aria-label="Avertissement légal obligatoire"
    >
      <div className="borne-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Scale size={18} style={{ color: '#38bdf8', flexShrink: 0 }} />
          <span>
            {lang === 'fr' ? (
              <>
                <strong style={{ color: '#38bdf8' }}>AVIS LÉGAL NON MASQUABLE :</strong> BORNE est un outil d'aide à la décision. Seul un arpenteur-géomètre dument inscrit au tableau de l'OAGQ peut produire un <em>certificat de localisation</em> (RLRQ c. A-23).
              </>
            ) : (
              <>
                <strong style={{ color: '#38bdf8' }}>MANDATORY LEGAL NOTICE:</strong> BORNE is a decision-support tool. Only a licensed land surveyor (<em>arpenteur-géomètre</em>) registered with the OAGQ can produce a <em>certificat de localisation</em> (RLRQ c. A-23).
              </>
            )}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', opacity: 0.85 }}>
          <ShieldAlert size={14} />
          <span>RLRQ c. A-23, art. 34-36 & Loi 25 QC</span>
        </div>
      </div>
    </div>
  );
};
