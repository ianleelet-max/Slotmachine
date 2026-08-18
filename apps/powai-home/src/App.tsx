import React, { useState } from 'react';
import { 
  Cpu, ShieldCheck, Zap, Bot, Network, Sparkles, ArrowRight, Lock, 
  Database, Scale, FileText, Activity, CheckCircle2, ChevronRight,
  BarChart3, Globe, ExternalLink, Layers, Terminal, Rocket, DollarSign,
  Clock, HeartHandshake, Send, Check, Mail, User, Building, MessageSquare,
  Dices, Trophy, Wand2, Gauge, BookOpen, AlertTriangle
} from 'lucide-react';

export function App() {
  const [formNom, setFormNom] = useState('');
  const [formCourriel, setFormCourriel] = useState('');
  const [formOrganisation, setFormOrganisation] = useState('');
  const [formTypeProjet, setFormTypeProjet] = useState('IA & Workflow Autonome');
  const [formMessage, setFormMessage] = useState('');
  const [formEnvoye, setFormEnvoye] = useState(false);

  const handleSoumettreContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNom || !formCourriel) return;
    setFormEnvoye(true);
    setTimeout(() => {
      setFormNom('');
      setFormCourriel('');
      setFormOrganisation('');
      setFormMessage('');
      setFormEnvoye(false);
    }, 4000);
  };

  const suiteSites = [
    {
      name: 'BORNE Québec',
      badge: 'Foncier & Certificat',
      url: 'https://powai.ca/borne',
      icon: '⚜️',
      color: '#38bdf8',
      desc: 'Plateforme québécoise du certificat de localisation',
    },
    {
      name: 'Dossier Stratégique',
      badge: 'Livre Blanc 2026',
      url: 'https://powai.ca/borne/strategie',
      icon: '📑',
      color: '#f59e0b',
      desc: 'Analyse et modèle d\'économie de 71,9 M$',
    },
    {
      name: 'SursiTrack + Horizon',
      badge: 'MSP & Biométrie',
      url: 'https://powai.ca/sursitrack',
      icon: '🛡️',
      color: '#10b981',
      desc: 'Surveillance et réinsertion judiciaire',
    },
    {
      name: 'PowAI TEL',
      badge: 'VoIP Android',
      url: 'https://powai.ca/tel',
      icon: '📱',
      color: '#06b6d4',
      desc: 'Téléphonie et messagerie IP simplissime avec achat de numéros VoIP',
    },
    {
      name: 'AudiTREQ',
      badge: 'Graphes & Audit',
      url: 'https://powai.ca/auditreq',
      icon: '🔍',
      color: '#8b5cf6',
      desc: 'Analyse d’intégrité corporative',
    },
    {
      name: 'Nextcloud Cloud',
      badge: 'Espace Collaboratif',
      url: 'https://powai.ca/nextcloud',
      icon: '☁️',
      color: '#0284c7',
      desc: 'Stockage souverain sécurisé',
    },
    {
      name: 'SAAQ$$$clic (Anti-Modèle)',
      badge: 'Contre-Exemple Fiasco 1.2 Md$',
      url: 'https://powai.ca/saadeklic',
      icon: '🎰',
      color: '#f43f5e',
      desc: 'Démonstration satirique des dérives traditionnelles à ne jamais reproduire',
    }
  ];

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white flex flex-col relative overflow-hidden">
      
      {/* 0. Banderole de Navigation Réseau PowAI */}
      <div className="bg-[#03060d] border-b border-slate-800/90 text-xs py-2 px-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-cyan-400 flex items-center gap-1 uppercase tracking-wider text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              Suite PowAI.ca :
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {suiteSites.map((site, idx) => (
                <a
                  key={idx}
                  href={site.url}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-medium transition-all"
                >
                  <span>{site.icon}</span>
                  <span>{site.name}</span>
                  <span className="text-[9px] px-1 rounded bg-slate-800 font-bold" style={{ color: site.color }}>
                    {site.badge}
                  </span>
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Tous les services opérationnels</span>
          </div>
        </div>
      </div>

      {/* Halo Lumineux de Fond */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* HEADER DE NAVIGATION */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 bg-[#050811]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo PowAI */}
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-[#070b15] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <div>
                <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  PowAI<span className="text-cyan-400 font-light">.ca</span>
                </span>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  Solutions d'IA & Workflows Évolutifs
                </p>
              </div>
            </div>

            {/* Navigation rapide */}
            <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-slate-300">
              <a href="#solutions" className="hover:text-cyan-400 transition-colors">Plateformes</a>
              <a href="#manifeste" className="hover:text-cyan-400 transition-colors">Notre Révolution</a>
              <a href="#antimodèle" className="hover:text-rose-400 transition-colors">Anti-Modèle</a>
              <a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a>
            </nav>

            {/* Accès Directs Clés */}
            <div className="flex items-center space-x-3">
              <a
                href="https://powai.ca/borne/strategie"
                className="px-3.5 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-lg shadow-amber-500/10 flex items-center space-x-1.5 transition-all"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Dossier Stratégique</span>
              </a>
              <a
                href="https://powai.ca/borne"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 flex items-center space-x-2 transition-all"
              >
                <span>⚜️ BORNE Québec</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-24 py-12 z-10">
        
        {/* SECTION HERO */}
        <section id="solutions" className="text-center space-y-8 pt-6 pb-12">
          
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900/90 border border-cyan-800/60 shadow-lg shadow-cyan-500/10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              L'IA ÉVOLUTIVE AU SERVICE DU GOUVERNEMENT ET DES GRANDES ENTREPRISES
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight">
            Propulsez vos Décisions avec l'
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent">
              Intelligence Artificielle
            </span>
            & l'Automatisation de Workflows.
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Conception de plateformes souveraines, d'agents d'IA autonomes, d'analyse de données en temps réel et d'orchestration de processus d'affaires complexes à la fine pointe de la technologie.
          </p>

          {/* Grille des Plateformes Phares */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto pt-4 text-left">
            
            {/* 1. BORNE Québec */}
            <a
              href="https://powai.ca/borne"
              className="glass-panel p-5 rounded-2xl border-2 border-sky-500/50 hover:border-sky-400 bg-sky-950/20 flex flex-col justify-between group transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-sky-950 text-sky-400 border border-sky-800/60 text-xl">
                    ⚜️
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-900/60 text-sky-300 border border-sky-700/50">
                    Foncier QC
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors flex items-center gap-1.5">
                    BORNE Québec
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Plateforme québécoise du certificat de localisation : registre d'empreintes SHA-256, cadastre vectoriel et vérification automatique des 23 points de la norme.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-sky-900/50 text-xs font-bold text-sky-400 flex items-center justify-between">
                <span>Accéder à la plateforme</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </a>

            {/* 2. Dossier Stratégique 2026 */}
            <a
              href="https://powai.ca/borne/strategie"
              className="glass-panel p-5 rounded-2xl border-2 border-amber-500/50 hover:border-amber-400 bg-amber-950/20 flex flex-col justify-between group transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/60 text-xl">
                    📑
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700/50">
                    Livre Blanc 2026
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                    Dossier Stratégique & Économies
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Étude complète en 13 sections démontrant le modèle d'économie de 71,9 M$/an pour les citoyens et le gouvernement québécois.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-900/50 text-xs font-bold text-amber-400 flex items-center justify-between">
                <span>Lire le Livre Blanc interactif</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </a>

            {/* 3. SursiTrack & Horizon */}
            <a
              href="https://powai.ca/sursitrack"
              className="glass-panel p-5 rounded-2xl border border-emerald-500/30 hover:border-emerald-400/80 bg-slate-900/40 flex flex-col justify-between group transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-400 border border-slate-800">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Sécurité & Justice
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors flex items-center gap-1.5">
                    SursiTrack + Horizon
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Système souverain de surveillance probabiliste, biopuce/bracelet et réinsertion judiciaire conforme aux exigences du MSP.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-slate-400 flex items-center justify-between">
                <span>Explorer la solution</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </a>

            {/* 4. AudiTREQ */}
            <a
              href="https://powai.ca/auditreq"
              className="glass-panel p-5 rounded-2xl border border-purple-500/30 hover:border-purple-400/80 bg-slate-900/40 flex flex-col justify-between group transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-900 text-purple-400 border border-slate-800">
                    <Activity className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    Audit & Conflits
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors flex items-center gap-1.5">
                    AudiTREQ
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Moteur de graphes relationnels détectant les prête-noms, conflits d'intérêts et participations croisées dans le REQ.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-slate-400 flex items-center justify-between">
                <span>Voir le démonstrateur</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </a>

            {/* 5. Nextcloud */}
            <a
              href="https://powai.ca/nextcloud"
              className="glass-panel p-5 rounded-2xl border border-blue-500/30 hover:border-blue-400/80 bg-slate-900/40 flex flex-col justify-between group transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-900 text-blue-400 border border-slate-800">
                    <Database className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                    Cloud Souverain
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors flex items-center gap-1.5">
                    Nextcloud PowAI
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Espace collaboratif souverain, synchronisation de fichiers chiffrés et gestion documentaire haute sécurité.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-slate-400 flex items-center justify-between">
                <span>Accéder au cloud</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </a>

            {/* 6. Laboratoire & Simulations */}
            <a
              href="https://powai.ca/speed"
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/50 bg-slate-900/40 flex flex-col justify-between group transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-900 text-amber-400 border border-slate-800">
                    <Dices className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Laboratoire
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors flex items-center gap-1.5">
                    Laboratoire Jeux & Math
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Moteur de calcul probabiliste provably-fair, simulations haute vélocité et RGS mathématiques.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-slate-400 flex items-center justify-between">
                <span>Voir les démonstrations</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </a>

          </div>

        </section>

        {/* SECTION ANTI-MODÈLE / CE QUE NOUS NE FERONS JAMAIS */}
        <section id="antimodèle" className="glass-panel p-8 sm:p-12 rounded-3xl border border-rose-900/60 space-y-6 relative overflow-hidden bg-gradient-to-r from-rose-950/30 via-slate-950/80 to-slate-900/80">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60 text-xs font-mono font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>ANTI-MODÈLE & DÉMONSTRATION PAR L'ABSURDE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Ce Que Nous Ne Ferons Jamais : L'Anti-Modèle SAAQ$$$clic (1.2 Milliard $)
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Pour démontrer de façon percutante les dérives des projets informatiques traditionnels facturés au prorata des heures sans responsabilisation de résultat, nous avons mis en ligne ce simulateur satirique. Chez PowAI, <strong>nous supprimons structurellement l'opportunité même de reproduire ces fiascos</strong> grâce à des architectures déterministes, du code auditable et des livraisons en jours plutôt qu'en années.
              </p>
            </div>
            <a
              href="https://powai.ca/saadeklic"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 border border-rose-600/50 text-rose-100 text-xs font-bold shadow-lg shadow-rose-900/30 flex items-center space-x-2 transition-all flex-shrink-0"
            >
              <span>🎰 Voir le simulateur satirique</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* SECTION MANIFESTE */}
        <section id="manifeste" className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 space-y-8 relative overflow-hidden bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-cyan-950/40">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 text-xs font-mono font-bold">
              <Rocket className="w-4 h-4 text-cyan-400" />
              <span>VÉLOCITÉ & RUPTURE AVEC LES STANDARDS DE L'INDUSTRIE</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Une Vitesse d'Exécution Exceptionnelle pour Diviser vos Coûts par 10.
            </h2>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed">
              L'industrie traditionnelle de l'ingénierie logicielle a pris la mauvaise habitude, depuis trop longtemps, de surcharger inutilement les budgets et d'étirer indéfiniment les délais. PowAI prouve qu'un système hautement automatisé produit des résultats plus rigoureux en quelques jours plutôt qu'en plusieurs mois.
            </p>
          </div>
        </section>

        {/* SECTION FORMULAIRE DE CONTACT */}
        <section id="contact" className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950 px-3 py-1 rounded-full border border-cyan-800">
                  PARLONS DE VOTRE PROJET
                </span>
                <h2 className="text-3xl font-extrabold text-white">Contactez Nos Experts en IA</h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Vous avez un défi complexe, un besoin d'automatisation de workflow ou une plateforme à moderniser ? Écrivez-nous pour une consultation directe.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>Contact direct : <strong>contact@powai.ca</strong></span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <form onSubmit={handleSoumettreContact} className="p-6 sm:p-8 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Votre Nom complet *</label>
                    <input type="text" required value={formNom} onChange={e=>setFormNom(e.target.value)} placeholder="ex: Jean Lapointe" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Courriel professionnel *</label>
                    <input type="email" required value={formCourriel} onChange={e=>setFormCourriel(e.target.value)} placeholder="ex: j.lapointe@entreprise.com" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Organisation / Ministère</label>
                  <input type="text" value={formOrganisation} onChange={e=>setFormOrganisation(e.target.value)} placeholder="ex: Ministère, Ville, Notariat ou Entreprise" className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Message / Besoins du projet</label>
                  <textarea rows={3} value={formMessage} onChange={e=>setFormMessage(e.target.value)} placeholder="Décrivez brièvement vos objectifs..." className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white" />
                </div>

                {formEnvoye ? (
                  <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Votre message a été transmis avec succès. Nous vous contacterons sous 24h.</span>
                  </div>
                ) : (
                  <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>Envoyer ma Demande de Consultation</span>
                  </button>
                )}
              </form>
            </div>

          </div>
        </section>

        <footer className="border-t border-slate-800 pt-8 pb-12 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-white">PowAI.ca — Solutions Innovantes en IA & Workflows Automatisés</p>
            <p className="text-[11px] mt-0.5">© 2026 Tous droits réservés. Hébergé au Québec (Canada).</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] flex-wrap">
            <a href="https://powai.ca/borne" className="hover:text-cyan-400">BORNE Québec</a>
            <a href="https://powai.ca/borne/strategie" className="hover:text-cyan-400">Dossier Stratégique</a>
            <a href="https://powai.ca/sursitrack" className="hover:text-cyan-400">SursiTrack</a>
            <a href="https://powai.ca/auditreq" className="hover:text-cyan-400">AudiTREQ</a>
            <a href="https://powai.ca/saadeklic" className="text-rose-400 hover:text-rose-300">Anti-Modèle SAAQ$$$clic</a>
          </div>
        </footer>

      </main>

    </div>
  );
}

export default App;