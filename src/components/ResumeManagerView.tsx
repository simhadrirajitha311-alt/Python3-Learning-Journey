import React, { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Sparkles,
  Award,
  AlertCircle,
  FileCheck,
  Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ResumeManagerView: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [atsScore, setAtsScore] = useState(88);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccess(null);
    try {
      const res = await api.uploadResume(file);
      setAtsScore(res.aiScore || 88);
      setUploadSuccess(`Resume "${res.fileName}" successfully uploaded & parsed! Extracted ${res.extractedSkills.length} skills.`);
      await refreshProfile();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const currentSkills = profile?.technicalSkills || [
    'Python',
    'TypeScript',
    'Distributed Systems',
    'PyTorch',
    'Docker',
    'PostgreSQL',
    'React',
  ];

  const suggestedSkillsToAdd = [
    'Kubernetes & Helm',
    'gRPC & Protocol Buffers',
    'CI/CD GitHub Actions',
    'Redis Cache Invalidation',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            AI Resume Parser & Skills Extraction
          </h1>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
            ATS Optimizer
          </span>
        </div>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Upload your latest resume to automatically parse technical skills, calculate ATS match readiness, and surface missing competencies for Google and Microsoft applications.
        </p>
      </div>

      {uploadSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-center hover:border-blue-400 transition-colors">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3">
          <Upload className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Upload your PDF or DOCX Resume</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          AI will scan your education, technical stack, and bullet point metrics. Max size: 10MB.
        </p>

        <label className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 cursor-pointer transition">
          <FileText className="h-4 w-4" />
          <span>{isUploading ? 'Extracting Skills...' : 'Select Resume File'}</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Analytics & Skills Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ATS Score Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">ATS Readiness Score</span>
            <Award className="h-4 w-4 text-blue-600" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-blue-700">{atsScore}</span>
            <span className="text-sm text-slate-400 font-bold">/ 100</span>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${atsScore}%` }} />
          </div>

          <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span>Section Formatting:</span>
              <strong className="text-emerald-600">Excellent</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Action Verbs & Impact:</span>
              <strong className="text-blue-600">Strong (4 projects)</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Quantified Metrics:</span>
              <strong className="text-amber-600">Moderate</strong>
            </div>
          </div>
        </div>

        {/* Extracted Skills */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Extracted Technical Skills ({currentSkills.length})</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Synced with Profile</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {currentSkills.map((sk) => (
              <span
                key={sk}
                className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800 border border-blue-200"
              >
                {sk}
              </span>
            ))}
          </div>

          {/* Missing Skills Recommendation */}
          <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              High-Yield Skills to Boost Google/Microsoft Alignment:
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestedSkillsToAdd.map((s) => (
                <span
                  key={s}
                  className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200 flex items-center gap-1"
                >
                  <span>+</span>
                  <span>{s}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
