import React, { useState } from 'react';
import { 
  FolderLock, 
  Upload, 
  FileText, 
  Share2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Fingerprint, 
  Sparkles, 
  Eye, 
  Lock, 
  Clock,
  Layers,
  History,
  FileBadge,
  Copy,
  Check,
  MapPin
} from 'lucide-react';
import { 
  MOCK_DOSSIER_V1, 
  MOCK_CERTIFICAT_INITIAL, 
  MOCK_DETECTEURS_V1 
} from '../../data/mockData';
import { formatCurrency, formatNumber } from '../../utils/crypto';
import { ResultatDetecteur } from '../../types/borne';
import { CadastreMapSimulator } from '../common/CadastreMapSimulator';
import { DocumentOCRViewer } from '../common/DocumentOCRViewer';

interface ModuleRegistreProps {
  lang: 'fr' | 'en';
  onOpenDiagnostic: () => void;
}

export const ModuleRegistre: React.FC<ModuleRegistreProps> = ({ lang, onOpenDiagnostic }) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'coffre' | 'carte' | 'extraction' | 'detecteurs' | 'attestation'>('coffre');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [activeCertificate] = useState(MOCK_CERTIFICAT_INITIAL);
  const [detecteurs] = useState<ResultatDetecteur[]>(MOCK_DETECTEURS_V1);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const dossier = MOCK_DOSSIER_V1;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText('https://borne.quebec/v/share-imm-3412884-token-9812');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyHash = () => {
    if (dossier.analyse?.empreinteCryptographique) {
      navigator.clipboard.writeText(dossier.analyse.empreinteCryptographique);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2500);
    }
  };

  const handleSimulateUpload = () => {
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 4000);
  };

  return (
    <div>
      {/* Module Title & Hero */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="borne-badge badge-blue">MODULE 1</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
              {lang === 'fr' ? 'La réutilisation & le score de validité' : 'Reuse & Validity Score'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            BORNE REGISTRE
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '800px', marginTop: '0.25rem' }}>
            {lang === 'fr'
              ? 'Coffre-fort gratuit à vie des certificats existants, extraction documentaire structurée avec citations obligatoires et moteur de détection de changement multi-sources.'
              : 'Lifetime free vault for existing certificates, structured document extraction with mandatory citations and multi-source change detection engine.'}
          </p>
        </div>

        <button
          onClick={onOpenDiagnostic}
          className="btn btn-primary"
          style={{ padding: '0.65rem 1.25rem' }}
        >
          <Sparkles size={16} />
          <span>{lang === 'fr' ? 'Diagnostic gratuit (90s)' : 'Free Diagnostic (90s)'}</span>
        </button>
      </div>

      {/* Sub-navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {[
          { id: 'coffre', label: lang === 'fr' ? 'Coffre-fort personnel' : 'Personal Vault', icon: FolderLock },
          { id: 'carte', label: lang === 'fr' ? 'Carte & LiDAR (Infolot)' : 'Map & LiDAR (Infolot)', icon: MapPin },
          { id: 'extraction', label: lang === 'fr' ? 'Extraction structurée (OCR Ancré)' : 'Structured Extraction (OCR)', icon: FileText },
          { id: 'detecteurs', label: lang === 'fr' ? '7 Détecteurs de changement' : '7 Change Detectors', icon: Layers },
          { id: 'attestation', label: lang === 'fr' ? 'Attestation Voie V1 (SHA-256)' : 'V1 Attestation (SHA-256)', icon: FileBadge },
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

      {/* SUBTAB 1: COFFRE-FORT */}
      {selectedSubTab === 'coffre' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Certificate Card */}
          <div className="borne-card" style={{ borderLeft: '4px solid var(--status-green)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="borne-badge badge-green" style={{ marginBottom: '0.4rem' }}>
                  <ShieldCheck size={13} />
                  {lang === 'fr' ? 'Certificat vérifié & indexé' : 'Verified & Indexed'}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Minute #{activeCertificate.donneesExtraites.numeroMinute} — {activeCertificate.donneesExtraites.arpenteurNom}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {activeCertificate.donneesExtraites.firme}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="font-tabular" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>
                  {activeCertificate.dateSignature}
                </span>
              </div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', display: 'block' }}>Lot cadastral</span>
                  <strong>{activeCertificate.donneesExtraites.lotsCadastraux.join(', ')}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', display: 'block' }}>Superficie</span>
                  <strong className="font-tabular">{activeCertificate.donneesExtraites.superficieM2} m²</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', display: 'block' }}>Circonscription</span>
                  <strong>{activeCertificate.donneesExtraites.circonscriptionFonciere}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', display: 'block' }}>Cadastre rénové</span>
                  <strong style={{ color: 'var(--status-green)' }}>Oui (Officiel Infolot)</strong>
                </div>
              </div>
            </div>

            {/* Sharing tokens & Access Log */}
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                {lang === 'fr' ? 'Partages sécurisés révocables (Loi 25) :' : 'Revocable secure shares (Law 25):'}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {dossier.partageTokens.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.65rem', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Lock size={12} style={{ color: 'var(--qc-blue)' }} />
                      <span>{p.destinataire}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>{p.accesses} accès</span>
                      <span className="borne-badge badge-green" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>Actif</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={handleCopyShareLink} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem' }}>
                {copiedLink ? <Check size={14} style={{ color: 'var(--status-green)' }} /> : <Share2 size={14} />}
                <span>{copiedLink ? 'Lien copié !' : 'Partager par lien sécurisé'}</span>
              </button>
              <button onClick={() => setSelectedSubTab('carte')} className="btn btn-outline-blue" style={{ fontSize: '0.8rem' }}>
                <MapPin size={14} />
                <span>Voir la carte</span>
              </button>
            </div>
          </div>

          {/* Deposit new document card with upload simulator */}
          <div className="borne-card" style={{ border: '2px dashed var(--border-medium)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--qc-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--qc-blue)', marginBottom: '1rem' }}>
              <Upload size={24} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              {lang === 'fr' ? 'Déposer un certificat existant' : 'Deposit an existing certificate'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', maxWidth: '300px', marginBottom: '1.25rem' }}>
              {lang === 'fr'
                ? 'Glissez un fichier PDF ou une photo numérisée. Gratuit à vie, stocké au Québec.'
                : 'Drag a PDF or scanned photo. Free for life, hosted securely in Quebec.'}
            </p>

            {uploadSuccess ? (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--status-green-bg)', color: 'var(--status-green)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                ✓ Document ingéré et indexé avec succès dans le coffre-fort !
              </div>
            ) : (
              <button onClick={handleSimulateUpload} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                <Upload size={14} />
                <span>{lang === 'fr' ? 'Téléverser un document' : 'Upload File'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: CARTE GÉOSPATIALE & LIDAR (INSPECTION MULTI-TEMPORELLE) */}
      {selectedSubTab === 'carte' && (
        <CadastreMapSimulator
          lang={lang}
          lotNumber={activeCertificate.donneesExtraites.lotsCadastraux[0]}
        />
      )}

      {/* SUBTAB 3: EXTRACTION STRUCTURÉE OCR ANCRÉE */}
      {selectedSubTab === 'extraction' && (
        <DocumentOCRViewer
          data={activeCertificate.donneesExtraites}
          lang={lang}
        />
      )}

      {/* SUBTAB 4: 7 DÉTECTEURS DE CHANGEMENT */}
      {selectedSubTab === 'detecteurs' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {detecteurs.map((d) => (
              <div key={d.id} className="borne-card" style={{ borderTop: `4px solid ${d.declenche ? 'var(--status-amber)' : 'var(--status-green)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-tertiary)' }}>
                      DÉTECTEUR #{d.id}
                    </span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {d.nom}
                    </h4>
                  </div>
                  <span className={`borne-badge ${d.declenche ? 'badge-amber' : 'badge-green'}`}>
                    {d.declenche ? 'Changement' : 'Aucun changement'}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                  {d.descriptionDetaillee}
                </p>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    Faisceau de preuve :
                  </div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    « {d.preuve.extrait} »
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-tertiary)' }}>
                    <span>Source : {d.preuve.source} ({d.preuve.date})</span>
                    <a href={d.preuve.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--qc-blue)', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}>
                      <span>Vérifier</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 5: ATTESTATION V1 SIGNÉE NOTARIUS & SHA-256 */}
      {selectedSubTab === 'attestation' && (
        <div className="borne-card" style={{ maxWidth: '850px', margin: '0 auto', border: '2px solid var(--qc-blue-border)', padding: '2rem' }}>
          {/* Certificate Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid var(--border-medium)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--qc-blue)' }}>
              ORDRE DES ARPENTEURS-GÉOMÈTRES DU QUÉBEC (OAGQ)
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', margin: '0.35rem 0' }}>
              ATTESTATION PROFESSIONNELLE DE NON-CHANGEMENT (VOIE V1)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
              Émise conformément aux règles de déontologie et aux données vérifiables du cadastre officiel
            </p>
          </div>

          {/* Statement */}
          <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            <p style={{ marginBottom: '0.75rem' }}>
              Je soussignée, <strong>{dossier.arpenteurSignataireNom}</strong>, arpenteure-géomètre dument inscrite au tableau de l'Ordre des arpenteurs-géomètres du Québec sous le <strong>Matricule #{dossier.arpenteurSignataireMatricule}</strong>, atteste par les présentes :
            </p>
            <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Avoir examiné le certificat de localisation minute #{activeCertificate.donneesExtraites.numeroMinute} dressé le {activeCertificate.dateSignature} par {activeCertificate.donneesExtraites.arpenteurNom}.</li>
              <li>Avoir validé point par point les 7 détecteurs de changement (imagerie, LiDAR 1m, permis municipaux, mutations foncières, cadastre Infolot, zonage et contraintes).</li>
              <li>Qu'aucun changement physique, juridique ou réglementaire n'a été apporté à l'immeuble désigné comme le <strong>Lot {activeCertificate.donneesExtraites.lotsCadastraux.join(', ')}</strong>, Circonscription de {activeCertificate.donneesExtraites.circonscriptionFonciere}.</li>
            </ol>
          </div>

          {/* Crypto Signature & Timestamping */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-medium)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--qc-blue)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Fingerprint size={14} />
                Empreinte Cryptographique Immuable (SHA-256)
              </span>
              <button onClick={handleCopyHash} style={{ background: 'none', border: 'none', color: 'var(--qc-blue)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                {copiedHash ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedHash ? 'Copié' : 'Copier'}</span>
              </button>
            </div>
            <code className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-primary)', wordBreak: 'break-all', display: 'block' }}>
              {dossier.analyse?.empreinteCryptographique}
            </code>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>Horodatage certifié : {dossier.analyse?.horodatageQualifie}</span>
              <span style={{ color: 'var(--status-green)', fontWeight: 600 }}>Sceau Notarius validé ✓</span>
            </div>
          </div>

          {/* Pricing & Time comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Coût facturé au propriétaire</span>
              <div className="font-tabular" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--status-green)' }}>
                {formatCurrency(dossier.prixFinal)}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>au lieu de 1 630 $ (OAGQ)</span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Délai d'émission</span>
              <div className="font-tabular" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--qc-blue)' }}>
                24 heures
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>au lieu de 4 à 8 semaines</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
