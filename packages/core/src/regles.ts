import type { Entite, IdentifiantEntite, IdentifiantPersonne, TypeEvenement } from './domaine.js';
import { ecartJours, estActive } from './domaine.js';
import type { IndexGraphe } from './index-graphe.js';
import { detecterCycles, type CycleDetention } from './cycles.js';
import { similariteNomLegal } from './texte.js';

export type Severite = 'info' | 'faible' | 'moyen' | 'eleve';

export type TypeRegle =
  | 'cycle_detention'
  | 'cascade_excessive'
  | 'administrateur_recurrent'
  | 'prete_nom_probable'
  | 'transfert_avant_evenement_critique'
  | 'dissolution_reconstitution'
  | 'adresse_partagee_massive'
  | 'changement_avant_evenement_critique';

export interface RedFlag {
  typeRegle: TypeRegle;
  entiteId: IdentifiantEntite;
  severite: Severite;
  /** Formulée pour être lue telle quelle dans un rapport d'audit. */
  explication: string;
  /** Tout ce qui a fait déclencher la règle : l'utilisateur doit pouvoir
   *  remonter du signal aux faits sans nous faire confiance sur parole. */
  elementsDeclencheurs: {
    entites?: IdentifiantEntite[];
    personnes?: IdentifiantPersonne[];
    relations?: string[];
    evenements?: string[];
    adresses?: string[];
    avisReq?: string[];
  };
}

/** Événements qui marquent un point de bascule dans la vie d'une entité. */
const EVENEMENTS_CRITIQUES: TypeEvenement[] = [
  'dissolution',
  'radiation',
  'faillite',
  'proposition_concordataire',
];

export interface ConfigurationRegles {
  /** Profondeur de chaîne entité→entité à partir de laquelle une cascade est signalée. */
  profondeurCascade: number;
  /** Nombre d'entités défaillantes au-delà duquel un administrateur est signalé. */
  seuilEntitesDefaillantes: number;
  /** Nombre de mandats simultanés sans lien apparent évoquant un prête-nom. */
  seuilMandatsSansLien: number;
  /** Durée (jours) sous laquelle un mandat est considéré comme court. */
  dureeMandatCourtJours: number;
  /** Fenêtre (jours) entre un transfert et un événement critique subséquent. */
  fenetreTransfertJours: number;
  /** Fenêtre (jours) entre une dissolution et une reconstitution apparentée. */
  fenetreReconstitutionJours: number;
  /** Fenêtre (jours) entre un changement de nom/siège et un événement critique. */
  fenetreChangementJours: number;
  /** Similarité de dénomination à partir de laquelle deux noms sont apparentés. */
  seuilSimilariteNom: number;
  /** Nombre d'écarts-types au-dessus de la moyenne pour qu'une adresse ressorte. */
  ecartsTypesAdresse: number;
  /** Plancher absolu d'entités à une adresse, sous lequel on ne signale jamais. */
  plancherEntitesAdresse: number;
  /** Taille minimale d'une grappe d'entités à administrateur commun. */
  seuilGrappeAdresse: number;
}

export const CONFIGURATION_PAR_DEFAUT: ConfigurationRegles = {
  profondeurCascade: 4,
  seuilEntitesDefaillantes: 3,
  seuilMandatsSansLien: 4,
  dureeMandatCourtJours: 400,
  fenetreTransfertJours: 180,
  fenetreReconstitutionJours: 730,
  fenetreChangementJours: 365,
  seuilSimilariteNom: 0.72,
  ecartsTypesAdresse: 2,
  plancherEntitesAdresse: 5,
  seuilGrappeAdresse: 3,
};

export interface ContexteAnalyse {
  index: IndexGraphe;
  config: ConfigurationRegles;
  cycles: CycleDetention[];
  date?: string;
}

export function creerContexte(
  index: IndexGraphe,
  config: Partial<ConfigurationRegles> = {},
  date?: string,
): ContexteAnalyse {
  const configComplete = { ...CONFIGURATION_PAR_DEFAUT, ...config };
  return { index, config: configComplete, cycles: detecterCycles(index, date), date };
}

export type Regle = (contexte: ContexteAnalyse) => RedFlag[];

// ---------------------------------------------------------------------------
// §2.3 — Cycles de détention
// ---------------------------------------------------------------------------

export const regleCycleDetention: Regle = ({ index, cycles }) => {
  return cycles.flatMap((cycle) => {
    const noms = cycle.entites.map((id) => index.entite(id)?.nomLegal ?? id);
    const boucle = [...noms, noms[0]].join(' → ');
    return cycle.entites.map<RedFlag>((entiteId) => ({
      typeRegle: 'cycle_detention',
      entiteId,
      severite: 'eleve',
      explication: `Cycle de détention : ${boucle}. Le bénéficiaire ultime de cette branche est mathématiquement indéterminable à partir des pourcentages déclarés.`,
      elementsDeclencheurs: { entites: cycle.entites, relations: cycle.relations },
    }));
  });
};

// ---------------------------------------------------------------------------
// §2.1 — Cascades de détention excessives
// ---------------------------------------------------------------------------

export const regleCascadeExcessive: Regle = ({ index, config, date }) => {
  const flags: RedFlag[] = [];

  for (const entite of index.entites) {
    if (entite.structureConnue) continue;

    const chaine = plusLongueChaineEntites(index, entite.id, date);
    if (chaine.length < config.profondeurCascade) continue;

    const noms = chaine.map((id) => index.entite(id)?.nomLegal ?? id);
    // Au-delà du seuil, chaque niveau supplémentaire pèse davantage.
    const severite: Severite = chaine.length >= config.profondeurCascade + 2 ? 'eleve' : 'moyen';

    flags.push({
      typeRegle: 'cascade_excessive',
      entiteId: entite.id,
      severite,
      explication: `Chaîne de détention de ${chaine.length} sociétés interposées avant d'atteindre une personne physique : ${noms.join(' ← ')}. Une telle profondeur sans justification opérationnelle apparente allonge la distance entre l'actif et son détenteur réel.`,
      elementsDeclencheurs: { entites: chaine },
    });
  }

  return flags;
};

/** Plus longue chaîne d'entités interposées au-dessus d'une entité donnée. */
function plusLongueChaineEntites(
  index: IndexGraphe,
  depart: IdentifiantEntite,
  date: string | undefined,
): IdentifiantEntite[] {
  let meilleure: IdentifiantEntite[] = [];

  const explorer = (
    courant: IdentifiantEntite,
    chemin: IdentifiantEntite[],
    visitees: Set<IdentifiantEntite>,
  ): void => {
    if (chemin.length > meilleure.length) meilleure = [...chemin];
    if (chemin.length > 20) return;

    for (const detention of index.detenteursDe(courant, date)) {
      const source = detention.sourceEntiteId;
      if (!source || visitees.has(source) || !index.entite(source)) continue;
      explorer(source, [...chemin, source], new Set(visitees).add(source));
    }
  };

  explorer(depart, [depart], new Set([depart]));
  return meilleure;
}

// ---------------------------------------------------------------------------
// §2.2 — Administrateurs récurrents dans des entités défaillantes
// ---------------------------------------------------------------------------

const STATUTS_DEFAILLANTS = new Set(['radiee_office', 'dissoute']);

export const regleAdministrateurRecurrent: Regle = ({ index, config }) => {
  const flags: RedFlag[] = [];

  for (const personne of index.graphe.personnes) {
    const mandats = index.mandatsDe(personne.id);
    const entitesDefaillantes = mandats
      .map((m) => index.entite(m.entiteId))
      .filter((e): e is Entite => e !== undefined && STATUTS_DEFAILLANTS.has(e.statut));

    if (entitesDefaillantes.length < config.seuilEntitesDefaillantes) continue;

    const ids = entitesDefaillantes.map((e) => e.id);
    const severite: Severite =
      entitesDefaillantes.length >= config.seuilEntitesDefaillantes + 2 ? 'eleve' : 'moyen';

    for (const mandat of mandats) {
      const cible = index.entite(mandat.entiteId);
      if (!cible || STATUTS_DEFAILLANTS.has(cible.statut)) continue;
      flags.push({
        typeRegle: 'administrateur_recurrent',
        entiteId: mandat.entiteId,
        severite,
        explication: `${personne.nomComplet}, administrateur de cette entité, a également siégé dans ${entitesDefaillantes.length} sociétés depuis radiées d'office ou dissoutes : ${entitesDefaillantes.map((e) => e.nomLegal).join(', ')}.`,
        elementsDeclencheurs: { personnes: [personne.id], entites: ids },
      });
    }
  }

  return flags;
};

// ---------------------------------------------------------------------------
// §2.2 (volet prête-nom) — mandats multiples sans lien apparent
// ---------------------------------------------------------------------------

export const reglePreteNomProbable: Regle = ({ index, config, date }) => {
  const flags: RedFlag[] = [];

  for (const personne of index.graphe.personnes) {
    const mandats = index.mandatsDe(personne.id);
    if (mandats.length < config.seuilMandatsSansLien) continue;

    const entites = mandats
      .map((m) => index.entite(m.entiteId))
      .filter((e): e is Entite => e !== undefined);
    if (entites.length < config.seuilMandatsSansLien) continue;

    // Signal 1 : les sociétés administrées ne se détiennent pas entre elles.
    const ids = new Set(entites.map((e) => e.id));
    const detentionCroisee = entites.some((e) =>
      index.participationsDe(e.id, date).some((d) => ids.has(d.cibleEntiteId)),
    );
    if (detentionCroisee) continue;

    // Signal 2 : aucune détention déclarée de la personne dans ces sociétés.
    const detientQuelqueChose = index.graphe.detentions.some(
      (d) => d.sourcePersonneId === personne.id && ids.has(d.cibleEntiteId),
    );
    if (detientQuelqueChose) continue;

    // Signal 3 : mandats courts et répétés.
    const mandatsCourts = mandats.filter((m) => {
      const fin = m.jusquA ?? aujourdHui(date);
      return ecartJours(m.depuis, fin) <= config.dureeMandatCourtJours;
    });
    if (mandatsCourts.length < config.seuilMandatsSansLien) continue;

    // Aucun de ces signaux ne suffit seul — c'est leur cumul qui est signalé,
    // et la formulation reste au conditionnel : la donnée publique ne permet
    // pas d'établir un prête-nom, seulement de le rendre plausible.
    for (const mandat of mandats) {
      flags.push({
        typeRegle: 'prete_nom_probable',
        entiteId: mandat.entiteId,
        severite: 'moyen',
        explication: `${personne.nomComplet} administre ${entites.length} sociétés sans lien de détention entre elles, sans y détenir de participation déclarée, avec des mandats de courte durée récurrents — profil compatible avec un rôle de prête-nom, à corroborer hors registre.`,
        elementsDeclencheurs: {
          personnes: [personne.id],
          entites: [...ids],
          relations: mandatsCourts.map((m) => m.id),
        },
      });
    }
  }

  return flags;
};

// ---------------------------------------------------------------------------
// §2.4 — Transfert d'actions ou d'administration avant un événement critique
// ---------------------------------------------------------------------------

const EVENEMENTS_TRANSFERT: TypeEvenement[] = ['transfert_actions', 'changement_administrateur'];

export const regleTransfertAvantEvenementCritique: Regle = ({ index, config, date }) => {
  const flags: RedFlag[] = [];

  for (const entite of index.entites) {
    const evenements = index.evenementsDe(entite.id);
    const transferts = evenements.filter((e) => EVENEMENTS_TRANSFERT.includes(e.type));
    if (transferts.length === 0) continue;

    // On cherche l'événement critique sur l'entité elle-même comme sur les
    // entités qui lui sont liées : un actif déplacé puis une coquille vidée
    // laissent leurs traces sur deux fiches différentes.
    const entitesLiees = entitesLieesA(index, entite.id, date);
    const critiques = [...entitesLiees, entite.id].flatMap((id) =>
      index.evenementsDe(id).filter((e) => EVENEMENTS_CRITIQUES.includes(e.type)),
    );

    for (const transfert of transferts) {
      for (const critique of critiques) {
        const delai = ecartJours(transfert.dateEffective, critique.dateEffective);
        if (delai < 0 || delai > config.fenetreTransfertJours) continue;

        const cible = index.entite(critique.entiteId);
        const memeEntite = critique.entiteId === entite.id;
        flags.push({
          typeRegle: 'transfert_avant_evenement_critique',
          entiteId: entite.id,
          severite: delai <= 90 ? 'eleve' : 'moyen',
          explication: `${etiquetteEvenement(transfert.type)} le ${transfert.dateEffective}, soit ${delai} jours avant ${etiquetteEvenement(critique.type).toLowerCase()} ${memeEntite ? 'de cette même entité' : `de ${cible?.nomLegal ?? critique.entiteId}`} (${critique.dateEffective}). La proximité temporelle justifie de vérifier si l'opération a soustrait de la valeur à la masse.`,
          elementsDeclencheurs: {
            entites: memeEntite ? [entite.id] : [entite.id, critique.entiteId],
            evenements: [transfert.id, critique.id],
            avisReq: [transfert.avisReqId, critique.avisReqId],
          },
        });
      }
    }
  }

  return flags;
};

/** Entités reliées par une détention entrante ou sortante (1 saut). */
function entitesLieesA(
  index: IndexGraphe,
  entiteId: IdentifiantEntite,
  date: string | undefined,
): IdentifiantEntite[] {
  const liees = new Set<IdentifiantEntite>();
  for (const d of index.participationsDe(entiteId, date)) liees.add(d.cibleEntiteId);
  for (const d of index.detenteursDe(entiteId, date)) {
    if (d.sourceEntiteId) liees.add(d.sourceEntiteId);
  }
  liees.delete(entiteId);
  return [...liees];
}

// ---------------------------------------------------------------------------
// §2.5 — Dissolution suivie d'une reconstitution apparentée
// ---------------------------------------------------------------------------

export const regleDissolutionReconstitution: Regle = ({ index, config, date }) => {
  const flags: RedFlag[] = [];

  const dissoutes = index.entites.filter(
    (e) => e.dateDissolution && (e.statut === 'dissoute' || e.statut === 'radiee_office'),
  );

  for (const ancienne of dissoutes) {
    const dateDissolution = ancienne.dateDissolution!;

    for (const nouvelle of index.entites) {
      if (nouvelle.id === ancienne.id) continue;
      const delai = ecartJours(dateDissolution, nouvelle.dateConstitution);
      if (delai < 0 || delai > config.fenetreReconstitutionJours) continue;

      const signaux = signauxDeContinuite(index, ancienne.id, nouvelle.id, config, date);
      // Un seul point commun est courant et sans valeur probante ; c'est la
      // conjonction d'au moins deux signaux qui rend la continuité plausible.
      if (signaux.libelles.length < 2) continue;

      flags.push({
        typeRegle: 'dissolution_reconstitution',
        entiteId: nouvelle.id,
        severite: delai <= 180 ? 'eleve' : 'moyen',
        explication: `${nouvelle.nomLegal} a été constituée ${delai} jours après la disparition de ${ancienne.nomLegal}, avec ${signaux.libelles.length} éléments de continuité : ${signaux.libelles.join(', ')}. Le motif est compatible avec une poursuite d'activité sous une coquille neuve, laissant le passif derrière.`,
        elementsDeclencheurs: {
          entites: [ancienne.id, nouvelle.id],
          personnes: signaux.personnes,
          adresses: signaux.adresses,
        },
      });
    }
  }

  return flags;
};

function signauxDeContinuite(
  index: IndexGraphe,
  ancienneId: IdentifiantEntite,
  nouvelleId: IdentifiantEntite,
  config: ConfigurationRegles,
  date: string | undefined,
): { libelles: string[]; personnes: IdentifiantPersonne[]; adresses: string[] } {
  const libelles: string[] = [];

  const adminsAnciens = new Set(index.administrateursDe(ancienneId).map((a) => a.personneId));
  const adminsNouveaux = index.administrateursDe(nouvelleId, date).map((a) => a.personneId);
  const personnesCommunes = adminsNouveaux.filter((p) => adminsAnciens.has(p));
  if (personnesCommunes.length > 0) {
    const noms = personnesCommunes.map((p) => index.personne(p)?.nomComplet ?? p);
    libelles.push(`administrateur(s) commun(s) : ${noms.join(', ')}`);
  }

  const adressesAnciennes = new Set(index.adressesDe(ancienneId).map((l) => l.adresseId));
  const adressesCommunes = index
    .adressesDe(nouvelleId)
    .map((l) => l.adresseId)
    .filter((a) => adressesAnciennes.has(a));
  if (adressesCommunes.length > 0) libelles.push('même adresse déclarée');

  const ancienne = index.entite(ancienneId)!;
  const nouvelle = index.entite(nouvelleId)!;
  const similarite = similariteNomLegal(ancienne.nomLegal, nouvelle.nomLegal);
  if (similarite >= config.seuilSimilariteNom) {
    libelles.push(`dénomination voisine (${Math.round(similarite * 100)} % de similarité)`);
  }

  if (ancienne.codeNaics && ancienne.codeNaics === nouvelle.codeNaics) {
    libelles.push('même secteur d’activité déclaré');
  }

  return {
    libelles,
    personnes: personnesCommunes,
    adresses: [...new Set(adressesCommunes)],
  };
}

// ---------------------------------------------------------------------------
// §2.6 — Adresse partagée massivement par des entités par ailleurs liées
// ---------------------------------------------------------------------------

export const regleAdressePartageeMassive: Regle = ({ index, config, date }) => {
  const flags: RedFlag[] = [];

  const comptes = new Map<string, IdentifiantEntite[]>();
  for (const adresse of index.graphe.adresses) {
    const entites = [
      ...new Set(
        index
          .liensDeAdresse(adresse.id)
          .filter((l) => l.entiteId && estActive(l, date))
          .map((l) => l.entiteId!),
      ),
    ];
    comptes.set(adresse.id, entites);
  }

  const effectifs = new Map([...comptes].map(([id, e]) => [id, e.length]));
  const moyenneGlobale =
    [...effectifs.values()].reduce((s, n) => s + n, 0) / (effectifs.size || 1);

  for (const adresse of index.graphe.adresses) {
    if (adresse.domiciliataireConnu) continue;
    const entites = comptes.get(adresse.id) ?? [];

    // Seuil statistique plutôt qu'absolu : un immeuble de bureaux légitime ne
    // doit pas ressortir simplement parce qu'il héberge beaucoup de sociétés.
    // La norme est calculée en excluant l'adresse évaluée — sans quoi une
    // adresse suffisamment extrême relève elle-même la barre qu'on lui oppose
    // et finit par se masquer.
    const seuil = Math.max(
      config.plancherEntitesAdresse,
      seuilStatistique(effectifs, adresse.id, config.ecartsTypesAdresse),
    );
    if (entites.length < seuil) continue;

    // Le signal n'est pas la densité en soi, mais la présence d'une grappe de
    // sociétés réunies par un même administrateur. Le lien de détention est
    // volontairement exclu du regroupement : une société mère et sa filiale
    // qui partagent un siège social sont la norme, pas une anomalie.
    for (const groupe of grouperParAdministrateurCommun(index, entites)) {
      if (groupe.length < config.seuilGrappeAdresse) continue;

      for (const entiteId of groupe) {
        flags.push({
          typeRegle: 'adresse_partagee_massive',
          entiteId,
          severite: groupe.length >= 4 ? 'eleve' : 'moyen',
          explication: `${entites.length} entités déclarent l'adresse « ${adresse.adresseNormalisee} », dont ${groupe.length} partagent en outre un même administrateur sans lien de détention entre elles. Cette concentration dépasse nettement la normale observée (${moyenneGlobale.toFixed(1)} entité(s) par adresse).`,
          elementsDeclencheurs: { adresses: [adresse.id], entites: groupe },
        });
      }
    }
  }

  return flags;
};

/**
 * Moyenne + k écarts-types calculés sur toutes les adresses sauf celle qu'on
 * évalue (statistique « leave-one-out »).
 */
function seuilStatistique(
  effectifs: Map<string, number>,
  adresseExclue: string,
  ecartsTypes: number,
): number {
  const autres = [...effectifs].filter(([id]) => id !== adresseExclue).map(([, n]) => n);
  if (autres.length === 0) return 0;
  const moyenne = autres.reduce((s, n) => s + n, 0) / autres.length;
  const variance = autres.reduce((s, n) => s + (n - moyenne) ** 2, 0) / autres.length;
  return moyenne + ecartsTypes * Math.sqrt(variance);
}

/**
 * Regroupe les entités réunies par un administrateur commun, passé ou présent,
 * et écarte celles qui sont par ailleurs liées par une chaîne de détention —
 * un groupe de sociétés partageant son siège social est attendu.
 */
function grouperParAdministrateurCommun(
  index: IndexGraphe,
  entites: IdentifiantEntite[],
): IdentifiantEntite[][] {
  const parent = new Map<IdentifiantEntite, IdentifiantEntite>();
  const trouver = (x: IdentifiantEntite): IdentifiantEntite => {
    let racine = x;
    while (parent.get(racine) !== racine) racine = parent.get(racine)!;
    return racine;
  };
  const unir = (a: IdentifiantEntite, b: IdentifiantEntite): void => {
    const ra = trouver(a);
    const rb = trouver(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  const ensemble = new Set(entites);
  // Les sociétés reliées par une détention forment un groupe légitime : on les
  // retire avant de chercher une grappe d'administrateur commun.
  const enChaineDeDetention = new Set<IdentifiantEntite>();
  for (const e of entites) {
    for (const d of index.graphe.detentions) {
      if (d.sourceEntiteId === e && ensemble.has(d.cibleEntiteId)) {
        enChaineDeDetention.add(e);
        enChaineDeDetention.add(d.cibleEntiteId);
      }
    }
  }

  const candidates = entites.filter((e) => !enChaineDeDetention.has(e));
  for (const e of candidates) parent.set(e, e);

  const parAdministrateur = new Map<IdentifiantPersonne, IdentifiantEntite[]>();
  for (const e of candidates) {
    for (const admin of index.historiqueAdministrateursDe(e)) {
      const liste = parAdministrateur.get(admin.personneId);
      if (liste) liste.push(e);
      else parAdministrateur.set(admin.personneId, [e]);
    }
  }
  for (const liste of parAdministrateur.values()) {
    for (let i = 1; i < liste.length; i += 1) unir(liste[0]!, liste[i]!);
  }

  const groupes = new Map<IdentifiantEntite, IdentifiantEntite[]>();
  for (const e of candidates) {
    const racine = trouver(e);
    const liste = groupes.get(racine);
    if (liste) liste.push(e);
    else groupes.set(racine, [e]);
  }
  return [...groupes.values()];
}

// ---------------------------------------------------------------------------
// §2.7 — Changement de nom ou de siège juste avant un événement critique
// ---------------------------------------------------------------------------

const EVENEMENTS_CHANGEMENT: TypeEvenement[] = ['changement_nom', 'changement_siege'];

export const regleChangementAvantEvenementCritique: Regle = ({ index, config }) => {
  const flags: RedFlag[] = [];

  for (const entite of index.entites) {
    const evenements = index.evenementsDe(entite.id);
    const changements = evenements.filter((e) => EVENEMENTS_CHANGEMENT.includes(e.type));
    const critiques = evenements.filter((e) => EVENEMENTS_CRITIQUES.includes(e.type));

    for (const changement of changements) {
      for (const critique of critiques) {
        const delai = ecartJours(changement.dateEffective, critique.dateEffective);
        if (delai < 0 || delai > config.fenetreChangementJours) continue;

        flags.push({
          typeRegle: 'changement_avant_evenement_critique',
          entiteId: entite.id,
          severite: delai <= 120 ? 'moyen' : 'faible',
          explication: `${etiquetteEvenement(changement.type)} le ${changement.dateEffective}, ${delai} jours avant ${etiquetteEvenement(critique.type).toLowerCase()} (${critique.dateEffective}) — modification de l'identité déclarée à la veille d'un point de bascule, qui complique le rattachement des créanciers.`,
          elementsDeclencheurs: {
            entites: [entite.id],
            evenements: [changement.id, critique.id],
            avisReq: [changement.avisReqId, critique.avisReqId],
          },
        });
      }
    }
  }

  return flags;
};

// ---------------------------------------------------------------------------

/** Libellés lisibles des règles, partagés par l'API, les rapports et l'interface. */
export const LIBELLES_REGLES: Record<TypeRegle, string> = {
  cycle_detention: 'Cycle de détention',
  cascade_excessive: 'Cascade de sociétés interposées',
  administrateur_recurrent: 'Administrateur récurrent en entités défaillantes',
  prete_nom_probable: 'Profil de prête-nom probable',
  transfert_avant_evenement_critique: 'Transfert avant événement critique',
  dissolution_reconstitution: 'Dissolution puis reconstitution apparentée',
  adresse_partagee_massive: 'Grappe d’entités à une même adresse',
  changement_avant_evenement_critique: 'Changement d’identité avant événement critique',
};

export const REGLES: Regle[] = [
  regleCycleDetention,
  regleCascadeExcessive,
  regleAdministrateurRecurrent,
  reglePreteNomProbable,
  regleTransfertAvantEvenementCritique,
  regleDissolutionReconstitution,
  regleAdressePartageeMassive,
  regleChangementAvantEvenementCritique,
];

/** Exécute toutes les règles sur le graphe. */
export function executerRegles(contexte: ContexteAnalyse): RedFlag[] {
  return REGLES.flatMap((regle) => regle(contexte));
}

function etiquetteEvenement(type: TypeEvenement): string {
  const etiquettes: Record<TypeEvenement, string> = {
    constitution: 'Constitution',
    changement_nom: 'Changement de dénomination',
    changement_siege: 'Changement de siège social',
    changement_administrateur: 'Changement d’administrateur',
    transfert_actions: 'Transfert d’actions',
    fusion: 'Fusion',
    scission: 'Scission',
    dissolution: 'la dissolution',
    radiation: 'la radiation',
    faillite: 'la faillite',
    proposition_concordataire: 'la proposition concordataire',
  };
  return etiquettes[type];
}

function aujourdHui(date: string | undefined): string {
  return date ?? new Date().toISOString().slice(0, 10);
}
