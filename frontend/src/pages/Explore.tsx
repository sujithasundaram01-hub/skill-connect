import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Skill } from '../types/index.js';
import { apiRequest } from '../api/client.js';
import { SkillCard } from '../components/skills/SkillCard.js';
import { RequestModal } from '../components/skills/RequestModal.js';
import {
  Search,
  Filter,
  X,
  Compass,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Technology',
  'Cooking',
  'Art & Design',
  'Photography',
  'Music',
  'Fitness',
  'Languages',
  'Gardening',
  'Handcraft',
  'Business',
  'Communication',
  'Other Skills',
];

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const MODES = ['All', 'Online', 'In-Person', 'Both'];

export const Explore: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters from URL or defaults
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'All';
  const levelParam = searchParams.get('level') || 'All';
  const modeParam = searchParams.get('mode') || 'All';
  const areaParam = searchParams.get('area') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [areaInput, setAreaInput] = useState(areaParam);
  const [requestSkill, setRequestSkill] = useState<Skill | null>(null);

  const fetchSkills = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (queryParam) params.append('q', queryParam);
      if (categoryParam !== 'All') params.append('category', categoryParam);
      if (levelParam !== 'All') params.append('skillLevel', levelParam);
      if (modeParam !== 'All') params.append('learningMode', modeParam);
      if (areaParam) params.append('generalArea', areaParam);
      params.append('page', pageParam.toString());
      params.append('limit', '12');

      const res = await apiRequest(`/skills?${params.toString()}`);
      if (res.success) {
        setSkills(res.skills || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalItems(res.pagination.totalItems || 0);
        }
      }
    } catch (err) {
      console.error('Fetch skills error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [queryParam, categoryParam, levelParam, modeParam, areaParam, pageParam]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('q', searchTerm.trim());
  };

  const handleAreaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('area', areaInput.trim());
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setAreaInput('');
    setSearchParams({});
  };

  const hasActiveFilters =
    queryParam ||
    categoryParam !== 'All' ||
    levelParam !== 'All' ||
    modeParam !== 'All' ||
    areaParam;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Compass className="w-8 h-8 text-brand-600" />
            Explore Community Skills
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Discover real people sharing practical skills, from cooking to coding and gardening.
          </p>
        </div>

        {/* Search input in header */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative max-w-md w-full flex items-center"
        >
          <Search className="w-4 h-4 text-stone-400 ml-3.5 absolute pointer-events-none" />
          <input
            type="text"
            placeholder="Search by skill name, topic, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-20 py-2.5 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
          />
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-sm space-y-4">
        {/* Category Pills (Horizontal Scrollable) */}
        <div>
          <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
            Category
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => updateParam('category', cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  categoryParam === cat
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-stone-100">
          {/* Level Filter */}
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-1">Skill Level</label>
            <select
              value={levelParam}
              onChange={(e) => updateParam('level', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            >
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl === 'All' ? 'All Levels' : lvl}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Filter */}
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-1">Learning Mode</label>
            <select
              value={modeParam}
              onChange={(e) => updateParam('mode', e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            >
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {m === 'All' ? 'All Modes (Online & In-Person)' : m}
                </option>
              ))}
            </select>
          </div>

          {/* General Area Filter */}
          <div>
            <label className="block text-xs font-bold text-stone-500 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-stone-400" />
              General Area (Offline Learning)
            </label>
            <form onSubmit={handleAreaSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="e.g. Maplewood, Downtown..."
                value={areaInput}
                onChange={(e) => setAreaInput(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium pr-12"
              />
              <button
                type="submit"
                className="absolute right-1 text-[11px] font-bold px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-md"
              >
                Go
              </button>
            </form>
          </div>

          {/* Active Filter Clear */}
          <div className="flex items-end">
            {hasActiveFilters ? (
              <button
                onClick={clearAllFilters}
                className="w-full py-2 px-3 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            ) : (
              <div className="text-xs text-stone-400 py-2">
                Showing all active community skills
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Count & Active Tags */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>
          Showing <strong>{skills.length}</strong> of <strong>{totalItems}</strong> community skills
        </span>
        {categoryParam !== 'All' && (
          <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
            Filtered by Category: {categoryParam}
          </span>
        )}
      </div>

      {/* Skills Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-72 bg-white rounded-2xl border border-stone-200/60 p-6 animate-pulse space-y-4"
            >
              <div className="w-20 h-5 bg-stone-200 rounded-full"></div>
              <div className="w-3/4 h-6 bg-stone-200 rounded-lg"></div>
              <div className="w-full h-12 bg-stone-200 rounded-lg"></div>
              <div className="w-1/2 h-4 bg-stone-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : skills.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onRequestClick={(s) => setRequestSkill(s)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-stone-200 max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">No matching skills found</h3>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
            We couldn't find any shared skills matching your current search or filters. Try adjusting your search query, or be the first person to share this skill with your neighbors!
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
            >
              Clear Filters
            </button>
            <a
              href="/share"
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-xs"
            >
              Share This Skill
            </a>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => updateParam('page', Math.max(1, pageParam - 1).toString())}
            disabled={pageParam <= 1}
            className="p-2 rounded-xl border border-stone-200 bg-white text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-stone-600 px-3">
            Page {pageParam} of {totalPages}
          </span>
          <button
            onClick={() => updateParam('page', Math.min(totalPages, pageParam + 1).toString())}
            disabled={pageParam >= totalPages}
            className="p-2 rounded-xl border border-stone-200 bg-white text-stone-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Connect Modal */}
      <RequestModal
        skill={requestSkill}
        isOpen={!!requestSkill}
        onClose={() => setRequestSkill(null)}
      />
    </div>
  );
};
