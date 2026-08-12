import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import {
  IndexGraphe,
  analyser,
  calculerUbo,
  creerContexte,
  detecterCycles,
  estActive,
  rechercher,
  type GrapheCorporatif,
  type IdentifiantEntite,
  type RedFlag,
  type ScoreRisque,
} from '@auditreq/core';

import { chargerGraphe, pool } from './db.js';
import { enregistrerRoutesDossiers, journaliser } from './dossiers.js';
import { enregistrerRoutesCaptures } from './captures.js';
import { enregistrerAuthentification, purgerSessionsExpirees } from './authentification.js';

/**
 * État analytique du service : le graphe et son analyse sont calculés une fois
 * puis servis en lecture. Un lot d'avis REQ nouvellement ingéré déclenche un
 * rechargement (`POST /api/analyse/recalculer`), ce qui garde les requêtes de
 * consultation en temps constant.
 */
interface EtatAnalytique {
  graphe: GrapheCorporatif;
  index: IndexGraphe;
  flags: RedFlag[];
  scores: Map<IdentifiantEntite, ScoreRisque>;
  calculeLe: string;
}

async function construireEtat(): Promise<EtatAnalytique> {
  const graphe = await chargerGraphe();
  const index = new IndexGraphe(graphe);
  const { flags, scores } = analyser(creerContexte(index));
  return { graphe, index, flags, scores, calculeLe: new Date().toISOString() };
}

export async function creerServeur(): Promise<FastifyInstance> {
  const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? 'info' } });

  // L'origine est reflétée plutôt qu'ouverte à tous : le témoin de session ne
  // peut être transmis qu'avec `credentials`, ce qui exige une origine précise.
  await app.register(cors, { origin: true, credentials: true });
  await app.register(cookie, { secret: process.env.SECRET_TEMOIN ?? undefined });

  enregistrerAuthentification(app);
  await purgerSessionsExpirees();
  // Les sessions expirées ne s'accumulent pas : la purge tourne chaque heure.
  const purge = setInterval(() => void purgerSessionsExpirees(), 3_600_000);
  purge.unref();

  let etat = await construireEtat();

  app.get('/api/sante', async () => ({
    statut: 'ok',
    entites: etat.graphe.entites.length,
    personnes: etat.graphe.personnes.length,
    redFlags: etat.flags.length,
    analyseCalculeeLe: etat.calculeLe,
    provenance: etat.graphe.provenance,
  }));

  /**
   * Provenance des données et couverture des règles.
   *
   * Le jeu de données ouvertes du REQ ne publie aucune personne physique :
   * quatre règles sur neuf restent alors inactives. L'interface doit le dire,
   * sans quoi un professionnel lirait une absence de signal comme un résultat
   * d'analyse plutôt que comme une limite de la source.
   */
  app.get('/api/provenance', async () => {
    const sansPersonnes = etat.graphe.personnes.length === 0;
    return {
      provenance: etat.graphe.provenance ?? null,
      analyseCalculeeLe: etat.calculeLe,
      couverture: {
        entites: etat.graphe.entites.length,
        personnes: etat.graphe.personnes.length,
        detentions: etat.graphe.detentions.length,
        reglesInactives: sansPersonnes
          ? [
              'cycle_detention',
              'cascade_excessive',
              'administrateur_recurrent',
              'prete_nom_probable',
            ]
          : [],
        motifInactivite: sansPersonnes
          ? 'La source chargée ne contient aucune personne physique : le bénéficiaire ultime et les règles qui dépendent des détentions ou des mandats ne peuvent pas être évalués.'
          : null,
      },
    };
  });

  app.post('/api/analyse/recalculer', async () => {
    etat = await construireEtat();
    return { statut: 'ok', analyseCalculeeLe: etat.calculeLe, redFlags: etat.flags.length };
  });

  // -------------------------------------------------------------------------
  // Recherche
  // -------------------------------------------------------------------------

  app.get<{ Querystring: { q?: string; similarite?: string; limite?: string } }>(
    '/api/recherche',
    async (requete) => {
      const q = requete.query.q ?? '';
      const resultats = rechercher(q, etat.graphe.entites, etat.graphe.personnes, {
        similarite: requete.query.similarite !== 'false',
        limite: requete.query.limite ? Number(requete.query.limite) : undefined,
      });

      // Toute recherche est journalisée : c'est l'exigence de traçabilité qui
      // rend un rapport défendable, et elle ne souffre pas d'exception.
      await journaliser(requete.utilisateur?.id ?? null, 'recherche', {
        requete: q,
        resultats: resultats.length,
      });

      return {
        requete: q,
        resultats: resultats.map((r) => {
          if (r.type !== 'entite') return r;
          const entite = etat.index.entite(r.id)!;
          const score = etat.scores.get(r.id);
          return {
            ...r,
            statut: entite.statut,
            formeJuridique: entite.formeJuridique,
            score: score?.score ?? 0,
            niveau: score?.niveau ?? 'faible',
          };
        }),
      };
    },
  );

  // -------------------------------------------------------------------------
  // Fiche entité
  // -------------------------------------------------------------------------

  app.get<{ Params: { id: string } }>('/api/entites/:id', async (requete, reponse) => {
    const entite = resoudreEntite(etat, requete.params.id);
    if (!entite) return reponse.code(404).send({ erreur: 'Entité introuvable' });

    const score = etat.scores.get(entite.id);
    await journaliser(requete.utilisateur?.id ?? null, 'entite.consultation', {
      entiteId: entite.id,
      neq: entite.neq,
    });

    return {
      entite,
      score: score ?? null,
      administrateurs: etat.index.historiqueAdministrateursDe(entite.id).map((a) => ({
        ...a,
        personne: etat.index.personne(a.personneId),
        actif: estActive(a),
      })),
      actionnaires: etat.index.graphe.detentions
        .filter((d) => d.cibleEntiteId === entite.id)
        .map((d) => ({
          ...d,
          detenteur: d.sourcePersonneId
            ? { type: 'personne', ...etat.index.personne(d.sourcePersonneId) }
            : { type: 'entite', ...etat.index.entite(d.sourceEntiteId!) },
          actif: estActive(d),
        })),
      participations: etat.index.graphe.detentions
        .filter((d) => d.sourceEntiteId === entite.id)
        .map((d) => ({ ...d, cible: etat.index.entite(d.cibleEntiteId), actif: estActive(d) })),
      adresses: etat.index.adressesDe(entite.id).map((l) => ({
        ...l,
        adresse: etat.index.adresse(l.adresseId),
        actif: estActive(l),
      })),
      evenements: etat.index.evenementsDe(entite.id),
    };
  });

  // -------------------------------------------------------------------------
  // Graphe relationnel
  // -------------------------------------------------------------------------

  app.get<{ Params: { id: string }; Querystring: { degres?: string } }>(
    '/api/entites/:id/graphe',
    async (requete, reponse) => {
      const entite = resoudreEntite(etat, requete.params.id);
      if (!entite) return reponse.code(404).send({ erreur: 'Entité introuvable' });

      const degres = Math.min(Number(requete.query.degres ?? 2), 5);
      return construireSousGraphe(etat, entite.id, degres);
    },
  );

  // -------------------------------------------------------------------------
  // Bénéficiaires ultimes
  // -------------------------------------------------------------------------

  app.get<{ Params: { id: string }; Querystring: { date?: string } }>(
    '/api/entites/:id/ubo',
    async (requete, reponse) => {
      const entite = resoudreEntite(etat, requete.params.id);
      if (!entite) return reponse.code(404).send({ erreur: 'Entité introuvable' });

      const resultat = calculerUbo(etat.index, entite.id, { date: requete.query.date });

      // Les chaînes sont renvoyées enrichies des libellés : le client doit
      // pouvoir afficher le raisonnement sans refaire de requêtes.
      return {
        ...resultat,
        beneficiaires: resultat.beneficiaires.map((b) => enrichirChemin(etat, b)),
        cheminsSousSeuil: resultat.cheminsSousSeuil.map((b) => enrichirChemin(etat, b)),
        anglesMorts: resultat.anglesMorts.map((a) => ({
          ...a,
          entite: etat.index.entite(a.entiteId)?.nomLegal,
          personne: a.personneId ? etat.index.personne(a.personneId)?.nomComplet : undefined,
        })),
      };
    },
  );

  // -------------------------------------------------------------------------
  // Chronologie
  // -------------------------------------------------------------------------

  app.get<{ Params: { id: string }; Querystring: { liees?: string } }>(
    '/api/entites/:id/chronologie',
    async (requete, reponse) => {
      const entite = resoudreEntite(etat, requete.params.id);
      if (!entite) return reponse.code(404).send({ erreur: 'Entité introuvable' });

      // Par défaut la chronologie couvre l'entité et son voisinage immédiat :
      // un stratagème se lit rarement sur une seule fiche.
      const inclureLiees = requete.query.liees !== 'false';
      const cibles = inclureLiees
        ? [entite.id, ...voisinsDirects(etat, entite.id)]
        : [entite.id];

      const evenements = cibles
        .flatMap((id) =>
          etat.index.evenementsDe(id).map((e) => ({
            ...e,
            entite: etat.index.entite(e.entiteId)?.nomLegal,
            estEntitePrincipale: e.entiteId === entite.id,
          })),
        )
        .sort((a, b) => a.dateEffective.localeCompare(b.dateEffective));

      return { entiteId: entite.id, entitesCouvertes: cibles, evenements };
    },
  );

  // -------------------------------------------------------------------------
  // Red flags
  // -------------------------------------------------------------------------

  app.get<{ Params: { id: string } }>('/api/entites/:id/flags', async (requete, reponse) => {
    const entite = resoudreEntite(etat, requete.params.id);
    if (!entite) return reponse.code(404).send({ erreur: 'Entité introuvable' });

    const score = etat.scores.get(entite.id);
    return {
      entiteId: entite.id,
      score: score?.score ?? 0,
      niveau: score?.niveau ?? 'faible',
      contributions: score?.contributions ?? [],
      bonusFaisceau: score?.bonusFaisceau ?? 0,
      flags: (score?.flags ?? []).map((f) => ({
        ...f,
        elementsNommes: nommerElements(etat, f),
      })),
    };
  });

  // -------------------------------------------------------------------------
  // Tableau de bord
  // -------------------------------------------------------------------------

  app.get('/api/tableau-de-bord', async () => {
    const dossiers = await pool.query(
      `SELECT d.id, d.nom, d.client, d.mode, d.statut, d.echeance,
              count(de.entite_id)::int AS nb_entites,
              coalesce(max(e.score_risque), 0)::int AS score_max
       FROM dossier d
       LEFT JOIN dossier_entite de ON de.dossier_id = d.id
       LEFT JOIN entite e ON e.id = de.entite_id
       GROUP BY d.id
       ORDER BY d.echeance NULLS LAST`,
    );

    const aRisque = [...etat.scores.values()]
      .filter((s) => s.niveau !== 'faible')
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((s) => ({
        entiteId: s.entiteId,
        nom: etat.index.entite(s.entiteId)?.nomLegal,
        neq: etat.index.entite(s.entiteId)?.neq,
        score: s.score,
        niveau: s.niveau,
        principauxSignaux: s.contributions.slice(0, 3).map((c) => c.typeRegle),
      }));

    return {
      statistiques: {
        entites: etat.graphe.entites.length,
        dossiersActifs: dossiers.rows.filter((d) => d.statut === 'actif').length,
        redFlags: etat.flags.length,
        entitesRisqueEleve: [...etat.scores.values()].filter((s) => s.niveau === 'eleve').length,
      },
      dossiers: dossiers.rows,
      entitesARisque: aRisque,
    };
  });

  // -------------------------------------------------------------------------
  // Profil de personne (recherche inversée)
  // -------------------------------------------------------------------------

  app.get<{ Params: { id: string } }>('/api/personnes/:id', async (requete, reponse) => {
    const personne = etat.index.personne(requete.params.id);
    if (!personne) return reponse.code(404).send({ erreur: 'Personne introuvable' });

    const mandats = etat.index.mandatsDe(personne.id).map((m) => ({
      ...m,
      entite: etat.index.entite(m.entiteId),
      actif: estActive(m),
    }));

    const detentions = etat.graphe.detentions
      .filter((d) => d.sourcePersonneId === personne.id)
      .map((d) => ({ ...d, cible: etat.index.entite(d.cibleEntiteId), actif: estActive(d) }));

    // Coprésence : avec qui cette personne siège-t-elle de façon récurrente ?
    const entitesDeLaPersonne = new Set(mandats.map((m) => m.entiteId));
    const coprésence = new Map<string, string[]>();
    for (const entiteId of entitesDeLaPersonne) {
      for (const autre of etat.index.historiqueAdministrateursDe(entiteId)) {
        if (autre.personneId === personne.id) continue;
        const liste = coprésence.get(autre.personneId) ?? [];
        liste.push(entiteId);
        coprésence.set(autre.personneId, liste);
      }
    }

    return {
      personne,
      mandats,
      detentions,
      coprésence: [...coprésence]
        .map(([personneId, entites]) => ({
          personne: etat.index.personne(personneId),
          entitesCommunes: entites,
        }))
        .sort((a, b) => b.entitesCommunes.length - a.entitesCommunes.length),
      flagsAssocies: etat.flags.filter((f) =>
        (f.elementsDeclencheurs.personnes ?? []).includes(personne.id),
      ),
    };
  });

  // Routes de travail du cabinet : dossiers, annotations, comparaison,
  // rapport et journal. Elles reçoivent l'état analytique par accesseur pour
  // rester valides après un recalcul.
  enregistrerRoutesDossiers(app, { index: () => etat.index, flags: () => etat.flags });

  // Captures assistées : réception de ce que le professionnel a consulté, et
  // validation humaine avant toute entrée au graphe.
  enregistrerRoutesCaptures(app);

  return app;
}

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------

/** Accepte indifféremment un identifiant interne ou un NEQ. */
function resoudreEntite(etat: EtatAnalytique, identifiant: string) {
  return etat.index.entite(identifiant) ?? etat.index.entiteParNumero(identifiant);
}

function voisinsDirects(etat: EtatAnalytique, entiteId: IdentifiantEntite): IdentifiantEntite[] {
  const voisins = new Set<IdentifiantEntite>();
  for (const d of etat.graphe.detentions) {
    if (d.sourceEntiteId === entiteId) voisins.add(d.cibleEntiteId);
    if (d.cibleEntiteId === entiteId && d.sourceEntiteId) voisins.add(d.sourceEntiteId);
  }
  voisins.delete(entiteId);
  return [...voisins];
}

/**
 * Construit le sous-graphe autour d'une entité par expansion en largeur.
 * L'expansion est bornée en degrés plutôt qu'en nombre de nœuds : un
 * professionnel doit pouvoir prédire ce qu'il regarde.
 */
function construireSousGraphe(
  etat: EtatAnalytique,
  racineId: IdentifiantEntite,
  degres: number,
) {
  const entitesVisibles = new Set<string>([racineId]);
  const personnesVisibles = new Set<string>();
  let frontiere = [racineId];

  for (let niveau = 0; niveau < degres; niveau += 1) {
    const suivante: string[] = [];
    for (const id of frontiere) {
      for (const d of etat.graphe.detentions) {
        if (d.cibleEntiteId === id) {
          if (d.sourceEntiteId && !entitesVisibles.has(d.sourceEntiteId)) {
            entitesVisibles.add(d.sourceEntiteId);
            suivante.push(d.sourceEntiteId);
          }
          if (d.sourcePersonneId) personnesVisibles.add(d.sourcePersonneId);
        }
        if (d.sourceEntiteId === id && !entitesVisibles.has(d.cibleEntiteId)) {
          entitesVisibles.add(d.cibleEntiteId);
          suivante.push(d.cibleEntiteId);
        }
      }
      for (const a of etat.index.historiqueAdministrateursDe(id)) {
        personnesVisibles.add(a.personneId);
      }
    }
    frontiere = suivante;
    if (frontiere.length === 0) break;
  }

  const noeuds = [
    ...[...entitesVisibles].map((id) => {
      const entite = etat.index.entite(id)!;
      const score = etat.scores.get(id);
      return {
        id,
        type: 'entite' as const,
        libelle: entite.nomLegal,
        neq: entite.neq,
        statut: entite.statut,
        score: score?.score ?? 0,
        niveau: score?.niveau ?? ('faible' as const),
        estRacine: id === racineId,
      };
    }),
    ...[...personnesVisibles].map((id) => ({
      id,
      type: 'personne' as const,
      libelle: etat.index.personne(id)!.nomComplet,
      score: 0,
      niveau: 'faible' as const,
      estRacine: false,
    })),
  ];

  const cycles = detecterCycles(etat.index);
  const relationsEnCycle = new Set(cycles.flatMap((c) => c.relations));

  const aretes = [
    ...etat.graphe.detentions
      .filter(
        (d) =>
          entitesVisibles.has(d.cibleEntiteId) &&
          ((d.sourceEntiteId && entitesVisibles.has(d.sourceEntiteId)) ||
            (d.sourcePersonneId && personnesVisibles.has(d.sourcePersonneId))),
      )
      .map((d) => ({
        id: d.id,
        type: 'detention' as const,
        source: d.sourceEntiteId ?? d.sourcePersonneId!,
        cible: d.cibleEntiteId,
        libelle: `détient ${Math.round(d.pourcentage * 100)} %`,
        pourcentage: d.pourcentage,
        actif: estActive(d),
        enCycle: relationsEnCycle.has(d.id),
        avisReqId: d.avisReqId,
      })),
    ...[...entitesVisibles]
      .flatMap((id) => etat.index.historiqueAdministrateursDe(id))
      .filter((a) => personnesVisibles.has(a.personneId))
      .map((a) => ({
        id: a.id,
        type: 'administration' as const,
        source: a.personneId,
        cible: a.entiteId,
        libelle: a.titre.toLowerCase(),
        actif: estActive(a),
        enCycle: false,
        avisReqId: a.avisReqId,
      })),
  ];

  return { racineId, degres, noeuds, aretes, cycles };
}

function enrichirChemin(
  etat: EtatAnalytique,
  chemin: { personneId: string; pourcentageEffectif: number; chaine: unknown[]; atteintSeuil: boolean },
) {
  return {
    ...chemin,
    personne: etat.index.personne(chemin.personneId),
    chaine: (chemin.chaine as Array<Record<string, string | number | undefined>>).map((m) => ({
      ...m,
      deLibelle: m.dePersonneId
        ? etat.index.personne(String(m.dePersonneId))?.nomComplet
        : etat.index.entite(String(m.deEntiteId))?.nomLegal,
      versLibelle: etat.index.entite(String(m.versEntiteId))?.nomLegal,
    })),
  };
}

/** Traduit les identifiants d'un flag en libellés lisibles pour le rapport. */
function nommerElements(etat: EtatAnalytique, flag: RedFlag) {
  const elements = flag.elementsDeclencheurs;
  return {
    entites: (elements.entites ?? []).map((id) => ({
      id,
      libelle: etat.index.entite(id)?.nomLegal ?? id,
    })),
    personnes: (elements.personnes ?? []).map((id) => ({
      id,
      libelle: etat.index.personne(id)?.nomComplet ?? id,
    })),
    adresses: (elements.adresses ?? []).map((id) => ({
      id,
      libelle: etat.index.adresse(id)?.adresseNormalisee ?? id,
    })),
    avisReq: elements.avisReq ?? [],
  };
}
