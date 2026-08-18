import fs from 'node:fs';
import readline from 'node:readline';
import path from 'node:path';
import { pool } from './db.js';
import { decouper, detecterSeparateur, normaliserDate } from '@auditreq/ingestion';

/**
 * Ingestion ultra-performante par flux (Streaming + Batch Copy/Insert avec déduplication)
 * Empreinte mémoire minimale (~100 Mo RAM) pour ingérer 1 Go+ de CSV REQ.
 */

async function trouverFichier(dir: string, nomBase: string): Promise<string | null> {
  const files = fs.readdirSync(dir);
  const cible = nomBase.toLowerCase();
  const found = files.find((f) => {
    const norm = f.toLowerCase().replace(/[^a-z0-9]/g, '');
    return norm === `${cible}csv` || norm === `${cible}scsv` || norm === cible || norm === `${cible}s`;
  });
  return found ? path.join(dir, found) : null;
}

export async function persisterFluxReq(repertoire: string): Promise<{
  entites: number;
  noms: number;
  etablissements: number;
  evenements: number;
}> {
  const client = await pool.connect();

  try {
    await client.query('SET search_path TO auditreq, public');
    console.log('[Ingestion Flux] Début du traitement en base de données (schéma auditreq)...');

    let totalEntites = 0;
    let totalNoms = 0;
    let totalEtablissements = 0;
    let totalEvenements = 0;

    // 1. ENTREPRISES
    const fichierEntreprise = await trouverFichier(repertoire, 'Entreprise');
    if (fichierEntreprise) {
      console.log('[Ingestion Flux] Ingestion des Entreprises...');
      const fileStream = fs.createReadStream(fichierEntreprise, { encoding: 'utf-8' });
      const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

      let separateur = ',';
      let enTete: string[] = [];
      let batch: any[] = [];
      let isFirst = true;

      for await (const line of rl) {
        if (!line.trim()) continue;

        if (isFirst) {
          separateur = detecterSeparateur(line);
          enTete = decouper(line, separateur).map((c) => c.replace(/^\uFEFF/, '').trim());
          isFirst = false;
          continue;
        }

        const cols = decouper(line, separateur);
        const row: Record<string, string> = {};
        for (let i = 0; i < enTete.length; i++) {
          row[enTete[i]!] = cols[i]?.trim() ?? '';
        }

        const neq = row['NEQ'];
        if (!neq) continue;

        const dateConsti = normaliserDate(row['DAT_CONSTI']) ?? normaliserDate(row['DAT_IMMAT']) ?? '2000-01-01';
        let dateCess = normaliserDate(row['DAT_CESS_PREVU']);
        if (dateCess && dateCess < dateConsti) {
          dateCess = undefined;
        }
        const statut = row['COD_STAT_IMMAT'] ?? 'IM';
        const forme = row['COD_FORME_JURI'] ?? 'AUTRE';
        const naics = row['COD_ACT_ECON_CAE'] || row['COD_ACT_ECON_CAE2'] || null;

        batch.push([
          `ENT-${neq}`,
          neq,
          'Entreprise ' + neq,
          '{}',
          forme,
          statut,
          naics,
          dateConsti,
          dateCess,
          false,
        ]);

        totalEntites++;

        if (batch.length >= 2000) {
          await insérerBatchEntites(client, batch);
          batch = [];
        }
      }

      if (batch.length > 0) {
        await insérerBatchEntites(client, batch);
      }
      console.log(`[Ingestion Flux] ${totalEntites} Entreprises insérées.`);
    }

    // 2. NOMS / DÉNOMINATIONS SOCIALES
    const fichierNom = await trouverFichier(repertoire, 'Nom');
    if (fichierNom) {
      console.log('[Ingestion Flux] Ingestion des Noms & Dénominations...');
      const fileStream = fs.createReadStream(fichierNom, { encoding: 'utf-8' });
      const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

      let separateur = ',';
      let enTete: string[] = [];
      let isFirst = true;
      let batchNom: [string, string][] = [];

      for await (const line of rl) {
        if (!line.trim()) continue;

        if (isFirst) {
          separateur = detecterSeparateur(line);
          enTete = decouper(line, separateur).map((c) => c.replace(/^\uFEFF/, '').trim());
          isFirst = false;
          continue;
        }

        const cols = decouper(line, separateur);
        const row: Record<string, string> = {};
        for (let i = 0; i < enTete.length; i++) {
          row[enTete[i]!] = cols[i]?.trim() ?? '';
        }

        const neq = row['NEQ'];
        const nom = row['NOM_ASSUJ'];
        if (!neq || !nom) continue;

        const stat = row['STAT_NOM'];
        if (stat === 'V' || stat === 'EN' || !stat) {
          batchNom.push([neq, nom]);
          totalNoms++;
        }

        if (batchNom.length >= 2000) {
          await mettreAJourNoms(client, batchNom);
          batchNom = [];
        }
      }

      if (batchNom.length > 0) {
        await mettreAJourNoms(client, batchNom);
      }
      console.log(`[Ingestion Flux] ${totalNoms} Dénominations mises à jour.`);
    }

    // 3. ÉTABLISSEMENTS & ADRESSES
    const fichierEtab = await trouverFichier(repertoire, 'Etablissement');
    if (fichierEtab) {
      console.log('[Ingestion Flux] Ingestion des Établissements & Adresses...');
      const fileStream = fs.createReadStream(fichierEtab, { encoding: 'utf-8' });
      const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

      let separateur = ',';
      let enTete: string[] = [];
      let isFirst = true;
      let batchEtab: any[] = [];

      for await (const line of rl) {
        if (!line.trim()) continue;

        if (isFirst) {
          separateur = detecterSeparateur(line);
          enTete = decouper(line, separateur).map((c) => c.replace(/^\uFEFF/, '').trim());
          isFirst = false;
          continue;
        }

        const cols = decouper(line, separateur);
        const row: Record<string, string> = {};
        for (let i = 0; i < enTete.length; i++) {
          row[enTete[i]!] = cols[i]?.trim() ?? '';
        }

        const neq = row['NEQ'];
        if (!neq) continue;

        const adrParts = [row['LIGN1_ADR'], row['LIGN2_ADR'], row['LIGN3_ADR'], row['LIGN4_ADR']]
          .filter(Boolean)
          .join(', ');

        if (!adrParts) continue;

        const adrId = `ADR-${neq}-${row['NO_SUF_ETAB'] ?? '1'}`;
        const entId = `ENT-${neq}`;

        batchEtab.push([adrId, adrParts, entId]);
        totalEtablissements++;

        if (batchEtab.length >= 2000) {
          await insérerAdressesEtLiens(client, batchEtab);
          batchEtab = [];
        }
      }

      if (batchEtab.length > 0) {
        await insérerAdressesEtLiens(client, batchEtab);
      }
      console.log(`[Ingestion Flux] ${totalEtablissements} Établissements et adresses insérés.`);
    }

    // 4. FUSIONS & SCISSIONS
    const fichierFusion = await trouverFichier(repertoire, 'FusionScission');
    if (fichierFusion) {
      console.log('[Ingestion Flux] Ingestion des Événements (Fusions/Scissions)...');
      const fileStream = fs.createReadStream(fichierFusion, { encoding: 'utf-8' });
      const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

      let separateur = ',';
      let enTete: string[] = [];
      let isFirst = true;
      let batchEvent: any[] = [];

      for await (const line of rl) {
        if (!line.trim()) continue;

        if (isFirst) {
          separateur = detecterSeparateur(line);
          enTete = decouper(line, separateur).map((c) => c.replace(/^\uFEFF/, '').trim());
          isFirst = false;
          continue;
        }

        const cols = decouper(line, separateur);
        const row: Record<string, string> = {};
        for (let i = 0; i < enTete.length; i++) {
          row[enTete[i]!] = cols[i]?.trim() ?? '';
        }

        const neq = row['NEQ'];
        if (!neq) continue;

        const neqRel = row['NEQ_ASSUJ_REL'];
        const typeRel = row['COD_RELA_ASSUJ'] ?? 'FUSION';
        const dateEff = normaliserDate(row['DAT_EFCTVT']) ?? '2000-01-01';

        batchEvent.push([
          `EVT-FS-${neq}-${totalEvenements}`,
          `ENT-${neq}`,
          typeRel.toLowerCase().includes('sciss') ? 'SCISSION' : 'FUSION',
          dateEff,
          `Relation de fusion/scission avec NEQ ${neqRel ?? 'inconnu'} (${row['DENOMN_SOC'] ?? ''})`,
        ]);
        totalEvenements++;

        if (batchEvent.length >= 2000) {
          await insérerEvenements(client, batchEvent);
          batchEvent = [];
        }
      }

      if (batchEvent.length > 0) {
        await insérerEvenements(client, batchEvent);
      }
      console.log(`[Ingestion Flux] ${totalEvenements} Événements insérés.`);
    }

    return {
      entites: totalEntites,
      noms: totalNoms,
      etablissements: totalEtablissements,
      evenements: totalEvenements,
    };
  } finally {
    client.release();
  }
}

async function insérerBatchEntites(client: any, rows: any[]) {
  const seen = new Set<string>();
  const dedupedRows = [];
  for (const r of rows) {
    if (!seen.has(r[0])) {
      seen.add(r[0]);
      dedupedRows.push(r);
    }
  }

  const query = `
    INSERT INTO entite (id, neq, nom_legal, noms_anterieurs, forme_juridique, statut, code_naics, date_constitution, date_dissolution, structure_connue)
    SELECT c1, c2, c3, c4::text[], c5, c6, c7, c8, c9, c10
    FROM UNNEST(
      $1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::text[], $8::date[], $9::date[], $10::boolean[]
    ) AS t(c1, c2, c3, c4, c5, c6, c7, c8, c9, c10)
    ON CONFLICT (id) DO UPDATE SET
      forme_juridique = EXCLUDED.forme_juridique,
      statut = EXCLUDED.statut;
  `;

  const cols = Array.from({ length: 10 }, () => [] as any[]);
  for (const row of dedupedRows) {
    for (let i = 0; i < 10; i++) cols[i]!.push(row[i]);
  }

  await client.query(query, cols);
}

async function mettreAJourNoms(client: any, pairs: [string, string][]) {
  const seen = new Set<string>();
  const deduped = [];
  for (const p of pairs) {
    if (!seen.has(p[0])) {
      seen.add(p[0]);
      deduped.push(p);
    }
  }

  const query = `
    UPDATE entite AS e SET nom_legal = v.nom
    FROM (SELECT * FROM UNNEST($1::text[], $2::text[])) AS v(neq, nom)
    WHERE e.neq = v.neq;
  `;
  const neqs = deduped.map((p) => p[0]);
  const noms = deduped.map((p) => p[1]);
  await client.query(query, [neqs, noms]);
}

async function insérerAdressesEtLiens(client: any, rows: any[]) {
  const seen = new Set<string>();
  const deduped = [];
  for (const r of rows) {
    if (!seen.has(r[0])) {
      seen.add(r[0]);
      deduped.push(r);
    }
  }

  const queryAdr = `
    INSERT INTO adresse (id, adresse_normalisee, code_postal, domiciliataire_connu)
    SELECT * FROM UNNEST($1::text[], $2::text[], $3::text[], $4::boolean[])
    ON CONFLICT (id) DO NOTHING;
  `;
  const adrIds = deduped.map((r) => r[0]);
  const adrNorm = deduped.map((r) => r[1]);
  const postaux = deduped.map(() => null);
  const doms = deduped.map(() => false);
  await client.query(queryAdr, [adrIds, adrNorm, postaux, doms]);

  const queryLien = `
    INSERT INTO lien_adresse (id, adresse_id, entite_id, personne_id, type_lien, depuis)
    SELECT * FROM UNNEST($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::date[])
    ON CONFLICT (id) DO NOTHING;
  `;
  const lienIds = deduped.map((r) => `LIEN-${r[0]}`);
  const entIds = deduped.map((r) => r[2]);
  const persIds = deduped.map(() => null);
  const types = deduped.map(() => 'ETABLISSEMENT');
  const dates = deduped.map(() => '2000-01-01');

  await client.query(queryLien, [lienIds, adrIds, entIds, persIds, types, dates]);
}

async function insérerEvenements(client: any, rows: any[]) {
  const seen = new Set<string>();
  const deduped = [];
  for (const r of rows) {
    if (!seen.has(r[0])) {
      seen.add(r[0]);
      deduped.push(r);
    }
  }

  await client.query(`
    INSERT INTO avis_req (id, type_avis, date_publication, url_source)
    VALUES ('donnees_ouvertes_req', 'donnees_ouvertes', CURRENT_DATE, 'https://www.donneesquebec.ca/recherche/dataset/registre-des-entreprises')
    ON CONFLICT (id) DO NOTHING;
  `);

  const queryEvt = `
    INSERT INTO evenement (id, entite_id, type, date_effective, description, avis_req_id)
    SELECT * FROM UNNEST($1::text[], $2::text[], $3::text[], $4::date[], $5::text[], $6::text[])
    ON CONFLICT (id) DO NOTHING;
  `;
  const ids = deduped.map((r) => r[0]);
  const entIds = deduped.map((r) => r[1]);
  const types = deduped.map((r) => r[2]);
  const dates = deduped.map((r) => r[3]);
  const descs = deduped.map((r) => r[4]);
  const avis = deduped.map(() => 'donnees_ouvertes_req');

  await client.query(queryEvt, [ids, entIds, types, dates, descs, avis]);
}
