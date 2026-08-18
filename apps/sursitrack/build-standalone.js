import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('Le dossier dist/index.html n’existe pas. Lancez d’abord npm run build.');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf-8');

// Récupérer les fichiers CSS et JS dans dist/assets
const assetsDir = path.join(distDir, 'assets');
const files = fs.readdirSync(assetsDir);

const cssFile = files.find(f => f.endsWith('.css'));
const jsFile = files.find(f => f.endsWith('.js'));

if (cssFile) {
  const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf-8');
  html = html.replace(
    /<link rel="stylesheet" crossorigin href="[^"]+">/,
    `<style>\n${cssContent}\n</style>`
  );
}

if (jsFile) {
  const jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf-8');
  // Remplacer type="module" par un script standard sans contrainte CORS file://
  html = html.replace(
    /<script type="module" crossorigin src="[^"]+"><\/script>/,
    `<script>\n${jsContent}\n</script>`
  );
}

// Emplacement final standalone
const outputFileName = 'SursiTrack-Horizon-Pitch-Portable.html';
const outputPathProject = path.join(__dirname, outputFileName);
const outputPathRoot = path.join(__dirname, '../../', outputFileName);

fs.writeFileSync(outputPathProject, html, 'utf-8');
fs.writeFileSync(outputPathRoot, html, 'utf-8');

console.log(`✅ Version autonome mono-fichier générée avec succès !`);
console.log(`📍 Fichier local : ${outputPathProject}`);
console.log(`📍 Fichier racine : ${outputPathRoot}`);
console.log(`📦 Taille : ${(fs.statSync(outputPathProject).size / 1024).toFixed(1)} KB`);
