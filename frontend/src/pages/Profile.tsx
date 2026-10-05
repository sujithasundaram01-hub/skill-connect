import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { apiRequest } from '../api/client.js';
import { ReportModal } from '../components/skills/ReportModal.js';
import {
  User as UserIcon,
  MapPin,
  Globe,
  BookOpen,
  Star,
  CheckCircle,
  Shield,
  Award,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  UserX,
  Flag,
  Edit2,
  Save,
  GraduationCap,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user: currentUser, updateUser } = useAuth();
  const { success, error } = useToast();

  const isOwnProfile = !id || id === currentUser?.id;
  const profileUserId = isOwnProfile ? currentUser?.id : id;

  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editLanguages, setEditLanguages] = useState('');
  const [editExperience, setEditExperience] = useState('');
  const [editInterests, setEditInterests] = useState('');
  const [editPrivacyArea, setEditPrivacyArea] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Block & Report modal
  const [isReportOpen, setIsReportOpen] = useState(false);

  const fetchProfile = async () => {
    if (!profileUserId) return;
    setIsLoading(true);
    try {
      const res = await apiRequest(`/users/profile/${profileUserId}`);
      if (res.success && res.profile) {
        setProfile(res.profile);
        setEditName(res.profile.name);
        setEditBio(res.profile.bio || '');
        setEditLocation(res.profile.location || '');
        setEditLanguages(res.profile.languages || '');
        setEditExperience(res.profile.experience || '');
        setEditInterests(res.profile.skillsLearningInterest || '');
        setEditPrivacyArea(res.profile.privacyAreaVisible ?? true);
      } else {
        error(res.message || 'Profile not found.');
      }
    } catch {
      error('Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [profileUserId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const res = await apiRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: editName.trim(),
          bio: editBio.trim(),
          location: editLocation.trim(),
          languages: editLanguages.trim(),
          experience: editExperience.trim(),
          skillsLearningInterest: editInterests.trim(),
          privacyAreaVisible: editPrivacyArea,
        }),
      });

      if (res.success && res.user) {
        success('Profile updated successfully!');
        updateUser(res.user);
        setIsEditing(false);
        fetchProfile();
      } else {
        error(res.message || 'Failed to update profile.');
      }
    } catch {
      error('An error occurred while saving your profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      error('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      error('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);

    try {
      const res = await apiRequest('/users/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      });

      if (res.success) {
        success('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        error(res.message || 'Failed to change password.');
      }
    } catch {
      error('An error occurred while updating password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRequestVerification = async () => {
    try {
      const res = await apiRequest('/users/request-verification', {
        method: 'POST',
      });

      if (res.success) {
        success('Profile verified! Trust badge activated.');
        updateUser({ verificationStatus: true });
        fetchProfile();
      }
    } catch {
      error('Failed to request verification.');
    }
  };

  const handleToggleBlock = async () => {
    if (!profile) return;

    try {
      const endpoint = profile.hasBlocked ? '/users/unblock' : '/users/block';
      const body = profile.hasBlocked
        ? { userIdToUnblock: profile.id }
        : { userIdToBlock: profile.id };

      const res = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (res.success) {
        success(res.message);
        fetchProfile();
      } else {
        error(res.message);
      }
    } catch {
      error('Failed to update block state.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-sm relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt={profile.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-brand-500 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-brand-600 text-white font-black text-3xl flex items-center justify-center">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  {profile.name}
                </h1>
                {profile.verificationStatus && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Verified
                  </span>
                )}
              </div>

              {profile.location && (
                <p className="text-xs sm:text-sm text-stone-500 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {profile.location}
                </p>
              )}

              <p className="text-xs text-stone-400">
                Community member since {new Date(profile.createdDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
            {isOwnProfile ? (
              <>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  {isEditing ? 'Close Edit' : 'Edit Profile'}
                </button>
                {!profile.verificationStatus && (
                  <button
                    onClick={handleRequestVerification}
                    className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold transition"
                  >
                    Request Verification
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleToggleBlock}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    profile.hasBlocked
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-rose-50 hover:text-rose-700'
                  }`}
                >
                  <UserX className="w-3.5 h-3.5" />
                  {profile.hasBlocked ? 'Unblock Member' : 'Block Member'}
                </button>

                <button
                  onClick={() => setIsReportOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Report
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-stone-100 text-center">
          <div className="p-3 bg-stone-50 rounded-2xl">
            <p className="text-xl font-black text-stone-900">{profile.stats?.skillsShared || 0}</p>
            <p className="text-xs text-stone-500 font-semibold mt-0.5">Skills Shared</p>
          </div>
          <div className="p-3 bg-stone-50 rounded-2xl">
            <p className="text-xl font-black text-stone-900">{profile.stats?.learnersHelped || 0}</p>
            <p className="text-xs text-stone-500 font-semibold mt-0.5">Learners Helped</p>
          </div>
          <div className="p-3 bg-stone-50 rounded-2xl">
            <p className="text-xl font-black text-stone-900">{profile.stats?.skillsLearned || 0}</p>
            <p className="text-xs text-stone-500 font-semibold mt-0.5">Skills Learned</p>
          </div>
          <div className="p-3 bg-stone-50 rounded-2xl">
            <p className="text-xl font-black text-amber-600 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500 inline" />
              {profile.stats?.averageRating?.toFixed(1) || '5.0'}
            </p>
            <p className="text-xs text-stone-500 font-semibold mt-0.5">
              Rating ({profile.stats?.reviewCount || 0} reviews)
            </p>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE FORM MODAL / COLLAPSE */}
      {isOwnProfile && isEditing && (
        <div className="bg-white rounded-3xl border border-brand-200 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="text-lg font-bold text-stone-900">Update Profile Details</h3>
            <span className="text-xs text-stone-400">Settings & Privacy</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  General Safe Area / Locality
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maplewood, Downtown"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Bio & Introduction
              </label>
              <textarea
                rows={3}
                placeholder="A friendly sentence or two about yourself..."
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Languages Spoken
                </label>
                <input
                  type="text"
                  placeholder="e.g. English, Spanish"
                  value={editLanguages}
                  onChange={(e) => setEditLanguages(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Skills I Want to Learn (For Matching)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Photography, Cooking, Guitar"
                  value={editInterests}
                  onChange={(e) => setEditInterests(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Experience & Craft Background
              </label>
              <input
                type="text"
                placeholder="e.g. 10 years home gardening, self-taught tailor"
                value={editExperience}
                onChange={(e) => setEditExperience(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Privacy Setting Toggle */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editPrivacyArea}
                  onChange={(e) => setEditPrivacyArea(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-stone-300"
                />
                <div>
                  <p className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    {editPrivacyArea ? <Eye className="w-3.5 h-3.5 text-brand-600" /> : <EyeOff className="w-3.5 h-3.5 text-stone-400" />}
                    Display my general neighborhood/area to other community members
                  </p>
                  <p className="text-[11px] text-stone-500">
                    When disabled, your locality is hidden for maximum privacy.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {isSavingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Details, Badges, Shared Skills, Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Bio & Badges */}
        <div className="space-y-6">
          {/* About */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">About</h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {profile.bio || 'Community learner and skill sharer.'}
            </p>

            <div className="space-y-3 pt-3 border-t border-stone-100 text-xs">
              <div>
                <span className="font-bold text-stone-500 block">Languages</span>
                <span className="text-stone-800 font-medium">{profile.languages || 'English'}</span>
              </div>

              {profile.experience && (
                <div>
                  <span className="font-bold text-stone-500 block">Experience</span>
                  <span className="text-stone-800 font-medium">{profile.experience}</span>
                </div>
              )}

              {profile.skillsLearningInterest && (
                <div>
                  <span className="font-bold text-stone-500 block">Wants to Learn</span>
                  <span className="text-brand-700 font-bold">{profile.skillsLearningInterest}</span>
                </div>
              )}
            </div>
          </div>

          {/* Achievement Badges (Real-activity based!) */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              Community Trust Badges
            </h3>

            <div className="space-y-3">
              {profile.badges?.map((badge: any) => (
                <div
                  key={badge.id}
                  className={`p-3 rounded-2xl border flex items-center gap-3 transition ${
                    badge.earned
                      ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                      : 'bg-stone-50/60 border-stone-200/60 text-stone-400 opacity-60'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      badge.earned ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-stone-900">{badge.name}</h4>
                      {badge.earned ? (
                        <span className="text-[10px] font-black text-amber-700">✓ Earned</span>
                      ) : (
                        <span className="text-[10px] text-stone-400">Locked</span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Change Password (Own Profile only) */}
          {isOwnProfile && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-stone-500" />
                Change Password
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-3">
                <input
                  type="password"
                  required
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <input
                  type="password"
                  required
                  placeholder="New Password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <input
                  type="password"
                  required
                  placeholder="Confirm New Password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column (2 Cols): Skills Shared & Genuine Reviews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills Shared by this user */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-600" />
              Skills Shared by {profile.name} ({profile.skills?.length || 0})
            </h3>

            {profile.skills && profile.skills.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.skills.map((s: any) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl border border-stone-200 hover:border-brand-500 transition space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-800">
                        {s.category}
                      </span>
                      <Link to={`/skills/${s.id}`} className="block mt-1">
                        <h4 className="text-sm font-bold text-stone-900 hover:text-brand-600 transition line-clamp-1">
                          {s.skillName}
                        </h4>
                      </Link>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                        {s.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <span>{s.learningMode}</span>
                      <Link to={`/skills/${s.id}`} className="font-bold text-brand-600">
                        View Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 py-3">No skills listed yet.</p>
            )}
          </div>

          {/* Genuine Reviews Received */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Community Reviews Received ({profile.reviews?.length || 0})
            </h3>

            {profile.reviews && profile.reviews.length > 0 ? (
              <div className="space-y-4 divide-y divide-stone-100">
                {profile.reviews.map((rev: any) => (
                  <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {rev.reviewer?.profilePhoto ? (
                          <img
                            src={rev.reviewer.profilePhoto}
                            alt={rev.reviewer.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
                            {rev.reviewer?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-bold text-stone-900">
                            {rev.reviewer?.name}
                          </span>
                          <span className="text-[10px] text-stone-400 block">
                            for {rev.skillName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((st) => (
                          <Star
                            key={st}
                            className={`w-3.5 h-3.5 ${
                              rev.rating >= st ? 'text-amber-400 fill-amber-400' : 'text-stone-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                      “{rev.reviewText}”
                    </p>

                    <div className="text-[10px] text-stone-400">
                      {new Date(rev.createdDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-400 py-3">No reviews received yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {!isOwnProfile && profile && (
        <ReportModal
          reportedUserId={profile.id}
          reportedName={profile.name}
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
        />
      )}
    </div>
  );
};
