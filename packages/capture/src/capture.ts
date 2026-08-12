/**
 * Résultat d'une capture assistée.
 *
 * Chaque champ porte trois choses en plus de sa valeur : le libellé de la page
 * qui a permis de l'identifier, un niveau de confiance, et l'extrait brut dont
 * il provient. C'est ce qui distingue une donnée capturée d'une donnée
 * affirmée : le professionnel peut toujours remonter au texte qu'il avait sous
 * les yeux, et le rapport peut le citer.
 */

export type NiveauConfiance = 'certain' | 'probable' | 'incertain';

export interface ChampCapture<T = string> {
  valeur: T;
  /** Libellé exact rencontré dans la page. */
  libelleSource: string;
  confiance: NiveauConfiance;
  /** Texte brut d'où la valeur a été tirée, conservé comme pièce. */
  extraitBrut: string;
}

export type RolePersonne =
  | 'administrateur'
  | 'dirigeant'
  | 'actionnaire'
  | 'beneficiaire_ultime'
  | 'fonde_pouvoir'
  | 'role_indetermine';

export interface PersonneCapturee {
  nomComplet: ChampCapture;
  role: RolePersonne;
  fonction?: ChampCapture;
  adresse?: ChampCapture;
  /** Pourcentage de détention, exprimé en fraction (0.65 = 65 %). */
  pourcentage?: ChampCapture<number>;
  dateDebut?: ChampCapture;
  dateFin?: ChampCapture;
  /** Vrai si la ligne désigne une personne morale plutôt qu'un individu. */
  estPersonneMorale: boolean;
}

export interface CaptureFiche {
  neq?: ChampCapture;
  nomLegal?: ChampCapture;
  statut?: ChampCapture;
  formeJuridique?: ChampCapture;
  adresseSiege?: ChampCapture;
  personnes: PersonneCapturee[];

  urlSource: string;
  captureLe: string;

  /**
   * Sections de la page que le parseur n'a pas su rattacher à un concept connu.
   * Elles sont listées plutôt que ignorées : une section non reconnue signale
   * soit une évolution de la page, soit une donnée qu'on laisse échapper.
   */
  sectionsNonReconnues: string[];
  avertissements: string[];
}

/** La capture contient-elle assez pour valoir la peine d'être proposée ? */
export function captureExploitable(capture: CaptureFiche): boolean {
  return Boolean(capture.neq || capture.nomLegal) && capture.personnes.length > 0;
}

/** Champs dont la confiance impose une relecture humaine attentive. */
export function champsIncertains(capture: CaptureFiche): string[] {
  const incertains: string[] = [];

  const verifier = (nom: string, champ?: ChampCapture<unknown>) => {
    if (champ && champ.confiance !== 'certain') incertains.push(nom);
  };

  verifier('NEQ', capture.neq);
  verifier('Nom légal', capture.nomLegal);
  verifier('Statut', capture.statut);

  for (const personne of capture.personnes) {
    if (personne.nomComplet.confiance !== 'certain') {
      incertains.push(`Nom : ${personne.nomComplet.valeur}`);
    }
    if (personne.pourcentage && personne.pourcentage.confiance !== 'certain') {
      incertains.push(`Participation de ${personne.nomComplet.valeur}`);
    }
    if (personne.role === 'role_indetermine') {
      incertains.push(`Rôle de ${personne.nomComplet.valeur}`);
    }
  }

  return incertains;
}
