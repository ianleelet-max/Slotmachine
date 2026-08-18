import type { GrapheCorporatif } from '@auditreq/core';
import { IndexGraphe, creerContexte, analyser } from '@auditreq/core';
import { pool } from './db.js';

/**
 * Persiste un graphe corporatif (ex: jeu de données ouvertes du REQ) en base PostgreSQL.
 */
export async function persisterGraphe(graphe: GrapheCorporatif): Promise<{
  entites: number;
  adresses: number;
  evenements: number;
  flags: number;
}> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('SET search_path TO auditreq, public');

    // Insertion par lots des entités
    for (const e of graphe.entites) {
      await client.query(
        `INSERT INTO entite (id, neq, nom_legal, noms_anterieurs, forme_juridique, statut,
                             code_naics, date_constitution, date_dissolution, structure_connue)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (id) DO UPDATE SET
           nom_legal = EXCLUDED.nom_legal,
           noms_anterieurs = EXCLUDED.noms_anterieurs,
           forme_juridique = EXCLUDED.forme_juridique,
           statut = EXCLUDED.statut,
           date_constitution = EXCLUDED.date_constitution,
           date_dissolution = EXCLUDED.date_dissolution`,
        [
          e.id,
          e.neq,
          e.nomLegal,
          e.nomsAnterieurs,
          e.formeJuridique,
          e.statut,
          e.codeNaics ?? null,
          e.dateConstitution,
          e.dateDissolution ?? null,
          e.structureConnue ?? false,
        ],
      );
    }

    // Insertion par lots des adresses
    for (const a of graphe.adresses) {
      await client.query(
        `INSERT INTO adresse (id, adresse_normalisee, code_postal, domiciliataire_connu)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (id) DO UPDATE SET
           adresse_normalisee = EXCLUDED.adresse_normalisee`,
        [a.id, a.adresseNormalisee, a.codePostal ?? null, a.domiciliataireConnu ?? false],
      );
    }

    // Insertion des liens adresse
    for (const l of graphe.liensAdresse) {
      await client.query(
        `INSERT INTO lien_adresse (id, adresse_id, entite_id, personne_id, type_lien, depuis, jusqu_a)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO NOTHING`,
        [
          l.id,
          l.adresseId,
          l.entiteId ?? null,
          l.personneId ?? null,
          l.typeLien,
          l.depuis,
          l.jusquA ?? null,
        ],
      );
    }

    // Insertion des avis synthétiques pour les événements
    const avisSet = new Set<string>();
    for (const e of graphe.evenements) {
      if (e.avisReqId) avisSet.add(e.avisReqId);
    }
    for (const avisId of avisSet) {
      await client.query(
        `INSERT INTO avis_req (id, type_avis, date_publication, url_source)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO NOTHING`,
        [
          avisId,
          'donnees_ouvertes',
          graphe.provenance?.dateExtraction ?? new Date().toISOString().slice(0, 10),
          'https://www.donneesquebec.ca/recherche/dataset/registre-des-entreprises',
        ],
      );
    }

    // Insertion des événements
    for (const e of graphe.evenements) {
      await client.query(
        `INSERT INTO evenement (id, entite_id, type, date_effective, description, avis_req_id)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO UPDATE SET
           description = EXCLUDED.description`,
        [e.id, e.entiteId, e.type, e.dateEffective, e.description, e.avisReqId],
      );
    }

    // Analyse et détection automatique des signaux de risque
    const index = new IndexGraphe(graphe);
    const { flags, scores } = analyser(creerContexte(index));

    for (const flag of flags) {
      await client.query(
        `INSERT INTO red_flag (entite_id, type_regle, severite, explication, elements_declencheurs)
         VALUES ($1,$2,$3,$4,$5)`,
        [
          flag.entiteId,
          flag.typeRegle,
          flag.severite,
          flag.explication,
          JSON.stringify(flag.elementsDeclencheurs),
        ],
      );
    }

    for (const [entiteId, score] of scores) {
      await client.query(
        `UPDATE entite SET score_risque = $2, niveau_risque = $3 WHERE id = $1`,
        [entiteId, score.score, score.niveau],
      );
    }

    await client.query('COMMIT');

    return {
      entites: graphe.entites.length,
      adresses: graphe.adresses.length,
      evenements: graphe.evenements.length,
      flags: flags.length,
    };
  } catch (erreur) {
    await client.query('ROLLBACK');
    throw erreur;
  } finally {
    client.release();
  }
}
