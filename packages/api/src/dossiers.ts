import type { FastifyInstance } from 'fastify';
import {
  comparerStructures,
  composerRapport,
  type IdentifiantEntite,
  type IndexGraphe,
  type RedFlag,
} from '@auditreq/core';

import { pool } from './db.js';
import { rendreRapportHtml } from './rapport-html.js';

/**
 * Utilisateur courant. L'authentification (SSO, MFA) est un chantier V1 à part
 * entière ; d'ici là, toutes les écritures sont attribuées à l'utilisateur de
 * démonstration, et c'est cette valeur qui alimente le journal d'accès. La
 * traçabilité est structurellement en place, seule l'identité reste à brancher.
 */
const UTILISATEUR_COURANT = 'U1';

export interface DependancesDossiers {
  index: () => IndexGraphe;
  flags: () => RedFlag[];
}

/** Écrit une entrée du journal d'accès. Toute consultation ou export y passe. */
export async function journaliser(
  action: string,
  contexte: Record<string, unknown>,
  dossierId?: string,
  finalite?: string,
): Promise<void> {
  await pool.query(
    `INSERT INTO journal_acces (utilisateur_id, dossier_id, action, finalite, contexte)
     VALUES ($1, $2, $3, $4, $5)`,
    [UTILISATEUR_COURANT, dossierId ?? null, action, finalite ?? null, JSON.stringify(contexte)],
  );
}

export function enregistrerRoutesDossiers(app: FastifyInstance, deps: DependancesDossiers): void {
  // -------------------------------------------------------------------------
  // Dossiers
  // -------------------------------------------------------------------------

  app.get('/api/dossiers', async () => {
    const resultat = await pool.query(
      `SELECT d.id, d.nom, d.client, d.finalite_declaree, d.mode, d.statut, d.echeance, d.cree_le,
              coalesce(count(de.entite_id) FILTER (WHERE de.entite_id IS NOT NULL), 0)::int AS nb_entites
       FROM dossier d
       LEFT JOIN dossier_entite de ON de.dossier_id = d.id
       GROUP BY d.id
       ORDER BY d.cree_le DESC`,
    );
    return { dossiers: resultat.rows };
  });

  app.post<{
    Body: { nom: string; client?: string; finaliteDeclaree: string; mode?: string; echeance?: string };
  }>('/api/dossiers', async (requete, reponse) => {
    const { nom, client, finaliteDeclaree, mode, echeance } = requete.body ?? {};

    // La finalité déclarée n'est pas un champ de confort : elle documente la
    // base légale du traitement (Loi 25) et figure au journal d'accès. Un
    // dossier sans finalité ne doit pas pouvoir exister.
    if (!nom?.trim() || !finaliteDeclaree?.trim()) {
      return reponse.code(400).send({
        erreur: 'Le nom du dossier et la finalité déclarée sont requis.',
      });
    }

    const id = `D-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    await pool.query(
      `INSERT INTO dossier (id, cabinet_id, nom, client, finalite_declaree, mode, echeance)
       VALUES ($1, (SELECT cabinet_id FROM utilisateur WHERE id = $2), $3, $4, $5, $6, $7)`,
      [
        id,
        UTILISATEUR_COURANT,
        nom.trim(),
        client?.trim() || null,
        finaliteDeclaree.trim(),
        mode === 'investigation_rapide' ? 'investigation_rapide' : 'audit_approfondi',
        echeance || null,
      ],
    );

    await journaliser('dossier.creation', { nom }, id, finaliteDeclaree);
    return reponse.code(201).send({ id });
  });

  app.get<{ Params: { id: string } }>('/api/dossiers/:id', async (requete, reponse) => {
    const dossier = await pool.query(`SELECT * FROM dossier WHERE id = $1`, [requete.params.id]);
    if (dossier.rowCount === 0) return reponse.code(404).send({ erreur: 'Dossier introuvable' });

    const liens = await pool.query(
      `SELECT entite_id, ajoute_le FROM dossier_entite WHERE dossier_id = $1 ORDER BY ajoute_le`,
      [requete.params.id],
    );
    const annotations = await pool.query(
      `SELECT a.id, a.contenu, a.cree_le, a.modifie_le, a.entite_cible_id,
              u.nom_complet AS auteur
       FROM annotation a
       JOIN utilisateur u ON u.id = a.auteur_id
       WHERE a.dossier_id = $1
       ORDER BY a.cree_le DESC`,
      [requete.params.id],
    );

    const index = deps.index();
    const flags = deps.flags();

    const entites = liens.rows.map((l) => {
      const entite = index.entite(l.entite_id);
      const flagsEntite = flags.filter((f) => f.entiteId === l.entite_id);
      return {
        entiteId: l.entite_id,
        nomLegal: entite?.nomLegal ?? l.entite_id,
        neq: entite?.neq,
        statut: entite?.statut,
        nbSignaux: flagsEntite.length,
        severiteMax: flagsEntite.some((f) => f.severite === 'eleve')
          ? 'eleve'
          : flagsEntite.some((f) => f.severite === 'moyen')
            ? 'moyen'
            : 'faible',
        ajouteLe: l.ajoute_le,
      };
    });

    await journaliser(
      'dossier.consultation',
      { entites: entites.length },
      requete.params.id,
      dossier.rows[0]!.finalite_declaree,
    );

    return {
      dossier: dossier.rows[0],
      entites,
      annotations: annotations.rows.map((a) => ({
        ...a,
        entiteLibelle: a.entite_cible_id
          ? (index.entite(a.entite_cible_id)?.nomLegal ?? a.entite_cible_id)
          : null,
      })),
    };
  });

  app.post<{ Params: { id: string }; Body: { entiteId: string } }>(
    '/api/dossiers/:id/entites',
    async (requete, reponse) => {
      const entiteId = requete.body?.entiteId;
      const entite = entiteId
        ? (deps.index().entite(entiteId) ?? deps.index().entiteParNumero(entiteId))
        : undefined;
      if (!entite) return reponse.code(404).send({ erreur: 'Entité introuvable' });

      const resultat = await pool.query(
        `INSERT INTO dossier_entite (dossier_id, entite_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING RETURNING entite_id`,
        [requete.params.id, entite.id],
      );

      await journaliser('dossier.ajout_entite', { entiteId: entite.id }, requete.params.id);
      return { ajoute: (resultat.rowCount ?? 0) > 0, entiteId: entite.id };
    },
  );

  app.delete<{ Params: { id: string; entiteId: string } }>(
    '/api/dossiers/:id/entites/:entiteId',
    async (requete) => {
      await pool.query(`DELETE FROM dossier_entite WHERE dossier_id = $1 AND entite_id = $2`, [
        requete.params.id,
        requete.params.entiteId,
      ]);
      await journaliser('dossier.retrait_entite', { entiteId: requete.params.entiteId }, requete.params.id);
      return { retire: true };
    },
  );

  // -------------------------------------------------------------------------
  // Annotations
  // -------------------------------------------------------------------------

  app.post<{ Params: { id: string }; Body: { contenu: string; entiteCibleId?: string } }>(
    '/api/dossiers/:id/annotations',
    async (requete, reponse) => {
      const contenu = requete.body?.contenu?.trim();
      if (!contenu) return reponse.code(400).send({ erreur: 'Le contenu de la note est requis.' });

      const resultat = await pool.query(
        `INSERT INTO annotation (dossier_id, auteur_id, entite_cible_id, contenu)
         VALUES ($1, $2, $3, $4) RETURNING id, cree_le`,
        [requete.params.id, UTILISATEUR_COURANT, requete.body?.entiteCibleId ?? null, contenu],
      );

      await journaliser('annotation.creation', { annotationId: resultat.rows[0]!.id }, requete.params.id);
      return reponse.code(201).send(resultat.rows[0]);
    },
  );

  // -------------------------------------------------------------------------
  // Comparaison temporelle
  // -------------------------------------------------------------------------

  app.get<{ Querystring: { avant?: string; apres?: string; entites?: string } }>(
    '/api/comparaison',
    async (requete, reponse) => {
      const { avant, apres } = requete.query;
      if (!avant || !apres) {
        return reponse.code(400).send({ erreur: 'Les deux dates de comparaison sont requises.' });
      }
      if (avant > apres) {
        return reponse.code(400).send({ erreur: 'La date de début doit précéder la date de fin.' });
      }

      const entites = requete.query.entites?.split(',').filter(Boolean);
      return comparerStructures(deps.index(), avant, apres, entites ? { entites } : {});
    },
  );

  // -------------------------------------------------------------------------
  // Rapport d'audit
  // -------------------------------------------------------------------------

  app.get<{ Params: { id: string }; Querystring: { format?: string } }>(
    '/api/dossiers/:id/rapport',
    async (requete, reponse) => {
      const rapport = await construireRapport(requete.params.id, deps);
      if (!rapport) return reponse.code(404).send({ erreur: 'Dossier introuvable' });

      await journaliser(
        'rapport.generation',
        { format: requete.query.format ?? 'json', entites: rapport.sections.length },
        requete.params.id,
        rapport.entete.finaliteDeclaree,
      );

      if (requete.query.format === 'html') {
        return reponse.type('text/html; charset=utf-8').send(rendreRapportHtml(rapport));
      }
      return rapport;
    },
  );

  // -------------------------------------------------------------------------
  // Journal d'accès
  // -------------------------------------------------------------------------

  app.get<{ Querystring: { dossier?: string; limite?: string } }>(
    '/api/journal',
    async (requete) => {
      const limite = Math.min(Number(requete.query.limite ?? 50), 200);
      const resultat = await pool.query(
        `SELECT j.id, j.action, j.finalite, j.contexte, j.horodate, j.dossier_id,
                u.nom_complet AS utilisateur
         FROM journal_acces j
         LEFT JOIN utilisateur u ON u.id = j.utilisateur_id
         WHERE ($1::text IS NULL OR j.dossier_id = $1)
         ORDER BY j.horodate DESC
         LIMIT $2`,
        [requete.query.dossier ?? null, limite],
      );
      return { entrees: resultat.rows };
    },
  );
}

async function construireRapport(dossierId: string, deps: DependancesDossiers) {
  const dossier = await pool.query(`SELECT * FROM dossier WHERE id = $1`, [dossierId]);
  if (dossier.rowCount === 0) return null;
  const d = dossier.rows[0]!;

  const liens = await pool.query(
    `SELECT entite_id FROM dossier_entite WHERE dossier_id = $1 ORDER BY ajoute_le`,
    [dossierId],
  );
  const annotations = await pool.query(
    `SELECT a.contenu, a.cree_le, a.entite_cible_id, u.nom_complet AS auteur
     FROM annotation a JOIN utilisateur u ON u.id = a.auteur_id
     WHERE a.dossier_id = $1 ORDER BY a.cree_le`,
    [dossierId],
  );

  const index = deps.index();
  const auteur = await pool.query(`SELECT nom_complet FROM utilisateur WHERE id = $1`, [
    UTILISATEUR_COURANT,
  ]);

  return composerRapport(index, {
    entete: {
      dossierId: d.id,
      dossierNom: d.nom,
      client: d.client ?? undefined,
      finaliteDeclaree: d.finalite_declaree,
      auteur: auteur.rows[0]?.nom_complet ?? 'Utilisateur',
      genereLe: new Date().toISOString().slice(0, 10),
    },
    entites: liens.rows.map((l) => l.entite_id as IdentifiantEntite),
    flags: deps.flags(),
    annotations: annotations.rows.map((a) => ({
      auteur: a.auteur,
      cible: a.entite_cible_id ? index.entite(a.entite_cible_id)?.nomLegal : undefined,
      contenu: a.contenu,
      creeLe: new Date(a.cree_le).toISOString(),
    })),
  });
}
