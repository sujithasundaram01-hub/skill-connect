import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  HeartHandshake,
  Lock,
  AlertTriangle,
  UserCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const CommunityGuidelines: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Trust, Safety & Respect
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Skill Share Community Guidelines
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed">
          Skill Share is built on mutual respect, kindness, and neighborly generosity. These guidelines help ensure everyone has an enjoyable and safe experience.
        </p>
      </div>

      <div className="space-y-6">
        {/* Core Principles */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-stone-900">
            <HeartHandshake className="w-6 h-6 text-brand-600" />
            <h2 className="text-xl font-bold">1. Kindness & Patience First</h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            Remember that learners come from all walks of life and varying technical backgrounds.
            Whether teaching a 60-year-old grandmother to use Python or teaching a student how to roll tagliatelle pasta, always be patient, encouraging, and clear.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-stone-900">
            <Lock className="w-6 h-6 text-brand-600" />
            <h2 className="text-xl font-bold">2. Protect Personal Privacy</h2>
          </div>
          <ul className="text-xs sm:text-sm text-stone-700 leading-relaxed space-y-2 list-disc list-inside">
            <li>Never post personal phone numbers, direct bank accounts, or exact home addresses publicly.</li>
            <li>For in-person sessions, meet at public, well-lit venues (such as public libraries, community centers, cafes, or public parks).</li>
            <li>Always coordinate scheduling through the built-in encrypted message threads.</li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-stone-900">
            <UserCheck className="w-6 h-6 text-brand-600" />
            <h2 className="text-xl font-bold">3. Genuine Skill Sharing, Not Commercial Selling</h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            Skill Share is a platform for community exchange, personal hobbies, and neighborly learning.
            Commercial sales pitches, multi-level marketing, spam, or high-pressure solicitation are strictly prohibited and will result in account suspension.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-stone-900">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <h2 className="text-xl font-bold">4. Zero Tolerance for Harassment</h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
            Hate speech, harassment, discrimination based on race, gender, religion, age, or disability have no place on Skill Share.
            If you ever feel uncomfortable, use the <strong>Report</strong> or <strong>Block</strong> features immediately. Our moderation team investigates all reports swiftly.
          </p>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition"
        >
          <span>Explore Skills with Confidence</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
