/**
 * Ingestion d'une archive du jeu de données ouvertes du REQ.
 *
 * Usage : npm run ingerer --workspace=@auditreq/ingestion -- <répertoire> [aaaa-mm-jj]
 *
 * Le répertoire doit contenir l'archive décompressée (Entreprise.csv, Nom.csv,
 * Etablissement.csv, FusionScission.csv, ContinuationTransformation.csv,
 * DomaineValeur.csv). La commande n'écrit rien en base : elle charge, analyse
 * et rend compte. La persistance passe par l'API, qui journalise l'opération.
 */
import { creerContexte, analyser, IndexGraphe } from '@auditreq/core';

import { chargerArchive } from './archive.js';

const [repertoire, dateExtraction] = process.argv.slice(2);

if (!repertoire) {
  console.error(
    'Usage : npm run ingerer --workspace=@auditreq/ingestion -- <répertoire> [aaaa-mm-jj]',
  );
  process.exit(1);
}

const { graphe, rapport, anomalies } = await chargerArchive(repertoire, { dateExtraction });

const bloquantes = anomalies.filter((a) => a.gravite === 'bloquante');
for (const anomalie of anomalies) {
  const prefixe = anomalie.gravite === 'bloquante' ? 'BLOQUANT' : 'avertissement';
  console.error(`[${prefixe}] ${anomalie.fichier} : ${anomalie.message}`);
}

if (bloquantes.length > 0) {
  console.error('\nIngestion interrompue : structure de l’archive non conforme.');
  process.exit(2);
}

console.log(`\nExtrait du ${graphe.provenance?.dateExtraction} — ${graphe.provenance?.licence}`);
console.log(`  ${rapport.entites} entités`);
console.log(`  ${rapport.adresses} adresses distinctes`);
console.log(`  ${rapport.successions} filiations (fusions, scissions, continuations)`);
console.log(`  ${rapport.evenements} événements reconstitués`);

for (const ecartee of rapport.ecartees) {
  console.log(`  ${ecartee.compte} ligne(s) écartée(s) — ${ecartee.fichier} : ${ecartee.motif}`);
}

const index = new IndexGraphe(graphe);
const { flags } = analyser(creerContexte(index));

const parRegle = new Map<string, number>();
for (const flag of flags) parRegle.set(flag.typeRegle, (parRegle.get(flag.typeRegle) ?? 0) + 1);

console.log(`\n${flags.length} signal(aux) détecté(s) :`);
for (const [regle, compte] of [...parRegle].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${compte.toString().padStart(6)} × ${regle}`);
}

console.log(
  '\nRappel : ce jeu ne contient aucune personne physique. Les règles de bénéficiaire ultime,',
);
console.log(
  'de cycle de détention, de cascade et de prête-nom restent inactives tant qu’une source de',
);
console.log('personnes n’est pas raccordée (voir docs/auditreq/07-acces-donnees-req.md).');
