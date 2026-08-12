/**
 * Normalisation et comparaison de noms — utilisées par la recherche floue et
 * par les règles qui rapprochent des dénominations proches (dissolution puis
 * reconstitution sous un nom voisin, par exemple).
 */

const SUFFIXES_JURIDIQUES = [
  'inc',
  'incorporee',
  'ltee',
  'ltd',
  'limitee',
  'limited',
  'corp',
  'corporation',
  'senc',
  's e n c',
  'sencrl',
  'sec',
  's e c',
  'cie',
  'compagnie',
  'co',
  'enr',
  'srl',
  'llc',
];

/** Retire accents, ponctuation et casse pour comparer des chaînes du registre. */
export function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Normalise puis retire les suffixes de forme juridique (« inc. », « ltée »). */
export function normaliserNomLegal(nom: string): string {
  const base = normaliser(nom);
  const jetons = base.split(' ').filter(Boolean);
  while (jetons.length > 1) {
    const dernier = jetons[jetons.length - 1]!;
    if (!SUFFIXES_JURIDIQUES.includes(dernier)) break;
    jetons.pop();
  }
  return jetons.join(' ');
}

/** Distance d'édition de Levenshtein, implémentation à deux lignes de travail. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let precedente = Array.from({ length: b.length + 1 }, (_, i) => i);
  let courante = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    courante[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cout = a[i - 1] === b[j - 1] ? 0 : 1;
      courante[j] = Math.min(
        precedente[j]! + 1,
        courante[j - 1]! + 1,
        precedente[j - 1]! + cout,
      );
    }
    [precedente, courante] = [courante, precedente];
  }

  return precedente[b.length]!;
}

/** Similarité 0–1 dérivée de la distance d'édition. */
export function similariteEdition(a: string, b: string): number {
  const max = Math.max(a.length, b.length);
  if (max === 0) return 1;
  return 1 - levenshtein(a, b) / max;
}

/**
 * Similarité de Jaro-Winkler : plus tolérante que Levenshtein sur les
 * variations de prénoms et les inversions, ce qui convient aux noms de
 * personnes du registre.
 */
export function jaroWinkler(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const fenetre = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
  const aApparie = new Array<boolean>(a.length).fill(false);
  const bApparie = new Array<boolean>(b.length).fill(false);
  let appariements = 0;

  for (let i = 0; i < a.length; i += 1) {
    const debut = Math.max(0, i - fenetre);
    const fin = Math.min(i + fenetre + 1, b.length);
    for (let j = debut; j < fin; j += 1) {
      if (bApparie[j] || a[i] !== b[j]) continue;
      aApparie[i] = true;
      bApparie[j] = true;
      appariements += 1;
      break;
    }
  }

  if (appariements === 0) return 0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < a.length; i += 1) {
    if (!aApparie[i]) continue;
    while (!bApparie[k]) k += 1;
    if (a[i] !== b[k]) transpositions += 1;
    k += 1;
  }

  const m = appariements;
  const jaro = (m / a.length + m / b.length + (m - transpositions / 2) / m) / 3;

  let prefixe = 0;
  while (prefixe < 4 && prefixe < a.length && prefixe < b.length && a[prefixe] === b[prefixe]) {
    prefixe += 1;
  }

  return jaro + prefixe * 0.1 * (1 - jaro);
}

/** Recouvrement de jetons (indice de Jaccard) entre deux dénominations. */
export function recouvrementJetons(a: string, b: string): number {
  const ja = new Set(a.split(' ').filter(Boolean));
  const jb = new Set(b.split(' ').filter(Boolean));
  if (ja.size === 0 || jb.size === 0) return 0;
  let communs = 0;
  for (const jeton of ja) if (jb.has(jeton)) communs += 1;
  return communs / (ja.size + jb.size - communs);
}

/**
 * Similarité de dénominations sociales, suffixes juridiques neutralisés.
 *
 * On combine distance d'édition et recouvrement de jetons — le premier capte
 * les fautes de frappe (« Lavallée » / « Lavalée »), le second l'inversion de
 * mots (« Placements Rive-Nord » / « Rive-Nord Placements »). Jaro-Winkler est
 * délibérément écarté ici : sur des raisons sociales, il attribue plus de 0,5
 * à des noms sans rapport, ce qui ferait dériver les règles qui s'appuient sur
 * ce score.
 */
export function similariteNomLegal(a: string, b: string): number {
  const na = normaliserNomLegal(a);
  const nb = normaliserNomLegal(b);
  if (na === nb) return 1;
  return Math.max(similariteEdition(na, nb), recouvrementJetons(na, nb));
}

/** Similarité de noms de personnes, tolérante aux variantes de prénom. */
export function similariteNomPersonne(a: string, b: string): number {
  return jaroWinkler(normaliser(a), normaliser(b));
}
