import { chromium } from 'playwright';
import fs from 'fs';

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    acceptDownloads: true
  });
  const page = await context.newPage();

  page.on('response', async (res) => {
    const url = res.url();
    const status = res.status();
    const contentType = res.headers()['content-type'] ?? '';
    const disposition = res.headers()['content-disposition'] ?? '';
    console.log('[Response] ' + status + ' ' + url + ' | Content-Type: ' + contentType + ' | Disposition: ' + disposition);

    if (disposition.includes('attachment') || contentType.includes('zip') || contentType.includes('octet-stream') || contentType.includes('download')) {
      console.log('[Found file response!] Saving buffer...');
      const buffer = await res.buffer();
      fs.writeFileSync('/tmp/req_donnees.zip', buffer);
      console.log('Saved /tmp/req_donnees.zip size:', buffer.length, 'bytes');
    }
  });

  console.log('Navigating...');
  await page.goto('http://www.registreentreprises.gouv.qc.ca/RQAnonymeGR/GR/GR03/GR03A2_22A_PIU_RecupDonnPub_PC/PageDonneesOuvertes.aspx', { waitUntil: 'networkidle' });

  console.log('Clicking button...');
  await page.click('#CPHContenuGR_btnDonnees');
  await page.waitForTimeout(15000);

  await browser.close();
}

run().catch(console.error);
