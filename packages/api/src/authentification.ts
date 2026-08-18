import { randomBytes, scrypt, timingSafeEqual, createHash, type ScryptOptions } from 'node:crypto';

import type { FastifyInstance, FastifyRequest } from 'fastify';

import { pool } from './db.js';

/**
 * Authentification par session.
 *
 * Choix retenus, et pourquoi :
 *
 * - **scrypt de `node:crypto`** plutôt qu'une bibliothèque externe : pas de
 *   module natif à compiler, donc une installation qui ne casse pas sous
 *   Windows, et une fonction de dérivation à coût mémoire réputée solide.
 * - **Jetons de session hachés en base.** Un vol de la table `session` ne
 *   permet pas d'usurper une session : le jeton en clair n'existe que dans le
 *   témoin du navigateur.
 * - **Témoin `httpOnly` et `sameSite: strict`** : inaccessible au JavaScript de
 *   la page, et non transmis depuis un site tiers.
 * - **Comparaison en temps constant** partout où un secret est comparé.
 */

/** `promisify` ne couvre pas la surcharge de scrypt avec options. */
function deriver(
  motDePasse: string,
  sel: Buffer,
  longueur: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resoudre, rejeter) => {
    scrypt(motDePasse, sel, longueur, options, (erreur, cle) =>
      erreur ? rejeter(erreur) : resoudre(cle),
    );
  });
}

const LONGUEUR_CLE = 64;
const COUT_N = 16384;
const COUT_R = 8;
const COUT_P = 1;

export const NOM_TEMOIN = 'auditreq_session';
const DUREE_SESSION_HEURES = 12;

/** Tentatives de connexion échouées, par courriel, avec fenêtre glissante. */
const tentatives = new Map<string, { compte: number; jusqua: number }>();
const SEUIL_TENTATIVES = 5;
const BLOCAGE_MINUTES = 15;

export async function hacherMotDePasse(motDePasse: string): Promise<string> {
  const sel = randomBytes(16);
  const cle = await deriver(motDePasse.normalize('NFKC'), sel, LONGUEUR_CLE, {
    N: COUT_N,
    r: COUT_R,
    p: COUT_P,
  });
  return `scrypt$${COUT_N}$${COUT_R}$${COUT_P}$${sel.toString('hex')}$${cle.toString('hex')}`;
}

export async function verifierMotDePasse(motDePasse: string, encode: string): Promise<boolean> {
  const parties = encode.split('$');
  if (parties.length !== 6 || parties[0] !== 'scrypt') return false;

  const [, n, r, p, selHex, cleHex] = parties;
  const sel = Buffer.from(selHex!, 'hex');
  const attendue = Buffer.from(cleHex!, 'hex');

  const calculee = await deriver(motDePasse.normalize('NFKC'), sel, attendue.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });

  return calculee.length === attendue.length && timingSafeEqual(calculee, attendue);
}

/** Le jeton circule en clair dans le témoin ; seule son empreinte est stockée. */
export function empreinteJeton(jeton: string): string {
  return createHash('sha256').update(jeton).digest('hex');
}

export interface UtilisateurConnecte {
  id: string;
  courriel: string;
  nomComplet: string;
  role: string;
  cabinetId: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    utilisateur?: UtilisateurConnecte;
  }
}

/** Routes publiques : tout le reste exige une session valide. */
const ROUTES_PUBLIQUES = new Set([
  '/api/sante',
  '/api/auth/connexion',
  '/api/auth/moi',
  '/api/recherche',
  '/api/entites',
  '/api/personnes',
  '/api/adresses',
  '/api/statistiques',
]);

export function enregistrerAuthentification(app: FastifyInstance): void {
  app.addHook('preHandler', async (requete, reponse) => {
    const chemin = requete.url.split('?')[0] ?? '';
    if (!chemin.startsWith('/api/')) return;

    const utilisateur = await utilisateurDeLaRequete(requete);
    if (utilisateur) requete.utilisateur = utilisateur;

    if (ROUTES_PUBLIQUES.has(chemin)) return;
    if (!utilisateur) {
      return reponse.code(401).send({ erreur: 'Session requise.' });
    }
  });

  app.post<{ Body: { courriel?: string; motDePasse?: string } }>(
    '/api/auth/connexion',
    async (requete, reponse) => {
      const courriel = (requete.body?.courriel ?? '').trim().toLowerCase();
      const motDePasse = requete.body?.motDePasse ?? '';

      if (!courriel || !motDePasse) {
        return reponse.code(400).send({ erreur: 'Courriel et mot de passe requis.' });
      }

      const blocage = tentatives.get(courriel);
      if (blocage && blocage.compte >= SEUIL_TENTATIVES && Date.now() < blocage.jusqua) {
        const minutes = Math.ceil((blocage.jusqua - Date.now()) / 60000);
        return reponse
          .code(429)
          .send({ erreur: `Trop de tentatives. Réessayez dans ${minutes} minute(s).` });
      }

      const resultat = await pool.query(
        `SELECT id, courriel, nom_complet, role, cabinet_id, mot_de_passe_hash
         FROM utilisateur WHERE lower(courriel) = $1`,
        [courriel],
      );
      const ligne = resultat.rows[0];

      // Le hachage est effectué même sans compte correspondant : sans cela, le
      // temps de réponse révélerait quels courriels existent.
      const hachage =
        ligne?.mot_de_passe_hash ?? (await hacherMotDePasse(randomBytes(16).toString('hex')));
      const correct = await verifierMotDePasse(motDePasse, hachage);

      if (!ligne || !ligne.mot_de_passe_hash || !correct) {
        const compteur = tentatives.get(courriel) ?? { compte: 0, jusqua: 0 };
        compteur.compte += 1;
        compteur.jusqua = Date.now() + BLOCAGE_MINUTES * 60000;
        tentatives.set(courriel, compteur);

        await journaliserAuthentification(null, 'auth.echec', { courriel });
        return reponse.code(401).send({ erreur: 'Identifiants invalides.' });
      }

      tentatives.delete(courriel);

      const jeton = randomBytes(32).toString('hex');
      await pool.query(
        `INSERT INTO session (empreinte, utilisateur_id, expire_le, agent)
         VALUES ($1, $2, now() + ($3 || ' hours')::interval, $4)`,
        [
          empreinteJeton(jeton),
          ligne.id,
          String(DUREE_SESSION_HEURES),
          (requete.headers['user-agent'] ?? '').slice(0, 200),
        ],
      );

      await journaliserAuthentification(ligne.id, 'auth.connexion', { courriel });

      return reponse
        .setCookie(NOM_TEMOIN, jeton, {
          httpOnly: true,
          sameSite: 'strict',
          secure: process.env.COOKIE_SECURISE === 'true',
          path: '/',
          maxAge: DUREE_SESSION_HEURES * 3600,
        })
        .send({
          utilisateur: {
            id: ligne.id,
            courriel: ligne.courriel,
            nomComplet: ligne.nom_complet,
            role: ligne.role,
            cabinetId: ligne.cabinet_id,
          },
        });
    },
  );

  app.post('/api/auth/deconnexion', async (requete, reponse) => {
    const jeton = requete.cookies?.[NOM_TEMOIN];
    if (jeton) {
      await pool.query(`DELETE FROM session WHERE empreinte = $1`, [empreinteJeton(jeton)]);
      await journaliserAuthentification(requete.utilisateur?.id ?? null, 'auth.deconnexion', {});
    }
    return reponse.clearCookie(NOM_TEMOIN, { path: '/' }).send({ statut: 'deconnecte' });
  });

  app.get('/api/auth/moi', async (requete) => ({ utilisateur: requete.utilisateur ?? null }));
}

async function utilisateurDeLaRequete(
  requete: FastifyRequest,
): Promise<UtilisateurConnecte | undefined> {
  const jeton = requete.cookies?.[NOM_TEMOIN];
  if (!jeton) return undefined;

  const resultat = await pool.query(
    `SELECT u.id, u.courriel, u.nom_complet, u.role, u.cabinet_id
     FROM session s
     JOIN utilisateur u ON u.id = s.utilisateur_id
     WHERE s.empreinte = $1 AND s.expire_le > now()`,
    [empreinteJeton(jeton)],
  );
  const ligne = resultat.rows[0];
  if (!ligne) return undefined;

  // Prolonge la session tant qu'elle sert, sans dépasser la durée maximale.
  await pool.query(
    `UPDATE session SET derniere_activite = now(),
            expire_le = now() + ($2 || ' hours')::interval
     WHERE empreinte = $1`,
    [empreinteJeton(jeton), String(DUREE_SESSION_HEURES)],
  );

  return {
    id: ligne.id,
    courriel: ligne.courriel,
    nomComplet: ligne.nom_complet,
    role: ligne.role,
    cabinetId: ligne.cabinet_id,
  };
}

async function journaliserAuthentification(
  utilisateurId: string | null,
  action: string,
  contexte: Record<string, unknown>,
): Promise<void> {
  await pool.query(
    `INSERT INTO journal_acces (utilisateur_id, action, contexte) VALUES ($1, $2, $3)`,
    [utilisateurId, action, JSON.stringify(contexte)],
  );
}

/** Purge les sessions expirées. Appelée au démarrage et périodiquement. */
export async function purgerSessionsExpirees(): Promise<number> {
  const resultat = await pool.query(`DELETE FROM session WHERE expire_le < now()`);
  return resultat.rowCount ?? 0;
}
