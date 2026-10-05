import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { apiRequest } from '../api/client.js';
import { Save, Trash2, ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  'Cooking',
  'Photography',
  'Handcraft',
  'Gardening',
  'Technology',
  'Languages',
  'Music',
  'Fitness',
  'Business',
  'Communication',
  'Art & Design',
  'Other Skills',
];

export const EditSkill: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState('Cooking');
  const [description, setDescription] = useState('');
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'>('All Levels');
  const [language, setLanguage] = useState('English');
  const [learningMode, setLearningMode] = useState<'Online' | 'In-Person' | 'Both'>('Both');
  const [availableDays, setAvailableDays] = useState('');
  const [availableTimes, setAvailableTimes] = useState('');
  const [targetLearners, setTargetLearners] = useState('');
  const [generalArea, setGeneralArea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSkill = async () => {
      try {
        const res = await apiRequest(`/skills/${id}`);
        if (res.success && res.skill) {
          const s = res.skill;
          if (s.owner.id !== user?.id && user?.role !== 'ADMIN') {
            error('You are not authorized to edit this skill.');
            navigate('/my-skills');
            return;
          }
          setSkillName(s.skillName);
          setCategory(s.category);
          setDescription(s.description);
          setSkillLevel(s.skillLevel);
          setLanguage(s.language);
          setLearningMode(s.learningMode);
          setAvailableDays(s.availableDays || '');
          setAvailableTimes(s.availableTimes || '');
          setTargetLearners(s.targetLearners || '');
          setGeneralArea(s.generalArea || '');
        } else {
          error('Skill not found.');
          navigate('/my-skills');
        }
      } catch {
        error('Failed to load skill details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkill();
  }, [id, user, navigate, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!skillName.trim() || !description.trim()) {
      error('Skill title and description are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiRequest(`/skills/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          skillName: skillName.trim(),
          category,
          description: description.trim(),
          skillLevel,
          language: language.trim(),
          learningMode,
          availableDays: availableDays.trim(),
          availableTimes: availableTimes.trim(),
          targetLearners: targetLearners.trim(),
          generalArea: generalArea.trim() || null,
        }),
      });

      if (res.success) {
        success('Skill updated successfully!');
        navigate('/my-skills');
      } else {
        error(res.message || 'Failed to update skill.');
      }
    } catch {
      error('An unexpected error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this shared skill?')) {
      return;
    }

    try {
      const res = await apiRequest(`/skills/${id}`, {
        method: 'DELETE',
      });

      if (res.success) {
        success('Skill deleted successfully.');
        navigate('/my-skills');
      } else {
        error(res.message || 'Failed to delete skill.');
      }
    } catch {
      error('An error occurred while deleting the skill.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={() => navigate('/my-skills')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Skills
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Edit Shared Skill
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Update your availability, description, or learning format.
          </p>
        </div>

        <button
          onClick={handleDelete}
          className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition flex items-center gap-1.5 border border-rose-200"
        >
          <Trash2 className="w-4 h-4" />
          Delete Skill
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Skill Title *
            </label>
            <input
              type="text"
              required
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Target Skill Level *
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value as any)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-medium"
              >
                <option value="All Levels">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Description & Approach *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none font-medium leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Language of Instruction *
              </label>
              <input
                type="text"
                required
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Learning Mode *
              </label>
              <select
                value={learningMode}
                onChange={(e) => setLearningMode(e.target.value as any)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-medium"
              >
                <option value="Both">Both (Online or In-Person)</option>
                <option value="Online">Online Only</option>
                <option value="In-Person">In-Person Only</option>
              </select>
            </div>
          </div>

          {learningMode !== 'Online' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                General Area for In-Person Meetups
              </label>
              <input
                type="text"
                value={generalArea}
                onChange={(e) => setGeneralArea(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Available Days
              </label>
              <input
                type="text"
                value={availableDays}
                onChange={(e) => setAvailableDays(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Available Times
              </label>
              <input
                type="text"
                value={availableTimes}
                onChange={(e) => setAvailableTimes(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/my-skills')}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-sm hover:bg-stone-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm shadow-sm transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
