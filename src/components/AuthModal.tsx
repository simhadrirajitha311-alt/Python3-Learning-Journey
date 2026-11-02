import React, { useState } from 'react';
import { Sparkles, Lock, Mail, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, switchDemoRole } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'educator' | 'professional' | 'recruiter'>('student');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(email, password, role, fullName);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPreset = (selectedRole: 'student' | 'recruiter') => {
    switchDemoRole(selectedRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {isLoginMode ? 'Sign In to CareerBridge AI' : 'Create Student Account'}
              </h2>
              <p className="text-[11px] text-slate-500">JWT Authentication & Role Isolation</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            ✕
          </button>
        </div>

        {/* Demo Fast Logins */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <span className="text-[11px] font-bold text-slate-600 block">Quick Demo Account Presets:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoPreset('student')}
              className="py-1.5 px-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-700 text-xs font-semibold text-slate-700 shadow-xs transition"
            >
              🎓 Alex Chen (Student)
            </button>
            <button
              type="button"
              onClick={() => handleDemoPreset('recruiter')}
              className="py-1.5 px-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-700 text-xs font-semibold text-slate-700 shadow-xs transition"
            >
              🏢 Recruiter (Google)
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {!isLoginMode && (
            <>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Patel"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
                >
                  <option value="student">Student / Aspiring Engineer</option>
                  <option value="educator">Professor / Educator</option>
                  <option value="professional">Professional / Mentor</option>
                  <option value="recruiter">Recruiter</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLoginMode ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs">
          {isLoginMode ? (
            <p className="text-slate-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsLoginMode(false)}
                className="font-bold text-blue-600 hover:underline"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p className="text-slate-500">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setIsLoginMode(true)}
                className="font-bold text-blue-600 hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
