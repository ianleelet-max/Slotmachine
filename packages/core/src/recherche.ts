import type { Entite, Personne } from './domaine.js';
import { normaliser, normaliserNomLegal, similariteRequete } from './texte.js';

export type TypeResultat = 'entite' | 'personne';

export interface ResultatRecherche {
  type: TypeResultat;
  id: string;
  libelle: string;
  /** 0–1. Un score de 1 correspond à une correspondance exacte ou au NEQ. */
  pertinence: number;
  /** Pourquoi ce résultat sort, à afficher dans la liste (« similaire : Lavalé »). */
  motifCorrespondance: 'neq' | 'nom_exact' | 'nom_partiel' | 'nom_similaire' | 'nom_anterieur';
  neq?: string;
}

export interface OptionsRecherche {
  /** Active le rapprochement par similarité orthographique. */
  similarite?: boolean;
  /**
   * Pertinence minimale retenue en mode similarité. Le défaut est volontairement
   * exigeant : sous 0,85, le bonus de préfixe de Jaro-Winkler fait remonter des
   * faux amis (« Boulangerie » contre « Bouchard ») qui polluent une liste que
   * l'utilisateur parcourt à vue.
   */
  seuilSimilarite?: number;
  limite?: number;
}

/**
 * Recherche multi-critères sur les entités et les personnes.
 *
 * Le classement privilégie l'exactitude (NEQ, nom exact) avant la similarité,
 * pour qu'une recherche précise ne soit jamais noyée par du bruit flou.
 */
export function rechercher(
  requete: string,
  entites: Entite[],
  personnes: Personne[],
  options: OptionsRecherche = {},
): ResultatRecherche[] {
  const similariteActive = options.similarite ?? true;
  const seuil = options.seuilSimilarite ?? 0.86;
  const limite = options.limite ?? 50;

  const brut = requete.trim();
  if (brut.length === 0) return [];

  const normalisee = normaliser(brut);
  const normaliseeLegale = normaliserNomLegal(brut);
  const chiffres = brut.replace(/\D/g, '');
  const resultats: ResultatRecherche[] = [];

  for (const entite of entites) {
    // Le NEQ est un identifiant : une correspondance y est décisive.
    if (chiffres.length >= 4 && entite.neq.includes(chiffres)) {
      resultats.push({
        type: 'entite',
        id: entite.id,
        libelle: entite.nomLegal,
        neq: entite.neq,
        pertinence: entite.neq === chiffres ? 1 : 0.95,
        motifCorrespondance: 'neq',
      });
      continue;
    }

    const nomNormalise = normaliser(entite.nomLegal);
    const nomLegalNormalise = normaliserNomLegal(entite.nomLegal);

    if (nomLegalNormalise === normaliseeLegale) {
      resultats.push(resultatEntite(entite, 1, 'nom_exact'));
      continue;
    }

    if (nomNormalise.includes(normalisee)) {
      // Une correspondance sur un préfixe est plus significative qu'au milieu.
      const pertinence = nomNormalise.startsWith(normalisee) ? 0.9 : 0.82;
      resultats.push(resultatEntite(entite, pertinence, 'nom_partiel'));
      continue;
    }

    const anterieurTrouve = entite.nomsAnterieurs.find((n) =>
      normaliser(n).includes(normalisee),
    );
    if (anterieurTrouve) {
      resultats.push(resultatEntite(entite, 0.8, 'nom_anterieur'));
      continue;
    }

    if (similariteActive) {
      const similarite = similariteRequete(brut, entite.nomLegal);
      if (similarite >= seuil) {
        resultats.push(resultatEntite(entite, similarite * 0.78, 'nom_similaire'));
      }
    }
  }

  for (const personne of personnes) {
    const nomNormalise = normaliser(personne.nomComplet);
    if (nomNormalise.includes(normalisee)) {
      resultats.push({
        type: 'personne',
        id: personne.id,
        libelle: personne.nomComplet,
        pertinence: nomNormalise === normalisee ? 1 : 0.85,
        motifCorrespondance: nomNormalise === normalisee ? 'nom_exact' : 'nom_partiel',
      });
      continue;
    }

    const varianteTrouvee = personne.variantesNom.some((v) =>
      normaliser(v).includes(normalisee),
    );
    if (varianteTrouvee) {
      resultats.push({
        type: 'personne',
        id: personne.id,
        libelle: personne.nomComplet,
        pertinence: 0.8,
        motifCorrespondance: 'nom_anterieur',
      });
      continue;
    }

    if (similariteActive) {
      const similarite = similariteRequete(brut, personne.nomComplet);
      if (similarite >= seuil) {
        resultats.push({
          type: 'personne',
          id: personne.id,
          libelle: personne.nomComplet,
          pertinence: similarite * 0.78,
          motifCorrespondance: 'nom_similaire',
        });
      }
    }
  }

  return resultats.sort((a, b) => b.pertinence - a.pertinence).slice(0, limite);
}

function resultatEntite(
  entite: Entite,
  pertinence: number,
  motif: ResultatRecherche['motifCorrespondance'],
): ResultatRecherche {
  return {
    type: 'entite',
    id: entite.id,
    libelle: entite.nomLegal,
    neq: entite.neq,
    pertinence,
    motifCorrespondance: motif,
  };
}
