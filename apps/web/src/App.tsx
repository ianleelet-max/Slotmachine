import { useCallback, useEffect, useRef, useState } from 'react';
import {
  api,
  LIBELLES_REGLES,
  LIBELLES_STATUTS,
  type Evenement,
  type FicheEntite,
  type FlagsEntite,
  type Graphe,
  type ResultatRecherche,
  type TableauDeBord,
  type Ubo,
} from './api';
import {
  BandeauProvenance,
  EcranComparaison,
  EcranDossier,
  EcranDossiers,
  EcranJournal,
} from './dossiers';
import {
  Etiquette,
  EtiquetteRisque,
  VueChronologie,
  VueFiche,
  VueFlags,
  VueGraphe,
  VueUbo,
} from './composants';

type Vue =
  | { nom: 'tableau' }
  | { nom: 'recherche'; requete: string }
  | { nom: 'entite'; id: string }
  | { nom: 'dossiers' }
  | { nom: 'dossier'; id: string }
  | { nom: 'comparaison' }
  | { nom: 'journal' };

type Onglet = 'fiche' | 'graphe' | 'chronologie' | 'ubo' | 'signaux';

const MOTIFS_CORRESPONDANCE: Record<string, string> = {
  neq: 'NEQ',
  nom_exact: 'nom exact',
  nom_partiel: 'nom partiel',
  nom_similaire: 'orthographe voisine',
  nom_anterieur: 'nom antérieur',
};

export default function App() {
  const [vue, setVue] = useState<Vue>({ nom: 'tableau' });
  const [mode, setMode] = useState<'rapide' | 'approfondi'>('approfondi');
  const [saisie, setSaisie] = useState('');
  const champRecherche = useRef<HTMLInputElement>(null);

  // La barre de recherche est le point d'entrée de tous les parcours : elle
  // reste atteignable au clavier depuis n'importe quel écran.
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== champRecherche.current) {
        e.preventDefault();
        champRecherche.current?.focus();
      }
    };
    window.addEventListener('keydown', surTouche);
    return () => window.removeEventListener('keydown', surTouche);
  }, []);

  const ouvrirEntite = useCallback((id: string) => setVue({ nom: 'entite', id }), []);

  return (
    <>
      <header className="app-barre">
        <button className="marque" onClick={() => setVue({ nom: 'tableau' })}>
          <span className="pastille" />
          AudiTREQ
        </button>

        <form
          className="recherche-champ"
          onSubmit={(e) => {
            e.preventDefault();
            if (saisie.trim()) setVue({ nom: 'recherche', requete: saisie.trim() });
          }}
        >
          <input
            ref={champRecherche}
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            placeholder="Rechercher une entité, un NEQ, une personne…"
            aria-label="Recherche"
          />
          <kbd>/</kbd>
        </form>

        <nav className="navigation">
          <button
            aria-current={vue.nom === 'dossiers' || vue.nom === 'dossier'}
            onClick={() => setVue({ nom: 'dossiers' })}
          >
            Dossiers
          </button>
          <button
            aria-current={vue.nom === 'comparaison'}
            onClick={() => setVue({ nom: 'comparaison' })}
          >
            Comparer
          </button>
          <button aria-current={vue.nom === 'journal'} onClick={() => setVue({ nom: 'journal' })}>
            Journal
          </button>
        </nav>

        <div className="bascule-mode">
          <button aria-pressed={mode === 'rapide'} onClick={() => setMode('rapide')}>
            Investigation rapide
          </button>
          <button aria-pressed={mode === 'approfondi'} onClick={() => setMode('approfondi')}>
            Audit approfondi
          </button>
        </div>
      </header>

      <main className="contenu">
        <BandeauProvenance />
        {vue.nom === 'tableau' && (
          <EcranTableau
            onOuvrirEntite={ouvrirEntite}
            onOuvrirDossier={(id) => setVue({ nom: 'dossier', id })}
          />
        )}
        {vue.nom === 'recherche' && (
          <EcranRecherche requete={vue.requete} onOuvrirEntite={ouvrirEntite} />
        )}
        {vue.nom === 'entite' && (
          <EcranEntite id={vue.id} mode={mode} onOuvrirEntite={ouvrirEntite} />
        )}
        {vue.nom === 'dossiers' && (
          <EcranDossiers onOuvrirDossier={(id) => setVue({ nom: 'dossier', id })} />
        )}
        {vue.nom === 'dossier' && <EcranDossier id={vue.id} onOuvrirEntite={ouvrirEntite} />}
        {vue.nom === 'comparaison' && <EcranComparaison />}
        {vue.nom === 'journal' && <EcranJournal />}
      </main>
    </>
  );
}

/* -------------------------------------------------------- Tableau de bord */

function EcranTableau({
  onOuvrirEntite,
  onOuvrirDossier,
}: {
  onOuvrirEntite: (id: string) => void;
  onOuvrirDossier: (id: string) => void;
}) {
  const [donnees, setDonnees] = useState<TableauDeBord | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    api.tableauDeBord().then(setDonnees).catch((e) => setErreur(e.message));
  }, []);

  if (erreur) return <p className="message">Erreur : {erreur}</p>;
  if (!donnees) return <p className="message">Chargement…</p>;

  const { statistiques: s } = donnees;

  return (
    <>
      <div className="grille-stats">
        <div className="carte stat">
          <div className="valeur">{s.dossiersActifs}</div>
          <div className="libelle">Dossiers actifs</div>
        </div>
        <div className="carte stat">
          <div className="valeur">{s.entites}</div>
          <div className="libelle">Entités indexées</div>
        </div>
        <div className="carte stat">
          <div className="valeur">{s.redFlags}</div>
          <div className="libelle">Signaux détectés</div>
        </div>
        <div className="carte stat">
          <div className="valeur">{s.entitesRisqueEleve}</div>
          <div className="libelle">Entités à risque élevé</div>
        </div>
      </div>

      <div className="grille-2">
        <div className="carte">
          <h3>Dossiers actifs</h3>
          {donnees.dossiers.map((d) => (
            <div
              className="ligne"
              key={d.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onOuvrirDossier(d.id)}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{d.nom}</div>
                <div className="sourdine">
                  {d.client} · {d.nb_entites} entité(s)
                  {d.echeance && ` · échéance ${d.echeance.slice(0, 10)}`}
                </div>
              </div>
              <EtiquetteRisque
                score={d.score_max}
                niveau={d.score_max >= 50 ? 'eleve' : d.score_max >= 25 ? 'moyen' : 'faible'}
              />
            </div>
          ))}
        </div>

        <div className="carte">
          <h3>Entités à surveiller</h3>
          {donnees.entitesARisque.map((e) => (
            <div
              className="ligne"
              key={e.entiteId}
              style={{ cursor: 'pointer' }}
              onClick={() => onOuvrirEntite(e.entiteId)}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{e.nom}</div>
                <div className="sourdine">
                  {e.principauxSignaux.map((r) => LIBELLES_REGLES[r] ?? r).join(' · ')}
                </div>
              </div>
              <EtiquetteRisque score={e.score} niveau={e.niveau} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------Recherche */

function EcranRecherche({
  requete,
  onOuvrirEntite,
}: {
  requete: string;
  onOuvrirEntite: (id: string) => void;
}) {
  const [resultats, setResultats] = useState<ResultatRecherche[] | null>(null);
  const [similarite, setSimilarite] = useState(true);

  useEffect(() => {
    setResultats(null);
    api.rechercher(requete, similarite).then((r) => setResultats(r.resultats));
  }, [requete, similarite]);

  return (
    <div className="carte">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ marginBottom: 0 }}>
          Résultats pour « {requete} »{resultats && <span className="sourdine"> — {resultats.length}</span>}
        </h3>
        <label className="sourdine" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={similarite}
            onChange={(e) => setSimilarite(e.target.checked)}
          />
          Similarité orthographique
        </label>
      </div>

      {!resultats && <p className="message">Recherche…</p>}
      {resultats && resultats.length === 0 && (
        <p className="message">Aucun résultat. Essayez une orthographe voisine ou un NEQ.</p>
      )}

      {resultats && resultats.length > 0 && (
        <div className="defilement" style={{ marginTop: 12 }}>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>NEQ</th>
                <th>Statut</th>
                <th>Correspondance</th>
                <th>Risque</th>
              </tr>
            </thead>
            <tbody>
              {resultats.map((r) => (
                <tr
                  key={`${r.type}-${r.id}`}
                  className={r.type === 'entite' ? 'cliquable' : undefined}
                  onClick={() => r.type === 'entite' && onOuvrirEntite(r.id)}
                >
                  <td>
                    {r.libelle}
                    {r.type === 'personne' && <span className="sourdine"> — personne</span>}
                  </td>
                  <td className="neq">{r.neq ?? '—'}</td>
                  <td>{r.statut ? (LIBELLES_STATUTS[r.statut] ?? r.statut) : '—'}</td>
                  <td className="sourdine">
                    {MOTIFS_CORRESPONDANCE[r.motifCorrespondance] ?? r.motifCorrespondance}
                  </td>
                  <td>
                    {r.type === 'entite' ? (
                      <EtiquetteRisque score={r.score ?? 0} niveau={r.niveau ?? 'faible'} />
                    ) : (
                      <Etiquette niveau="neutre" texte="—" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- Entité */

function EcranEntite({
  id,
  mode,
  onOuvrirEntite,
}: {
  id: string;
  mode: 'rapide' | 'approfondi';
  onOuvrirEntite: (id: string) => void;
}) {
  const [onglet, setOnglet] = useState<Onglet>('fiche');
  const [fiche, setFiche] = useState<FicheEntite | null>(null);
  const [graphe, setGraphe] = useState<Graphe | null>(null);
  const [chronologie, setChronologie] = useState<Evenement[] | null>(null);
  const [ubo, setUbo] = useState<Ubo | null>(null);
  const [flags, setFlags] = useState<FlagsEntite | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    setFiche(null);
    setErreur(null);
    // En investigation rapide, on ouvre directement sur les signaux : le
    // professionnel cherche à trancher, pas à lire une fiche complète.
    setOnglet(mode === 'rapide' ? 'signaux' : 'fiche');

    Promise.all([
      api.fiche(id),
      api.graphe(id, 2),
      api.chronologie(id),
      api.ubo(id),
      api.flags(id),
    ])
      .then(([f, g, c, u, fl]) => {
        setFiche(f);
        setGraphe(g);
        setChronologie(c.evenements);
        setUbo(u);
        setFlags(fl);
      })
      .catch((e) => setErreur(e.message));
  }, [id, mode]);

  if (erreur) return <p className="message">Erreur : {erreur}</p>;
  if (!fiche) return <p className="message">Chargement de la structure…</p>;

  const onglets: { cle: Onglet; libelle: string }[] = [
    { cle: 'fiche', libelle: 'Fiche' },
    { cle: 'graphe', libelle: 'Graphe' },
    { cle: 'chronologie', libelle: 'Chronologie' },
    { cle: 'ubo', libelle: 'Bénéficiaires ultimes' },
    { cle: 'signaux', libelle: `Signaux${flags ? ` (${flags.flags.length})` : ''}` },
  ];

  return (
    <>
      <nav className="onglets" role="tablist">
        {onglets.map((o) => (
          <button
            key={o.cle}
            role="tab"
            aria-selected={onglet === o.cle}
            onClick={() => setOnglet(o.cle)}
          >
            {o.libelle}
          </button>
        ))}
      </nav>

      {onglet === 'fiche' && <VueFiche fiche={fiche} onOuvrirEntite={onOuvrirEntite} />}
      {onglet === 'graphe' && graphe && (
        <VueGraphe graphe={graphe} flags={flags} onOuvrirEntite={onOuvrirEntite} />
      )}
      {onglet === 'chronologie' && chronologie && <VueChronologie evenements={chronologie} />}
      {onglet === 'ubo' && ubo && <VueUbo ubo={ubo} />}
      {onglet === 'signaux' && flags && <VueFlags flags={flags} />}
    </>
  );
}
