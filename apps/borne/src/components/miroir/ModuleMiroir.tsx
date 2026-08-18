import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  FileX2, 
  Building2, 
  Download, 
  HelpCircle, 
  AlertOctagon, 
  Filter, 
  ExternalLink,
  PlusCircle,
  FileSpreadsheet,
  Sliders,
  Sparkles
} from 'lucide-react';
import { 
  MOCK_REGISTRE_REFUS, 
  MOCK_FIRMES_PUBLIQUES 
} from '../../data/mockData';
import { REFERENCE_PARAMETERS } from '../../data/referenceParameters';
import { formatCurrency, formatNumber } from '../../utils/crypto';
import { RefusMotif } from '../../types/borne';

interface ModuleMiroirProps {
  lang: 'fr' | 'en';
}

export const ModuleMiroir: React.FC<ModuleMiroirProps> = ({ lang }) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'compteur' | 'prix' | 'refus' | 'firmes' | 'opendata'>('compteur');
  const [refusList, setRefusList] = useState<RefusMotif[]>(MOCK_REGISTRE_REFUS);
  const [showAddRefusModal, setShowAddRefusModal] = useState(false);
  const [selectedFilterIntervenant, setSelectedFilterIntervenant] = useState<string>('tous');

  // Avoidable rent simulation slider
  const [simulatedVolume, setSimulatedVolume] = useState<number>(26420);

  // New Refusal Form State
  const [newIntervenant, setNewIntervenant] = useState<'notaire' | 'prêteur' | 'courtier' | 'assureur'>('notaire');
  const [newInstitution, setNewInstitution] = useState('');
  const [newRegion, setNewRegion] = useState('Montréal');
  const [newMotif, setNewMotif] = useState<any>('âge du certificat (>10 ans)');
  const [newFondementType, setNewFondementType] = useState<any>('politique interne');
  const [newFondementRef, setNewFondementRef] = useState('');

  const handleAddRefus = (e: React.FormEvent) => {
    e.preventDefault();
    const nouveauRefus: RefusMotif = {
      id: `REF-2026-${Date.now().toString().slice(-3)}`,
      dateRefus: new Date().toISOString().split('T')[0],
      typeIntervenant: newIntervenant,
      nomInstitution: newInstitution || 'Étude Notariale Déclarée',
      regionAdministrative: newRegion,
      dateCertificatRefuse: '2014-06-01',
      ageCertificatAnnees: 12.1,
      motifInvoque: newMotif,
      fondementCite: {
        type: newFondementType,
        reference: newFondementRef || 'Aucun article statutaire cité',
      },
      changementFactuelDemontre: false,
      scoreValiditeBorneAuMoment: 96,
    };

    setRefusList([nouveauRefus, ...refusList]);
    setShowAddRefusModal(false);
  };

  const filteredRefusList = refusList.filter((r) => {
    if (selectedFilterIntervenant === 'tous') return true;
    return r.typeIntervenant === selectedFilterIntervenant;
  });

  // Refusal statistics
  const sansFondementCount = refusList.filter(
    (r) => r.fondementCite.type === 'politique interne' || r.fondementCite.type === 'usage' || r.fondementCite.type === 'aucun fondement cité'
  ).length;
  const pctSansFondement = Math.round((sansFondementCount / refusList.length) * 100);

  // Live Avoidable Rent Metrics based on slider
  const coutMeneagesEvitable = simulatedVolume * (REFERENCE_PARAMETERS.TARIF_SUGGERE_OAGQ_2026_UNIFAMILIAL_URBAIN - 120);
  const semainesAttenteCollectives = Math.round(simulatedVolume * 5.2);

  const handleDownloadCSV = () => {
    const headers = 'ID,Date,Intervenant,Institution,Region,AgeCertificat,Motif,FondementType,Reference,ChangementReel\n';
    const rows = refusList.map((r) => `"${r.id}","${r.dateRefus}","${r.typeIntervenant}","${r.nomInstitution}","${r.regionAdministrative}",${r.ageCertificatAnnees},"${r.motifInvoque}","${r.fondementCite.type}","${r.fondementCite.reference}",${r.changementFactuelDemontre}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `registre_refus_borne_quebec_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div>
      {/* Module Title */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="borne-badge badge-blue">MODULE 3</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
              {lang === 'fr' ? 'La transparence publique & Registre des refus' : 'Public Transparency & Refusal Registry'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            BORNE MIROIR
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '800px', marginTop: '0.25rem' }}>
            {lang === 'fr'
              ? 'Accès public libre, gratuit et permanent. Indice des prix réels vs tarif suggéré de l\'Ordre (1 630 $), registre des refus motivés et compteur de rente évitable.'
              : 'Free, public and permanent access. Real price index vs $1,630 OAGQ suggested fee, motivated refusal registry and avoidable rent counter.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddRefusModal(true)}
          className="btn btn-primary"
          style={{ padding: '0.65rem 1.25rem' }}
        >
          <PlusCircle size={16} />
          <span>{lang === 'fr' ? 'Déclarer un refus de certificat' : 'Declare a Refusal'}</span>
        </button>
      </div>

      {/* Sub-navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {[
          { id: 'compteur', label: lang === 'fr' ? 'Compteur de Rente Évitable' : 'Avoidable Rent Counter', icon: DollarSign },
          { id: 'prix', label: lang === 'fr' ? 'Indice des Prix & Délais' : 'Price & Delay Index', icon: BarChart3 },
          { id: 'refus', label: lang === 'fr' ? `Registre des Refus Motivés (${pctSansFondement}% sans loi)` : 'Refusal Registry', icon: FileX2 },
          { id: 'firmes', label: lang === 'fr' ? 'Fiches Publiques des Firmes' : 'Firm Fact Sheets', icon: Building2 },
          { id: 'opendata', label: lang === 'fr' ? 'Données Ouvertes & API' : 'Open Data & API', icon: Download },
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

      {/* SUBTAB 1: COMPTEUR DE RENTE ÉVITABLE (Section 3.4) */}
      {selectedSubTab === 'compteur' && (
        <div>
          <div
            className="borne-card animate-pulse-subtle"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '2px solid var(--qc-blue-border)',
              padding: '2rem',
              textAlign: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <span className="borne-badge badge-blue" style={{ marginBottom: '0.5rem', fontSize: '0.8rem' }}>
              {lang === 'fr' ? 'COMPTEUR PUBLIC QUÉBÉCOIS EN DIRECT' : 'LIVE QUEBEC PUBLIC COUNTER'}
            </span>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Cette année au Québec : dossiers où un certificat valide existait, sans aucun changement sur 7 détecteurs, et où un nouveau certificat a été exigé
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Dossiers refaits inutilement</span>
                <div className="font-tabular" style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--status-rose)', marginTop: '0.25rem' }}>
                  {formatNumber(simulatedVolume)}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>sur 97 214 transactions annuelles</span>
              </div>

              <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Surcoût pour les ménages québécois</span>
                <div className="font-tabular" style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--status-rose)', marginTop: '0.25rem' }}>
                  {formatCurrency(coutMeneagesEvitable)}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>calculé sur le tarif OAGQ 1 630 $</span>
              </div>

              <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Temps d'attente collectif gaspillé</span>
                <div className="font-tabular" style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--status-amber)', marginTop: '0.25rem' }}>
                  {formatNumber(semainesAttenteCollectives)} sem.
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>soit ~2 630 années-personnes</span>
              </div>
            </div>

            {/* Interactive Volume Simulator */}
            <div style={{ marginTop: '1.75rem', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  Simulateur d'adoption et d'impact macroéconomique au Québec :
                </span>
                <span className="font-tabular" style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--qc-blue)' }}>
                  {formatNumber(simulatedVolume)} dossiers ({Math.round((simulatedVolume / 97214) * 100)}% du marché québécois)
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="60000"
                step="500"
                value={simulatedVolume}
                onChange={(e) => setSimulatedVolume(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--qc-blue)' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: INDICE DES PRIX & DÉLAIS (Section 3.1 & 3.2) */}
      {selectedSubTab === 'prix' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {/* Price Index Card */}
          <div className="borne-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Indice des Prix Réels vs Tarif Suggéré OAGQ (1 630 $)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Médiane, P10 et P90 observés par région administrative pour unifamiliale urbaine.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { reg: 'Montréal / Laval', median: 1720, p10: 1550, p90: 2100 },
                { reg: 'Capitale-Nationale / Lévis', median: 1640, p10: 1480, p90: 1950 },
                { reg: 'Montérégie', median: 1610, p10: 1450, p90: 1880 },
                { reg: 'Laurentides / Lanaudière', median: 1780, p10: 1580, p90: 2250 },
                { reg: 'Estrie / Sherbrooke', median: 1590, p10: 1420, p90: 1840 },
                { reg: 'Outaouais / Gatineau', median: 1690, p10: 1500, p90: 2050 },
                { reg: 'Saguenay–Lac-Saint-Jean', median: 1580, p10: 1400, p90: 1820 },
              ].map((p, idx) => (
                <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                    <strong>{p.reg}</strong>
                    <span className="font-tabular" style={{ fontWeight: 800, color: p.median > 1630 ? 'var(--status-rose)' : 'var(--status-green)' }}>
                      Médiane : {formatCurrency(p.median)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    <span>P10 : {formatCurrency(p.p10)}</span>
                    <span style={{ color: 'var(--qc-blue)', fontWeight: 600 }}>Tarif OAGQ : 1 630 $</span>
                    <span>P90 : {formatCurrency(p.p90)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delay Index Card */}
          <div className="borne-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Indice des Délais de Livraison
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Délai promis lors du mandat vs délai réel de remise du certificat final.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { reg: 'Laurentides (Forte demande)', promis: '4 semaines', reel: '7.2 semaines', depassement: '+80%' },
                { reg: 'Montréal Métropole', promis: '4 semaines', reel: '5.8 semaines', depassement: '+45%' },
                { reg: 'Capitale-Nationale', promis: '4 semaines', reel: '4.9 semaines', depassement: '+22%' },
                { reg: 'Montérégie', promis: '4 semaines', reel: '5.1 semaines', depassement: '+27%' },
                { reg: 'Via BORNE Voie V1 (Attestation)', promis: '24-72 heures', reel: '24 heures', depassement: 'Ponctuel (100%)' },
              ].map((d, idx) => (
                <div key={idx} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                    <strong>{d.reg}</strong>
                    <span className={`borne-badge ${d.depassement.startsWith('+') ? 'badge-amber' : 'badge-green'}`}>
                      {d.depassement}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    <span>Promis : {d.promis}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Réel livré : {d.reel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: REGISTRE DES REFUS MOTIVÉS (Section 3.3) */}
      {selectedSubTab === 'refus' && (
        <div>
          {/* Key Metric Banner */}
          <div
            className="borne-card"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderLeft: '6px solid var(--status-rose)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span className="borne-badge badge-rose" style={{ marginBottom: '0.35rem' }}>
                FONDEMENT LÉGAL MANQUANT
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {pctSansFondement}% des refus n'invoquent AUCUN texte de loi
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Motifs réels cités : « politique interne de la banque », « coutume du bureau » ou « règle des 10 ans non codifiée ».
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div className="font-tabular" style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--status-rose)' }}>
                {pctSansFondement}%
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>sur {refusList.length} refus répertoriés</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Filtrer par intervenant :</span>
            {['tous', 'notaire', 'prêteur', 'courtier'].map((inter) => (
              <button
                key={inter}
                onClick={() => setSelectedFilterIntervenant(inter)}
                className={`btn ${selectedFilterIntervenant === inter ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
              >
                {inter.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Table of Refusals */}
          <div className="borne-card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border-medium)', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Date & Région</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Intervenant</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Âge du certificat</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Motif invoqué</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Fondement juridique cité</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>Changement réel ?</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefusList.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <div style={{ fontWeight: 700 }}>{r.dateRefus}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{r.regionAdministrative}</div>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{r.typeIntervenant}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{r.nomInstitution}</div>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }} className="font-tabular">
                      {r.ageCertificatAnnees} ans
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600 }}>
                      {r.motifInvoque}
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <span className={`borne-badge ${r.fondementCite.type === 'loi' ? 'badge-green' : 'badge-rose'}`} style={{ marginBottom: '0.2rem', display: 'inline-block' }}>
                        {r.fondementCite.type}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {r.fondementCite.reference}
                      </div>
                    </td>
                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <span className={`borne-badge ${r.changementFactuelDemontre ? 'badge-amber' : 'badge-green'}`}>
                        {r.changementFactuelDemontre ? 'Oui (modifié)' : 'Non (0 changement)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 4: FICHES PUBLIQUES DES FIRMES (Section 3.5) */}
      {selectedSubTab === 'firmes' && (
        <div>
          <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong>Engagement de neutralité absolue :</strong> Aucune étoile, aucun avis subjectif d'utilisateur, aucun classement commercial. Uniquement des données factuelles vérifiables et un droit de réponse public non censuré pour chaque firme.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {MOCK_FIRMES_PUBLIQUES.map((f) => (
              <div key={f.id} className="borne-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {f.nom}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{f.region}</span>
                  </div>
                  <span className="borne-badge badge-blue">
                    {f.nbArpenteurs} arpenteurs OAGQ
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)', display: 'block' }}>Délai médian :</span>
                    <strong className="font-tabular">{f.delaiMedianJours} jours</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)', display: 'block' }}>Prix médian :</span>
                    <strong className="font-tabular">{formatCurrency(f.prixMedian)}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)', display: 'block' }}>Volume annuel :</span>
                    <strong className="font-tabular">{f.volumeDossiersAn} dossiers</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-tertiary)', display: 'block' }}>Taux de révision :</span>
                    <strong className="font-tabular">{f.tauxRevision}%</strong>
                  </div>
                </div>

                {f.reponsePublique && (
                  <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-blue-subtle)', borderLeft: '3px solid var(--qc-blue)', borderRadius: '4px', fontSize: '0.75rem', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                    <strong>Droit de réponse de la firme :</strong> « {f.reponsePublique} »
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <a href={f.repertoireOagqUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--qc-blue)', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}>
                    <span>Répertoire OAGQ</span>
                    <ExternalLink size={12} />
                  </a>
                  <span style={{ color: 'var(--status-green)' }}>Discipline OAGQ : Vierge</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 5: DONNÉES OUVERTES & API (Section 3.6) */}
      {selectedSubTab === 'opendata' && (
        <div className="borne-card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Miroir Réglementaire & Export de Données Ouvertes
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Tableau de bord statistique destiné à l'Office des professions du Québec, aux ministères, aux chercheurs et aux médias d'enquête.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <FileSpreadsheet size={24} style={{ color: 'var(--qc-blue)', marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Export CSV des Refus Motivés</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0.35rem 0 1rem' }}>
                Données anonymisées complètes (n = {refusList.length}), motifs, fondements juridiques et régions.
              </p>
              <button onClick={handleDownloadCSV} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem' }}>
                <Download size={14} />
                <span>Télécharger le fichier .CSV</span>
              </button>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <BarChart3 size={24} style={{ color: 'var(--status-green)', marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>API Publique JSON</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: '0.35rem 0 1rem' }}>
                Endpoint REST gratuit pour les chercheurs et institutions publiques : <code>https://api.borne.quebec/v1/stats</code>
              </p>
              <button onClick={() => alert('Clé d\'accès développeur générée : borne_pub_qc_2026_88491')} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem' }}>
                <span>Explorer l'API ouverte</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Refusal Modal */}
      {showAddRefusModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="borne-card" style={{ maxWidth: '600px', width: '100%', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              Déclarer un refus de certificat de localisation
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Contribuez à la transparence du marché québécois. Les données sont agrégées et anonymisées conformément à la Loi 25.
            </p>

            <form onSubmit={handleAddRefus} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Intervenant qui refuse</label>
                  <select
                    value={newIntervenant}
                    onChange={(e) => setNewIntervenant(e.target.value as any)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  >
                    <option value="notaire">Notaire instrumentant</option>
                    <option value="prêteur">Prêteur hypothécaire</option>
                    <option value="courtier">Courtier immobilier</option>
                    <option value="assureur">Assureur titres</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Région administrative</label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  >
                    <option value="Montréal">Montréal</option>
                    <option value="Capitale-Nationale">Capitale-Nationale</option>
                    <option value="Montérégie">Montérégie</option>
                    <option value="Laurentides">Laurentides</option>
                    <option value="Laval">Laval</option>
                    <option value="Chaudière-Appalaches">Chaudière-Appalaches</option>
                    <option value="Estrie">Estrie</option>
                    <option value="Outaouais">Outaouais</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Motif invoqué par l'intervenant</label>
                <select
                  value={newMotif}
                  onChange={(e) => setNewMotif(e.target.value as any)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  <option value="âge du certificat (>10 ans)">Âge du certificat supérieur à 10 ans</option>
                  <option value="politique interne de l'institution">Politique interne de l'institution</option>
                  <option value="usage du marché">Usage ou coutume du marché</option>
                  <option value="changement physique identifié">Changement physique constaté</option>
                  <option value="autre">Autre motif</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Type de fondement cité</label>
                <select
                  value={newFondementType}
                  onChange={(e) => setNewFondementType(e.target.value as any)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  <option value="aucun fondement cité">Aucun texte ou article de loi cité</option>
                  <option value="politique interne">Politique interne ou directive d'étude</option>
                  <option value="usage">Usage usuel du formulaire de courtage</option>
                  <option value="loi">Loi ou règlement spécifique (Code civil, Loi A-23)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Précision textuelle (champ libre)</label>
                <input
                  type="text"
                  value={newFondementRef}
                  onChange={(e) => setNewFondementRef(e.target.value)}
                  placeholder="Ex: 'Exigé par la banque sans référence légale'"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddRefusModal(false)} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Enregistrer le refus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
