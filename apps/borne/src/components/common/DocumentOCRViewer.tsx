import React, { useState } from 'react';
import { FileText, Search, ShieldCheck, Check, AlertCircle, Eye, CornerDownRight } from 'lucide-react';
import { CertificatSource } from '../../types/borne';

interface DocumentOCRViewerProps {
  data: CertificatSource;
  lang: 'fr' | 'en';
}

export const DocumentOCRViewer: React.FC<DocumentOCRViewerProps> = ({ data, lang }) => {
  const [selectedField, setSelectedField] = useState<string>('superficieM2');
  const [selectedPage, setSelectedPage] = useState<number>(1);

  const fields = [
    { key: 'numeroMinute', label: 'Minute d\'arpentage', val: `#${data.numeroMinute}`, page: 1, conf: 0.99, box: { top: 12, left: 10, w: 35, h: 6 } },
    { key: 'arpenteurNom', label: 'Arpenteur-géomètre', val: `${data.arpenteurNom} (Matricule ${data.arpenteurMatricule})`, page: 1, conf: 0.99, box: { top: 19, left: 10, w: 60, h: 6 } },
    { key: 'superficieM2', label: 'Superficie mesurée', val: `${data.superficieM2} m²`, page: 1, conf: 0.99, box: { top: 58, left: 15, w: 40, h: 7 } },
    { key: 'lotsCadastraux', label: 'Désignation cadastrale', val: `Lot ${data.lotsCadastraux.join(', ')}`, page: 1, conf: 0.99, box: { top: 32, left: 10, w: 75, h: 8 } },
    { key: 'batiments', label: 'Bâtiment principal', val: 'Unifamiliale 142.4 m² (1 étage)', page: 2, conf: 0.97, box: { top: 25, left: 12, w: 70, h: 10 } },
    { key: 'servitudesPassives', label: 'Servitudes passives', val: 'Hydro-Québec / Bell #9 812 004', page: 2, conf: 0.98, box: { top: 60, left: 12, w: 75, h: 12 } },
    { key: 'zonageCite', label: 'Zonage municipal', val: data.zonageCite, page: 3, conf: 0.99, box: { top: 40, left: 10, w: 50, h: 8 } },
  ];

  const currentFieldData = fields.find((f) => f.key === selectedField) || fields[0];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(360px, 1.4fr)', gap: '1.25rem' }}>
      {/* Left: Extraction Field Selector & Anti-Hallucination Details */}
      <div className="borne-card" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          {lang === 'fr' ? 'Champs Extraits du Document Source' : 'Extracted Source Fields'}
        </h4>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
          Cliquez sur un champ pour visualiser la zone textuelle originale avec son empreinte d'ancrage.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {fields.map((f) => {
            const isSelected = f.key === selectedField;
            return (
              <div
                key={f.key}
                onClick={() => {
                  setSelectedField(f.key);
                  setSelectedPage(f.page);
                }}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? 'var(--bg-blue-subtle)' : 'var(--bg-tertiary)',
                  border: isSelected ? '1.5px solid var(--qc-blue)' : '1px solid var(--border-light)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: isSelected ? 700 : 600, color: 'var(--text-primary)' }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--qc-blue)', fontWeight: 600 }}>
                    {f.val}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="borne-badge badge-green" style={{ fontSize: '0.65rem' }}>
                    {Math.round(f.conf * 100)}%
                  </span>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Page {f.page}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Field Citation Box */}
        <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', borderLeft: '4px solid var(--status-green)', fontSize: '0.8rem' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            Règle Anti-Hallucination : Ancrage Documentaire
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            Extrait textuel certifié de la <strong>Page {currentFieldData.page}</strong> du certificat #{data.numeroMinute}.
          </p>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
            Statut : Conforme • Aucun remplissage synthétique autorisé
          </div>
        </div>
      </div>

      {/* Right: Realistic PDF Document Preview with Bounding Box Overlay */}
      <div className="borne-card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
        {/* Page Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} style={{ color: 'var(--qc-blue)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              Certificat_Localisation_Minute_{data.numeroMinute}.pdf
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPage(p)}
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '4px',
                  border: selectedPage === p ? '1px solid var(--qc-blue)' : '1px solid var(--border-medium)',
                  backgroundColor: selectedPage === p ? 'var(--qc-blue)' : 'var(--bg-tertiary)',
                  color: selectedPage === p ? '#ffffff' : 'var(--text-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Page {p}
              </button>
            ))}
          </div>
        </div>

        {/* Simulated Document Paper Page */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '420px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            padding: '2rem 1.5rem',
            overflow: 'hidden',
            fontFamily: 'serif',
            color: '#1e293b',
          }}
        >
          {/* Header of Certificate */}
          <div style={{ textAlign: 'center', borderBottom: '1.5px solid #0f172a', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              TREMBLAY, ROY & ASSOCIÉS, S.E.N.C. — ARPENTEURS-GÉOMÈTRES
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', margin: '0.25rem 0' }}>
              CERTIFICAT DE LOCALISATION
            </div>
            <div style={{ fontSize: '0.7rem', fontStyle: 'italic' }}>
              Conforme au Règlement sur la norme de pratique (RLRQ c. A-23, r. 10)
            </div>
          </div>

          {/* Simulated Text Paragraphs according to active page */}
          {selectedPage === 1 && (
            <div style={{ fontSize: '0.75rem', lineHeight: 1.8 }}>
              <p><strong>MINUTE #{data.numeroMinute}</strong> — DRESSÉE LE {data.dateSignature}</p>
              <p style={{ marginTop: '0.5rem' }}>
                À la requête de Michel Gagnon, je soussigné, <strong>{data.arpenteurNom}</strong>, arpenteur-géomètre, membre de l'Ordre des arpenteurs-géomètres du Québec (Matricule {data.arpenteurMatricule}), certifie avoir procédé aux opérations d'arpentage nécessaires pour localiser l'immeuble suivant :
              </p>
              <p style={{ marginTop: '0.5rem', paddingLeft: '1rem', borderLeft: '2px solid #cbd5e1' }}>
                <strong>DÉSIGNATION CADASTRALE :</strong> Un terrain connu et désigné comme le <strong>Lot {data.lotsCadastraux.join(', ')}</strong>, Cadastre du Québec, Circonscription foncière de {data.circonscriptionFonciere}.
              </p>
              <p style={{ marginTop: '0.5rem' }}>
                <strong>SUPERFICIE :</strong> Le terrain possède une contenance superficielle totale de <strong>{data.superficieM2} mètres carrés</strong>.
              </p>
            </div>
          )}

          {selectedPage === 2 && (
            <div style={{ fontSize: '0.75rem', lineHeight: 1.8 }}>
              <p><strong>DESCRIPTION DU BÂTIMENT PRINCIPAL :</strong></p>
              <p>Maison unifamiliale isolée de plain-pied avec garage attaché. Emprise au sol mesurée de 142.4 m².</p>
              <p style={{ marginTop: '0.75rem' }}><strong>SERVITUDES ET CHARGES PUBLIÉES :</strong></p>
              <p>
                L'immeuble est grevé d'une servitude d'utilité publique en faveur d'Hydro-Québec et de la Compagnie de Téléphone Bell Canada sous le numéro d'inscription <strong>#9 812 004</strong>, affectant une bande de 3.00 mètres de largeur le long de la ligne arrière.
              </p>
            </div>
          )}

          {selectedPage === 3 && (
            <div style={{ fontSize: '0.75rem', lineHeight: 1.8 }}>
              <p><strong>CONFORMITÉ AU ZONAGE MUNICIPAL :</strong></p>
              <p>L'immeuble est situé dans la <strong>Zone H-204</strong> de la Ville de Lévis (usage unifamilial conforme).</p>
              <p style={{ marginTop: '0.75rem' }}><strong>OPINION PROFESSIONNELLE :</strong></p>
              <p>L'état actuel des lieux est conforme aux représentations du présent rapport.</p>
              <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                <div style={{ width: '80px', height: '80px', border: '2px dashed #0f4c81', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#0f4c81', fontWeight: 'bold' }}>
                  SCEAU OAGQ
                </div>
              </div>
            </div>
          )}

          {/* Interactive Bounding Box Highlight on the matching page */}
          {currentFieldData.page === selectedPage && (
            <div
              style={{
                position: 'absolute',
                top: `${currentFieldData.box.top}%`,
                left: `${currentFieldData.box.left}%`,
                width: `${currentFieldData.box.w}%`,
                height: `${currentFieldData.box.h}%`,
                border: '2px solid #0284c7',
                backgroundColor: 'rgba(56, 189, 248, 0.18)',
                borderRadius: '4px',
                pointerEvents: 'none',
                transition: 'all 0.3s ease',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '-18px',
                  left: '0',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  fontFamily: 'sans-serif',
                }}
              >
                {currentFieldData.label} ({Math.round(currentFieldData.conf * 100)}%)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
