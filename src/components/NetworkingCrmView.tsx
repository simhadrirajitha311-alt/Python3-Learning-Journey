import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  Clock,
  Edit3,
  Copy,
  Users,
  Building2,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import type { ConnectionDraft, NetworkingTarget } from '../types';

export const NetworkingCrmView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'approval' | 'crm'>('approval');
  const [drafts, setDrafts] = useState<ConnectionDraft[]>([]);
  const [targets, setTargets] = useState<NetworkingTarget[]>([]);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editContent, setEditContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    api.getNetworking()
      .then((res) => {
        setDrafts(res.drafts);
        setTargets(res.targets);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartEdit = (draft: ConnectionDraft) => {
    setEditingDraftId(draft.id);
    setEditSubject(draft.subject);
    setEditContent(draft.content);
  };

  const handleSaveEdit = async (draftId: string) => {
    try {
      await api.updateDraft(draftId, { subject: editSubject, content: editContent });
      setEditingDraftId(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (draftId: string) => {
    try {
      await api.approveDraft(draftId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const pendingDrafts = drafts.filter((d) => d.status === 'draft');
  const approvedDrafts = drafts.filter((d) => d.status === 'approved');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              AI Networking & Message Approval Center
            </h1>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
              Human-in-the-Loop Enforced
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Zero automated spam. Every connection request and outreach message must be explicitly reviewed and approved by you.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('approval')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'approval'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approval Center ({pendingDrafts.length})
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'crm'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Networking CRM ({targets.length})
          </button>
        </div>
      </div>

      {activeTab === 'approval' ? (
        /* Approval Center Content */
        <div className="space-y-6">
          {/* Safeguard info card */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 md:p-5 flex items-start gap-3.5">
            <ShieldCheck className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <strong className="font-bold">Privacy & Ethics Guardrail:</strong> AI drafts your messages based on your verified skills and the recipient's engineering publications. Before any message can be dispatched or copied, you must review the contents below, personalize if desired, and click <strong>"Approve Message"</strong>.
            </div>
          </div>

          {/* Pending Drafts List */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Pending Review</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                {pendingDrafts.length} Action Needed
              </span>
            </h2>

            {pendingDrafts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
                No pending message drafts. Visit People Discovery to draft an outreach note to an engineer or professor!
              </div>
            ) : (
              pendingDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 font-bold text-blue-700 text-xs">
                        {draft.targetName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{draft.targetName}</p>
                        <p className="text-[11px] text-slate-500">
                          {draft.targetRole} • <strong className="text-blue-700">{draft.organization}</strong>
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-200 uppercase tracking-wide">
                      {draft.purpose}
                    </span>
                  </div>

                  {editingDraftId === draft.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Subject</label>
                        <input
                          type="text"
                          value={editSubject}
                          onChange={(e) => setEditSubject(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">Message Body</label>
                        <textarea
                          rows={6}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-800 leading-relaxed"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingDraftId(null)}
                          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(draft.id)}
                          className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-500 block">Subject:</span>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">{draft.subject}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[11px] font-bold text-slate-500 block mb-1">Message:</span>
                        <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                          {draft.content}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(draft)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                        <span>Edit Text</span>
                      </button>

                      <button
                        onClick={() => handleCopy(draft.id, `${draft.subject}\n\n${draft.content}`)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        {copiedId === draft.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-slate-500" />
                            <span>Copy to Clipboard</span>
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      onClick={() => handleApprove(draft.id)}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Approve Message</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Approved & Sent History */}
          {approvedDrafts.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Approved & Outreached Archive</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  {approvedDrafts.length} Approved
                </span>
              </h2>

              <div className="space-y-3">
                {approvedDrafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-900">
                          {draft.targetName} ({draft.organization})
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Approved: {draft.approvedAt ? new Date(draft.approvedAt).toLocaleDateString() : 'Today'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 italic">"{draft.subject}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* CRM Pipeline View */
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="pb-3 pl-2">Professional</th>
                  <th className="pb-3">Organization</th>
                  <th className="pb-3">Relationship Stage</th>
                  <th className="pb-3">Last Contact</th>
                  <th className="pb-3">Follow-Up Date</th>
                  <th className="pb-3 pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {targets.map((tgt) => (
                  <tr key={tgt.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 pl-2 font-bold text-slate-900">
                      {tgt.professionalName}
                      <span className="block text-[11px] text-slate-500 font-normal">{tgt.role}</span>
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
                        <Building2 className="h-3 w-3" />
                        {tgt.organization}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 border border-blue-200 capitalize">
                        {tgt.relationshipStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-500">
                      {tgt.lastContactDate ? new Date(tgt.lastContactDate).toLocaleDateString() : 'Pending'}
                    </td>
                    <td className="py-3.5 font-semibold text-amber-700">
                      {tgt.nextFollowUpDate || 'None set'}
                    </td>
                    <td className="py-3.5 pr-2">
                      <button
                        onClick={() => setActiveTab('people')}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
