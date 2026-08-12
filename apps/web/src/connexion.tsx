import { useState, type FormEvent } from 'react';

import { apiAuth, type UtilisateurConnecte } from './api';

/**
 * Écran de connexion.
 *
 * Il ne dit jamais si un courriel existe : « Identifiants invalides » couvre
 * les deux cas, comme le fait le serveur. Distinguer les deux messages
 * transformerait le formulaire en outil d'énumération des comptes du cabinet.
 */
export function EcranConnexion({ onConnecte }: { onConnecte: (u: UtilisateurConnecte) => void }) {
  const [courriel, setCourriel] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      const { utilisateur } = await apiAuth.connexion(courriel, motDePasse);
      onConnecte(utilisateur);
    } catch (e) {
      setErreur((e as Error).message);
      setMotDePasse('');
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="connexion">
      <form className="carte connexion-carte" onSubmit={soumettre}>
        <div className="marque" style={{ marginBottom: 16 }}>
          <span className="pastille" />
          AudiTREQ
        </div>

        <h1 style={{ fontSize: 16, marginBottom: 4 }}>Connexion</h1>
        <p className="sourdine" style={{ marginTop: 0 }}>
          Accès réservé aux professionnels autorisés du cabinet. Chaque consultation est inscrite
          au journal d’accès.
        </p>

        <div className="champ">
          <label htmlFor="courriel">Courriel</label>
          <input
            id="courriel"
            type="email"
            autoComplete="username"
            value={courriel}
            onChange={(e) => setCourriel(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="champ">
          <label htmlFor="motdepasse">Mot de passe</label>
          <input
            id="motdepasse"
            type="password"
            autoComplete="current-password"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
          />
        </div>

        {erreur && <p className="alerte">{erreur}</p>}

        <button className="bouton primaire" type="submit" disabled={envoi} style={{ width: '100%' }}>
          {envoi ? 'Vérification…' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
