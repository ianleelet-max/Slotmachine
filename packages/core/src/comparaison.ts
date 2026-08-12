import type { IdentifiantEntite } from './domaine.js';
import { estActive } from './domaine.js';
import type { IndexGraphe } from './index-graphe.js';

/**
 * Comparaison de l'état d'une structure entre deux dates.
 *
 * C'est l'opération qui répond à la question que pose tout syndic : « qu'est-ce
 * qui a changé entre le moment où l'entreprise était saine et celui où elle a
 * fait faillite ? ». Le calcul se fait entièrement à partir des périodes de
 * validité des relations — aucune donnée n'est recalculée ni réinterprétée,
 * on observe le même graphe à deux instants.
 */

export type NatureChangement = 'apparu' | 'disparu' | 'modifie';

export interface ChangementDetention {
  nature: NatureChangement;
  relationId: string;
  detenteurLibelle: string;
  cibleLibelle: string;
  cibleEntiteId: IdentifiantEntite;
  pourcentageAvant?: number;
  pourcentageApres?: number;
  avisReqId: string;
}

export interface ChangementAdministration {
  nature: NatureChangement;
  relationId: string;
  personneLibelle: string;
  entiteLibelle: string;
  entiteId: IdentifiantEntite;
  titre: string;
  avisReqId: string;
}

export interface ChangementEntite {
  nature: NatureChangement;
  entiteId: IdentifiantEntite;
  libelle: string;
  detail: string;
}

export interface Comparaison {
  dateAvant: string;
  dateApres: string;
  entitesCouvertes: IdentifiantEntite[];
  detentions: ChangementDetention[];
  administrations: ChangementAdministration[];
  entites: ChangementEntite[];
  /** Vrai si rien n'a bougé : l'absence de changement est une conclusion. */
  aucunChangement: boolean;
}

export interface OptionsComparaison {
  /** Périmètre d'observation. Par défaut, tout le graphe. */
  entites?: IdentifiantEntite[];
}

export function comparerStructures(
  index: IndexGraphe,
  dateAvant: string,
  dateApres: string,
  options: OptionsComparaison = {},
): Comparaison {
  const perimetre = options.entites
    ? new Set(options.entites)
    : new Set(index.entites.map((e) => e.id));

  const detentions: ChangementDetention[] = [];
  for (const relation of index.graphe.detentions) {
    if (!perimetre.has(relation.cibleEntiteId)) continue;

    const avant = estActive(relation, dateAvant);
    const apres = estActive(relation, dateApres);
    if (!avant && !apres) continue;

    const detenteurLibelle = relation.sourcePersonneId
      ? (index.personne(relation.sourcePersonneId)?.nomComplet ?? relation.sourcePersonneId)
      : (index.entite(relation.sourceEntiteId!)?.nomLegal ?? relation.sourceEntiteId!);
    const cibleLibelle = index.entite(relation.cibleEntiteId)?.nomLegal ?? relation.cibleEntiteId;

    if (avant && !apres) {
      detentions.push({
        nature: 'disparu',
        relationId: relation.id,
        detenteurLibelle,
        cibleLibelle,
        cibleEntiteId: relation.cibleEntiteId,
        pourcentageAvant: relation.pourcentage,
        avisReqId: relation.avisReqId,
      });
    } else if (!avant && apres) {
      detentions.push({
        nature: 'apparu',
        relationId: relation.id,
        detenteurLibelle,
        cibleLibelle,
        cibleEntiteId: relation.cibleEntiteId,
        pourcentageApres: relation.pourcentage,
        avisReqId: relation.avisReqId,
      });
    }
    // Une relation active aux deux dates n'a pas changé : le registre versionne
    // une modification de pourcentage par une nouvelle relation, pas par une
    // mutation en place, donc il n'y a pas de cas « modifié » ici.
  }

  const administrations: ChangementAdministration[] = [];
  for (const relation of index.graphe.administrations) {
    if (!perimetre.has(relation.entiteId)) continue;

    const avant = estActive(relation, dateAvant);
    const apres = estActive(relation, dateApres);
    if (avant === apres) continue;

    administrations.push({
      nature: avant ? 'disparu' : 'apparu',
      relationId: relation.id,
      personneLibelle: index.personne(relation.personneId)?.nomComplet ?? relation.personneId,
      entiteLibelle: index.entite(relation.entiteId)?.nomLegal ?? relation.entiteId,
      entiteId: relation.entiteId,
      titre: relation.titre,
      avisReqId: relation.avisReqId,
    });
  }

  const entites: ChangementEntite[] = [];
  for (const entite of index.entites) {
    if (!perimetre.has(entite.id)) continue;

    const existeAvant = entite.dateConstitution <= dateAvant;
    const existeApres = entite.dateConstitution <= dateApres;

    if (!existeAvant && existeApres) {
      entites.push({
        nature: 'apparu',
        entiteId: entite.id,
        libelle: entite.nomLegal,
        detail: `Constituée le ${entite.dateConstitution}`,
      });
    }

    const dissoute = entite.dateDissolution;
    if (dissoute && dissoute > dateAvant && dissoute <= dateApres) {
      entites.push({
        nature: 'disparu',
        entiteId: entite.id,
        libelle: entite.nomLegal,
        detail: `Dissoute ou radiée le ${dissoute}`,
      });
    }

    // Les changements d'identité déclarée relèvent des événements : ils ne se
    // lisent pas dans l'état courant de la fiche, seulement dans son historique.
    for (const evenement of index.evenementsDe(entite.id)) {
      if (evenement.dateEffective <= dateAvant || evenement.dateEffective > dateApres) continue;
      if (evenement.type !== 'changement_nom' && evenement.type !== 'changement_siege') continue;
      entites.push({
        nature: 'modifie',
        entiteId: entite.id,
        libelle: entite.nomLegal,
        detail: `${evenement.description} (${evenement.dateEffective}, avis ${evenement.avisReqId})`,
      });
    }
  }

  return {
    dateAvant,
    dateApres,
    entitesCouvertes: [...perimetre],
    detentions,
    administrations,
    entites,
    aucunChangement:
      detentions.length === 0 && administrations.length === 0 && entites.length === 0,
  };
}
