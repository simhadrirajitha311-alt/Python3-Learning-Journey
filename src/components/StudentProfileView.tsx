import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Building2,
  GraduationCap,
  Code2,
  FolderGit2,
  Link,
  Award,
  Sparkles,
  Save,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { StudentProfile } from '../types';

export const StudentProfileView: React.FC = () => {
  const { profile, completion, refreshProfile } = useAuth();
  const [formData, setFormData] = useState<Partial<StudentProfile>>({});
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await api.updateProfile(formData);
      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const skills = [...(formData.technicalSkills || []), newSkill.trim()];
    setFormData({ ...formData, technicalSkills: skills });
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    const skills = (formData.technicalSkills || []).filter((_, i) => i !== index);
    setFormData({ ...formData, technicalSkills: skills });
  };

  const addLanguage = () => {
    if (!newLanguage.trim()) return;
    const langs = [...(formData.programmingLanguages || []), newLanguage.trim()];
    setFormData({ ...formData, programmingLanguages: langs });
    setNewLanguage('');
  };

  const removeLanguage = (index: number) => {
    const langs = (formData.programmingLanguages || []).filter((_, i) => i !== index);
    setFormData({ ...formData, programmingLanguages: langs });
  };

  const addCompany = () => {
    if (!newCompany.trim()) return;
    const comps = [...(formData.preferredCompanies || []), newCompany.trim()];
    setFormData({ ...formData, preferredCompanies: comps });
    setNewCompany('');
  };

  const removeCompany = (index: number) => {
    const comps = (formData.preferredCompanies || []).filter((_, i) => i !== index);
    setFormData({ ...formData, preferredCompanies: comps });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Student Career Profile
            </h1>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
              {completion?.percentage || 92}% Complete
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Keep your skills, projects, and target companies up to date to maximize match accuracy.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
        >
          {savedSuccess ? (
            <>
              <Check className="h-4 w-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-blue-600" /> Basic & Education Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName || ''}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">University Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">University / College</label>
              <input
                type="text"
                value={formData.university || ''}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Degree & Major</label>
              <input
                type="text"
                value={formData.degree || ''}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Current Academic Year</label>
              <select
                value={formData.currentYear || 'Junior (3rd Year)'}
                onChange={(e) => setFormData({ ...formData, currentYear: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Freshman (1st Year)">Freshman (1st Year)</option>
                <option value="Sophomore (2nd Year)">Sophomore (2nd Year)</option>
                <option value="Junior (3rd Year)">Junior (3rd Year)</option>
                <option value="Senior (4th Year)">Senior (4th Year)</option>
                <option value="Master's Student">Master's Student</option>
                <option value="PhD Candidate">PhD Candidate</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Graduation Year</label>
              <input
                type="number"
                value={formData.graduationYear || 2027}
                onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value, 10) })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Technical Skills & Languages */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Code2 className="h-4 w-4 text-blue-600" /> Technical Skills & Programming Languages
          </h2>

          {/* Technical Skills */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">Technical Skills</label>
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl border border-slate-200 bg-slate-50/50">
              {(formData.technicalSkills || []).map((sk, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-blue-100 text-blue-800 px-2.5 py-1 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>{sk}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(idx)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add skill (e.g. Distributed Systems, PyTorch, Docker)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800"
              />
              <button
                type="button"
                onClick={addSkill}
                className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                Add Skill
              </button>
            </div>
          </div>

          {/* Programming Languages */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block">Programming Languages</label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50/50">
              {(formData.programmingLanguages || []).map((lang, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>{lang}</span>
                  <button
                    type="button"
                    onClick={() => removeLanguage(idx)}
                    className="text-emerald-700 hover:text-emerald-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Add language (e.g. Python, Go, C++, TypeScript)..."
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addLanguage();
                  }
                }}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800"
              />
              <button
                type="button"
                onClick={addLanguage}
                className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                Add Language
              </button>
            </div>
          </div>
        </div>

        {/* Projects Showcase */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FolderGit2 className="h-4 w-4 text-blue-600" /> Featured Projects Showcase
            </h2>
          </div>

          <div className="space-y-3">
            {(formData.projects || []).map((proj, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">{proj.title}</span>
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      GitHub Repo &rarr;
                    </a>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {proj.techStack?.map((t) => (
                    <span key={t} className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Professional Profiles & Social Links */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Link className="h-4 w-4 text-blue-600" /> Portfolio & Profiles
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">GitHub Profile URL</label>
              <input
                type="url"
                value={formData.githubProfile || ''}
                onChange={(e) => setFormData({ ...formData, githubProfile: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">LinkedIn Profile URL</label>
              <input
                type="url"
                value={formData.linkedinProfile || ''}
                onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Personal Portfolio / Website</label>
              <input
                type="url"
                value={formData.portfolioWebsite || ''}
                onChange={(e) => setFormData({ ...formData, portfolioWebsite: e.target.value })}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Preferred Companies */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3">
          <label className="text-xs font-bold text-slate-800 block">Preferred Target Companies</label>
          <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50/50">
            {(formData.preferredCompanies || []).map((c, idx) => (
              <span
                key={idx}
                className="rounded-lg bg-indigo-100 text-indigo-800 px-2.5 py-1 text-xs font-bold flex items-center gap-1.5"
              >
                <span>{c}</span>
                <button
                  type="button"
                  onClick={() => removeCompany(idx)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Add company (e.g. Google, Microsoft, OpenAI, Anthropic)..."
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCompany();
                }
              }}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-800"
            />
            <button
              type="button"
              onClick={addCompany}
              className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
            >
              Add Company
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
