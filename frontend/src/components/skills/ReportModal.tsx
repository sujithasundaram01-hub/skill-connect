import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { apiRequest } from '../../api/client.js';
import { X, ShieldAlert, Flag } from 'lucide-react';

interface ReportModalProps {
  reportedUserId?: string;
  reportedSkillId?: string;
  reportedName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  reportedUserId,
  reportedSkillId,
  reportedName,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [reason, setReason] = useState('Inappropriate content or spam');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      error('Please log in to submit a report.');
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      error('Please provide some details about the issue (at least 5 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiRequest('/reports', {
        method: 'POST',
        body: JSON.stringify({
          reportedUserId: reportedUserId || null,
          reportedSkillId: reportedSkillId || null,
          reason,
          description: description.trim(),
        }),
      });

      if (res.success) {
        success('Thank you. Your report has been submitted to community moderation.');
        onClose();
      } else {
        error(res.message || 'Failed to submit report.');
      }
    } catch {
      error('An error occurred while submitting the report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-800">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="text-base font-bold">Report Community Concern</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed">
            Help us maintain a respectful, safe environment. Reporting <strong>{reportedName}</strong> is confidential and reviewed by our moderation team.
          </p>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Reason for Report *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            >
              <option value="Inappropriate content or spam">Inappropriate content or spam</option>
              <option value="Commercial solicitation / selling items">Commercial solicitation / selling items</option>
              <option value="Harassment or disrespectful behavior">Harassment or disrespectful behavior</option>
              <option value="Fake or misleading skill profile">Fake or misleading skill profile</option>
              <option value="Safety or privacy violation">Safety or privacy violation</option>
              <option value="Other concern">Other concern</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Details *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Please describe what happened so our moderation team can investigate fairly..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Flag className="w-4 h-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
