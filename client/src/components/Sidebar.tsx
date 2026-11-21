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

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: Activity },
    { label: 'Patients', href: '/dashboard/patients', icon: Users },
    { label: 'Doctors', href: '/dashboard/doctors', icon: Stethoscope },
    { label: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
    { label: 'Clinical Workflows', href: '/dashboard/clinical', icon: ClipboardList },
    { label: 'Bed Management', href: '/dashboard/beds', icon: Bed },
    { label: 'Emergency Ward', href: '/dashboard/emergency', icon: Siren },
    { label: 'Billing', href: '/dashboard/billing', icon: FileText },
  ];

  return (
    <div className="flex flex-col w-64 h-screen bg-slate-900 text-gray-100 flex-shrink-0">
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <HeartPulse className="h-6 w-6 text-cyan-400" />
          <span className="text-lg font-bold tracking-wide text-white">Nexus Care</span>
        </Link>
        {user?.role && (
          <span className="text-xs uppercase px-2 py-0.5 rounded-full font-semibold bg-cyan-500/20 text-cyan-300">
            {user.role}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-shrink-0 p-4 border-t border-slate-800">
        {user && (
          <div className="mb-3 px-2">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-slate-400 rounded-lg hover:bg-slate-800 hover:text-rose-400 transition-colors group"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
