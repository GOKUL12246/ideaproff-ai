import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Calculator, 
  Swords, 
  BarChart3, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  School,
  Briefcase,
  Layers,
  Lightbulb
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "How does IdeaProof AI validate a startup idea?",
      a: "IdeaProof AI replaces guesswork with empirical evidence. You submit your startup concept and assumptions, collect primary customer survey feedback, profile competitors, and run financial simulations. Our deterministic Python scoring engine evaluates your readiness across 6 weighted criteria (Problem/Demand, Market Opportunity, Differentiation, Feasibility, Viability, and Evidence Quality) rather than hallucinating an arbitrary score."
    },
    {
      q: "Does AI invent the validation score?",
      a: "No. The validation score is strictly calculated by a deterministic Python engine based on empirical evidence coverage and specific quantitative signals. Gemini AI agents are utilized solely for qualitative tasks: synthesizing problem statements, generating non-leading survey questions, identifying competitor differentiation gaps, and explaining financial simulations."
    },
    {
      q: "Can I collect real survey responses from target users?",
      a: "Yes. IdeaProof AI includes a built-in survey builder supporting 5 question types (single choice, multiple choice, rating scale, short text, long text). You can share public links with respondents without requiring them to log in, and all incoming responses are analyzed with live interactive Recharts visualizations and CSV exports."
    },
    {
      q: "Can incubators and university entrepreneurship centers use this?",
      a: "Absolutely. IdeaProof AI is designed for collegiate entrepreneurship programs and incubators to track cohorts, compare objective evidence coverage, review unit economics, and inspect audit-ready diligence reports before awarding grants or investments."
    },
    {
      q: "What export formats are supported?",
      a: "You can download executive PDF validation dossiers generated natively via ReportLab with structured tables, charts, and risk matrices. You can also export raw survey response datasets and 12-month financial projections as CSV files via Pandas."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 font-sans">
      {/* Navigation */}
      <nav className="border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">IdeaProof <span className="text-blue-600 font-extrabold">AI</span></span>
          </Link>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#benefits" className="hover:text-blue-600 transition-colors">Benefits</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm shadow-blue-600/20 transition-all hover:scale-[1.02]"
            >
              Validate My Idea
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200/80 rounded-full px-3.5 py-1 text-xs font-semibold text-blue-700 mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI-Assisted & Evidence-Backed Startup Validation Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            Validate Your Startup Idea <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600">
              Before You Build It.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Turn assumptions into evidence. Understand your customers, explore your market, analyze competitors, 
            and make smarter startup decisions.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 px-7 py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02]"
            >
              <span>Validate My Idea</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-6 py-3.5 rounded-xl shadow-sm transition-all"
            >
              <span>Explore Features</span>
            </a>
          </div>

          {/* Value Props Pills */}
          <div className="mt-12 pt-8 border-t border-slate-200/60 max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Real Customer Surveys</span>
            </div>
            <div className="flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Transparent Python Scoring</span>
            </div>
            <div className="flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Financial Simulator</span>
            </div>
            <div className="flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Audit-Ready PDF Dossiers</span>
            </div>
          </div>
        </div>

        {/* Product UI Preview Mockup */}
        <div className="mt-14 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden p-3 md:p-6 bg-slate-900/5">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Fake Browser Top Bar */}
              <div className="h-10 bg-slate-100 border-b border-slate-200 px-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[11px] font-mono text-slate-500 bg-white px-4 py-1 rounded border border-slate-200">
                  ideaproof.ai/app/validation/campuscart
                </div>
                <div className="w-12" />
              </div>

              {/* Sample Dashboard Snapshot */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Validation Score</span>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className="text-4xl font-extrabold text-blue-600">82.5</span>
                      <span className="text-sm font-semibold text-slate-400">/ 100</span>
                    </div>
                    <span className="inline-block mt-2 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Consider Next Stage
                    </span>
                  </div>
                  <p className="mt-4 text-xs text-slate-500 leading-relaxed">
                    High empirical demand verified across 10 customer survey responses. Unit economics show 85% gross margin.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Evidence Coverage</span>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-4xl font-extrabold text-teal-600">88.0%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                    <div className="bg-teal-500 h-2 rounded-full w-[88%]" />
                  </div>
                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between"><span>Customer Survey:</span> <span className="font-semibold text-emerald-600">Verified (10 resp)</span></div>
                    <div className="flex justify-between"><span>Competitors Mapped:</span> <span className="font-semibold text-emerald-600">3 Analyzed</span></div>
                    <div className="flex justify-between"><span>Financial Model:</span> <span className="font-semibold text-emerald-600">Complete</span></div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recommended Action</span>
                  <div className="mt-3 space-y-2 text-xs text-slate-700">
                    <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100">
                      <p className="font-semibold text-blue-900">1. Deploy Pilot Landing Page</p>
                      <p className="text-blue-700 text-[11px] mt-0.5">Test pre-order conversion with waitlist.</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
                      <p className="font-semibold text-slate-800">2. Build Scoped MVP</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">Execute 10-minute dorm exchange workflow.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 md:py-28 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Everything You Need To De-Risk Your Venture</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              A Complete Intelligence Suite for Startup Validation
            </p>
            <p className="mt-4 text-base text-slate-600">
              No vanity metrics. No fabricated success rates. Only honest, structured validation workflows.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">AI Idea Intelligence Engine</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Refines problem statements, structures customer segment hypotheses, details UVPs, and suggests testable MVP experiments using Google Gemini.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-5">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Market Intelligence & TAM/SAM/SOM</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Bottom-up market sizing formulas with editable assumptions, industry growth trends, and clear indicators separating verified facts from estimates.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Customer Survey Builder</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Build surveys with 5 question types, generate neutral 'Mom Test' questions via AI, distribute public shareable links, and visualize actual responses.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
                <Swords className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Competitor Analysis Matrix</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Map direct and alternative solutions with verified pricing and feature teardowns. Identify differentiation opportunities and defensible moats.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Financial Feasibility Simulator</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Mathematical Python calculations for unit economics, contribution margins, break-even customer volume, and 12-month projections across 3 scenarios.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Transparent Scoring & Reports</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Deterministic 6-pillar scoring engine, confidence ratings dampened by missing evidence, risk matrices, and one-click PDF and CSV exports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">The Scientific Method For Startups</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How IdeaProof AI Works
            </p>
            <p className="mt-4 text-base text-slate-600">
              Transform subjective opinions into empirical readiness metrics in four systematic steps.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 relative">
              <span className="text-4xl font-extrabold text-blue-100 absolute top-4 right-4">01</span>
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Structure Assumptions</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Submit problem statements, customer personas, alternatives, and budget through our guided 12-point submission wizard.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 relative">
              <span className="text-4xl font-extrabold text-teal-100 absolute top-4 right-4">02</span>
              <div className="w-10 h-10 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Gather Primary Evidence</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Generate unbiased survey questions, distribute shareable public links, and collect verified customer pain point data.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 relative">
              <span className="text-4xl font-extrabold text-indigo-100 absolute top-4 right-4">03</span>
              <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Model Financials & Risks</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Calculate break-even units, runway burn rate, and test conservative vs optimistic growth scenarios before writing code.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 relative">
              <span className="text-4xl font-extrabold text-emerald-100 absolute top-4 right-4">04</span>
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900">Generate Diligence Dossier</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Receive an evidence-backed readiness score, 7-day to 30-day roadmap, and export investor-ready ReportLab PDF reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for Students & Founders vs Colleges & Incubators */}
      <section id="benefits" className="py-20 md:py-28 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-teal-600 uppercase tracking-widest">Built For The Entrepreneurial Ecosystem</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tailored Value For Innovators & Institutions
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Box 1: Students & Founders */}
            <div className="bg-gradient-to-br from-blue-50/60 to-white p-8 rounded-3xl border border-blue-200/80 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">For Students & Startup Founders</h3>
                  <p className="text-xs text-blue-600 font-semibold">Avoid building solutions nobody wants</p>
                </div>
              </div>
              <ul className="space-y-4 text-sm text-slate-700">
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Save months of wasted development:</strong> Validate demand before committing capital or hiring engineers.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Ask non-leading questions:</strong> AI generates Lean Discovery questions that expose genuine willingness to pay.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Empower your pitch deck:</strong> Replace vague market projections with verified survey evidence and competitor teardowns.</span>
                </li>
              </ul>
            </div>

            {/* Box 2: Colleges & Incubators */}
            <div className="bg-gradient-to-br from-teal-50/60 to-white p-8 rounded-3xl border border-teal-200/80 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
                  <School className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">For Colleges & Incubators</h3>
                  <p className="text-xs text-teal-600 font-semibold">Standardize diligence & grant allocation</p>
                </div>
              </div>
              <ul className="space-y-4 text-sm text-slate-700">
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Objective cohort evaluation:</strong> Benchmark startup readiness across standardized 6-pillar criteria.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Audit-ready micro-grant diligence:</strong> Ensure founder teams possess verifiable customer interview records before releasing funds.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Mentor collaboration:</strong> Enable mentors and program administrators to review live roadmaps and risk registries.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-28 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Transparent & Accessible</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Fair Plans for Every Validation Stage
            </p>
            <p className="mt-4 text-base text-slate-600">
              Start free with full access to customer surveys, financial modeling, and scoring.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Student Plan */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Tier</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900">$0</span>
                  <span className="text-sm font-semibold text-slate-500 ml-1">/ forever</span>
                </div>
                <p className="mt-3 text-xs text-slate-600">
                  Ideal for students and bootstrapping founders exploring their first venture.
                </p>
                <div className="mt-6 space-y-3 text-xs text-slate-700">
                  <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /><span>Up to 2 Startup Ideas</span></div>
                  <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /><span>1 Active Survey per Idea</span></div>
                  <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /><span>Up to 50 Survey Responses</span></div>
                  <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /><span>Full Financial Simulator</span></div>
                  <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /><span>Deterministic Validation Score</span></div>
                </div>
              </div>
              <Link
                to="/register"
                className="mt-8 block text-center py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Founder Plan */}
            <div className="bg-white p-8 rounded-3xl border-2 border-blue-600 shadow-xl relative flex flex-col justify-between">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </span>
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Startup Founder Tier</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900">$19</span>
                  <span className="text-sm font-semibold text-slate-500 ml-1">/ month</span>
                </div>
                <p className="mt-3 text-xs text-slate-600">
                  For active founders seeking rigorous customer discovery and investor diligence.
                </p>
                <div className="mt-6 space-y-3 text-xs text-slate-700">
                  <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /><span>Unlimited Startup Ideas</span></div>
                  <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /><span>Unlimited Surveys & Responses</span></div>
                  <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /><span>Advanced Gemini AI Orchestration</span></div>
                  <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /><span>Executive PDF ReportLab Dossiers</span></div>
                  <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /><span>Pandas CSV Dataset Export</span></div>
                  <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /><span>Actionable Roadmap & Risk Matrix</span></div>
                </div>
              </div>
              <Link
                to="/register"
                className="mt-8 block text-center py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
              >
                Start 14-Day Trial
              </Link>
            </div>

            {/* Incubator Plan */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Incubator & College Tier</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900">$99</span>
                  <span className="text-sm font-semibold text-slate-500 ml-1">/ month</span>
                </div>
                <p className="mt-3 text-xs text-slate-600">
                  For collegiate accelerators, mentors, and incubator administrators.
                </p>
                <div className="mt-6 space-y-3 text-xs text-slate-700">
                  <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /><span>Manage up to 50 Student Teams</span></div>
                  <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /><span>Cohort Benchmark Analytics</span></div>
                  <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /><span>Mentor Evaluation Scoring Access</span></div>
                  <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /><span>Centralized Grant Diligence Audits</span></div>
                  <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-teal-600" /><span>Priority Support & Dedicated Onboarding</span></div>
                </div>
              </div>
              <Link
                to="/register"
                className="mt-8 block text-center py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              >
                Contact Incubator Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-28 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Got Questions?</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-sm sm:text-base text-slate-900">{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-6 py-4 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Stop guessing. Start proving your startup idea today.
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Join students, founders, and incubators using empirical evidence and transparent intelligence to de-risk ventures.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 px-6 py-3 rounded-xl shadow-lg transition-all hover:scale-[1.02]"
            >
              <span>Validate My Idea Now</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-500 py-12 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              IP
            </div>
            <span className="font-bold text-slate-200 text-sm">IdeaProof AI</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>

          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} IdeaProof AI. Production-Oriented Startup Idea Validation Platform.
          </p>
        </div>
      </footer>
    </div>
  );
};
