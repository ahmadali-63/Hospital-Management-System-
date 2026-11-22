'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  ShieldCheck,
  Stethoscope,
  Briefcase,
  UserCheck,
  UserX,
  Filter,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { AxiosError } from 'axios';
import api from '@/services/api';

type UserMember = {
  _id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR' | 'STAFF' | 'PATIENT';
  phone?: string;
  department?: string;
  specialization?: string;
  designation?: string;
  isActive: boolean;
  createdAt: string;
};

type RoleCounts = {
  total: number;
  SUPER_ADMIN: number;
  ADMIN: number;
  DOCTOR: number;
  STAFF: number;
  PATIENT: number;
};

export default function UsersDirectoryPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserMember[]>([]);
  const [counts, setCounts] = useState<RoleCounts>({
    total: 0,
    SUPER_ADMIN: 0,
    ADMIN: 0,
    DOCTOR: 0,
    STAFF: 0,
    PATIENT: 0,
  });
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check access on mount
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.replace('/auth/login');
      return;
    }
    try {
      const user = JSON.parse(stored);
      if (user.role === 'PATIENT') {
        router.replace('/dashboard/patient');
        return;
      }
      if (user.role === 'DOCTOR') {
        router.replace('/dashboard/doctor');
        return;
      }
      if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
        router.replace('/dashboard');
        return;
      }
    } catch {
      router.replace('/auth/login');
    }
  }, [router]);

  async function loadUsers() {
    try {
      setIsLoading(true);
      setMessage(null);
      const res = await api.get<{
        data: {
          users: UserMember[];
          counts: RoleCounts;
        };
      }>('/users');

      setUsers(res.data.data.users || []);
      if (res.data.data.counts) {
        setCounts(res.data.data.counts);
      }
    } catch (err) {
      const resp = (err as AxiosError<{ message?: string }>).response;
      setMessage({
        type: 'error',
        text: resp?.data?.message || 'Unable to load member directory. Super Admin access required.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleToggleStatus(user: UserMember) {
    if (user.role === 'SUPER_ADMIN') {
      alert('Super Admin accounts cannot be deactivated.');
      return;
    }

    const action = user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} ${user.name} (${user.email})?`)) {
      return;
    }

    try {
      setTogglingId(user._id);
      setMessage(null);
      const res = await api.patch<{ data: { user: UserMember } }>(`/users/${user._id}/status`, {
        isActive: !user.isActive,
      });

      const updated = res.data.data.user;
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: updated.isActive } : u))
      );
      setMessage({
        type: 'success',
        text: `User ${user.name} has been ${updated.isActive ? 'activated' : 'deactivated'}.`,
      });
    } catch (err) {
      const resp = (err as AxiosError<{ message?: string }>).response;
      setMessage({
        type: 'error',
        text: resp?.data?.message || 'Failed to update user status.',
      });
    } finally {
      setTogglingId(null);
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role match
      if (selectedRole !== 'ALL' && u.role !== selectedRole) {
        return false;
      }
      // Status match
      if (statusFilter === 'ACTIVE' && !u.isActive) return false;
      if (statusFilter === 'INACTIVE' && u.isActive) return false;

      // Search match
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesPhone = u.phone?.toLowerCase().includes(q) || false;
        const matchesDept = u.department?.toLowerCase().includes(q) || false;
        const matchesRole = u.role.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesDept && !matchesRole) {
          return false;
        }
      }

      return true;
    });
  }, [users, selectedRole, statusFilter, search]);

  function getRoleBadge(role: UserMember['role']) {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold';
      case 'ADMIN':
        return 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-semibold';
      case 'DOCTOR':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-semibold';
      case 'STAFF':
        return 'bg-purple-500/20 text-purple-300 border border-purple-400/40 font-semibold';
      case 'PATIENT':
        return 'bg-blue-500/20 text-blue-300 border border-blue-400/40 font-semibold';
      default:
        return 'bg-white/10 text-white border border-white/10';
    }
  }

  return (
    <div className="max-w-7xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-bold text-amber-300 border border-amber-400/40 mb-2 shadow-sm">
            <ShieldCheck size={14} className="text-amber-400" /> Super Admin Control
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Hospital Member Directory</h1>
          <p className="mt-1 text-sm text-slate-400 font-light">
            View, audit, and manage all registered members across all roles.
          </p>
        </div>

        <button
          onClick={loadUsers}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl glass-pill px-4 py-2 text-xs font-semibold text-white hover:text-cyan-300 hover:border-cyan-400/50 transition self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin text-cyan-300' : 'text-cyan-400'} />
          Refresh Members
        </button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium backdrop-blur-md ${
            message.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200'
              : 'bg-rose-500/15 border-rose-400/30 text-rose-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertCircle size={18} className="text-rose-400" />}
          {message.text}
        </div>
      )}

      {/* KPI Cards across Roles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div
          onClick={() => setSelectedRole('ALL')}
          className={`cursor-pointer rounded-2xl p-4 transition glass-card-interactive ${
            selectedRole === 'ALL'
              ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.25)]'
              : ''
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Total</span>
            <Users size={16} className="text-cyan-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-white">{counts.total}</p>
          <p className="text-[11px] text-slate-400">All registered</p>
        </div>

        <div
          onClick={() => setSelectedRole('SUPER_ADMIN')}
          className={`cursor-pointer rounded-2xl p-4 transition glass-card-interactive ${
            selectedRole === 'SUPER_ADMIN'
              ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_20px_rgba(251,191,36,0.25)]'
              : ''
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-300 uppercase tracking-wider">
            <span>Super Admin</span>
            <ShieldCheck size={16} className="text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-300">{counts.SUPER_ADMIN || 1}</p>
          <p className="text-[11px] text-amber-300/70">Root authority</p>
        </div>

        <div
          onClick={() => setSelectedRole('ADMIN')}
          className={`cursor-pointer rounded-2xl p-4 transition glass-card-interactive ${
            selectedRole === 'ADMIN'
              ? 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_20px_rgba(34,211,238,0.25)]'
              : ''
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-cyan-300 uppercase tracking-wider">
            <span>Admins</span>
            <Users size={16} className="text-cyan-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-cyan-300">{counts.ADMIN}</p>
          <p className="text-[11px] text-cyan-300/70">Hospital admins</p>
        </div>

        <div
          onClick={() => setSelectedRole('DOCTOR')}
          className={`cursor-pointer rounded-2xl p-4 transition glass-card-interactive ${
            selectedRole === 'DOCTOR'
              ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.25)]'
              : ''
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-300 uppercase tracking-wider">
            <span>Doctors</span>
            <Stethoscope size={16} className="text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-300">{counts.DOCTOR}</p>
          <p className="text-[11px] text-emerald-300/70">Clinical physicians</p>
        </div>

        <div
          onClick={() => setSelectedRole('STAFF')}
          className={`cursor-pointer rounded-2xl p-4 transition glass-card-interactive ${
            selectedRole === 'STAFF'
              ? 'border-purple-400 bg-purple-500/20 shadow-[0_0_20px_rgba(192,132,252,0.25)]'
              : ''
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-purple-300 uppercase tracking-wider">
            <span>Staff</span>
            <Briefcase size={16} className="text-purple-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-purple-300">{counts.STAFF}</p>
          <p className="text-[11px] text-purple-300/70">Operations & nursing</p>
        </div>

        <div
          onClick={() => setSelectedRole('PATIENT')}
          className={`cursor-pointer rounded-2xl p-4 transition glass-card-interactive ${
            selectedRole === 'PATIENT'
              ? 'border-blue-400 bg-blue-500/20 shadow-[0_0_20px_rgba(96,165,250,0.25)]'
              : ''
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-blue-300 uppercase tracking-wider">
            <span>Patients</span>
            <UserCheck size={16} className="text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-blue-300">{counts.PATIENT}</p>
          <p className="text-[11px] text-blue-300/70">Registered patients</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, department, or phone..."
              className="glass-input w-full rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl glass-panel-subtle px-3 py-2 text-xs font-medium text-slate-300 border border-white/10">
              <Filter size={14} className="text-cyan-400" />
              <span>Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-transparent font-semibold text-white outline-none cursor-pointer [color-scheme:dark] [&>option]:bg-slate-900"
              >
                <option value="ALL">All Roles ({counts.total})</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="DOCTOR">Doctor</option>
                <option value="STAFF">Staff</option>
                <option value="PATIENT">Patient</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl glass-panel-subtle px-3 py-2 text-xs font-medium text-slate-300 border border-white/10">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
                className="bg-transparent font-semibold text-white outline-none cursor-pointer [color-scheme:dark] [&>option]:bg-slate-900"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Deactivated Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Pill */}
        {(selectedRole !== 'ALL' || statusFilter !== 'ALL' || search) && (
          <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-xs text-slate-400">
            <span>Showing {filteredUsers.length} of {users.length} members</span>
            <button
              onClick={() => {
                setSelectedRole('ALL');
                setStatusFilter('ALL');
                setSearch('');
              }}
              className="text-cyan-300 hover:text-cyan-200 font-semibold cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Members Directory Table */}
      <div className="glass-card rounded-2xl shadow-xl overflow-hidden border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/[0.04] text-xs uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Details & Dept</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-400">
                    Loading member records...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                    No members match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((member) => {
                  const initials = member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  const isSuperAdmin = member.role === 'SUPER_ADMIN';

                  return (
                    <tr key={member._id} className="hover:bg-white/[0.04] transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-white">{member.name}</p>
                            <p className="text-xs text-slate-400">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs ${getRoleBadge(member.role)}`}>
                          {member.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-300">
                        {member.specialization && <div>Spec: {member.specialization}</div>}
                        {member.department && <div>Dept: {member.department}</div>}
                        {member.designation && <div>Title: {member.designation}</div>}
                        {!member.specialization && !member.department && !member.designation && (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-300">
                        {member.phone || <span className="text-slate-500">N/A</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            member.isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              member.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                            }`}
                          />
                          {member.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isSuperAdmin ? (
                          <span className="text-xs font-semibold text-amber-400/80 italic">Protected</span>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(member)}
                            disabled={togglingId === member._id}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                              member.isActive
                                ? 'glass-pill text-rose-300 border-rose-400/30 hover:bg-rose-500/20 hover:border-rose-400/50'
                                : 'glass-pill text-emerald-300 border-emerald-400/30 hover:bg-emerald-500/20 hover:border-emerald-400/50'
                            }`}
                          >
                            {member.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                            {togglingId === member._id
                              ? 'Updating...'
                              : member.isActive
                              ? 'Deactivate'
                              : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
