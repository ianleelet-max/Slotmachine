import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  FileText, 
  Search, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingDown, 
  Users, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  BarChart2,
  Lock,
  Compass,
  FileSpreadsheet
} from 'lucide-react';

interface ModuleStrategieProps {
  lang: 'fr' | 'en';
  onNavigateToModule?: (module: string) => void;
}

type EvidenceType = 'all' | 'fait' | 'usage' | 'modele';

export const ModuleStrategie: React.FC<ModuleStrategieProps> = ({ lang, onNavigateToModule }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [evidenceFilter, setEvidenceFilter] = useState<EvidenceType>('all');
  const [activeSection, setActiveSection] = useState('comment-lire');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    const url = 'https://powai.ca/borne/strategie';
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="module-strategie-container" style={{ paddingBottom: '4rem' }}>
      {/* 0. Breadcrumb & Canonical URL Bar */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '0.75rem',
          padding: '0.6rem 1rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-light)',
          borderRadius: '8px',
          marginBottom: '1.25rem',
          fontSize: '0.8rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-tertiary)' }}>
          <span>powai.ca</span>
          <span>/</span>
          <span>borne</span>
          <span>/</span>
          <strong style={{ color: 'var(--qc-blue)' }}>strategie</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleCopyLink}
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            title="Copier l'URL directe de cette sous-page"
          >
            {copiedLink ? <CheckCircle2 size={13} style={{ color: 'var(--status-green)' }} /> : <ExternalLink size={13} />}
            <span>{copiedLink ? (lang === 'fr' ? 'Lien copié !' : 'Link copied!') : (lang === 'fr' ? 'Copier le lien direct (powai.ca/borne/strategie)' : 'Copy direct link')}</span>
          </button>
        </div>
      </div>

      {/* 1. Header Banner & Executive Stats */}
      <div 
        className="borne-card" 
        style={{ 
          marginBottom: '2rem', 
          background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
          borderLeft: '5px solid var(--qc-blue)',
          padding: '2rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ maxWidth: '850px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className="borne-badge badge-blue">
                <BookOpen size={13} />
                {lang === 'fr' ? 'Dossier Stratégique Fondateur' : 'Foundational Strategic Dossier'}
              </span>
              <span className="borne-badge badge-amber font-tabular">
                Août 2026
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.75rem' }}>
              {lang === 'fr' 
                ? 'LE CERTIFICAT DE LOCALISATION AU QUÉBEC' 
                : 'THE CERTIFICATE OF LOCATION IN QUEBEC'}
            </h1>
            <p style={{ fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              {lang === 'fr' 
                ? 'Anatomie d’un péage, et le plan pour le démonter.' 
                : 'Anatomy of a toll, and the battle plan to dismantle it.'}
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
              {lang === 'fr'
                ? 'Dossier stratégique complet : cadre légal (RLRQ c. A-23, C.c.Q.), décomposition des 11h de travail, cartographie des intérêts, 7 faiblesses structurelles, matrice d’erreurs comparée et séquence de déploiement en 4 phases.'
                : 'Complete strategic dossier: legal framework, 11-hour work breakdown, stakeholder map, 7 structural weaknesses, error benchmark and 4-phase rollout plan.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              onClick={handlePrint}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
              title={lang === 'fr' ? 'Imprimer ou exporter en PDF' : 'Print or Export as PDF'}
            >
              <Printer size={16} />
              <span>{lang === 'fr' ? 'Imprimer / PDF' : 'Print / PDF'}</span>
            </button>
          </div>
        </div>

        {/* 5 Core Metric Cards */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem', 
            marginTop: '1.75rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-light)'
          }}
        >
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-green)', marginBottom: '0.35rem' }}>
              <TrendingDown size={18} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Économie annuelle</span>
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }} className="font-tabular">
              71,9 M$ <span style={{ fontSize: '0.9rem', color: 'var(--status-green)', fontWeight: 600 }}>(-70%)</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
              1 138 $ d'économie par ménage
            </p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--qc-blue)', marginBottom: '0.35rem' }}>
              <Users size={18} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Capacité libérée</span>
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }} className="font-tabular">
              324 ETP <span style={{ fontSize: '0.9rem', color: 'var(--qc-blue)', fontWeight: 600 }}> (30% OAGQ)</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
              518 783 h réaffectées au bornage & expertise
            </p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--stone-accent)', marginBottom: '0.35rem' }}>
              <Sparkles size={18} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Norme A-23 r.10</span>
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }} className="font-tabular">
              19 / 23 <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>(83%)</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
              Vérifications déterministes automatisables
            </p>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-amber)', marginBottom: '0.35rem' }}>
              <Clock size={18} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Règle des 10 ans</span>
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--status-rose)' }}>
              0 loi <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>en vigueur</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
              Usage corporatif, admis par l'OAGQ
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout (Sticky Table of Contents + Comprehensive Strategic Text) */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>
        
        {/* Sticky Sidebar Navigation */}
        <aside 
          style={{ 
            position: 'sticky', 
            top: '1.5rem', 
            backgroundColor: 'var(--bg-secondary)', 
            border: '1px solid var(--border-light)', 
            borderRadius: '10px', 
            padding: '1.25rem',
            maxHeight: 'calc(100vh - 3rem)',
            overflowY: 'auto'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-tertiary)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            {lang === 'fr' ? 'Sommaire du dossier' : 'Dossier Contents'}
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {[
              { id: 'comment-lire', label: '0. Comment lire ce dossier' },
              { id: 'partie-1', label: '1. Ce qu’est réellement le certificat' },
              { id: 'partie-2', label: '2. Le processus réel & horloges' },
              { id: 'partie-3', label: '3. La carte des intérêts' },
              { id: 'partie-4', label: '4. Les 7 faiblesses du système' },
              { id: 'partie-5', label: '5. Ce qui est solide (OAGQ)' },
              { id: 'partie-6', label: '6. Le gisement technologique' },
              { id: 'partie-7', label: '7. Le processus cible (4 voies)' },
              { id: 'partie-8', label: '8. Le modèle chiffré' },
              { id: 'partie-9', label: '9. Machine contre humain' },
              { id: 'partie-10', label: '10. Transparence forcée (7 leviers)' },
              { id: 'partie-11', label: '11. Séquence de déploiement' },
              { id: 'synthese', label: '★ En une page (Synthèse)' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                style={{
                  textAlign: 'left',
                  padding: '0.5rem 0.65rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeSection === item.id ? 'var(--qc-blue-light)' : 'transparent',
                  color: activeSection === item.id ? 'var(--qc-blue)' : 'var(--text-secondary)',
                  fontWeight: activeSection === item.id ? 700 : 500,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{item.label}</span>
                {activeSection === item.id && <ChevronRight size={14} />}
              </button>
            ))}
          </nav>

          {/* Evidence tags legend */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.5rem' }}>
              Légende des preuves
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="borne-badge badge-blue" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>FAIT</span>
                <span style={{ color: 'var(--text-secondary)' }}>Loi / Règlement officiel</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="borne-badge badge-rose" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>USAGE</span>
                <span style={{ color: 'var(--text-secondary)' }}>Pratique sans fondement</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="borne-badge badge-amber" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>MODÈLE</span>
                <span style={{ color: 'var(--text-secondary)' }}>Projection chiffrée</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Strategic Document Body */}
        <article className="borne-card" style={{ padding: '2.5rem', fontSize: '0.95rem', lineHeight: 1.7 }}>
          
          {/* SECTION 0 */}
          <section id="comment-lire" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, borderBottom: '2px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              0. Comment lire ce dossier
            </h2>
            <p style={{ marginBottom: '1rem' }}>
              Trois niveaux de preuve sont utilisés partout, et je les distingue systématiquement. Ne les mélangez jamais quand vous défendrez ce dossier devant quelqu’un.
            </p>
            
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border-medium)' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', width: '140px' }}>Marqueur</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem' }}>Signification</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}><span className="borne-badge badge-blue">FAIT</span></td>
                    <td style={{ padding: '0.75rem 1rem' }}>Texte de loi, règlement, donnée publiée par une source officielle. Vérifiable, citée en annexe.</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.75rem 1rem' }}><span className="borne-badge badge-rose">USAGE</span></td>
                    <td style={{ padding: '0.75rem 1rem' }}>Pratique du marché sans fondement légal. C’est là que se cache la rente.</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 1rem' }}><span className="borne-badge badge-amber">MODÈLE</span></td>
                    <td style={{ padding: '0.75rem 1rem' }}>Estimation calculée à partir de paramètres explicites. À valider par la donnée réelle — et l'application BORNE est précisément conçue pour produire cette donnée.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: 'var(--qc-blue-light)', borderLeft: '4px solid var(--qc-blue)', borderRadius: '0 8px 8px 0', marginBottom: '1rem' }}>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Le nerf de tout ce dossier tient dans un écart : <span className="borne-badge badge-blue" style={{ verticalAlign: 'middle' }}>FAIT</span> entre ce que la loi exige et ce que le marché impose <span className="borne-badge badge-rose" style={{ verticalAlign: 'middle' }}>USAGE</span>, il y a environ <strong>70 M$ par année</strong>.
              </p>
            </div>
          </section>

          {/* SECTION 1 */}
          <section id="partie-1" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, borderBottom: '2px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              PARTIE 1 — CE QU’EST RÉELLEMENT LE CERTIFICAT DE LOCALISATION
            </h2>
            
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--qc-blue)', margin: '1.5rem 0 0.75rem' }}>
              1.1 Les cinq textes qui gouvernent tout
            </h3>
            <p style={{ marginBottom: '1rem' }}>Tout le système tient sur cinq textes. Pas plus.</p>
            
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li>
                <strong><span className="borne-badge badge-blue" style={{ marginRight: '0.4rem' }}>FAIT</span> <em>Loi sur les arpenteurs-géomètres</em>, RLRQ c. A-23 :</strong>
                <ul style={{ marginTop: '0.35rem', paddingLeft: '1.25rem', color: 'var(--text-secondary)' }}>
                  <li><strong>Art. 34 :</strong> Définit l’arpentage : <em>« tous arpentages de terrains, mesurages aux fins de borner, bornages, levés de plans, toutes confections de plans… »</em>. Et cette phrase clé de voûte : <strong>« L’arpenteur-géomètre est un officier public. »</strong></li>
                  <li><strong>Art. 35 :</strong> <em>« Aucune des opérations définies à l’article 34 n’est valide, à moins qu’elle n’ait été entreprise par un arpenteur-géomètre. »</em> (Nullité absolue si fait par un tiers).</li>
                  <li><strong>Art. 36 :</strong> L’arpenteur ne peut signer un document qu’il n’a pas entrepris lui-même ou qui n’a pas été fait <strong>sous sa surveillance immédiate</strong>.</li>
                </ul>
              </li>
              <li>
                <strong><span className="borne-badge badge-blue" style={{ marginRight: '0.4rem' }}>FAIT</span> <em>Règlement sur la norme de pratique relative au certificat de localisation</em>, RLRQ c. A-23, r. 10 :</strong>
                Le cœur opérationnel énumérant les <strong>23 éléments de vérification obligatoires</strong>.
              </li>
              <li>
                <strong><span className="borne-badge badge-blue" style={{ marginRight: '0.4rem' }}>FAIT</span> <em>Code civil du Québec</em>, art. 1719 :</strong>
                Le vendeur doit délivrer à l’acheteur les titres de propriété <strong>et le certificat de localisation en sa possession</strong> (l'article n’ordonne pas d’en produire un neuf).
              </li>
              <li>
                <strong><span className="borne-badge badge-blue" style={{ marginRight: '0.4rem' }}>FAIT</span> <em>Code civil du Québec</em>, art. 3027 :</strong>
                Le plan cadastral est <strong>présumé exact</strong>.
              </li>
              <li>
                <strong><span className="borne-badge badge-blue" style={{ marginRight: '0.4rem' }}>FAIT</span> <em>Loi favorisant la réforme du cadastre québécois</em>, art. 19.2 :</strong>
                Présomption de concordance entre la désignation dans les titres et le lot au plan de rénovation.
              </li>
            </ul>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-medium)', marginBottom: '1.5rem' }}>
              <strong>Conclusion indiscutable :</strong> Aucun de ces cinq textes ne fixe une date de péremption au certificat de localisation.
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--qc-blue)', margin: '1.5rem 0 0.75rem' }}>
              1.2 Les 23 vérifications de la Norme A-23 r.10
            </h3>
            <p style={{ marginBottom: '1rem' }}>
              La norme impose 23 vérifications réparties en 5 blocs opérationnels :
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--qc-blue)' }}>Bloc 1 — Titres et cadastre (1 à 6)</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                  Désignation, historique cadastral, chaîne de propriété, servitudes actives/passives, restrictions au Registre foncier.
                </p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--qc-blue)' }}>Bloc 2 — Mesure et géométrie (7 à 10)</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                  Description, superficie, distances limites-bâtiments, marques d'occupation.
                </p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--qc-blue)' }}>Bloc 3 — Réglementaire (11 à 14)</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                  Zonage municipal, usages autorisés, marges de recul, conformité aux règlements en vigueur.
                </p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--qc-blue)' }}>Bloc 4 — Contraintes (15 à 19)</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
                  Zone agricole CPTAQ, zone inondable, bande riveraine, patrimoine culturel, servitudes aériennes.
                </p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-amber-subtle)', border: '1px solid var(--status-amber-border)', borderRadius: '8px', gridColumn: '1 / -1' }}>
                <strong style={{ color: 'var(--status-amber)' }}>Bloc 5 — Interprétation (20 à 23 : Le cœur réservé à l'humain)</strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.4rem' }}>
                  Empiètements apparents, exercés ou soufferts, servitudes de fait (Art. 9), opinion professionnelle finale.
                </p>
              </div>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: 'var(--status-green-bg)', border: '1px solid var(--status-green-border)', borderRadius: '8px' }}>
              <strong>Structure décisive : 19 vérifications sur 23 sont déterministes ou documentaires. 4 relèvent du jugement.</strong> Toute l'architecture de BORNE découle de ce ratio.
            </div>
          </section>

          {/* SECTION 2 */}
          <section id="partie-2" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, borderBottom: '2px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              PARTIE 2 — LE PROCESSUS RÉEL, AVEC LES HORLOGES
            </h2>
            <p style={{ marginBottom: '1rem' }}>
              <span className="borne-badge badge-blue">FAIT</span> Le délai standard au marché est de <strong>4 à 8 semaines</strong>.
              Sur 28 à 56 jours calendrier, le travail humain réel représente environ <strong>11 heures</strong>. Le taux d'occupation du dossier n'est que de <strong>3 %</strong>.
            </p>
            
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Tâche</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center', width: '90px' }}>Heures</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left', width: '150px' }}>Nature</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={{ padding: '0.5rem 0.8rem' }}>Ouverture, intake, devis</td><td style={{ textAlign: 'center' }}>0,5 h</td><td>Administratif</td></tr>
                  <tr><td style={{ padding: '0.5rem 0.8rem' }}>Recherche titres / Registre foncier</td><td style={{ textAlign: 'center' }}>1,5 h</td><td>Documentaire</td></tr>
                  <tr><td style={{ padding: '0.5rem 0.8rem' }}>Recherche cadastrale, greffe, plans</td><td style={{ textAlign: 'center' }}>1,0 h</td><td>Documentaire</td></tr>
                  <tr><td style={{ padding: '0.5rem 0.8rem' }}>Zonage, grille de spécifications, marges</td><td style={{ textAlign: 'center' }}>1,2 h</td><td>Réglementaire</td></tr>
                  <tr><td style={{ padding: '0.5rem 0.8rem' }}>Contraintes (inondable, rives, CPTAQ)</td><td style={{ textAlign: 'center' }}>0,8 h</td><td>Géospatial</td></tr>
                  <tr><td style={{ padding: '0.5rem 0.8rem' }}>Permis municipaux et conformité</td><td style={{ textAlign: 'center' }}>0,5 h</td><td>Documentaire</td></tr>
                  <tr><td style={{ padding: '0.5rem 0.8rem' }}>Déplacement + levé terrain</td><td style={{ textAlign: 'center' }}>2,0 h</td><td>Terrain</td></tr>
                  <tr><td style={{ padding: '0.5rem 0.8rem' }}>Calculs et dessin du plan (DAO)</td><td style={{ textAlign: 'center' }}>1,5 h</td><td>Production</td></tr>
                  <tr><td style={{ padding: '0.5rem 0.8rem' }}>Rédaction du rapport</td><td style={{ textAlign: 'center' }}>1,0 h</td><td>Production</td></tr>
                  <tr style={{ backgroundColor: 'var(--bg-amber-subtle)', fontWeight: 700 }}>
                    <td style={{ padding: '0.5rem 0.8rem' }}>Analyse, jugement professionnel, sceau</td>
                    <td style={{ textAlign: 'center' }}>1,0 h</td>
                    <td>Réservé (Art. 34-36)</td>
                  </tr>
                  <tr style={{ fontWeight: 800, borderTop: '2px solid var(--border-medium)' }}>
                    <td style={{ padding: '0.6rem 0.8rem' }}>TOTAL</td>
                    <td style={{ textAlign: 'center' }}>11,0 h</td>
                    <td>Tarif suggéré : 1 630 $</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Le problème du certificat de localisation <strong>n’est pas un problème de travail technique. C’est un problème de file d’attente devant une ressource rare.</strong>
            </p>
          </section>

          {/* SECTION 3 */}
          <section id="partie-3" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, borderBottom: '2px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              PARTIE 3 — LA CARTE DES INTÉRÊTS & LE CITOYEN
            </h2>
            <p style={{ marginBottom: '1rem' }}>
              Chaque acteur de la chaîne répond rationnellement à des incitatifs économiques désalignés :
            </p>

            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Acteur</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Paie ?</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Attend ?</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Gagne quoi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ backgroundColor: 'var(--bg-rose-subtle)', fontWeight: 700 }}>
                    <td style={{ padding: '0.6rem 0.8rem', color: 'var(--status-rose)' }}>Citoyen Vendeur</td>
                    <td style={{ textAlign: 'center', color: 'var(--status-rose)' }}>TOUT</td>
                    <td style={{ textAlign: 'center', color: 'var(--status-rose)' }}>TOUT</td>
                    <td style={{ color: 'var(--status-rose)' }}>Rien</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem 0.8rem' }}>Arpenteur</td>
                    <td style={{ textAlign: 'center' }}>Non</td>
                    <td style={{ textAlign: 'center' }}>Non</td>
                    <td>Honoraires (1 630 $), captivité</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem 0.8rem' }}>Notaire</td>
                    <td style={{ textAlign: 'center' }}>Non</td>
                    <td style={{ textAlign: 'center' }}>Non</td>
                    <td>Couverture responsabilité gratuite</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem 0.8rem' }}>Courtier</td>
                    <td style={{ textAlign: 'center' }}>Non</td>
                    <td style={{ textAlign: 'center' }}>Oui</td>
                    <td>Transaction fluide, commission</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem 0.8rem' }}>Prêteur</td>
                    <td style={{ textAlign: 'center' }}>Non</td>
                    <td style={{ textAlign: 'center' }}>Non</td>
                    <td>Sécurité financière transférée</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem 0.8rem' }}>Assureur titres</td>
                    <td style={{ textAlign: 'center' }}>Non</td>
                    <td style={{ textAlign: 'center' }}>Non</td>
                    <td>Prime 250-400 $</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem 0.8rem' }}>État québécois</td>
                    <td style={{ textAlign: 'center' }}>Non</td>
                    <td style={{ textAlign: 'center' }}>Non</td>
                    <td>Cadastre & LiDAR financés mais sous-exploités</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)', borderLeft: '4px solid var(--status-rose)', borderRadius: '0 8px 8px 0' }}>
              <strong>Une seule case du tableau contient « Tout, Tout, Rien » : celle du citoyen.</strong>
            </div>
          </section>

          {/* SECTION 4 */}
          <section id="partie-4" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, borderBottom: '2px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              PARTIE 4 — LES SEPT FAIBLESSES DU SYSTÈME
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--status-rose)' }}>F1 — La règle des 10 ans n'existe pas en droit</strong>
                <p style={{ fontSize: '0.875rem', marginTop: '0.3rem', color: 'var(--text-secondary)' }}>
                  L'Ordre confirme formellement qu'aucune loi ne rend un certificat caduc. Le seuil de 10 ans est une consigne corporative de gestion du risque sans force de loi.
                </p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--status-rose)' }}>F2 — L'offre s'effondre pendant que la demande monte</strong>
                <p style={{ fontSize: '0.875rem', marginTop: '0.3rem', color: 'var(--text-secondary)' }}>
                  Membres OAGQ : 1 135 (2021) → 1 084 (2025). Nouvelles admissions en chute de 46% (19/an). Transactions en hausse de 8%.
                </p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--status-rose)' }}>F3 — Le tarif suggéré de l'Ordre (1 630 $)</strong>
                <p style={{ fontSize: '0.875rem', marginTop: '0.3rem', color: 'var(--text-secondary)' }}>
                  Point focal de coordination tacite en l'absence de publication des prix réels du marché.
                </p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--status-rose)' }}>F4 — L'amnésie organisée (0 % de réutilisation)</strong>
                <p style={{ fontSize: '0.875rem', marginTop: '0.3rem', color: 'var(--text-secondary)' }}>
                  Quand une propriété n'a pas bougé, les 23 vérifications sont refaites à neuf à 1 630 $ au lieu de détecter les différentiels.
                </p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--status-rose)' }}>F5 — Le greffe privé séquestré</strong>
                <p style={{ fontSize: '0.875rem', marginTop: '0.3rem', color: 'var(--text-secondary)' }}>
                  Des millions de documents fonciers dorment dans des classeurs privés sans registre centralisé pour les citoyens.
                </p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--status-rose)' }}>F6 — Le refus non motivé</strong>
                <p style={{ fontSize: '0.875rem', marginTop: '0.3rem', color: 'var(--text-secondary)' }}>
                  Rejet d'un certificat existant sans obligation d'écrire la justification juridique ou réglementaire précise.
                </p>
              </div>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--status-rose)' }}>F7 — L'opacité totale du prix et du délai</strong>
                <p style={{ fontSize: '0.875rem', marginTop: '0.3rem', color: 'var(--text-secondary)' }}>
                  Aucun indice public des prix ou des délais réels n'est disponible pour éclairer le consommateur.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 7 — PROCESSUS CIBLE */}
          <section id="partie-7" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, borderBottom: '2px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              PARTIE 7 — LE PROCESSUS CIBLE & LES 4 VOIES GRADUÉES
            </h2>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--qc-blue-light)', borderLeft: '4px solid var(--qc-blue)', borderRadius: '0 8px 8px 0', marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontSize: '1.05rem' }}>
                Principe directeur : « On ne retire pas la signature à l’arpenteur. On lui retire tout ce qui n’est pas la signature. »
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--status-green-border)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="borne-badge badge-green">V1 — Non-changement</span>
                  <span style={{ fontWeight: 800, color: 'var(--status-green)', fontSize: '1.1rem' }}>~120 $</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Certificat existant + imagerie multi-temporelle + cadastre concordant. Attestation validée en <strong>24-72 h sans visite terrain</strong>.
                </p>
              </div>

              <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="borne-badge badge-blue">V2 — Mise à jour assistée</span>
                  <span style={{ fontWeight: 800, color: 'var(--qc-blue)', fontSize: '1.1rem' }}>~450 $</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Changement mineur (cabanon, clôture, piscine). Dossier pré-instruit + levé ciblé uniquement sur la zone modifiée en <strong>5-10 j</strong>.
                </p>
              </div>

              <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="borne-badge badge-amber">V3 — Pré-instruit</span>
                  <span style={{ fontWeight: 800, color: 'var(--status-amber)', fontSize: '1.1rem' }}>~780 $</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Pas de certificat antérieur. Les 19 vérifications déterministes livrées clé en main à l'arpenteur qui fait le terrain et le jugement en <strong>7-12 j</strong>.
                </p>
              </div>

              <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="borne-badge badge-rose">V0 — Complexe</span>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem' }}>1 630 $+</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Copropriété divise complexe, litiges d'empiètements, absence de bornes. Plein tarif et expertise humaine intégrale.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 9 — MACHINE VS HUMAIN */}
          <section id="partie-9" style={{ marginBottom: '3rem', scrollMarginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, borderBottom: '2px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              PARTIE 9 — MACHINE CONTRE HUMAIN : OÙ EST LA MARGE D’ERREUR
            </h2>
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Architecture</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'center' }}>Risque matériel / dossier</th>
                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Statut légal & technique</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.6rem 0.8rem' }}><strong>A — Tout humain</strong> (Système actuel)</td>
                    <td style={{ textAlign: 'center', color: 'var(--status-amber)', fontWeight: 700 }}>20 – 56 %</td>
                    <td>Faillibilité documentaire, omissions par fatigue</td>
                  </tr>
                  <tr style={{ backgroundColor: 'var(--bg-rose-subtle)' }}>
                    <td style={{ padding: '0.6rem 0.8rem' }}><strong>B — Tout machine</strong> (Sans arpenteur)</td>
                    <td style={{ textAlign: 'center', color: 'var(--status-rose)', fontWeight: 700 }}>31 – 69 %</td>
                    <td><strong>Illégal (Art. 34-35)</strong> et techniquement inférieur</td>
                  </tr>
                  <tr style={{ backgroundColor: 'var(--status-green-bg)', fontWeight: 700 }}>
                    <td style={{ padding: '0.6rem 0.8rem' }}><strong>C — HYBRIDE (BORNE)</strong> : Machine sur 19, Humain sur 4</td>
                    <td style={{ textAlign: 'center', color: 'var(--status-green)', fontSize: '1rem' }}>12 – 37 %</td>
                    <td><strong>100% Légal aujourd'hui</strong>, réduction du risque de 34 à 42%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SYNTHÈSE */}
          <section 
            id="synthese" 
            style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              border: '2px solid var(--qc-blue)', 
              borderRadius: '12px', 
              padding: '2rem',
              scrollMarginTop: '2rem'
            }}
          >
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--qc-blue)', marginBottom: '1rem' }}>
              En une page — Les 7 points clés
            </h2>
            <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.925rem' }}>
              <li>La règle déclenchant 100 M$ de dépenses <strong>n'est pas une loi</strong> — l'Ordre l'admet lui-même.</li>
              <li>L'État a <strong>déjà payé</strong> pour la matière première : cadastre rénové, LiDAR gratuit, registre modernisé, zonage ouvert.</li>
              <li>Sur 11 heures de travail, <strong>10h sont automatisables et 1h relève du jugement réservé</strong> qu'il faut protéger.</li>
              <li>Sur 23 vérifications, <strong>19 sont déterministes</strong> (machine 4 à 9x plus fiable) et <strong>4 relèvent du jugement</strong> (humain supérieur).</li>
              <li><strong>L'architecture hybride est 100% légale aujourd'hui</strong> et réduit le risque d'erreur de 34 à 42%.</li>
              <li>Économie : <strong>72 M$/an</strong>, 1 138 $/ménage, <strong>324 ETP libérés</strong> pour l'arpentage d'expertise, 379 t de CO₂ évitées.</li>
              <li>La transparence s'obtient en obligeant chacun à écrire et motiver juridiquement ses refus.</li>
            </ol>
          </section>

        </article>
      </div>
    </div>
  );
};
