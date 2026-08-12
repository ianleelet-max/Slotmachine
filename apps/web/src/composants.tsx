import { useMemo, useState } from 'react';
import {
  LIBELLES_EVENEMENTS,
  LIBELLES_FORMES,
  LIBELLES_REGLES,
  LIBELLES_STATUTS,
  type AreteGraphe,
  type Evenement,
  type FicheEntite,
  type FlagsEntite,
  type Graphe,
  type Niveau,
  type NoeudGraphe,
  type Ubo,
} from './api';

export function Etiquette({ niveau, texte }: { niveau: Niveau | 'neutre'; texte: string }) {
  return <span className={`etiquette ${niveau}`}>{texte}</span>;
}

export function EtiquetteRisque({ score, niveau }: { score: number; niveau: Niveau }) {
  const mots: Record<Niveau, string> = { faible: 'Faible', moyen: 'Moyen', eleve: 'Élevé' };
  return <Etiquette niveau={niveau} texte={`${mots[niveau]} · ${score}`} />;
}

export function Source({ avis }: { avis: string }) {
  return <span className="source">avis {avis}</span>;
}

/* ------------------------------------------------------------------ Fiche */

export function VueFiche({
  fiche,
  onOuvrirEntite,
}: {
  fiche: FicheEntite;
  onOuvrirEntite: (id: string) => void;
}) {
  const { entite, score } = fiche;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="carte">
        <div className="surtitre">
          {LIBELLES_FORMES[entite.formeJuridique] ?? entite.formeJuridique}
        </div>
        <h2 style={{ fontSize: 20, margin: '6px 0 8px' }}>{entite.nomLegal}</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="neq">NEQ {entite.neq}</span>
          <Etiquette niveau="neutre" texte={LIBELLES_STATUTS[entite.statut] ?? entite.statut} />
          {score && <EtiquetteRisque score={score.score} niveau={score.niveau} />}
        </div>
        {entite.nomsAnterieurs.length > 0 && (
          <p className="sourdine" style={{ marginBottom: 0 }}>
            Anciennement : {entite.nomsAnterieurs.join(', ')}
          </p>
        )}
      </div>

      <div className="grille-2">
        <div className="carte">
          <h3>Identité et adresses</h3>
          <div className="ligne">
            <span className="sourdine">Constituée le</span>
            <span>{entite.dateConstitution}</span>
          </div>
          {entite.dateDissolution && (
            <div className="ligne">
              <span className="sourdine">Dissoute le</span>
              <span>{entite.dateDissolution}</span>
            </div>
          )}
          {entite.codeNaics && (
            <div className="ligne">
              <span className="sourdine">Code SCIAN</span>
              <span className="neq">{entite.codeNaics}</span>
            </div>
          )}
          {fiche.adresses.map((a) => (
            <div className="ligne" key={a.id}>
              <span className="sourdine">
                {a.typeLien === 'siege_social' ? 'Siège social' : a.typeLien}
                {!a.actif && ' (antérieur)'}
              </span>
              <span style={{ textAlign: 'right' }}>{a.adresse?.adresseNormalisee}</span>
            </div>
          ))}
        </div>

        <div className="carte">
          <h3>Administrateurs</h3>
          <div className="defilement">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Titre</th>
                  <th>Période</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {fiche.administrateurs.map((a) => (
                  <tr key={a.id}>
                    <td>{a.personne?.nomComplet}</td>
                    <td>{a.titre}</td>
                    <td className="neq">
                      {a.depuis} → {a.jusquA ?? 'en cours'}
                    </td>
                    <td>
                      <Source avis={a.avisReqId} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grille-2">
        <div className="carte">
          <h3>Actionnaires déclarés</h3>
          <div className="defilement">
            <table>
              <thead>
                <tr>
                  <th>Détenteur</th>
                  <th>Part</th>
                  <th>Depuis</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {fiche.actionnaires.map((a) => (
                  <tr
                    key={a.id}
                    className={a.detenteur.type === 'entite' ? 'cliquable' : undefined}
                    onClick={() =>
                      a.detenteur.type === 'entite' && a.detenteur.id
                        ? onOuvrirEntite(a.detenteur.id)
                        : undefined
                    }
                  >
                    <td>{a.detenteur.nomLegal ?? a.detenteur.nomComplet}</td>
                    <td className="neq">{Math.round(a.pourcentage * 100)} %</td>
                    <td className="neq">{a.depuis}</td>
                    <td>
                      <Source avis={a.avisReqId} />
                    </td>
                  </tr>
                ))}
                {fiche.actionnaires.length === 0 && (
                  <tr>
                    <td colSpan={4} className="sourdine">
                      Aucun actionnaire déclaré au registre.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="carte">
          <h3>Participations détenues</h3>
          <div className="defilement">
            <table>
              <thead>
                <tr>
                  <th>Société</th>
                  <th>Part</th>
                  <th>Depuis</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {fiche.participations.map((p) => (
                  <tr
                    key={p.id}
                    className="cliquable"
                    onClick={() => p.cible && onOuvrirEntite(p.cible.id)}
                  >
                    <td>{p.cible?.nomLegal}</td>
                    <td className="neq">{Math.round(p.pourcentage * 100)} %</td>
                    <td className="neq">{p.depuis}</td>
                    <td>
                      <Source avis={p.avisReqId} />
                    </td>
                  </tr>
                ))}
                {fiche.participations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="sourdine">
                      Aucune participation détenue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- Graphe */

interface NoeudPositionne extends NoeudGraphe {
  x: number;
  y: number;
}

/**
 * Disposition hiérarchique par niveau de détention : les détenteurs sont placés
 * au-dessus de ce qu'ils détiennent. On préfère un placement déterministe à une
 * simulation de forces — deux consultations du même dossier doivent donner la
 * même image, faute de quoi une capture d'écran versée en preuve devient
 * irreproductible.
 */
function disposer(graphe: Graphe): { noeuds: NoeudPositionne[]; largeur: number; hauteur: number } {
  const niveaux = new Map<string, number>();
  niveaux.set(graphe.racineId, 0);

  // Parcours en largeur depuis la racine : le détenteur se place un cran
  // au-dessus de ce qu'il détient. Le premier niveau attribué fait foi, ce qui
  // règle le cas des cycles — une boucle de détention n'admet aucun classement
  // par couches, et vouloir la relaxer ferait diverger la disposition.
  const file = [graphe.racineId];
  while (file.length > 0) {
    const courant = file.shift()!;
    const niveauCourant = niveaux.get(courant)!;
    for (const arete of graphe.aretes) {
      if (arete.cible === courant && !niveaux.has(arete.source)) {
        niveaux.set(arete.source, niveauCourant - 1);
        file.push(arete.source);
      }
      if (arete.source === courant && !niveaux.has(arete.cible)) {
        niveaux.set(arete.cible, niveauCourant + 1);
        file.push(arete.cible);
      }
    }
  }

  // Les nœuds isolés du graphe rendu : les personnes au-dessus, par convention.
  for (const noeud of graphe.noeuds) {
    if (!niveaux.has(noeud.id)) niveaux.set(noeud.id, noeud.type === 'personne' ? -1 : 1);
  }

  const parNiveau = new Map<number, NoeudGraphe[]>();
  for (const noeud of graphe.noeuds) {
    const niveau = niveaux.get(noeud.id)!;
    const liste = parNiveau.get(niveau) ?? [];
    liste.push(noeud);
    parNiveau.set(niveau, liste);
  }

  const rangs = [...parNiveau.keys()].sort((a, b) => a - b);
  const largeurColonne = 190;
  const hauteurRangee = 124;
  const largeurMax = Math.max(...[...parNiveau.values()].map((l) => l.length));

  const noeuds: NoeudPositionne[] = [];
  rangs.forEach((rang, indexRang) => {
    const liste = parNiveau.get(rang)!;
    liste.sort((a, b) => a.libelle.localeCompare(b.libelle));
    liste.forEach((noeud, i) => {
      const decalage = (largeurMax - liste.length) / 2;
      noeuds.push({
        ...noeud,
        x: (decalage + i) * largeurColonne + largeurColonne / 2,
        y: indexRang * hauteurRangee + 60,
      });
    });
  });

  return {
    noeuds,
    largeur: largeurMax * largeurColonne + 40,
    hauteur: rangs.length * hauteurRangee + 80,
  };
}

export function VueGraphe({
  graphe,
  flags,
  onOuvrirEntite,
}: {
  graphe: Graphe;
  flags: FlagsEntite | null;
  onOuvrirEntite: (id: string) => void;
}) {
  const [selection, setSelection] = useState<string>(graphe.racineId);
  const { noeuds, largeur, hauteur } = useMemo(() => disposer(graphe), [graphe]);
  const positions = new Map(noeuds.map((n) => [n.id, n]));
  const noeudSelectionne = positions.get(selection);

  const fractionsParCible = useMemo(() => {
    const carte = new Map<string, string[]>();
    for (const arete of graphe.aretes) {
      const liste = carte.get(arete.cible) ?? [];
      liste.push(arete.id);
      carte.set(arete.cible, liste);
    }
    return carte;
  }, [graphe]);

  const couleurArete = (a: AreteGraphe) =>
    a.enCycle ? 'var(--risque-eleve)' : 'var(--border)';

  return (
    <div className="graphe-cadre">
      <div className="graphe-toile">
        <div className="graphe-legende" role="note">
          <span>
            <i style={{ background: 'var(--surface)', border: '1.5px solid var(--text-2)' }} />
            Entité
          </span>
          <span>
            <i
              style={{
                background: 'var(--surface)',
                border: '1.5px solid var(--text-2)',
                borderRadius: '50%',
              }}
            />
            Personne
          </span>
          <span>
            <i
              style={{
                background: 'var(--risque-eleve-fond)',
                border: '1.5px solid var(--risque-eleve)',
              }}
            />
            Risque élevé
          </span>
          <span>
            <i style={{ background: 'var(--risque-eleve)', height: 2, borderRadius: 0 }} />
            Relation en cycle
          </span>
        </div>

        <svg width={largeur} height={hauteur} role="img" aria-label="Graphe de propriété">
          {graphe.aretes.map((arete) => {
            const source = positions.get(arete.source);
            const cible = positions.get(arete.cible);
            if (!source || !cible) return null;
            // Plusieurs arêtes convergeant vers un même nœud suivent des
            // trajets voisins : on échelonne leurs libellés le long du segment
            // pour qu'ils ne se recouvrent pas.
            const rang = (fractionsParCible.get(arete.cible) ?? []).indexOf(arete.id);
            const fraction = 0.3 + (rang < 0 ? 0 : rang % 3) * 0.14;
            return (
              <g key={arete.id}>
                <line
                  x1={source.x}
                  y1={source.y + 18}
                  x2={cible.x}
                  y2={cible.y - 18}
                  stroke={couleurArete(arete)}
                  strokeWidth={arete.enCycle ? 1.8 : 1.4}
                  strokeDasharray={arete.actif ? undefined : '4 3'}
                />
                {arete.type === 'detention' && (
                  // Le libellé est placé au tiers du segment plutôt qu'en son
                  // milieu : sur un montage dense, tous les milieux se
                  // rejoignent au centre de la figure et les textes se
                  // superposent.
                  <text
                    className="arete-libelle"
                    x={source.x + (cible.x - source.x) * fraction}
                    y={source.y + (cible.y - source.y) * fraction}
                    textAnchor="middle"
                  >
                    {arete.libelle}
                  </text>
                )}
              </g>
            );
          })}

          {noeuds.map((noeud) => {
            const estSelection = noeud.id === selection;
            const fond =
              noeud.niveau === 'eleve'
                ? 'var(--risque-eleve-fond)'
                : noeud.niveau === 'moyen'
                  ? 'var(--risque-moyen-fond)'
                  : 'var(--surface)';
            const contour =
              noeud.niveau === 'eleve'
                ? 'var(--risque-eleve)'
                : noeud.niveau === 'moyen'
                  ? 'var(--risque-moyen)'
                  : 'var(--text-2)';

            return (
              <g
                key={noeud.id}
                className="noeud"
                transform={`translate(${noeud.x},${noeud.y})`}
                onClick={() => setSelection(noeud.id)}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelection(noeud.id)}
              >
                {noeud.type === 'entite' ? (
                  <rect
                    x={-78}
                    y={-19}
                    width={156}
                    height={38}
                    rx={6}
                    fill={fond}
                    stroke={contour}
                    strokeWidth={estSelection ? 2.5 : 1.5}
                  />
                ) : (
                  <circle
                    r={26}
                    fill={fond}
                    stroke={contour}
                    strokeWidth={estSelection ? 2.5 : 1.5}
                  />
                )}
                <text
                  textAnchor="middle"
                  // Un nom de personne dépasse presque toujours du cercle : on
                  // le pose dessous plutôt que de le tronquer.
                  y={noeud.type === 'entite' ? -1 : 42}
                  fontSize={10.5}
                >
                  {noeud.libelle.length > 24 ? `${noeud.libelle.slice(0, 23)}…` : noeud.libelle}
                </text>
                {noeud.type === 'entite' && (
                  <text
                    textAnchor="middle"
                    y={12}
                    fontSize={9}
                    fill="var(--text-3)"
                    style={{ fill: 'var(--text-3)' }}
                  >
                    {noeud.neq}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <aside className="graphe-panneau">
        {noeudSelectionne ? (
          <>
            <div className="surtitre">Nœud sélectionné</div>
            <h3 style={{ fontSize: 14, margin: '6px 0 8px' }}>{noeudSelectionne.libelle}</h3>
            {noeudSelectionne.type === 'entite' && (
              <>
                <p className="sourdine" style={{ margin: '0 0 10px' }}>
                  NEQ {noeudSelectionne.neq} ·{' '}
                  {LIBELLES_STATUTS[noeudSelectionne.statut ?? ''] ?? noeudSelectionne.statut}
                </p>
                <EtiquetteRisque score={noeudSelectionne.score} niveau={noeudSelectionne.niveau} />
                <button
                  className="bouton"
                  style={{ width: '100%', marginTop: 12 }}
                  onClick={() => onOuvrirEntite(noeudSelectionne.id)}
                >
                  Ouvrir la fiche
                </button>
              </>
            )}

            {noeudSelectionne.id === graphe.racineId && flags && flags.flags.length > 0 && (
              <>
                <div className="surtitre" style={{ marginTop: 16 }}>
                  Signaux détectés
                </div>
                {flags.flags.map((f, i) => (
                  <div className="flag" key={i}>
                    <Etiquette niveau={f.severite === 'info' ? 'faible' : f.severite} texte={LIBELLES_REGLES[f.typeRegle] ?? f.typeRegle} />
                    <p>{f.explication}</p>
                  </div>
                ))}
              </>
            )}
          </>
        ) : (
          <p className="sourdine">Sélectionnez un nœud du graphe.</p>
        )}
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------ Chronologie */

const EVENEMENTS_CRITIQUES = new Set([
  'dissolution',
  'radiation',
  'faillite',
  'proposition_concordataire',
]);
const EVENEMENTS_SENSIBLES = new Set(['transfert_actions', 'changement_administrateur']);

export function VueChronologie({ evenements }: { evenements: Evenement[] }) {
  return (
    <div className="carte">
      <h3>Chronologie de l’entité et de son voisinage</h3>
      <div className="chrono">
        {evenements.map((e) => {
          const gravite = EVENEMENTS_CRITIQUES.has(e.type)
            ? 'eleve'
            : EVENEMENTS_SENSIBLES.has(e.type)
              ? 'moyen'
              : '';
          return (
            <div className="chrono-item" key={e.id}>
              <div className="chrono-date">{e.dateEffective}</div>
              <div className="chrono-axe">
                <div className={`chrono-point ${gravite}`} />
              </div>
              <div className="chrono-corps">
                <div className="titre">
                  {LIBELLES_EVENEMENTS[e.type] ?? e.type}
                  {!e.estEntitePrincipale && e.entite && (
                    <span className="sourdine"> — {e.entite}</span>
                  )}
                </div>
                <div className="sourdine">{e.description}</div>
                <Source avis={e.avisReqId} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- UBO */

export function VueUbo({ ubo }: { ubo: Ubo }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {ubo.indetermine && (
        <div className="alerte">
          Bénéficiaires ultimes partiellement indéterminés : une branche de la chaîne de
          détention boucle sur elle-même. La liste ci-dessous n’est pas exhaustive.
        </div>
      )}

      <div className="carte">
        <h3>Bénéficiaires effectifs (seuil de 25 %)</h3>
        {ubo.beneficiaires.length === 0 && (
          <p className="sourdine">
            Aucune personne physique n’atteint le seuil de contrôle par la chaîne déclarée.
          </p>
        )}
        {ubo.beneficiaires.map((b) => (
          <div className="ligne" key={b.personneId} style={{ alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{b.personne?.nomComplet}</div>
              <div className="chaine-ubo">
                {b.chaine.map((m, i) => (
                  <span className="maillon" key={i}>
                    {m.deLibelle} → {m.versLibelle} ({Math.round(m.pourcentage * 100)} %)
                  </span>
                ))}
              </div>
            </div>
            <span className="neq" style={{ fontSize: 15, fontWeight: 700 }}>
              {(b.pourcentageEffectif * 100).toFixed(1)} %
            </span>
          </div>
        ))}
      </div>

      {ubo.cheminsSousSeuil.length > 0 && (
        <div className="carte">
          <h3>Détenteurs sous le seuil</h3>
          {ubo.cheminsSousSeuil.map((b) => (
            <div className="ligne" key={b.personneId}>
              <span>{b.personne?.nomComplet}</span>
              <span className="neq">{(b.pourcentageEffectif * 100).toFixed(1)} %</span>
            </div>
          ))}
        </div>
      )}

      {ubo.anglesMorts.length > 0 && (
        <div className="carte">
          <h3>Ce que le registre ne permet pas d’établir</h3>
          {ubo.anglesMorts.map((a, i) => (
            <div className="flag" key={i}>
              <Etiquette niveau="moyen" texte={a.motif.replaceAll('_', ' ')} />
              <p>{a.explication}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- Red  flags */

export function VueFlags({ flags }: { flags: FlagsEntite }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="carte">
        <h3>Décomposition du score</h3>
        <div className="ligne">
          <span>Score composite</span>
          <EtiquetteRisque score={flags.score} niveau={flags.niveau} />
        </div>
        {flags.contributions.map((c) => (
          <div className="ligne" key={c.typeRegle}>
            <span>
              {LIBELLES_REGLES[c.typeRegle] ?? c.typeRegle}
              {c.occurrences > 1 && <span className="sourdine"> × {c.occurrences}</span>}
            </span>
            <span className="neq">+{c.points}</span>
          </div>
        ))}
        {flags.bonusFaisceau > 0 && (
          <div className="ligne">
            <span>
              Faisceau d’indices concordants
              <div className="sourdine">
                Trois règles distinctes ou plus se recoupent sur la même entité.
              </div>
            </span>
            <span className="neq">+{flags.bonusFaisceau}</span>
          </div>
        )}
      </div>

      <div className="carte">
        <h3>Signaux détectés</h3>
        {flags.flags.length === 0 && (
          <p className="sourdine">Aucun signal détecté sur cette entité.</p>
        )}
        {flags.flags.map((f, i) => (
          <div className="flag" key={i}>
            <Etiquette
              niveau={f.severite === 'info' ? 'faible' : f.severite}
              texte={LIBELLES_REGLES[f.typeRegle] ?? f.typeRegle}
            />
            <p>{f.explication}</p>
            {f.elementsNommes && (
              <div className="chaine-ubo">
                {f.elementsNommes.entites.map((e) => (
                  <span className="maillon" key={e.id}>
                    {e.libelle}
                  </span>
                ))}
                {f.elementsNommes.personnes.map((p) => (
                  <span className="maillon" key={p.id}>
                    {p.libelle}
                  </span>
                ))}
                {f.elementsNommes.avisReq.map((a) => (
                  <span className="maillon" key={a}>
                    <Source avis={a} />
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
