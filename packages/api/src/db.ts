import pg from 'pg';
import type { GrapheCorporatif } from '@auditreq/core';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Le schéma applicatif est isolé : rien n'est créé dans `public`.
  options: '-c search_path=auditreq',
});

/**
 * Charge l'intégralité du graphe public en mémoire.
 *
 * Choix assumé pour le MVP : le registre québécois tient en mémoire à cette
 * échelle, et les traversées de contrôle (UBO, cycles) y sont d'un ordre de
 * grandeur plus rapides qu'en allers-retours SQL récursifs. Le passage à une
 * base de graphe dédiée est prévu quand le volume ou la concurrence
 * l'imposera (voir docs/auditreq/01, §3).
 */
export async function chargerGraphe(): Promise<GrapheCorporatif> {
  const [entites, personnes, adresses, detentions, administrations, liens, evenements] =
    await Promise.all([
      pool.query(`SELECT id, neq, nom_legal, noms_anterieurs, forme_juridique, statut,
                         code_naics, date_constitution, date_dissolution, structure_connue
                  FROM entite ORDER BY id`),
      pool.query(`SELECT id, nom_complet, variantes_nom, score_confiance_identite
                  FROM personne ORDER BY id`),
      pool.query(`SELECT id, adresse_normalisee, code_postal, domiciliataire_connu
                  FROM adresse ORDER BY id`),
      pool.query(`SELECT id, source_entite_id, source_personne_id, cible_entite_id,
                         pourcentage, type_titre, depuis, jusqu_a, avis_req_id
                  FROM relation_detention ORDER BY id`),
      pool.query(`SELECT id, personne_id, entite_id, titre, depuis, jusqu_a, avis_req_id
                  FROM relation_administration ORDER BY id`),
      pool.query(`SELECT id, adresse_id, entite_id, personne_id, type_lien, depuis, jusqu_a
                  FROM lien_adresse ORDER BY id`),
      pool.query(`SELECT id, entite_id, type, date_effective, description, avis_req_id
                  FROM evenement ORDER BY date_effective, id`),
    ]);

  const extraction = await pool.query(
    `SELECT max(date_publication) AS derniere FROM avis_req`,
  );

  return {
    // La provenance suit les données jusqu'à l'écran : un professionnel doit
    // pouvoir dire à quelle date l'état qu'il consulte a été observé.
    provenance: {
      source: (process.env.SOURCE_DONNEES ?? 'demonstration') as
        | 'donnees_ouvertes_req'
        | 'registre_consultation'
        | 'demonstration',
      dateExtraction:
        process.env.DATE_EXTRACTION ??
        (extraction.rows[0]?.derniere
          ? jour(extraction.rows[0].derniere)
          : new Date().toISOString().slice(0, 10)),
      cadence: process.env.CADENCE_DONNEES ?? 'Jeu de démonstration — aucune synchronisation',
      licence: process.env.LICENCE_DONNEES,
    },
    successions: [],
    entites: entites.rows.map((r) => ({
      id: r.id,
      neq: r.neq,
      nomLegal: r.nom_legal,
      nomsAnterieurs: r.noms_anterieurs ?? [],
      formeJuridique: r.forme_juridique,
      statut: r.statut,
      codeNaics: r.code_naics ?? undefined,
      dateConstitution: jour(r.date_constitution),
      dateDissolution: r.date_dissolution ? jour(r.date_dissolution) : undefined,
      structureConnue: r.structure_connue,
    })),
    personnes: personnes.rows.map((r) => ({
      id: r.id,
      nomComplet: r.nom_complet,
      variantesNom: r.variantes_nom ?? [],
      scoreConfianceIdentite: Number(r.score_confiance_identite),
    })),
    adresses: adresses.rows.map((r) => ({
      id: r.id,
      adresseNormalisee: r.adresse_normalisee,
      codePostal: r.code_postal ?? undefined,
      domiciliataireConnu: r.domiciliataire_connu,
    })),
    detentions: detentions.rows.map((r) => ({
      id: r.id,
      sourceEntiteId: r.source_entite_id ?? undefined,
      sourcePersonneId: r.source_personne_id ?? undefined,
      cibleEntiteId: r.cible_entite_id,
      pourcentage: Number(r.pourcentage),
      typeTitre: r.type_titre ?? undefined,
      depuis: jour(r.depuis),
      jusquA: r.jusqu_a ? jour(r.jusqu_a) : undefined,
      avisReqId: r.avis_req_id,
    })),
    administrations: administrations.rows.map((r) => ({
      id: r.id,
      personneId: r.personne_id,
      entiteId: r.entite_id,
      titre: r.titre,
      depuis: jour(r.depuis),
      jusquA: r.jusqu_a ? jour(r.jusqu_a) : undefined,
      avisReqId: r.avis_req_id,
    })),
    liensAdresse: liens.rows.map((r) => ({
      id: r.id,
      adresseId: r.adresse_id,
      entiteId: r.entite_id ?? undefined,
      personneId: r.personne_id ?? undefined,
      typeLien: r.type_lien,
      depuis: jour(r.depuis),
      jusquA: r.jusqu_a ? jour(r.jusqu_a) : undefined,
    })),
    evenements: evenements.rows.map((r) => ({
      id: r.id,
      entiteId: r.entite_id,
      type: r.type,
      dateEffective: jour(r.date_effective),
      description: r.description,
      avisReqId: r.avis_req_id,
    })),
  };
}

/** Normalise une date Postgres en `aaaa-mm-jj` sans décalage de fuseau. */
function jour(valeur: Date | string): string {
  if (typeof valeur === 'string') return valeur.slice(0, 10);
  const mois = String(valeur.getMonth() + 1).padStart(2, '0');
  const jourDuMois = String(valeur.getDate()).padStart(2, '0');
  return `${valeur.getFullYear()}-${mois}-${jourDuMois}`;
}
