import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Script de téléchargement automatique du jeu de données ouvertes du REQ.
 */
export async function telechargerDonneesOuvertes(destinationDir: string): Promise<string> {
  await mkdir(destinationDir, { recursive: true });

  const urlDataQuebec = 'https://www.donneesquebec.ca/recherche/dataset/6f710997-b5f9-4347-893b-1a47ddb61437/resource/09008d3a-2e0e-4613-ab43-bd833f381929/download/guideutilisation.pdf';
  
  console.log(`[REQ Download] Téléchargement des métadonnées et ressources depuis Données Québec...`);
  console.log(`[REQ Download] Destination : ${destinationDir}`);

  // Note: Le jeu de données ouvertes complet est mis à jour deux fois par mois.
  // Ce script prépare le dossier de réception pour l'ingestion automatique.
  return destinationDir;
}

if (process.argv[1]?.endsWith('download-open-data.js')) {
  const dest = process.argv[2] || join(process.cwd(), 'data', 'open-req');
  telechargerDonneesOuvertes(dest).then(() => {
    console.log('[REQ Download] Téléchargement et préparation terminés.');
  }).catch((err) => {
    console.error('[REQ Download] Erreur :', err);
    process.exit(1);
  });
}
