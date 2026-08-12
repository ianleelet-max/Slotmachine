import type { IdentifiantEntite } from './domaine.js';
import type { RedFlag, Severite, TypeRegle, ContexteAnalyse } from './regles.js';
import { executerRegles } from './regles.js';

/**
 * Poids par règle (0–100 avant pondération de sévérité). Ils traduisent la
 * valeur probante relative de chaque signal, pas sa fréquence : un cycle de
 * détention est rare mais décisif, une adresse partagée est fréquente et
 * seulement indicative.
 */
export const POIDS_REGLES: Record<TypeRegle, number> = {
  cycle_detention: 30,
  dissolution_reconstitution: 26,
  transfert_avant_evenement_critique: 24,
  cascade_excessive: 18,
  prete_nom_probable: 16,
  administrateur_recurrent: 14,
  changement_avant_evenement_critique: 12,
  controle_hors_conseil: 12,
  adresse_partagee_massive: 10,
};

export const FACTEUR_SEVERITE: Record<Severite, number> = {
  info: 0.25,
  faible: 0.5,
  moyen: 0.75,
  eleve: 1,
};

/** Bonus par règle distincte au-delà de la deuxième : un faisceau d'indices
 *  concordants vaut davantage que la somme de signaux isolés. */
export const BONUS_FAISCEAU = 8;

export const SCORE_MAX = 100;

/**
 * Seuils de niveau. Ce sont des paramètres de calibration, destinés à être
 * ajustés par cabinet à partir des retours « confirmé / faux positif ».
 *
 * Le seuil « élevé » est fixé de sorte que deux signaux lourds et indépendants
 * suffisent à faire remonter une entité en tête de triage : attendre un
 * troisième signal reviendrait à ne montrer un montage qu'une fois qu'il est
 * devenu évident, ce qui vide l'outil de son intérêt.
 */
export const SEUIL_NIVEAU_ELEVE = 50;
export const SEUIL_NIVEAU_MOYEN = 25;

export interface ContributionRegle {
  typeRegle: TypeRegle;
  severiteMax: Severite;
  occurrences: number;
  points: number;
}

export interface ScoreRisque {
  entiteId: IdentifiantEntite;
  /** Score borné à 100. */
  score: number;
  niveau: 'faible' | 'moyen' | 'eleve';
  /** Décomposition complète : aucun score n'est affiché sans son « pourquoi ». */
  contributions: ContributionRegle[];
  bonusFaisceau: number;
  flags: RedFlag[];
}

/** Calcule le score d'une entité à partir des flags qui la concernent. */
export function calculerScore(entiteId: IdentifiantEntite, flags: RedFlag[]): ScoreRisque {
  const pertinents = flags.filter((f) => f.entiteId === entiteId);

  const parRegle = new Map<TypeRegle, RedFlag[]>();
  for (const flag of pertinents) {
    const liste = parRegle.get(flag.typeRegle);
    if (liste) liste.push(flag);
    else parRegle.set(flag.typeRegle, [flag]);
  }

  const contributions: ContributionRegle[] = [];
  let total = 0;

  for (const [typeRegle, groupe] of parRegle) {
    const severiteMax = groupe
      .map((f) => f.severite)
      .reduce((a, b) => (FACTEUR_SEVERITE[b] > FACTEUR_SEVERITE[a] ? b : a));

    // Une règle ne compte qu'une fois à sa sévérité maximale, majorée d'un
    // dixième par occurrence supplémentaire : dix adresses partagées ne
    // valent pas dix fois le signal d'une seule.
    const base = POIDS_REGLES[typeRegle] * FACTEUR_SEVERITE[severiteMax];
    const points = base * (1 + Math.min(groupe.length - 1, 5) * 0.1);

    contributions.push({
      typeRegle,
      severiteMax,
      occurrences: groupe.length,
      points: arrondir(points),
    });
    total += points;
  }

  const reglesDistinctes = parRegle.size;
  const bonusFaisceau = reglesDistinctes >= 3 ? (reglesDistinctes - 2) * BONUS_FAISCEAU : 0;
  total += bonusFaisceau;

  const score = Math.min(SCORE_MAX, Math.round(total));
  contributions.sort((a, b) => b.points - a.points);

  return {
    entiteId,
    score,
    niveau: score >= SEUIL_NIVEAU_ELEVE ? 'eleve' : score >= SEUIL_NIVEAU_MOYEN ? 'moyen' : 'faible',
    contributions,
    bonusFaisceau,
    flags: pertinents,
  };
}

export interface ResultatAnalyse {
  flags: RedFlag[];
  scores: Map<IdentifiantEntite, ScoreRisque>;
}

/** Exécute la bibliothèque de règles puis score chaque entité du graphe. */
export function analyser(contexte: ContexteAnalyse): ResultatAnalyse {
  const flags = executerRegles(contexte);
  const scores = new Map<IdentifiantEntite, ScoreRisque>();
  for (const entite of contexte.index.entites) {
    scores.set(entite.id, calculerScore(entite.id, flags));
  }
  return { flags, scores };
}

function arrondir(n: number): number {
  return Math.round(n * 10) / 10;
}
