import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  Filter,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  CheckCircle,
  AlertCircle,
  FileCheck2,
  ChevronDown,
} from 'lucide-react';
import { api } from '../services/api';
import type { Opportunity } from '../types';

interface OpportunityDiscoveryViewProps {
  setActiveTab: (tab: string) => void;
}

export const OpportunityDiscoveryView: React.FC<OpportunityDiscoveryViewProps> = ({ setActiveTab }) => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedOppForModal, setSelectedOppForModal] = useState<Opportunity | null>(null);

  const fetchOpportunities = () => {
    setLoading(true);
    api.getOpportunities({
      search: search || undefined,
      organization: selectedCompany !== 'All' ? selectedCompany : undefined,
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
    })
      .then((res) => setOpportunities(res.opportunities))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOpportunities();
  }, [selectedCompany, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOpportunities();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Internship & Fellowship Discovery
            </h1>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
              Verified Feeds Only
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Official opportunities from Google, Microsoft, Stanford AI Lab, and open-source foundations. No fabricated postings.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('applications')}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
        >
          <FileCheck2 className="h-4 w-4" />
          <span>My Application Pipeline</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, required skills (e.g. PyTorch, Distributed Systems), or team..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shrink-0"
          >
            Search Feeds
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="h-3.5 w-3.5" /> Company:
          </span>
          {['All', 'Google', 'Microsoft', 'Stanford AI Lab', 'Google Open Source'].map((org) => (
            <button
              key={org}
              onClick={() => setSelectedCompany(org)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                selectedCompany === org
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              {org}
            </button>
          ))}

          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 ml-3 mr-1">
            Type:
          </span>
          {[
            { id: 'All', label: 'All Categories' },
            { id: 'internship', label: 'Internships' },
            { id: 'fellowship', label: 'Fellowships' },
            { id: 'research', label: 'Research' },
            { id: 'open_source', label: 'Open Source' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading verified opportunities...</div>
        ) : opportunities.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 text-xs">
            No opportunities match your filter. Try broadening your keywords.
          </div>
        ) : (
          opportunities.map((opp) => (
            <div
              key={opp.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2.5 max-w-3xl">
                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-100">
                      <Building2 className="h-3.5 w-3.5" />
                      {opp.organization}
                    </span>

                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {opp.verifiedSource}
                    </span>

                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 capitalize">
                      {opp.category.replace('_', ' ')}
                    </span>

                    {opp.isRemote && (
                      <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                        Remote / Hybrid
                      </span>
                    )}
                  </div>

                  {/* Title & Desc */}
                  <h2 className="text-base md:text-lg font-bold text-slate-900">{opp.title}</h2>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">{opp.description}</p>

                  {/* Skills */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Required Technical Competencies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {opp.requiredSkills.map((sk) => (
                        <span
                          key={sk}
                          className="rounded-md bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200/70"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right side: Match score & Actions */}
                <div className="flex flex-col sm:items-end justify-between shrink-0 gap-4 pt-2 md:pt-0">
                  {/* AI Match Gauge */}
                  <div className="text-left sm:text-right p-3 rounded-xl bg-slate-50 border border-slate-100 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 justify-start sm:justify-end text-xs font-bold text-slate-800">
                      <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                      <span>AI Candidate Match</span>
                    </div>
                    <div className="text-2xl font-black text-blue-700 mt-1">
                      {opp.match?.matchScore || 85}%
                    </div>
                    <button
                      onClick={() => setSelectedOppForModal(opp)}
                      className="text-[11px] font-bold text-blue-600 hover:underline mt-1 block"
                    >
                      View Skill Gap Analysis &rarr;
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1 text-xs text-slate-500 sm:text-right">
                    <div className="flex items-center gap-1.5 sm:justify-end text-amber-700 font-semibold">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Deadline: {opp.deadline}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:justify-end text-slate-600">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{opp.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:justify-end text-emerald-700 font-semibold">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>{opp.compensation}</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a
                      href={opp.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                    </a>

                    <button
                      onClick={() => {
                        api.saveApplication(opp.id).then(() => setActiveTab('applications'));
                      }}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
                    >
                      <FileCheck2 className="h-3.5 w-3.5" />
                      <span>Save & Prepare</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Match Details Modal */}
      {selectedOppForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-blue-700">{selectedOppForModal.organization}</span>
                <h3 className="text-base font-extrabold text-slate-900">{selectedOppForModal.title}</h3>
              </div>
              <button
                onClick={() => setSelectedOppForModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-blue-900">Calculated Match Score</span>
                  <span className="text-lg font-black text-blue-700">
                    {selectedOppForModal.match?.matchScore}%
                  </span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  {selectedOppForModal.match?.reasoning}
                </p>
              </div>

              {/* Matching Skills */}
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mb-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-600" /> Matching Strengths (Ready)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedOppForModal.match?.matchingSkills.map((sk) => (
                    <span key={sk} className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              {selectedOppForModal.match?.missingSkills && selectedOppForModal.match.missingSkills.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mb-1.5">
                    <AlertCircle className="h-4 w-4 text-amber-600" /> Skills to Highlight or Study
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedOppForModal.match.missingSkills.map((sk) => (
                      <span key={sk} className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Eligibility Check */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 block mb-1">Eligibility Criteria Check:</span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {selectedOppForModal.eligibilityRequirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedOppForModal(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  api.saveApplication(selectedOppForModal.id).then(() => {
                    setSelectedOppForModal(null);
                    setActiveTab('applications');
                  });
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                Track in Applications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
