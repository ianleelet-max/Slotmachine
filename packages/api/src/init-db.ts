/**
 * Création du schéma de base de données.
 *
 * Ce script existe pour éviter d'exiger l'outil `psql` en ligne de commande :
 * il est absent du PATH par défaut sous Windows, et c'est en pratique le
 * premier obstacle rencontré lors d'une installation locale. On exécute donc
 * `db/schema.sql` par la même connexion que l'application.
 *
 * Usage : npm run db:init
 */
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pool } from './db.js';

const ici = dirname(fileURLToPath(import.meta.url));
// Depuis packages/api/dist, la racine du dépôt est trois niveaux plus haut.
const cheminSchema = join(ici, '..', '..', '..', 'db', 'schema.sql');

const schema = await readFile(cheminSchema, 'utf8');

try {
  await pool.query(schema);
  console.log('Schéma « auditreq » créé.');
  console.log('Étape suivante : npm run seed');
} catch (erreur) {
  const message = erreur instanceof Error ? erreur.message : String(erreur);
  console.error(`Échec de la création du schéma : ${message}`);
  console.error(
    '\nVérifiez que PostgreSQL est démarré et que DATABASE_URL pointe vers une base existante.',
  );
  process.exitCode = 1;
} finally {
  await pool.end();
}
