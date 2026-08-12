import { creerServeur } from './serveur.js';

const port = Number(process.env.PORT ?? 3001);
const app = await creerServeur();

try {
  await app.listen({ port, host: '0.0.0.0' });
} catch (erreur) {
  app.log.error(erreur);
  process.exit(1);
}
