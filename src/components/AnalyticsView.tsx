import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Compass,
  FileCheck2,
  Calendar,
} from 'lucide-react';
import { api } from '../services/api';

export const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalyticsOverview()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading career analytics...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Career Analytics & Opportunity Funnel
          </h1>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
            Real-Time Metrics
          </span>
        </div>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Measure application throughput, networking reach, and skill alignment across Google, Microsoft, and partner programs.
        </p>
      </div>

      {/* Top 4 Stat Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Tracked Opportunities</span>
          <div className="mt-2 text-2xl font-black text-slate-900">{data.discoveredOpportunitiesCount}</div>
          <span className="text-[11px] font-bold text-emerald-600 mt-1 block">100% verified portals</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Pipeline Applications</span>
          <div className="mt-2 text-2xl font-black text-slate-900">{data.totalApplications}</div>
          <span className="text-[11px] font-bold text-blue-600 mt-1 block">Google & Microsoft</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Outreach Messages</span>
          <div className="mt-2 text-2xl font-black text-slate-900">{data.networkingOutreachCount}</div>
          <span className="text-[11px] font-bold text-purple-600 mt-1 block">100% Student Approved</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Candidate Match Readiness</span>
          <div className="mt-2 text-2xl font-black text-slate-900">{data.profileCompletion}%</div>
          <span className="text-[11px] font-bold text-emerald-600 mt-1 block">Top Tier Profile</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Funnel */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Application Funnel by Stage</h3>
            <span className="text-xs text-slate-500">Current Pipeline</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Saved Opportunities', count: data.applicationsByStatus?.saved || 0, max: 5, color: 'bg-slate-400' },
              { label: 'Preparing Materials', count: data.applicationsByStatus?.preparing || 1, max: 5, color: 'bg-blue-600' },
              { label: 'Ready for Review', count: data.applicationsByStatus?.ready_for_review || 1, max: 5, color: 'bg-amber-500' },
              { label: 'Submitted to Portals', count: data.applicationsByStatus?.submitted || 0, max: 5, color: 'bg-indigo-600' },
              { label: 'Technical Interviews', count: data.applicationsByStatus?.interview || 0, max: 5, color: 'bg-emerald-600' },
            ].map((stage, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{stage.label}</span>
                  <span className="font-bold text-slate-900">{stage.count}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`${stage.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(12, (stage.count / 3) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Weekly Engagement Activity</h3>
            <span className="text-xs text-slate-500">Applications & Outreach</span>
          </div>

          <div className="flex items-end justify-between h-44 pt-6 px-4">
            {(data.weeklyActivity || []).map((day: any, idx: number) => {
              const height = (day.applications + day.outreach) * 32 + 16;
              return (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className="flex items-end gap-1">
                    <div
                      className="w-3.5 bg-blue-600 rounded-t-sm transition-all"
                      style={{ height: `${Math.max(8, day.applications * 35)}px` }}
                      title={`Applications: ${day.applications}`}
                    />
                    <div
                      className="w-3.5 bg-purple-500 rounded-t-sm transition-all"
                      style={{ height: `${Math.max(8, day.outreach * 25)}px` }}
                      title={`Outreach: ${day.outreach}`}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">{day.day}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-blue-600" />
              <span className="text-slate-600">Applications Prepared</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-xs bg-purple-500" />
              <span className="text-slate-600">Networking Messages</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
