import { stat } from 'node:fs/promises';

import { lireFichier, type ResultatLecture } from './lecture-csv.js';
import {
  FICHIER_CONTINUATION,
  FICHIER_DOMAINE_VALEUR,
  FICHIER_ENTREPRISE,
  FICHIER_ETABLISSEMENT,
  FICHIER_FUSION_SCISSION,
  FICHIER_NOM,
  type FichierReq,
} from './specification.js';
import { transformer, type ResultatTransformation } from './transformation.js';

/**
 * Chargement d'une archive décompressée du jeu de données ouvertes.
 *
 * L'archive elle-même n'est pas téléchargée par ce code : le service du
 * Registraire filtre les requêtes automatisées, et surtout la licence
 * CC BY-NC-SA impose un usage non commercial dont la responsabilité revient à
 * l'exploitant. Le téléchargement reste donc un geste explicite, documenté
 * dans docs/auditreq/07-acces-donnees-req.md.
 */

export interface AnomalieStructure {
  fichier: string;
  gravite: 'bloquante' | 'avertissement';
  message: string;
}

export interface ResultatChargement extends ResultatTransformation {
  anomalies: AnomalieStructure[];
}

export interface OptionsChargement {
  /** Date de l'extrait. Par défaut, la date de modification du répertoire. */
  dateExtraction?: string;
}

export async function chargerArchive(
  repertoire: string,
  options: OptionsChargement = {},
): Promise<ResultatChargement> {
  const anomalies: AnomalieStructure[] = [];

  const lire = async (specification: FichierReq, obligatoire: boolean) => {
    const resultat = await lireFichier(repertoire, specification);

    if (!resultat) {
      anomalies.push({
        fichier: specification.nom,
        gravite: obligatoire ? 'bloquante' : 'avertissement',
        message: obligatoire
          ? `Fichier ${specification.nom} introuvable dans l'archive.`
          : `Fichier ${specification.nom} absent — les données correspondantes ne seront pas chargées.`,
      });
      return null;
    }

    const manquantesRequises = specification.colonnesRequises.filter((c) =>
      resultat.colonnesManquantes.includes(c),
    );
    if (manquantesRequises.length > 0) {
      anomalies.push({
        fichier: specification.nom,
        gravite: 'bloquante',
        message: `Colonnes indispensables absentes : ${manquantesRequises.join(', ')}.`,
      });
      return null;
    }

    // Une colonne documentée qui disparaît, ou une colonne inconnue qui
    // apparaît, signale un changement de format en amont. On charge quand même
    // — l'appariement se fait par en-tête — mais on le dit, plutôt que de
    // laisser une analyse silencieusement amputée.
    if (resultat.colonnesManquantes.length > 0) {
      anomalies.push({
        fichier: specification.nom,
        gravite: 'avertissement',
        message: `Colonnes documentées absentes du fichier reçu : ${resultat.colonnesManquantes.join(', ')}.`,
      });
    }
    if (resultat.colonnesInattendues.length > 0) {
      anomalies.push({
        fichier: specification.nom,
        gravite: 'avertissement',
        message: `Colonnes non documentées rencontrées : ${resultat.colonnesInattendues.join(', ')}. Le format du Registraire a probablement évolué.`,
      });
    }

    return resultat;
  };

  const [entreprises, noms, etablissements, fusions, continuations, domaines] = await Promise.all([
    lire(FICHIER_ENTREPRISE, true),
    lire(FICHIER_NOM, true),
    lire(FICHIER_ETABLISSEMENT, false),
    lire(FICHIER_FUSION_SCISSION, false),
    lire(FICHIER_CONTINUATION, false),
    lire(FICHIER_DOMAINE_VALEUR, false),
  ]);

  const dateExtraction = options.dateExtraction ?? (await dateDuRepertoire(repertoire));

  const resultat = transformer(
    {
      entreprises: lignes(entreprises),
      noms: lignes(noms),
      etablissements: lignes(etablissements),
      fusionsScissions: lignes(fusions),
      continuations: lignes(continuations),
      domainesValeur: lignes(domaines),
    },
    { dateExtraction },
  );

  return { ...resultat, anomalies };
}

function lignes(resultat: ResultatLecture | null) {
  return resultat?.lignes ?? [];
}

async function dateDuRepertoire(repertoire: string): Promise<string> {
  const infos = await stat(repertoire);
  return infos.mtime.toISOString().slice(0, 10);
}
