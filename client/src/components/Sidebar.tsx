'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Users,
  Activity,
  Calendar,
  FileText,
  LogOut,
  Bed,
  Siren,
  ClipboardList,
  Stethoscope,
  HeartPulse,
  ShieldCheck,
} from 'lucide-react';

interface UserInfo {
  name: string;
  email: string;
  role: string;
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as UserInfo;
      const timeoutId = window.setTimeout(() => setUser(parsed), 0);
      return () => window.clearTimeout(timeoutId);
    } catch {
      return;
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.replace('/auth/login');
  }

  const role = user?.role || '';

  // Dynamic Navigation based on Role
  let navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Activity },
    { label: 'Patients', href: '/dashboard/patients', icon: Users },
    { label: 'Doctors', href: '/dashboard/doctors', icon: Stethoscope },
    { label: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
    { label: 'Clinical Workflows', href: '/dashboard/clinical', icon: ClipboardList },
    { label: 'Bed Management', href: '/dashboard/beds', icon: Bed },
    { label: 'Emergency Ward', href: '/dashboard/emergency', icon: Siren },
    { label: 'Billing', href: '/dashboard/billing', icon: FileText },
  ];

  if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
    navItems = [
      { label: 'Dashboard', href: '/dashboard', icon: Activity },
      { label: 'All Members', href: '/dashboard/users', icon: ShieldCheck },
      { label: 'Patients', href: '/dashboard/patients', icon: Users },
      { label: 'Doctors', href: '/dashboard/doctors', icon: Stethoscope },
      { label: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
      { label: 'Clinical Workflows', href: '/dashboard/clinical', icon: ClipboardList },
      { label: 'Bed Management', href: '/dashboard/beds', icon: Bed },
      { label: 'Emergency Ward', href: '/dashboard/emergency', icon: Siren },
      { label: 'Billing', href: '/dashboard/billing', icon: FileText },
    ];
  } else if (role === 'DOCTOR') {
    navItems = [
      { label: 'Doctor Portal', href: '/dashboard/doctor', icon: Activity },
      { label: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
      { label: 'Patients Directory', href: '/dashboard/patients', icon: Users },
      { label: 'Clinical Workflows', href: '/dashboard/clinical', icon: ClipboardList },
      { label: 'Emergency Ward', href: '/dashboard/emergency', icon: Siren },
    ];
  } else if (role === 'PATIENT') {
    navItems = [
      { label: 'Patient Portal', href: '/dashboard/patient', icon: Activity },
      { label: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
      { label: 'Medical Records', href: '/dashboard/clinical', icon: ClipboardList },
      { label: 'Billing & Invoices', href: '/dashboard/billing', icon: FileText },
    ];
  } else if (role === 'STAFF') {
    navItems = [
      { label: 'Dashboard', href: '/dashboard', icon: Activity },
      { label: 'Patients', href: '/dashboard/patients', icon: Users },
      { label: 'Doctors', href: '/dashboard/doctors', icon: Stethoscope },
      { label: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
      { label: 'Bed Management', href: '/dashboard/beds', icon: Bed },
      { label: 'Emergency Ward', href: '/dashboard/emergency', icon: Siren },
      { label: 'Billing', href: '/dashboard/billing', icon: FileText },
    ];
  }

  const homeHref =
    role === 'PATIENT' ? '/dashboard/patient' : role === 'DOCTOR' ? '/dashboard/doctor' : '/dashboard';

  const roleBadgeColor =
    role === 'SUPER_ADMIN'
      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
      : role === 'ADMIN'
      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
      : role === 'DOCTOR'
      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
      : role === 'STAFF'
      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30';

  return (
    <div className="flex flex-col w-64 h-screen bg-slate-950/80 backdrop-blur-2xl border-r border-white/10 text-gray-100 flex-shrink-0 z-20 shadow-2xl">
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
        <Link href={homeHref} className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-cyan-400/20 border border-cyan-400/30 text-cyan-300 group-hover:scale-105 transition shadow-[0_0_10px_rgba(34,211,238,0.3)]">
            <HeartPulse className="h-5 w-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <span className="text-sm font-extrabold tracking-wider text-white block leading-tight">NEXUS CARE</span>
            <span className="text-[9px] font-mono tracking-widest text-cyan-300 uppercase block">CARENOVA</span>
          </div>
        </Link>
        {user?.role && (
          <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${roleBadgeColor}`}>
            {user.role.replace('_', ' ')}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
        <nav className="flex-1 px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isExact = pathname === item.href;
            const isSub = item.href !== '/dashboard' && pathname.startsWith(item.href);
            const isActive = isExact || isSub;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/25 to-cyan-500/10 text-cyan-300 font-semibold border border-cyan-400/35 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white hover:border-white/10 border border-transparent'
                }`}
              >
                <Icon
                  className={`mr-3 h-4 w-4 transition-colors ${
                    isActive ? 'text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]' : 'text-slate-400 group-hover:text-cyan-400'
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-shrink-0 p-3 border-t border-white/10 bg-slate-950/40">
        {user && (
          <div className="mb-2 p-2.5 rounded-xl glass-panel-subtle border border-white/10">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-3 py-2 text-xs font-semibold text-rose-300 rounded-xl glass-pill hover:bg-rose-500/20 hover:border-rose-400/40 hover:text-rose-200 transition-all cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  );
}
