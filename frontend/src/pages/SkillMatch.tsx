import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SkillMatch, Skill } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { apiRequest } from '../api/client.js';
import { RequestModal } from '../components/skills/RequestModal.js';
import {
  Sparkles,
  ArrowRightLeft,
  Star,
  MapPin,
  CheckCircle,
  HelpCircle,
  HeartHandshake,
  Users,
  Compass,
  ArrowRight,
} from 'lucide-react';

export const SkillMatchPage: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<SkillMatch[]>([]);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestSkill, setRequestSkill] = useState<Skill | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await apiRequest('/matches');
        if (res.success) {
          setMatches(res.matches || []);
          setMyProfile(res.myProfile);
        }
      } catch (err) {
        console.error('Failed to load matches:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Intelligent Community Matching
        </div>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Skill Match & Mutual Exchange
        </h1>
        <p className="text-sm text-stone-600 mt-2 leading-relaxed">
          Find community members where mutual skills complement each other: “I teach you Cooking, you teach me Photography.” Matches are calculated using real database skills and stated learning interests.
        </p>
      </div>

      {/* Your current profile snapshot for matching */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Your Current Matching Profile
          </p>
          <div className="text-sm text-stone-800">
            <span>You share <strong>{myProfile?.skillsCount || 0} skills</strong></span>
            <span className="mx-2">•</span>
            <span>
              Learning interests:{' '}
              <strong className="text-brand-700">
                {myProfile?.learningInterests || 'None specified yet'}
              </strong>
            </span>
          </div>
        </div>

        <Link
          to="/profile"
          className="text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3.5 py-2 rounded-xl transition"
        >
          Update Your Interests in Profile
        </Link>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((match) => (
            <div
              key={match.userId}
              className={`bg-white rounded-3xl border p-6 flex flex-col justify-between shadow-sm transition hover:shadow-md ${
                match.matchScore >= 90
                  ? 'border-amber-300 ring-2 ring-amber-100'
                  : 'border-stone-200'
              }`}
            >
              <div className="space-y-4">
                {/* Header: Score badge & User */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {match.profilePhoto ? (
                      <img
                        src={match.profilePhoto}
                        alt={match.name}
                        className="w-12 h-12 rounded-full object-cover border border-stone-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-brand-600 text-white font-bold text-lg flex items-center justify-center">
                        {match.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <Link
                        to={`/profile/${match.userId}`}
                        className="text-base font-bold text-stone-900 hover:text-brand-600 transition flex items-center gap-1.5"
                      >
                        {match.name}
                        {match.verificationStatus && (
                          <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                        )}
                      </Link>
                      <p className="text-xs text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {match.generalArea}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      match.matchScore >= 90
                        ? 'bg-amber-100 text-amber-900'
                        : match.matchScore >= 60
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {match.matchScore}% Match
                  </div>
                </div>

                {/* Match Reason Banner */}
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed font-medium ${
                    match.matchScore >= 90
                      ? 'bg-amber-50 text-amber-900 border border-amber-200/80'
                      : 'bg-stone-50 text-stone-700 border border-stone-200/80'
                  }`}
                >
                  <p className="flex items-center gap-1.5 font-bold mb-0.5">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-brand-600" />
                    {match.matchType}
                  </p>
                  <p>{match.matchReason}</p>
                </div>

                {/* Two-Way Visual Cards */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* What they teach */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                    <p className="font-bold text-stone-500 uppercase tracking-wider text-[10px] mb-1">
                      They Can Teach You
                    </p>
                    <p className="font-bold text-stone-900 line-clamp-1">
                      {match.skillTheyTeach?.skillName || 'Community guidance'}
                    </p>
                    {match.skillTheyTeach && (
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-stone-500">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <strong>{match.skillTheyTeach.rating}</strong>
                        <span>({match.skillTheyTeach.learnersHelped} helped)</span>
                      </div>
                    )}
                  </div>

                  {/* What they want */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/60">
                    <p className="font-bold text-stone-500 uppercase tracking-wider text-[10px] mb-1">
                      They Want to Learn
                    </p>
                    <p className="font-bold text-stone-900 line-clamp-1">
                      {match.skillTheyWantToLearn}
                    </p>
                    <p className="text-[11px] text-brand-700 mt-1 font-semibold truncate">
                      {match.skillYouCanTeachThem ? `You can teach: ${match.skillYouCanTeachThem}` : 'Open to exchange'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                <Link
                  to={`/profile/${match.userId}`}
                  className="text-xs font-bold text-stone-600 hover:text-stone-900"
                >
                  View Profile
                </Link>

                {match.skillTheyTeach ? (
                  <button
                    onClick={() =>
                      setRequestSkill({
                        id: match.skillTheyTeach!.id,
                        skillName: match.skillTheyTeach!.skillName,
                        category: match.skillTheyTeach!.category,
                        description: '',
                        skillLevel: match.skillTheyTeach!.skillLevel as any,
                        language: 'English',
                        learningMode: match.skillTheyTeach!.learningMode as any,
                        createdDate: '',
                        rating: match.skillTheyTeach!.rating,
                        reviewCount: 1,
                        learnersHelped: match.skillTheyTeach!.learnersHelped,
                        owner: {
                          id: match.userId,
                          name: match.name,
                          profilePhoto: match.profilePhoto,
                          verificationStatus: match.verificationStatus,
                        },
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                    Propose Skill Swap
                  </button>
                ) : (
                  <Link
                    to={`/profile/${match.userId}`}
                    className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs"
                  >
                    Connect
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-stone-200 max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">No skill matches yet</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            To get personalized two-way skill matches, make sure you have shared at least one skill and listed your learning interests in your profile!
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/profile"
              className="px-4 py-2 text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
            >
              Add Interests
            </Link>
            <Link
              to="/share"
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-xs"
            >
              Share a Skill
            </Link>
          </div>
        </div>
      )}

      {/* Connect & Swap Modal */}
      <RequestModal
        skill={requestSkill}
        isOpen={!!requestSkill}
        onClose={() => setRequestSkill(null)}
      />
    </div>
  );
};
