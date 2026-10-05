import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Skill, LearningRequest, Connection } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { apiRequest } from '../api/client.js';
import { ReviewModal } from '../components/reviews/ReviewModal.js';
import {
  BookOpen,
  PlusCircle,
  GraduationCap,
  Bookmark,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Edit3,
  Trash2,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';

export const MySkills: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'shared' | 'learning' | 'requests' | 'saved'>('shared');

  const [mySharedSkills, setMySharedSkills] = useState<Skill[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [sentRequests, setSentRequests] = useState<LearningRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<LearningRequest[]>([]);
  const [savedSkills, setSavedSkills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review modal state
  const [reviewModalData, setReviewModalData] = useState<{
    connectionId: string;
    partnerName: string;
    skillName: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [skillsRes, connsRes, sentRes, recvRes, savedRes] = await Promise.all([
        apiRequest(`/skills?ownerId=${user?.id}`),
        apiRequest('/connections'),
        apiRequest('/requests/sent'),
        apiRequest('/requests/received'),
        apiRequest('/skills/saved'),
      ]);

      if (skillsRes.success) setMySharedSkills(skillsRes.skills || []);
      if (connsRes.success) setConnections(connsRes.connections || []);
      if (sentRes.success) setSentRequests(sentRes.requests || []);
      if (recvRes.success) setReceivedRequests(recvRes.requests || []);
      if (savedRes.success) setSavedSkills(savedRes.savedSkills || []);
    } catch (err) {
      console.error('Failed to load my skills dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Request actions: Accept / Decline / Cancel
  const handleRequestStatus = async (requestId: string, status: 'Accepted' | 'Declined' | 'Cancelled') => {
    try {
      const res = await apiRequest(`/requests/${requestId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      if (res.success) {
        success(res.message);
        loadData();
      } else {
        error(res.message || 'Failed to update request.');
      }
    } catch {
      error('Failed to update request.');
    }
  };

  // Connection status update: Started -> Learning -> Completed
  const handleConnectionStatus = async (connId: string, status: 'Started' | 'Learning' | 'Completed') => {
    try {
      const res = await apiRequest(`/connections/${connId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      if (res.success) {
        success(res.message);
        loadData();
      } else {
        error(res.message);
      }
    } catch {
      error('Failed to update learning status.');
    }
  };

  // Delete own skill
  const handleDeleteSkill = async (skillId: string) => {
    if (!window.confirm('Are you sure you want to delete this shared skill?')) return;

    try {
      const res = await apiRequest(`/skills/${skillId}`, {
        method: 'DELETE',
      });

      if (res.success) {
        success('Skill deleted.');
        setMySharedSkills((prev) => prev.filter((s) => s.id !== skillId));
      } else {
        error(res.message || 'Failed to delete.');
      }
    } catch {
      error('Failed to delete skill.');
    }
  };

  const pendingReceivedCount = receivedRequests.filter((r) => r.status === 'Pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            My Learning Dashboard
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Manage your shared skills, active sessions, and community learning exchanges.
          </p>
        </div>

        <Link
          to="/share"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition active:scale-95 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Share Another Skill
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('shared')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'shared'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Skills I Share ({mySharedSkills.length})
        </button>

        <button
          onClick={() => setActiveTab('learning')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'learning'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Active & Completed Learning ({connections.length})
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'requests'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          Learning Requests
          {pendingReceivedCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
              {pendingReceivedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-bold whitespace-nowrap transition ${
            activeTab === 'saved'
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Saved Skills ({savedSkills.length})
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div>
          {/* TAB 1: SKILLS I SHARE */}
          {activeTab === 'shared' && (
            <div className="space-y-6">
              {mySharedSkills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mySharedSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-800 border border-brand-200">
                            {skill.category}
                          </span>
                          <span className="text-xs text-stone-400 font-medium">
                            {skill.learningMode}
                          </span>
                        </div>

                        <Link to={`/skills/${skill.id}`} className="block">
                          <h3 className="text-lg font-bold text-stone-900 hover:text-brand-600 transition line-clamp-1">
                            {skill.skillName}
                          </h3>
                        </Link>

                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {skill.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-stone-500 pt-2 border-t border-stone-100">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <strong className="text-stone-800">{skill.rating.toFixed(1)}</strong>
                            <span>({skill.reviewCount})</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-stone-400" />
                            <span>{skill.learnersHelped} helped</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                        <Link
                          to={`/skills/${skill.id}`}
                          className="text-xs font-bold text-stone-700 hover:text-stone-900"
                        >
                          View Live
                        </Link>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/skills/${skill.id}/edit`}
                            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                            title="Edit skill"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteSkill(skill.id)}
                            className="p-2 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete skill"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4 bg-white rounded-2xl border border-stone-200 max-w-md mx-auto space-y-4">
                  <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900">
                    You haven’t shared any skills yet
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Share a practical craft or hobby you love—from cooking and guitar to tailoring or gardening.
                  </p>
                  <Link
                    to="/share"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Share Your First Skill
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ACTIVE & COMPLETED LEARNING CONNECTIONS */}
          {activeTab === 'learning' && (
            <div className="space-y-6">
              {connections.length > 0 ? (
                <div className="space-y-4">
                  {connections.map((conn) => (
                    <div
                      key={conn.id}
                      className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              conn.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : conn.status === 'Learning'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            Status: {conn.status}
                          </span>
                          <span className="text-xs text-stone-400">
                            {conn.isTeacher ? 'You are Teaching' : 'You are Learning'}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-stone-900">
                          {conn.skill.skillName}
                        </h3>

                        <div className="flex items-center gap-2 text-xs text-stone-600">
                          <span>Partner: </span>
                          <Link
                            to={`/profile/${conn.partner.id}`}
                            className="font-bold text-stone-900 hover:text-brand-600 transition flex items-center gap-1"
                          >
                            {conn.partner.name}
                            {conn.partner.verificationStatus && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                            )}
                          </Link>
                          {conn.partner.location && <span>• {conn.partner.location}</span>}
                        </div>
                      </div>

                      {/* Connection Actions & Status Progression */}
                      <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
                        <Link
                          to={`/messages?connection=${conn.id}`}
                          className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Chat & Coordinate
                        </Link>

                        {/* Progress Stepper */}
                        {conn.status === 'Started' && (
                          <button
                            onClick={() => handleConnectionStatus(conn.id, 'Learning')}
                            className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 font-semibold text-xs transition"
                          >
                            Mark “In Progress”
                          </button>
                        )}

                        {conn.status === 'Learning' && (
                          <button
                            onClick={() => handleConnectionStatus(conn.id, 'Completed')}
                            className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold text-xs transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark “Completed”
                          </button>
                        )}

                        {conn.status === 'Completed' && (
                          <>
                            {conn.hasReviewed ? (
                              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Reviewed ({conn.myReviewRating}★)
                              </span>
                            ) : (
                              <button
                                onClick={() =>
                                  setReviewModalData({
                                    connectionId: conn.id,
                                    partnerName: conn.partner.name,
                                    skillName: conn.skill.skillName,
                                  })
                                }
                                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1"
                              >
                                <Star className="w-3.5 h-3.5" />
                                Leave Review
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4 bg-white rounded-2xl border border-stone-200 max-w-md mx-auto space-y-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900">No active learning connections</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Explore community skills and send a learning request or skill swap proposal to get started!
                  </p>
                  <Link
                    to="/explore"
                    className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-stone-900 rounded-xl hover:bg-stone-800 transition"
                  >
                    Find Skills to Learn
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LEARNING REQUESTS (RECEIVED & SENT) */}
          {activeTab === 'requests' && (
            <div className="space-y-8">
              {/* Received Requests */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    Requests Received for Skills You Teach ({receivedRequests.length})
                  </h3>
                </div>

                {receivedRequests.length > 0 ? (
                  <div className="space-y-3">
                    {receivedRequests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                req.status === 'Accepted'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : req.status === 'Declined'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {req.status}
                            </span>
                            {req.isSwapRequest && (
                              <span className="text-xs font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-purple-600" />
                                Skill Swap Proposed: {req.swapSkillOffered}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-stone-700">
                            <strong>{req.requester?.name}</strong> wants to learn{' '}
                            <strong>“{req.skill.skillName}”</strong>
                          </p>

                          <div className="text-xs text-stone-500 space-y-0.5">
                            <p>
                              Preferred time: <strong>{req.preferredTime}</strong> ({req.learningMode})
                            </p>
                            {req.message && (
                              <p className="italic text-stone-600">“{req.message}”</p>
                            )}
                          </div>
                        </div>

                        {req.status === 'Pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRequestStatus(req.id, 'Accepted')}
                              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Accept Request
                            </button>
                            <button
                              onClick={() => handleRequestStatus(req.id, 'Declined')}
                              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 font-semibold text-xs transition"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {req.status === 'Accepted' && req.connection && (
                          <Link
                            to={`/messages?connection=${req.connection.id}`}
                            className="px-4 py-2 rounded-xl bg-brand-50 text-brand-800 border border-brand-200 hover:bg-brand-100 font-bold text-xs transition flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Open Messages
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 py-3">
                    No learning requests received from other members yet.
                  </p>
                )}
              </div>

              {/* Sent Requests */}
              <div className="space-y-4 pt-6 border-t border-stone-200">
                <h3 className="text-base font-bold text-stone-900">
                  Requests You Sent to Others ({sentRequests.length})
                </h3>

                {sentRequests.length > 0 ? (
                  <div className="space-y-3">
                    {sentRequests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                req.status === 'Accepted'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : req.status === 'Declined'
                                  ? 'bg-rose-100 text-rose-800'
                                  : req.status === 'Cancelled'
                                  ? 'bg-stone-100 text-stone-600'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {req.status}
                            </span>
                            {req.isSwapRequest && (
                              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                                Swap: You teach {req.swapSkillOffered}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-stone-800 font-medium">
                            Skill: <strong>{req.skill.skillName}</strong> (Teacher:{' '}
                            {req.skillOwner?.name})
                          </p>

                          <p className="text-xs text-stone-500">
                            Your proposed time: {req.preferredTime}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {req.status === 'Pending' && (
                            <button
                              onClick={() => handleRequestStatus(req.id, 'Cancelled')}
                              className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-800 text-xs font-semibold hover:bg-stone-50 transition"
                            >
                              Cancel Request
                            </button>
                          )}
                          {req.status === 'Accepted' && req.connection && (
                            <Link
                              to={`/messages?connection=${req.connection.id}`}
                              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition"
                            >
                              Go to Chat
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 py-3">
                    You haven’t sent any learning requests yet.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SAVED SKILLS */}
          {activeTab === 'saved' && (
            <div className="space-y-6">
              {savedSkills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedSkills.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800">
                            {item.category}
                          </span>
                          <span className="text-xs text-stone-400">{item.learningMode}</span>
                        </div>

                        <Link to={`/skills/${item.id}`} className="block">
                          <h3 className="text-base font-bold text-stone-900 hover:text-brand-600 line-clamp-2">
                            {item.skillName}
                          </h3>
                        </Link>

                        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                          <span>Teacher: {item.owner?.name}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <strong>{item.rating?.toFixed(1)}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                        <Link
                          to={`/skills/${item.id}`}
                          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                        >
                          View Details
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-4 bg-white rounded-2xl border border-stone-200 max-w-md mx-auto space-y-4">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900">No saved skills yet</h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Bookmark interesting skills as you browse Explore so you can return to them later.
                  </p>
                  <Link
                    to="/explore"
                    className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition"
                  >
                    Browse Skills
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalData && (
        <ReviewModal
          connectionId={reviewModalData.connectionId}
          partnerName={reviewModalData.partnerName}
          skillName={reviewModalData.skillName}
          isOpen={!!reviewModalData}
          onClose={() => setReviewModalData(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};
