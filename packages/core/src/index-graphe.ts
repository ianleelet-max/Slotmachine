import type {
  GrapheCorporatif,
  Entite,
  Personne,
  Adresse,
  RelationDetention,
  RelationAdministration,
  LienAdresse,
  RelationSuccession,
  Evenement,
  IdentifiantEntite,
  IdentifiantPersonne,
} from './domaine.js';
import { estActive } from './domaine.js';

/**
 * Index en mémoire du graphe : évite les balayages linéaires répétés dans les
 * traversées de contrôle (UBO, cycles), qui sont le chemin chaud du produit.
 */
export class IndexGraphe {
  readonly graphe: GrapheCorporatif;

  private readonly entiteParId = new Map<IdentifiantEntite, Entite>();
  private readonly entiteParNeq = new Map<string, Entite>();
  private readonly personneParId = new Map<IdentifiantPersonne, Personne>();
  private readonly adresseParId = new Map<string, Adresse>();

  /** Détentions dont la cible est l'entité : « qui détient X ». */
  private readonly detentionsEntrantes = new Map<IdentifiantEntite, RelationDetention[]>();
  /** Détentions dont la source est l'entité : « que détient X ». */
  private readonly detentionsSortantes = new Map<IdentifiantEntite, RelationDetention[]>();
  private readonly administrationsParEntite = new Map<IdentifiantEntite, RelationAdministration[]>();
  private readonly administrationsParPersonne = new Map<IdentifiantPersonne, RelationAdministration[]>();
  private readonly liensParAdresse = new Map<string, LienAdresse[]>();
  private readonly liensParEntite = new Map<IdentifiantEntite, LienAdresse[]>();
  private readonly evenementsParEntite = new Map<IdentifiantEntite, Evenement[]>();
  private readonly successionsEntrantes = new Map<IdentifiantEntite, RelationSuccession[]>();
  private readonly successionsSortantes = new Map<IdentifiantEntite, RelationSuccession[]>();

  constructor(graphe: GrapheCorporatif) {
    this.graphe = graphe;

    for (const e of graphe.entites) {
      this.entiteParId.set(e.id, e);
      this.entiteParNeq.set(e.neq, e);
    }
    for (const p of graphe.personnes) this.personneParId.set(p.id, p);
    for (const a of graphe.adresses) this.adresseParId.set(a.id, a);

    for (const d of graphe.detentions) {
      pousser(this.detentionsEntrantes, d.cibleEntiteId, d);
      if (d.sourceEntiteId) pousser(this.detentionsSortantes, d.sourceEntiteId, d);
    }
    for (const a of graphe.administrations) {
      pousser(this.administrationsParEntite, a.entiteId, a);
      pousser(this.administrationsParPersonne, a.personneId, a);
    }
    for (const l of graphe.liensAdresse) {
      pousser(this.liensParAdresse, l.adresseId, l);
      if (l.entiteId) pousser(this.liensParEntite, l.entiteId, l);
    }
    for (const succession of graphe.successions ?? []) {
      pousser(this.successionsEntrantes, succession.entiteSuccesseurId, succession);
      pousser(this.successionsSortantes, succession.entitePredecesseurId, succession);
    }
    for (const ev of graphe.evenements) pousser(this.evenementsParEntite, ev.entiteId, ev);
    for (const liste of this.evenementsParEntite.values()) {
      liste.sort((a, b) => a.dateEffective.localeCompare(b.dateEffective));
    }
  }

  entite(id: IdentifiantEntite): Entite | undefined {
    return this.entiteParId.get(id);
  }

  entiteParNumero(neq: string): Entite | undefined {
    return this.entiteParNeq.get(neq);
  }

  personne(id: IdentifiantPersonne): Personne | undefined {
    return this.personneParId.get(id);
  }

  adresse(id: string): Adresse | undefined {
    return this.adresseParId.get(id);
  }

  get entites(): Entite[] {
    return this.graphe.entites;
  }

  /** Détenteurs de l'entité, actifs à la date donnée (ou actuellement). */
  detenteursDe(entiteId: IdentifiantEntite, date?: string): RelationDetention[] {
    return (this.detentionsEntrantes.get(entiteId) ?? []).filter((d) => estActive(d, date));
  }

  /** Participations détenues par l'entité. */
  participationsDe(entiteId: IdentifiantEntite, date?: string): RelationDetention[] {
    return (this.detentionsSortantes.get(entiteId) ?? []).filter((d) => estActive(d, date));
  }

  administrateursDe(entiteId: IdentifiantEntite, date?: string): RelationAdministration[] {
    return (this.administrationsParEntite.get(entiteId) ?? []).filter((a) => estActive(a, date));
  }

  /** Tous les mandats d'une personne, actifs et passés (usage : profil, récurrence). */
  mandatsDe(personneId: IdentifiantPersonne): RelationAdministration[] {
    return this.administrationsParPersonne.get(personneId) ?? [];
  }

  /**
   * Tous les mandats exercés dans une entité, y compris échus. Un lien
   * structurel entre deux sociétés ne disparaît pas parce que
   * l'administrateur commun a depuis quitté son poste.
   */
  historiqueAdministrateursDe(entiteId: IdentifiantEntite): RelationAdministration[] {
    return this.administrationsParEntite.get(entiteId) ?? [];
  }

  /** Entités dont celle-ci est issue (composantes d'une fusion, entité continuée). */
  predecesseursDe(entiteId: IdentifiantEntite): RelationSuccession[] {
    return this.successionsEntrantes.get(entiteId) ?? [];
  }

  /** Entités issues de celle-ci (résultat d'une fusion, entités nées d'une scission). */
  successeursDe(entiteId: IdentifiantEntite): RelationSuccession[] {
    return this.successionsSortantes.get(entiteId) ?? [];
  }

  liensDeAdresse(adresseId: string): LienAdresse[] {
    return this.liensParAdresse.get(adresseId) ?? [];
  }

  adressesDe(entiteId: IdentifiantEntite): LienAdresse[] {
    return this.liensParEntite.get(entiteId) ?? [];
  }

  /** Événements d'une entité, triés chronologiquement. */
  evenementsDe(entiteId: IdentifiantEntite): Evenement[] {
    return this.evenementsParEntite.get(entiteId) ?? [];
  }
}

function pousser<C, V>(carte: Map<C, V[]>, cle: C, valeur: V): void {
  const existant = carte.get(cle);
  if (existant) existant.push(valeur);
  else carte.set(cle, [valeur]);
}
