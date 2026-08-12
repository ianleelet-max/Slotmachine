/**
 * Parcours du DOM de la page consultée.
 *
 * Ce script est injecté dans l'onglet actif **à la demande explicite de
 * l'utilisateur**, quand il clique sur le bouton de l'extension. Il ne
 * s'exécute pas en arrière-plan, ne suit aucun lien, n'ouvre aucun onglet et
 * n'émet aucune requête : il lit la page déjà affichée et la traduit en une
 * structure neutre (titres, tableaux, paires libellé/valeur).
 *
 * L'interprétation — reconnaître un administrateur, lire un pourcentage — se
 * fait ailleurs, dans AudiTREQ. Cette séparation garde ici un code court et
 * vérifiable, et rend l'interprétation testable sans navigateur.
 */
function extraireLaPage() {
  const nettoyer = (texte) => (texte ?? '').replace(/\s+/g, ' ').trim();

  /** Un tableau HTML devient des en-têtes et des lignes de cellules. */
  const lireTableau = (table) => {
    const lignes = [...table.querySelectorAll('tr')];
    let entetes = [];
    const corps = [];

    for (const ligne of lignes) {
      const cellulesEntete = [...ligne.querySelectorAll('th')];
      const cellules = [...ligne.querySelectorAll('td')];

      if (cellulesEntete.length > 0 && cellules.length === 0) {
        entetes = cellulesEntete.map((c) => nettoyer(c.textContent));
        continue;
      }
      if (cellules.length === 0) continue;

      // Certaines mises en page mettent l'intitulé en <th> au début de la ligne.
      const valeurs = [...cellulesEntete, ...cellules].map((c) => nettoyer(c.textContent));
      if (valeurs.some((v) => v.length > 0)) corps.push(valeurs);
    }

    return { entetes, lignes: corps };
  };

  /**
   * Repère les couples libellé/valeur, quelle que soit leur forme : listes de
   * définition, tableaux à deux colonnes, ou paires d'éléments côte à côte.
   */
  const lirePaires = (racine) => {
    const paires = [];

    for (const liste of racine.querySelectorAll('dl')) {
      const enfants = [...liste.children];
      for (let i = 0; i < enfants.length - 1; i += 1) {
        if (enfants[i].tagName !== 'DT' || enfants[i + 1].tagName !== 'DD') continue;
        paires.push({
          libelle: nettoyer(enfants[i].textContent),
          valeur: nettoyer(enfants[i + 1].textContent),
        });
      }
    }

    for (const ligne of racine.querySelectorAll('tr')) {
      const cellules = [...ligne.children];
      if (cellules.length !== 2) continue;
      const libelle = nettoyer(cellules[0].textContent);
      const valeur = nettoyer(cellules[1].textContent);
      // Un libellé se termine souvent par « : » et reste court ; au-delà, on a
      // affaire à une vraie ligne de données, pas à un couple.
      if (libelle.length === 0 || libelle.length > 80) continue;
      paires.push({ libelle: libelle.replace(/\s*:\s*$/, ''), valeur });
    }

    for (const element of racine.querySelectorAll('[data-libelle]')) {
      paires.push({
        libelle: nettoyer(element.getAttribute('data-libelle')),
        valeur: nettoyer(element.textContent),
      });
    }

    return paires;
  };

  /**
   * Découpe la page en sections délimitées par leurs titres. Le rattachement
   * par titre est ce qui rend l'interprétation indépendante de la mise en page.
   */
  const titres = [...document.querySelectorAll('h1, h2, h3, h4, legend, caption')].filter(
    (t) => nettoyer(t.textContent).length > 0,
  );

  const sections = [];

  for (let i = 0; i < titres.length; i += 1) {
    const titre = titres[i];
    const suivant = titres[i + 1];

    // Le contenu d'une section est ce qui suit son titre jusqu'au titre
    // suivant. On remonte au conteneur commun pour ne pas rater les tableaux
    // placés à côté du titre plutôt qu'en dessous.
    const conteneur = titre.closest('section, fieldset, article, div') ?? document.body;
    const dansLaSection = (element) => {
      if (suivant && suivant.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_PRECEDING) {
        return false;
      }
      return titre.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING;
    };

    const tableaux = [...conteneur.querySelectorAll('table')]
      .filter(dansLaSection)
      .map(lireTableau)
      .filter((t) => t.lignes.length > 0);

    const paires = lirePaires(conteneur).filter((p) => p.valeur.length > 0);

    if (tableaux.length === 0 && paires.length === 0) continue;

    sections.push({
      titre: nettoyer(titre.textContent),
      tableaux,
      paires,
      texte: nettoyer(conteneur.textContent).slice(0, 4000),
    });
  }

  return {
    url: location.href,
    titrePage: document.title,
    sections,
    extraitLe: new Date().toISOString(),
  };
}

// Valeur de retour de chrome.scripting.executeScript.
extraireLaPage();
