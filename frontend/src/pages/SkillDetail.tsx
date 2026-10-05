import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Skill } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { apiRequest } from '../api/client.js';
import { RequestModal } from '../components/skills/RequestModal.js';
import { ReportModal } from '../components/skills/ReportModal.js';
import {
  Star,
  Users,
  MapPin,
  Bookmark,
  CheckCircle,
  Globe,
  Calendar,
  Clock,
  ShieldCheck,
  Flag,
  Share2,
  ArrowLeft,
  Sparkles,
  HeartHandshake,
  MessageCircle,
} from 'lucide-react';

export const SkillDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [skill, setSkill] = useState<Skill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    const fetchSkill = async () => {
      try {
        const res = await apiRequest(`/skills/${id}`);
        if (res.success && res.skill) {
          setSkill(res.skill);
          setIsSaved(res.skill.isSaved || false);
        } else {
          error('Skill not found.');
          navigate('/explore');
        }
      } catch {
        error('Failed to load skill details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkill();
  }, [id, navigate, error]);

  const handleToggleSave = async () => {
    if (!user) {
      error('Please sign in to save skills.');
      return;
    }

    if (!skill) return;

    setIsSaving(true);
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    try {
      const res = await apiRequest('/skills/save', {
        method: 'POST',
        body: JSON.stringify({ skillId: skill.id }),
      });

      if (res.success) {
        setIsSaved(res.isSaved);
        success(res.message);
      } else {
        setIsSaved(!nextSaved);
        error(res.message);
      }
    } catch {
      setIsSaved(!nextSaved);
      error('Failed to update bookmark.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    success('Page link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!skill) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Explore
      </button>

      {/* Main Skill Header Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-50 text-brand-800 border border-brand-200">
              {skill.category}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
              {skill.skillLevel}
            </span>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 flex items-center gap-1">
              <Globe className="w-3 h-3 text-stone-400" />
              {skill.learningMode}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareLink}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition border border-stone-200"
              title="Share link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleToggleSave}
              disabled={isSaving}
              className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
                isSaved
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
            {skill.skillName}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs sm:text-sm text-stone-600">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <strong className="text-stone-900">{skill.rating.toFixed(1)}</strong>
              <span>({skill.reviewCount} community reviews)</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-stone-400" />
              <span>{skill.learnersHelped} neighbors helped</span>
            </div>
            {skill.generalArea && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-stone-400" />
                  <span>{skill.generalArea}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {user?.id !== skill.owner.id ? (
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm sm:text-base shadow-sm transition flex items-center gap-2"
              >
                <HeartHandshake className="w-5 h-5" />
                Connect & Learn
              </button>
            ) : (
              <Link
                to={`/skills/${skill.id}/edit`}
                className="px-6 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm transition"
              >
                Edit Your Skill
              </Link>
            )}

            {user?.id !== skill.owner.id && (
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-stone-500 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 transition flex items-center gap-1.5"
              >
                <Flag className="w-3.5 h-3.5" />
                Report
              </button>
            )}
          </div>

          <div className="text-xs text-stone-400 font-medium">
            Shared on {new Date(skill.createdDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Grid: Left Column Details & Right Column Sharer Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skill Description */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-stone-900">About This Skill</h3>
            <p className="text-sm sm:text-base text-stone-700 leading-relaxed whitespace-pre-line">
              {skill.description}
            </p>

            <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-stone-400 mt-1 shrink-0" />
                <div>
                  <p className="font-bold text-stone-900">Available Days</p>
                  <p className="text-stone-600">{skill.availableDays || 'Flexible scheduling'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-stone-400 mt-1 shrink-0" />
                <div>
                  <p className="font-bold text-stone-900">Available Hours</p>
                  <p className="text-stone-600">{skill.availableTimes || 'Flexible'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-stone-400 mt-1 shrink-0" />
                <div>
                  <p className="font-bold text-stone-900">Language</p>
                  <p className="text-stone-600">{skill.language}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-stone-400 mt-1 shrink-0" />
                <div>
                  <p className="font-bold text-stone-900">Target Learners</p>
                  <p className="text-stone-600">{skill.targetLearners || 'Everyone is welcome'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Genuine Reviews Section */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  Community Reviews ({skill.reviews?.length || 0})
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Only verified learners who completed sessions can review.
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-stone-900">{skill.rating.toFixed(1)}</span>
                <span className="text-xs text-stone-400"> / 5.0</span>
              </div>
            </div>

            {skill.reviews && skill.reviews.length > 0 ? (
              <div className="space-y-4 divide-y divide-stone-100">
                {skill.reviews.map((rev) => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {rev.reviewer.profilePhoto ? (
                          <img
                            src={rev.reviewer.profilePhoto}
                            alt={rev.reviewer.name}
                            className="w-7 h-7 rounded-full object-cover border border-stone-200"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
                            {rev.reviewer.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="text-xs font-bold text-stone-900">{rev.reviewer.name}</span>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              rev.rating >= s
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-stone-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                      “{rev.reviewText}”
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-stone-400">
                      <span>{new Date(rev.createdDate).toLocaleDateString()}</span>
                      {rev.isHelpful && (
                        <span className="text-emerald-700 font-medium">✓ Verified interaction</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs text-stone-500">
                No reviews yet. Be the first learner to connect and write a review!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Teacher Profile Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-5 shadow-sm">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Meet the Skill Sharer
            </h4>

            <div className="flex items-center gap-3.5">
              {skill.owner.profilePhoto ? (
                <img
                  src={skill.owner.profilePhoto}
                  alt={skill.owner.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-brand-500"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-brand-600 text-white font-bold text-xl flex items-center justify-center">
                  {skill.owner.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <Link
                  to={`/profile/${skill.owner.id}`}
                  className="text-base font-bold text-stone-900 hover:text-brand-600 transition flex items-center gap-1.5"
                >
                  {skill.owner.name}
                  {skill.owner.verificationStatus && (
                    <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  )}
                </Link>
                {skill.owner.location && (
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    {skill.owner.location}
                  </p>
                )}
              </div>
            </div>

            {skill.owner.bio && (
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {skill.owner.bio}
              </p>
            )}

            {skill.owner.experience && (
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/70 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Experience & Background
                </span>
                <p className="text-stone-700 leading-snug">{skill.owner.experience}</p>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Identity verified community member</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <Users className="w-4 h-4 text-brand-600" />
                <span>Helped {skill.owner.totalHelpedAcrossAllSkills || 1}+ learners</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <MessageCircle className="w-4 h-4 text-brand-600" />
                <span>Encrypted private messaging on acceptance</span>
              </div>
            </div>

            <Link
              to={`/profile/${skill.owner.id}`}
              className="block text-center py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
            >
              View Full Profile & Reviews
            </Link>
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      <RequestModal
        skill={skill}
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />

      {/* Report Modal */}
      <ReportModal
        reportedSkillId={skill.id}
        reportedUserId={skill.owner.id}
        reportedName={skill.skillName}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
