import type { Evenement, IdentifiantEntite } from './domaine.js';
import type { IndexGraphe } from './index-graphe.js';
import { calculerUbo, type ResultatUbo } from './ubo.js';
import { LIBELLES_REGLES, type RedFlag } from './regles.js';
import { calculerScore, type ScoreRisque } from './scoring.js';

/**
 * Composition d'un rapport d'audit.
 *
 * Le rapport est une structure de données, pas du texte mis en forme : la
 * présentation (HTML, impression, export) est laissée à l'appelant. Ce
 * découpage garantit qu'un même dossier produit exactement le même contenu
 * quel que soit le format de sortie — condition de l'opposabilité.
 *
 * Aucun énoncé du rapport n'est produit sans que l'avis REQ qui le fonde soit
 * collecté dans l'annexe des sources.
 */

export interface AnnotationRapport {
  auteur: string;
  cible?: string;
  contenu: string;
  creeLe: string;
}

export interface EnteteRapport {
  dossierId: string;
  dossierNom: string;
  client?: string;
  finaliteDeclaree: string;
  auteur: string;
  genereLe: string;
}

export interface SectionEntite {
  entiteId: IdentifiantEntite;
  nomLegal: string;
  neq: string;
  statut: string;
  dateConstitution: string;
  dateDissolution?: string;
  score: ScoreRisque;
  ubo: ResultatUbo;
  cheminsUbo: {
    personne: string;
    pourcentageEffectif: number;
    description: string;
    avisReq: string[];
  }[];
  actionnaires: { libelle: string; pourcentage: number; depuis: string; avisReqId: string }[];
  administrateurs: { libelle: string; titre: string; depuis: string; jusquA?: string; avisReqId: string }[];
}

export interface Rapport {
  entete: EnteteRapport;
  resumeExecutif: string[];
  sections: SectionEntite[];
  chronologie: (Evenement & { entiteLibelle: string })[];
  signaux: (RedFlag & { libelleRegle: string; entiteLibelle: string })[];
  annotations: AnnotationRapport[];
  /** Tous les avis REQ cités, dédupliqués et triés — l'annexe des sources. */
  sourcesCitees: string[];
  avertissements: string[];
}

export interface ParametresRapport {
  entete: EnteteRapport;
  entites: IdentifiantEntite[];
  flags: RedFlag[];
  annotations?: AnnotationRapport[];
}

export function composerRapport(index: IndexGraphe, parametres: ParametresRapport): Rapport {
  const sources = new Set<string>();
  const sections: SectionEntite[] = [];
  const avertissements: string[] = [];

  for (const entiteId of parametres.entites) {
    const entite = index.entite(entiteId);
    if (!entite) continue;

    const score = calculerScore(entiteId, parametres.flags);
    const ubo = calculerUbo(index, entiteId);

    for (const chemin of ubo.beneficiaires) {
      for (const maillon of chemin.chaine) sources.add(maillon.avisReqId);
    }

    const actionnaires = index.graphe.detentions
      .filter((d) => d.cibleEntiteId === entiteId)
      .map((d) => {
        sources.add(d.avisReqId);
        return {
          libelle: d.sourcePersonneId
            ? (index.personne(d.sourcePersonneId)?.nomComplet ?? d.sourcePersonneId)
            : (index.entite(d.sourceEntiteId!)?.nomLegal ?? d.sourceEntiteId!),
          pourcentage: d.pourcentage,
          depuis: d.depuis,
          avisReqId: d.avisReqId,
        };
      });

    const administrateurs = index.historiqueAdministrateursDe(entiteId).map((a) => {
      sources.add(a.avisReqId);
      return {
        libelle: index.personne(a.personneId)?.nomComplet ?? a.personneId,
        titre: a.titre,
        depuis: a.depuis,
        jusquA: a.jusquA,
        avisReqId: a.avisReqId,
      };
    });

    sections.push({
      entiteId,
      nomLegal: entite.nomLegal,
      neq: entite.neq,
      statut: entite.statut,
      dateConstitution: entite.dateConstitution,
      dateDissolution: entite.dateDissolution,
      score,
      ubo,
      cheminsUbo: ubo.beneficiaires.map((b) => ({
        personne: index.personne(b.personneId)?.nomComplet ?? b.personneId,
        pourcentageEffectif: b.pourcentageEffectif,
        description: decrireChaine(index, b.chaine),
        avisReq: b.chaine.map((m) => m.avisReqId),
      })),
      actionnaires,
      administrateurs,
    });

    if (ubo.indetermine) {
      avertissements.push(
        `Le bénéficiaire ultime de ${entite.nomLegal} est partiellement indéterminable : une branche de la chaîne de détention boucle sur elle-même. La liste des bénéficiaires n'est pas exhaustive.`,
      );
    }
    for (const angle of ubo.anglesMorts) {
      if (angle.motif === 'detention_declaree_incomplete' || angle.motif === 'aucun_detenteur_declare') {
        avertissements.push(angle.explication);
      }
    }
  }

  const perimetre = new Set(parametres.entites);
  const chronologie = parametres.entites
    .flatMap((id) =>
      index.evenementsDe(id).map((e) => {
        sources.add(e.avisReqId);
        return { ...e, entiteLibelle: index.entite(e.entiteId)?.nomLegal ?? e.entiteId };
      }),
    )
    .sort((a, b) => a.dateEffective.localeCompare(b.dateEffective));

  const signaux = parametres.flags
    .filter((f) => perimetre.has(f.entiteId))
    .map((f) => {
      for (const avis of f.elementsDeclencheurs.avisReq ?? []) sources.add(avis);
      return {
        ...f,
        libelleRegle: LIBELLES_REGLES[f.typeRegle],
        entiteLibelle: index.entite(f.entiteId)?.nomLegal ?? f.entiteId,
      };
    })
    .sort((a, b) => rangSeverite(b.severite) - rangSeverite(a.severite));

  return {
    entete: parametres.entete,
    resumeExecutif: composerResume(sections, signaux),
    sections,
    chronologie,
    signaux,
    annotations: parametres.annotations ?? [],
    sourcesCitees: [...sources].sort(),
    avertissements: [...new Set(avertissements)],
  };
}

/**
 * Le résumé énonce des faits vérifiables et renvoie au détail — il ne conclut
 * pas à la place du professionnel qui signe le rapport.
 */
function composerResume(
  sections: SectionEntite[],
  signaux: { severite: string; libelleRegle: string; entiteLibelle: string }[],
): string[] {
  const lignes: string[] = [];

  const noms = sections.map((s) => s.nomLegal);
  lignes.push(
    sections.length === 1
      ? `Le présent rapport porte sur ${noms[0]} et sur les relations de propriété et de contrôle que le Registre des entreprises du Québec permet d'établir à son sujet.`
      : `Le présent rapport porte sur ${sections.length} entités — ${noms.join(', ')} — et sur les relations de propriété et de contrôle que le Registre des entreprises du Québec permet d'établir entre elles.`,
  );

  const eleves = sections.filter((s) => s.score.niveau === 'eleve');
  if (eleves.length > 0) {
    lignes.push(
      `${eleves.length === 1 ? 'Une entité présente' : `${eleves.length} entités présentent`} un score de risque élevé : ${eleves
        .map((s) => `${s.nomLegal} (${s.score.score}/100)`)
        .join(', ')}.`,
    );
  }

  const parRegle = new Map<string, string[]>();
  for (const signal of signaux) {
    if (signal.severite !== 'eleve') continue;
    const liste = parRegle.get(signal.libelleRegle) ?? [];
    if (!liste.includes(signal.entiteLibelle)) liste.push(signal.entiteLibelle);
    parRegle.set(signal.libelleRegle, liste);
  }
  for (const [regle, entites] of parRegle) {
    lignes.push(
      `${regle} — relevé sur ${ponctuer(entites.join(', '))} Voir la section « Signaux détectés ».`,
    );
  }

  const avecUbo = sections.filter((s) => s.cheminsUbo.length > 0);
  if (avecUbo.length > 0) {
    const detail = avecUbo
      .map(
        (s) =>
          `${s.nomLegal} : ${s.cheminsUbo
            .map((c) => `${c.personne} (${(c.pourcentageEffectif * 100).toFixed(1)} %)`)
            .join(', ')}`,
      )
      .join(' ; ');
    lignes.push(`Bénéficiaires effectifs atteignant le seuil de 25 % — ${detail}.`);
  } else {
    lignes.push(
      'Aucune personne physique n’atteint le seuil de contrôle de 25 % par la chaîne de détention déclarée au registre.',
    );
  }

  if (signaux.length === 0) {
    lignes.push(
      'Aucun signal de dissimulation n’a été détecté par les règles appliquées. Cette absence ne vaut pas attestation de conformité : elle indique seulement que les données publiques du registre ne révèlent pas les motifs recherchés.',
    );
  }

  return lignes;
}

/**
 * Met la chaîne de détention en phrase.
 *
 * La chaîne est construite depuis l'entité auditée en remontant vers ses
 * détenteurs — c'est le sens de la traversée. Une phrase se lit dans l'autre
 * sens, en partant de la personne : on inverse donc l'ordre, et seul le
 * premier maillon nomme son sujet, les suivants s'enchaînent par « qui ».
 */
function decrireChaine(
  index: IndexGraphe,
  chaine: { deEntiteId?: string; dePersonneId?: string; versEntiteId: string; pourcentage: number }[],
): string {
  return [...chaine]
    .reverse()
    .map((maillon, rang) => {
      const de = maillon.dePersonneId
        ? (index.personne(maillon.dePersonneId)?.nomComplet ?? maillon.dePersonneId)
        : (index.entite(maillon.deEntiteId!)?.nomLegal ?? maillon.deEntiteId!);
      const vers = index.entite(maillon.versEntiteId)?.nomLegal ?? maillon.versEntiteId;
      const part = `détient ${Math.round(maillon.pourcentage * 100)} % de ${vers}`;
      return rang === 0 ? `${de} ${part}` : part;
    })
    .join(', qui ');
}

/**
 * Termine une phrase sans doubler le point : les raisons sociales du registre
 * se terminent presque toutes par une abréviation (« Inc. », « Ltée »).
 */
function ponctuer(texte: string): string {
  return texte.endsWith('.') ? texte : `${texte}.`;
}

function rangSeverite(severite: string): number {
  return { info: 0, faible: 1, moyen: 2, eleve: 3 }[severite] ?? 0;
}
