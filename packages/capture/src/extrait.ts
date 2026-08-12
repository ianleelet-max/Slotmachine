/**
 * Représentation intermédiaire d'une page consultée.
 *
 * Le script de contenu de l'extension parcourt le DOM et produit cette
 * structure ; l'interprétation se fait ensuite ici, hors du navigateur. Cette
 * séparation a deux vertus : l'interprétation devient testable sans navigateur,
 * et le jour où la mise en page du registre change, seul le parcours du DOM est
 * à revoir — les règles d'interprétation, elles, tiennent aux libellés.
 *
 * Rien dans ce module ne déclenche de requête réseau. La page a déjà été
 * ouverte par le professionnel : on ne fait que lire ce qu'il a sous les yeux.
 */

export interface TableauExtrait {
  entetes: string[];
  lignes: string[][];
}

export interface PaireExtraite {
  libelle: string;
  valeur: string;
}

export interface SectionExtraite {
  /** Titre de la section tel qu'il figure dans la page. */
  titre: string;
  tableaux: TableauExtrait[];
  paires: PaireExtraite[];
  /** Texte brut de la section, conservé comme pièce justificative. */
  texte: string;
}

export interface ExtraitPage {
  url: string;
  titrePage: string;
  sections: SectionExtraite[];
  /** Horodatage de la consultation, produit par le poste de l'utilisateur. */
  extraitLe: string;
}

/** Normalise un libellé pour la comparaison : sans accents, casse ni ponctuation. */
export function normaliserLibelle(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Une valeur vide, un tiret ou une mention d'absence comptent pour rien. */
export function estVide(valeur: string | undefined): boolean {
  const texte = (valeur ?? '').trim();
  if (texte.length === 0) return true;
  return ['-', '—', 's.o.', 's. o.', 'n/a', 'aucun', 'aucune'].includes(texte.toLowerCase());
}
