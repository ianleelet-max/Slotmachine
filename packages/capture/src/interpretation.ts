import {
  estVide,
  normaliserLibelle,
  type ExtraitPage,
  type SectionExtraite,
  type TableauExtrait,
} from './extrait.js';
import type {
  CaptureFiche,
  ChampCapture,
  NiveauConfiance,
  PersonneCapturee,
  RolePersonne,
} from './capture.js';

/**
 * Interprétation d'une page du registre.
 *
 * Le parseur reconnaît les concepts par leurs **libellés** — « Administrateurs »,
 * « Actionnaires », « Bénéficiaires ultimes » — et non par des sélecteurs CSS.
 * Une refonte visuelle du registre ne casse alors rien tant que le vocabulaire
 * juridique reste le même, ce qui est autrement plus stable qu'une classe CSS.
 *
 * Deux règles gouvernent tout le module :
 *
 * 1. **Rien n'est deviné.** Une valeur qu'on ne sait pas rattacher est laissée
 *    de côté et signalée, jamais interpolée.
 * 2. **Tout ce qui est produit est justifié** par le libellé rencontré et
 *    l'extrait brut correspondant.
 */

const LIBELLES_NEQ = ['numero d entreprise du quebec neq', 'neq', 'numero d entreprise'];
const LIBELLES_NOM = ['nom', 'nom de l entreprise', 'denomination sociale', 'nom legal'];
const LIBELLES_STATUT = ['statut', 'statut d immatriculation', 'etat'];
const LIBELLES_FORME = ['forme juridique', 'regime juridique'];
const LIBELLES_ADRESSE = ['adresse du domicile', 'adresse du siege', 'domicile', 'siege social'];

/** Sections porteuses de personnes, avec le rôle qu'elles impliquent. */
const SECTIONS_PERSONNES: { motifs: string[]; role: RolePersonne }[] = [
  { motifs: ['beneficiaire ultime', 'beneficiaires ultimes'], role: 'beneficiaire_ultime' },
  {
    motifs: ['administrateur', 'administrateurs', 'conseil d administration'],
    role: 'administrateur',
  },
  { motifs: ['dirigeant', 'dirigeants', 'dirigeants non administrateurs'], role: 'dirigeant' },
  {
    motifs: ['actionnaire', 'actionnaires', 'principaux actionnaires', 'trois actionnaires'],
    role: 'actionnaire',
  },
  { motifs: ['fonde de pouvoir', 'fondes de pouvoir'], role: 'fonde_pouvoir' },
];

const ENTETES_NOM = ['nom', 'nom de famille', 'nom et prenom', 'nom du beneficiaire', 'denomination'];
const ENTETES_PRENOM = ['prenom', 'prenoms'];
const ENTETES_FONCTION = ['fonction', 'fonctions', 'titre', 'role'];
const ENTETES_ADRESSE = ['adresse', 'adresse du domicile', 'ville', 'domicile'];
const ENTETES_POURCENTAGE = ['pourcentage', 'participation', 'actions', 'droits de vote', 'part'];
const ENTETES_DEBUT = ['date de debut', 'depuis', 'date d entree en fonction', 'debut'];
const ENTETES_FIN = ['date de fin', 'jusqu a', 'date de fin de charge', 'fin'];

/** Indices qu'une ligne désigne une personne morale et non un individu. */
const MARQUEURS_PERSONNE_MORALE = [
  ' inc',
  ' inc.',
  ' ltee',
  ' ltée',
  ' ltd',
  ' limitee',
  ' limitée',
  ' corp',
  ' senc',
  ' s.e.n.c',
  ' sec',
  ' cie',
  ' compagnie',
  ' societe',
  ' société',
  ' fiducie',
  ' holding',
];

export function interpreter(extrait: ExtraitPage): CaptureFiche {
  const capture: CaptureFiche = {
    personnes: [],
    urlSource: extrait.url,
    captureLe: extrait.extraitLe,
    sectionsNonReconnues: [],
    avertissements: [],
  };

  for (const section of extrait.sections) {
    const titre = normaliserLibelle(section.titre);
    const correspondance = SECTIONS_PERSONNES.find((s) =>
      s.motifs.some((motif) => titre.includes(motif)),
    );

    if (correspondance) {
      const personnes = extrairePersonnes(section, correspondance.role);
      if (personnes.length === 0 && section.tableaux.length > 0) {
        capture.avertissements.push(
          `La section « ${section.titre} » a été reconnue mais aucune ligne n'a pu en être lue.`,
        );
      }
      capture.personnes.push(...personnes);
      continue;
    }

    const identiteLue = extraireIdentite(section, capture);
    if (!identiteLue && section.paires.length === 0 && section.tableaux.length === 0) continue;
    if (!identiteLue) capture.sectionsNonReconnues.push(section.titre);
  }

  if (!capture.neq) {
    capture.avertissements.push(
      'Aucun NEQ n’a été trouvé sur la page : la capture ne peut pas être rattachée avec certitude à une entité.',
    );
  }
  if (capture.personnes.length === 0) {
    capture.avertissements.push(
      'Aucune personne n’a été relevée. Vérifiez que la fiche affichée comporte bien les sections des administrateurs et des actionnaires.',
    );
  }

  return capture;
}

/** Renseigne l'identité de l'entité depuis les paires libellé/valeur. */
function extraireIdentite(section: SectionExtraite, capture: CaptureFiche): boolean {
  let quelqueChoseLu = false;

  for (const paire of section.paires) {
    if (estVide(paire.valeur)) continue;
    const libelle = normaliserLibelle(paire.libelle);
    const champ = (confiance: NiveauConfiance): ChampCapture => ({
      valeur: paire.valeur.trim(),
      libelleSource: paire.libelle.trim(),
      confiance,
      extraitBrut: `${paire.libelle.trim()} : ${paire.valeur.trim()}`,
    });

    if (!capture.neq && LIBELLES_NEQ.some((l) => libelle === l || libelle.includes('neq'))) {
      const chiffres = paire.valeur.replace(/\D/g, '');
      // Un NEQ compte dix chiffres : toute autre longueur est suspecte et le
      // champ est marqué comme tel plutôt que retenu silencieusement.
      capture.neq = {
        valeur: chiffres,
        libelleSource: paire.libelle.trim(),
        confiance: chiffres.length === 10 ? 'certain' : 'incertain',
        extraitBrut: `${paire.libelle.trim()} : ${paire.valeur.trim()}`,
      };
      if (chiffres.length !== 10) {
        capture.avertissements.push(
          `Le NEQ lu (« ${paire.valeur.trim()} ») ne comporte pas dix chiffres.`,
        );
      }
      quelqueChoseLu = true;
      continue;
    }

    if (!capture.nomLegal && LIBELLES_NOM.includes(libelle)) {
      capture.nomLegal = champ('certain');
      quelqueChoseLu = true;
      continue;
    }
    if (!capture.statut && LIBELLES_STATUT.includes(libelle)) {
      capture.statut = champ('certain');
      quelqueChoseLu = true;
      continue;
    }
    if (!capture.formeJuridique && LIBELLES_FORME.includes(libelle)) {
      capture.formeJuridique = champ('certain');
      quelqueChoseLu = true;
      continue;
    }
    if (!capture.adresseSiege && LIBELLES_ADRESSE.some((l) => libelle.includes(l))) {
      capture.adresseSiege = champ('certain');
      quelqueChoseLu = true;
    }
  }

  return quelqueChoseLu;
}

function extrairePersonnes(section: SectionExtraite, role: RolePersonne): PersonneCapturee[] {
  const personnes: PersonneCapturee[] = [];

  for (const tableau of section.tableaux) {
    const colonnes = indexerColonnes(tableau);
    if (colonnes.nom === undefined) continue;

    for (const ligne of tableau.lignes) {
      const personne = lirePersonne(ligne, colonnes, tableau, role, section.titre);
      if (personne) personnes.push(personne);
    }
  }

  return personnes;
}

interface IndexColonnes {
  nom?: number;
  prenom?: number;
  fonction?: number;
  adresse?: number;
  pourcentage?: number;
  debut?: number;
  fin?: number;
}

function indexerColonnes(tableau: TableauExtrait): IndexColonnes {
  const index: IndexColonnes = {};

  tableau.entetes.forEach((entete, position) => {
    const libelle = normaliserLibelle(entete);
    const correspond = (liste: string[]) => liste.some((l) => libelle === l || libelle.includes(l));

    if (index.prenom === undefined && correspond(ENTETES_PRENOM)) index.prenom = position;
    else if (index.nom === undefined && correspond(ENTETES_NOM)) index.nom = position;
    else if (index.fonction === undefined && correspond(ENTETES_FONCTION)) index.fonction = position;
    else if (index.pourcentage === undefined && correspond(ENTETES_POURCENTAGE)) {
      index.pourcentage = position;
    } else if (index.debut === undefined && correspond(ENTETES_DEBUT)) index.debut = position;
    else if (index.fin === undefined && correspond(ENTETES_FIN)) index.fin = position;
    else if (index.adresse === undefined && correspond(ENTETES_ADRESSE)) index.adresse = position;
  });

  // Un tableau à une seule colonne sans en-tête reconnu contient en pratique
  // les noms : on l'accepte, en marquant la lecture comme moins sûre.
  if (index.nom === undefined && tableau.entetes.length <= 1) index.nom = 0;

  return index;
}

function lirePersonne(
  ligne: string[],
  colonnes: IndexColonnes,
  tableau: TableauExtrait,
  role: RolePersonne,
  titreSection: string,
): PersonneCapturee | null {
  const cellule = (position?: number): string | undefined =>
    position === undefined ? undefined : ligne[position];

  const nomBrut = cellule(colonnes.nom);
  const prenomBrut = cellule(colonnes.prenom);
  if (estVide(nomBrut) && estVide(prenomBrut)) return null;

  // Le registre sépare parfois nom et prénom en deux colonnes : on recompose
  // dans l'ordre naturel de lecture, sans jamais inverser à l'aveugle.
  const nomComplet = [prenomBrut, nomBrut]
    .map((v) => (v ?? '').trim())
    .filter((v) => v.length > 0)
    .join(' ');
  if (nomComplet.length === 0) return null;

  const extraitLigne = ligne.filter((c) => c.trim().length > 0).join(' | ');
  const confianceNom: NiveauConfiance =
    tableau.entetes.length === 0 ? 'probable' : 'certain';

  const personne: PersonneCapturee = {
    nomComplet: {
      valeur: nomComplet,
      libelleSource: titreSection,
      confiance: confianceNom,
      extraitBrut: extraitLigne,
    },
    role,
    estPersonneMorale: ressembleAPersonneMorale(nomComplet),
  };

  const fonction = cellule(colonnes.fonction);
  if (!estVide(fonction)) {
    personne.fonction = {
      valeur: fonction!.trim(),
      libelleSource: tableau.entetes[colonnes.fonction!] ?? 'Fonction',
      confiance: 'certain',
      extraitBrut: extraitLigne,
    };
  }

  const adresse = cellule(colonnes.adresse);
  if (!estVide(adresse)) {
    personne.adresse = {
      valeur: adresse!.trim(),
      libelleSource: tableau.entetes[colonnes.adresse!] ?? 'Adresse',
      confiance: 'certain',
      extraitBrut: extraitLigne,
    };
  }

  const pourcentageBrut = cellule(colonnes.pourcentage);
  if (!estVide(pourcentageBrut)) {
    const lu = lirePourcentage(pourcentageBrut!);
    if (lu) {
      personne.pourcentage = {
        valeur: lu.fraction,
        libelleSource: tableau.entetes[colonnes.pourcentage!] ?? 'Participation',
        confiance: lu.confiance,
        extraitBrut: pourcentageBrut!.trim(),
      };
    }
  }

  const debut = cellule(colonnes.debut);
  if (!estVide(debut)) {
    personne.dateDebut = {
      valeur: normaliserDate(debut!) ?? debut!.trim(),
      libelleSource: tableau.entetes[colonnes.debut!] ?? 'Depuis',
      confiance: normaliserDate(debut!) ? 'certain' : 'incertain',
      extraitBrut: debut!.trim(),
    };
  }

  const fin = cellule(colonnes.fin);
  if (!estVide(fin)) {
    personne.dateFin = {
      valeur: normaliserDate(fin!) ?? fin!.trim(),
      libelleSource: tableau.entetes[colonnes.fin!] ?? 'Jusqu’à',
      confiance: normaliserDate(fin!) ? 'certain' : 'incertain',
      extraitBrut: fin!.trim(),
    };
  }

  return personne;
}

/**
 * Lit une participation.
 *
 * Le registre exprime rarement un pourcentage chiffré — la LPLE n'exige que
 * l'identification des trois principaux actionnaires, souvent par tranche
 * (« 50 % ou plus », « 25 % à 50 % »). On retient alors la borne inférieure et
 * on marque la lecture comme approximative : c'est plus honnête que de laisser
 * croire à une valeur exacte dans un calcul de bénéficiaire ultime.
 */
export function lirePourcentage(
  texte: string,
): { fraction: number; confiance: NiveauConfiance } | null {
  const nettoye = texte.replace(',', '.');
  const nombres = [...nettoye.matchAll(/(\d+(?:\.\d+)?)\s*%?/g)].map((m) => Number(m[1]));
  if (nombres.length === 0) return null;

  const valides = nombres.filter((n) => n >= 0 && n <= 100);
  if (valides.length === 0) return null;

  const estIntervalle = valides.length > 1 || /ou plus|et plus|moins de|entre|a\s|à\s/i.test(texte);
  const retenu = Math.min(...valides);

  return {
    fraction: retenu / 100,
    confiance: estIntervalle ? 'probable' : 'certain',
  };
}

function normaliserDate(valeur: string): string | undefined {
  const brute = valeur.trim();
  const iso = brute.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const jourMois = brute.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (jourMois) return `${jourMois[3]}-${jourMois[2]}-${jourMois[1]}`;
  return undefined;
}

function ressembleAPersonneMorale(nom: string): boolean {
  const normalise = ` ${nom.toLowerCase()} `;
  if (MARQUEURS_PERSONNE_MORALE.some((marqueur) => normalise.includes(`${marqueur} `))) return true;
  // Une dénumération numérique (« 9284-1057 Québec Inc. ») est toujours morale.
  return /^\s*\d{4}-\d{4}/.test(nom);
}
