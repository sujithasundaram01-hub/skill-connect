import React, { useState } from 'react';
import { Skill } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { apiRequest } from '../../api/client.js';
import { X, Calendar, MessageSquare, Send, Sparkles, AlertCircle } from 'lucide-react';

interface RequestModalProps {
  skill: Skill | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  skill,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [preferredTime, setPreferredTime] = useState('');
  const [learningMode, setLearningMode] = useState<string>('Online');
  const [message, setMessage] = useState('');
  const [isSwapRequest, setIsSwapRequest] = useState(false);
  const [swapSkillOffered, setSwapSkillOffered] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !skill) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      error('Please log in to send a learning request.');
      return;
    }

    if (!preferredTime.trim()) {
      error('Please indicate your preferred date or times.');
      return;
    }

    if (isSwapRequest && !swapSkillOffered.trim()) {
      error('Please describe what skill you can teach in exchange.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiRequest('/requests', {
        method: 'POST',
        body: JSON.stringify({
          skillId: skill.id,
          preferredTime: preferredTime.trim(),
          learningMode,
          message: message.trim(),
          isSwapRequest,
          swapSkillOffered: isSwapRequest ? swapSkillOffered.trim() : null,
        }),
      });

      if (res.success) {
        success(res.message || 'Learning request sent successfully!');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        error(res.message || 'Failed to send request.');
      }
    } catch {
      error('An unexpected error occurred while sending the request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              {isSwapRequest ? 'Propose a Skill Swap' : 'Connect & Learn'}
            </h3>
            <p className="text-xs text-stone-500">
              Request to learn from <strong className="text-stone-700">{skill.owner.name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-brand-50/60 border border-brand-200/80 rounded-xl">
            <p className="text-xs text-brand-900 font-semibold mb-0.5">Skill to Learn</p>
            <p className="text-sm font-bold text-stone-900">{skill.skillName}</p>
            <p className="text-xs text-stone-500 mt-1">
              Category: {skill.category} • Offered {skill.learningMode}
            </p>
          </div>

          {/* Preferred Times */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              Your Preferred Days / Times *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Saturdays around 11:00 AM, or weekday evenings"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Teacher availability: {skill.availableDays || 'Flexible'} ({skill.availableTimes || 'Flexible'})
            </p>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Preferred Learning Mode *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLearningMode('Online')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition ${
                  learningMode === 'Online'
                    ? 'bg-brand-50 border-brand-500 text-brand-800'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                🌐 Online (Video / Call)
              </button>
              <button
                type="button"
                onClick={() => setLearningMode('In-Person')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition ${
                  learningMode === 'In-Person'
                    ? 'bg-brand-50 border-brand-500 text-brand-800'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                📍 In-Person (Safe Local Area)
              </button>
            </div>
          </div>

          {/* Skill Swap Toggle */}
          <div className="pt-2 border-t border-stone-100">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSwapRequest}
                onChange={(e) => setIsSwapRequest(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
              />
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Propose a Skill Swap (I teach in return)
              </span>
            </label>

            {isSwapRequest && (
              <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-amber-900">
                  What skill can you share with {skill.owner.name}? *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Basic Spanish conversation, Gardening, Guitar..."
                  value={swapSkillOffered}
                  onChange={(e) => setSwapSkillOffered(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />
                <p className="text-[11px] text-amber-800">
                  “I teach you {swapSkillOffered || '...'}, you teach me {skill.skillName}.”
                </p>
              </div>
            )}
          </div>

          {/* Friendly Note */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
              Introductory Message (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Say hello, mention your background or what you hope to get out of learning this skill..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/80 flex items-start gap-2 text-xs text-stone-500">
            <AlertCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <span>
              Once accepted by {skill.owner.name}, safe private messaging will be unlocked so you can coordinate smoothly.
            </span>
          </div>

          {/* Actions */}
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
              className="px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Sending Request...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
