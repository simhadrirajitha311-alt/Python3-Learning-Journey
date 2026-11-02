import React, { useState } from 'react';
import {
  Settings,
  Key,
  Database,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Download,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsView: React.FC = () => {
  const { user, profile } = useAuth();
  const [hitlStrict, setHitlStrict] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [crawlerActive, setCrawlerActive] = useState(true);

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ user, profile }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'careerbridge_profile_data.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Integration Settings & Privacy Controls
          </h1>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
            System & Security
          </span>
        </div>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Monitor your MongoDB Atlas database, Redis Celery broker, and Google Gemini API keys.
        </p>
      </div>

      {/* Infrastructure Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gemini */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Google Gemini API</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-xs text-slate-500 font-mono">gemini-2.5-flash</p>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Configured via Server Secret</span>
          </div>
        </div>

        {/* MongoDB */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">MongoDB Atlas</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-xs text-slate-500 font-mono">20 Active Collections</p>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Atlas Connection Active</span>
          </div>
        </div>

        {/* Celery & Redis */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Redis & Celery</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-xs text-slate-500 font-mono">Async Task Scheduler</p>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Workers Online</span>
          </div>
        </div>
      </div>

      {/* Safety & Ethics Settings */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-600" /> Anti-Spam & Ethical AI Safeguards
        </h2>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <p className="font-bold text-slate-900">Mandatory Human-in-the-Loop Message Approval</p>
              <p className="text-[11px] text-slate-500">
                Outreach drafts are NEVER sent autonomously. Each message requires explicit student review and authorization.
              </p>
            </div>
            <input
              type="checkbox"
              checked={hitlStrict}
              onChange={(e) => setHitlStrict(e.target.checked)}
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <p className="font-bold text-slate-900">Application Deadline Crawlers</p>
              <p className="text-[11px] text-slate-500">
                Automatically monitor official Google and Microsoft career pages for updated cutoff dates.
              </p>
            </div>
            <input
              type="checkbox"
              checked={crawlerActive}
              onChange={(e) => setCrawlerActive(e.target.checked)}
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <p className="font-bold text-slate-900">Email Notifications & Digest</p>
              <p className="text-[11px] text-slate-500">
                Receive weekly career progress summaries and high-match internship alerts.
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Data Sovereignty & Account */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Database className="h-4 w-4 text-blue-600" /> Data Sovereignty & Portability
        </h2>

        <p className="text-xs text-slate-600 leading-relaxed">
          CareerBridge AI adheres to GDPR and student privacy guidelines. You retain full ownership of your resumes, extracted skills graph, and message history.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExportData}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export My Data (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
