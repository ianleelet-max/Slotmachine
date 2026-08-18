import React, { useState } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Users, 
  Leaf, 
  Truck, 
  Briefcase, 
  Send, 
  ShieldCheck, 
  FileText,
  DollarSign,
  Bell,
  Sparkles,
  Calendar
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/crypto';
import { REFERENCE_PARAMETERS } from '../../data/referenceParameters';

interface ModulePlaceProps {
  lang: 'fr' | 'en';
}

export const ModulePlace: React.FC<ModulePlaceProps> = ({ lang }) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'commande' | 'bidding' | 'tournees' | 'suivi' | 'espacepro'>('commande');

  // Order Flow State
  const [orderStep, setOrderStep] = useState(1);
  const [orderAddress, setOrderAddress] = useState('142, rue des Sorbiers, Lévis (QC)');
  const [lotNumber, setLotNumber] = useState('3 412 884');
  const [selectedVoie, setSelectedVoie] = useState<'V1' | 'V2' | 'V3' | 'V0'>('V1');

  // Grouped route simulation
  const [groupedPropertiesCount, setGroupedPropertiesCount] = useState(5);
  const [notifSent, setNotifSent] = useState(false);

  const kmSavedPerProperty = 42; // km
  const co2SavedPerKm = 0.27; // kg CO2 / km
  const totalKmSaved = groupedPropertiesCount * kmSavedPerProperty;
  const totalCo2SavedKg = Math.round(totalKmSaved * co2SavedPerKm);

  const handleSimulateNotif = () => {
    setNotifSent(true);
    setTimeout(() => setNotifSent(false), 3000);
  };

  return (
    <div>
      {/* Module Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span className="borne-badge badge-blue">MODULE 4</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
            {lang === 'fr' ? 'L\'orchestrateur de la demande & Place de marché' : 'Demand Orchestrator & Marketplace'}
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          BORNE PLACE
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '800px', marginTop: '0.25rem' }}>
          {lang === 'fr'
            ? 'Commande guidée en 4 minutes, appel d\'offres inversé aux firmes d\'arpentage locales, tournées groupées écologiques et suivi multi-parties en temps réel.'
            : '4-minute guided ordering, reverse bidding to local surveying firms, eco-friendly grouped routes and real-time multi-party tracking.'}
        </p>
      </div>

      {/* Sub-navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {[
          { id: 'commande', label: lang === 'fr' ? 'Commander en 4 minutes' : '4-min Guided Order', icon: ShoppingBag },
          { id: 'bidding', label: lang === 'fr' ? 'Appel d\'Offres Inversé' : 'Reverse Bidding', icon: DollarSign },
          { id: 'tournees', label: lang === 'fr' ? 'Tournées Groupées (Éco-CO₂)' : 'Grouped Routes (CO₂)', icon: Leaf },
          { id: 'suivi', label: lang === 'fr' ? 'Suivi Multi-Parties Direct' : 'Real-time Multi-Party Tracker', icon: Clock },
          { id: 'espacepro', label: lang === 'fr' ? 'Portail Notaires & Courtiers' : 'Notary & Broker Portal', icon: Briefcase },
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

      {/* SUBTAB 1: GUIDED ORDER IN 4 MINUTES */}
      {selectedSubTab === 'commande' && (
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div className="borne-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {lang === 'fr' ? 'Commande d\'évaluation & arpentage' : 'Survey Order Flow'}
              </h3>
              <span className="borne-badge badge-blue">
                Étape {orderStep} / 3
              </span>
            </div>

            {orderStep === 1 && (
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  {lang === 'fr'
                    ? 'Identifiez votre propriété. BORNE interroge instantanément Infolot et le registre pour vérifier si un certificat réutilisable existe déjà.'
                    : 'Identify your property. BORNE checks Infolot and registry to detect reusable certificates.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Adresse municipale</label>
                    <input
                      type="text"
                      value={orderAddress}
                      onChange={(e) => setOrderAddress(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>Lot cadastral rénové</label>
                    <input
                      type="text"
                      value={lotNumber}
                      onChange={(e) => setLotNumber(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-medium)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <button onClick={() => setOrderStep(2)} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                  <span>Analyser les options disponibles</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}

            {orderStep === 2 && (
              <div>
                <div style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--status-green-bg)', border: '1px solid var(--status-green-border)', borderRadius: '6px', marginBottom: '1.25rem' }}>
                  <div style={{ fontWeight: 800, color: 'var(--status-green)', fontSize: '0.9rem' }}>
                    ✓ Certificat antérieur identifié (Minute #4812 / 2015) — SVB : 98/100
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Aucun changement physique sur les 7 détecteurs. Voie V1 recommandée.
                  </div>
                </div>

                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Choisissez la prestation souhaitée :
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  {[
                    {
                      id: 'V1',
                      titre: 'Voie V1 — Attestation professionnelle de non-changement',
                      prix: 120,
                      delai: '24 à 72 heures',
                      desc: 'Idéal si aucun changement n\'a eu lieu. Faisceau de preuves certifié par arpenteur.',
                      rec: true,
                    },
                    {
                      id: 'V2',
                      titre: 'Voie V2 — Mise à jour ciblée (changement mineur)',
                      prix: 450,
                      delai: '3 à 7 jours',
                      desc: 'Levé partiel concentré sur une modification spécifique (piscine, cabanon).',
                      rec: false,
                    },
                    {
                      id: 'V3',
                      titre: 'Voie V3 — Certificat pré-instruit (nouveau complet)',
                      prix: 780,
                      delai: '7 à 12 jours',
                      desc: 'Dossier complet avec levé de terrain 100%, optimisé via le module Dossier.',
                      rec: false,
                    },
                  ].map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVoie(v.id as any)}
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        border: selectedVoie === v.id ? '2px solid var(--qc-blue)' : '1px solid var(--border-medium)',
                        backgroundColor: selectedVoie === v.id ? 'var(--bg-blue-subtle)' : 'var(--bg-tertiary)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong>{v.titre}</strong>
                          {v.rec && <span className="borne-badge badge-green" style={{ fontSize: '0.65rem' }}>Recommandé</span>}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          {v.desc}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div className="font-tabular" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--status-green)' }}>
                          {formatCurrency(v.prix)}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{v.delai}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <button onClick={() => setOrderStep(1)} className="btn btn-secondary">
                    Retour
                  </button>
                  <button onClick={() => setOrderStep(3)} className="btn btn-primary">
                    Confirmer la sélection
                  </button>
                </div>
              </div>
            )}

            {orderStep === 3 && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--status-green-bg)', color: 'var(--status-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  Mandat transmis aux arpenteurs partenaires
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                  Votre dossier pré-instruit a été soumis. Les firmes locales vous répondent avec un prix ferme sous 24h.
                </p>
                <button onClick={() => { setSelectedSubTab('suivi'); setOrderStep(1); }} className="btn btn-primary">
                  Voir le suivi en temps réel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: REVERSE BIDDING ROOM (Section 4.2) */}
      {selectedSubTab === 'bidding' && (
        <div className="borne-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                Salle des Offres Fermes d'Arpentage (Lévis / Chaudière)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Dossier pré-instruit prêt à l'exécution. Les firmes certifiées OAGQ soumettent des devis fermes et dates garanties.
              </p>
            </div>
            <span className="borne-badge badge-blue">
              Enchère inversée active • Clôture dans 3h 12m
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { firme: 'Québec Géomatique & Arpentage SENC', prix: 120, date: 'Demain (17 août)', ponctualite: '99.4%', exp: '24 min', note: 'Voie V1 Attestation' },
              { firme: 'Tremblay & Roy Arpenteurs SENC', prix: 120, date: '18 août', ponctualite: '98.8%', exp: '45 min', note: 'Voie V1 Attestation' },
              { firme: 'Foncier Chaudière SENC', prix: 140, date: '17 août', ponctualite: '97.5%', exp: '1h 10m', note: 'Voie V1 Attestation' },
            ].map((o, idx) => (
              <div key={idx} style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{o.firme}</h4>
                    <span className="borne-badge badge-green" style={{ fontSize: '0.65rem' }}>OAGQ Validé</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                    Historique de ponctualité : <strong style={{ color: 'var(--status-green)' }}>{o.ponctualite}</strong> • Soumis il y a {o.exp}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div className="font-tabular" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--status-green)' }}>
                      {formatCurrency(o.prix)}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Livraison : {o.date}</span>
                  </div>

                  <button onClick={() => alert('Firme sélectionnée ! Le dossier est immédiatement verrouillé.')} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                    Accepter l'offre
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: GROUPED ROUTES & ECO CALCULATOR (Section 4.3) */}
      {selectedSubTab === 'tournees' && (
        <div className="borne-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <Leaf size={24} style={{ color: 'var(--status-green)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              Regroupement Géographique & Éco-Optimisation
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            En regroupant les dossiers du même quartier, BORNE évite les déplacements redondants d'équipes d'arpentage.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-accent-subtle)', borderRadius: '8px', border: '1px solid var(--status-green-border)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>Kilomètres évités pour ce groupe</span>
              <div className="font-tabular" style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--status-green)', marginTop: '0.2rem' }}>
                {totalKmSaved} km
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>sur la tournée de Lévis</span>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-accent-subtle)', borderRadius: '8px', border: '1px solid var(--status-green-border)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>Réduction d'émissions CO₂</span>
              <div className="font-tabular" style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--status-green)', marginTop: '0.2rem' }}>
                {totalCo2SavedKg} kg CO₂
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>pour {groupedPropertiesCount} propriétés regroupées</span>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>Rabais citoyen groupé</span>
              <div className="font-tabular" style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--qc-blue)', marginTop: '0.2rem' }}>
                - 20 %
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>partagé avec la firme d'arpentage</span>
            </div>
          </div>

          {/* Interactive Grouped Tour Slider */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                Nombre de dossiers voisins agrégés dans un rayon de 2 km :
              </span>
              <strong className="font-tabular" style={{ color: 'var(--qc-blue)' }}>
                {groupedPropertiesCount} propriétés
              </strong>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              value={groupedPropertiesCount}
              onChange={(e) => setGroupedPropertiesCount(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--status-green)' }}
            />
          </div>
        </div>
      )}

      {/* SUBTAB 4: REAL-TIME MULTI-PARTY TRACKER (Section 4.4 & 4.5) */}
      {selectedSubTab === 'suivi' && (
        <div className="borne-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                Fil d'Événements Multi-Parties en Temps Réel
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Accès transparent et synchronisé pour le Propriétaire, le Notaire et le Courtier.
              </p>
            </div>

            <button onClick={handleSimulateNotif} className="btn btn-secondary" style={{ fontSize: '0.75rem' }}>
              <Bell size={14} />
              <span>{notifSent ? 'Notification envoyée aux 3 parties !' : 'Simuler alerte multi-parties'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '3px solid var(--qc-blue)', paddingLeft: '1.5rem', marginLeft: '0.5rem' }}>
            {[
              { heure: '16 août 2026, 08:30', titre: 'Commande initiée & 19 vérifications pré-instruites', auteur: 'Système BORNE', statut: 'done' },
              { heure: '16 août 2026, 08:32', titre: 'Validation point par point effectuée par l\'arpenteure', auteur: 'Élise Fortin, a.-g. (#2144)', statut: 'done' },
              { heure: '16 août 2026, 08:34', titre: 'Signature Notarius apposée & empreinte SHA-256 scellée', auteur: 'Notarius / OAGQ', statut: 'done' },
              { heure: '16 août 2026, 08:35', titre: 'Livraison simultanée aux coffres-forts notaire & courtier', auteur: 'Multi-Parties', statut: 'active' },
            ].map((s, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-1.95rem', top: '0.25rem', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: s.statut === 'done' ? 'var(--status-green)' : 'var(--qc-blue)' }} />
                <span className="font-tabular" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{s.heure}</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.titre}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Intervenant : {s.auteur}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 5: BROKER & NOTARY PORTAL (Section 4.6) */}
      {selectedSubTab === 'espacepro' && (
        <div className="borne-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            Portail Dédié Courtiers Immobiliers & Notaires
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Déclenchement en 1 clic dès la prise d'inscription Centris (au lieu d'attendre la promesse d'achat) — élimine 4 semaines de stress et de délai de clôture.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <Briefcase size={22} style={{ color: 'var(--qc-blue)', marginBottom: '0.4rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Espace Courtier OACIQ</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0.85rem' }}>
                Déclenchement du diagnostic SVB gratuit dès la signature du contrat de courtage vendeur.
              </p>
              <button onClick={() => alert('Portefeuille courtier synchronisé avec Centris/Matrix')} className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem' }}>
                Lier mon compte Centris
              </button>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <ShieldCheck size={22} style={{ color: 'var(--status-green)', marginBottom: '0.4rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Espace Notaire CNQ</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0.85rem' }}>
                Téléchargement direct des attestations V1 et dossiers pré-instruits avec preuves opposables.
              </p>
              <button onClick={() => alert('Dossiers d\'actes notariés synchronisés')} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem' }}>
                Accéder aux minutes notariées
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
