import type { FastifyInstance } from 'fastify';
import {
  captureExploitable,
  champsIncertains,
  interpreter,
  type CaptureFiche,
  type ExtraitPage,
  type PersonneCapturee,
} from '@auditreq/capture';
import { similariteNomPersonne } from '@auditreq/core';
import type pg from 'pg';

import { pool } from './db.js';
import { journaliser } from './dossiers.js';

/**
 * Réception et validation des captures assistées.
 *
 * Le principe qui gouverne ce module : **une capture n'entre jamais seule dans
 * le graphe**. Elle est reçue, interprétée, conservée avec l'extrait brut de la
 * page, puis attend qu'un professionnel la valide explicitement. Ce n'est
 * qu'alors que des personnes et des relations sont créées — avec, comme toute
 * relation du graphe, une source identifiable : la consultation elle-même,
 * horodatée et rattachée à son URL.
 *
 * Aucune route de ce module ne consulte le registre. L'extension envoie ce que
 * l'utilisateur a ouvert lui-même ; le serveur ne va rien chercher.
 */

const UTILISATEUR_COURANT = 'U1';

/** Au-delà de ce seuil, deux graphies sont proposées au rapprochement — jamais fusionnées. */
const SEUIL_RAPPROCHEMENT = 0.9;

export function enregistrerRoutesCaptures(app: FastifyInstance): void {
  app.post<{ Body: { extrait: ExtraitPage; dossierId?: string } }>(
    '/api/captures',
    async (requete, reponse) => {
      const extrait = requete.body?.extrait;
      if (!extrait?.url || !Array.isArray(extrait.sections)) {
        return reponse.code(400).send({ erreur: 'Extrait de page absent ou mal formé.' });
      }

      const capture = interpreter(extrait);

      const resultat = await pool.query(
        `INSERT INTO capture (dossier_id, url_source, capture_le, neq, contenu, extrait_brut)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, cree_le`,
        [
          requete.body.dossierId ?? null,
          extrait.url,
          extrait.extraitLe ?? new Date().toISOString(),
          capture.neq?.valeur ?? null,
          JSON.stringify(capture),
          JSON.stringify(extrait),
        ],
      );

      await journaliser(
        'capture.reception',
        {
          neq: capture.neq?.valeur ?? null,
          personnes: capture.personnes.length,
          url: extrait.url,
        },
        requete.body.dossierId,
      );

      return reponse.code(201).send({
        id: resultat.rows[0]!.id,
        capture,
        exploitable: captureExploitable(capture),
        champsARelire: champsIncertains(capture),
      });
    },
  );

  app.get<{ Querystring: { statut?: string } }>('/api/captures', async (requete) => {
    const statut = requete.query.statut ?? 'en_attente';
    const resultat = await pool.query(
      `SELECT c.id, c.dossier_id, c.url_source, c.capture_le, c.neq, c.contenu,
              c.statut, c.motif_rejet, c.traitee_le, d.nom AS dossier_nom
       FROM capture c
       LEFT JOIN dossier d ON d.id = c.dossier_id
       WHERE ($1 = 'toutes' OR c.statut = $1)
       ORDER BY c.cree_le DESC
       LIMIT 100`,
      [statut],
    );

    return {
      captures: resultat.rows.map((r) => ({
        ...r,
        champsARelire: champsIncertains(r.contenu as CaptureFiche),
      })),
    };
  });

  app.post<{ Params: { id: string } }>('/api/captures/:id/valider', async (requete, reponse) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const enregistrement = await client.query(
        `SELECT * FROM capture WHERE id = $1 FOR UPDATE`,
        [requete.params.id],
      );
      if (enregistrement.rowCount === 0) {
        await client.query('ROLLBACK');
        return reponse.code(404).send({ erreur: 'Capture introuvable' });
      }

      const ligne = enregistrement.rows[0]!;
      if (ligne.statut !== 'en_attente') {
        await client.query('ROLLBACK');
        return reponse.code(409).send({ erreur: `Capture déjà ${ligne.statut}.` });
      }

      const capture = ligne.contenu as CaptureFiche;
      if (!captureExploitable(capture)) {
        await client.query('ROLLBACK');
        return reponse.code(422).send({
          erreur:
            'Capture inexploitable : il faut au moins un NEQ ou un nom légal, et une personne.',
        });
      }

      const bilan = await integrerAuGraphe(client, ligne.id, capture);

      await client.query(
        `UPDATE capture SET statut = 'validee', traitee_par = $2, traitee_le = now() WHERE id = $1`,
        [ligne.id, UTILISATEUR_COURANT],
      );
      await client.query('COMMIT');

      await journaliser(
        'capture.validation',
        { captureId: ligne.id, ...bilan },
        ligne.dossier_id ?? undefined,
      );

      return { statut: 'validee', ...bilan };
    } catch (erreur) {
      await client.query('ROLLBACK');
      throw erreur;
    } finally {
      client.release();
    }
  });

  app.post<{ Params: { id: string }; Body: { motif?: string } }>(
    '/api/captures/:id/rejeter',
    async (requete, reponse) => {
      const resultat = await pool.query(
        `UPDATE capture SET statut = 'rejetee', motif_rejet = $2, traitee_par = $3, traitee_le = now()
         WHERE id = $1 AND statut = 'en_attente'
         RETURNING id, dossier_id`,
        [requete.params.id, requete.body?.motif ?? null, UTILISATEUR_COURANT],
      );

      if (resultat.rowCount === 0) {
        return reponse.code(409).send({ erreur: 'Capture introuvable ou déjà traitée.' });
      }

      await journaliser(
        'capture.rejet',
        { captureId: requete.params.id, motif: requete.body?.motif ?? null },
        resultat.rows[0]!.dossier_id ?? undefined,
      );
      return { statut: 'rejetee' };
    },
  );
}

interface BilanIntegration {
  entiteId: string;
  personnesCreees: number;
  administrations: number;
  detentions: number;
  rapprochementsProposes: number;
}

/**
 * Crée l'entité, les personnes et les relations issues d'une capture validée.
 *
 * Deux garde-fous, tous deux structurants :
 *
 * - **Aucune fusion d'identité automatique.** Une personne homonyme déjà
 *   présente ne devient pas la même personne : on crée une fiche distincte et
 *   on inscrit une proposition de rapprochement, qu'un humain tranchera.
 * - **Aucune relation sans source.** La consultation elle-même devient un avis
 *   au sens du graphe, avec son URL et son horodatage.
 */
async function integrerAuGraphe(
  client: pg.PoolClient,
  captureId: string,
  capture: CaptureFiche,
): Promise<BilanIntegration> {
  const avisId = `CAPTURE-${captureId}`;
  await client.query(
    `INSERT INTO avis_req (id, type_avis, date_publication, url_source)
     VALUES ($1, 'capture_assistee', $2::timestamptz::date, $3)
     ON CONFLICT (id) DO NOTHING`,
    [avisId, capture.captureLe, capture.urlSource],
  );

  const entiteId = capture.neq?.valeur ?? `CAPT-${captureId}`;
  await client.query(
    `INSERT INTO entite (id, neq, nom_legal, forme_juridique, statut, date_constitution)
     VALUES ($1, $2, $3, 'autre', 'immatriculee', current_date)
     ON CONFLICT (id) DO UPDATE
       SET nom_legal = COALESCE(EXCLUDED.nom_legal, entite.nom_legal)`,
    [entiteId, entiteId, capture.nomLegal?.valeur ?? `Entité ${entiteId}`],
  );

  const bilan: BilanIntegration = {
    entiteId,
    personnesCreees: 0,
    administrations: 0,
    detentions: 0,
    rapprochementsProposes: 0,
  };

  for (const personne of capture.personnes) {
    if (personne.estPersonneMorale) {
      // Une personne morale actionnaire est une entité, pas un individu : on la
      // rattache comme telle plutôt que d'en faire une fiche de personne.
      await integrerDetentionMorale(client, entiteId, personne, avisId);
      bilan.detentions += 1;
      continue;
    }

    const personneId = `PC-${captureId}-${bilan.personnesCreees + 1}`;
    await client.query(
      `INSERT INTO personne (id, nom_complet, score_confiance_identite)
       VALUES ($1, $2, $3)`,
      [
        personneId,
        personne.nomComplet.valeur,
        personne.nomComplet.confiance === 'certain' ? 1 : 0.8,
      ],
    );
    bilan.personnesCreees += 1;

    bilan.rapprochementsProposes += await proposerRapprochements(client, personneId, personne);

    if (personne.role === 'actionnaire' || personne.role === 'beneficiaire_ultime') {
      if (personne.pourcentage) {
        await client.query(
          `INSERT INTO relation_detention
             (id, source_personne_id, cible_entite_id, pourcentage, type_titre, depuis, avis_req_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            `DC-${captureId}-${bilan.detentions + 1}`,
            personneId,
            entiteId,
            personne.pourcentage.valeur,
            personne.role === 'beneficiaire_ultime' ? 'bénéficiaire ultime déclaré' : null,
            personne.dateDebut?.valeur ?? capture.captureLe.slice(0, 10),
            avisId,
          ],
        );
        bilan.detentions += 1;
      }
      continue;
    }

    await client.query(
      `INSERT INTO relation_administration (id, personne_id, entite_id, titre, depuis, jusqu_a, avis_req_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        `AC-${captureId}-${bilan.administrations + 1}`,
        personneId,
        entiteId,
        personne.fonction?.valeur ?? 'Administrateur',
        personne.dateDebut?.valeur ?? capture.captureLe.slice(0, 10),
        personne.dateFin?.valeur ?? null,
        avisId,
      ],
    );
    bilan.administrations += 1;
  }

  return bilan;
}

async function integrerDetentionMorale(
  client: pg.PoolClient,
  cibleEntiteId: string,
  personne: PersonneCapturee,
  avisId: string,
): Promise<void> {
  const identifiant = `MORALE-${normaliserIdentifiant(personne.nomComplet.valeur)}`;
  await client.query(
    `INSERT INTO entite (id, neq, nom_legal, forme_juridique, statut, date_constitution)
     VALUES ($1, $1, $2, 'autre', 'immatriculee', current_date)
     ON CONFLICT (id) DO NOTHING`,
    [identifiant, personne.nomComplet.valeur],
  );

  if (!personne.pourcentage) return;

  await client.query(
    `INSERT INTO relation_detention
       (id, source_entite_id, cible_entite_id, pourcentage, depuis, avis_req_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO NOTHING`,
    [
      `DM-${avisId}-${identifiant}`,
      identifiant,
      cibleEntiteId,
      personne.pourcentage.valeur,
      personne.dateDebut?.valeur ?? new Date().toISOString().slice(0, 10),
      avisId,
    ],
  );
}

/** Inscrit une proposition de rapprochement pour chaque homonyme proche. */
async function proposerRapprochements(
  client: pg.PoolClient,
  personneId: string,
  personne: PersonneCapturee,
): Promise<number> {
  const candidates = await client.query(
    `SELECT id, nom_complet FROM personne WHERE id <> $1`,
    [personneId],
  );

  let proposees = 0;
  for (const candidate of candidates.rows) {
    const similarite = similariteNomPersonne(personne.nomComplet.valeur, candidate.nom_complet);
    if (similarite < SEUIL_RAPPROCHEMENT) continue;

    await client.query(
      `INSERT INTO resolution_identite (id, personne_a_id, personne_b_id, score_similarite, statut)
       VALUES ($1, $2, $3, $4, 'proposee')
       ON CONFLICT (id) DO NOTHING`,
      [`RI-${personneId}-${candidate.id}`, personneId, candidate.id, similarite.toFixed(2)],
    );
    proposees += 1;
  }

  return proposees;
}

function normaliserIdentifiant(nom: string): string {
  return nom
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .slice(0, 40);
}
