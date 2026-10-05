import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext.js';
import { apiRequest } from '../../api/client.js';
import { X, Star, ThumbsUp, Award } from 'lucide-react';

interface ReviewModalProps {
  connectionId: string;
  partnerName: string;
  skillName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  connectionId,
  partnerName,
  skillName,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isHelpful, setIsHelpful] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewText.trim() || reviewText.trim().length < 5) {
      error('Please share a few words about your learning experience (at least 5 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiRequest('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          connectionId,
          rating,
          reviewText: reviewText.trim(),
          isHelpful,
        }),
      });

      if (res.success) {
        success('Review submitted successfully! Thank you for supporting community trust.');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        error(res.message || 'Failed to submit review.');
      }
    } catch {
      error('An unexpected error occurred while posting your review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-stone-900">Review Learning Session</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center pb-2">
            <p className="text-xs text-stone-500 mb-1">How was your learning experience with</p>
            <h4 className="text-base font-bold text-stone-900">{partnerName}</h4>
            <p className="text-xs text-stone-600 font-medium">for “{skillName}”?</p>
          </div>

          {/* Interactive Star Rating */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold text-stone-600 mt-2">
              {rating === 5 && '🌟 Excellent experience'}
              {rating === 4 && '👍 Great and helpful'}
              {rating === 3 && '🙂 Good session'}
              {rating === 2 && '😐 Fair, could be improved'}
              {rating === 1 && '👎 Not satisfied'}
            </span>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Your Review / Feedback *
            </label>
            <textarea
              required
              rows={4}
              placeholder="What did you learn? Was the explanation patient and clear? What would you tell other community members?"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </div>

          {/* Helpful toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none bg-stone-50 p-3 rounded-xl border border-stone-200">
            <input
              type="checkbox"
              checked={isHelpful}
              onChange={(e) => setIsHelpful(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-stone-300"
            />
            <span className="text-xs font-medium text-stone-700 flex items-center gap-1.5">
              <ThumbsUp className="w-3.5 h-3.5 text-brand-600" />
              I found this learning interaction genuinely helpful
            </span>
          </label>

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
              className="px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl shadow-sm transition"
            >
              {isSubmitting ? 'Posting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
