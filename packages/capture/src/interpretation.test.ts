import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { interpreter, lirePourcentage } from './interpretation.js';
import { captureExploitable, champsIncertains } from './capture.js';
import type { ExtraitPage } from './extrait.js';

/**
 * Les extraits ci-dessous imitent la structure d'une fiche du registre telle
 * qu'un script de contenu la produirait. La mise en page réelle n'a pas pu être
 * observée depuis cet environnement : les tests visent donc la **tolérance** du
 * parseur — libellés variables, colonnes dans un ordre différent, en-têtes
 * absents — plutôt que la conformité à une page précise.
 */

const FICHE_TYPE: ExtraitPage = {
  url: 'https://www.registreentreprises.gouv.qc.ca/…/fiche?neq=1171234567',
  titrePage: 'État de renseignements d’une personne morale au registre des entreprises',
  extraitLe: '2026-08-12T15:00:00.000Z',
  sections: [
    {
      titre: 'Identification de l’entreprise',
      paires: [
        { libelle: 'Numéro d’entreprise du Québec (NEQ)', valeur: '1171234567' },
        { libelle: 'Nom', valeur: '9284-1057 Québec Inc.' },
        { libelle: 'Statut', valeur: 'Immatriculée' },
        { libelle: 'Forme juridique', valeur: 'Société par actions' },
        { libelle: 'Adresse du domicile', valeur: '1500 boul. René-Lévesque O., Montréal (Québec)' },
      ],
      tableaux: [],
      texte: 'Identification de l’entreprise',
    },
    {
      titre: 'Liste des administrateurs',
      paires: [],
      tableaux: [
        {
          entetes: ['Nom de famille', 'Prénom', 'Fonctions actuelles', 'Date de début', 'Date de fin'],
          lignes: [
            ['Fortin', 'Marc-André', 'Président', '2025-11-28', ''],
            ['Girard', 'Nathalie', 'Secrétaire', '2019-03-14', ''],
            ['Tremblay', 'Louis', 'Administrateur', '2019-03-14', '2025-11-28'],
          ],
        },
      ],
      texte: 'Liste des administrateurs',
    },
    {
      titre: 'Trois principaux actionnaires',
      paires: [],
      tableaux: [
        {
          entetes: ['Nom', 'Adresse', 'Pourcentage de droits de vote'],
          lignes: [
            ['Gestion Lavallée-Bouchard Inc.', 'Montréal (Québec)', '50 % ou plus'],
            ['Rousseau, Chantal', 'Québec (Québec)', '25 %'],
          ],
        },
      ],
      texte: 'Trois principaux actionnaires',
    },
    {
      titre: 'Bénéficiaires ultimes',
      paires: [],
      tableaux: [
        {
          entetes: ['Nom', 'Prénom', 'Adresse', 'Date de début'],
          lignes: [['Bouchard', 'Denis', 'Laval (Québec)', '2016-09-08']],
        },
      ],
      texte: 'Bénéficiaires ultimes',
    },
    {
      titre: 'Établissements au Québec',
      paires: [],
      tableaux: [{ entetes: ['Numéro', 'Adresse'], lignes: [['1', 'Repentigny (Québec)']] }],
      texte: 'Établissements au Québec',
    },
  ],
};

describe('lecture d’une participation', () => {
  test('un pourcentage exact est lu tel quel', () => {
    assert.deepEqual(lirePourcentage('65 %'), { fraction: 0.65, confiance: 'certain' });
    assert.deepEqual(lirePourcentage('7,5 %'), { fraction: 0.075, confiance: 'certain' });
  });

  test('une tranche retient sa borne inférieure et reste approximative', () => {
    // Le registre n'exige pas de chiffre exact : annoncer 50 % comme certain
    // fausserait un calcul de bénéficiaire ultime.
    assert.deepEqual(lirePourcentage('50 % ou plus'), { fraction: 0.5, confiance: 'probable' });
    assert.deepEqual(lirePourcentage('25 % à 50 %'), { fraction: 0.25, confiance: 'probable' });
    assert.deepEqual(lirePourcentage('moins de 10 %'), { fraction: 0.1, confiance: 'probable' });
  });

  test('un texte sans nombre exploitable ne produit rien', () => {
    assert.equal(lirePourcentage('non déclaré'), null);
    assert.equal(lirePourcentage(''), null);
  });

  test('une valeur hors bornes est rejetée plutôt que tronquée', () => {
    assert.equal(lirePourcentage('320 %'), null);
  });
});

describe('interprétation d’une fiche', () => {
  const capture = interpreter(FICHE_TYPE);

  test('l’identité de l’entité est relevée avec ses libellés d’origine', () => {
    assert.equal(capture.neq?.valeur, '1171234567');
    assert.equal(capture.neq?.confiance, 'certain');
    assert.match(capture.neq?.libelleSource ?? '', /NEQ/);
    assert.equal(capture.nomLegal?.valeur, '9284-1057 Québec Inc.');
    assert.equal(capture.statut?.valeur, 'Immatriculée');
    assert.match(capture.adresseSiege?.valeur ?? '', /René-Lévesque/);
  });

  test('chaque champ conserve l’extrait brut dont il provient', () => {
    assert.match(capture.neq?.extraitBrut ?? '', /1171234567/);
    for (const personne of capture.personnes) {
      assert.ok(personne.nomComplet.extraitBrut.length > 0);
    }
  });

  test('les administrateurs sont lus avec leur fonction et leurs dates', () => {
    const administrateurs = capture.personnes.filter((p) => p.role === 'administrateur');
    assert.equal(administrateurs.length, 3);

    const fortin = administrateurs.find((p) => p.nomComplet.valeur === 'Marc-André Fortin');
    assert.ok(fortin, 'le prénom et le nom doivent être recomposés dans l’ordre de lecture');
    assert.equal(fortin.fonction?.valeur, 'Président');
    assert.equal(fortin.dateDebut?.valeur, '2025-11-28');
    assert.equal(fortin.dateFin, undefined);

    const tremblay = administrateurs.find((p) => p.nomComplet.valeur === 'Louis Tremblay');
    assert.equal(tremblay?.dateFin?.valeur, '2025-11-28');
  });

  test('les actionnaires portent leur participation avec le bon niveau de confiance', () => {
    const actionnaires = capture.personnes.filter((p) => p.role === 'actionnaire');
    assert.equal(actionnaires.length, 2);

    const gestion = actionnaires.find((p) => p.nomComplet.valeur.startsWith('Gestion'));
    assert.equal(gestion?.pourcentage?.valeur, 0.5);
    assert.equal(gestion?.pourcentage?.confiance, 'probable');
    assert.equal(gestion?.estPersonneMorale, true);

    const rousseau = actionnaires.find((p) => p.nomComplet.valeur.includes('Rousseau'));
    assert.equal(rousseau?.pourcentage?.valeur, 0.25);
    assert.equal(rousseau?.pourcentage?.confiance, 'certain');
    assert.equal(rousseau?.estPersonneMorale, false);
  });

  test('les bénéficiaires ultimes sont distingués des administrateurs', () => {
    const beneficiaires = capture.personnes.filter((p) => p.role === 'beneficiaire_ultime');
    assert.equal(beneficiaires.length, 1);
    assert.equal(beneficiaires[0]!.nomComplet.valeur, 'Denis Bouchard');
  });

  test('les sections non rattachées à un concept connu sont signalées', () => {
    // « Établissements » n'est pas une section de personnes : plutôt que de
    // l'ignorer en silence, on la déclare non reconnue.
    assert.ok(capture.sectionsNonReconnues.includes('Établissements au Québec'));
  });

  test('la capture est exploitable et sait dire ce qui reste à relire', () => {
    assert.equal(captureExploitable(capture), true);
    const incertains = champsIncertains(capture);
    assert.ok(incertains.some((c) => c.includes('Gestion Lavallée-Bouchard')));
  });
});

describe('tolérance aux variantes de mise en page', () => {
  test('les colonnes sont reconnues quel que soit leur ordre', () => {
    const extrait: ExtraitPage = {
      ...FICHE_TYPE,
      sections: [
        {
          titre: 'Administrateurs',
          paires: [],
          tableaux: [
            {
              entetes: ['Date de début', 'Fonction', 'Prénom', 'Nom'],
              lignes: [['2020-01-01', 'Trésorier', 'Julie', 'Nadeau']],
            },
          ],
          texte: '',
        },
      ],
    };
    const capture = interpreter(extrait);
    assert.equal(capture.personnes[0]?.nomComplet.valeur, 'Julie Nadeau');
    assert.equal(capture.personnes[0]?.fonction?.valeur, 'Trésorier');
  });

  test('un nom en une seule colonne est accepté', () => {
    const extrait: ExtraitPage = {
      ...FICHE_TYPE,
      sections: [
        {
          titre: 'Liste des administrateurs',
          paires: [],
          tableaux: [{ entetes: ['Nom'], lignes: [['Fortin, Marc-André']] }],
          texte: '',
        },
      ],
    };
    const capture = interpreter(extrait);
    assert.equal(capture.personnes[0]?.nomComplet.valeur, 'Fortin, Marc-André');
  });

  test('un tableau sans en-tête est lu, mais avec une confiance moindre', () => {
    const extrait: ExtraitPage = {
      ...FICHE_TYPE,
      sections: [
        {
          titre: 'Administrateurs',
          paires: [],
          tableaux: [{ entetes: [], lignes: [['Sylvain Cloutier']] }],
          texte: '',
        },
      ],
    };
    const capture = interpreter(extrait);
    assert.equal(capture.personnes[0]?.nomComplet.confiance, 'probable');
    assert.ok(champsIncertains(capture).length > 0);
  });

  test('les libellés accentués ou abrégés sont reconnus', () => {
    const extrait: ExtraitPage = {
      ...FICHE_TYPE,
      sections: [
        {
          titre: 'IDENTIFICATION',
          paires: [
            { libelle: 'NEQ', valeur: '1163098221' },
            { libelle: 'Dénomination sociale', valeur: 'Gestion Lavallée-Bouchard Inc.' },
          ],
          tableaux: [],
          texte: '',
        },
      ],
    };
    const capture = interpreter(extrait);
    assert.equal(capture.neq?.valeur, '1163098221');
    assert.equal(capture.nomLegal?.valeur, 'Gestion Lavallée-Bouchard Inc.');
  });

  test('les cellules vides ou marquées « s.o. » ne créent pas de champ', () => {
    const extrait: ExtraitPage = {
      ...FICHE_TYPE,
      sections: [
        {
          titre: 'Administrateurs',
          paires: [],
          tableaux: [
            {
              entetes: ['Nom', 'Prénom', 'Fonction', 'Date de fin'],
              lignes: [['Nadeau', 'Julie', 's.o.', '—']],
            },
          ],
          texte: '',
        },
      ],
    };
    const capture = interpreter(extrait);
    assert.equal(capture.personnes[0]?.fonction, undefined);
    assert.equal(capture.personnes[0]?.dateFin, undefined);
  });
});

describe('refus de deviner', () => {
  test('un NEQ mal formé est retenu mais marqué incertain et signalé', () => {
    const extrait: ExtraitPage = {
      ...FICHE_TYPE,
      sections: [
        {
          titre: 'Identification',
          paires: [{ libelle: 'NEQ', valeur: '11712345' }],
          tableaux: [],
          texte: '',
        },
      ],
    };
    const capture = interpreter(extrait);
    assert.equal(capture.neq?.confiance, 'incertain');
    assert.ok(capture.avertissements.some((a) => a.includes('dix chiffres')));
  });

  test('une page sans NEQ ni personne est déclarée inexploitable', () => {
    const capture = interpreter({
      url: 'https://exemple.test/page',
      titrePage: 'Page quelconque',
      extraitLe: '2026-08-12T15:00:00.000Z',
      sections: [],
    });
    assert.equal(captureExploitable(capture), false);
    assert.equal(capture.avertissements.length, 2);
  });

  test('une section reconnue mais illisible produit un avertissement', () => {
    const extrait: ExtraitPage = {
      ...FICHE_TYPE,
      sections: [
        {
          titre: 'Actionnaires',
          paires: [],
          // Aucune colonne de nom : le parseur ne doit rien inventer.
          tableaux: [{ entetes: ['Rang', 'Catégorie'], lignes: [['1', 'Ordinaire']] }],
          texte: '',
        },
      ],
    };
    const capture = interpreter(extrait);
    assert.equal(capture.personnes.length, 0);
    assert.ok(capture.avertissements.some((a) => a.includes('Actionnaires')));
  });
});
