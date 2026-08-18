// Valeurs de référence officielles vérifiées en août 2026 (Section 4 du devis)
// Stockées dans une table de paramètres modifiable, jamais codées en dur

export interface ParametresReference {
  TARIF_SUGGERE_OAGQ_2026_UNIFAMILIAL_URBAIN: number;
  TARIF_SUGGERE_OAGQ_2024: number;
  TARIF_IMPLANTATION_ET_CERTIFICAT: number;
  TARIF_PIQUETAGE_URBAIN_SIMPLE: number;
  TAUX_HORAIRE_JUNIOR: number;
  TAUX_HORAIRE_INTERMEDIAIRE: number;
  TAUX_HORAIRE_SENIOR: number;
  TAUX_HORAIRE_TERRAIN_1_PERS: number;
  TAUX_HORAIRE_RECHERCHE_DAO: number;
  DELAI_MARCHE_SEMAINES: [number, number];
  MEMBRES_OAGQ_2025_03_31: number;
  MEMBRES_OAGQ_2021_03_31: number;
  NOUVEAUX_MEMBRES_2024_2025: number;
  NOUVEAUX_MEMBRES_2020_2021: number;
  TRANSACTIONS_RESIDENTIELLES_QC_2025: number;
  PRIX_MEDIAN_UNIFAMILIALE_QC_2025: number;
  LOTS_CADASTRE_QUEBEC: number;
  ASSURANCE_TITRES_500K: [number, number];
  TOLERANCE_CADASTRE_POSITION_M: [number, number];
  TOLERANCE_CADASTRE_LINEAIRE_MAX_M: number;
  PRECISION_DRONE_RTK_HORIZ_M: [number, number];
  PRECISION_DRONE_RTK_VERT_M: [number, number];
  RESOLUTION_MNT_LIDAR_QC_M: number;
  VERIFICATIONS_NORME_TOTAL: number;
  VERIFICATIONS_DETERMINISTES: number;
  VERIFICATIONS_INTERPRETATIVES: number;
  PRIX_CIBLE_V1_ATTESTATION: number;
  PRIX_CIBLE_V2_MISE_A_JOUR: number;
  PRIX_CIBLE_V3_PRE_INSTRUIT: number;
  DELAI_CIBLE_V1_HEURES: [number, number];
}

export const REFERENCE_PARAMETERS: ParametresReference = {
  TARIF_SUGGERE_OAGQ_2026_UNIFAMILIAL_URBAIN: 1630, // $
  TARIF_SUGGERE_OAGQ_2024: 1550, // $ — pour la série temporelle
  TARIF_IMPLANTATION_ET_CERTIFICAT: 2374, // $
  TARIF_PIQUETAGE_URBAIN_SIMPLE: 1548, // $
  TAUX_HORAIRE_JUNIOR: 173, // $/h (0-5 ans)
  TAUX_HORAIRE_INTERMEDIAIRE: 248, // $/h (5-10 ans)
  TAUX_HORAIRE_SENIOR: 321, // $/h (10 ans +)
  TAUX_HORAIRE_TERRAIN_1_PERS: 173, // $/h
  TAUX_HORAIRE_RECHERCHE_DAO: 158, // $/h
  DELAI_MARCHE_SEMAINES: [4, 8],
  MEMBRES_OAGQ_2025_03_31: 1084,
  MEMBRES_OAGQ_2021_03_31: 1135,
  NOUVEAUX_MEMBRES_2024_2025: 19,
  NOUVEAUX_MEMBRES_2020_2021: 35,
  TRANSACTIONS_RESIDENTIELLES_QC_2025: 97214,
  PRIX_MEDIAN_UNIFAMILIALE_QC_2025: 491500, // $
  LOTS_CADASTRE_QUEBEC: 3800000,
  ASSURANCE_TITRES_500K: [250, 400], // $
  TOLERANCE_CADASTRE_POSITION_M: [0.15, 0.30],
  TOLERANCE_CADASTRE_LINEAIRE_MAX_M: 0.42,
  PRECISION_DRONE_RTK_HORIZ_M: [0.02, 0.03],
  PRECISION_DRONE_RTK_VERT_M: [0.03, 0.06],
  RESOLUTION_MNT_LIDAR_QC_M: 1,
  VERIFICATIONS_NORME_TOTAL: 23,
  VERIFICATIONS_DETERMINISTES: 19,
  VERIFICATIONS_INTERPRETATIVES: 4,
  PRIX_CIBLE_V1_ATTESTATION: 120,
  PRIX_CIBLE_V2_MISE_A_JOUR: 450,
  PRIX_CIBLE_V3_PRE_INSTRUIT: 780,
  DELAI_CIBLE_V1_HEURES: [24, 72],
};

export const QUATRE_PHRASES_FONDATRICES = [
  {
    id: 1,
    texte: "« Il n'y a pas de lois ou de règlements qui rendraient un certificat de localisation caduc ou périmé. »",
    auteur: "Ordre des arpenteurs-géomètres du Québec (OAGQ)",
    sourceUrl: "https://oagq.qc.ca/grand-public/situations-communes/duree-de-vie-du-certificat-de-localisation/",
    contexte: "Précision officielle de l'Ordre quant à l'absence de validité temporelle fixe.",
  },
  {
    id: 2,
    texte: "Le seuil de 10 ans provient de consignes internes de la Chambre des notaires du Québec et de l'OACIQ à leurs membres. Ce n'est pas une loi.",
    auteur: "Analyse juridique & Pratique notariale québécoise",
    sourceUrl: "https://cnq.org",
    contexte: "Distinction fondamentale entre coutume corporative et droit statutaire québécois.",
  },
  {
    id: 3,
    texte: "BORNE est un outil d'aide à la décision. Seul un arpenteur-géomètre peut produire un certificat de localisation.",
    auteur: "Loi sur les arpenteurs-géomètres (RLRQ c. A-23, art. 34-36)",
    sourceUrl: "https://www.legisquebec.gouv.qc.ca/fr/document/cs/A-23",
    contexte: "Garantie absolue du respect de l'acte professionnel réservé.",
  },
  {
    id: 4,
    texte: "Ce qui a déjà été mesuré n'a pas à être remesuré.",
    auteur: "Signature & Doctrine BORNE",
    sourceUrl: "",
    contexte: "Principe fondamental d'efficience et de continuité informationnelle foncière.",
  },
];

export const CE_QUE_BORNE_NE_FERA_JAMAIS = [
  {
    id: 1,
    titre: "Produire un certificat sans arpenteur",
    description: "Produire un certificat de localisation sans arpenteur-géomètre signataire dument inscrit au tableau de l'OAGQ.",
  },
  {
    id: 2,
    titre: "Signature automatisée interdite",
    description: "Apposer un sceau ou une signature professionnelle par voie automatisée ou algorithmique.",
  },
  {
    id: 3,
    titre: "Aucune opinion sur les servitudes apparentes non publiées",
    description: "Émettre une opinion sur une servitude apparente non publiée ou sur la qualification juridique d'un empiètement.",
  },
  {
    id: 4,
    titre: "Pas de déduction de limite par superposition",
    description: "Déduire une limite de propriété par superposition cadastre + orthophoto — le cadastre indique les limites, il ne les détermine pas.",
  },
  {
    id: 5,
    titre: "Règle stricte n ≥ 100 et anonymat n ≥ 20",
    description: "Publier une donnée de qualité sous n = 100, ou une statistique de refus identifiant une firme sous n = 20.",
  },
  {
    id: 6,
    titre: "Aucune note subjective ou diffamation",
    description: "Nommer, noter subjectivement (étoiles, avis) ou classer un professionnel autrement que par des données factuelles vérifiables et des sources publiques.",
  },
  {
    id: 7,
    titre: "Zéro revente de données personnelles",
    description: "Revendre des données personnelles. Conformité intégrale avec la Loi 25 et hébergement souverain au Québec.",
  },
  {
    id: 8,
    titre: "Jamais de facturation pour un diagnostic négatif",
    description: "Facturer un citoyen pour lui apprendre qu'il n'a pas besoin de payer (le diagnostic de validité reste gratuit à vie).",
  },
  {
    id: 9,
    titre: "Information pure, pas de conseil d'insoumission",
    description: "Conseiller à un citoyen de passer outre l'exigence d'un notaire ou d'un prêteur — BORNE informe et documente avec rigueur, l'utilisateur décide.",
  },
];
