import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  FileText,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { api } from '../services/api';
import type { ApplicationItem, ApplicationStatus } from '../types';

const STATUS_COLUMNS: Array<{ id: ApplicationStatus; label: string; color: string }> = [
  { id: 'saved', label: 'Saved', color: 'bg-slate-100 text-slate-700' },
  { id: 'preparing', label: 'Preparing', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
  { id: 'ready_for_review', label: 'Ready for Review', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  { id: 'submitted', label: 'Submitted', color: 'bg-indigo-50 text-indigo-700 border border-indigo-200' },
  { id: 'interview', label: 'Interviewing', color: 'bg-purple-50 text-purple-700 border border-purple-200' },
  { id: 'accepted', label: 'Accepted', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
];

export const ApplicationTrackerView: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [coverLetterText, setCoverLetterText] = useState('');
  const [statusError, setStatusError] = useState<string | null>(null);

  const fetchApps = () => {
    setLoading(true);
    api.getApplications()
      .then((res) => setApplications(res.applications))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleUpdateStatus = async (appId: string, nextStatus: ApplicationStatus) => {
    setStatusError(null);
    try {
      await api.updateApplication(appId, { status: nextStatus });
      fetchApps();
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, status: nextStatus });
      }
    } catch (err: any) {
      setStatusError(err.message || 'Status transition prohibited');
      setTimeout(() => setStatusError(null), 4000);
    }
  };

  const handleGenerateCoverLetter = async (appItem: ApplicationItem) => {
    setIsGeneratingCoverLetter(true);
    try {
      const res = await api.generateCoverLetter({
        opportunityId: appItem.opportunityId,
        companyName: appItem.organization,
        roleTitle: appItem.opportunityTitle,
      });
      setCoverLetterText(res.coverLetter);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Application Tracker & Materials Prep
            </h1>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
              {applications.length} Tracked Roles
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            DISCOVER &rarr; ANALYZE &rarr; MATCH &rarr; PREPARE &rarr; REVIEW &rarr; APPROVE &rarr; SUBMIT &rarr; TRACK
          </p>
        </div>

        <button
          onClick={() => setActiveTab('opportunities')}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add from Opportunities</span>
        </button>
      </div>

      {statusError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{statusError}</span>
        </div>
      )}

      {/* Kanban Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STATUS_COLUMNS.map((col) => {
          const items = applications.filter((a) => a.status === col.id);
          return (
            <div key={col.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3 space-y-3 min-h-[350px]">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold text-slate-800">{col.label}</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                  {items.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {items.map((appItem) => (
                  <div
                    key={appItem.id}
                    onClick={() => {
                      setSelectedApp(appItem);
                      setCoverLetterText(appItem.documents?.coverLetter || '');
                    }}
                    className={`rounded-xl border bg-white p-3.5 shadow-xs cursor-pointer hover:border-blue-400 hover:shadow-md transition space-y-2 ${
                      selectedApp?.id === appItem.id ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700">
                        <Building2 className="h-3 w-3" />
                        {appItem.organization}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                      {appItem.opportunityTitle}
                    </h4>

                    {appItem.notes && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                        "{appItem.notes}"
                      </p>
                    )}

                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
                      <span>{new Date(appItem.updatedAt).toLocaleDateString()}</span>
                      <span className="font-semibold text-blue-600">Details &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Application Details & AI Preparation Drawer */}
      {selectedApp && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700">{selectedApp.organization}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 capitalize">
                  Status: {selectedApp.status.replace('_', ' ')}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-1">{selectedApp.opportunityTitle}</h2>
            </div>

            {/* Status Transition Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Advance Stage:</span>
              <select
                value={selectedApp.status}
                onChange={(e) => handleUpdateStatus(selectedApp.id, e.target.value as ApplicationStatus)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {STATUS_COLUMNS.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AI Application Preparation Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Cover Letter Generator */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  Tailored Cover Letter (Gemini AI)
                </span>
                <button
                  onClick={() => handleGenerateCoverLetter(selectedApp)}
                  disabled={isGeneratingCoverLetter}
                  className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isGeneratingCoverLetter ? 'Generating...' : 'Generate with Gemini'}
                </button>
              </div>

              <textarea
                rows={9}
                value={coverLetterText}
                onChange={(e) => setCoverLetterText(e.target.value)}
                placeholder="Click 'Generate with Gemini' to tailor a professional cover letter highlighting your coursework and projects..."
                className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-800 leading-relaxed font-sans"
              />

              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>Personalize and copy before official submission</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(coverLetterText);
                    alert('Cover letter copied to clipboard!');
                  }}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Copy Cover Letter
                </button>
              </div>
            </div>

            {/* Right: Submission Checklist & Interview Prep */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs font-extrabold text-slate-900 block">
                Pre-Submission Verification Checklist
              </span>

              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                  <span className="font-semibold text-slate-800">Resume parsed and formatted for ATS compatibility</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                  <span className="font-semibold text-slate-800">GitHub repositories have clear README and architecture diagrams</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="font-semibold text-slate-800">Reviewed official portal requirements (graduation window match)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                  <input type="checkbox" className="rounded text-blue-600" />
                  <span className="font-semibold text-slate-800">Referred by or connected with engineer at {selectedApp.organization}</span>
                </label>
              </div>

              {/* Official Handoff */}
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                <strong className="block font-bold">Manual Portal Submission Handoff:</strong>
                <span>Direct authorized link to submit your verified application package:</span>
                <div className="pt-2">
                  <a
                    href="https://careers.google.com/jobs/results/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    <span>Open Official Career Portal</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
