import React, { useState } from 'react';
import { 
  X, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ExternalLink, 
  ArrowRight,
  Sparkles,
  MapPin,
  Clock
} from 'lucide-react';
import { MOCK_DETECTEURS_V1 } from '../../data/mockData';
import { calculateSVB, formatCurrency } from '../../utils/crypto';
import { ResultatDetecteur } from '../../types/borne';

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fr' | 'en';
  onNavigateToModule: (module: 'registre' | 'place') => void;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  isOpen,
  onClose,
  lang,
  onNavigateToModule,
}) => {
  const [addressInput, setAddressInput] = useState('142, rue des Sorbiers, Lévis (QC)');
  const [certYear, setCertYear] = useState('2015');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanDone, setScanDone] = useState(false);
  const [activeDetectors, setActiveDetectors] = useState<ResultatDetecteur[]>(MOCK_DETECTEURS_V1);

  if (!isOpen) return null;

  const handleLaunchScan = () => {
    setIsScanning(true);
    setScanDone(false);
    setScanStep(1);

    const steps = [
      'Interrogation du Cadastre du Québec (Infolot)...',
      'Extraction LiDAR provincial 1m & Orthophotos MERN...',
      'Analyse des permis municipaux et requêtes d\'urbanisme...',
      'Vérification de l\'Index aux immeubles (Registre foncier)...',
      'Contrôle du zonage, grilles et contraintes territoriales...',
    ];

    let current = 0;
    const interval = setInterval(() => {
      current++;
      if (current <= steps.length) {
        setScanStep(current);
      } else {
        clearInterval(interval);
        setIsScanning(false);
        setScanDone(true);
      }
    }, 450);
  };

  const { score, voie, verdict } = calculateSVB(activeDetectors);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="borne-card"
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '2rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-tertiary)',
          }}
          aria-label="Fermer"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span className="borne-badge badge-blue">
              <Sparkles size={13} />
              {lang === 'fr' ? '100% Gratuit & Sans compte' : '100% Free & No signup'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={13} />
              {lang === 'fr' ? 'Durée : 90 secondes' : 'Duration: 90 seconds'}
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {lang === 'fr' 
              ? 'Mon certificat de localisation est-il vraiment périmé ?' 
              : 'Is my land survey certificate really outdated?'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {lang === 'fr'
              ? 'Vérification factuelle et transparente sur les 7 registres officiels du Québec.'
              : 'Factual and transparent verification against all 7 official Quebec registries.'}
          </p>
        </div>

        {/* Form Inputs */}
        {!scanDone && !isScanning && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                {lang === 'fr' ? 'Adresse ou numéro de lot au Québec' : 'Address or lot number in Quebec'}
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 1rem 0.65rem 2.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                  placeholder="Ex: 142 rue des Sorbiers, Lévis ou Lot 3 412 884"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                {lang === 'fr' ? 'Année du certificat' : 'Certificate Year'}
              </label>
              <input
                type="number"
                value={certYear}
                onChange={(e) => setCertYear(e.target.value)}
                style={{
                  width: '120px',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        {!scanDone && !isScanning && (
          <button
            onClick={handleLaunchScan}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', gap: '0.5rem' }}
          >
            <Search size={18} />
            <span>{lang === 'fr' ? 'Lancer le diagnostic instantané' : 'Launch instant diagnostic'}</span>
          </button>
        )}

        {/* Scanning State */}
        {isScanning && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                border: '4px solid var(--border-medium)',
                borderTopColor: 'var(--qc-blue)',
                borderRadius: '50%',
                margin: '0 auto 1.5rem',
                animation: 'spin 1s linear infinite',
              }}
            />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {lang === 'fr' ? 'Analyse géomatique et foncière en cours...' : 'Geospatial & land analysis in progress...'}
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--qc-blue)', fontWeight: 600 }}>
              Étape {scanStep} / 5 : {
                [
                  'Connexion sécurisée aux bases québécoises...',
                  'Interrogation Infolot & cadastre rénové...',
                  'Différentiel LiDAR provincial 1m & orthophotos...',
                  'Permis municipaux et registre foncier...',
                  'Calcul du Score de Validité BORNE (SVB)...',
                ][scanStep - 1] || 'Finalisation...'
              }
            </p>
          </div>
        )}

        {/* Results State */}
        {scanDone && (
          <div>
            {/* The Critical Statement */}
            <div
              style={{
                padding: '1rem 1.25rem',
                backgroundColor: 'var(--bg-blue-subtle)',
                border: '1px solid var(--qc-blue-border)',
                borderRadius: '8px',
                marginBottom: '1.5rem',
              }}
            >
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.5 }}>
                {lang === 'fr'
                  ? '« Aucune loi ni aucun règlement du Québec ne rend un certificat de localisation caduc ou périmé. La règle des 10 ans provient de consignes internes de la Chambre des notaires du Québec et de l\'OACIQ à leurs propres membres. Voici l\'état réel de votre propriété, détecteur par détecteur. »'
                  : '"No law or regulation in Quebec renders a certificate of location void or expired. The 10-year threshold stems from internal guidelines issued by the Chambre des notaires and OACIQ to their members. Here is the actual state of your property, detector by detector."'}
              </p>
            </div>

            {/* Score & Verdict Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '1.25rem',
                borderRadius: '10px',
                backgroundColor: score >= 90 ? 'var(--status-green-bg)' : 'var(--status-amber-bg)',
                border: `1px solid ${score >= 90 ? 'var(--status-green-border)' : 'var(--status-amber-border)'}`,
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    Score de Validité BORNE (SVB)
                  </span>
                  <span className={`borne-badge ${score >= 90 ? 'badge-green' : 'badge-amber'}`}>
                    Voie {voie}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {verdict}
                </h3>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div className="font-tabular" style={{ fontSize: '2.5rem', fontWeight: 900, color: score >= 90 ? 'var(--status-green)' : 'var(--status-amber)', lineHeight: 1 }}>
                  {score}<span style={{ fontSize: '1.2rem' }}>/100</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Indice de confiance : 97.4%
                </span>
              </div>
            </div>

            {/* 7 Detectors Summary */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              {lang === 'fr' ? 'Résultats détaillés des 7 détecteurs :' : 'Detailed 7 detector results:'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {activeDetectors.map((d) => (
                <div
                  key={d.id}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {d.declenche ? (
                      <AlertTriangle size={18} style={{ color: 'var(--status-amber)' }} />
                    ) : (
                      <CheckCircle2 size={18} style={{ color: 'var(--status-green)' }} />
                    )}
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {d.id} — {d.nom}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        Source : {d.preuve.source} ({d.preuve.date})
                      </div>
                    </div>
                  </div>

                  <span className={`borne-badge ${d.declenche ? 'badge-amber' : 'badge-green'}`}>
                    {d.declenche ? 'Changement détecté' : 'Intact (0 delta)'}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions for next steps */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToModule('registre');
                }}
                className="btn btn-secondary"
                style={{ padding: '0.75rem' }}
              >
                <ShieldCheck size={16} />
                <span>{lang === 'fr' ? 'Consulter le coffre-fort' : 'View in Vault'}</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNavigateToModule('place');
                }}
                className="btn btn-primary"
                style={{ padding: '0.75rem' }}
              >
                <span>{lang === 'fr' ? `Commander l'attestation V1 (${formatCurrency(120)})` : `Order V1 Attestation (${formatCurrency(120)})`}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
