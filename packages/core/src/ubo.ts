import type { IdentifiantEntite, IdentifiantPersonne, RelationDetention } from './domaine.js';
import type { IndexGraphe } from './index-graphe.js';

/** Seuil de contrôle de la LPLE (réforme 2023) : 25 % des droits de vote ou de la valeur. */
export const SEUIL_UBO = 0.25;

/** Profondeur au-delà de laquelle on cesse de remonter la chaîne de détention. */
export const PROFONDEUR_MAX_DEFAUT = 12;

export interface MaillonChaine {
  relationId: string;
  deEntiteId?: IdentifiantEntite;
  dePersonneId?: IdentifiantPersonne;
  versEntiteId: IdentifiantEntite;
  pourcentage: number;
  avisReqId: string;
}

export interface CheminUbo {
  personneId: IdentifiantPersonne;
  /** Produit des pourcentages le long de la chaîne (0.65 × 0.40 = 0.26). */
  pourcentageEffectif: number;
  /** Chaîne complète, de la personne vers l'entité racine. C'est la
   *  justification affichée à l'utilisateur : jamais un chiffre sans son chemin. */
  chaine: MaillonChaine[];
  atteintSeuil: boolean;
}

export interface AngleMortControle {
  /** Pourquoi le pourcentage déclaré ne suffit pas à établir le contrôle réel. */
  motif:
    | 'aucun_detenteur_declare'
    | 'detention_declaree_incomplete'
    | 'administrateur_unique_sans_detention'
    | 'chaine_interrompue_par_cycle';
  entiteId: IdentifiantEntite;
  explication: string;
  personneId?: IdentifiantPersonne;
}

export interface ResultatUbo {
  entiteRacineId: IdentifiantEntite;
  /** Chemins atteignant le seuil de 25 %, triés par participation décroissante. */
  beneficiaires: CheminUbo[];
  /** Chemins sous le seuil, conservés pour la transparence du calcul. */
  cheminsSousSeuil: CheminUbo[];
  /** Ce que le calcul ne peut pas établir — exposé plutôt que masqué. */
  anglesMorts: AngleMortControle[];
  /** Vrai si un cycle a interrompu au moins une branche : l'UBO est alors
   *  partiellement indéterminé et le résultat ne doit pas être présenté
   *  comme exhaustif. */
  indetermine: boolean;
}

export interface OptionsUbo {
  seuil?: number;
  profondeurMax?: number;
  /** Date d'observation : permet de rejouer le calcul sur un état historique. */
  date?: string;
}

/**
 * Remonte la chaîne de détention depuis une entité racine jusqu'aux personnes
 * physiques, en multipliant les pourcentages à chaque maillon.
 *
 * Le calcul est délibérément explicatif : chaque bénéficiaire retourné porte
 * la chaîne exacte qui le justifie, et tout ce que la donnée déclarée ne
 * permet pas de trancher ressort en angle mort plutôt que d'être arrondi en
 * une conclusion trop confiante.
 */
export function calculerUbo(
  index: IndexGraphe,
  entiteRacineId: IdentifiantEntite,
  options: OptionsUbo = {},
): ResultatUbo {
  const seuil = options.seuil ?? SEUIL_UBO;
  const profondeurMax = options.profondeurMax ?? PROFONDEUR_MAX_DEFAUT;
  const date = options.date;

  const beneficiaires: CheminUbo[] = [];
  const cheminsSousSeuil: CheminUbo[] = [];
  const anglesMorts: AngleMortControle[] = [];
  let indetermine = false;

  const racine = index.entite(entiteRacineId);
  if (!racine) {
    return { entiteRacineId, beneficiaires, cheminsSousSeuil, anglesMorts, indetermine };
  }

  remonter(entiteRacineId, 1, [], new Set([entiteRacineId]), profondeurMax);

  // Agrège les chemins multiples menant à une même personne : une personne
  // détenant 15 % en direct et 15 % via une filiale contrôle bien 30 %.
  const parPersonne = agregerParPersonne(beneficiaires.concat(cheminsSousSeuil), seuil);

  return {
    entiteRacineId,
    beneficiaires: parPersonne.filter((c) => c.atteintSeuil),
    cheminsSousSeuil: parPersonne.filter((c) => !c.atteintSeuil),
    anglesMorts,
    indetermine,
  };

  function remonter(
    entiteId: IdentifiantEntite,
    produit: number,
    chaine: MaillonChaine[],
    visitees: Set<IdentifiantEntite>,
    profondeurRestante: number,
  ): void {
    if (profondeurRestante <= 0) return;

    const detenteurs = index.detenteursDe(entiteId, date);
    if (detenteurs.length === 0) {
      anglesMorts.push({
        motif: 'aucun_detenteur_declare',
        entiteId,
        explication: `Aucun actionnaire déclaré pour ${nom(entiteId)} — la chaîne de contrôle s'arrête ici sans atteindre de personne physique.`,
      });
      signalerAdministrateurUnique(entiteId);
      return;
    }

    const totalDeclare = detenteurs.reduce((somme, d) => somme + d.pourcentage, 0);
    // Le REQ n'exige la déclaration qu'au-delà de 10 % : un total nettement
    // inférieur à 100 % signale une portion de capital non tracée.
    if (totalDeclare < 0.9) {
      anglesMorts.push({
        motif: 'detention_declaree_incomplete',
        entiteId,
        explication: `Seulement ${(totalDeclare * 100).toFixed(1)} % du capital de ${nom(entiteId)} est rattaché à un détenteur déclaré — le solde n'est pas traçable au registre.`,
      });
    }

    for (const detention of detenteurs) {
      const nouveauProduit = produit * detention.pourcentage;

      if (detention.sourcePersonneId) {
        const chemin: CheminUbo = {
          personneId: detention.sourcePersonneId,
          pourcentageEffectif: nouveauProduit,
          chaine: [...chaine, maillon(detention)],
          atteintSeuil: nouveauProduit >= seuil,
        };
        if (chemin.atteintSeuil) beneficiaires.push(chemin);
        else cheminsSousSeuil.push(chemin);
        continue;
      }

      const sourceId = detention.sourceEntiteId;
      if (!sourceId) continue;

      if (visitees.has(sourceId)) {
        indetermine = true;
        anglesMorts.push({
          motif: 'chaine_interrompue_par_cycle',
          entiteId: sourceId,
          explication: `La chaîne repasse par ${nom(sourceId)} : cycle de détention, le bénéficiaire ultime de cette branche est indéterminable à partir des seuls pourcentages déclarés.`,
        });
        continue;
      }

      if (!index.entite(sourceId)) continue;

      remonter(
        sourceId,
        nouveauProduit,
        [...chaine, maillon(detention)],
        new Set(visitees).add(sourceId),
        profondeurRestante - 1,
      );
    }
  }

  function signalerAdministrateurUnique(entiteId: IdentifiantEntite): void {
    const administrateurs = index.administrateursDe(entiteId, date);
    if (administrateurs.length !== 1) return;
    const seul = administrateurs[0]!;
    anglesMorts.push({
      motif: 'administrateur_unique_sans_detention',
      entiteId,
      personneId: seul.personneId,
      explication: `${nomPersonne(seul.personneId)} est l'unique administrateur de ${nom(entiteId)} sans détention déclarée — contrôle de fait probable, à vérifier auprès d'une convention entre actionnaires.`,
    });
  }

  function maillon(d: RelationDetention): MaillonChaine {
    return {
      relationId: d.id,
      deEntiteId: d.sourceEntiteId,
      dePersonneId: d.sourcePersonneId,
      versEntiteId: d.cibleEntiteId,
      pourcentage: d.pourcentage,
      avisReqId: d.avisReqId,
    };
  }

  function nom(id: IdentifiantEntite): string {
    return index.entite(id)?.nomLegal ?? id;
  }

  function nomPersonne(id: IdentifiantPersonne): string {
    return index.personne(id)?.nomComplet ?? id;
  }
}

function agregerParPersonne(chemins: CheminUbo[], seuil: number): CheminUbo[] {
  const parPersonne = new Map<IdentifiantPersonne, CheminUbo[]>();
  for (const chemin of chemins) {
    const liste = parPersonne.get(chemin.personneId);
    if (liste) liste.push(chemin);
    else parPersonne.set(chemin.personneId, [chemin]);
  }

  const agreges: CheminUbo[] = [];
  for (const [personneId, liste] of parPersonne) {
    const total = liste.reduce((somme, c) => somme + c.pourcentageEffectif, 0);
    // On conserve la chaîne la plus significative comme justification
    // principale ; les autres restent accessibles via les chemins détaillés.
    const principal = liste.reduce((a, b) =>
      b.pourcentageEffectif > a.pourcentageEffectif ? b : a,
    );
    agreges.push({
      personneId,
      pourcentageEffectif: total,
      chaine: principal.chaine,
      atteintSeuil: total >= seuil,
    });
  }

  return agreges.sort((a, b) => b.pourcentageEffectif - a.pourcentageEffectif);
}
