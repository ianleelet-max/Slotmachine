import type { IdentifiantEntite } from './domaine.js';
import type { IndexGraphe } from './index-graphe.js';

export interface CycleDetention {
  /** Entités du cycle, dans l'ordre de la chaîne de détention. */
  entites: IdentifiantEntite[];
  /** Identifiants des relations de détention qui ferment le cycle. */
  relations: string[];
}

/**
 * Détecte les cycles de détention (A détient B détient C détient A) par
 * recherche des composantes fortement connexes (Tarjan) sur le sous-graphe
 * entité→entité.
 *
 * Un cycle rend le calcul du bénéficiaire ultime mathématiquement indéterminé :
 * c'est pour cette raison un signal de sévérité élevée, et non une simple
 * curiosité topologique.
 */
export function detecterCycles(index: IndexGraphe, date?: string): CycleDetention[] {
  let compteur = 0;
  const numero = new Map<IdentifiantEntite, number>();
  const basse = new Map<IdentifiantEntite, number>();
  const surPile = new Set<IdentifiantEntite>();
  const pile: IdentifiantEntite[] = [];
  const cycles: CycleDetention[] = [];

  // Tarjan itératif : les structures corporatives profondes peuvent dépasser
  // la pile d'appels sur un graphe complet.
  for (const entite of index.entites) {
    if (numero.has(entite.id)) continue;
    parcourir(entite.id);
  }

  function parcourir(depart: IdentifiantEntite): void {
    const travaux: { noeud: IdentifiantEntite; voisins: IdentifiantEntite[]; i: number }[] = [
      { noeud: depart, voisins: voisinsDe(depart), i: 0 },
    ];
    numero.set(depart, compteur);
    basse.set(depart, compteur);
    compteur += 1;
    pile.push(depart);
    surPile.add(depart);

    while (travaux.length > 0) {
      const cadre = travaux[travaux.length - 1]!;
      if (cadre.i < cadre.voisins.length) {
        const voisin = cadre.voisins[cadre.i]!;
        cadre.i += 1;
        if (!numero.has(voisin)) {
          numero.set(voisin, compteur);
          basse.set(voisin, compteur);
          compteur += 1;
          pile.push(voisin);
          surPile.add(voisin);
          travaux.push({ noeud: voisin, voisins: voisinsDe(voisin), i: 0 });
        } else if (surPile.has(voisin)) {
          basse.set(cadre.noeud, Math.min(basse.get(cadre.noeud)!, numero.get(voisin)!));
        }
        continue;
      }

      travaux.pop();
      const parent = travaux[travaux.length - 1];
      if (parent) {
        basse.set(parent.noeud, Math.min(basse.get(parent.noeud)!, basse.get(cadre.noeud)!));
      }

      if (basse.get(cadre.noeud) === numero.get(cadre.noeud)) {
        const composante: IdentifiantEntite[] = [];
        for (;;) {
          const n = pile.pop()!;
          surPile.delete(n);
          composante.push(n);
          if (n === cadre.noeud) break;
        }
        // Une composante d'une seule entité n'est un cycle que si elle
        // s'auto-détient (cas rare mais réel : rachat d'actions propres).
        if (composante.length > 1 || sAutoDetient(cadre.noeud)) {
          composante.reverse();
          cycles.push({ entites: composante, relations: relationsDuCycle(composante) });
        }
      }
    }
  }

  function voisinsDe(id: IdentifiantEntite): IdentifiantEntite[] {
    return index
      .participationsDe(id, date)
      .map((d) => d.cibleEntiteId)
      .filter((cible) => index.entite(cible) !== undefined);
  }

  function sAutoDetient(id: IdentifiantEntite): boolean {
    return index.participationsDe(id, date).some((d) => d.cibleEntiteId === id);
  }

  function relationsDuCycle(composante: IdentifiantEntite[]): string[] {
    const membres = new Set(composante);
    const relations: string[] = [];
    for (const membre of composante) {
      for (const d of index.participationsDe(membre, date)) {
        if (membres.has(d.cibleEntiteId)) relations.push(d.id);
      }
    }
    return relations;
  }

  return cycles;
}

/** Les entités impliquées dans au moins un cycle, pour interrogation rapide. */
export function entitesEnCycle(cycles: CycleDetention[]): Set<IdentifiantEntite> {
  const ensemble = new Set<IdentifiantEntite>();
  for (const c of cycles) for (const e of c.entites) ensemble.add(e);
  return ensemble;
}
