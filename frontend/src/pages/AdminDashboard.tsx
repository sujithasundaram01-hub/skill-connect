import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { apiRequest } from '../api/client.js';
import { PlatformReport } from '../types/index.js';
import {
  ShieldCheck,
  Users,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Flag,
  UserX,
  UserCheck,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<PlatformReport[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'users'>('reports');
  const [reportFilter, setReportFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, reportsRes, usersRes] = await Promise.all([
        apiRequest('/admin/stats'),
        apiRequest(`/admin/reports?status=${reportFilter}`),
        apiRequest('/admin/users'),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (reportsRes.success) setReports(reportsRes.reports || []);
      if (usersRes.success) setUsersList(usersRes.users || []);
    } catch {
      error('Failed to load admin data.');
    } finally {
      setIsLoading(false);
    }
  }, [reportFilter, error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateReport = async (reportId: string, status: string) => {
    try {
      const res = await apiRequest(`/admin/reports/${reportId}`, {
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
      error('Failed to update report.');
    }
  };

  const handleToggleSuspend = async (userId: string, currentSuspended: boolean) => {
    try {
      const res = await apiRequest(`/admin/users/${userId}/suspend`, {
        method: 'PATCH',
        body: JSON.stringify({ suspend: !currentSuspended }),
      });

      if (res.success) {
        success(res.message);
        loadData();
      } else {
        error(res.message);
      }
    } catch {
      error('Failed to update user suspension status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            Platform Moderation & Security
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Logged in as Admin <strong>{user?.name}</strong>. Monitor platform activity, resolve member reports, and maintain community safety.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* Stats Cards Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
            <p className="text-xs font-bold text-stone-400 uppercase">Total Members</p>
            <p className="text-2xl font-black text-stone-900 mt-1">{stats.totalUsers}</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
            <p className="text-xs font-bold text-stone-400 uppercase">Shared Skills</p>
            <p className="text-2xl font-black text-brand-600 mt-1">{stats.totalSkills}</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
            <p className="text-xs font-bold text-stone-400 uppercase">Requests Sent</p>
            <p className="text-2xl font-black text-stone-900 mt-1">{stats.totalRequests}</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
            <p className="text-xs font-bold text-stone-400 uppercase">Connections</p>
            <p className="text-2xl font-black text-stone-900 mt-1">{stats.totalConnections}</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
            <p className="text-xs font-bold text-stone-400 uppercase">Completed Lessons</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{stats.totalCompletedLessons}</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
            <p className="text-xs font-bold text-stone-400 uppercase">Pending Reports</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{stats.pendingReportsCount}</p>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200">
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-bold transition ${
            activeTab === 'reports'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Flag className="w-4 h-4" />
          Safety Reports ({reports.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-bold transition ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <Users className="w-4 h-4" />
          User Moderation ({usersList.length})
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div>
          {/* TAB 1: REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              {/* Filter pills for reports */}
              <div className="flex items-center gap-2">
                {['All', 'Pending', 'Reviewed', 'ActionTaken', 'Dismissed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setReportFilter(st)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                      reportFilter === st
                        ? 'bg-purple-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.map((rep) => (
                    <div
                      key={rep.id}
                      className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              rep.status === 'Pending'
                                ? 'bg-rose-100 text-rose-800'
                                : rep.status === 'ActionTaken'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {rep.status}
                          </span>
                          <span className="text-xs font-bold text-stone-900">
                            Reason: {rep.reason}
                          </span>
                        </div>
                        <span className="text-xs text-stone-400">
                          {new Date(rep.createdDate).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-xs text-stone-600 space-y-1">
                        <p>
                          <strong>Reporter:</strong> {rep.reporter.name} ({rep.reporter.email})
                        </p>
                        {rep.reportedUser && (
                          <p>
                            <strong>Reported User:</strong> {rep.reportedUser.name} ({rep.reportedUser.email}){' '}
                            {rep.reportedUser.isSuspended && (
                              <span className="text-rose-600 font-bold">[SUSPENDED]</span>
                            )}
                          </p>
                        )}
                        {rep.reportedSkill && (
                          <p>
                            <strong>Reported Skill:</strong> {rep.reportedSkill.skillName} (
                            {rep.reportedSkill.category})
                          </p>
                        )}
                        <p className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 italic mt-2">
                          “{rep.description}”
                        </p>
                      </div>

                      {/* Admin Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-stone-100 justify-end">
                        <button
                          onClick={() => handleUpdateReport(rep.id, 'Reviewed')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                        >
                          Mark Reviewed
                        </button>
                        <button
                          onClick={() => handleUpdateReport(rep.id, 'ActionTaken')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-800 hover:bg-purple-100 transition"
                        >
                          Action Taken
                        </button>
                        <button
                          onClick={() => handleUpdateReport(rep.id, 'Dismissed')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-100 text-stone-500 hover:bg-stone-200 transition"
                        >
                          Dismiss
                        </button>
                        {rep.reportedUser && (
                          <button
                            onClick={() =>
                              handleToggleSuspend(
                                rep.reportedUser!.id,
                                rep.reportedUser!.isSuspended
                              )
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              rep.reportedUser.isSuspended
                                ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                            }`}
                          >
                            {rep.reportedUser.isSuspended
                              ? 'Reactivate Account'
                              : 'Suspend Account'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-xs text-stone-400">
                  No reports in this category. The community is clean!
                </div>
              )}
            </div>
          )}

          {/* TAB 2: USER MODERATION */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-400 uppercase font-bold">
                    <tr>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Verification</th>
                      <th className="p-3.5">Skills</th>
                      <th className="p-3.5">Reports</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-stone-50">
                        <td className="p-3.5 font-bold text-stone-900">
                          {u.name}
                          <span className="block font-normal text-stone-400">{u.email}</span>
                        </td>
                        <td className="p-3.5 font-semibold">{u.role}</td>
                        <td className="p-3.5">
                          {u.verificationStatus ? (
                            <span className="text-emerald-700 font-bold">Verified</span>
                          ) : (
                            <span className="text-stone-400">Unverified</span>
                          )}
                        </td>
                        <td className="p-3.5 font-bold">{u._count?.skills || 0}</td>
                        <td className="p-3.5 font-bold text-rose-600">
                          {u._count?.reportsReceived || 0}
                        </td>
                        <td className="p-3.5">
                          {u.isSuspended ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                              Suspended
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          {u.role !== 'ADMIN' && (
                            <button
                              onClick={() => handleToggleSuspend(u.id, u.isSuspended)}
                              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                                u.isSuspended
                                  ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                              }`}
                            >
                              {u.isSuspended ? 'Reactivate' : 'Suspend'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
