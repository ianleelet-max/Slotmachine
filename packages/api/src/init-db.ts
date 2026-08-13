/**
 * Création de la base et de son schéma.
 *
 * Ce script existe pour retirer deux obstacles d'une première installation :
 *
 * 1. **`psql` n'est pas requis** — il est absent du PATH par défaut sous
 *    Windows, alors que la création du schéma en dépendait.
 * 2. **`createdb` non plus** — même problème, et c'est celui sur lequel une
 *    installation Windows bute en premier.
 *
 * La démarche va du moins privilégié au plus : on tente d'abord la base cible,
 * et on ne se connecte au compte d'administration que si elle n'existe pas.
 *
 * Usage : npm run db:init
 */
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import pg from 'pg';

const { Client } = pg;

/** Code PostgreSQL « invalid_catalog_name » : la base n'existe pas. */
const BASE_ABSENTE = '3D000';

const ici = dirname(fileURLToPath(import.meta.url));
// Depuis packages/api/dist, la racine du dépôt est trois niveaux plus haut.
const cheminSchema = join(ici, '..', '..', '..', 'db', 'schema.sql');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL n’est pas défini.');
  console.error('Exemple : postgres://postgres:MOT_DE_PASSE@localhost/auditreq');
  process.exit(1);
}

try {
  let client = await connecter(url);

  if (!client) {
    await creerBase(url);
    client = await connecter(url);
    if (!client) throw new Error('La base reste injoignable après sa création.');
  }

  try {
    await client.query(await readFile(cheminSchema, 'utf8'));
  } finally {
    await client.end();
  }

  console.log('\nSchéma « auditreq » créé.');
  console.log('Étape suivante : npm run seed');
} catch (erreur) {
  signalerEchec(erreur);
  process.exit(1);
}

/** Se connecte à la base cible, ou rend `null` si elle n'existe pas encore. */
async function connecter(chaine: string): Promise<pg.Client | null> {
  const client = new Client({ connectionString: chaine });
  try {
    await client.connect();
    return client;
  } catch (erreur) {
    await client.end().catch(() => undefined);
    if ((erreur as { code?: string }).code === BASE_ABSENTE) return null;
    throw erreur;
  }
}

/**
 * Crée la base en passant par la base d'administration `postgres`.
 *
 * `CREATE DATABASE` n'accepte pas de paramètre lié : le nom est échappé comme
 * identifiant, jamais concaténé tel quel.
 */
async function creerBase(chaine: string): Promise<void> {
  let adresse: URL;
  let nom: string;

  try {
    adresse = new URL(chaine);
    nom = decodeURIComponent(adresse.pathname.replace(/^\//, ''));
    if (!nom) throw new Error('aucune base nommée');
  } catch {
    // Certaines formes de chaîne de connexion (socket Unix, par exemple) ne
    // s'analysent pas comme une URL. Plutôt que de deviner, on le dit.
    console.error('La base n’existe pas, et son nom n’a pas pu être déduit de DATABASE_URL.');
    console.error('Créez-la à la main, puis relancez : createdb auditreq');
    throw new Error('Nom de base indéterminable.');
  }

  console.log(`Base « ${nom} » absente : création…`);

  adresse.pathname = '/postgres';
  const administration = new Client({ connectionString: adresse.toString() });
  await administration.connect();

  try {
    await administration.query(`CREATE DATABASE ${echapperIdentifiant(nom)}`);
    console.log(`Base « ${nom} » créée.`);
  } catch (erreur) {
    // Une création concurrente est un succès du point de vue de l'appelant.
    if ((erreur as { code?: string }).code !== '42P04') throw erreur;
    console.log(`Base « ${nom} » déjà présente.`);
  } finally {
    await administration.end();
  }
}

function echapperIdentifiant(nom: string): string {
  return `"${nom.replace(/"/g, '""')}"`;
}

/** Traduit les échecs courants en indication utilisable. */
function signalerEchec(erreur: unknown): void {
  const code = (erreur as { code?: string }).code;
  const message = erreur instanceof Error ? erreur.message : String(erreur);

  console.error(`\nÉchec : ${message}\n`);

  if (code === 'ECONNREFUSED') {
    console.error('PostgreSQL ne répond pas à cette adresse.');
    console.error('  • Le service est-il démarré ?');
    console.error('  • Avec Docker : docker compose up -d');
    return;
  }
  if (code === '28P01' || /password authentication/i.test(message)) {
    console.error('Mot de passe refusé : vérifiez celui inscrit dans DATABASE_URL.');
    console.error(
      '  Windows : $env:DATABASE_URL = "postgres://postgres:VOTRE_MDP@localhost/auditreq"',
    );
    return;
  }
  if (code === '42501' || /permission denied/i.test(message)) {
    console.error('L’utilisateur n’a pas le droit de créer une base de données.');
    console.error('  Utilisez un compte administrateur (« postgres » par défaut).');
    return;
  }
  console.error('Vérifiez DATABASE_URL et que PostgreSQL est accessible.');
}
