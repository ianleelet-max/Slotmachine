import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { hacherMotDePasse, verifierMotDePasse, empreinteJeton } from './authentification.js';

describe('hachage des mots de passe', () => {
  test('un mot de passe correct est reconnu', async () => {
    const encode = await hacherMotDePasse('Mot de passe d’essai 123');
    assert.equal(await verifierMotDePasse('Mot de passe d’essai 123', encode), true);
  });

  test('un mot de passe erroné est rejeté', async () => {
    const encode = await hacherMotDePasse('Mot de passe d’essai 123');
    assert.equal(await verifierMotDePasse('Mot de passe d’essai 124', encode), false);
    assert.equal(await verifierMotDePasse('', encode), false);
  });

  test('deux hachages du même mot de passe diffèrent', async () => {
    // Le sel est aléatoire : deux comptes partageant un mot de passe ne doivent
    // pas se reconnaître à leur empreinte en base.
    const a = await hacherMotDePasse('identique');
    const b = await hacherMotDePasse('identique');
    assert.notEqual(a, b);
    assert.equal(await verifierMotDePasse('identique', a), true);
    assert.equal(await verifierMotDePasse('identique', b), true);
  });

  test('les paramètres de coût sont inscrits dans l’empreinte', async () => {
    const encode = await hacherMotDePasse('x');
    const [algorithme, n, r, p, sel, cle] = encode.split('$');
    assert.equal(algorithme, 'scrypt');
    assert.equal(Number(n), 16384);
    assert.equal(Number(r), 8);
    assert.equal(Number(p), 1);
    assert.equal(sel!.length, 32);
    assert.equal(cle!.length, 128);
  });

  test('les formes Unicode équivalentes sont acceptées', async () => {
    // « é » composé et décomposé se ressemblent à l'écran mais diffèrent en
    // octets : sans normalisation, un mot de passe saisi sur un autre clavier
    // échouerait sans explication.
    const compose = 'Cléôme';
    const decompose = 'Cléôme';
    assert.notEqual(compose, decompose);
    const encode = await hacherMotDePasse(compose);
    assert.equal(await verifierMotDePasse(decompose, encode), true);
  });

  test('une empreinte malformée est rejetée sans lever d’exception', async () => {
    for (const invalide of ['', 'nimporte-quoi', 'scrypt$1$2$3', 'bcrypt$1$2$3$4$5']) {
      assert.equal(await verifierMotDePasse('x', invalide), false, invalide);
    }
  });
});

describe('empreinte des jetons de session', () => {
  test('l’empreinte est stable et ne révèle pas le jeton', () => {
    const jeton = 'a'.repeat(64);
    const empreinte = empreinteJeton(jeton);
    assert.equal(empreinte, empreinteJeton(jeton));
    assert.equal(empreinte.length, 64);
    assert.notEqual(empreinte, jeton);
  });

  test('deux jetons distincts ont des empreintes distinctes', () => {
    assert.notEqual(empreinteJeton('jeton-a'), empreinteJeton('jeton-b'));
  });
});
