import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bell,
  Search,
  CheckCircle2,
  UserCheck,
  LogOut,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { NotificationItem } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAuth }) => {
  const { user, logout, switchDemoRole } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    api.getNotifications().then((res) => setNotifications(res.notifications)).catch(() => {});
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur transition-colors">
      {/* Brand & Left Section */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 text-white shadow-sm shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">CareerBridge</span>
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
                AI
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
              Google & Microsoft Career Automation
            </p>
          </div>
        </button>

        {/* Search quick filter */}
        <div className="relative hidden md:block w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search roles, engineers, skills..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setActiveTab('opportunities');
              }
            }}
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick AI Copilot trigger */}
        <button
          onClick={() => setActiveTab('assistant')}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            activeTab === 'assistant'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80'
          }`}
          aria-label="Open AI Career Assistant"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Ask AI Assistant</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[11px] text-blue-600 font-medium cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition cursor-pointer border border-slate-100 text-left"
                    onClick={() => {
                      setShowNotifications(false);
                      if (n.type === 'approval_pending') setActiveTab('networking');
                      if (n.type === 'new_match') setActiveTab('opportunities');
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                      <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role toggle badge */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => switchDemoRole('student')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              user?.role === 'student' ? 'bg-white text-blue-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Mode
          </button>
          <button
            onClick={() => switchDemoRole('recruiter')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${
              user?.role === 'recruiter' ? 'bg-white text-blue-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recruiter Mode
          </button>
        </div>

        {/* User Account / Menu */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs font-medium text-slate-800 hover:bg-slate-50 transition"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                {user.fullName?.charAt(0) || 'A'}
              </div>
              <div className="text-left hidden md:block">
                <span className="block font-semibold text-slate-900 leading-tight">{user.fullName}</span>
                <span className="block text-[10px] text-slate-500 capitalize">{user.role}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-2 shadow-xl z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user.fullName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <UserCheck className="h-4 w-4 text-slate-400" />
                  Edit Profile
                </button>
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  Integration Settings
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4 text-red-500" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
