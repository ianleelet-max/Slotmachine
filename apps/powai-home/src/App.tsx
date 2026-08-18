import React, { useState } from 'react';
import { 
  Cpu, ShieldCheck, Zap, Bot, Network, Sparkles, ArrowRight, Lock, 
  Database, Scale, FileText, Activity, CheckCircle2, ChevronRight,
  BarChart3, Globe, ExternalLink, Layers, Terminal, Rocket, DollarSign,
  Clock, HeartHandshake, Send, Check, Mail, User, Building, MessageSquare,
  Dices, Trophy, Wand2, Gauge, BookOpen
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
      name: 'AudiTREQ',
      badge: 'Graphes & Audit',
      url: 'https://powai.ca/auditreq',
      icon: '🔍',
      color: '#8b5cf6',
      desc: 'Analyse d’intégrité corporative',
    },
    {
      name: 'NotaR-iA',
      badge: 'IA Juridique',
      url: 'https://powai.ca/notaria',
      icon: '⚖️',
      color: '#ec4899',
      desc: 'Extraction et examen de titres',
    },
    {
      name: 'Laboratoire Slots',
      badge: 'Provably Fair',
      url: 'https://powai.ca/speed',
      icon: '🎰',
      color: '#eab308',
      desc: 'Moteur de jeux mathématiques',
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

      {/* Halo Lumineux de Fond (Effets Néon Glow) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse-slow" />
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[160px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] left-[20%] w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse-slow" />

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
              <a href="#expertise" className="hover:text-cyan-400 transition-colors">Expertise & IA</a>
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
        
        {/* SECTION HERO (VISUEL PERCUTANT & ÉLÉGANT) */}
        <section id="solutions" className="text-center space-y-8 pt-6 pb-12">
          
          {/* Badge Haute Technologie */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900/90 border border-cyan-800/60 shadow-lg shadow-cyan-500/10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
              L'IA ÉVOLUTIVE AU SERVICE DU GOUVERNEMENT ET DES GRANDES ENTREPRISES
            </span>
          </div>

          {/* Titre Principal */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight">
            Propulsez vos Décisions avec l'
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent">
              Intelligence Artificielle
            </span>
            & l'Automatisation de Workflows.
          </h1>

          {/* Sous-titre explicatif */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Conception de plateformes souveraines, d'agents d'IA autonomes, d'analyse de données en temps réel et d'orchestration de processus d'affaires complexes à la fine pointe de la technologie.
          </p>

          {/* Grille des Plateformes Phares en Ligne */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto pt-4 text-left">
            
            {/* 1. BORNE Québec */}
            <a
              href="https://powai.ca/borne"
              className="glass-panel p-5 rounded-2xl border-2 border-sky-500/50 hover:border-sky-400 bg-sky-950/20 flex flex-col justify-between group transition-all glass-panel-hover"
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
                    Plateforme québécoise du certificat de localisation : réutilisation, 19 vérifications déterministes et coffre-fort à vie.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-sky-900/40 text-xs font-bold text-sky-400 flex items-center justify-between">
                <span>Accéder à la plateforme</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </a>

            {/* 2. Dossier Stratégique */}
            <a
              href="https://powai.ca/borne/strategie"
              className="glass-panel p-5 rounded-2xl border-2 border-amber-500/50 hover:border-amber-400 bg-amber-950/20 flex flex-col justify-between group transition-all glass-panel-hover"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/60">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700/50">
                    Livre Blanc
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                    Dossier Stratégique 2026
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Anatomie d'un péage de 71.9 M$ et plan pour le démonter. Modèle chiffré, 324 ETP libérés et matrice d'erreurs.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-amber-900/40 text-xs font-bold text-amber-400 flex items-center justify-between">
                <span>Consulter le dossier</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </a>

            {/* 3. SursiTrack + Horizon */}
            <a
              href="https://powai.ca/sursitrack/"
              className="glass-panel p-5 rounded-2xl border border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/10 flex flex-col justify-between group transition-all glass-panel-hover"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                    MSP QC
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                    SursiTrack + Horizon
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Biométrie faciale horodatée, geofencing GPS dynamique et coordination judiciaire pour le Ministère de la Sécurité publique.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-900/40 text-xs font-bold text-emerald-400 flex items-center justify-between">
                <span>Accéder à SursiTrack</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </a>

            {/* 4. AudiTREQ */}
            <a
              href="https://powai.ca/auditreq/"
              className="glass-panel p-5 rounded-2xl border border-purple-500/40 hover:border-purple-400 bg-purple-950/10 flex flex-col justify-between group transition-all glass-panel-hover"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/60">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50">
                    Audit REQ
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                    AudiTREQ
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Cartographie relationnelle des administrateurs, bénéficiaires ultimes et détection de conflits d'intérêts sur données ouvertes.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-purple-900/40 text-xs font-bold text-purple-400 flex items-center justify-between">
                <span>Consulter AudiTREQ</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </a>

            {/* 5. NotaR-iA */}
            <a
              href="https://powai.ca/notaria"
              className="glass-panel p-5 rounded-2xl border border-pink-500/40 hover:border-pink-400 bg-pink-950/10 flex flex-col justify-between group transition-all glass-panel-hover"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-pink-950 text-pink-400 border border-pink-800/60">
                    <Scale className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-pink-900/60 text-pink-300 border border-pink-700/50">
                    IA Juridique
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors flex items-center gap-1.5">
                    NotaR-iA
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Extraction documentaire intelligente d'actes notariés, servitudes et chaînes de titres immobiliers.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-pink-900/40 text-xs font-bold text-pink-400 flex items-center justify-between">
                <span>Découvrir NotaR-iA</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </a>

            {/* 6. Laboratoire Mathématique / Slots */}
            <a
              href="https://powai.ca/speed/"
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 bg-slate-900/30 flex flex-col justify-between group transition-all glass-panel-hover opacity-75 hover:opacity-100"
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
          <div className="flex items-center gap-4 text-[11px]">
            <a href="https://powai.ca/borne" className="hover:text-cyan-400">BORNE Québec</a>
            <a href="https://powai.ca/borne/strategie" className="hover:text-cyan-400">Dossier Stratégique</a>
            <a href="https://powai.ca/sursitrack" className="hover:text-cyan-400">SursiTrack</a>
            <a href="https://powai.ca/auditreq" className="hover:text-cyan-400">AudiTREQ</a>
          </div>
        </footer>

      </main>

    </div>
  );
}

export default App;
