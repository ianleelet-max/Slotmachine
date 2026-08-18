import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function run() {
  console.log('[REQ Automated Ingestion] Starting stealth Playwright browser...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 },
    acceptDownloads: true
  });

  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  console.log('[REQ Automated Ingestion] Navigating to Registraire des entreprises page...');
  await page.goto('http://www.registreentreprises.gouv.qc.ca/RQAnonymeGR/GR/GR03/GR03A2_22A_PIU_RecupDonnPub_PC/PageDonneesOuvertes.aspx', {
    waitUntil: 'networkidle',
    timeout: 45000
  });

  console.log('[REQ Automated Ingestion] Clicking "Télécharger le jeu de données" button...');
  const downloadPromise = page.waitForEvent('download', { timeout: 180000 });
  await page.click('#CPHContenuGR_btnDonnees');

  const download = await downloadPromise;
  const zipPath = '/tmp/req_donnees.zip';
  await download.saveAs(zipPath);

  const stats = fs.statSync(zipPath);
  console.log(`[REQ Automated Ingestion] ZIP Downloaded successfully! Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  await browser.close();

  // Décompression du ZIP
  const extractDir = '/tmp/req_csv';
  if (fs.existsSync(extractDir)) {
    fs.rmSync(extractDir, { recursive: true, force: true });
  }
  fs.mkdirSync(extractDir, { recursive: true });

  console.log('[REQ Automated Ingestion] Extracting ZIP contents to ' + extractDir + '...');
  execSync(`unzip -o ${zipPath} -d ${extractDir}`);

  const files = fs.readdirSync(extractDir);
  console.log('[REQ Automated Ingestion] Extracted files:', files.join(', '));

  // Ingestion en base de données PostgreSQL
  console.log('[REQ Automated Ingestion] Ingesting CSV dataset into PostgreSQL...');
  execSync(`npm run ingerer:db --workspace=@auditreq/api -- ${extractDir}`, {
    cwd: '/home/ian/AudiTREQ',
    stdio: 'inherit'
  });

  console.log('\n🎉 [REQ Automated Ingestion] Complete! All Quebec enterprises are now loaded into PostgreSQL and searchable!');
}

run().catch((err) => {
  console.error('[REQ Automated Ingestion] Error:', err);
  process.exit(1);
});
