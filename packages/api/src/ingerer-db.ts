import { persisterFluxReq } from './persistance-stream.js';
import { pool } from './db.js';

const repertoire = process.argv[2];

if (!repertoire) {
  console.error('Usage : npm run ingerer:db --workspace=@auditreq/api -- <dossier_csv_req>');
  process.exit(1);
}

console.log(`🚀 [Ingestion Streaming REQ] Chargement des fichiers CSV depuis : ${repertoire}...`);

try {
  const debut = Date.now();
  const bilan = await persisterFluxReq(repertoire);
  const duree = ((Date.now() - debut) / 1000).toFixed(1);

  console.log(`\n🎉 [Ingestion Streaming REQ] Ingestion réussie en ${duree} secondes !`);
  console.log(`  - Entités enregistrées         : ${bilan.entites}`);
  console.log(`  - Dénominations à jour        : ${bilan.noms}`);
  console.log(`  - Établissements & Adresses   : ${bilan.etablissements}`);
  console.log(`  - Événements / fusions        : ${bilan.evenements}`);

  // Déclencher la réactualisation du moteur de l'API
  try {
    const port = process.env.PORT ?? 3001;
    await fetch(`http://127.0.0.1:${port}/api/analyse/recalculer`, { method: 'POST' });
    console.log('[Ingestion REQ] Cache d’analyse et de recherche réactualisé dans l’API.');
  } catch {
    console.log('[Ingestion REQ] Note : relancer l’API si elle tourne pour prendre en compte les données.');
  }
} catch (err) {
  console.error('[Ingestion REQ] Erreur lors de l’ingestion streaming :', err);
  process.exit(1);
} finally {
  await pool.end();
}
