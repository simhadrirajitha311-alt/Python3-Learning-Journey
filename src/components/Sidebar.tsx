import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Users,
  Send,
  FileText,
  FileCheck2,
  Bot,
  Cpu,
  BarChart3,
  UserCheck,
  Settings,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { completion } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'opportunities', label: 'Opportunities', icon: Compass, badge: 'Verified' },
    { id: 'people', label: 'People Discovery', icon: Users },
    { id: 'networking', label: 'Approval & CRM', icon: Send, badge: 'HITL' },
    { id: 'applications', label: 'Application Tracker', icon: FileCheck2 },
    { id: 'resume', label: 'Resume & Skills', icon: FileText },
    { id: 'assistant', label: 'AI Career Copilot', icon: Bot, highlight: true },
    { id: 'automation', label: 'Cloud Automation', icon: Cpu },
    { id: 'analytics', label: 'Career Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Student Profile', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const completionPct = completion?.percentage || 92;

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between p-4 shrink-0 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-6">
        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200/60'
                    : item.highlight
                    ? 'text-indigo-600 hover:bg-indigo-50/50'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? 'text-blue-600' : item.highlight ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      isActive
                        ? 'bg-blue-200/60 text-blue-800'
                        : 'bg-slate-100 text-slate-600 border border-slate-200/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Completion Widget in Sidebar */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-50 to-blue-50/40 border border-blue-100/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">Profile Readiness</span>
            <span className="text-xs font-black text-blue-700">{completionPct}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden mb-2.5">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPct}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mb-2">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Google SWE Match ready</span>
          </div>

          <button
            onClick={() => setActiveTab('profile')}
            className="w-full py-1.5 text-center text-[11px] font-semibold text-blue-700 bg-white border border-blue-200/80 rounded-lg shadow-xs hover:bg-blue-50 transition"
          >
            Optimize Profile
          </button>
        </div>

        {/* Verification badge */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
          <Sparkles className="h-3 w-3 text-sky-500" />
          <span>MongoDB Atlas + Celery Live</span>
        </div>
      </div>
    </aside>
  );
};
