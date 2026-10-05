import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { HeartHandshake, Lock, Mail, User, MapPin, Globe, Sparkles } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [location, setLocation] = useState('');
  const [languages, setLanguages] = useState('English');
  const [bio, setBio] = useState('');
  const [skillsLearningInterest, setSkillsLearningInterest] = useState('');
  const [experience, setExperience] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      error('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      error('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      error('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        location: location.trim() || null,
        languages: languages.trim() || 'English',
        bio: bio.trim() || 'Enthusiastic community learner and skill sharer.',
        skillsLearningInterest: skillsLearningInterest.trim() || null,
        experience: experience.trim() || null,
      });

      if (res.success) {
        success('Welcome to Skill Share! Your community account has been created.');
        navigate('/explore');
      } else {
        error(res.message || 'Registration failed.');
      }
    } catch {
      error('An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 sm:px-6 py-12">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-xs">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-stone-900">Skill Share</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Join the Community
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Share what you know. Learn what you love. Connect with real neighbors.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-stone-400 ml-3.5 absolute pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Maria Rodriguez or Marcus Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-stone-400 ml-3.5 absolute pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-stone-400 ml-3.5 absolute pointer-events-none" />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Confirm Password *
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-stone-400 ml-3.5 absolute pointer-events-none" />
                  <input
                    type="password"
                    required
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Optional community fields */}
            <div className="pt-2 border-t border-stone-100 space-y-3">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Profile Details (Optional)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    General Locality / Area
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maplewood, Downtown"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-stone-400" />
                    Languages
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. English, Spanish"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Skills You Want to Learn (For Matching)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Photography, Cooking, Italian, Balcony Gardening"
                  value={skillsLearningInterest}
                  onChange={(e) => setSkillsLearningInterest(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Short Bio
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell your neighbors a little about what you enjoy or want to learn..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm shadow-xs transition active:scale-98"
            >
              {isLoading ? 'Creating your account...' : 'Create Account & Start Sharing'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-stone-500">
          Already part of the community?{' '}
          <Link to="/login" className="font-bold text-brand-700 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
};
