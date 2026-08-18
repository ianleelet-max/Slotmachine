import { chromium, type Browser } from 'playwright';

export interface ScrapeOptions {
  headless?: boolean;
  timeoutMs?: number;
}

export class ReqBrowser {
  private browser: Browser | null = null;

  async init(options: ScrapeOptions = {}) {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: options.headless ?? true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
        ],
      });
    }
  }

  async fetchCompanyHtml(neq: string, options: ScrapeOptions = {}): Promise<string> {
    await this.init(options);

    const context = await this.browser!.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
      locale: 'fr-CA',
    });

    const page = await context.newPage();

    try {
      // Navigation vers la page de recherche du Registraire
      const searchUrl = `https://www.registreentreprises.gouv.qc.ca/RQAnonymeGR/GR/GR03/GR03A2_19A_PIU_RechEntreprise_PC/PageRechSimple.aspx`;
      
      await page.goto(searchUrl, {
        waitUntil: 'domcontentloaded',
        timeout: options.timeoutMs ?? 30000,
      });

      // Saisie du NEQ si les sélecteurs sont présents
      const neqInput = await page.$('input[id*="txtNEQ"], input[name*="NEQ"], input[type="text"]');
      if (neqInput) {
        await neqInput.fill(neq);
        const searchButton = await page.$('input[type="submit"], button[type="submit"]');
        if (searchButton) {
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {}),
            searchButton.click(),
          ]);
        }
      }

      // Récupération du contenu HTML complet de la page
      return await page.content();
    } finally {
      await page.close();
      await context.close();
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
