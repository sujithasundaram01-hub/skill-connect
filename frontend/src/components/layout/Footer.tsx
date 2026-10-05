import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, Shield, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-stone-200 mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-stone-900">Skill Share</span>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed font-medium">
              “Share What You Know. Learn What You Love.”
            </p>
            <p className="text-xs text-stone-500 leading-relaxed">
              A real community platform where normal people share practical life skills, hobbies, and crafts with one another.
            </p>
          </div>

          {/* Col 2: Discover */}
          <div>
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Discover</h4>
            <ul className="space-y-2.5 text-sm font-medium text-stone-600">
              <li>
                <Link to="/explore?category=Cooking" className="hover:text-brand-600 transition">
                  Cooking & Baking
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Photography" className="hover:text-brand-600 transition">
                  Photography
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Handcraft" className="hover:text-brand-600 transition">
                  Tailoring & Handcraft
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Gardening" className="hover:text-brand-600 transition">
                  Balcony & Home Gardening
                </Link>
              </li>
              <li>
                <Link to="/explore?category=Technology" className="hover:text-brand-600 transition">
                  Coding & Tech Basics
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Community Flow */}
          <div>
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">How It Works</h4>
            <ul className="space-y-2.5 text-sm font-medium text-stone-600">
              <li>
                <Link to="/share" className="hover:text-brand-600 transition flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  1. Share What You Know
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-brand-600 transition">
                  2. Discover Real Neighbors
                </Link>
              </li>
              <li>
                <Link to="/match" className="hover:text-brand-600 transition">
                  3. Skill Match & Swap
                </Link>
              </li>
              <li>
                <Link to="/guidelines" className="hover:text-brand-600 transition flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-brand-600" />
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Safety */}
          <div>
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Trust & Safety</h4>
            <p className="text-xs text-stone-500 leading-relaxed mb-3">
              We never expose phone numbers, private emails, or exact street coordinates. Connections are coordinated via safe, moderated messaging.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <Shield className="w-3.5 h-3.5" />
              Verified Community Exchange
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Skill Share Community. Built with care for real people.</p>
          <div className="flex items-center gap-1 text-stone-500">
            <span>Everyone can teach. Everyone can learn.</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};
