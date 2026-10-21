import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { 
  Sparkles, 
  ArrowRight, 
  HelpCircle, 
  CheckCircle2, 
  Lightbulb, 
  FileText,
  Building,
  Target,
  DollarSign,
  Users
} from 'lucide-react';

export const CreateIdea: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveIdea, refreshIdeas } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    industry: 'Technology & SaaS',
    problem_statement: '',
    proposed_solution: '',
    target_customers: '',
    target_geography: 'United States & Global',
    current_alternatives: '',
    unique_value_proposition: '',
    available_budget: '$5,000 bootstrapping capital',
    team_skills: '1 Technical Lead, 1 Domain Marketer',
    business_model: 'SaaS Subscription ($29/month per seat)',
    development_stage: 'Idea Phase',
  });

  const industries = [
    'Technology & SaaS',
    'E-Commerce & Retail',
    'EdTech & Student Services',
    'HealthTech & Wellness',
    'CleanTech & Sustainability',
    'FinTech & Payments',
    'Artificial Intelligence & DevTools',
    'FoodTech & Agriculture'
  ];

  const stages = [
    'Idea Phase',
    'Customer Discovery',
    'Validation & Prototype',
    'Minimum Viable Product (MVP)',
    'Early Traction'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const applyTemplate = (type: 'edtech' | 'cleantech') => {
    if (type === 'edtech') {
      setFormData({
        title: 'StudySync — Collaborative AI Study Groups',
        industry: 'EdTech & Student Services',
        problem_statement: 'Undergraduate STEM students struggle with high fail rates in calculus and organic chemistry, while university tutoring centers have long waitlists and limited hours.',
        proposed_solution: 'An on-demand peer tutoring matching engine that pairs students stuck on specific textbook problems with verified peer tutors in under 5 minutes.',
        target_customers: 'Undergraduate college students taking introductory STEM coursework',
        target_geography: 'North American collegiate universities',
        current_alternatives: 'University tutoring center, Chegg, Discord study servers, private $50/hr tutors',
        unique_value_proposition: 'Instant peer tutoring matching under 5 minutes at $12/session with verified university course alignment.',
        available_budget: '$6,000 college innovation grant',
        team_skills: '2 Co-founders: React/Python developer & Former campus teaching assistant',
        business_model: '15% platform commission on tutoring sessions + $9.99/mo premium study tools',
        development_stage: 'Validation & Prototype'
      });
    } else {
      setFormData({
        title: 'WattWise — Smart Energy Monitor for Rental Units',
        industry: 'CleanTech & Sustainability',
        problem_statement: 'Apartment renters face unpredictable electric utility bills and lack appliance-level visibility into phantom power consumption.',
        proposed_solution: 'A plug-and-play breaker smart sensor that detects appliance power draws and gives real-time bill forecasts on mobile.',
        target_customers: 'Eco-conscious millennial and Gen-Z apartment renters',
        target_geography: 'Major metropolitan urban rental centers',
        current_alternatives: 'Manual electric meter reading, generic smart plugs, high utility bills',
        unique_value_proposition: 'Sub-minute setup without electrician rewiring, saving renters an average of 18% on monthly electricity bills.',
        available_budget: '$10,000 bootstrapping reserves',
        team_skills: 'Hardware embedded firmware engineer & B2C growth marketer',
        business_model: '$49 hardware starter kit + $3.99/month energy optimization subscription',
        development_stage: 'Idea Phase'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert("Please enter a startup title.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.ideas.create(formData);
      const newIdea = res.idea;
      await refreshIdeas();
      setActiveIdea(newIdea);
      navigate(`/app/ideas/${newIdea.id}/workspace`);
    } catch (err: any) {
      alert(err.message || "Failed to create startup idea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Idea Intelligence Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Submit a New Startup Idea
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Provide your foundational assumptions across the 12 core dimensions. Our AI agents will structure hypotheses, benchmark alternatives, and calculate an empirical validation roadmap.
          </p>
        </div>

        {/* Quick Pre-fill Templates */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sample Templates:</span>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => applyTemplate('edtech')}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              StudySync (EdTech)
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('cleantech')}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors"
            >
              WattWise (CleanTech)
            </button>
          </div>
        </div>
      </div>

      {/* 12-Field Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Startup Name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              1. Startup Name / Concept Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g. CampusCart, StudySync, EcoDrop"
              className="w-full text-xs md:text-sm px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
            />
          </div>

          {/* 2. Industry */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              2. Industry / Sector
            </label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* 12. Development Stage */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              12. Development Stage
            </label>
            <select
              name="development_stage"
              value={formData.development_stage}
              onChange={handleChange}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
            >
              {stages.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* 3. Problem Statement */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              3. Problem Statement (What friction exists?) <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="problem_statement"
              rows={3}
              value={formData.problem_statement}
              onChange={handleChange}
              required
              placeholder="Detail the specific customer pain, wasted time, financial cost, or frustration."
              className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white leading-relaxed"
            />
          </div>

          {/* 4. Proposed Solution */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              4. Proposed Solution (How do you solve it?) <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="proposed_solution"
              rows={3}
              value={formData.proposed_solution}
              onChange={handleChange}
              required
              placeholder="Explain the workflow, platform features, or technology architecture."
              className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white leading-relaxed"
            />
          </div>

          {/* 5. Target Customers */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              5. Target Customers (Who is the primary buyer?)
            </label>
            <input
              type="text"
              name="target_customers"
              value={formData.target_customers}
              onChange={handleChange}
              placeholder="e.g. University engineering students, VP of Ops at mid-market SaaS"
              className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
            />
          </div>

          {/* 6. Target Geography */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              6. Target Geography
            </label>
            <input
              type="text"
              name="target_geography"
              value={formData.target_geography}
              onChange={handleChange}
              placeholder="e.g. United States, Regional Midwest, European Union"
              className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
            />
          </div>

          {/* 7. Current Alternatives */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              7. Current Alternatives & Workarounds
            </label>
            <input
              type="text"
              name="current_alternatives"
              value={formData.current_alternatives}
              onChange={handleChange}
              placeholder="e.g. Excel spreadsheets, Facebook groups, legacy enterprise vendors"
              className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
            />
          </div>

          {/* 8. Unique Value Proposition (UVP) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              8. Unique Value Proposition (Why choose you?)
            </label>
            <input
              type="text"
              name="unique_value_proposition"
              value={formData.unique_value_proposition}
              onChange={handleChange}
              placeholder="e.g. 10x faster onboarding with zero manual spreadsheet exports"
              className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
            />
          </div>

          {/* 9. Available Budget */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              9. Available Budget / Capital
            </label>
            <input
              type="text"
              name="available_budget"
              value={formData.available_budget}
              onChange={handleChange}
              placeholder="e.g. $5,000 student grant, self-funded"
              className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
            />
          </div>

          {/* 10. Team Skills */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              10. Team Skills & Execution Capabilities
            </label>
            <input
              type="text"
              name="team_skills"
              value={formData.team_skills}
              onChange={handleChange}
              placeholder="e.g. 1 Full-Stack developer, 1 Growth marketer"
              className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
            />
          </div>

          {/* 11. Business Model */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              11. Business Model & Monetization Plan
            </label>
            <input
              type="text"
              name="business_model"
              value={formData.business_model}
              onChange={handleChange}
              placeholder="e.g. 10% transaction fee, $29/mo SaaS subscription, freemium tiered"
              className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 bg-white"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            All fields can be edited at any time in your startup workspace.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all hover:scale-[1.02]"
          >
            <span>{loading ? "Creating & Initializing..." : "Submit Startup Idea"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
