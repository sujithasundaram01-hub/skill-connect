import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Skill } from '../types/index.js';
import { apiRequest } from '../api/client.js';
import { SkillCard } from '../components/skills/SkillCard.js';
import { RequestModal } from '../components/skills/RequestModal.js';
import {
  Search,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Compass,
  CheckCircle2,
  Users,
  Award,
  Globe,
  Star,
  Layers,
  ChefHat,
  Camera,
  Scissors,
  Laptop,
  Sprout,
  Languages,
  Music,
  Dumbbell,
  Briefcase,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Cooking', icon: ChefHat, count: 'Tagliatelle, Baking, Pastries', color: 'bg-amber-100 text-amber-800' },
  { name: 'Photography', icon: Camera, count: 'Smartphone, DSLR, Lighting', color: 'bg-blue-100 text-blue-800' },
  { name: 'Handcraft', icon: Scissors, count: 'Tailoring, Mending, Knitting', color: 'bg-rose-100 text-rose-800' },
  { name: 'Gardening', icon: Sprout, count: 'Balcony, Herbs, Soil', color: 'bg-emerald-100 text-emerald-800' },
  { name: 'Technology', icon: Laptop, count: 'Python, Web, Digital Basics', color: 'bg-indigo-100 text-indigo-800' },
  { name: 'Languages', icon: Languages, count: 'Spanish, Conversational, Travel', color: 'bg-teal-100 text-teal-800' },
  { name: 'Music', icon: Music, count: 'Acoustic Guitar, Chords, Singing', color: 'bg-purple-100 text-purple-800' },
  { name: 'Fitness', icon: Dumbbell, count: 'Yoga, Calisthenics, Walking', color: 'bg-orange-100 text-orange-800' },
  { name: 'Business', icon: Briefcase, count: 'Bookkeeping, Organization', color: 'bg-cyan-100 text-cyan-800' },
  { name: 'Communication', icon: MessageCircle, count: 'Public Speaking, Writing', color: 'bg-violet-100 text-violet-800' },
  { name: 'Art & Design', icon: Layers, count: 'Drawing, Watercolor, Origami', color: 'bg-pink-100 text-pink-800' },
  { name: 'Other Skills', icon: HelpCircle, count: 'Home Repairs, Board Games', color: 'bg-stone-100 text-stone-800' },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredSkills, setFeaturedSkills] = useState<Skill[]>([]);
  const [skillOfTheDay, setSkillOfTheDay] = useState<Skill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requestSkill, setRequestSkill] = useState<Skill | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillsRes, dayRes] = await Promise.all([
          apiRequest('/skills?limit=6'),
          apiRequest('/skills/day'),
        ]);

        if (skillsRes.success && skillsRes.skills) {
          setFeaturedSkills(skillsRes.skills);
        }

        if (dayRes.success && dayRes.skill) {
          setSkillOfTheDay(dayRes.skill);
        }
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* HERO SECTION */}
      <section className="relative pt-10 sm:pt-16 pb-12 sm:pb-20 overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-100/60 to-amber-100/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
          {/* Tag badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs sm:text-sm font-semibold mb-6 shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Real Community Skill Exchange</span>
          </div>

          {/* Main Title & Tagline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.15] mb-5">
            Share What You Know.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-amber-600">
              Learn What You Love.
            </span>
          </h1>

          {/* Short explanation */}
          <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed mb-8">
            “Everyone knows something. Everyone can teach something. Everyone can learn something.”
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 p-2 bg-white rounded-2xl shadow-lg border border-stone-200/80 mb-6"
          >
            <div className="relative flex-1 w-full flex items-center">
              <Search className="w-5 h-5 text-stone-400 ml-3.5 absolute pointer-events-none" />
              <input
                type="text"
                placeholder="What skill do you want to learn? (e.g. Cooking, Photography, Spanish)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm sm:text-base text-stone-800 placeholder-stone-400 bg-transparent focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm sm:text-base transition shadow-sm flex items-center justify-center gap-2 shrink-0 active:scale-98"
            >
              <Compass className="w-4 h-4" />
              Find a Skill
            </button>
          </form>

          {/* Primary CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/explore"
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm transition flex items-center gap-1.5 shadow-sm"
            >
              Explore All Skills
              <ArrowRight className="w-4 h-4 text-stone-300" />
            </Link>
            <Link
              to="/share"
              className="px-5 py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-200 font-semibold text-sm transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-brand-600" />
              Share Your Skill
            </Link>
          </div>
        </div>
      </section>

      {/* SKILL OF THE DAY SHOWCASE */}
      {skillOfTheDay && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-brand-600 rounded-3xl p-1 shadow-lg">
            <div className="bg-white rounded-[22px] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Today's Featured Skill of the Day
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  {skillOfTheDay.skillName}
                </h3>
                <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl line-clamp-2">
                  {skillOfTheDay.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs sm:text-sm text-stone-600">
                  <span className="font-semibold text-stone-900">
                    Shared by: {skillOfTheDay.owner?.name}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <strong>{skillOfTheDay.rating.toFixed(1)}</strong> ({skillOfTheDay.reviewCount} reviews)
                  </span>
                  <span>•</span>
                  <span>{skillOfTheDay.learningMode}</span>
                </div>
              </div>

              <div className="shrink-0 flex sm:flex-col gap-2 w-full md:w-auto">
                <Link
                  to={`/skills/${skillOfTheDay.id}`}
                  className="flex-1 md:flex-none text-center px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm transition shadow-sm"
                >
                  View Details
                </Link>
                <button
                  onClick={() => setRequestSkill(skillOfTheDay)}
                  className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition shadow-sm"
                >
                  Connect & Learn
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
            Explore Skills by Category
          </h2>
          <p className="text-sm text-stone-500 mt-2">
            Every neighbor has a craft. Find what excites you and start learning today.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/explore?category=${encodeURIComponent(cat.name)}`}
                className="group p-4 bg-white rounded-2xl border border-stone-200/80 hover:border-brand-500 hover:shadow-md transition-all text-center flex flex-col items-center justify-center space-y-2"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${cat.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-brand-700 transition">
                  {cat.name}
                </h4>
                <p className="text-[10px] text-stone-400 line-clamp-1 leading-tight">
                  {cat.count}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-stone-900 text-white rounded-3xl p-8 sm:p-12 overflow-hidden relative">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">
              Simple 5-Step Cycle
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold mt-2 tracking-tight">
              How Skill Share Works
            </h2>
            <p className="text-sm sm:text-base text-stone-300 mt-3 leading-relaxed">
              No complicated corporate networking or resumes. Just genuine people sharing and learning together.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Step 1 */}
            <div className="bg-stone-800/80 p-5 rounded-2xl border border-stone-700/60 relative">
              <div className="w-8 h-8 rounded-full bg-brand-500 text-stone-950 font-bold flex items-center justify-center text-sm mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-white mb-2">Share</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                List a skill you know—cooking, tailoring, gardening, coding, guitar, or language.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-stone-800/80 p-5 rounded-2xl border border-stone-700/60 relative">
              <div className="w-8 h-8 rounded-full bg-brand-500 text-stone-950 font-bold flex items-center justify-center text-sm mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-white mb-2">Discover</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Search local community members or online teachers by category, level, or area.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-stone-800/80 p-5 rounded-2xl border border-stone-700/60 relative">
              <div className="w-8 h-8 rounded-full bg-brand-500 text-stone-950 font-bold flex items-center justify-center text-sm mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-white mb-2">Connect</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Send a real learning request or propose a Skill Swap. Coordinate schedules safely.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-stone-800/80 p-5 rounded-2xl border border-stone-700/60 relative">
              <div className="w-8 h-8 rounded-full bg-brand-500 text-stone-950 font-bold flex items-center justify-center text-sm mb-4">
                4
              </div>
              <h4 className="text-base font-bold text-white mb-2">Learn</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Meet online or in-person. Track learning milestones from Started to Completed.
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-stone-800/80 p-5 rounded-2xl border border-stone-700/60 relative">
              <div className="w-8 h-8 rounded-full bg-brand-500 text-stone-950 font-bold flex items-center justify-center text-sm mb-4">
                5
              </div>
              <h4 className="text-base font-bold text-white mb-2">Review</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Leave genuine ratings and build community trust badges for teachers and learners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED COMMUNITY SKILLS (FROM REAL DB) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
              From Our Real Database
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
              Featured Skill Sharers
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Real people ready to teach what they know.
            </p>
          </div>

          <Link
            to="/explore"
            className="text-sm font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            Browse All Skills ({featuredSkills.length}+)
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-stone-200/60 animate-pulse rounded-2xl border border-stone-200"
              ></div>
            ))}
          </div>
        ) : featuredSkills.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSkills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onRequestClick={(s) => setRequestSkill(s)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
            <p className="text-stone-500">No skills shared yet. Be the first to share one!</p>
          </div>
        )}
      </section>

      {/* COMMUNITY SAFETY CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-emerald-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-brand-400 shrink-0" />
              Safe, Trustworthy & Privacy-Friendly
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              We never expose private phone numbers, home addresses, or emails publicly. All connections happen through safe, encrypted in-platform messaging with transparent member reviews.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <Link
              to="/guidelines"
              className="px-5 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-sm hover:bg-emerald-50 transition"
            >
              Read Community Guidelines
            </Link>
            <Link
              to="/share"
              className="px-5 py-2.5 rounded-xl bg-brand-500 text-stone-950 font-bold text-sm hover:bg-brand-400 transition"
            >
              Share a Skill
            </Link>
          </div>
        </div>
      </section>

      {/* Connect Modal */}
      <RequestModal
        skill={requestSkill}
        isOpen={!!requestSkill}
        onClose={() => setRequestSkill(null)}
      />
    </div>
  );
};
