import type {
  Adresse,
  Entite,
  Evenement,
  GrapheCorporatif,
  LienAdresse,
  RelationSuccession,
} from '@auditreq/core';

import { normaliserDate, normaliserIndicateur, type LigneCsv } from './lecture-csv.js';
import {
  formeJuridiqueDepuisLibelle,
  statutDepuisLibelle,
  typeSuccessionDepuisLibelle,
} from './specification.js';

/**
 * Transformation des lignes CSV du Registraire en graphe corporatif.
 *
 * Deux partis pris méritent d'être explicités :
 *
 * 1. **Le NEQ sert d'identifiant.** Il est l'identifiant officiel et stable de
 *    l'entité ; s'en inventer un autre créerait une couche d'indirection sans
 *    valeur et compliquerait le rapprochement avec le registre en ligne.
 *
 * 2. **Les événements sont synthétisés, pas inventés.** Le jeu ouvert ne publie
 *    pas d'avis de modification ; il publie des dates. On en dérive des
 *    événements (constitution, changement de nom, radiation, fusion), en
 *    référençant systématiquement la source réelle — l'extrait daté du jeu
 *    ouvert — et jamais un numéro d'avis qui n'existerait pas.
 */

export interface EntreesBrutes {
  entreprises: LigneCsv[];
  noms: LigneCsv[];
  etablissements: LigneCsv[];
  fusionsScissions: LigneCsv[];
  continuations: LigneCsv[];
  domainesValeur: LigneCsv[];
}

export interface OptionsTransformation {
  /** Date de l'extrait, portée par la provenance et les sources synthétisées. */
  dateExtraction: string;
}

export interface RapportIngestion {
  entites: number;
  adresses: number;
  successions: number;
  evenements: number;
  /** Lignes écartées, avec le motif — une ingestion silencieuse est ingérable. */
  ecartees: { fichier: string; motif: string; compte: number }[];
}

export interface ResultatTransformation {
  graphe: GrapheCorporatif;
  rapport: RapportIngestion;
}

export function transformer(
  entrees: EntreesBrutes,
  options: OptionsTransformation,
): ResultatTransformation {
  const { dateExtraction } = options;
  const source = `Données ouvertes REQ — extrait du ${dateExtraction}`;
  const ecartees = new Map<string, number>();

  const ecarter = (fichier: string, motif: string) => {
    const cle = `${fichier}|${motif}`;
    ecartees.set(cle, (ecartees.get(cle) ?? 0) + 1);
  };

  // Les libellés des codes viennent du fichier de domaines de valeur : les
  // codes eux-mêmes ne sont pas documentés et ne doivent pas être interprétés.
  const libelles = indexerDomainesValeur(entrees.domainesValeur);

  // --- Noms : le nom légal courant, et les noms retirés comme antérieurs -----
  const nomsParNeq = new Map<string, { courant?: string; anterieurs: string[] }>();
  for (const ligne of entrees.noms) {
    const neq = ligne.NEQ;
    const nom = ligne.NOM_ASSUJ;
    if (!neq || !nom) {
      ecarter('Nom', 'NEQ ou nom absent');
      continue;
    }

    const groupe = nomsParNeq.get(neq) ?? { anterieurs: [] };
    const dateFin = normaliserDate(ligne.DAT_FIN_NOM_ASSUJ);
    const typeNom = libelles.get(`TYP_NOM_ASSUJ|${ligne.TYP_NOM_ASSUJ}`) ?? ligne.TYP_NOM_ASSUJ ?? '';
    const estNomLegal = /l[ée]gal|d[ée]nomination/i.test(typeNom) || typeNom === '';

    if (dateFin) groupe.anterieurs.push(nom);
    else if (estNomLegal && !groupe.courant) groupe.courant = nom;
    else if (!groupe.courant) groupe.courant = nom;

    nomsParNeq.set(neq, groupe);
  }

  // --- Entités --------------------------------------------------------------
  const entites: Entite[] = [];
  const evenements: Evenement[] = [];
  const adressesParCle = new Map<string, Adresse>();
  const liensAdresse: LienAdresse[] = [];

  const cleAdresse = (lignes: (string | undefined)[]): string | null => {
    const texte = lignes
      .map((l) => (l ?? '').trim())
      .filter(Boolean)
      .join(', ');
    return texte.length === 0 ? null : texte;
  };

  const enregistrerAdresse = (texte: string): Adresse => {
    const existante = adressesParCle.get(texte);
    if (existante) return existante;
    const adresse: Adresse = { id: `ADR-${adressesParCle.size + 1}`, adresseNormalisee: texte };
    adressesParCle.set(texte, adresse);
    return adresse;
  };

  for (const ligne of entrees.entreprises) {
    const neq = ligne.NEQ;
    if (!neq) {
      ecarter('Entreprise', 'NEQ absent');
      continue;
    }

    const dateConstitution =
      normaliserDate(ligne.DAT_CONSTI) ?? normaliserDate(ligne.DAT_IMMAT);
    if (!dateConstitution) {
      // Sans date de constitution ni d'immatriculation, l'entité ne peut être
      // placée sur aucune chronologie : la retenir fausserait les règles
      // temporelles plutôt que d'enrichir l'analyse.
      ecarter('Entreprise', 'aucune date de constitution ni d’immatriculation');
      continue;
    }

    const statut = statutDepuisLibelle(
      libelles.get(`STAT_IMMAT|${ligne.COD_STAT_IMMAT}`) ?? ligne.COD_STAT_IMMAT,
    );
    const nomsEntite = nomsParNeq.get(neq);
    const nomLegal = nomsEntite?.courant ?? `Entité ${neq}`;

    const activites = [
      { code: ligne.COD_ACT_ECON_CAE || undefined, description: ligne.DESC_ACT_ECON_ASSUJ || undefined },
      { code: ligne.COD_ACT_ECON_CAE2 || undefined, description: ligne.DESC_ACT_ECON_ASSUJ2 || undefined },
    ].filter((a) => a.code || a.description);

    const dateStatut = normaliserDate(ligne.DAT_STAT_IMMAT);
    const estRadieeOuDissoute = statut !== 'immatriculee' && statut !== 'fusionnee';

    const entite: Entite = {
      id: neq,
      neq,
      nomLegal,
      nomsAnterieurs: nomsEntite?.anterieurs ?? [],
      formeJuridique: formeJuridiqueDepuisLibelle(
        libelles.get(`FORM_JURI|${ligne.COD_FORME_JURI}`) ?? ligne.COD_FORME_JURI,
      ),
      statut,
      dateConstitution,
      dateDissolution: estRadieeOuDissoute ? dateStatut : undefined,
      regimeJuridique:
        libelles.get(`REGIM_JURI|${ligne.COD_REGIM_JURI}`) ?? ligne.COD_REGIM_JURI ?? undefined,
      activites: activites.length > 0 ? activites : undefined,
      indicateurFaillite: normaliserIndicateur(ligne.IND_FAIL),
      conventionUnanimeActionnaires: normaliserIndicateur(ligne.IND_CONVEN_UNMN_ACTNR),
      retraitPouvoirsConseil: normaliserIndicateur(ligne.IND_RET_TOUT_POUVR),
    };
    entites.push(entite);

    // Adresse du domicile. L'indicateur de dispense vide toutes les lignes
    // d'adresse : le guide le précise, et l'absence n'est alors pas une erreur.
    const domicile = cleAdresse([
      ligne.ADR_DOMCL_LIGN1_ADR,
      ligne.ADR_DOMCL_LIGN2_ADR,
      ligne.ADR_DOMCL_LIGN3_ADR,
      ligne.ADR_DOMCL_LIGN4_ADR,
    ]);
    if (domicile) {
      const adresse = enregistrerAdresse(domicile);
      liensAdresse.push({
        id: `LA-${liensAdresse.length + 1}`,
        adresseId: adresse.id,
        entiteId: neq,
        typeLien: 'siege_social',
        depuis: dateConstitution,
      });
    }

    evenements.push({
      id: `EV-${neq}-constitution`,
      entiteId: neq,
      type: 'constitution',
      dateEffective: dateConstitution,
      description: `Constitution de ${nomLegal}`,
      avisReqId: source,
    });

    if (estRadieeOuDissoute && dateStatut) {
      evenements.push({
        id: `EV-${neq}-fin`,
        entiteId: neq,
        type: statut === 'radiee_office' ? 'radiation' : 'dissolution',
        dateEffective: dateStatut,
        description:
          statut === 'radiee_office'
            ? 'Radiation d’office inscrite au registre'
            : 'Fin de l’immatriculation inscrite au registre',
        avisReqId: source,
      });
    }

    if (entite.indicateurFaillite) {
      evenements.push({
        id: `EV-${neq}-faillite`,
        entiteId: neq,
        type: 'faillite',
        dateEffective: dateStatut ?? dateConstitution,
        description: 'Indicateur de faillite porté au registre',
        avisReqId: source,
      });
    }
  }

  const neqConnus = new Set(entites.map((e) => e.neq));

  // --- Changements de dénomination ------------------------------------------
  for (const ligne of entrees.noms) {
    const neq = ligne.NEQ;
    const dateFin = normaliserDate(ligne.DAT_FIN_NOM_ASSUJ);
    if (!neq || !dateFin || !neqConnus.has(neq)) continue;

    evenements.push({
      id: `EV-${neq}-nom-${dateFin}-${ligne.NOM_ASSUJ?.slice(0, 12) ?? ''}`,
      entiteId: neq,
      type: 'changement_nom',
      dateEffective: dateFin,
      description: `Retrait du nom « ${ligne.NOM_ASSUJ} »`,
      avisReqId: source,
    });
  }

  // --- Établissements --------------------------------------------------------
  for (const ligne of entrees.etablissements) {
    const neq = ligne.NEQ;
    if (!neq || !neqConnus.has(neq)) {
      ecarter('Etablissement', 'NEQ inconnu ou absent');
      continue;
    }

    const texte = cleAdresse([ligne.LIGN1_ADR, ligne.LIGN2_ADR, ligne.LIGN3_ADR, ligne.LIGN4_ADR]);
    if (!texte) continue;

    const adresse = enregistrerAdresse(texte);
    liensAdresse.push({
      id: `LA-${liensAdresse.length + 1}`,
      adresseId: adresse.id,
      entiteId: neq,
      typeLien: 'etablissement',
      depuis: entites.find((e) => e.neq === neq)?.dateConstitution ?? dateExtraction,
    });
  }

  // --- Fusions et scissions --------------------------------------------------
  const successions: RelationSuccession[] = [];
  for (const ligne of entrees.fusionsScissions) {
    const successeur = ligne.NEQ;
    const predecesseur = ligne.NEQ_ASSUJ_REL;
    if (!successeur || !predecesseur) {
      ecarter('FusionScission', 'NEQ de l’une des deux parties absent');
      continue;
    }

    const typeOperation = typeSuccessionDepuisLibelle(
      libelles.get(`RELA_ASSUJ|${ligne.COD_RELA_ASSUJ}`) ?? ligne.COD_RELA_ASSUJ,
    );
    const dateOperation = normaliserDate(ligne.DAT_EFCTVT) ?? dateExtraction;

    successions.push({
      id: `SU-${successions.length + 1}`,
      entitePredecesseurId: predecesseur,
      entiteSuccesseurId: successeur,
      typeOperation,
      dateOperation,
      libellePredecesseur: ligne.DENOMN_SOC || undefined,
      avisReqId: source,
    });

    if (neqConnus.has(successeur)) {
      evenements.push({
        id: `EV-${successeur}-${typeOperation}-${predecesseur}`,
        entiteId: successeur,
        type: typeOperation === 'scission' ? 'scission' : 'fusion',
        dateEffective: dateOperation,
        description: `${typeOperation === 'scission' ? 'Scission' : 'Fusion'} avec ${
          ligne.DENOMN_SOC || `l’entité ${predecesseur}`
        } (NEQ ${predecesseur})`,
        avisReqId: source,
      });
    }
  }

  // --- Continuations et transformations --------------------------------------
  for (const ligne of entrees.continuations) {
    const neq = ligne.NEQ;
    if (!neq || !neqConnus.has(neq)) {
      ecarter('ContinuationTransformation', 'NEQ inconnu ou absent');
      continue;
    }

    const typeChangement = typeSuccessionDepuisLibelle(
      libelles.get(`TYP_CHANG|${ligne.COD_TYP_CHANG}`) ?? ligne.COD_TYP_CHANG,
    );
    const dateOperation = normaliserDate(ligne.DAT_EFCTVT) ?? dateExtraction;
    const regime =
      libelles.get(`REGIM_JURI|${ligne.COD_REGIM_JURI}`) ?? ligne.AUTR_REGIM_JURI ?? 'un autre régime';

    evenements.push({
      id: `EV-${neq}-${typeChangement}-${dateOperation}`,
      entiteId: neq,
      type: 'changement_siege',
      dateEffective: dateOperation,
      description: `${typeChangement === 'transformation' ? 'Transformation' : 'Continuation'} sous ${regime}${
        ligne.NOM_LOCLT ? ` (${ligne.NOM_LOCLT})` : ''
      }`,
      avisReqId: source,
    });
  }

  const graphe: GrapheCorporatif = {
    entites,
    // Le jeu ouvert ne publie aucune personne physique : ces tableaux restent
    // vides par construction, et non par oubli d'implémentation.
    personnes: [],
    detentions: [],
    administrations: [],
    adresses: [...adressesParCle.values()],
    successions,
    liensAdresse,
    evenements,
    provenance: {
      source: 'donnees_ouvertes_req',
      dateExtraction,
      cadence: 'Mise à jour deux fois par mois',
      licence: 'CC BY-NC-SA 4.0 — usage non commercial',
    },
  };

  return {
    graphe,
    rapport: {
      entites: entites.length,
      adresses: adressesParCle.size,
      successions: successions.length,
      evenements: evenements.length,
      ecartees: [...ecartees].map(([cle, compte]) => {
        const [fichier, motif] = cle.split('|');
        return { fichier: fichier!, motif: motif!, compte };
      }),
    },
  };
}

/** Indexe le fichier des domaines de valeur : `TYPE|CODE` → libellé français. */
function indexerDomainesValeur(lignes: LigneCsv[]): Map<string, string> {
  const index = new Map<string, string>();
  for (const ligne of lignes) {
    const type = ligne.TYP_DOM_VAL;
    const code = ligne.COD_DOM_VAL;
    const valeur = ligne.VAL_DOM_FRAN;
    if (type && code && valeur) index.set(`${type}|${code}`, valeur);
  }
  return index;
}
