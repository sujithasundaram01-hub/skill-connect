import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Skill } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { apiRequest } from '../../api/client.js';
import {
  Star,
  Users,
  MapPin,
  Bookmark,
  CheckCircle,
  Globe,
  ArrowRight,
} from 'lucide-react';

interface SkillCardProps {
  skill: Skill;
  onSavedChange?: (skillId: string, isSaved: boolean) => void;
  onRequestClick?: (skill: Skill) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill, onSavedChange, onRequestClick }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [isSaved, setIsSaved] = useState(skill.isSaved || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      error('Please sign in to save skills to your wishlist.');
      return;
    }

    setIsSaving(true);
    const newSavedStatus = !isSaved;
    setIsSaved(newSavedStatus); // Optimistic

    try {
      const res = await apiRequest('/skills/save', {
        method: 'POST',
        body: JSON.stringify({ skillId: skill.id }),
      });

      if (res.success) {
        setIsSaved(res.isSaved);
        success(res.message);
        if (onSavedChange) {
          onSavedChange(skill.id, res.isSaved);
        }
      } else {
        setIsSaved(!newSavedStatus);
        error(res.message || 'Failed to update saved skill.');
      }
    } catch {
      setIsSaved(!newSavedStatus);
      error('An error occurred while saving the skill.');
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Cooking':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Photography':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Handcraft':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Gardening':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Technology':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Languages':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Music':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md hover:border-stone-300 transition-all flex flex-col justify-between overflow-hidden group">
      <div className="p-5 sm:p-6">
        {/* Top Badges: Category & Save button */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getCategoryColor(
              skill.category
            )}`}
          >
            {skill.category}
          </span>

          <button
            onClick={handleToggleSave}
            disabled={isSaving}
            className={`p-1.5 rounded-full transition ${
              isSaved
                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save skill'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
          </button>
        </div>

        {/* Skill Title */}
        <Link to={`/skills/${skill.id}`} className="block group-hover:text-brand-700 transition">
          <h3 className="text-lg font-bold text-stone-900 leading-snug line-clamp-2 mb-2">
            {skill.skillName}
          </h3>
        </Link>

        {/* Short description */}
        <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed mb-4">
          {skill.description}
        </p>

        {/* Meta badges: Mode & Level & Language */}
        <div className="flex flex-wrap gap-1.5 text-xs text-stone-600 mb-5">
          <span className="bg-stone-100 px-2 py-0.5 rounded-md font-medium">
            {skill.skillLevel}
          </span>
          <span className="bg-stone-100 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
            <Globe className="w-3 h-3 text-stone-400" />
            {skill.learningMode}
          </span>
          {skill.generalArea && (
            <span className="bg-stone-100 px-2 py-0.5 rounded-md font-medium flex items-center gap-1 max-w-[140px] truncate">
              <MapPin className="w-3 h-3 text-stone-400" />
              {skill.generalArea}
            </span>
          )}
        </div>

        {/* Teacher Profile snippet */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          <Link
            to={`/profile/${skill.owner.id}`}
            className="flex items-center gap-2.5 group/user hover:opacity-90"
          >
            {skill.owner.profilePhoto ? (
              <img
                src={skill.owner.profilePhoto}
                alt={skill.owner.name}
                className="w-8 h-8 rounded-full object-cover border border-stone-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                {skill.owner.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-stone-900 group-hover/user:text-brand-600 flex items-center gap-1">
                {skill.owner.name}
                {skill.owner.verificationStatus && (
                  <CheckCircle className="w-3 h-3 text-emerald-600 fill-emerald-100 inline" />
                )}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="font-bold text-stone-800">{skill.rating.toFixed(1)}</span>
                <span>({skill.reviewCount})</span>
              </div>
            </div>
          </Link>

          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-stone-500 font-medium">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              <span>{skill.learnersHelped} helped</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="px-5 py-3 bg-stone-50/80 border-t border-stone-100 flex items-center gap-2">
        <Link
          to={`/skills/${skill.id}`}
          className="flex-1 text-center py-2 text-xs sm:text-sm font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl transition flex items-center justify-center gap-1"
        >
          View Skill
          <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
        </Link>

        {user?.id !== skill.owner.id && onRequestClick && (
          <button
            onClick={() => onRequestClick(skill)}
            className="py-2 px-3 text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
};
