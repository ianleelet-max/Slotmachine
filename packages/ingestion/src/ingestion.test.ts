import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { IndexGraphe, creerContexte, executerRegles } from '@auditreq/core';

import { analyserCsv, decouper, detecterSeparateur, normaliserDate, normaliserIndicateur } from './lecture-csv.js';
import { chargerArchive } from './archive.js';
import { FICHIER_ENTREPRISE } from './specification.js';

/**
 * Les fichiers ci-dessous reproduisent la structure documentée par le guide
 * IN-537 du Registraire. Ils sont synthétiques : l'archive réelle n'a pas pu
 * être téléchargée depuis cet environnement (le service filtre les requêtes
 * automatisées), de sorte que le parseur est validé contre la spécification et
 * non contre un échantillon officiel.
 */

const ENTREPRISE_CSV = [
  'NEQ,IND_FAIL,DAT_IMMAT,COD_REGIM_JURI,COD_INTVAL_EMPLO_QUE,DAT_CESS_PREVU,COD_STAT_IMMAT,COD_FORME_JURI,DAT_STAT_IMMAT,COD_REGIM_JURI_CONSTI,DAT_DEPO_DECLR,AN_DECL,AN_PROD,DAT_LIMIT_PROD,AN_PROD_PRE,DAT_LIMIT_PROD_PRE,DAT_MAJ_INDEX_NOM,COD_ACT_ECON_CAE,NO_ACT_ECON_ASSUJ,DESC_ACT_ECON_ASSUJ,COD_ACT_ECON_CAE2,NO_ACT_ECON_ASSUJ2,DESC_ACT_ECON_ASSUJ2,NOM_LOCLT_CONSTI,DAT_CONSTI,IND_CONVEN_UNMN_ACTNR,IND_RET_TOUT_POUVR,IND_LIMIT_RESP,DAT_DEB_RESP,DAT_FIN_RESP,OBJET_SOC,NO_MTR_VOLONT,ADR_DOMCL_ADR_DISP,ADR_DOMCL_LIGN1_ADR,ADR_DOMCL_LIGN2_ADR,ADR_DOMCL_LIGN3_ADR,ADR_DOMCL_LIGN4_ADR',
  // Société active, convention unanime avec retrait des pouvoirs du conseil.
  '1170000001,0,2015-04-01,QC,2,,IMM,SPA,2015-04-01,QC,2025-05-01,2025,2025,2026-06-15,2024,2025-06-15,2025-05-01,4841,1,Transport par camion,,,,Montréal,2015-04-01,1,1,0,,,,,1,"1500 boul René-Lévesque O",bureau 2400,Montréal,H3B 4W8',
  // Société radiée d'office, à la même adresse.
  '1170000002,0,2016-02-11,QC,1,,RAD,SPA,2023-08-30,QC,2021-05-01,2021,2021,2022-06-15,2020,2021-06-15,2021-05-01,5311,1,Location immobilière,,,,Québec,2016-02-11,0,0,0,,,,,1,"1500 boul René-Lévesque O",bureau 2400,Montréal,H3B 4W8',
  // Société née peu après la radiation de la précédente, même adresse.
  '1170000003,0,2023-11-02,QC,1,,IMM,SPA,2023-11-02,QC,2025-05-01,2025,2025,2026-06-15,,,2025-05-01,5311,1,Location immobilière,,,,Québec,2023-11-02,0,0,0,,,,,1,"1500 boul René-Lévesque O",bureau 2400,Montréal,H3B 4W8',
  // Société en faillite, issue d'une fusion.
  '1170000004,1,2010-06-30,QC,3,,IMM,SPA,2024-01-15,QC,2024-05-01,2024,2024,2025-06-15,2023,2024-06-15,2024-05-01,2362,1,Construction résidentielle,,,,Laval,2010-06-30,0,0,0,,,,,1,"75 rue Principale",,Laval,H7N 1A1',
  // Ligne sans NEQ : doit être écartée avec un motif.
  ',0,2019-01-01,QC,1,,IMM,SPA,2019-01-01,QC,,,,,,,,,,,,,,Montréal,2019-01-01,0,0,0,,,,,0,,,,',
  // Ligne sans aucune date exploitable : écartée également.
  '1170000009,0,,QC,1,,IMM,SPA,,QC,,,,,,,,,,,,,,Montréal,,0,0,0,,,,,0,,,,',
].join('\n');

const NOM_CSV = [
  'NEQ,NOM_ASSUJ,NOM_ASSUJ_LANG_ETRNG,STAT_NOM,TYP_NOM_ASSUJ,DAT_INIT_NOM_ASSUJ,DAT_FIN_NOM_ASSUJ',
  '1170000001,Transport Rivedoux Inc.,,A,LEG,2015-04-01,',
  '1170000001,Camionnage Rivedoux Inc.,,I,LEG,2015-04-01,2019-09-12',
  '1170000002,Gestion Peyrolles Inc.,,A,LEG,2016-02-11,',
  '1170000003,Gestion Peyrolles 2023 Inc.,,A,LEG,2023-11-02,',
  '1170000004,Constructions Belmire Ltée,,A,LEG,2010-06-30,',
  ',Nom orphelin,,A,LEG,2020-01-01,',
].join('\n');

const ETABLISSEMENT_CSV = [
  'NEQ,NO_SUF_ETAB,IND_ETAB_PRINC,IND_SALON_BRONZ,IND_VENTE_TABAC_DETL,IND_DISP,LIGN1_ADR,LIGN2_ADR,LIGN3_ADR,LIGN4_ADR,COD_ACT_ECON,DESC_ACT_ECON_ETAB,NO_ACT_ECON_ETAB,COD_ACT_ECON2,DESC_ACT_ECON_ETAB2,NO_ACT_ECON_ETAB2,NOM_ETAB',
  '1170000001,1,1,0,0,1,"200 rue Notre-Dame",,Repentigny,J6A 1A1,4841,Entrepôt,1,,,,Entrepôt Rivedoux',
  '1170000004,1,1,0,0,1,"75 rue Principale",,Laval,H7N 1A1,2362,Chantier,1,,,,',
  '9999999999,1,1,0,0,1,"1 rue Inconnue",,Nulle part,X0X 0X0,,,,,,,',
].join('\n');

const FUSION_CSV = [
  'NEQ,NEQ_ASSUJ_REL,DENOMN_SOC,COD_RELA_ASSUJ,DAT_EFCTVT,IND_DISP,LIGN1_ADR,LIGN2_ADR,LIGN3_ADR,LIGN4_ADR',
  '1170000004,1160000099,Bâtiments Chevrotière Inc.,FUS,2024-01-15,1,"75 rue Principale",,Laval,H7N 1A1',
].join('\n');

const CONTINUATION_CSV = [
  'NEQ,COD_TYP_CHANG,COD_REGIM_JURI,AUTR_REGIM_JURI,NOM_LOCLT,DAT_EFCTVT',
  '1170000001,CONT,QC,,Montréal,2018-03-20',
].join('\n');

const DOMAINE_CSV = [
  'TYP_DOM_VAL,COD_DOM_VAL,VAL_DOM_FRAN',
  'STAT_IMMAT,IMM,Immatriculée',
  "STAT_IMMAT,RAD,Radiée d'office",
  'FORM_JURI,SPA,Société par actions',
  'REGIM_JURI,QC,Loi sur les sociétés par actions (Québec)',
  'RELA_ASSUJ,FUS,Fusion',
  'TYP_CHANG,CONT,Continuation',
  'TYP_NOM_ASSUJ,LEG,Nom légal',
].join('\n');

let repertoire: string;

before(async () => {
  repertoire = await mkdtemp(join(tmpdir(), 'req-'));
  await Promise.all([
    writeFile(join(repertoire, 'Entreprise.csv'), ENTREPRISE_CSV, 'utf8'),
    writeFile(join(repertoire, 'Nom.csv'), NOM_CSV, 'utf8'),
    writeFile(join(repertoire, 'Etablissement.csv'), ETABLISSEMENT_CSV, 'utf8'),
    writeFile(join(repertoire, 'FusionScission.csv'), FUSION_CSV, 'utf8'),
    writeFile(join(repertoire, 'ContinuationTransformation.csv'), CONTINUATION_CSV, 'utf8'),
    writeFile(join(repertoire, 'DomaineValeur.csv'), DOMAINE_CSV, 'utf8'),
  ]);
});

after(async () => {
  await rm(repertoire, { recursive: true, force: true });
});

describe('lecture CSV', () => {
  test('le séparateur est détecté d’après l’en-tête', () => {
    assert.equal(detecterSeparateur('A,B,C'), ',');
    assert.equal(detecterSeparateur('A;B;C;D'), ';');
    assert.equal(detecterSeparateur('A\tB\tC'), '\t');
  });

  test('les guillemets et les séparateurs cités sont respectés', () => {
    assert.deepEqual(decouper('a,"b,c",d', ','), ['a', 'b,c', 'd']);
    assert.deepEqual(decouper('"il dit ""oui""",x', ','), ['il dit "oui"', 'x']);
  });

  test('un saut de ligne à l’intérieur d’un champ ne coupe pas l’enregistrement', () => {
    const resultat = analyserCsv('NEQ,NOM\n1,"Ligne un\nLigne deux"\n2,Simple');
    assert.equal(resultat.lignes.length, 2);
    assert.equal(resultat.lignes[0]!.NOM, 'Ligne un\nLigne deux');
  });

  test('la marque d’ordre d’octets est retirée de la première colonne', () => {
    const resultat = analyserCsv('﻿NEQ,NOM\n1,Test');
    assert.deepEqual(resultat.colonnesTrouvees, ['NEQ', 'NOM']);
  });

  test('les écarts avec la spécification sont rapportés', () => {
    const resultat = analyserCsv('NEQ,COLONNE_INCONNUE\n1,x', FICHIER_ENTREPRISE);
    assert.ok(resultat.colonnesInattendues.includes('COLONNE_INCONNUE'));
    assert.ok(resultat.colonnesManquantes.includes('DAT_CONSTI'));
  });

  test('les formats de date du registre sont normalisés', () => {
    assert.equal(normaliserDate('2023-11-19'), '2023-11-19');
    assert.equal(normaliserDate('2023/11/19'), '2023-11-19');
    assert.equal(normaliserDate('20231119'), '2023-11-19');
    assert.equal(normaliserDate('19-11-2023'), '2023-11-19');
    assert.equal(normaliserDate(''), undefined);
    assert.equal(normaliserDate('sans objet'), undefined);
  });

  test('les indicateurs acceptent les conventions du registre', () => {
    for (const vrai of ['1', 'O', 'OUI', 'oui', 'VRAI', 'Y']) {
      assert.equal(normaliserIndicateur(vrai), true, vrai);
    }
    for (const faux of ['0', 'N', '', 'NON', undefined]) {
      assert.equal(normaliserIndicateur(faux), false, String(faux));
    }
  });
});

describe('chargement d’une archive', () => {
  test('les entités sont construites avec leur nom légal courant', async () => {
    const { graphe } = await chargerArchive(repertoire, { dateExtraction: '2026-08-02' });
    const entite = graphe.entites.find((e) => e.neq === '1170000001');
    assert.ok(entite);
    assert.equal(entite.nomLegal, 'Transport Rivedoux Inc.');
    assert.deepEqual(entite.nomsAnterieurs, ['Camionnage Rivedoux Inc.']);
    assert.equal(entite.formeJuridique, 'societe_par_actions');
    assert.equal(entite.statut, 'immatriculee');
  });

  test('le NEQ sert d’identifiant d’entité', async () => {
    const { graphe } = await chargerArchive(repertoire, { dateExtraction: '2026-08-02' });
    assert.ok(graphe.entites.every((e) => e.id === e.neq));
  });

  test('la radiation d’office est distinguée et datée', async () => {
    const { graphe } = await chargerArchive(repertoire, { dateExtraction: '2026-08-02' });
    const radiee = graphe.entites.find((e) => e.neq === '1170000002');
    assert.equal(radiee?.statut, 'radiee_office');
    assert.equal(radiee?.dateDissolution, '2023-08-30');
  });

  test('les indicateurs de convention unanime sont repris', async () => {
    const { graphe } = await chargerArchive(repertoire, { dateExtraction: '2026-08-02' });
    const entite = graphe.entites.find((e) => e.neq === '1170000001');
    assert.equal(entite?.conventionUnanimeActionnaires, true);
    assert.equal(entite?.retraitPouvoirsConseil, true);
    const autre = graphe.entites.find((e) => e.neq === '1170000002');
    assert.equal(autre?.conventionUnanimeActionnaires, false);
  });

  test('aucune personne ni détention n’est produite', async () => {
    const { graphe } = await chargerArchive(repertoire, { dateExtraction: '2026-08-02' });
    // Le jeu ouvert n'en publie pas : l'absence doit être structurelle, pas
    // accidentelle, et rester vraie si le parseur évolue.
    assert.deepEqual(graphe.personnes, []);
    assert.deepEqual(graphe.detentions, []);
    assert.deepEqual(graphe.administrations, []);
  });

  test('les adresses identiques sont regroupées', async () => {
    const { graphe } = await chargerArchive(repertoire, { dateExtraction: '2026-08-02' });
    const siege = graphe.adresses.find((a) =>
      a.adresseNormalisee.includes('1500 boul René-Lévesque'),
    );
    assert.ok(siege, 'l’adresse partagée doit exister une seule fois');
    const liens = graphe.liensAdresse.filter((l) => l.adresseId === siege.id);
    assert.equal(liens.length, 3, 'les trois sociétés doivent pointer vers la même adresse');
  });

  test('les établissements ajoutent leurs adresses propres', async () => {
    const { graphe } = await chargerArchive(repertoire, { dateExtraction: '2026-08-02' });
    assert.ok(graphe.adresses.some((a) => a.adresseNormalisee.includes('200 rue Notre-Dame')));
    assert.ok(graphe.liensAdresse.some((l) => l.typeLien === 'etablissement'));
  });

  test('les fusions produisent une filiation et un événement', async () => {
    const { graphe } = await chargerArchive(repertoire, { dateExtraction: '2026-08-02' });
    const succession = graphe.successions[0];
    assert.ok(succession);
    assert.equal(succession.entiteSuccesseurId, '1170000004');
    assert.equal(succession.entitePredecesseurId, '1160000099');
    assert.equal(succession.typeOperation, 'fusion');
    assert.equal(succession.libellePredecesseur, 'Bâtiments Chevrotière Inc.');

    const evenement = graphe.evenements.find(
      (e) => e.entiteId === '1170000004' && e.type === 'fusion',
    );
    assert.ok(evenement);
    assert.match(evenement.description, /NEQ 1160000099/);
  });

  test('la filiation est conservée même si le prédécesseur n’a pas de fiche', async () => {
    const { graphe } = await chargerArchive(repertoire, { dateExtraction: '2026-08-02' });
    // 1160000099 n'est pas dans le fichier Entreprise : la relation doit
    // subsister, sans quoi on perdrait la trace de l'entité absorbée.
    assert.equal(graphe.entites.some((e) => e.neq === '1160000099'), false);
    assert.ok(graphe.successions.some((s) => s.entitePredecesseurId === '1160000099'));
  });

  test('les événements sont reconstitués et attribués à l’extrait daté', async () => {
    const { graphe } = await chargerArchive(repertoire, { dateExtraction: '2026-08-02' });
    const types = new Set(graphe.evenements.map((e) => e.type));
    for (const attendu of ['constitution', 'radiation', 'faillite', 'fusion', 'changement_nom']) {
      assert.ok(types.has(attendu as never), `type d’événement manquant : ${attendu}`);
    }
    // Aucun numéro d'avis n'est inventé : la source est l'extrait lui-même.
    assert.ok(graphe.evenements.every((e) => e.avisReqId.includes('2026-08-02')));
  });

  test('la provenance porte la source, la date, la cadence et la licence', async () => {
    const { graphe } = await chargerArchive(repertoire, { dateExtraction: '2026-08-02' });
    assert.equal(graphe.provenance?.source, 'donnees_ouvertes_req');
    assert.equal(graphe.provenance?.dateExtraction, '2026-08-02');
    assert.match(graphe.provenance?.licence ?? '', /non commercial/);
  });

  test('les lignes inexploitables sont écartées avec leur motif', async () => {
    const { rapport } = await chargerArchive(repertoire, { dateExtraction: '2026-08-02' });
    assert.equal(rapport.entites, 4);
    const motifs = rapport.ecartees.map((e) => `${e.fichier}: ${e.motif}`);
    assert.ok(motifs.some((m) => m.includes('Entreprise') && m.includes('NEQ absent')));
    assert.ok(motifs.some((m) => m.includes('Entreprise') && m.includes('date de constitution')));
    assert.ok(motifs.some((m) => m.includes('Etablissement') && m.includes('NEQ inconnu')));
  });

  test('un fichier obligatoire manquant est bloquant', async () => {
    const vide = await mkdtemp(join(tmpdir(), 'req-vide-'));
    try {
      const { anomalies, rapport } = await chargerArchive(vide, { dateExtraction: '2026-08-02' });
      assert.ok(anomalies.some((a) => a.gravite === 'bloquante' && a.fichier === 'Entreprise'));
      assert.equal(rapport.entites, 0);
    } finally {
      await rm(vide, { recursive: true, force: true });
    }
  });

  test('un fichier optionnel manquant produit un avertissement, pas un blocage', async () => {
    const partiel = await mkdtemp(join(tmpdir(), 'req-partiel-'));
    try {
      await writeFile(join(partiel, 'Entreprise.csv'), ENTREPRISE_CSV, 'utf8');
      await writeFile(join(partiel, 'Nom.csv'), NOM_CSV, 'utf8');
      const { anomalies, rapport } = await chargerArchive(partiel, { dateExtraction: '2026-08-02' });
      assert.equal(anomalies.some((a) => a.gravite === 'bloquante'), false);
      assert.equal(rapport.entites, 4);
      assert.equal(rapport.successions, 0);
    } finally {
      await rm(partiel, { recursive: true, force: true });
    }
  });
});

describe('analyse sur données ingérées', () => {
  test('les règles exploitables sans personnes se déclenchent', async () => {
    const { graphe } = await chargerArchive(repertoire, { dateExtraction: '2026-08-02' });
    const flags = executerRegles(creerContexte(new IndexGraphe(graphe)));
    const types = new Set(flags.map((f) => f.typeRegle));

    // Le retrait des pouvoirs du conseil est le seul signal de contrôle réel
    // que le jeu ouvert expose.
    assert.ok(types.has('controle_hors_conseil'));
    const controle = flags.find((f) => f.typeRegle === 'controle_hors_conseil');
    assert.equal(controle?.entiteId, '1170000001');
    assert.match(controle?.explication ?? '', /convention/i);
  });

  test('les règles qui exigent des personnes restent silencieuses', async () => {
    const { graphe } = await chargerArchive(repertoire, { dateExtraction: '2026-08-02' });
    const flags = executerRegles(creerContexte(new IndexGraphe(graphe)));
    const types = new Set(flags.map((f) => f.typeRegle));

    // Sans personne physique, ces règles ne peuvent rien conclure — et surtout
    // ne doivent rien conclure à tort.
    for (const inactive of [
      'cycle_detention',
      'cascade_excessive',
      'administrateur_recurrent',
      'prete_nom_probable',
      'adresse_partagee_massive',
    ]) {
      assert.equal(types.has(inactive as never), false, `${inactive} ne devrait pas se déclencher`);
    }
  });

  test('la reconstitution après radiation est détectée sur des données réelles', async () => {
    const { graphe } = await chargerArchive(repertoire, { dateExtraction: '2026-08-02' });
    const flags = executerRegles(creerContexte(new IndexGraphe(graphe)));
    const reconstitution = flags.find((f) => f.typeRegle === 'dissolution_reconstitution');
    assert.ok(reconstitution, 'Gestion Peyrolles 2023 doit être rapprochée de Gestion Peyrolles');
    assert.equal(reconstitution.entiteId, '1170000003');
  });
});
