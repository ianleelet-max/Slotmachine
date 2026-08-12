import { creerServeur } from './serveur.js';

const port = Number(process.env.PORT ?? 3001);

/**
 * L'API n'écoute que sur la boucle locale par défaut.
 *
 * Exposer sur `0.0.0.0` doit être un geste délibéré : un outil qui manipule
 * des dossiers d'audit couverts par le secret professionnel ne doit pas
 * devenir joignable sur le réseau par simple inadvertance.
 */
const hote = process.env.HOTE ?? '127.0.0.1';
const app = await creerServeur();

try {
  await app.listen({ port, host: hote });
  if (hote !== '127.0.0.1' && hote !== 'localhost') {
    app.log.warn(
      `API exposée sur ${hote} — vérifiez que l'accès est restreint (voir DEPLOIEMENT.md).`,
    );
  }
} catch (erreur) {
  app.log.error(erreur);
  process.exit(1);
}
