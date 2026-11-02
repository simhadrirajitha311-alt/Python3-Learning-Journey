import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Building2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Send,
  MessageSquare,
  BookOpen,
  Award,
  CheckCircle,
} from 'lucide-react';
import { api } from '../services/api';
import type { ProfessionalProfile } from '../types';

interface PeopleDiscoveryViewProps {
  setActiveTab: (tab: string) => void;
}

export const PeopleDiscoveryView: React.FC<PeopleDiscoveryViewProps> = ({ setActiveTab }) => {
  const [people, setPeople] = useState<ProfessionalProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');

  // AI Outreach Draft Modal State
  const [draftTarget, setDraftTarget] = useState<ProfessionalProfile | null>(null);
  const [draftPurpose, setDraftPurpose] = useState<'mentorship' | 'research' | 'referral' | 'connection'>('mentorship');
  const [customNote, setCustomNote] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<{ subject: string; body: string } | null>(null);

  const fetchPeople = () => {
    setLoading(true);
    api.getPeople({
      search: search || undefined,
      company: selectedCompany !== 'All' ? selectedCompany : undefined,
    })
      .then((res) => setPeople(res.people))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPeople();
  }, [selectedCompany]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPeople();
  };

  const handleGenerateOutreach = async () => {
    if (!draftTarget) return;
    setIsDrafting(true);
    try {
      const res = await api.generateNetworkingMessage({
        professionalId: draftTarget.id,
        purpose: draftPurpose,
        customNotes: customNote,
      });
      setGeneratedDraft({ subject: res.subject, body: res.body });
    } catch (err) {
      console.error(err);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSaveToApprovalCenter = async () => {
    if (!draftTarget || !generatedDraft) return;
    try {
      await api.createDraft({
        targetProfessionalId: draftTarget.id,
        purpose: draftPurpose,
        subject: generatedDraft.subject,
        content: generatedDraft.body,
      });
      setDraftTarget(null);
      setGeneratedDraft(null);
      setActiveTab('networking');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              AI People & Mentor Discovery
            </h1>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
              Verified Engineers & Faculty
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Connect with verified Google, Microsoft, and Stanford researchers. Anti-spam compliant with mandatory human sign-off.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('networking')}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <Send className="h-4 w-4" />
          <span>Message Approval Center</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, engineering specialty (e.g. Distributed Systems, RL), or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition shrink-0"
          >
            Find Engineers
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="h-3.5 w-3.5" /> Organization:
          </span>
          {['All', 'Google', 'Microsoft', 'Stanford University'].map((comp) => (
            <button
              key={comp}
              onClick={() => setSelectedCompany(comp)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                selectedCompany === comp
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              {comp}
            </button>
          ))}
        </div>
      </div>

      {/* People Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">Loading professionals...</div>
        ) : (
          people.map((prof) => (
            <div
              key={prof.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-100 to-indigo-100 text-base font-extrabold text-blue-700 border border-blue-200/50">
                      {prof.fullName.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{prof.fullName}</h3>
                      <p className="text-xs text-slate-600 font-medium">
                        {prof.role} • <strong className="text-blue-700">{prof.organization}</strong>
                      </p>
                    </div>
                  </div>
                  {prof.mentorshipOpen && (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200" title="Mentorship Open">
                      Mentorship Open
                    </span>
                  )}
                </div>

                {/* Verified Source */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{prof.verifiedSource}</span>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {prof.bio}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {prof.skills.map((sk) => (
                    <span
                      key={sk}
                      className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200/60"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={prof.verifiedProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                >
                  <span>Public Record</span>
                  <ExternalLink className="h-3 w-3" />
                </a>

                <button
                  onClick={() => {
                    setDraftTarget(prof);
                    setGeneratedDraft(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
                >
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  <span>Draft AI Outreach</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* AI Outreach Drafter Modal */}
      {draftTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                  AI Networking Assistant
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  Draft Personalized Outreach to {draftTarget.fullName}
                </h3>
                <p className="text-xs text-slate-500">
                  {draftTarget.role} at {draftTarget.organization}
                </p>
              </div>
              <button
                onClick={() => {
                  setDraftTarget(null);
                  setGeneratedDraft(null);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Purpose Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">Communication Purpose:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'mentorship', label: 'Mentorship' },
                  { id: 'research', label: 'Research Inquiry' },
                  { id: 'referral', label: 'Career / Referral' },
                  { id: 'connection', label: 'Informational' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setDraftPurpose(p.id as any)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                      draftPurpose === p.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                Additional context or shared projects (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Built a Raft KV store; curious about Azure storage architecture..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Generate Trigger */}
            <div className="flex justify-end">
              <button
                onClick={handleGenerateOutreach}
                disabled={isDrafting}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-300" />
                <span>{isDrafting ? 'Generating with Gemini...' : 'Generate AI Draft'}</span>
              </button>
            </div>

            {/* Generated Draft Display */}
            {generatedDraft && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    Review Draft Content
                  </span>
                  <span className="text-[11px] text-slate-500">Subject & Body</span>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={generatedDraft.subject}
                    onChange={(e) => setGeneratedDraft({ ...generatedDraft, subject: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800"
                  />
                  <textarea
                    rows={6}
                    value={generatedDraft.body}
                    onChange={(e) => setGeneratedDraft({ ...generatedDraft, body: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-800 leading-relaxed font-sans"
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed">
                  <strong>Human-in-the-Loop Safeguard:</strong> Messages are NEVER sent automatically. Saving this draft sends it to the <strong>Message Approval Center</strong> for your explicit authorization.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      setDraftTarget(null);
                      setGeneratedDraft(null);
                    }}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveToApprovalCenter}
                    className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition"
                  >
                    Send to Approval Center
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
