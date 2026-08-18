import React, { useState } from 'react';
import { 
  TrendingDown, DollarSign, ShieldCheck, Cpu, Users, Award, 
  ChevronRight, ChevronLeft, Zap, Lock, PieChart, ArrowUpRight, CheckCircle2,
  PhoneOff, AlertOctagon, ShieldAlert
} from 'lucide-react';
import { SlidePitch } from '../types/sursitrack';

const SLIDES: SlidePitch[] = [
  {
    id: 1,
    titre: "L'Obsolescence Critique des Contrôles par Ligne Fixe",
    sousTitre: "La fin des lignes filaires traditionnelles et l'illusion de la téléphonie IP (VoIP)",
    categorie: "probleme",
    chiffreCle: "0 %",
    chiffreLabel: "Garantie de localisation réelle via un appel téléphonique fixe moderne",
    pointsCles: [
      "Disparition des lignes cuivres terrestres : La téléphonie IP (VoIP/SIP) est désormais la norme universelle chez tous les grands fournisseurs (Bell, Vidéotron, Telus)",
      "Absence d'exactitude géographique : Une ligne fixe IP peut être transférée à distance, relayée sur mobile ou gérée par adaptateur VoIP depuis n'importe quel endroit",
      "Surcharge de travail stérile : Les vérifications téléphoniques traditionnelles créent une lourde charge administrative pour les agents basés sur une fausse impression de certitude"
    ],
    quoteExecutif: "Continuer à valider la présence par téléphone fixe relève d'une méthode dépassée qui n'offre plus aucune valeur légale ou preuve de présence physique."
  },
  {
    id: 2,
    titre: "Le Défi Financier & Matériel des Bracelets Physiques",
    sousTitre: "Des coûts exorbitants pour des balises encombrantes et stigmatisantes",
    categorie: "probleme",
    chiffreCle: "11,800 $",
    chiffreLabel: "Coût moyen annuel par bracelet physique traditionnel",
    pointsCles: [
      "Stigmatisation sociale freinant la réinsertion professionnelle des sursitaires",
      "Surcharge de visites terrain et appels manuels inutiles pour les agents de probation",
      "Angles morts géographiques et faux positifs fréquents des balises matérielles anciennes génération"
    ],
    quoteExecutif: "Le MSP a besoin d'une solution moderne, économique et alignée sur la numérisation des services publics."
  },
  {
    id: 3,
    titre: "La Solution SursiTrack : Surveillance Biométrique BYOD",
    sousTitre: "La preuve irréfutable de présence physique sur téléphone personnel",
    categorie: "solution",
    chiffreCle: "88 %",
    chiffreLabel: "Réduction directe des coûts de suivi d'encadrement",
    pointsCles: [
      "Vérification d'identité faciale 3D avec preuve hachée SHA-256 infalsifiable",
      "Géofencing dynamique ultra-précis : validation GPS en temps réel sans intermédiaire filaire",
      "Zéro équipement matériel à fournir, remplacer ou entretenir pour le Ministère"
    ],
    quoteExecutif: "Aucune stigmatisation visuelle, une adhésion accrue et un taux de conformité supérieur à 94%."
  },
  {
    id: 4,
    titre: "Intégration Native dans le Programme Horizon",
    sousTitre: "Le maillon manquant pour enrichir le Dossier Unique Correctionnel (Projets 3 & 4)",
    categorie: "horizon",
    chiffreCle: "20h /sem",
    chiffreLabel: "Gain de temps moyen par agent de probation",
    pointsCles: [
      "Projet 3 (Prise en charge) : Suivi automatique de la présence aux programmes de réinsertion",
      "Projet 4 (Évaluation) : Matrice de risque RTM mise à jour en temps réel selon les données terrain",
      "Tableau de bord unifié 360° sans avoir à basculer d'outil informatique"
    ],
    quoteExecutif: "Une vision 360° complète combinant le dossier légal et le monitoring terrain en temps réel."
  },
  {
    id: 5,
    titre: "Conformité Légale & Sécurité des Données (Québec)",
    sousTitre: "Aligné à 100% sur la Loi 25 et le Cadre commun d'interopérabilité",
    categorie: "securite",
    chiffreCle: "100 % QC",
    chiffreLabel: "Hébergement des données à Montréal (AWS CA-East)",
    pointsCles: [
      "Hachage SHA-256 local de la biométrie : la photo originale ne quitte jamais le téléphone",
      "Horodatage certifié et registre d'audit infalsifiable pour la justice",
      "Évaluation des facteurs relatifs à la vie privée (EFVP) conforme aux normes du gouvernement"
    ],
    quoteExecutif: "Une sécurité de grade gouvernemental garantissant le respect strict des droits et de la vie privée."
  }
];

export const PitchDeckMSP: React.FC = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [nombreSursitaires, setNombreSursitaires] = useState(500);

  const slideActuelle = SLIDES[slideIndex];

  // Calculs financiers dynamiques ROI
  const coutBraceletAn = 11800;
  const coutSursiTrackAn = 1400;
  const coutTotalActuel = nombreSursitaires * coutBraceletAn;
  const coutTotalSursiTrack = nombreSursitaires * coutSursiTrackAn;
  const economieAnnuelle = coutTotalActuel - coutTotalSursiTrack;
  const pourcentageEconomie = Math.round((economieAnnuelle / coutTotalActuel) * 100);

  return (
    <div className="space-y-8">
      
      {/* En-tête spécial Présentation Exécutive */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-cyan-950/60 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="px-3 py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20 uppercase tracking-wide">
              DOSSIER DE PRÉSENTATION EXÉCUTIVE — MSP
            </span>
            <span className="text-xs text-slate-400 font-mono">Dernière révision : Avril 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Plateforme SursiTrack + Horizon Québec
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Proposition d'intégration technologique au Programme Horizon du Ministère de la Sécurité publique.
          </p>
        </div>

        {/* Contrôles du Slide Deck */}
        <div className="flex items-center space-x-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
          <button
            onClick={() => setSlideIndex((prev) => Math.max(0, prev - 1))}
            disabled={slideIndex === 0}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold font-mono px-3 text-cyan-400">
            Slide {slideIndex + 1} / {SLIDES.length}
          </span>
          <button
            onClick={() => setSlideIndex((prev) => Math.min(SLIDES.length - 1, prev + 1))}
            disabled={slideIndex === SLIDES.length - 1}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slide Visualiseur Principal */}
      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 relative overflow-hidden min-h-[440px] flex flex-col justify-between">
        
        {/* Glow de fond selon la catégorie */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6 z-10">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/60">
              MODULE PITCH #{slideActuelle.id} — {slideActuelle.categorie.toUpperCase()}
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {slideActuelle.titre}
            </h2>
            <p className="text-base sm:text-lg text-cyan-300 font-medium mt-2">
              {slideActuelle.sousTitre}
            </p>
          </div>

          {/* Grille de contenu : Points clés + Chiffre Choc */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-2">
            
            {/* Points clés (7/12) */}
            <div className="md:col-span-7 space-y-3">
              {slideActuelle.pointsCles.map((pt, i) => (
                <div key={i} className="flex items-start space-x-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                  <div className="p-1 rounded-lg bg-cyan-950 text-cyan-400 mt-0.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{pt}</p>
                </div>
              ))}
            </div>

            {/* Grande Métrique Impact (5/12) */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950/60 border border-slate-800 text-center">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">Métrique Clé</span>
              <p className="text-4xl sm:text-6xl font-black text-cyan-400 font-mono tracking-tight">
                {slideActuelle.chiffreCle}
              </p>
              <p className="text-xs text-slate-300 mt-2 max-w-xs leading-normal">
                {slideActuelle.chiffreLabel}
              </p>
            </div>

          </div>
        </div>

        {/* Encadré d'Accentuation Stratégique Téléphonie IP */}
        {slideActuelle.id === 1 && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-950/30 border border-rose-800/60 text-xs text-rose-200 flex items-start space-x-3">
            <PhoneOff className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-rose-300 mb-0.5">Constat Stratégique pour le MSP :</strong>
              <span>
                La téléphonie résidentielle filaire n'existe pratiquement plus. Les appels téléphoniques fixes transitant désormais par la VoIP (IP), un sursitaire peut aisément dévier ses appels à distance sans aucune preuve de présence physique réelle. Ce mode de contrôle constitue une tâche administrative obsolète et inefficace.
              </span>
            </div>
          </div>
        )}

        {/* Citation Exécutive en Bas de Slide */}
        {slideActuelle.quoteExecutif && (
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 italic">
            <span>« {slideActuelle.quoteExecutif} »</span>
            <span className="font-mono text-cyan-400 font-semibold not-italic">SursiTrack Québec</span>
          </div>
        )}
      </div>

      {/* SECTION B : CALCULATEUR DYNAMIQUE ROI / ÉCONOMIES BUDGETAIRES POUR LE PITCH */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Simulateur d’Économies Budgétaires Directes (MSP)</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Ajustez le nombre de sursitaires sous suivi pour visualiser les retombées financières.
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 font-mono text-sm font-bold">
            {pourcentageEconomie}% d'économie directe
          </div>
        </div>

        {/* Slider du nombre de sursitaires */}
        <div className="space-y-3 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
          <div className="flex justify-between items-center text-sm font-bold">
            <span className="text-slate-300">Volume de sursitaires sous surveillance :</span>
            <span className="text-cyan-400 font-mono text-xl">{nombreSursitaires.toLocaleString()} sursitaires</span>
          </div>
          <input
            type="range"
            min="100"
            max="2500"
            step="50"
            value={nombreSursitaires}
            onChange={(e) => setNombreSursitaires(Number(e.target.value))}
            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>100 (Pilote initial)</span>
            <span>1 000 (Déploiement régional)</span>
            <span>2 500 (Échelle nationale QC)</span>
          </div>
        </div>

        {/* Comparatif des Coûts : Bracelet physique vs SursiTrack */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-800/40 text-center space-y-1">
            <p className="text-xs text-rose-300 font-semibold uppercase">Système Bracelet Traditionnel</p>
            <p className="text-2xl font-bold font-mono text-rose-400">
              {(coutTotalActuel / 1000000).toFixed(2)} M$ / an
            </p>
            <p className="text-[11px] text-slate-400">11 800 $ par sursitaire / an</p>
          </div>

          <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-800/50 text-center space-y-1">
            <p className="text-xs text-cyan-300 font-semibold uppercase">Solution SursiTrack + Horizon</p>
            <p className="text-2xl font-bold font-mono text-cyan-400">
              {(coutTotalSursiTrack / 1000000).toFixed(2)} M$ / an
            </p>
            <p className="text-[11px] text-slate-400">1 400 $ par sursitaire / an</p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-center space-y-1">
            <p className="text-xs text-emerald-300 font-bold uppercase">Économie Nette pour le MSP</p>
            <p className="text-3xl font-black font-mono text-emerald-400">
              +{(economieAnnuelle / 1000000).toFixed(2)} M$ / an
            </p>
            <p className="text-[11px] text-emerald-300/80 font-semibold">Réallocation budgétaire immédiate</p>
          </div>

        </div>

      </div>

    </div>
  );
};
