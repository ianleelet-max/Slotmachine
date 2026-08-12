import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { grapheDemonstration } from './fixtures.js';
import { grapheVide, estActive, ecartJours, type GrapheCorporatif } from './domaine.js';
import { IndexGraphe } from './index-graphe.js';
import { detecterCycles } from './cycles.js';
import { calculerUbo, SEUIL_UBO } from './ubo.js';
import { creerContexte, executerRegles, type RedFlag, type TypeRegle } from './regles.js';
import { analyser, calculerScore, SEUIL_NIVEAU_ELEVE } from './scoring.js';
import { rechercher } from './recherche.js';
import { normaliserNomLegal, similariteNomLegal, jaroWinkler } from './texte.js';

const index = new IndexGraphe(grapheDemonstration());
const contexte = creerContexte(index);
const flags = executerRegles(contexte);

const typesPour = (entiteId: string): TypeRegle[] =>
  flags.filter((f) => f.entiteId === entiteId).map((f) => f.typeRegle);

const flagsDeType = (type: TypeRegle): RedFlag[] => flags.filter((f) => f.typeRegle === type);

describe('utilitaires de domaine', () => {
  test('estActive respecte les bornes de la relation', () => {
    const relation = { depuis: '2020-01-01', jusquA: '2022-01-01' };
    assert.equal(estActive(relation, '2021-01-01'), true);
    assert.equal(estActive(relation, '2019-12-31'), false);
    assert.equal(estActive(relation, '2022-06-01'), false);
    // Sans date d'observation, seules les relations non closes sont actives.
    assert.equal(estActive(relation), false);
    assert.equal(estActive({ depuis: '2020-01-01' }), true);
  });

  test('ecartJours compte les jours calendaires', () => {
    assert.equal(ecartJours('2023-10-03', '2023-11-19'), 47);
    assert.equal(ecartJours('2023-11-19', '2023-10-03'), -47);
  });
});

describe('normalisation et similarité de noms', () => {
  test('les suffixes juridiques sont neutralisés', () => {
    assert.equal(normaliserNomLegal('Gestion Lavallée-Bouchard Inc.'), 'gestion lavallee bouchard');
    assert.equal(normaliserNomLegal('Transport Mégantic-Sud Ltée'), 'transport megantic sud');
  });

  test('deux dénominations proches obtiennent une similarité élevée', () => {
    assert.ok(similariteNomLegal('Groupe Lavallée Inc.', 'Groupe Lavalée Inc.') > 0.9);
    assert.ok(similariteNomLegal('Groupe Lavallée Inc.', 'Boulangerie Saint-Roch') < 0.5);
  });

  test('jaroWinkler tolère les variantes de prénom', () => {
    assert.ok(jaroWinkler('marc andre fortin', 'marc a fortin') > 0.85);
  });
});

describe('détection de cycles', () => {
  test('le cycle E1 → E3 → E2 → E1 est détecté', () => {
    const cycles = detecterCycles(index);
    assert.equal(cycles.length, 1);
    assert.deepEqual(new Set(cycles[0]!.entites), new Set(['E1', 'E2', 'E3']));
    assert.ok(cycles[0]!.relations.length >= 3);
  });

  test('un graphe acyclique ne produit aucun cycle', () => {
    const graphe: GrapheCorporatif = {
      ...grapheVide(),
      entites: [
        { id: 'X', neq: '1', nomLegal: 'X Inc.', nomsAnterieurs: [], formeJuridique: 'societe_par_actions', statut: 'immatriculee', dateConstitution: '2020-01-01' },
        { id: 'Y', neq: '2', nomLegal: 'Y Inc.', nomsAnterieurs: [], formeJuridique: 'societe_par_actions', statut: 'immatriculee', dateConstitution: '2020-01-01' },
      ],
      detentions: [
        { id: 'd', sourceEntiteId: 'X', cibleEntiteId: 'Y', pourcentage: 1, depuis: '2020-01-01', avisReqId: 'A' },
      ],
    };
    assert.deepEqual(detecterCycles(new IndexGraphe(graphe)), []);
  });

  test('une auto-détention forme un cycle à une seule entité', () => {
    const graphe: GrapheCorporatif = {
      ...grapheVide(),
      entites: [
        { id: 'Z', neq: '3', nomLegal: 'Z Inc.', nomsAnterieurs: [], formeJuridique: 'societe_par_actions', statut: 'immatriculee', dateConstitution: '2020-01-01' },
      ],
      detentions: [
        { id: 'd', sourceEntiteId: 'Z', cibleEntiteId: 'Z', pourcentage: 0.1, depuis: '2020-01-01', avisReqId: 'A' },
      ],
    };
    const cycles = detecterCycles(new IndexGraphe(graphe));
    assert.equal(cycles.length, 1);
    assert.deepEqual(cycles[0]!.entites, ['Z']);
  });
});

describe('calcul du bénéficiaire ultime', () => {
  const resultat = calculerUbo(index, 'E1');

  test('la détention directe au-delà du seuil ressort comme bénéficiaire', () => {
    const rousseau = resultat.beneficiaires.find((b) => b.personneId === 'P1');
    assert.ok(rousseau, 'Chantal Rousseau doit être bénéficiaire');
    assert.equal(rousseau.pourcentageEffectif, 0.35);
    assert.equal(rousseau.chaine.length, 1);
  });

  test('les pourcentages se multiplient le long de la chaîne', () => {
    // Denis Bouchard détient 60 % de E2, qui détient 65 % de E1 → 39 %.
    const bouchard = resultat.beneficiaires.find((b) => b.personneId === 'P4');
    assert.ok(bouchard, 'Denis Bouchard doit être bénéficiaire indirect');
    assert.ok(Math.abs(bouchard.pourcentageEffectif - 0.39) < 1e-9);
    assert.equal(bouchard.chaine.length, 2);
    assert.ok(bouchard.pourcentageEffectif >= SEUIL_UBO);
  });

  test('chaque bénéficiaire porte la chaîne qui le justifie, avec ses avis sources', () => {
    for (const beneficiaire of resultat.beneficiaires) {
      assert.ok(beneficiaire.chaine.length > 0);
      for (const maillon of beneficiaire.chaine) {
        assert.match(maillon.avisReqId, /^REQ-/);
      }
    }
  });

  test('un cycle rend le résultat explicitement indéterminé', () => {
    assert.equal(resultat.indetermine, true);
    const motifs = resultat.anglesMorts.map((a) => a.motif);
    assert.ok(motifs.includes('chaine_interrompue_par_cycle'));
  });

  test('les participations multiples vers une même personne sont additionnées', () => {
    const graphe: GrapheCorporatif = {
      ...grapheVide(),
      entites: [
        { id: 'CIBLE', neq: '1', nomLegal: 'Cible Inc.', nomsAnterieurs: [], formeJuridique: 'societe_par_actions', statut: 'immatriculee', dateConstitution: '2020-01-01' },
        { id: 'INTER', neq: '2', nomLegal: 'Inter Inc.', nomsAnterieurs: [], formeJuridique: 'societe_par_actions', statut: 'immatriculee', dateConstitution: '2020-01-01' },
      ],
      personnes: [{ id: 'PX', nomComplet: 'Personne X', variantesNom: [], scoreConfianceIdentite: 1 }],
      detentions: [
        { id: 'd1', sourcePersonneId: 'PX', cibleEntiteId: 'CIBLE', pourcentage: 0.15, depuis: '2020-01-01', avisReqId: 'REQ-1' },
        { id: 'd2', sourceEntiteId: 'INTER', cibleEntiteId: 'CIBLE', pourcentage: 0.85, depuis: '2020-01-01', avisReqId: 'REQ-2' },
        { id: 'd3', sourcePersonneId: 'PX', cibleEntiteId: 'INTER', pourcentage: 0.2, depuis: '2020-01-01', avisReqId: 'REQ-3' },
      ],
    };
    // 15 % en direct + 20 % × 85 % = 17 % indirect → 32 %, au-dessus du seuil,
    // alors qu'aucune des deux branches ne l'atteint isolément.
    const r = calculerUbo(new IndexGraphe(graphe), 'CIBLE');
    const px = r.beneficiaires.find((b) => b.personneId === 'PX');
    assert.ok(px, 'les deux branches doivent être cumulées');
    assert.ok(Math.abs(px.pourcentageEffectif - 0.32) < 1e-9);
  });

  test('un administrateur unique sans détention déclarée ressort en angle mort', () => {
    const graphe: GrapheCorporatif = {
      ...grapheVide(),
      entites: [
        { id: 'SEUL', neq: '9', nomLegal: 'Seul Inc.', nomsAnterieurs: [], formeJuridique: 'societe_par_actions', statut: 'immatriculee', dateConstitution: '2020-01-01' },
      ],
      personnes: [{ id: 'PA', nomComplet: 'Admin Unique', variantesNom: [], scoreConfianceIdentite: 1 }],
      administrations: [
        { id: 'a1', personneId: 'PA', entiteId: 'SEUL', titre: 'Président', depuis: '2020-01-01', avisReqId: 'REQ-9' },
      ],
    };
    const r = calculerUbo(new IndexGraphe(graphe), 'SEUL');
    assert.equal(r.beneficiaires.length, 0);
    const motifs = r.anglesMorts.map((a) => a.motif);
    assert.ok(motifs.includes('aucun_detenteur_declare'));
    assert.ok(motifs.includes('administrateur_unique_sans_detention'));
  });

  test('la date d’observation rejoue le calcul sur un état historique', () => {
    // Avant le transfert du 3 octobre 2023, Gestion Lavallée-Bouchard ne
    // détenait pas encore E1 : Denis Bouchard n'est alors pas bénéficiaire.
    const avant = calculerUbo(index, 'E1', { date: '2022-01-01' });
    assert.equal(avant.beneficiaires.some((b) => b.personneId === 'P4'), false);
    assert.equal(avant.beneficiaires.some((b) => b.personneId === 'P1'), true);
  });

  test('une entité inconnue retourne un résultat vide plutôt qu’une erreur', () => {
    const r = calculerUbo(index, 'INEXISTANT');
    assert.deepEqual(r.beneficiaires, []);
    assert.equal(r.indetermine, false);
  });
});

describe('règles de détection', () => {
  test('cycle_detention est signalé en sévérité élevée sur chaque entité du cycle', () => {
    const cycliques = flagsDeType('cycle_detention');
    assert.deepEqual(new Set(cycliques.map((f) => f.entiteId)), new Set(['E1', 'E2', 'E3']));
    assert.ok(cycliques.every((f) => f.severite === 'eleve'));
  });

  test('cascade_excessive signale l’actif immobilier au bout de la chaîne', () => {
    const cascades = flagsDeType('cascade_excessive');
    assert.ok(cascades.some((f) => f.entiteId === 'E4'));
    const flagE4 = cascades.find((f) => f.entiteId === 'E4')!;
    assert.ok((flagE4.elementsDeclencheurs.entites ?? []).length >= 4);
  });

  test('une structure déclarée connue échappe à la règle de cascade', () => {
    const grapheConnu = grapheDemonstration();
    for (const e of grapheConnu.entites) e.structureConnue = true;
    const flagsConnus = executerRegles(creerContexte(new IndexGraphe(grapheConnu)));
    assert.equal(flagsConnus.filter((f) => f.typeRegle === 'cascade_excessive').length, 0);
  });

  test('dissolution_reconstitution rapproche Gestion 9412 de l’entité radiée', () => {
    const reconstitutions = flagsDeType('dissolution_reconstitution');
    const flag = reconstitutions.find((f) => f.entiteId === 'E5');
    assert.ok(flag, 'E5 doit être signalée comme reconstitution');
    assert.deepEqual(new Set(flag.elementsDeclencheurs.entites), new Set(['E3', 'E5']));
    assert.equal(flag.severite, 'eleve'); // 81 jours, donc sous les 180 jours
    assert.match(flag.explication, /81 jours/);
  });

  test('un seul point commun ne suffit pas à déclencher la reconstitution', () => {
    const graphe = grapheDemonstration();
    // On retire les administrateurs communs et le secteur commun : il ne reste
    // que l'adresse partagée, soit un seul signal.
    graphe.administrations = graphe.administrations.filter((a) => a.entiteId !== 'E5');
    graphe.entites.find((e) => e.id === 'E5')!.codeNaics = '999999';
    const resultat = executerRegles(creerContexte(new IndexGraphe(graphe)));
    assert.equal(
      resultat.some((f) => f.typeRegle === 'dissolution_reconstitution' && f.entiteId === 'E5'),
      false,
    );
  });

  test('transfert_avant_evenement_critique relie le transfert d’actions à la radiation liée', () => {
    const transferts = flagsDeType('transfert_avant_evenement_critique');
    const flag = transferts.find((f) => f.entiteId === 'E1');
    assert.ok(flag, 'le transfert du 3 octobre 2023 doit être signalé');
    assert.match(flag.explication, /47 jours/);
    assert.equal(flag.severite, 'eleve');
    assert.ok((flag.elementsDeclencheurs.avisReq ?? []).includes('REQ-23-402118'));
  });

  test('adresse_partagee_massive ne retient que les entités reliées entre elles', () => {
    const partagees = flagsDeType('adresse_partagee_massive');
    assert.ok(partagees.length > 0);
    const entitesSignalees = new Set(partagees.map((f) => f.entiteId));
    // E6 à E9 partagent l'adresse A1 et l'administrateur P5.
    for (const id of ['E6', 'E7', 'E8', 'E9']) assert.ok(entitesSignalees.has(id));
    assert.ok(partagees.every((f) => (f.elementsDeclencheurs.adresses ?? []).includes('A1')));
  });

  test('une adresse de domiciliataire connu n’est jamais signalée', () => {
    const partagees = flagsDeType('adresse_partagee_massive');
    assert.equal(
      partagees.some((f) => (f.elementsDeclencheurs.adresses ?? []).includes('A3')),
      false,
    );
  });

  test('prete_nom_probable ressort sur le profil aux mandats courts et sans détention', () => {
    const preteNoms = flagsDeType('prete_nom_probable');
    assert.ok(preteNoms.length > 0);
    assert.ok(preteNoms.every((f) => (f.elementsDeclencheurs.personnes ?? []).includes('P5')));
    // Le libellé doit rester au conditionnel : la donnée publique ne prouve rien.
    assert.match(preteNoms[0]!.explication, /compatible avec/);
  });

  test('administrateur_recurrent signale l’entité encore active du même profil', () => {
    const recurrents = flagsDeType('administrateur_recurrent');
    assert.ok(recurrents.some((f) => f.entiteId === 'E9'));
    // Les entités déjà défaillantes ne sont pas re-signalées par cette règle.
    assert.equal(recurrents.some((f) => ['E6', 'E7', 'E8'].includes(f.entiteId)), false);
  });

  test('changement_avant_evenement_critique reste hors des entités saines', () => {
    const changements = flagsDeType('changement_avant_evenement_critique');
    // Aucun changement de nom/siège de E1 ne précède un événement critique
    // de E1 elle-même : la règle ne doit pas déborder sur les entités liées.
    assert.equal(changements.some((f) => f.entiteId === 'E1'), false);
  });

  test('chaque flag expose les éléments qui l’ont déclenché', () => {
    for (const flag of flags) {
      const elements = flag.elementsDeclencheurs;
      const total =
        (elements.entites?.length ?? 0) +
        (elements.personnes?.length ?? 0) +
        (elements.relations?.length ?? 0) +
        (elements.evenements?.length ?? 0) +
        (elements.adresses?.length ?? 0);
      assert.ok(total > 0, `le flag ${flag.typeRegle} sur ${flag.entiteId} doit être justifié`);
      assert.ok(flag.explication.length > 30);
    }
  });

  test('un graphe vide ne déclenche aucune règle', () => {
    assert.deepEqual(executerRegles(creerContexte(new IndexGraphe(grapheVide()))), []);
  });
});

describe('scoring de risque', () => {
  const { scores } = analyser(contexte);

  test('l’entité au cœur du montage obtient un score élevé', () => {
    const e1 = scores.get('E1')!;
    assert.equal(e1.niveau, 'eleve');
    assert.ok(e1.score >= SEUIL_NIVEAU_ELEVE);
    assert.ok(e1.contributions.length >= 2);
  });

  test('le score est toujours décomposé en contributions ordonnées', () => {
    for (const score of scores.values()) {
      const somme = score.contributions.reduce((s, c) => s + c.points, 0) + score.bonusFaisceau;
      // Le score affiché est borné à 100 mais reste dérivable des contributions.
      assert.ok(score.score <= Math.round(somme) + 1);
      for (let i = 1; i < score.contributions.length; i += 1) {
        assert.ok(score.contributions[i - 1]!.points >= score.contributions[i]!.points);
      }
    }
  });

  test('le bonus de faisceau ne s’applique qu’à partir de trois règles distinctes', () => {
    const avecTrois = calculerScore('X', [
      flagFictif('X', 'cycle_detention', 'eleve'),
      flagFictif('X', 'cascade_excessive', 'moyen'),
      flagFictif('X', 'adresse_partagee_massive', 'moyen'),
    ]);
    const avecDeux = calculerScore('X', [
      flagFictif('X', 'cycle_detention', 'eleve'),
      flagFictif('X', 'cascade_excessive', 'moyen'),
    ]);
    assert.ok(avecTrois.bonusFaisceau > 0);
    assert.equal(avecDeux.bonusFaisceau, 0);
  });

  test('les occurrences répétées d’une même règle ont un rendement décroissant', () => {
    const une = calculerScore('X', [flagFictif('X', 'adresse_partagee_massive', 'moyen')]);
    const cinq = calculerScore(
      'X',
      Array.from({ length: 5 }, () => flagFictif('X', 'adresse_partagee_massive', 'moyen')),
    );
    assert.ok(cinq.score > une.score);
    assert.ok(cinq.score < une.score * 5);
  });

  test('une entité sans flag obtient un score nul', () => {
    const vierge = calculerScore('AUCUNE', flags);
    assert.equal(vierge.score, 0);
    assert.equal(vierge.niveau, 'faible');
    assert.deepEqual(vierge.contributions, []);
  });

  test('le score reste borné à 100', () => {
    const tousTypes: TypeRegle[] = [
      'cycle_detention',
      'cascade_excessive',
      'administrateur_recurrent',
      'prete_nom_probable',
      'transfert_avant_evenement_critique',
      'dissolution_reconstitution',
      'adresse_partagee_massive',
      'changement_avant_evenement_critique',
    ];
    const sature = calculerScore(
      'X',
      tousTypes.flatMap((type) =>
        Array.from({ length: 5 }, () => flagFictif('X', type, 'eleve')),
      ),
    );
    assert.equal(sature.score, 100);
  });

  test('deux règles très lourdes ne saturent pas à elles seules le score', () => {
    // Sans faisceau d'indices, un montage ne doit pas atteindre le maximum :
    // le plafond doit rester atteignable seulement par accumulation de
    // signaux de natures différentes.
    const deuxRegles = calculerScore('X', [
      flagFictif('X', 'cycle_detention', 'eleve'),
      flagFictif('X', 'dissolution_reconstitution', 'eleve'),
    ]);
    assert.ok(deuxRegles.score < 100);
    assert.equal(deuxRegles.bonusFaisceau, 0);
  });
});

describe('recherche', () => {
  const { entites, personnes } = index.graphe;

  test('le NEQ prime sur toute autre correspondance', () => {
    const resultats = rechercher('1171234567', entites, personnes);
    assert.equal(resultats[0]!.id, 'E1');
    assert.equal(resultats[0]!.motifCorrespondance, 'neq');
  });

  test('la recherche partielle par nom trouve l’entité', () => {
    const resultats = rechercher('Lavallée', entites, personnes);
    assert.ok(resultats.some((r) => r.id === 'E2'));
  });

  test('la similarité rattrape une variation orthographique', () => {
    const resultats = rechercher('Gestion Lavalée-Bouchard', entites, personnes);
    assert.ok(resultats.some((r) => r.id === 'E2'));
  });

  test('un nom antérieur reste trouvable et est signalé comme tel', () => {
    const resultats = rechercher('9284-1057 Canada', entites, personnes);
    const trouve = resultats.find((r) => r.id === 'E1');
    assert.ok(trouve);
    assert.equal(trouve.motifCorrespondance, 'nom_anterieur');
  });

  test('la recherche de personne fonctionne et respecte la limite', () => {
    const resultats = rechercher('Fortin', entites, personnes);
    assert.equal(resultats[0]!.type, 'personne');
    assert.equal(resultats[0]!.id, 'P2');
    assert.ok(rechercher('e', entites, personnes, { limite: 2 }).length <= 2);
  });

  test('une requête vide ne retourne rien', () => {
    assert.deepEqual(rechercher('   ', entites, personnes), []);
  });

  test('les résultats sont triés par pertinence décroissante', () => {
    const resultats = rechercher('Gestion', entites, personnes);
    for (let i = 1; i < resultats.length; i += 1) {
      assert.ok(resultats[i - 1]!.pertinence >= resultats[i]!.pertinence);
    }
  });
});

function flagFictif(entiteId: string, typeRegle: TypeRegle, severite: RedFlag['severite']): RedFlag {
  return {
    typeRegle,
    entiteId,
    severite,
    explication: 'Flag de test servant au calcul de score.',
    elementsDeclencheurs: { entites: [entiteId] },
  };
}
