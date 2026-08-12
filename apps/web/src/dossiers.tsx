import { useEffect, useState } from 'react';
import {
  apiDossiers,
  LIBELLES_ACTIONS,
  LIBELLES_STATUTS,
  type Comparaison,
  type DetailDossier,
  type Dossier,
  type EntreeJournal,
} from './api';
import { Etiquette } from './composants';

/* ---------------------------------------------------------- Liste et création */

export function EcranDossiers({
  onOuvrirDossier,
}: {
  onOuvrirDossier: (id: string) => void;
}) {
  const [dossiers, setDossiers] = useState<Dossier[] | null>(null);
  const [creation, setCreation] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const recharger = () =>
    apiDossiers
      .liste()
      .then((r) => setDossiers(r.dossiers))
      .catch((e) => setErreur(e.message));

  useEffect(() => {
    void recharger();
  }, []);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 17 }}>Dossiers d’audit</h2>
        <button className="bouton primaire" onClick={() => setCreation((v) => !v)}>
          {creation ? 'Annuler' : 'Nouveau dossier'}
        </button>
      </div>

      {creation && (
        <FormulaireDossier
          onCree={(id) => {
            setCreation(false);
            void recharger();
            onOuvrirDossier(id);
          }}
        />
      )}

      {erreur && <p className="message">Erreur : {erreur}</p>}
      {!dossiers && !erreur && <p className="message">Chargement…</p>}

      {dossiers && (
        <div className="carte">
          {dossiers.length === 0 && <p className="sourdine">Aucun dossier ouvert.</p>}
          {dossiers.map((d) => (
            <div
              className="ligne"
              key={d.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onOuvrirDossier(d.id)}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{d.nom}</div>
                <div className="sourdine">
                  {d.id} · {d.client ?? 'sans client'} · {d.nb_entites ?? 0} entité(s)
                  {d.echeance && ` · échéance ${d.echeance.slice(0, 10)}`}
                </div>
              </div>
              <Etiquette
                niveau="neutre"
                texte={d.mode === 'investigation_rapide' ? 'Investigation' : 'Audit'}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function FormulaireDossier({ onCree }: { onCree: (id: string) => void }) {
  const [nom, setNom] = useState('');
  const [client, setClient] = useState('');
  const [finalite, setFinalite] = useState('');
  const [echeance, setEcheance] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      const { id } = await apiDossiers.creer({
        nom,
        client: client || undefined,
        finaliteDeclaree: finalite,
        echeance: echeance || undefined,
      });
      onCree(id);
    } catch (e) {
      setErreur((e as Error).message);
      setEnvoi(false);
    }
  };

  return (
    <form className="carte" onSubmit={soumettre}>
      <h3>Ouvrir un dossier</h3>
      <div className="champ">
        <label htmlFor="nom">Nom du dossier</label>
        <input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
      </div>
      <div className="champ">
        <label htmlFor="client">Client (optionnel)</label>
        <input id="client" value={client} onChange={(e) => setClient(e.target.value)} />
      </div>
      <div className="champ">
        <label htmlFor="finalite">Finalité déclarée</label>
        <textarea
          id="finalite"
          value={finalite}
          onChange={(e) => setFinalite(e.target.value)}
          rows={2}
          required
        />
        {/* La finalité n'est pas administrative : elle documente la base légale
            du traitement et sera reprise au journal d'accès et au rapport. */}
        <p className="sourdine" style={{ margin: '4px 0 0' }}>
          Documente la base légale de la consultation. Reprise au journal d’accès et en tête du
          rapport d’audit.
        </p>
      </div>
      <div className="champ">
        <label htmlFor="echeance">Échéance (optionnelle)</label>
        <input
          id="echeance"
          type="date"
          value={echeance}
          onChange={(e) => setEcheance(e.target.value)}
        />
      </div>
      {erreur && <p className="alerte">{erreur}</p>}
      <button className="bouton primaire" type="submit" disabled={envoi}>
        {envoi ? 'Création…' : 'Créer le dossier'}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------ Détail dossier */

export function EcranDossier({
  id,
  onOuvrirEntite,
}: {
  id: string;
  onOuvrirEntite: (entiteId: string) => void;
}) {
  const [detail, setDetail] = useState<DetailDossier | null>(null);
  const [note, setNote] = useState('');
  const [cible, setCible] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);

  const recharger = () =>
    apiDossiers
      .detail(id)
      .then(setDetail)
      .catch((e) => setErreur(e.message));

  useEffect(() => {
    setDetail(null);
    void recharger();
  }, [id]);

  const ajouterNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    await apiDossiers.annoter(id, note, cible || undefined);
    setNote('');
    void recharger();
  };

  if (erreur) return <p className="message">Erreur : {erreur}</p>;
  if (!detail) return <p className="message">Chargement du dossier…</p>;

  const { dossier } = detail;

  return (
    <>
      <div className="carte">
        <div className="surtitre">Dossier {dossier.id}</div>
        <h2 style={{ fontSize: 19, margin: '6px 0 8px' }}>{dossier.nom}</h2>
        <div className="sourdine">
          {dossier.client ?? 'Sans client'} ·{' '}
          {dossier.mode === 'investigation_rapide' ? 'Investigation rapide' : 'Audit approfondi'}
          {dossier.echeance && ` · échéance ${dossier.echeance.slice(0, 10)}`}
        </div>
        <p style={{ margin: '10px 0 12px' }}>
          <span className="surtitre">Finalité déclarée</span>
          <br />
          {dossier.finalite_declaree}
        </p>
        <a
          className="bouton primaire"
          href={apiDossiers.urlRapport(dossier.id)}
          target="_blank"
          rel="noreferrer"
          style={{ display: 'inline-block', textDecoration: 'none' }}
        >
          Ouvrir le rapport d’audit
        </a>
        <span className="sourdine" style={{ marginLeft: 10 }}>
          Le rapport s’imprime en PDF depuis le navigateur.
        </span>
      </div>

      <div className="grille-2">
        <div className="carte">
          <h3>Entités au dossier</h3>
          {detail.entites.length === 0 && (
            <p className="sourdine">
              Aucune entité. Ouvrez une fiche et utilisez « Ajouter au dossier ».
            </p>
          )}
          {detail.entites.map((e) => (
            <div
              className="ligne"
              key={e.entiteId}
              style={{ cursor: 'pointer' }}
              onClick={() => onOuvrirEntite(e.entiteId)}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{e.nomLegal}</div>
                <div className="sourdine">
                  {e.neq} · {LIBELLES_STATUTS[e.statut ?? ''] ?? e.statut}
                </div>
              </div>
              <Etiquette
                niveau={e.nbSignaux === 0 ? 'neutre' : e.severiteMax}
                texte={e.nbSignaux === 0 ? 'Aucun signal' : `${e.nbSignaux} signal(aux)`}
              />
            </div>
          ))}
        </div>

        <div className="carte">
          <h3>Notes du dossier</h3>
          <form onSubmit={ajouterNote} style={{ marginBottom: 12 }}>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Observation, vérification à faire, pièce à demander…"
              aria-label="Nouvelle note"
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <select
                value={cible}
                onChange={(e) => setCible(e.target.value)}
                aria-label="Entité visée"
                style={{ flex: 1 }}
              >
                <option value="">Note générale</option>
                {detail.entites.map((e) => (
                  <option key={e.entiteId} value={e.entiteId}>
                    {e.nomLegal}
                  </option>
                ))}
              </select>
              <button className="bouton" type="submit">
                Ajouter
              </button>
            </div>
          </form>

          {detail.annotations.length === 0 && <p className="sourdine">Aucune note.</p>}
          {detail.annotations.map((a) => (
            <div className="flag" key={a.id}>
              <div className="sourdine">
                {a.auteur} · {new Date(a.cree_le).toLocaleString('fr-CA')}
                {a.entiteLibelle && ` · ${a.entiteLibelle}`}
              </div>
              <p>{a.contenu}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* --------------------------------------------------------------- Comparaison */

export function EcranComparaison() {
  const [avant, setAvant] = useState('2022-01-01');
  const [apres, setApres] = useState('2024-01-01');
  const [resultat, setResultat] = useState<Comparaison | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const comparer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setResultat(null);
    try {
      setResultat(await apiDossiers.comparer(avant, apres));
    } catch (e) {
      setErreur((e as Error).message);
    }
  };

  const marque = (nature: string) =>
    nature === 'apparu' ? 'faible' : nature === 'disparu' ? 'eleve' : 'moyen';
  const motNature = (nature: string) =>
    nature === 'apparu' ? 'Apparu' : nature === 'disparu' ? 'Disparu' : 'Modifié';

  return (
    <>
      <form className="carte" onSubmit={comparer}>
        <h3>Comparer l’état de la structure entre deux dates</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="champ" style={{ marginBottom: 0 }}>
            <label htmlFor="avant">État au</label>
            <input id="avant" type="date" value={avant} onChange={(e) => setAvant(e.target.value)} />
          </div>
          <div className="champ" style={{ marginBottom: 0 }}>
            <label htmlFor="apres">comparé au</label>
            <input id="apres" type="date" value={apres} onChange={(e) => setApres(e.target.value)} />
          </div>
          <button className="bouton primaire" type="submit">
            Comparer
          </button>
        </div>
        {erreur && (
          <p className="alerte" style={{ marginTop: 12 }}>
            {erreur}
          </p>
        )}
      </form>

      {resultat?.aucunChangement && (
        <div className="carte">
          <p className="sourdine" style={{ margin: 0 }}>
            Aucun changement inscrit au registre entre ces deux dates pour le périmètre observé.
          </p>
        </div>
      )}

      {resultat && !resultat.aucunChangement && (
        <>
          {resultat.detentions.length > 0 && (
            <div className="carte">
              <h3>Détentions</h3>
              {resultat.detentions.map((d) => (
                <div className="ligne" key={d.relationId}>
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {d.detenteurLibelle} → {d.cibleLibelle}
                    </div>
                    <div className="sourdine">
                      {Math.round((d.pourcentageApres ?? d.pourcentageAvant ?? 0) * 100)} % · avis{' '}
                      {d.avisReqId}
                    </div>
                  </div>
                  <Etiquette niveau={marque(d.nature)} texte={motNature(d.nature)} />
                </div>
              ))}
            </div>
          )}

          {resultat.administrations.length > 0 && (
            <div className="carte">
              <h3>Administrateurs</h3>
              {resultat.administrations.map((a) => (
                <div className="ligne" key={a.relationId}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{a.personneLibelle}</div>
                    <div className="sourdine">
                      {a.titre} — {a.entiteLibelle} · avis {a.avisReqId}
                    </div>
                  </div>
                  <Etiquette niveau={marque(a.nature)} texte={motNature(a.nature)} />
                </div>
              ))}
            </div>
          )}

          {resultat.entites.length > 0 && (
            <div className="carte">
              <h3>Entités</h3>
              {resultat.entites.map((e, i) => (
                <div className="ligne" key={`${e.entiteId}-${i}`}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{e.libelle}</div>
                    <div className="sourdine">{e.detail}</div>
                  </div>
                  <Etiquette niveau={marque(e.nature)} texte={motNature(e.nature)} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

/* ------------------------------------------------------------------- Journal */

export function EcranJournal() {
  const [entrees, setEntrees] = useState<EntreeJournal[] | null>(null);

  useEffect(() => {
    apiDossiers.journal().then((r) => setEntrees(r.entrees));
  }, []);

  return (
    <div className="carte">
      <h3>Journal d’accès</h3>
      <p className="sourdine" style={{ marginTop: 0 }}>
        Chaque recherche, consultation et export est inscrit ici. Le journal est en ajout seul :
        aucune entrée ne peut être modifiée ni supprimée, y compris par un administrateur.
      </p>
      {!entrees && <p className="message">Chargement…</p>}
      {entrees && (
        <div className="defilement">
          <table>
            <thead>
              <tr>
                <th>Horodatage</th>
                <th>Utilisateur</th>
                <th>Action</th>
                <th>Dossier</th>
                <th>Détail</th>
              </tr>
            </thead>
            <tbody>
              {entrees.map((e) => (
                <tr key={e.id}>
                  <td className="neq">{new Date(e.horodate).toLocaleString('fr-CA')}</td>
                  <td>{e.utilisateur ?? '—'}</td>
                  <td>{LIBELLES_ACTIONS[e.action] ?? e.action}</td>
                  <td className="neq">{e.dossier_id ?? '—'}</td>
                  <td className="sourdine">
                    {Object.entries(e.contexte ?? {})
                      .map(([cle, valeur]) => `${cle} : ${String(valeur)}`)
                      .join(' · ')}
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
