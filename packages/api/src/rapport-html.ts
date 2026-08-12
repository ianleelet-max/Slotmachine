import { LIBELLES_STATUTS, type Rapport, type StatutEntite } from '@auditreq/core';

const LIBELLES_NIVEAUX: Record<string, string> = {
  faible: 'faible',
  moyen: 'moyen',
  eleve: 'élevé',
};

/**
 * Rend le rapport en document imprimable.
 *
 * Le format retenu est du HTML mis en page pour l'impression plutôt qu'un PDF
 * généré par une bibliothèque : le professionnel obtient son PDF par la
 * commande d'impression de son navigateur, avec pagination et en-têtes
 * corrects, et le document reste lisible et vérifiable tel quel. Un export PDF
 * côté serveur (avec filigrane et signature) reste à faire pour la diffusion
 * hors cabinet.
 */
export function rendreRapportHtml(rapport: Rapport): string {
  const { entete } = rapport;

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Rapport d'audit — ${echapper(entete.dossierNom)}</title>
<style>
  @page { size: letter; margin: 20mm 18mm; }
  :root {
    --encre: #16181a;
    --encre-2: #4a5150;
    --trait: #d4d2cb;
    --eleve: #a83b31;
    --moyen: #a8681f;
    --faible: #3f7a49;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0 auto;
    max-width: 190mm;
    padding: 16mm;
    background: #fff;
    color: var(--encre);
    font: 10.5pt/1.55 Georgia, 'Times New Roman', serif;
  }
  h1 { font-size: 17pt; margin: 0 0 4px; }
  h2 {
    font-size: 12pt;
    margin: 26px 0 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid var(--trait);
  }
  h3 { font-size: 10.5pt; margin: 16px 0 6px; }
  p { margin: 0 0 8px; }
  .entete { border-bottom: 2px solid var(--encre); padding-bottom: 12px; margin-bottom: 6px; }
  .surtitre {
    font: 700 8pt/1.4 Arial, sans-serif;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--encre-2);
  }
  .meta { font: 9pt/1.6 Arial, sans-serif; color: var(--encre-2); }
  .meta dt { float: left; width: 34mm; font-weight: 700; }
  .meta dd { margin: 0 0 3px 34mm; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0 14px; font: 9pt/1.45 Arial, sans-serif; }
  th {
    text-align: left;
    font-size: 7.5pt;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--encre-2);
    border-bottom: 1px solid var(--encre);
    padding: 5px 6px;
  }
  td { padding: 5px 6px; border-bottom: 1px solid var(--trait); vertical-align: top; }
  .num { font-variant-numeric: tabular-nums; white-space: nowrap; }
  .avis { font: 8pt/1.4 'Courier New', monospace; color: var(--encre-2); }
  .signal { margin: 0 0 12px; padding-left: 10px; border-left: 3px solid var(--trait); }
  .signal.eleve { border-left-color: var(--eleve); }
  .signal.moyen { border-left-color: var(--moyen); }
  .signal .titre { font: 700 9.5pt Arial, sans-serif; }
  .signal .severite { font: 700 7.5pt Arial, sans-serif; text-transform: uppercase; letter-spacing: 0.08em; }
  .signal.eleve .severite { color: var(--eleve); }
  .signal.moyen .severite { color: var(--moyen); }
  .avertissement {
    border: 1px solid var(--eleve);
    background: #fdf5f4;
    padding: 9px 11px;
    margin: 0 0 10px;
    font-size: 9.5pt;
  }
  .chrono td:first-child { white-space: nowrap; font-variant-numeric: tabular-nums; }
  .annexe { columns: 2; font: 8.5pt/1.6 'Courier New', monospace; color: var(--encre-2); }
  .note { border-left: 3px solid var(--trait); padding-left: 10px; margin-bottom: 10px; }
  .note .qui { font: 700 8.5pt Arial, sans-serif; color: var(--encre-2); }
  footer {
    margin-top: 26px;
    padding-top: 10px;
    border-top: 1px solid var(--trait);
    font: 8pt/1.5 Arial, sans-serif;
    color: var(--encre-2);
  }
  section { break-inside: auto; }
  h2 { break-after: avoid; }
  table, .signal, .note { break-inside: avoid; }
  @media print { body { padding: 0; max-width: none; } .sans-impression { display: none; } }
</style>
</head>
<body>

<header class="entete">
  <div class="surtitre">Rapport d'audit corporatif — confidentiel</div>
  <h1>${echapper(entete.dossierNom)}</h1>
  <dl class="meta">
    <dt>Dossier</dt><dd>${echapper(entete.dossierId)}</dd>
    ${entete.client ? `<dt>Client</dt><dd>${echapper(entete.client)}</dd>` : ''}
    <dt>Préparé par</dt><dd>${echapper(entete.auteur)}</dd>
    <dt>Généré le</dt><dd>${echapper(entete.genereLe)}</dd>
    <dt>Finalité déclarée</dt><dd>${echapper(entete.finaliteDeclaree)}</dd>
    <dt>Source</dt><dd>Registre des entreprises du Québec (données publiques)</dd>
  </dl>
</header>

<section>
  <h2>1. Résumé exécutif</h2>
  ${rapport.resumeExecutif.map((l) => `<p>${echapper(l)}</p>`).join('\n  ')}
  ${
    rapport.avertissements.length > 0
      ? `<h3>Limites du présent rapport</h3>
  ${rapport.avertissements.map((a) => `<div class="avertissement">${echapper(a)}</div>`).join('\n  ')}`
      : ''
  }
</section>

<section>
  <h2>2. Structure de propriété et de contrôle</h2>
  ${rapport.sections.map((s, i) => rendreSection(s, i)).join('\n')}
</section>

<section>
  <h2>3. Chronologie</h2>
  ${
    rapport.chronologie.length === 0
      ? '<p>Aucun événement inscrit au registre pour les entités du dossier.</p>'
      : `<table class="chrono">
    <thead><tr><th>Date</th><th>Entité</th><th>Événement</th><th>Avis</th></tr></thead>
    <tbody>
      ${rapport.chronologie
        .map(
          (e) => `<tr>
        <td>${echapper(e.dateEffective)}</td>
        <td>${echapper(e.entiteLibelle)}</td>
        <td>${echapper(e.description)}</td>
        <td class="avis">${echapper(e.avisReqId)}</td>
      </tr>`,
        )
        .join('\n      ')}
    </tbody>
  </table>`
  }
</section>

<section>
  <h2>4. Signaux détectés</h2>
  ${
    rapport.signaux.length === 0
      ? `<p>Aucun signal détecté par les règles appliquées. Cette absence n'atteste pas de la conformité des entités auditées : elle indique que les données publiques du registre ne révèlent pas les motifs recherchés.</p>`
      : rapport.signaux
          .map(
            (s) => `<div class="signal ${s.severite}">
    <div class="severite">Sévérité ${echapper(LIBELLES_NIVEAUX[s.severite] ?? s.severite)}</div>
    <div class="titre">${echapper(s.libelleRegle)} — ${echapper(s.entiteLibelle)}</div>
    <p>${echapper(s.explication)}</p>
  </div>`,
          )
          .join('\n  ')
  }
</section>

${
  rapport.annotations.length > 0
    ? `<section>
  <h2>5. Observations du professionnel</h2>
  ${rapport.annotations
    .map(
      (a) => `<div class="note">
    <div class="qui">${echapper(a.auteur)} — ${echapper(a.creeLe.slice(0, 10))}${
      a.cible ? ` — ${echapper(a.cible)}` : ''
    }</div>
    <p>${echapper(a.contenu)}</p>
  </div>`,
    )
    .join('\n  ')}
</section>`
    : ''
}

<section>
  <h2>Annexe — Avis du registre cités</h2>
  <p>Chaque énoncé factuel du présent rapport se rattache à l'un des avis ci-dessous, consultables au Registre des entreprises du Québec.</p>
  <div class="annexe">
    ${rapport.sourcesCitees.map((s) => `<div>${echapper(s)}</div>`).join('\n    ')}
  </div>
</section>

<footer>
  Rapport produit par AudiTREQ à partir des données publiques du Registre des entreprises du Québec.
  Les analyses relationnelles et les signaux sont des aides à l'audit : ils ne constituent ni un avis
  juridique, ni une preuve, et demeurent sous la responsabilité du professionnel signataire.
  Document généré le ${echapper(entete.genereLe)} pour ${echapper(entete.auteur)} — usage réservé au dossier ${echapper(entete.dossierId)}.
</footer>

</body>
</html>`;
}

function rendreSection(section: Rapport['sections'][number], indice: number): string {
  return `<h3>2.${indice + 1} ${echapper(section.nomLegal)}</h3>
  <dl class="meta">
    <dt>NEQ</dt><dd class="num">${echapper(section.neq)}</dd>
    <dt>Statut</dt><dd>${echapper(LIBELLES_STATUTS[section.statut as StatutEntite] ?? section.statut)}</dd>
    <dt>Constituée le</dt><dd class="num">${echapper(section.dateConstitution)}</dd>
    ${section.dateDissolution ? `<dt>Dissoute le</dt><dd class="num">${echapper(section.dateDissolution)}</dd>` : ''}
    <dt>Score de risque</dt><dd class="num">${section.score.score}/100 (${echapper(LIBELLES_NIVEAUX[section.score.niveau] ?? section.score.niveau)})</dd>
  </dl>

  <table>
    <thead><tr><th>Actionnaire déclaré</th><th>Part</th><th>Depuis</th><th>Avis</th></tr></thead>
    <tbody>
      ${
        section.actionnaires.length === 0
          ? '<tr><td colspan="4">Aucun actionnaire déclaré au registre.</td></tr>'
          : section.actionnaires
              .map(
                (a) => `<tr>
        <td>${echapper(a.libelle)}</td>
        <td class="num">${Math.round(a.pourcentage * 100)} %</td>
        <td class="num">${echapper(a.depuis)}</td>
        <td class="avis">${echapper(a.avisReqId)}</td>
      </tr>`,
              )
              .join('\n      ')
      }
    </tbody>
  </table>

  <table>
    <thead><tr><th>Administrateur</th><th>Titre</th><th>Période</th><th>Avis</th></tr></thead>
    <tbody>
      ${
        section.administrateurs.length === 0
          ? '<tr><td colspan="4">Aucun administrateur déclaré.</td></tr>'
          : section.administrateurs
              .map(
                (a) => `<tr>
        <td>${echapper(a.libelle)}</td>
        <td>${echapper(a.titre)}</td>
        <td class="num">${echapper(a.depuis)} → ${echapper(a.jusquA ?? 'en cours')}</td>
        <td class="avis">${echapper(a.avisReqId)}</td>
      </tr>`,
              )
              .join('\n      ')
      }
    </tbody>
  </table>

  <p><strong>Bénéficiaires effectifs (seuil de 25 %)</strong></p>
  ${
    section.cheminsUbo.length === 0
      ? '<p>Aucune personne physique n’atteint le seuil par la chaîne de détention déclarée.</p>'
      : `<ul>${section.cheminsUbo
          .map(
            (c) =>
              `<li><strong>${echapper(c.personne)}</strong> — ${(c.pourcentageEffectif * 100).toFixed(1)} % : ${echapper(ponctuer(c.description))} <span class="avis">${c.avisReq.map(echapper).join(', ')}</span></li>`,
          )
          .join('\n    ')}</ul>`
  }`;
}

/** Termine une phrase sans doubler le point : « … Inc. » est déjà ponctué. */
function ponctuer(texte: string): string {
  return texte.endsWith('.') ? texte : `${texte}.`;
}

/** Échappe le contenu inséré dans le document — les libellés viennent du registre. */
function echapper(valeur: string): string {
  return valeur
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
