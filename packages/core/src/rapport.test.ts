import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { grapheDemonstration } from './fixtures.js';
import { IndexGraphe } from './index-graphe.js';
import { creerContexte, executerRegles } from './regles.js';
import { comparerStructures } from './comparaison.js';
import { composerRapport, type EnteteRapport } from './rapport.js';

const index = new IndexGraphe(grapheDemonstration());
const flags = executerRegles(creerContexte(index));

const entete: EnteteRapport = {
  dossierId: 'D-2026-014',
  dossierNom: 'Faillite — 9284-1057 Québec Inc.',
  client: 'Syndics Roy & Associés',
  finaliteDeclaree: 'Reconstitution de la structure de propriété du failli',
  auteur: 'Chantal Roy',
  genereLe: '2026-08-12',
};

describe('comparaison temporelle', () => {
  test('le transfert d’actions de 2023 ressort entre 2022 et 2024', () => {
    const diff = comparerStructures(index, '2022-01-01', '2024-01-01');
    const apparue = diff.detentions.find((d) => d.relationId === 'D1');
    assert.ok(apparue, 'la détention de 65 % doit apparaître dans la fenêtre');
    assert.equal(apparue.nature, 'apparu');
    assert.equal(apparue.pourcentageApres, 0.65);
    assert.equal(apparue.detenteurLibelle, 'Gestion Lavallée-Bouchard Inc.');
  });

  test('les mandats échus dans la fenêtre ressortent comme disparus', () => {
    const diff = comparerStructures(index, '2023-01-01', '2024-01-01');
    const echu = diff.administrations.find((a) => a.relationId === 'AD3');
    assert.ok(echu, 'le mandat clos en novembre 2023 doit ressortir');
    assert.equal(echu.nature, 'disparu');
  });

  test('constitutions et dissolutions de la fenêtre sont rapportées', () => {
    const diff = comparerStructures(index, '2023-06-01', '2024-06-01');
    const natures = new Map(diff.entites.map((e) => [`${e.entiteId}:${e.nature}`, e]));
    assert.ok(natures.has('E5:apparu'), 'Gestion 9412 Inc. est constituée dans la fenêtre');
    assert.ok(natures.has('E3:disparu'), '9412-8837 Québec Inc. est radiée dans la fenêtre');
  });

  test('un changement de dénomination ressort comme modification', () => {
    const diff = comparerStructures(index, '2021-01-01', '2021-12-31');
    const modifie = diff.entites.find((e) => e.entiteId === 'E1' && e.nature === 'modifie');
    assert.ok(modifie, 'le changement de nom de juin 2021 doit ressortir');
    assert.match(modifie.detail, /REQ-21-119042/);
  });

  test('le périmètre restreint la comparaison aux entités demandées', () => {
    const diff = comparerStructures(index, '2019-01-01', '2026-01-01', { entites: ['E4'] });
    assert.ok(diff.detentions.every((d) => d.cibleEntiteId === 'E4'));
    assert.ok(diff.administrations.every((a) => a.entiteId === 'E4'));
  });

  test('deux dates identiques ne produisent aucun changement', () => {
    const diff = comparerStructures(index, '2024-01-01', '2024-01-01');
    assert.equal(diff.aucunChangement, true);
  });

  test('une fenêtre sans activité est explicitement signalée comme telle', () => {
    const diff = comparerStructures(index, '2026-06-01', '2026-07-01');
    assert.equal(diff.aucunChangement, true);
  });
});

describe('composition du rapport', () => {
  const rapport = composerRapport(index, {
    entete,
    entites: ['E1', 'E3'],
    flags,
    annotations: [
      {
        auteur: 'Chantal Roy',
        cible: '9284-1057 Québec Inc.',
        contenu: 'Demander la convention entre actionnaires au dirigeant.',
        creeLe: '2026-08-11T14:02:00Z',
      },
    ],
  });

  test('le rapport couvre les entités demandées et rien d’autre', () => {
    assert.deepEqual(
      rapport.sections.map((s) => s.entiteId),
      ['E1', 'E3'],
    );
    assert.ok(rapport.signaux.every((s) => ['E1', 'E3'].includes(s.entiteId)));
  });

  test('chaque avis cité est collecté dans l’annexe des sources', () => {
    assert.ok(rapport.sourcesCitees.length > 0);
    assert.ok(rapport.sourcesCitees.every((s) => s.startsWith('REQ-')));
    // Aucun doublon, et l'annexe est triée pour être vérifiable ligne à ligne.
    assert.deepEqual(rapport.sourcesCitees, [...new Set(rapport.sourcesCitees)].sort());

    // Tout avis mentionné dans une chaîne UBO doit se retrouver en annexe.
    for (const section of rapport.sections) {
      for (const chemin of section.cheminsUbo) {
        for (const avis of chemin.avisReq) assert.ok(rapport.sourcesCitees.includes(avis));
      }
    }
  });

  test('l’indétermination de l’UBO devient un avertissement du rapport', () => {
    assert.ok(rapport.avertissements.some((a) => /indéterminable/i.test(a)));
  });

  test('le résumé énonce les signaux de sévérité élevée', () => {
    const resume = rapport.resumeExecutif.join(' ');
    assert.match(resume, /Cycle de détention/);
    assert.match(resume, /risque élevé/);
  });

  test('les signaux sont ordonnés du plus grave au moins grave', () => {
    const rangs = rapport.signaux.map((s) =>
      ({ info: 0, faible: 1, moyen: 2, eleve: 3 })[s.severite],
    );
    for (let i = 1; i < rangs.length; i += 1) assert.ok(rangs[i - 1]! >= rangs[i]!);
  });

  test('les annotations du dossier sont reprises telles quelles', () => {
    assert.equal(rapport.annotations.length, 1);
    assert.equal(rapport.annotations[0]!.auteur, 'Chantal Roy');
  });

  test('la chaîne de détention est décrite en clair pour chaque bénéficiaire', () => {
    const section = rapport.sections.find((s) => s.entiteId === 'E1')!;
    const bouchard = section.cheminsUbo.find((c) => c.personne === 'Denis Bouchard');
    assert.ok(bouchard);
    assert.match(bouchard.description, /détient 60 % de Gestion Lavallée-Bouchard Inc/);
    assert.match(bouchard.description, /qui .*détient 65 % de 9284-1057 Québec Inc/);
  });

  test('une entité sans signal produit un rapport qui le dit explicitement', () => {
    const propre = composerRapport(index, { entete, entites: ['E4'], flags: [] });
    assert.equal(propre.signaux.length, 0);
    assert.ok(
      propre.resumeExecutif.some((l) => /ne vaut pas attestation de conformité/.test(l)),
      'l’absence de signal ne doit jamais se lire comme un quitus',
    );
  });

  test('une entité inconnue est ignorée sans faire échouer la composition', () => {
    const rapportPartiel = composerRapport(index, {
      entete,
      entites: ['E1', 'INEXISTANT'],
      flags,
    });
    assert.equal(rapportPartiel.sections.length, 1);
  });
});
