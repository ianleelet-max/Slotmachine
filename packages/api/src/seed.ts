/**
 * Charge le jeu de démonstration en base, puis exécute l'analyse et persiste
 * ses résultats — le même chemin que suivra un lot d'avis REQ réel.
 *
 * Usage : npm run seed --workspace=@auditreq/api
 */
import { randomBytes } from 'node:crypto';

import { grapheDemonstration, IndexGraphe, creerContexte, analyser } from '@auditreq/core';
import { pool } from './db.js';
import { hacherMotDePasse } from './authentification.js';

const graphe = grapheDemonstration();

// Les avis référencés par les relations doivent exister avant elles.
const avis = new Map<string, { type: string; date: string }>();
for (const d of graphe.detentions) avis.set(d.avisReqId, { type: 'detention', date: d.depuis });
for (const a of graphe.administrations) {
  avis.set(a.avisReqId, { type: 'administration', date: a.depuis });
}
for (const e of graphe.evenements) {
  avis.set(e.avisReqId, { type: e.type, date: e.dateEffective });
}

const client = await pool.connect();

try {
  await client.query('BEGIN');

  await client.query(`TRUNCATE avis_req, entite, personne, adresse, relation_detention, session,
                               relation_administration, lien_adresse, evenement,
                               resolution_identite, red_flag, cabinet, utilisateur,
                               dossier, dossier_entite, annotation
                      RESTART IDENTITY CASCADE`);

  for (const [id, meta] of avis) {
    await client.query(
      `INSERT INTO avis_req (id, type_avis, date_publication, url_source)
       VALUES ($1, $2, $3, $4)`,
      [id, meta.type, meta.date, `https://www.registreentreprises.gouv.qc.ca/avis/${id}`],
    );
  }

  for (const e of graphe.entites) {
    await client.query(
      `INSERT INTO entite (id, neq, nom_legal, noms_anterieurs, forme_juridique, statut,
                           code_naics, date_constitution, date_dissolution, structure_connue)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        e.id, e.neq, e.nomLegal, e.nomsAnterieurs, e.formeJuridique, e.statut,
        e.codeNaics ?? null, e.dateConstitution, e.dateDissolution ?? null,
        e.structureConnue ?? false,
      ],
    );
  }

  for (const p of graphe.personnes) {
    await client.query(
      `INSERT INTO personne (id, nom_complet, variantes_nom, score_confiance_identite)
       VALUES ($1,$2,$3,$4)`,
      [p.id, p.nomComplet, p.variantesNom, p.scoreConfianceIdentite],
    );
  }

  for (const a of graphe.adresses) {
    await client.query(
      `INSERT INTO adresse (id, adresse_normalisee, code_postal, domiciliataire_connu)
       VALUES ($1,$2,$3,$4)`,
      [a.id, a.adresseNormalisee, a.codePostal ?? null, a.domiciliataireConnu ?? false],
    );
  }

  for (const d of graphe.detentions) {
    await client.query(
      `INSERT INTO relation_detention (id, source_entite_id, source_personne_id, cible_entite_id,
                                       pourcentage, type_titre, depuis, jusqu_a, avis_req_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        d.id, d.sourceEntiteId ?? null, d.sourcePersonneId ?? null, d.cibleEntiteId,
        d.pourcentage, d.typeTitre ?? null, d.depuis, d.jusquA ?? null, d.avisReqId,
      ],
    );
  }

  for (const a of graphe.administrations) {
    await client.query(
      `INSERT INTO relation_administration (id, personne_id, entite_id, titre, depuis, jusqu_a, avis_req_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [a.id, a.personneId, a.entiteId, a.titre, a.depuis, a.jusquA ?? null, a.avisReqId],
    );
  }

  for (const l of graphe.liensAdresse) {
    await client.query(
      `INSERT INTO lien_adresse (id, adresse_id, entite_id, personne_id, type_lien, depuis, jusqu_a)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        l.id, l.adresseId, l.entiteId ?? null, l.personneId ?? null, l.typeLien,
        l.depuis, l.jusquA ?? null,
      ],
    );
  }

  for (const e of graphe.evenements) {
    await client.query(
      `INSERT INTO evenement (id, entite_id, type, date_effective, description, avis_req_id)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [e.id, e.entiteId, e.type, e.dateEffective, e.description, e.avisReqId],
    );
  }

  // Cabinet, utilisateur et dossiers de démonstration.
  await client.query(
    `INSERT INTO cabinet (id, nom, type_professionnel) VALUES ($1,$2,$3)`,
    ['C1', 'Syndics Roy & Associés', 'syndic'],
  );
  // Le mot de passe vient de l'environnement, ou est engendré et affiché une
  // seule fois. Aucun mot de passe par défaut n'est inscrit dans le code : un
  // déploiement oublié resterait sinon ouvert avec des identifiants connus.
  const motDePasse = process.env.MOT_DE_PASSE_INITIAL ?? randomBytes(12).toString('base64url');
  await client.query(
    `INSERT INTO utilisateur (id, cabinet_id, courriel, nom_complet, role, persona_defaut, mot_de_passe_hash)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      'U1',
      'C1',
      'chantal.roy@example.ca',
      'Chantal Roy',
      'senior',
      'syndic',
      await hacherMotDePasse(motDePasse),
    ],
  );

  const dossiers = [
    ['D-2026-014', 'Faillite — 9284-1057 Québec Inc.', 'Syndics Roy & Associés',
     'Reconstitution de la structure de propriété du failli et repérage des transferts d’actifs antérieurs à la faillite',
     'audit_approfondi', '2026-08-18', ['E1', 'E2', 'E3']],
    ['D-2026-021', 'Diligence M&A — Groupe Nordet', 'Fonds Cardinal Capital',
     'Cartographie de la cible et de ses filiales préalable à une offre d’achat',
     'audit_approfondi', '2026-09-02', ['E4']],
    ['D-2026-030', 'Grappe Beauport — signalement conformité', 'Interne',
     'Vérification d’un regroupement de sociétés partageant une adresse et un administrateur',
     'investigation_rapide', '2026-09-22', ['E6', 'E7', 'E8', 'E9']],
  ] as const;

  for (const [id, nom, clientNom, finalite, mode, echeance, entites] of dossiers) {
    await client.query(
      `INSERT INTO dossier (id, cabinet_id, nom, client, finalite_declaree, mode, echeance)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [id, 'C1', nom, clientNom, finalite, mode, echeance],
    );
    for (const entiteId of entites) {
      await client.query(
        `INSERT INTO dossier_entite (dossier_id, entite_id) VALUES ($1,$2)`,
        [id, entiteId],
      );
    }
  }

  // Analyse : les red flags et les scores sont dérivés, jamais saisis.
  const index = new IndexGraphe(graphe);
  const { flags, scores } = analyser(creerContexte(index));

  for (const flag of flags) {
    await client.query(
      `INSERT INTO red_flag (entite_id, type_regle, severite, explication, elements_declencheurs)
       VALUES ($1,$2,$3,$4,$5)`,
      [
        flag.entiteId, flag.typeRegle, flag.severite, flag.explication,
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

  const eleves = [...scores.values()].filter((s) => s.niveau === 'eleve').length;
  console.log('\nCompte de démonstration');
  console.log('  Courriel     : chantal.roy@example.ca');
  console.log(`  Mot de passe : ${motDePasse}`);
  console.log(
    process.env.MOT_DE_PASSE_INITIAL
      ? '  (défini par MOT_DE_PASSE_INITIAL)'
      : '  (engendré — notez-le, il ne sera plus affiché)',
  );
  console.log('');

  console.log(
    `Jeu de démonstration chargé : ${graphe.entites.length} entités, ` +
      `${graphe.personnes.length} personnes, ${flags.length} red flags ` +
      `(${eleves} entité(s) à risque élevé).`,
  );
} catch (erreur) {
  await client.query('ROLLBACK');
  throw erreur;
} finally {
  client.release();
  await pool.end();
}
