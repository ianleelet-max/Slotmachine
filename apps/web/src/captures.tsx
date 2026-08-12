import { useEffect, useState } from 'react';

import { apiCaptures, type Capture, type PersonneCapturee } from './api';
import { Etiquette } from './composants';

const LIBELLES_ROLES: Record<string, string> = {
  administrateur: 'Administrateur',
  dirigeant: 'Dirigeant',
  actionnaire: 'Actionnaire',
  beneficiaire_ultime: 'Bénéficiaire ultime',
  fonde_pouvoir: 'Fondé de pouvoir',
  role_indetermine: 'Rôle indéterminé',
};

const NIVEAUX_CONFIANCE: Record<string, 'faible' | 'moyen' | 'eleve' | 'neutre'> = {
  certain: 'neutre',
  probable: 'moyen',
  incertain: 'eleve',
};

/**
 * File des captures en attente.
 *
 * C'est le point de passage obligé entre ce que le professionnel a consulté au
 * registre et ce qui entre dans son graphe. Rien n'est intégré tant qu'il n'a
 * pas validé : l'écran met donc en avant ce qui mérite d'être relu — champs
 * lus avec une confiance moindre, avertissements du parseur — plutôt que de
 * présenter un résultat lisse et de laisser croire à une lecture parfaite.
 */
export function EcranCaptures() {
  const [captures, setCaptures] = useState<Capture[] | null>(null);
  const [statut, setStatut] = useState<'en_attente' | 'validee' | 'rejetee' | 'toutes'>(
    'en_attente',
  );
  const [enCours, setEnCours] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const recharger = (filtre = statut) =>
    apiCaptures
      .liste(filtre)
      .then((r) => setCaptures(r.captures))
      .catch((e) => setErreur(e.message));

  useEffect(() => {
    setCaptures(null);
    void recharger(statut);
  }, [statut]);

  const traiter = async (id: string, action: 'valider' | 'rejeter') => {
    setEnCours(id);
    setErreur(null);
    setMessage(null);
    try {
      if (action === 'valider') {
        const bilan = await apiCaptures.valider(id);
        setMessage(
          `Capture intégrée : ${bilan.personnesCreees} personne(s), ${bilan.administrations} mandat(s), ` +
            `${bilan.detentions} détention(s)` +
            (bilan.rapprochementsProposes > 0
              ? `, ${bilan.rapprochementsProposes} rapprochement(s) d’identité proposé(s) à trancher.`
              : '.'),
        );
      } else {
        await apiCaptures.rejeter(id);
        setMessage('Capture rejetée. Elle reste consultable au journal.');
      }
      await recharger();
    } catch (e) {
      setErreur((e as Error).message);
    } finally {
      setEnCours(null);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 17 }}>Captures du registre</h2>
        <div className="bascule-mode">
          {(['en_attente', 'validee', 'rejetee', 'toutes'] as const).map((s) => (
            <button key={s} aria-pressed={statut === s} onClick={() => setStatut(s)}>
              {{ en_attente: 'En attente', validee: 'Validées', rejetee: 'Rejetées', toutes: 'Toutes' }[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="carte">
        <p className="sourdine" style={{ margin: 0 }}>
          Ces fiches ont été consultées par vous au registre, puis structurées par l’extension.
          Aucune n’entre dans le graphe avant votre validation. La page d’origine est conservée
          comme pièce justificative : le rapport pourra la citer.
        </p>
      </div>

      {message && <div className="carte" style={{ borderColor: 'var(--accent)' }}>{message}</div>}
      {erreur && <p className="alerte">{erreur}</p>}
      {!captures && !erreur && <p className="message">Chargement…</p>}
      {captures?.length === 0 && (
        <p className="message">
          Aucune capture {statut === 'en_attente' ? 'en attente' : 'dans cette catégorie'}.
        </p>
      )}

      {captures?.map((capture) => (
        <CarteCapture
          key={capture.id}
          capture={capture}
          enCours={enCours === capture.id}
          onTraiter={traiter}
        />
      ))}
    </>
  );
}

function CarteCapture({
  capture,
  enCours,
  onTraiter,
}: {
  capture: Capture;
  enCours: boolean;
  onTraiter: (id: string, action: 'valider' | 'rejeter') => void;
}) {
  const [detail, setDetail] = useState(false);
  const contenu = capture.contenu;

  return (
    <div className="carte">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div className="surtitre">
            Consultée le {new Date(capture.capture_le).toLocaleString('fr-CA')}
            {capture.dossier_nom && ` · ${capture.dossier_nom}`}
          </div>
          <h3 style={{ fontSize: 15, margin: '4px 0 4px' }}>
            {contenu.nomLegal?.valeur ?? 'Entité sans nom lu'}
          </h3>
          <div className="sourdine">
            NEQ {contenu.neq?.valeur ?? '—'} · {contenu.personnes.length} personne(s)
            {contenu.statut?.valeur && ` · ${contenu.statut.valeur}`}
          </div>
        </div>

        {capture.statut === 'en_attente' ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <button className="bouton" disabled={enCours} onClick={() => onTraiter(capture.id, 'rejeter')}>
              Rejeter
            </button>
            <button
              className="bouton primaire"
              disabled={enCours}
              onClick={() => onTraiter(capture.id, 'valider')}
            >
              {enCours ? 'Intégration…' : 'Valider et intégrer'}
            </button>
          </div>
        ) : (
          <Etiquette
            niveau={capture.statut === 'validee' ? 'faible' : 'neutre'}
            texte={capture.statut === 'validee' ? 'Intégrée' : 'Rejetée'}
          />
        )}
      </div>

      {capture.champsARelire.length > 0 && (
        <div className="provenance-limite" style={{ marginTop: 12 }}>
          <b>{capture.champsARelire.length} élément(s) à relire avant validation.</b>
          <div className="sourdine" style={{ marginTop: 4 }}>
            {capture.champsARelire.join(' · ')}
          </div>
        </div>
      )}

      {contenu.avertissements.map((a, i) => (
        <div className="provenance-limite" style={{ marginTop: 8 }} key={i}>
          {a}
        </div>
      ))}

      <button
        className="bouton"
        style={{ marginTop: 12 }}
        onClick={() => setDetail((v) => !v)}
        aria-expanded={detail}
      >
        {detail ? 'Masquer le détail' : `Voir les ${contenu.personnes.length} personnes relevées`}
      </button>

      {detail && (
        <div className="defilement" style={{ marginTop: 10 }}>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Rôle</th>
                <th>Fonction</th>
                <th>Part</th>
                <th>Période</th>
                <th>Lecture</th>
              </tr>
            </thead>
            <tbody>
              {contenu.personnes.map((p, i) => (
                <LignePersonne personne={p} key={i} />
              ))}
            </tbody>
          </table>

          <p className="sourdine" style={{ marginTop: 10 }}>
            Source :{' '}
            <a href={capture.url_source} target="_blank" rel="noreferrer">
              {capture.url_source}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

function LignePersonne({ personne }: { personne: PersonneCapturee }) {
  const confiance = personne.nomComplet.confiance;

  return (
    <tr>
      <td>
        {personne.nomComplet.valeur}
        {personne.estPersonneMorale && <span className="sourdine"> — personne morale</span>}
      </td>
      <td>{LIBELLES_ROLES[personne.role] ?? personne.role}</td>
      <td>{personne.fonction?.valeur ?? '—'}</td>
      <td className="neq">
        {personne.pourcentage
          ? `${Math.round(personne.pourcentage.valeur * 100)} %${
              personne.pourcentage.confiance !== 'certain' ? ' (approx.)' : ''
            }`
          : '—'}
      </td>
      <td className="neq">
        {personne.dateDebut?.valeur ?? '—'} → {personne.dateFin?.valeur ?? 'en cours'}
      </td>
      <td>
        {/* La confiance de lecture est affichée par ligne : c'est ce qui permet
            au professionnel de concentrer sa relecture là où elle compte. */}
        <Etiquette
          niveau={NIVEAUX_CONFIANCE[confiance] ?? 'neutre'}
          texte={
            { certain: 'Lecture nette', probable: 'À confirmer', incertain: 'Douteuse' }[confiance] ??
            confiance
          }
        />
      </td>
    </tr>
  );
}
