import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { apiRequest } from '../api/client.js';
import { HeartHandshake, Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        success('Welcome back to Skill Share!');
        navigate(from, { replace: true });
      } else {
        error(res.message || 'Invalid email or password.');
      }
    } catch {
      error('An unexpected login error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setIsLoading(true);
    try {
      const res = await login(demoEmail, 'Password123!');
      if (res.success) {
        success(`Logged in as ${demoEmail.split('@')[0]}!`);
        navigate(from, { replace: true });
      } else {
        error(res.message || 'Quick login failed.');
      }
    } catch {
      error('Quick login error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      error('Please enter your account email.');
      return;
    }

    try {
      const res = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      if (res.success) {
        success(res.message);
        setForgotOpen(false);
      } else {
        error(res.message || 'Failed to submit password reset.');
      }
    } catch {
      error('Server error on reset request.');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 sm:px-6 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-xs">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-stone-900">Skill Share</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Welcome back, neighbor
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Log in to manage your skills, messages, and learning sessions.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Email Address
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

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs text-brand-600 hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-stone-400 ml-3.5 absolute pointer-events-none" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm shadow-xs transition active:scale-98"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Logins for Fast Review */}
          <div className="pt-4 border-t border-stone-100 space-y-2">
            <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider text-center">
              Quick One-Click Demo Logins
            </p>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('maria@example.com')}
                className="p-2 rounded-xl bg-stone-50 hover:bg-amber-50 hover:border-amber-300 border border-stone-200 text-stone-700 font-semibold transition text-center"
                title="Teaches Cooking"
              >
                🍳 Maria
                <span className="block text-[10px] text-stone-400">Cooking</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('marcus@example.com')}
                className="p-2 rounded-xl bg-stone-50 hover:bg-blue-50 hover:border-blue-300 border border-stone-200 text-stone-700 font-semibold transition text-center"
                title="Teaches Photography"
              >
                📸 Marcus
                <span className="block text-[10px] text-stone-400">Photo</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@skillshare.org')}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 hover:border-purple-300 border border-purple-200 text-purple-900 font-semibold transition text-center"
                title="Platform Admin"
              >
                🛡️ Admin
                <span className="block text-[10px] text-purple-600">Elena</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sign up prompt */}
        <p className="text-center text-xs text-stone-500">
          New to the neighborhood?{' '}
          <Link to="/register" className="font-bold text-brand-700 hover:underline">
            Create an account
          </Link>
        </p>

        {/* Forgot password modal */}
        {forgotOpen && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-stone-200">
              <h3 className="text-base font-bold text-stone-900">Reset Your Password</h3>
              <p className="text-xs text-stone-500">
                Enter your account email to receive reset guidance.
              </p>
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg"
                  >
                    Send Instructions
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
