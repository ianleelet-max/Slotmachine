import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  Check, 
  Edit3, 
  X, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  Keyboard, 
  FileSpreadsheet, 
  Award, 
  AlertCircle,
  Play,
  RotateCcw,
  CheckCheck,
  Printer,
  Sparkles,
  Save
} from 'lucide-react';
import { MOCK_DOSSIER_V1, MOCK_VERIFICATIONS_23 } from '../../data/mockData';
import { VerificationNorme, VerdictArpenteur, NatureEcart } from '../../types/borne';

interface ModuleDossierProps {
  lang: 'fr' | 'en';
}

export const ModuleDossier: React.FC<ModuleDossierProps> = ({ lang }) => {
  const [verifications, setVerifications] = useState<VerificationNorme[]>(MOCK_VERIFICATIONS_23);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(84); // 1m 24s elapsed
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showFieldSheetModal, setShowFieldSheetModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'tous' | 'deterministe' | 'interpretative'>('tous');

  // Correction Form State
  const [correctionText, setCorrectionText] = useState('');
  const [correctionReason, setCorrectionReason] = useState<NatureEcart>('omission');

  // Live Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => setTimerSeconds((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Keyboard Shortcuts (V, C, R, ArrowDown, ArrowUp)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      if (e.key.toLowerCase() === 'v') {
        handleSetVerdict(currentIndex, 'validée');
      } else if (e.key.toLowerCase() === 'c') {
        openCorrection(currentIndex);
      } else if (e.key.toLowerCase() === 'r') {
        handleSetVerdict(currentIndex, 'rejetée');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentIndex((prev) => Math.min(verifications.length - 1, prev + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, verifications]);

  const handleSetVerdict = (index: number, verdict: VerdictArpenteur, ecartNature: NatureEcart = 'aucune', textComment = '') => {
    setVerifications((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        verdictArpenteur: verdict,
        natureEcart: ecartNature,
        commentaireArpenteur: textComment || updated[index].commentaireArpenteur,
        horodatageVerdict: new Date().toISOString(),
      };
      return updated;
    });

    if (index < verifications.length - 1) {
      setCurrentIndex(index + 1);
    }
  };

  const openCorrection = (index: number) => {
    setCurrentIndex(index);
    setCorrectionText(verifications[index].commentaireArpenteur || '');
    setCorrectionReason(verifications[index].natureEcart || 'omission');
    setShowCorrectionModal(true);
  };

  const submitCorrection = () => {
    handleSetVerdict(currentIndex, 'corrigée', correctionReason, correctionText);
    setShowCorrectionModal(false);
  };

  const filteredVerifications = verifications.filter((v) => {
    if (selectedFilter === 'deterministe') return v.nature === 'déterministe';
    if (selectedFilter === 'interpretative') return v.nature === 'interprétative';
    return true;
  });

  const validatedCount = verifications.filter((v) => v.verdictArpenteur === 'validée').length;
  const currentItem = verifications[currentIndex];

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="borne-badge badge-blue">MODULE 2</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
              {lang === 'fr' ? 'Le poste de travail de l\'arpenteur-géomètre' : 'Surveyor Professional Workbench'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            BORNE DOSSIER
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '800px', marginTop: '0.25rem' }}>
            {lang === 'fr'
              ? 'Dossier pré-instruit : les 19 vérifications déterministes de la norme A-23 r. 10 automatisées avec sources complètes. L\'arpenteur conserve les 4 vérifications interprétatives et la signature.'
              : 'Pre-assembled file: 19 deterministic checks automated with full sources. Surveyor retains the 4 interpretive checks and signature.'}
          </p>
        </div>

        {/* Stopwatch & Speed Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="borne-card" style={{ padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock size={20} style={{ color: 'var(--qc-blue)' }} />
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block', fontWeight: 600 }}>
                {lang === 'fr' ? 'Chronomètre d\'examen' : 'Review Stopwatch'}
              </span>
              <div className="font-tabular font-mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {formatTimer(timerSeconds)}
              </div>
            </div>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
              title={isTimerRunning ? 'Pause' : 'Reprendre'}
            >
              {isTimerRunning ? <RotateCcw size={15} /> : <Play size={15} />}
            </button>
          </div>

          <button
            onClick={() => setShowFieldSheetModal(true)}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            <FileSpreadsheet size={16} />
            <span>{lang === 'fr' ? 'Fiche terrain (Art. 5)' : 'Field Sheet'}</span>
          </button>

          <button
            onClick={() => setShowSignModal(true)}
            className="btn btn-success"
            style={{ fontSize: '0.85rem' }}
          >
            <Award size={16} />
            <span>{lang === 'fr' ? 'Sceau Notarius OAGQ' : 'Notarius Seal'}</span>
          </button>
        </div>
      </div>

      {/* Progress & Shortcuts Helper Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: '8px',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
            {lang === 'fr' ? 'Progression des vérifications :' : 'Verification Progress:'}
          </span>
          <span className="borne-badge badge-green font-tabular">
            {validatedCount} / 23 validées ({Math.round((validatedCount / 23) * 100)}%)
          </span>
        </div>

        {/* Keyboard shortcuts reminder */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          <Keyboard size={14} />
          <span>Raccourcis :</span>
          <kbd style={{ padding: '0.15rem 0.4rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', borderRadius: '3px', fontWeight: 700 }}>V</kbd> Valider
          <kbd style={{ padding: '0.15rem 0.4rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', borderRadius: '3px', fontWeight: 700 }}>C</kbd> Corriger
          <kbd style={{ padding: '0.15rem 0.4rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', borderRadius: '3px', fontWeight: 700 }}>R</kbd> Rejeter
          <kbd style={{ padding: '0.15rem 0.4rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)', borderRadius: '3px', fontWeight: 700 }}>↓ / ↑</kbd> Naviguer
        </div>
      </div>

      {/* Main Grid: Left List (23 items) & Right Active Verification Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(440px, 1.4fr)', gap: '1.5rem' }}>
        {/* Left Column: 23 checks list */}
        <div className="borne-card" style={{ maxHeight: '720px', overflowY: 'auto', padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <button
              onClick={() => setSelectedFilter('tous')}
              className={`btn ${selectedFilter === 'tous' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              Tous (23)
            </button>
            <button
              onClick={() => setSelectedFilter('deterministe')}
              className={`btn ${selectedFilter === 'deterministe' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              19 Automatisés
            </button>
            <button
              onClick={() => setSelectedFilter('interpretative')}
              className={`btn ${selectedFilter === 'interpretative' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              4 Réservés Arpenteur
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {filteredVerifications.map((v) => {
              const isSelected = v.numero === currentItem.numero;
              return (
                <div
                  key={v.numero}
                  onClick={() => setCurrentIndex(v.numero - 1)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    backgroundColor: isSelected ? 'var(--bg-blue-subtle)' : 'var(--bg-tertiary)',
                    border: isSelected ? '1.5px solid var(--qc-blue)' : '1px solid var(--border-light)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    transition: 'all 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="font-tabular font-mono" style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)' }}>
                      #{v.numero}
                    </span>
                    <div>
                      <div style={{ fontSize: '0.825rem', fontWeight: isSelected ? 700 : 600, color: 'var(--text-primary)' }}>
                        {v.articleNorme} — {v.titre.substring(0, 36)}...
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                        {v.famille} • {v.nature === 'déterministe' ? 'Machine 19/23' : '⭐ Acte réservé 4/23'}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`borne-badge ${
                      v.verdictArpenteur === 'validée'
                        ? 'badge-green'
                        : v.verdictArpenteur === 'corrigée'
                        ? 'badge-amber'
                        : v.verdictArpenteur === 'rejetée'
                        ? 'badge-rose'
                        : 'badge-blue'
                    }`}
                    style={{ fontSize: '0.65rem', padding: '0.15rem 0.45rem' }}
                  >
                    {v.verdictArpenteur}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Workbench for Selected Check */}
        {currentItem && (
          <div className="borne-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Item Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="borne-badge badge-blue">
                      Norme A-23 r. 10 ({currentItem.articleNorme})
                    </span>
                    <span className={`borne-badge ${currentItem.nature === 'déterministe' ? 'badge-green' : 'badge-amber'}`}>
                      {currentItem.nature === 'déterministe' ? 'Déterministe (Automatisé)' : 'Interprétatif (Réservé à l\'arpenteur)'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {currentItem.titre}
                  </h3>
                </div>
                <span className="font-tabular" style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                  Confiance : {Math.round(currentItem.confianceMachine * 100)}%
                </span>
              </div>

              {/* Machine Conclusion & Full Source */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Conclusion instruite par BORNE :
                </h4>
                <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', borderLeft: '4px solid var(--qc-blue)', fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {currentItem.conclusionMachine}
                </div>
              </div>

              {/* Strict Cadastre vs Levé tolerance separation (Rule #7) */}
              {currentItem.valeurCadastre && currentItem.valeurLeve && (
                <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-amber-subtle)', border: '1px solid var(--status-amber-border)', borderRadius: '6px', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--status-amber)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Règle Anti-Hallucination #7 : Séparation stricte des tolérances
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Mesure Cadastre (Infolot) :</span>
                      <strong className="font-tabular">{currentItem.valeurCadastre.valeur}</strong>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{currentItem.valeurCadastre.tolerance}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', display: 'block' }}>Mesure Levé Terrain (Minute) :</span>
                      <strong className="font-tabular" style={{ color: 'var(--status-green)' }}>{currentItem.valeurLeve.valeur}</strong>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{currentItem.valeurLeve.tolerance}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Clickable Source Citation */}
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Source citée : {currentItem.sourceMachine.typeSource} ({currentItem.sourceMachine.date})
                  </span>
                  <a href={currentItem.sourceMachine.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--qc-blue)', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}>
                    <span>Consulter l'acte/portail</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
                <p style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>
                  « {currentItem.sourceMachine.extrait} »
                </p>
              </div>

              {/* Human Conclusion Input for Interpretive checks */}
              {currentItem.nature === 'interprétative' && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--qc-blue)', marginBottom: '0.35rem' }}>
                    Opinion & constatation de l'arpenteur-géomètre (Obligatoire) :
                  </label>
                  <textarea
                    rows={3}
                    defaultValue={currentItem.conclusionHumaine || ''}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-medium)',
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                    }}
                    placeholder="Saisissez votre constatation professionnelle de terrain..."
                  />
                </div>
              )}
            </div>

            {/* Actions Bar: Validate / Correct / Reject */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <button
                onClick={() => handleSetVerdict(currentIndex, 'validée')}
                className="btn btn-success"
                style={{ padding: '0.75rem' }}
              >
                <Check size={16} />
                <span>Valider (V)</span>
              </button>

              <button
                onClick={() => openCorrection(currentIndex)}
                className="btn btn-secondary"
                style={{ padding: '0.75rem', borderColor: 'var(--status-amber)' }}
              >
                <Edit3 size={16} style={{ color: 'var(--status-amber)' }} />
                <span>Corriger (C)</span>
              </button>

              <button
                onClick={() => handleSetVerdict(currentIndex, 'rejetée')}
                className="btn btn-danger"
                style={{ padding: '0.75rem' }}
              >
                <X size={16} />
                <span>Rejeter (R)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Correction & Delta Modal (feeds Étalon module) */}
      {showCorrectionModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="borne-card" style={{ maxWidth: '580px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              Corriger la vérification #{currentItem.numero} ({currentItem.titre})
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Cette correction sera journalisée dans le module Étalon pour affiner les algorithmes d'analyse.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Nature de l'écart constaté :
                </label>
                <select
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value as any)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  <option value="omission">Omission (détail manquant dans la conclusion)</option>
                  <option value="source périmée">Source périmée (nouvel acte ou règlement disponible)</option>
                  <option value="mauvaise source">Mauvaise source indexée</option>
                  <option value="erreur d'interprétation">Erreur d'interprétation machine</option>
                  <option value="désaccord légitime">Désaccord légitime d'arpentage</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Précision ou conclusion révisée de l'arpenteur :
                </label>
                <textarea
                  rows={3}
                  value={correctionText}
                  onChange={(e) => setCorrectionText(e.target.value)}
                  placeholder="Expliquez la correction apportée..."
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button onClick={() => setShowCorrectionModal(false)} className="btn btn-secondary">
                  Annuler
                </button>
                <button onClick={submitCorrection} className="btn btn-primary">
                  <Save size={14} />
                  <span>Enregistrer la correction</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Digital Signature Modal */}
      {showSignModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="borne-card" style={{ maxWidth: '520px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--qc-blue-light)', color: 'var(--qc-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Award size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Signature Numérique Notarius OAGQ
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Apposition du sceau officiel de l'Ordre des arpenteurs-géomètres du Québec avec certificat numérique cryptographique.
            </p>
            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', textAlign: 'left', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              <div>Arpenteure : <strong>Élise Fortin, a.-g.</strong></div>
              <div>Matricule OAGQ : <strong>#2144</strong></div>
              <div>Firme : <strong>Québec Géomatique & Arpentage SENC</strong></div>
              <div>Livrable : <strong>Attestation de non-changement Voie V1</strong></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button onClick={() => setShowSignModal(false)} className="btn btn-secondary">
                Annuler
              </button>
              <button onClick={() => { setShowSignModal(false); alert('Document signé numériquement et transmis au coffre-fort multi-parties !'); }} className="btn btn-success">
                Signer et sceller
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Sheet Modal (Art. 5) with Print Support */}
      {showFieldSheetModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="borne-card" style={{ maxWidth: '680px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                Fiche de Levé de Terrain & Notes (Art. 5 Norme A-23 r. 10)
              </h3>
              <button onClick={() => window.print()} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}>
                <Printer size={14} />
                <span>Imprimer</span>
              </button>
            </div>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '6px', fontSize: '0.8rem', lineHeight: 1.6, maxHeight: '340px', overflowY: 'auto' }}>
              <div><strong>Lot :</strong> 3 412 884 (Saint-Romuald, Lévis)</div>
              <div><strong>Coordonnées SCRS-NAD83 MTM Fuseau 7 :</strong> N: 5 184 912.80 | E: 308 412.45</div>
              <div><strong>Repères géodésiques suggérés :</strong> Borne MERN #841022 (à 140 m Sud)</div>
              <div><strong>Vérification d'alignement :</strong> Façade 20.00 m, ligne arrière 20.01 m</div>
              <div><strong>Points d'attention LiDAR :</strong> Clôture mitoyenne Sud-Est (décalage estimé 4 cm)</div>
              <div style={{ marginTop: '0.75rem', borderTop: '1px dashed var(--border-medium)', paddingTop: '0.5rem' }}>
                <strong>Gabarit de notes de terrain :</strong>
                <p style={{ fontStyle: 'italic', color: 'var(--text-tertiary)' }}>« Bornes de fer trouvées aux 4 coins. Aucune entrave visuelle. Sceau minute 4812 confirmé. »</p>
              </div>
            </div>
            <button onClick={() => setShowFieldSheetModal(false)} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
              Fermer la fiche
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
