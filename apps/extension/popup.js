/**
 * Fenêtre de l'extension.
 *
 * Tout part d'un clic de l'utilisateur : rien ne s'exécute tant qu'il n'a pas
 * ouvert cette fenêtre et demandé la capture. Le script d'extraction est alors
 * injecté dans l'onglet actif, et son résultat est transmis à l'instance
 * locale d'AudiTREQ — qui est sur la même machine, et n'appartient à personne
 * d'autre que l'utilisateur.
 */

const champInstance = document.getElementById('instance');
const champDossier = document.getElementById('dossier');
const bouton = document.getElementById('capturer');
const resultat = document.getElementById('resultat');

const afficher = (html, classe) => {
  resultat.hidden = false;
  resultat.className = classe ?? '';
  resultat.innerHTML = html;
};

const echapper = (texte) =>
  String(texte).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Restaure les préférences et charge la liste des dossiers ouverts. */
async function initialiser() {
  const { instance, dossier } = await chrome.storage.local.get(['instance', 'dossier']);
  if (instance) champInstance.value = instance;

  try {
    // `credentials: 'include'` transmet le témoin de session posé lors de la
    // connexion à l'interface : l'extension n'a pas d'identifiants propres.
    const reponse = await fetch(`${champInstance.value}/api/dossiers`, {
      credentials: 'include',
    });
    if (reponse.status === 401) {
      afficher(
        '<span class="avertissement">Aucune session ouverte. Connectez-vous à AudiTREQ dans un onglet, puis rouvrez cette fenêtre.</span>',
      );
      return;
    }
    if (!reponse.ok) throw new Error(String(reponse.status));
    const { dossiers } = await reponse.json();

    for (const d of dossiers) {
      const option = document.createElement('option');
      option.value = d.id;
      option.textContent = d.nom;
      champDossier.append(option);
    }
    if (dossier) champDossier.value = dossier;
  } catch {
    afficher(
      '<span class="avertissement">Instance locale injoignable. Lancez <code>npm run api</code>, puis rouvrez cette fenêtre.</span>',
    );
  }
}

bouton.addEventListener('click', async () => {
  bouton.disabled = true;
  afficher('Lecture de la page…');

  try {
    const [onglet] = await chrome.tabs.query({ active: true, currentWindow: true });

    // L'injection vise explicitement l'onglet que l'utilisateur regarde. Aucune
    // navigation n'est déclenchée : si la page n'est pas la bonne, c'est à lui
    // de l'ouvrir, pas à l'extension d'aller la chercher.
    const [execution] = await chrome.scripting.executeScript({
      target: { tabId: onglet.id },
      files: ['extraction.js'],
    });

    const extrait = execution?.result;
    if (!extrait || extrait.sections.length === 0) {
      afficher(
        '<span class="avertissement">Aucune section exploitable sur cette page. Ouvrez la fiche d’une entreprise au registre, puis réessayez.</span>',
      );
      return;
    }

    await chrome.storage.local.set({
      instance: champInstance.value,
      dossier: champDossier.value,
    });

    const envoi = await fetch(`${champInstance.value}/api/captures`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ extrait, dossierId: champDossier.value || undefined }),
    });

    if (envoi.status === 401) {
      throw new Error('Session expirée. Reconnectez-vous à AudiTREQ, puis réessayez.');
    }
    if (!envoi.ok) {
      const detail = await envoi.json().catch(() => ({}));
      throw new Error(detail.erreur ?? `Envoi refusé (${envoi.status})`);
    }

    const { capture, exploitable, champsARelire } = await envoi.json();

    const lignes = [
      `<div class="titre">${echapper(capture.nomLegal?.valeur ?? 'Entité sans nom lu')}</div>`,
      `<div>NEQ ${echapper(capture.neq?.valeur ?? '—')} · ${capture.personnes.length} personne(s) relevée(s)</div>`,
    ];

    if (!exploitable) {
      lignes.push(
        '<div class="avertissement">Capture incomplète : elle est enregistrée, mais devra être complétée à la main.</div>',
      );
    }
    if (champsARelire.length > 0) {
      lignes.push(
        `<div class="avertissement">${champsARelire.length} élément(s) à relire :</div><ul>${champsARelire
          .slice(0, 5)
          .map((c) => `<li>${echapper(c)}</li>`)
          .join('')}</ul>`,
      );
    }
    for (const avertissement of capture.avertissements ?? []) {
      lignes.push(`<div class="avertissement">${echapper(avertissement)}</div>`);
    }

    lignes.push(
      '<div style="margin-top:8px">En attente de votre validation dans AudiTREQ, écran <b>Captures</b>.</div>',
    );
    afficher(lignes.join(''));
  } catch (erreur) {
    afficher(`<span class="erreur">${echapper(erreur.message)}</span>`);
  } finally {
    bouton.disabled = false;
  }
});

void initialiser();
