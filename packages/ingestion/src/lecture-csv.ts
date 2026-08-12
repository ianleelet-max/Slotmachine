import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import type { FichierReq } from './specification.js';

/**
 * Lecture des fichiers CSV du Registraire.
 *
 * Le parti pris est la tolérance. Le format exact de l'archive n'est pas figé
 * par le guide (ni le séparateur, ni l'encodage, ni la casse des noms de
 * fichiers ne sont spécifiés), et il a déjà changé par le passé. Le lecteur
 * détecte donc le séparateur, gère la marque d'ordre d'octets, accepte l'UTF-8
 * comme le Latin-1, et **apparie les colonnes par leur en-tête plutôt que par
 * leur position** : une colonne ajoutée en cours d'année ne doit pas décaler
 * silencieusement toute la lecture d'un registre qui sert de preuve.
 */

export interface LigneCsv {
  [colonne: string]: string;
}

export interface ResultatLecture {
  lignes: LigneCsv[];
  colonnesTrouvees: string[];
  /** Colonnes documentées mais absentes du fichier reçu. */
  colonnesManquantes: string[];
  /** Colonnes présentes dans le fichier mais absentes de la spécification. */
  colonnesInattendues: string[];
}

const SEPARATEURS_CANDIDATS = [',', ';', '\t', '|'];

/** Détecte le séparateur d'après la ligne d'en-tête. */
export function detecterSeparateur(enTete: string): string {
  let meilleur = ',';
  let maximum = 0;
  for (const candidat of SEPARATEURS_CANDIDATS) {
    const compte = decouper(enTete, candidat).length;
    if (compte > maximum) {
      maximum = compte;
      meilleur = candidat;
    }
  }
  return meilleur;
}

/** Découpe une ligne CSV en respectant les guillemets et les doublements. */
export function decouper(ligne: string, separateur: string): string[] {
  const champs: string[] = [];
  let courant = '';
  let entreGuillemets = false;

  for (let i = 0; i < ligne.length; i += 1) {
    const caractere = ligne[i]!;

    if (entreGuillemets) {
      if (caractere === '"') {
        if (ligne[i + 1] === '"') {
          courant += '"';
          i += 1;
        } else {
          entreGuillemets = false;
        }
      } else {
        courant += caractere;
      }
      continue;
    }

    if (caractere === '"') {
      entreGuillemets = true;
    } else if (caractere === separateur) {
      champs.push(courant);
      courant = '';
    } else {
      courant += caractere;
    }
  }

  champs.push(courant);
  return champs;
}

/** Analyse un contenu CSV complet en respectant les sauts de ligne cités. */
export function analyserCsv(contenu: string, specification?: FichierReq): ResultatLecture {
  const texte = contenu.replace(/^﻿/, '');
  const lignesBrutes = separerLignes(texte);
  if (lignesBrutes.length === 0) {
    return { lignes: [], colonnesTrouvees: [], colonnesManquantes: [], colonnesInattendues: [] };
  }

  const separateur = detecterSeparateur(lignesBrutes[0]!);
  const enTetes = decouper(lignesBrutes[0]!, separateur).map((e) => e.trim().toUpperCase());

  const lignes: LigneCsv[] = [];
  for (let i = 1; i < lignesBrutes.length; i += 1) {
    const brute = lignesBrutes[i]!;
    if (brute.trim().length === 0) continue;

    const valeurs = decouper(brute, separateur);
    const ligne: LigneCsv = {};
    for (let j = 0; j < enTetes.length; j += 1) {
      ligne[enTetes[j]!] = (valeurs[j] ?? '').trim();
    }
    lignes.push(ligne);
  }

  const attendues = specification?.colonnes ?? [];
  return {
    lignes,
    colonnesTrouvees: enTetes,
    colonnesManquantes: attendues.filter((c) => !enTetes.includes(c)),
    colonnesInattendues: enTetes.filter((c) => attendues.length > 0 && !attendues.includes(c)),
  };
}

/** Sépare les lignes en tenant compte des sauts de ligne à l'intérieur de guillemets. */
function separerLignes(texte: string): string[] {
  const lignes: string[] = [];
  let courante = '';
  let entreGuillemets = false;

  for (let i = 0; i < texte.length; i += 1) {
    const caractere = texte[i]!;

    if (caractere === '"') {
      entreGuillemets = !entreGuillemets || texte[i + 1] === '"';
      if (entreGuillemets && texte[i + 1] === '"') i += 1;
      courante += caractere;
      continue;
    }

    if (!entreGuillemets && (caractere === '\n' || caractere === '\r')) {
      if (caractere === '\r' && texte[i + 1] === '\n') i += 1;
      lignes.push(courante);
      courante = '';
      continue;
    }

    courante += caractere;
  }

  if (courante.length > 0) lignes.push(courante);
  return lignes;
}

/**
 * Localise un fichier de l'archive dans un répertoire, quelle que soit sa casse
 * ou son extension, et le lit en décodant l'encodage réellement utilisé.
 */
export async function lireFichier(
  repertoire: string,
  specification: FichierReq,
): Promise<ResultatLecture | null> {
  const entrees = await readdir(repertoire);
  const cible = specification.nom.toLowerCase();

  const trouve = entrees.find((entree) => {
    const normalise = entree.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normalise === `${cible}csv` || normalise === cible;
  });
  if (!trouve) return null;

  const octets = await readFile(join(repertoire, trouve));
  return analyserCsv(decoder(octets), specification);
}

/**
 * Décode en UTF-8, et bascule en Latin-1 si le résultat contient le caractère
 * de remplacement — les exports gouvernementaux québécois sont encore souvent
 * en Windows-1252, et un « Québec » mal décodé casse tout appariement de nom.
 */
export function decoder(octets: Buffer): string {
  const utf8 = new TextDecoder('utf-8').decode(octets);
  if (!utf8.includes('�')) return utf8;
  return new TextDecoder('windows-1252').decode(octets);
}

/** Convertit une date du registre en `aaaa-mm-jj`, ou `undefined` si absente. */
export function normaliserDate(valeur: string | undefined): string | undefined {
  const brute = (valeur ?? '').trim();
  if (brute.length === 0) return undefined;

  // aaaa-mm-jj ou aaaa/mm/jj
  const iso = brute.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  // aaaammjj
  const compact = brute.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`;

  // jj-mm-aaaa ou jj/mm/aaaa
  const jourMois = brute.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (jourMois) return `${jourMois[3]}-${jourMois[2]}-${jourMois[1]}`;

  return undefined;
}

/** Interprète un indicateur du registre (`1`, `O`, `OUI`, `VRAI`, `Y`). */
export function normaliserIndicateur(valeur: string | undefined): boolean {
  const brute = (valeur ?? '').trim().toUpperCase();
  return brute === '1' || brute === 'O' || brute === 'OUI' || brute === 'VRAI' || brute === 'Y';
}
