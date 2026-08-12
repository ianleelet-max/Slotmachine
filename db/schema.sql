-- AudiTREQ — schéma relationnel (MVP)
-- Dérivé de docs/auditreq/04-modele-donnees.md.
--
-- Principe structurant : toute relation issue du registre porte l'avis REQ qui
-- l'atteste. Les tables de travail (dossiers, annotations, journal) sont
-- séparées des données publiques mises en cache, ce qui matérialise la
-- frontière multi-tenant.

BEGIN;

DROP SCHEMA IF EXISTS auditreq CASCADE;
CREATE SCHEMA auditreq;
SET search_path TO auditreq;

-- --------------------------------------------------------------------------
-- Données publiques issues du registre
-- --------------------------------------------------------------------------

CREATE TABLE avis_req (
    id               text PRIMARY KEY,
    type_avis        text NOT NULL,
    date_publication date NOT NULL,
    url_source       text,
    contenu_brut     jsonb
);

CREATE TABLE entite (
    id                 text PRIMARY KEY,
    neq                text NOT NULL UNIQUE,
    nom_legal          text NOT NULL,
    noms_anterieurs    text[] NOT NULL DEFAULT '{}',
    forme_juridique    text NOT NULL,
    statut             text NOT NULL,
    code_naics         text,
    date_constitution  date NOT NULL,
    date_dissolution   date,
    structure_connue   boolean NOT NULL DEFAULT false,
    -- Cache du score : la source de vérité reste la table red_flag, ce champ
    -- est recalculé à chaque réanalyse pour permettre le tri en recherche.
    score_risque       integer,
    niveau_risque      text,
    CONSTRAINT entite_dissolution_coherente
        CHECK (date_dissolution IS NULL OR date_dissolution >= date_constitution)
);

CREATE INDEX entite_nom_idx ON entite (lower(nom_legal));
CREATE INDEX entite_statut_idx ON entite (statut);
CREATE INDEX entite_score_idx ON entite (score_risque DESC NULLS LAST);

CREATE TABLE personne (
    id                        text PRIMARY KEY,
    nom_complet               text NOT NULL,
    variantes_nom             text[] NOT NULL DEFAULT '{}',
    -- 1 = identité non ambiguë ; en deçà, la fiche reste distincte et un lien
    -- « possible même personne » est proposé sans fusion automatique.
    score_confiance_identite  numeric(3,2) NOT NULL DEFAULT 1.00
        CHECK (score_confiance_identite BETWEEN 0 AND 1)
);

CREATE INDEX personne_nom_idx ON personne (lower(nom_complet));

CREATE TABLE adresse (
    id                    text PRIMARY KEY,
    adresse_normalisee    text NOT NULL,
    code_postal           text,
    -- Domiciliataire commercial ou cabinet : une forte densité y est attendue.
    domiciliataire_connu  boolean NOT NULL DEFAULT false
);

CREATE TABLE relation_detention (
    id                 text PRIMARY KEY,
    source_entite_id   text REFERENCES entite (id) ON DELETE CASCADE,
    source_personne_id text REFERENCES personne (id) ON DELETE CASCADE,
    cible_entite_id    text NOT NULL REFERENCES entite (id) ON DELETE CASCADE,
    pourcentage        numeric(5,4) NOT NULL CHECK (pourcentage > 0 AND pourcentage <= 1),
    type_titre         text,
    depuis             date NOT NULL,
    jusqu_a            date,
    avis_req_id        text NOT NULL REFERENCES avis_req (id),
    -- Un détenteur est soit une entité, soit une personne — jamais les deux,
    -- jamais aucun.
    CONSTRAINT detention_source_unique CHECK (
        (source_entite_id IS NOT NULL AND source_personne_id IS NULL)
        OR (source_entite_id IS NULL AND source_personne_id IS NOT NULL)
    ),
    CONSTRAINT detention_periode_coherente CHECK (jusqu_a IS NULL OR jusqu_a >= depuis)
);

CREATE INDEX detention_cible_idx ON relation_detention (cible_entite_id);
CREATE INDEX detention_source_entite_idx ON relation_detention (source_entite_id);
CREATE INDEX detention_source_personne_idx ON relation_detention (source_personne_id);

CREATE TABLE relation_administration (
    id          text PRIMARY KEY,
    personne_id text NOT NULL REFERENCES personne (id) ON DELETE CASCADE,
    entite_id   text NOT NULL REFERENCES entite (id) ON DELETE CASCADE,
    titre       text NOT NULL,
    depuis      date NOT NULL,
    jusqu_a     date,
    avis_req_id text NOT NULL REFERENCES avis_req (id),
    CONSTRAINT administration_periode_coherente CHECK (jusqu_a IS NULL OR jusqu_a >= depuis)
);

CREATE INDEX administration_entite_idx ON relation_administration (entite_id);
CREATE INDEX administration_personne_idx ON relation_administration (personne_id);

CREATE TABLE lien_adresse (
    id          text PRIMARY KEY,
    adresse_id  text NOT NULL REFERENCES adresse (id) ON DELETE CASCADE,
    entite_id   text REFERENCES entite (id) ON DELETE CASCADE,
    personne_id text REFERENCES personne (id) ON DELETE CASCADE,
    type_lien   text NOT NULL,
    depuis      date NOT NULL,
    jusqu_a     date,
    CONSTRAINT lien_adresse_cible_unique CHECK (
        (entite_id IS NOT NULL AND personne_id IS NULL)
        OR (entite_id IS NULL AND personne_id IS NOT NULL)
    )
);

CREATE INDEX lien_adresse_adresse_idx ON lien_adresse (adresse_id);
CREATE INDEX lien_adresse_entite_idx ON lien_adresse (entite_id);

CREATE TABLE evenement (
    id             text PRIMARY KEY,
    entite_id      text NOT NULL REFERENCES entite (id) ON DELETE CASCADE,
    type           text NOT NULL,
    date_effective date NOT NULL,
    description    text NOT NULL,
    avis_req_id    text NOT NULL REFERENCES avis_req (id)
);

CREATE INDEX evenement_entite_idx ON evenement (entite_id, date_effective);

-- Propositions de rapprochement d'identité : jamais une fusion destructive.
CREATE TABLE resolution_identite (
    id                text PRIMARY KEY,
    personne_a_id     text NOT NULL REFERENCES personne (id) ON DELETE CASCADE,
    personne_b_id     text NOT NULL REFERENCES personne (id) ON DELETE CASCADE,
    score_similarite  numeric(3,2) NOT NULL CHECK (score_similarite BETWEEN 0 AND 1),
    statut            text NOT NULL DEFAULT 'proposee'
        CHECK (statut IN ('proposee', 'validee', 'rejetee')),
    valide_par        text,
    valide_le         timestamptz,
    CONSTRAINT resolution_paire_distincte CHECK (personne_a_id <> personne_b_id)
);

-- --------------------------------------------------------------------------
-- Résultats d'analyse (recalculables à tout moment depuis les données ci-dessus)
-- --------------------------------------------------------------------------

CREATE TABLE red_flag (
    id                    bigserial PRIMARY KEY,
    entite_id             text NOT NULL REFERENCES entite (id) ON DELETE CASCADE,
    type_regle            text NOT NULL,
    severite              text NOT NULL CHECK (severite IN ('info', 'faible', 'moyen', 'eleve')),
    explication           text NOT NULL,
    -- Entités, personnes, relations et avis qui ont déclenché la règle : c'est
    -- ce qui rend le signal vérifiable plutôt que déclaratif.
    elements_declencheurs jsonb NOT NULL,
    statut_revue          text NOT NULL DEFAULT 'non_revu'
        CHECK (statut_revue IN ('non_revu', 'confirme', 'faux_positif')),
    revu_par              text,
    calcule_le            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX red_flag_entite_idx ON red_flag (entite_id);
CREATE INDEX red_flag_type_idx ON red_flag (type_regle);

-- --------------------------------------------------------------------------
-- Travail des cabinets — cloisonné des données publiques
-- --------------------------------------------------------------------------

CREATE TABLE cabinet (
    id                 text PRIMARY KEY,
    nom                text NOT NULL,
    type_professionnel text NOT NULL
);

CREATE TABLE utilisateur (
    id             text PRIMARY KEY,
    cabinet_id     text NOT NULL REFERENCES cabinet (id) ON DELETE CASCADE,
    courriel       text NOT NULL UNIQUE,
    nom_complet    text NOT NULL,
    role           text NOT NULL CHECK (role IN ('admin', 'senior', 'professionnel', 'lecteur')),
    persona_defaut text NOT NULL DEFAULT 'professionnel',
    mfa_actif      boolean NOT NULL DEFAULT true
);

CREATE TABLE dossier (
    id                text PRIMARY KEY,
    cabinet_id        text NOT NULL REFERENCES cabinet (id) ON DELETE CASCADE,
    nom               text NOT NULL,
    client            text,
    -- Finalité déclarée : exigée à l'ouverture, elle documente la base légale
    -- du traitement (Loi 25) et apparaît au journal d'accès.
    finalite_declaree text NOT NULL,
    mode              text NOT NULL DEFAULT 'audit_approfondi'
        CHECK (mode IN ('investigation_rapide', 'audit_approfondi')),
    statut            text NOT NULL DEFAULT 'actif'
        CHECK (statut IN ('actif', 'clos', 'archive')),
    echeance          date,
    cree_le           timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE dossier_entite (
    dossier_id text NOT NULL REFERENCES dossier (id) ON DELETE CASCADE,
    entite_id  text NOT NULL REFERENCES entite (id) ON DELETE CASCADE,
    ajoute_le  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (dossier_id, entite_id)
);

CREATE TABLE annotation (
    id                 bigserial PRIMARY KEY,
    dossier_id         text NOT NULL REFERENCES dossier (id) ON DELETE CASCADE,
    auteur_id          text NOT NULL REFERENCES utilisateur (id),
    entite_cible_id    text REFERENCES entite (id) ON DELETE CASCADE,
    personne_cible_id  text REFERENCES personne (id) ON DELETE CASCADE,
    relation_cible_id  text,
    contenu            text NOT NULL,
    cree_le            timestamptz NOT NULL DEFAULT now(),
    modifie_le         timestamptz
);

CREATE INDEX annotation_dossier_idx ON annotation (dossier_id);

-- Journal en ajout seul : sa valeur probante tient à ce qu'on ne puisse pas
-- le réécrire après coup.
CREATE TABLE journal_acces (
    id             bigserial PRIMARY KEY,
    utilisateur_id text REFERENCES utilisateur (id),
    dossier_id     text REFERENCES dossier (id) ON DELETE SET NULL,
    action         text NOT NULL,
    finalite       text,
    contexte       jsonb,
    horodate       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX journal_acces_utilisateur_idx ON journal_acces (utilisateur_id, horodate DESC);

CREATE RULE journal_acces_sans_modification AS
    ON UPDATE TO journal_acces DO INSTEAD NOTHING;
CREATE RULE journal_acces_sans_suppression AS
    ON DELETE TO journal_acces DO INSTEAD NOTHING;

COMMIT;
