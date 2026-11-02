import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Users,
  Send,
  FileCheck2,
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Opportunity, ProfessionalProfile, ApplicationItem } from '../types';

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
  onOpenDraftModal?: (profId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const { user, profile, completion } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getOpportunities(),
      api.getPeople(),
      api.getApplications(),
    ])
      .then(([oppRes, peopleRes, appRes]) => {
        setOpportunities(oppRes.opportunities);
        setProfessionals(peopleRes.people);
        setApplications(appRes.applications);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const completionPct = completion?.percentage || 92;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-6 md:p-8 text-white shadow-md">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300 border border-blue-400/30">
            <Sparkles className="h-3.5 w-3.5 text-blue-300" />
            <span>AI Career Automation Active</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName || 'Alex'}!
          </h1>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Your profile is currently matched with <strong className="text-white">Google Software Engineering Intern 2027</strong> and <strong className="text-white">Microsoft AI Fellowship</strong>. You have 1 pending outreach draft awaiting your review in the Approval Center.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('opportunities')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-500 transition"
            >
              <Compass className="h-4 w-4" />
              <span>Explore Matched Roles</span>
            </button>
            <button
              onClick={() => setActiveTab('networking')}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition backdrop-blur border border-white/10"
            >
              <Send className="h-4 w-4" />
              <span>Review Message Drafts</span>
            </button>
          </div>
        </div>

        {/* Decorative corner background */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Profile Readiness</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{completionPct}%</span>
            <span className="text-xs font-medium text-emerald-600">Top 10% candidate</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Applications</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileCheck2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{applications.length}</span>
            <span className="text-xs font-medium text-slate-500">Across 2 tech giants</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">1 preparing, 1 ready for review</p>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Verified Opportunities</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{opportunities.length}</span>
            <span className="text-xs font-medium text-blue-600 font-semibold">100% verified URLs</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Google, Microsoft, Stanford, GSoC</p>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Network Connections</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{professionals.length}</span>
            <span className="text-xs font-medium text-purple-600">Staff Scientists & TLs</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Open for student mentorship</p>
        </div>
      </div>

      {/* Main Grid: Recommended Opportunities & Top Mentors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Recommended Opportunities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recommended Verified Opportunities</h2>
              <p className="text-xs text-slate-500">Curated through AI skill graph alignment</p>
            </div>
            <button
              onClick={() => setActiveTab('opportunities')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>View All ({opportunities.length})</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {opportunities.slice(0, 3).map((opp) => (
              <div
                key={opp.id}
                className="group relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                        <Building2 className="h-3 w-3" />
                        {opp.organization}
                      </span>
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200/60">
                        {opp.match?.matchScore || 85}% Match
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {opp.location}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                      {opp.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {opp.description}
                    </p>

                    {/* Skill Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {opp.requiredSkills.map((sk) => (
                        <span
                          key={sk}
                          className="rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200/70"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Deadline */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-3">
                    <div className="text-left sm:text-right">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Deadline: {opp.deadline}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                        {opp.compensation}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={opp.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="h-3 w-3 text-slate-400" />
                      </a>
                      <button
                        onClick={() => {
                          api.saveApplication(opp.id).then(() => setActiveTab('applications'));
                        }}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
                      >
                        Apply / Track
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 span): Mentors & Upcoming Deadlines */}
        <div className="space-y-6">
          {/* Top Mentors */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Featured Mentors</h3>
                <p className="text-[11px] text-slate-500">Google & Microsoft Engineers</p>
              </div>
              <button
                onClick={() => setActiveTab('people')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Discover
              </button>
            </div>

            <div className="space-y-3">
              {professionals.slice(0, 3).map((prof) => (
                <div key={prof.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{prof.fullName}</p>
                      <p className="text-[11px] text-slate-600 font-medium">
                        {prof.role} • <strong className="text-blue-700">{prof.organization}</strong>
                      </p>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" title="Mentorship Open" />
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {prof.bio}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                      {prof.department}
                    </span>
                    <button
                      onClick={() => setActiveTab('people')}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Draft Note</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deadlines & Automation Status */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Upcoming Deadlines</span>
              <Calendar className="h-4 w-4 text-slate-400" />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/50 text-xs">
                <div>
                  <p className="font-bold text-amber-900">Google SWE Intern 2027</p>
                  <p className="text-[11px] text-amber-700">Official Portal Application</p>
                </div>
                <span className="font-extrabold text-amber-800">43 Days</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/50 text-xs">
                <div>
                  <p className="font-bold text-blue-900">Microsoft AI Fellowship</p>
                  <p className="text-[11px] text-blue-700">Research proposal submission</p>
                </div>
                <span className="font-extrabold text-blue-800">58 Days</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('automation')}
              className="w-full text-center py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 border border-dashed border-slate-200 rounded-lg hover:border-blue-300 transition"
            >
              Configure Celery Automation Workflows &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
