import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, DollarSign, MapPin, Package, ShoppingBag, Users,
  Briefcase, CheckSquare, Ticket, User, Shield, LayoutDashboard,
  ArrowRight, Github, ExternalLink, Star, Zap, Globe, Search, Linkedin,
  Sun, Moon,
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: LayoutDashboard, label: 'Dashboard',       desc: 'Personalized stats & quick access to all modules',      color: 'from-indigo-500 to-purple-600' },
  { icon: BookOpen,        label: 'Resource Hub',    desc: 'Share & download notes, PDFs, videos, learning paths',  color: 'from-blue-500 to-indigo-600'   },
  { icon: DollarSign,      label: 'Finance Tracker', desc: 'Track income, expenses & visualize spending patterns',  color: 'from-emerald-500 to-teal-600'  },
  { icon: Briefcase,       label: 'Opportunities',   desc: 'Internships, jobs, scholarships & hackathons in one',   color: 'from-amber-500 to-orange-600'  },
  { icon: MapPin,          label: 'Local Navigator', desc: 'GPS-powered map of hostels, mess, PG & campus shops',   color: 'from-rose-500 to-pink-600'     },
  { icon: Search,          label: 'Lost & Found',    desc: 'AI image analyzer auto-fills lost item reports',         color: 'from-violet-500 to-purple-600' },
  { icon: ShoppingBag,     label: 'Marketplace',     desc: 'Buy & sell student items on campus with ease',          color: 'from-cyan-500 to-blue-600'     },
  { icon: Users,           label: 'Campus Connect',  desc: 'Clubs, events, announcements & campus community',       color: 'from-pink-500 to-rose-600'     },
  { icon: Globe,           label: 'Student Social',  desc: 'Follow students, network & build campus connections',   color: 'from-teal-500 to-emerald-600'  },
  { icon: CheckSquare,     label: 'Task Manager',    desc: 'Assignments, deadlines & personal to-do lists',         color: 'from-orange-500 to-amber-600'  },
  { icon: Ticket,          label: 'Campus Pass',     desc: 'QR-code digital passes for campus access & events',    color: 'from-indigo-500 to-cyan-600'   },
  { icon: Shield,          label: 'Admin Panel',     desc: 'User management, moderation & platform analytics',     color: 'from-red-500 to-rose-600'      },
];

const STATS = [
  { value: '12+', label: 'Modules' },
  { value: 'AI',  label: 'Powered' },
  { value: 'Free', label: 'Maps & GPS' },
  { value: 'MERN', label: 'Stack' },
];

const TECH = [
  'React 18', 'Vite 5', 'Node.js 20', 'Express 4',
  'MongoDB', 'JWT Auth', 'Tailwind CSS', 'Leaflet Maps',
  'Chart.js', 'OpenRouter AI', 'Cloudinary', 'Multer',
];

// ─── Landing Page ─────────────────────────────────────────────────────────────
const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // ── Theme toggle (syncs with the same localStorage key as Topbar) ──────────
  const [isDark, setIsDark] = useState(() => localStorage.getItem('ss_theme') !== 'light');

  useEffect(() => {
    const stored = localStorage.getItem('ss_theme');
    if (stored === 'light') {
      document.documentElement.classList.add('light');
      setIsDark(false);
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('ss_theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('ss_theme', 'light');
    }
  }, [isDark]);

  // ── Dynamic class helpers ───────────────────────────────────────────────────
  const bg        = isDark ? 'bg-[#0a0a18]'   : 'bg-slate-50';
  const text      = isDark ? 'text-white'      : 'text-slate-900';
  const subText   = isDark ? 'text-slate-400'  : 'text-slate-600';
  const mutedText = isDark ? 'text-slate-500'  : 'text-slate-400';
  const navBg     = isDark ? 'bg-[#0a0a18]/80 border-white/5' : 'bg-white/90 border-slate-200';
  const techPill  = isDark
    ? 'bg-white/[0.04] border-white/[0.07] text-slate-300 hover:bg-white/[0.08] hover:text-white'
    : 'bg-white border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300';
  const featureCard = isDark
    ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10'
    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100';
  const featureCardDesc = isDark ? 'text-slate-500' : 'text-slate-500';
  const featureCardTitle = isDark ? 'text-white' : 'text-slate-900';
  const aiSection = isDark
    ? 'border-indigo-500/20 bg-gradient-to-br from-indigo-900/40 to-purple-900/20'
    : 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50';
  const aiStepCard = isDark
    ? 'bg-white/[0.03] border-white/[0.05]'
    : 'bg-white border-slate-200';
  const aiStepTitle = isDark ? 'text-white' : 'text-slate-900';
  const aiStepDesc  = isDark ? 'text-slate-500' : 'text-slate-500';
  const footerBorder = isDark ? 'border-white/[0.05]' : 'border-slate-200';
  const footerText   = isDark ? 'text-slate-500' : 'text-slate-500';
  const footerBottom = isDark ? 'text-slate-600' : 'text-slate-400';
  const socialIcon   = isDark
    ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
    : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200';
  const themeBtn     = isDark
    ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
    : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900';
  const navText      = isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900';
  const signInBtn    = isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900';
  const statsVal     = isDark
    ? 'bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent'
    : 'text-indigo-600';
  const statsLabel   = isDark ? 'text-slate-500' : 'text-slate-400';
  const techSecBorder = isDark ? 'border-white/[0.04]' : 'border-slate-200';
  const builtWithLabel = isDark ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`min-h-screen ${bg} ${text} overflow-x-hidden transition-colors duration-300`}>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl ${navBg} transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">StudentSphere</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className={`transition-colors ${navText}`}>Features</a>
            <a href="#tech"     className={`transition-colors ${navText}`}>Tech Stack</a>
            <a href="https://github.com/shahidx05/StudentSphere" target="_blank" rel="noreferrer"
              className={`transition-colors flex items-center gap-1 ${navText}`}>
              <Github size={14} /> GitHub
            </a>
            <a href="https://www.linkedin.com/in/shahidx05" target="_blank" rel="noreferrer"
              className={`transition-colors flex items-center gap-1 ${navText}`}>
              <Linkedin size={14} /> LinkedIn
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {/* Dark / Light mode toggle */}
            <button
              id="landing-theme-toggle"
              onClick={() => setIsDark(!isDark)}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 ${themeBtn}`}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {isAuthenticated ? (
              /* Logged-in: show Go to Dashboard instead of Sign In / Register */
              <button
                id="landing-goto-dashboard"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/25"
              >
                Dashboard <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <button
                  id="landing-signin"
                  onClick={() => navigate('/login')}
                  className={`px-4 py-2 text-sm transition-colors ${signInBtn}`}
                >
                  Sign in
                </button>
                <button
                  id="landing-register"
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/25"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* BG orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-32 left-20 w-64 h-64 rounded-full bg-purple-600/8 blur-[80px] pointer-events-none" />
        <div className="absolute top-20 right-20 w-48 h-48 rounded-full bg-cyan-600/8 blur-[80px] pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6">
          <Star size={11} className="fill-indigo-400 text-indigo-400" />
          AI-Powered Student Ecosystem Platform
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-3xl leading-[1.05]">
          Everything a{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Student
          </span>{' '}
          needs in one place
        </h1>

        <p className={`mt-6 text-lg max-w-xl leading-relaxed ${subText}`}>
          From AI-powered lost &amp; found and GPS campus maps to finance tracking, resources and social networking — StudentSphere is your complete campus companion.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-3 mt-10">
          {isAuthenticated ? (
            /* Logged-in hero CTA */
            <button
              id="landing-hero-dashboard"
              onClick={() => navigate('/dashboard')}
              className="group flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-2xl text-base shadow-2xl shadow-indigo-500/30 transition-all duration-200 hover:scale-[1.02]"
            >
              Go to Dashboard
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              id="landing-hero-register"
              onClick={() => navigate('/register')}
              className="group flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-2xl text-base shadow-2xl shadow-indigo-500/30 transition-all duration-200 hover:scale-[1.02]"
            >
              Get Started Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl w-full">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className={`text-3xl font-black ${statsVal}`}>{value}</span>
              <span className={`text-xs uppercase tracking-wider ${statsLabel}`}>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Grid ───────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold">12 powerful modules</h2>
            <p className={`mt-3 max-w-lg mx-auto ${subText}`}>Every tool you need for college life, beautifully integrated.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, label, desc, color }) => (
              <div key={label}
                className={`group relative p-5 rounded-2xl border transition-all duration-300 cursor-default overflow-hidden ${featureCard}`}>
                {/* Glow */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br ${color} rounded-2xl`} />
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <h3 className={`font-semibold text-sm mb-1 ${featureCardTitle}`}>{label}</h3>
                  <p className={`text-xs leading-relaxed ${featureCardDesc}`}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Highlight ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className={`relative rounded-3xl overflow-hidden border p-10 md:p-14 transition-colors duration-300 ${aiSection}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5" />
            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-400 text-xs font-semibold mb-4">
                  AI-Powered
                </span>
                <h2 className="text-3xl font-bold mb-4">
                  Lost something? Upload a photo — AI does the rest
                </h2>
                <p className={`text-sm leading-relaxed ${subText}`}>
                  Our Gemini Vision AI analyzes your photo and automatically fills the title, description and category. GPS auto-detects your exact address. Just review and submit.
                </p>
                <button
                  onClick={() => navigate(isAuthenticated ? '/lostfound/add' : '/register')}
                  className="mt-6 flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                >
                  Try it out <ArrowRight size={14} />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { step: '01', title: 'Upload photo', desc: 'Drop any image of the lost/found item' },
                  { step: '02', title: 'AI Analyzes', desc: 'Gemini Vision fills title & description' },
                  { step: '03', title: 'GPS detects location', desc: 'Nominatim fills your exact address' },
                  { step: '04', title: 'Review & submit', desc: 'Edit anything, then post in one click' },
                ].map(({ step, title, desc }) => (
                  <div key={step} className={`flex items-start gap-4 p-3 rounded-xl border transition-colors duration-300 ${aiStepCard}`}>
                    <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">{step}</span>
                    <div>
                      <p className={`text-sm font-medium ${aiStepTitle}`}>{title}</p>
                      <p className={`text-xs mt-0.5 ${aiStepDesc}`}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ──────────────────────────────────────────────────── */}
      <section id="tech" className={`py-20 px-6 border-t ${techSecBorder} transition-colors duration-300`}>
        <div className="max-w-4xl mx-auto text-center">
          <p className={`text-sm mb-8 uppercase tracking-widest font-semibold ${builtWithLabel}`}>Built With</p>
          <div className="flex flex-wrap justify-center gap-2">
            {TECH.map(t => (
              <span key={t}
                className={`px-4 py-2 rounded-full border text-sm transition-all duration-200 cursor-default ${techPill}`}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 p-12 overflow-hidden shadow-2xl shadow-indigo-500/20">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.1),transparent)]" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-3">
                {isAuthenticated ? 'Welcome back! 🎉' : 'Ready to level up your campus life?'}
              </h2>
              <p className="text-indigo-200 mb-8">
                {isAuthenticated
                  ? 'Head to your dashboard to continue where you left off.'
                  : 'Join thousands of students already using StudentSphere.'}
              </p>
              <button
                id="landing-cta-main"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                className="px-10 py-4 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-indigo-50 transition-all duration-200 shadow-xl hover:scale-[1.02] text-base"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className={`border-t ${footerBorder} py-12 px-6 transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Zap size={14} className="text-white" />
                </div>
                <span className="font-bold">StudentSphere</span>
              </div>
              <p className={`text-xs leading-relaxed ${footerText}`}>
                A comprehensive MERN stack platform built to supercharge campus life for college students.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <a href="https://github.com/shahidx05" target="_blank" rel="noreferrer"
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${socialIcon}`}
                  title="GitHub">
                  <Github size={14} />
                </a>
                <a href="https://www.linkedin.com/in/shahidx05" target="_blank" rel="noreferrer"
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${socialIcon}`}
                  title="LinkedIn">
                  <Linkedin size={14} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <p className="text-sm font-semibold mb-4">Quick Links</p>
              <ul className={`space-y-2 text-xs ${footerText}`}>
                {[
                  { label: 'Live App',    href: 'https://student-sphere-azure.vercel.app' },
                  { label: 'Backend API', href: 'https://studentsphere-ideu.onrender.com/api/health' },
                  { label: 'GitHub Repo', href: 'https://github.com/shahidx05/StudentSphere' },
                  ...(isAuthenticated
                    ? [{ label: 'Dashboard', href: '/dashboard', internal: true }]
                    : [
                        { label: 'Sign In',  href: '/login',    internal: true },
                        { label: 'Register', href: '/register', internal: true },
                      ]),
                ].map(({ label, href, internal }) =>
                  internal ? (
                    <li key={label}>
                      <button onClick={() => navigate(href)}
                        className="hover:text-indigo-400 transition-colors text-left">{label}</button>
                    </li>
                  ) : (
                    <li key={label}>
                      <a href={href} target="_blank" rel="noreferrer"
                        className="hover:text-indigo-400 transition-colors flex items-center gap-1">
                        {label} <ExternalLink size={10} />
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Developer */}
            <div>
              <p className="text-sm font-semibold mb-4">Developer</p>
              <ul className={`space-y-2 text-xs ${footerText}`}>
                {[
                  { label: 'GitHub — @shahidx05',   href: 'https://github.com/shahidx05' },
                  { label: 'LinkedIn — @shahidx05',  href: 'https://www.linkedin.com/in/shahidx05' },
                  { label: 'Project Repo',           href: 'https://github.com/shahidx05/StudentSphere' },
                  { label: 'Frontend — Vercel',      href: 'https://student-sphere-azure.vercel.app' },
                  { label: 'Backend — Render',       href: 'https://studentsphere-ideu.onrender.com/api/health' },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noreferrer"
                      className="hover:text-indigo-400 transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className={`pt-6 border-t ${footerBorder} flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${footerBottom}`}>
            <p>© {new Date().getFullYear()} StudentSphere. Built with ❤️ by{' '}
              <a href="https://github.com/shahidx05" target="_blank" rel="noreferrer"
                className="hover:text-indigo-400 transition-colors">@shahidx05</a>
            </p>
            <p>MIT License · Open Source</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
