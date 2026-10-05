import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { apiRequest } from '../api/client.js';
import {
  PlusCircle,
  Sparkles,
  Globe,
  MapPin,
  Calendar,
  Clock,
  Users,
  BookOpen,
} from 'lucide-react';

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

export const ShareSkill: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState('Cooking');
  const [description, setDescription] = useState('');
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'>('All Levels');
  const [language, setLanguage] = useState(user?.languages || 'English');
  const [learningMode, setLearningMode] = useState<'Online' | 'In-Person' | 'Both'>('Both');
  const [availableDays, setAvailableDays] = useState('Weekends, Evenings');
  const [availableTimes, setAvailableTimes] = useState('Flexible');
  const [targetLearners, setTargetLearners] = useState('Absolute beginners, anyone interested');
  const [generalArea, setGeneralArea] = useState(user?.location || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!skillName.trim()) {
      error('Please enter the name of the skill you want to share.');
      return;
    }

    if (!description.trim() || description.trim().length < 15) {
      error('Please provide a helpful description (at least 15 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await apiRequest('/skills', {
        method: 'POST',
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
        success('Your skill is now live! Neighbors can discover it and request to learn.');
        navigate('/my-skills');
      } else {
        error(res.message || 'Failed to share skill. Please try again.');
      }
    } catch {
      error('An unexpected server error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Give Back to Your Community
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Share a Skill You Know
        </h1>
        <p className="text-sm text-stone-600 mt-2 max-w-lg mx-auto">
          Whether it’s baking bread, sewing buttonholes, playing guitar chords, or organizing spreadsheets—what comes naturally to you can change someone else’s life.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sharer Name Notice */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-stone-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-sm">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-xs text-stone-400 font-medium">Teaching As</p>
                <p className="text-sm font-bold text-stone-900">{user?.name}</p>
              </div>
            </div>
            <span className="text-xs text-stone-500 font-medium bg-white px-2.5 py-1 rounded-lg border border-stone-200">
              Verified Account
            </span>
          </div>

          {/* Skill Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-stone-500" />
              Skill Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Traditional Hand-Rolled Pasta Making, Balcony Gardening, Python Basics"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>

          {/* Category & Level */}
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
                <option value="All Levels">All Levels (Welcome to anyone)</option>
                <option value="Beginner">Beginner (Starting from scratch)</option>
                <option value="Intermediate">Intermediate (Has basic fundamentals)</option>
                <option value="Advanced">Advanced (Deep dive & mastery)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Description & What You Will Teach *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe what a learner can expect to discover. Mention your approach, what tools or ingredients are needed, and why you enjoy sharing this skill..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none font-medium leading-relaxed"
            />
            <p className="text-xs text-stone-400 mt-1">Minimum 15 characters.</p>
          </div>

          {/* Language & Learning Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-stone-500" />
                Language of Instruction *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. English, Spanish, Bilingual"
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
                <option value="Online">Online Only (Video / Virtual)</option>
                <option value="In-Person">In-Person Only (Safe Local Area)</option>
              </select>
            </div>
          </div>

          {/* General Area for Offline Learning */}
          {learningMode !== 'Online' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                General Area for In-Person Meetups
              </label>
              <input
                type="text"
                placeholder="e.g. Maplewood Community Center, Central Library, Downtown"
                value={generalArea}
                onChange={(e) => setGeneralArea(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
              <p className="text-xs text-stone-400 mt-1">
                🔒 Privacy safe: Only state your neighborhood, city, or public community spot. Never your exact home address.
              </p>
            </div>
          )}

          {/* Availability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                Available Days
              </label>
              <input
                type="text"
                placeholder="e.g. Weekends, Tuesday & Thursday evenings"
                value={availableDays}
                onChange={(e) => setAvailableDays(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                Available Times
              </label>
              <input
                type="text"
                placeholder="e.g. 10:00 AM - 1:00 PM, After 6:00 PM"
                value={availableTimes}
                onChange={(e) => setAvailableTimes(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
          </div>

          {/* Target Learners */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-stone-500" />
              Who Can You Help?
            </label>
            <input
              type="text"
              placeholder="e.g. Anyone curious, beginners, retirees, busy parents wanting quick tips"
              value={targetLearners}
              onChange={(e) => setTargetLearners(e.target.value)}
              className="w-full px-4 py-3 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-sm hover:bg-stone-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm sm:text-base shadow-sm transition flex items-center gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              {isSubmitting ? 'Publishing Your Skill...' : 'Share Skill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
