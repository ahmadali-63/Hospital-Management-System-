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
        return 'bg-amber-100 text-amber-900 border border-amber-300 font-bold';
      case 'ADMIN':
        return 'bg-cyan-100 text-cyan-800 border border-cyan-300 font-semibold';
      case 'DOCTOR':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold';
      case 'STAFF':
        return 'bg-purple-100 text-purple-800 border border-purple-300 font-semibold';
      case 'PATIENT':
        return 'bg-blue-100 text-blue-800 border border-blue-200 font-semibold';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 mb-2">
            <ShieldCheck size={14} /> Super Admin Control
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Member Directory</h1>
          <p className="mt-1 text-sm text-gray-500">
            View, audit, and manage all registered members across all roles.
          </p>
        </div>

        <button
          onClick={loadUsers}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Members
        </button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* KPI Cards across Roles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div
          onClick={() => setSelectedRole('ALL')}
          className={`cursor-pointer rounded-xl border p-4 transition ${
            selectedRole === 'ALL'
              ? 'border-cyan-500 bg-cyan-50/50 shadow-sm'
              : 'border-gray-100 bg-white hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase">
            <span>Total</span>
            <Users size={16} className="text-gray-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{counts.total}</p>
          <p className="text-[11px] text-gray-400">All registered</p>
        </div>

        <div
          onClick={() => setSelectedRole('SUPER_ADMIN')}
          className={`cursor-pointer rounded-xl border p-4 transition ${
            selectedRole === 'SUPER_ADMIN'
              ? 'border-amber-500 bg-amber-50/50 shadow-sm'
              : 'border-gray-100 bg-white hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-700 uppercase">
            <span>Super Admin</span>
            <ShieldCheck size={16} className="text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-900">{counts.SUPER_ADMIN || 1}</p>
          <p className="text-[11px] text-amber-600/70">Root authority</p>
        </div>

        <div
          onClick={() => setSelectedRole('ADMIN')}
          className={`cursor-pointer rounded-xl border p-4 transition ${
            selectedRole === 'ADMIN'
              ? 'border-cyan-500 bg-cyan-50/50 shadow-sm'
              : 'border-gray-100 bg-white hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-cyan-700 uppercase">
            <span>Admins</span>
            <Users size={16} className="text-cyan-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-cyan-900">{counts.ADMIN}</p>
          <p className="text-[11px] text-cyan-600/70">Hospital admins</p>
        </div>

        <div
          onClick={() => setSelectedRole('DOCTOR')}
          className={`cursor-pointer rounded-xl border p-4 transition ${
            selectedRole === 'DOCTOR'
              ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
              : 'border-gray-100 bg-white hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 uppercase">
            <span>Doctors</span>
            <Stethoscope size={16} className="text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-900">{counts.DOCTOR}</p>
          <p className="text-[11px] text-emerald-600/70">Clinical physicians</p>
        </div>

        <div
          onClick={() => setSelectedRole('STAFF')}
          className={`cursor-pointer rounded-xl border p-4 transition ${
            selectedRole === 'STAFF'
              ? 'border-purple-500 bg-purple-50/50 shadow-sm'
              : 'border-gray-100 bg-white hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-purple-700 uppercase">
            <span>Staff</span>
            <Briefcase size={16} className="text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-purple-900">{counts.STAFF}</p>
          <p className="text-[11px] text-purple-600/70">Operations & nursing</p>
        </div>

        <div
          onClick={() => setSelectedRole('PATIENT')}
          className={`cursor-pointer rounded-xl border p-4 transition ${
            selectedRole === 'PATIENT'
              ? 'border-blue-500 bg-blue-50/50 shadow-sm'
              : 'border-gray-100 bg-white hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-blue-700 uppercase">
            <span>Patients</span>
            <UserCheck size={16} className="text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-900">{counts.PATIENT}</p>
          <p className="text-[11px] text-blue-600/70">Registered patients</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, department, or phone..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-700">
              <Filter size={14} className="text-gray-400" />
              <span>Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="bg-transparent font-semibold text-gray-900 outline-none cursor-pointer"
              >
                <option value="ALL">All Roles ({counts.total})</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="DOCTOR">Doctor</option>
                <option value="STAFF">Staff</option>
                <option value="PATIENT">Patient</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-xs font-medium text-gray-700">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
                className="bg-transparent font-semibold text-gray-900 outline-none cursor-pointer"
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
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
            <span>Showing {filteredUsers.length} of {users.length} members</span>
            <button
              onClick={() => {
                setSelectedRole('ALL');
                setStatusFilter('ALL');
                setSearch('');
              }}
              className="text-cyan-600 hover:text-cyan-800 font-semibold"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Members Directory Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5">Member</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Details & Dept</th>
                <th className="px-6 py-3.5">Phone</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Joined</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">
                    Loading member records...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
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
                    <tr key={member._id} className="hover:bg-gray-50/80 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-900 text-cyan-300 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{member.name}</p>
                            <p className="text-xs text-gray-400">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs ${getRoleBadge(member.role)}`}>
                          {member.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-700">
                        {member.specialization && <div>Spec: {member.specialization}</div>}
                        {member.department && <div>Dept: {member.department}</div>}
                        {member.designation && <div>Title: {member.designation}</div>}
                        {!member.specialization && !member.department && !member.designation && (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {member.phone || <span className="text-gray-400">N/A</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            member.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              member.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {member.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isSuperAdmin ? (
                          <span className="text-xs font-semibold text-gray-400 italic">Protected</span>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(member)}
                            disabled={togglingId === member._id}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                              member.isActive
                                ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
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
