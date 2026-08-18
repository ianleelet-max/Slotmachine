import { chromium } from 'playwright';
import fs from 'fs';

async function run() {
  console.log('[Playwright] Lancement de Chromium headless...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  console.log('[Playwright] Navigation vers la page des données ouvertes du REQ...');
  
  let downloadPromise = page.waitForEvent('download', { timeout: 120000 }).catch(() => null);
  
  await page.goto('https://www.registreentreprises.gouv.qc.ca/RQAnonymeGR/GR/GR03/GR03A2_22A_PIU_RecupDonnPub_PC/PageDonneesOuvertes.aspx', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(e => console.log('Goto page:', e.message));

  await page.waitForTimeout(5000);

  const downloadLink = page.locator('a[href*="FichierDonneesOuvertes"], input[value*="Télécharger"], a:has-text("Télécharger")').first();
  if (await downloadLink.count() > 0) {
    console.log('[Playwright] Clic sur le lien de téléchargement...');
    downloadPromise = page.waitForEvent('download', { timeout: 120000 });
    await downloadLink.click();
  } else {
    console.log('[Playwright] Access direct au fichier...');
    downloadPromise = page.waitForEvent('download', { timeout: 120000 });
    page.goto('https://www.registreentreprises.gouv.qc.ca/RQAnonymeGR/GR/GR03/GR03A2_22A_PIU_RecupDonnPub_PC/FichierDonneesOuvertes.aspx').catch(() => {});
  }

  const download = await downloadPromise;
  if (download) {
    const dest = '/tmp/req_archive.zip';
    await download.saveAs(dest);
    const stats = fs.statSync(dest);
    console.log('[Playwright] Téléchargement réussi : ' + dest + ' (' + (stats.size / 1024 / 1024).toFixed(2) + ' Mo)');
  } else {
    console.error('[Playwright] Aucun téléchargement.');
  }

  await browser.close();
}

run().catch(console.error);
